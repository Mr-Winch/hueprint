"""Offline NTC and asynchronous Colornames.org naming for HuePrint.

NTC (Name That Color) data and matching behavior are based on Chirag Mehta's
ntc.js, licensed CC BY 2.5. Colornames.org responses are community-authored;
its downloadable data is CC0 1.0.
"""
from collections import deque
import ctypes
from functools import lru_cache
import json
from pathlib import Path
import re
import sys
import threading
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

NTC_SOURCE = "NTC Library"
COLORNAMES_SOURCE = "Colornames.org"
LOADING = "Looking up…"
NO_CONNECTION = "No connection"
UNNAMED = "Unnamed"


def _windows_json(url, timeout=4):
    """Fetch JSON through WinINet and the Windows system certificate store."""
    if not sys.platform.startswith("win"):
        raise OSError("WinINet is only available on Windows")
    wininet = ctypes.WinDLL("wininet", use_last_error=True)
    handle_type = ctypes.c_void_p
    wininet.InternetOpenW.argtypes = [ctypes.c_wchar_p, ctypes.c_ulong, ctypes.c_wchar_p, ctypes.c_wchar_p, ctypes.c_ulong]
    wininet.InternetOpenW.restype = handle_type
    wininet.InternetOpenUrlW.argtypes = [handle_type, ctypes.c_wchar_p, ctypes.c_wchar_p, ctypes.c_ulong, ctypes.c_ulong, ctypes.c_size_t]
    wininet.InternetOpenUrlW.restype = handle_type
    wininet.InternetReadFile.argtypes = [handle_type, ctypes.c_void_p, ctypes.c_ulong, ctypes.POINTER(ctypes.c_ulong)]
    wininet.InternetReadFile.restype = ctypes.c_bool
    wininet.InternetSetOptionW.argtypes = [handle_type, ctypes.c_ulong, ctypes.c_void_p, ctypes.c_ulong]
    wininet.InternetSetOptionW.restype = ctypes.c_bool
    wininet.InternetCloseHandle.argtypes = [handle_type]
    wininet.InternetCloseHandle.restype = ctypes.c_bool
    session = wininet.InternetOpenW("Mozilla/5.0 (Windows NT 10.0; Win64; x64) HuePrint/1.6", 0, None, None, 0)
    if not session:
        raise ctypes.WinError(ctypes.get_last_error())
    request = None
    try:
        timeout_ms = ctypes.c_ulong(max(1000, int(timeout * 1000)))
        for option in (2, 5, 6):
            wininet.InternetSetOptionW(session, option, ctypes.byref(timeout_ms), ctypes.sizeof(timeout_ms))
        headers = "Accept: application/json\r\n"
        flags = 0x80000000 | 0x04000000 | 0x00800000 | 0x00000200
        request = wininet.InternetOpenUrlW(session, url, headers, len(headers), flags, 0)
        if not request:
            raise ctypes.WinError(ctypes.get_last_error())
        chunks = []
        while True:
            buffer = ctypes.create_string_buffer(8192)
            read = ctypes.c_ulong(0)
            if not wininet.InternetReadFile(request, buffer, len(buffer), ctypes.byref(read)):
                raise ctypes.WinError(ctypes.get_last_error())
            if not read.value:
                break
            chunks.append(buffer.raw[:read.value])
        return json.loads(b"".join(chunks).decode("utf-8"))
    finally:
        if request:
            wininet.InternetCloseHandle(request)
        wininet.InternetCloseHandle(session)


def _normalize_hex(value):
    text = str(value or "").strip().lstrip("#").upper()
    if len(text) == 3:
        text = "".join(character * 2 for character in text)
    if not re.fullmatch(r"[0-9A-F]{6}", text):
        raise ValueError(f"Invalid color: {value}")
    return f"#{text}"


def _rgb_hsl(hex_value):
    channels = tuple(int(hex_value[index:index + 2], 16) for index in (1, 3, 5))
    red, green, blue = (channel / 255 for channel in channels)
    minimum, maximum = min(red, green, blue), max(red, green, blue)
    delta = maximum - minimum
    lightness = (minimum + maximum) / 2
    saturation = 0
    if 0 < lightness < 1:
        saturation = delta / (2 * lightness if lightness < .5 else 2 - 2 * lightness)
    hue = 0
    if delta > 0:
        if maximum == red and maximum != green:
            hue += (green - blue) / delta
        if maximum == green and maximum != blue:
            hue += 2 + (blue - red) / delta
        if maximum == blue and maximum != red:
            hue += 4 + (red - green) / delta
        hue /= 6
    # ntc.js parseInt truncates each HSL component in the 0–255 scale.
    return channels, (int(hue * 255), int(saturation * 255), int(lightness * 255))


