"""Dependency-free HuePrint color harmony generation."""
import colorsys
import re

DEFAULT_COLOR = "#2F80ED"
def clamp(value, low, high): return min(high, max(low, value))
def normalize_hue(hue): return hue % 360

def sanitize_hex(value, fallback=DEFAULT_COLOR):
    value = value.strip()
    short = re.fullmatch(r"#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", value)
    if short: return ("#" + "".join(channel * 2 for channel in short.groups())).upper()
    full = re.fullmatch(r"#?([0-9a-fA-F]{6})", value)
    return ("#" + full.group(1)).upper() if full else fallback.upper()

def hex_to_hls(value):
    value = sanitize_hex(value)
    rgb = tuple(int(value[i:i + 2], 16) / 255 for i in (1, 3, 5))
    hue, lightness, saturation = colorsys.rgb_to_hls(*rgb)
    return hue * 360, lightness, saturation

def hls_to_hex(hue, lightness, saturation):
    rgb = colorsys.hls_to_rgb(normalize_hue(hue) / 360, clamp(lightness, 0, 1), clamp(saturation, 0, 1))
    return "#" + "".join(f"{round(channel * 255):02X}" for channel in rgb)

def harmony_hues(anchor, rule, count):
    count = int(clamp(count, 2, 8))
    if rule == "analogous":
        width = 60 if count <= 3 else 80
        return [normalize_hue(anchor - width / 2 + width * i / (count - 1)) for i in range(count)]
    if rule == "complementary":
        patterns = {2:[0,180],3:[-15,0,180],4:[-15,15,165,195],5:[-15,0,15,180,0],6:[-20,0,20,160,180,200]}
        return [normalize_hue(anchor + x) for x in patterns[min(count, 6)]]
    if rule == "split_complementary":
        patterns = {3:[0,150,210],4:[-20,0,150,210],5:[-20,0,20,150,210],6:[-20,0,20,150,180,210]}
        return [normalize_hue(anchor + x) for x in patterns[int(clamp(count, 3, 6))]]
    if rule == "triadic": return [normalize_hue(anchor + (i % 3) * 120) for i in range(count)]
    if rule == "square": return [normalize_hue(anchor + (i % 4) * 90) for i in range(count)]
    if rule == "rectangle_tetradic":
        offsets = [0, 60, 180, 240]
        return [normalize_hue(anchor + offsets[i % 4]) for i in range(count)]
    if rule == "polygon": return [normalize_hue(anchor + i * 360 / count) for i in range(count)]
    return [normalize_hue(anchor)] * count

def generate_palette(base_color, rule, count):
    count = int(clamp(count, 2, 8))
    hue, lightness, saturation = hex_to_hls(sanitize_hex(base_color))
    if rule in {"monochromatic", "tint", "shade", "tone"}:
        result = []
        for i in range(count):
            t = i / (count - 1)
            if rule == "monochromatic":
                next_l = clamp(lightness - .24 + .48 * t, .08, .92)
                next_s = saturation * (.68 + .32 * (1 - abs(t - .5) * 2))
            elif rule == "tint": next_l, next_s = lightness + (.96 - lightness) * t, saturation
            elif rule == "shade": next_l, next_s = lightness * (1 - .82 * t), saturation
            else: next_l, next_s = lightness, saturation * (1 - .82 * t)
            result.append(hls_to_hex(hue, next_l, next_s))
        return result
    hues = harmony_hues(hue, rule, count)
    result = []
    for i, next_hue in enumerate(hues):
        next_l, next_s = lightness, saturation
        if rule in {"square", "rectangle_tetradic"} and i >= 4:
            next_l, next_s = clamp(lightness + (-.1 if i % 2 == 0 else .1), .08, .92), saturation * .55
        if rule == "triadic" and i >= 3:
            next_l = clamp(lightness + (-.08 if i == 3 else .1), .08, .92)
            next_s *= .85 if i == 3 else .72 if i == 4 else .38
        if rule == "complementary" and count == 5 and i == 4: next_s *= .18
        result.append(hls_to_hex(next_hue, next_l, next_s))
    return result
