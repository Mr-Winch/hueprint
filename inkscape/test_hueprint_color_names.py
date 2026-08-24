import json
from pathlib import Path
import threading
import unittest
from urllib.error import URLError

from hueprint_color_names import ColorNameResolver, NO_CONNECTION, NtcLibrary, color_name_markup, colornames_color_url


class _Response:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class HuePrintColorNameTests(unittest.TestCase):
    def cache_path(self, suffix):
        path = Path(__file__).with_name(f".test-colornames-{suffix}.json")
        try:
            path.unlink()
        except FileNotFoundError:
            pass
        self.addCleanup(lambda: path.unlink(missing_ok=True))
        return path

    def test_ntc_library_is_local_and_matches_reference_results(self):
        library = NtcLibrary()
        self.assertEqual(library.count, 1566)
        self.assertEqual(library.name("#000000"), "Black")
        self.assertEqual(library.name("#6195ED"), "Cornflower Blue")
        self.assertEqual(library.name("#2F80ED"), "Royal Blue")

    def test_colornames_lookup_is_async_and_cached(self):
        event = threading.Event()
        cache = self.cache_path("online")
        resolver = ColorNameResolver(cache, opener=lambda *_args, **_kwargs: _Response({"hexCode": "2f80ed", "name": "Studio Blue"}))
        resolver.request(["#2F80ED"], lambda _color: event.set())
        self.assertTrue(event.wait(2))
        self.assertEqual(resolver.names("#2F80ED"), ("Royal Blue", "Studio Blue"))
        resolver.close()
        self.assertEqual(json.loads(cache.read_text(encoding="utf-8"))["#2F80ED"], "Studio Blue")

    def test_connection_failure_is_explicit_but_not_persisted(self):
        event = threading.Event()
        cache = self.cache_path("offline")

        def fail(*_args, **_kwargs):
            raise URLError("offline")

        resolver = ColorNameResolver(cache, opener=fail)
        resolver.request(["#FFFFFF"], lambda _color: event.set())
        self.assertTrue(event.wait(2))
        self.assertEqual(resolver.names("#FFFFFF"), ("White", NO_CONNECTION))
        resolver.close()
        self.assertEqual(json.loads(cache.read_text(encoding="utf-8")), {})

    def test_unnamed_colornames_response_is_not_rendered_as_none(self):
        resolver = ColorNameResolver(opener=lambda *_args, **_kwargs: _Response({"hexCode": "2f80ed", "name": None}))
        self.assertEqual(resolver._lookup_colornames("#2F80ED"), "Unnamed")
        resolver.close()

    def test_tooltip_identifies_and_italicizes_both_sources(self):
        markup = color_name_markup("#2F80ED", "Royal Blue", "Studio Blue")
        self.assertIn("<b>NTC Library:</b> <i>Royal Blue</i>", markup)
        self.assertIn("<b>Colornames.org:</b> <i>Studio Blue</i>", markup)

    def test_unnamed_color_link_targets_exact_colornames_page(self):
        self.assertEqual(colornames_color_url("#2F80ED"), "https://colornames.org/color/2f80ed")

    def test_windows_transport_uses_system_certificate_store(self):
        source = Path(__file__).with_name("hueprint_color_names.py").read_text(encoding="utf-8")
        self.assertIn('ctypes.WinDLL("wininet"', source)
        self.assertIn("_windows_json(url, self.timeout)", source)
        self.assertNotIn("CERT_NONE", source)
        self.assertNotIn("_create_unverified_context", source)


if __name__ == "__main__":
    unittest.main()