class NtcLibrary:
    """Faithful Python lookup over the locally bundled ntc.js name list."""

    def __init__(self, source_path=None):
        source_path = Path(source_path or Path(__file__).with_name("hueprint_ntc.js"))
        source = source_path.read_text(encoding="utf-8")
        matches = re.findall(r'\["([0-9A-Fa-f]{6})",\s*"((?:[^"\\]|\\.)*)"\]', source)
        if not matches:
            raise ValueError("The bundled NTC color list could not be loaded")
        self._entries = []
        self._exact = {}
        for raw_hex, raw_name in matches:
            color = f"#{raw_hex.upper()}"
            name = json.loads(f'"{raw_name}"')
            rgb, hsl = _rgb_hsl(color)
            self._entries.append((color, name, rgb, hsl))
            self._exact[color] = name

    @property
    def count(self):
        return len(self._entries)

    @lru_cache(maxsize=2048)
    def name(self, value):
        color = _normalize_hex(value)
        exact = self._exact.get(color)
        if exact is not None:
            return exact
        rgb, hsl = _rgb_hsl(color)
        best_name = ""
        best_distance = None
        for _candidate_hex, candidate_name, candidate_rgb, candidate_hsl in self._entries:
            rgb_distance = sum((actual - candidate) ** 2 for actual, candidate in zip(rgb, candidate_rgb))
            hsl_distance = sum((actual - candidate) ** 2 for actual, candidate in zip(hsl, candidate_hsl))
            distance = rgb_distance + hsl_distance * 2
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_name = candidate_name
        return best_name


class ColorNameResolver:
    """Resolve NTC locally and Colornames.org off the GTK thread.

    Each request replaces obsolete queued colors, preventing rapid wheel motion
    from building a large network backlog. Results are cached on disk.
    """

    API_URL = "https://colornames.org/search/json/"

    def __init__(self, cache_path=None, ntc=None, opener=None, timeout=4):
        self.ntc = ntc or NtcLibrary()
        self.cache_path = Path(cache_path) if cache_path else None
        self.opener = opener or urlopen
        self.timeout = timeout
        self._org_cache = self._load_cache()
        self._pending = deque()
        self._pending_set = set()
        self._callback = None
        self._condition = threading.Condition()
        self._closed = False
        self._worker = threading.Thread(target=self._work, name="HuePrint color names", daemon=True)
        self._worker.start()

    def _load_cache(self):
        if self.cache_path is None:
            return {}
        try:
            payload = json.loads(self.cache_path.read_text(encoding="utf-8"))
            return {str(key).upper(): str(value) for key, value in payload.items() if isinstance(value, str)}
        except (OSError, ValueError, TypeError):
            return {}

    def _save_cache(self):
        if self.cache_path is None:
            return
        try:
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            persistent = {color: name for color, name in self._org_cache.items() if name not in (NO_CONNECTION, UNNAMED)}
            self.cache_path.write_text(json.dumps(persistent, indent=2, sort_keys=True), encoding="utf-8")
        except OSError:
            pass

    def names(self, value):
        color = _normalize_hex(value)
        return self.ntc.name(color), self._org_cache.get(color, LOADING)

    def request(self, values, callback=None):
        colors = []
        for value in values:
            try:
                color = _normalize_hex(value)
            except ValueError:
                continue
            if color not in colors:
                colors.append(color)
        with self._condition:
            self._callback = callback
            self._pending = deque(color for color in colors if color not in self._org_cache)
            self._pending_set = set(self._pending)
            self._condition.notify()

    def _lookup_colornames(self, color):
        url = f"{self.API_URL}?{urlencode({'hex': color[1:]})}"
        request = Request(url, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HuePrint/1.6"})
        try:
            if sys.platform.startswith("win") and self.opener is urlopen:
                payload = _windows_json(url, self.timeout)
            else:
                response = self.opener(request, timeout=self.timeout)
                with response:
                    payload = json.loads(response.read().decode("utf-8"))
            raw_name = payload.get("name") if isinstance(payload, dict) else None
            name = raw_name.strip() if isinstance(raw_name, str) else ""
            return name or UNNAMED
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, TypeError, json.JSONDecodeError):
            return NO_CONNECTION

    def _work(self):
        while True:
            with self._condition:
                while not self._pending and not self._closed:
                    self._condition.wait()
                if self._closed:
                    return
                color = self._pending.pop()
                self._pending_set.discard(color)
            result = self._lookup_colornames(color)
            with self._condition:
                self._org_cache[color] = result
                callback = self._callback
            self._save_cache()
            if callback is not None:
                callback(color)

    def close(self):
        with self._condition:
            self._closed = True
            self._pending.clear()
            self._pending_set.clear()
            self._condition.notify()


def color_name_markup(color, ntc_name, colornames_name, include_hex=True):
    """Return escaped Pango content for the shared swatch tooltip layout."""
    from html import escape
    lines = []
    if include_hex:
        lines.append(f"<b>{escape(_normalize_hex(color))}</b>")
    lines.append(f"<b>{NTC_SOURCE}:</b> <i>{escape(ntc_name)}</i>")
    lines.append(f"<b>{COLORNAMES_SOURCE}:</b> <i>{escape(colornames_name)}</i>")
    return "\n".join(lines)


def colornames_color_url(value):
    """Return the Colornames.org proposal page for an exact RGB color."""
    return f"https://colornames.org/color/{_normalize_hex(value)[1:].lower()}"
