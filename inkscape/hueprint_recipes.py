"""HuePrint OKLCH palette recipes, ported from the React component."""
import math
from hueprint_palette import clamp, normalize_hue, sanitize_hex

RECIPES = {
    "none": ("No recipe", []),
    "warmArc": ("Warm Spectrum", [(0,1,0),(.02,.95,45),(.04,1.05,75),(.06,1.1,105),(.08,1,135),(.1,.85,155)]),
    "coolArc": ("Cool Spectrum", [(0,1,0),(0,1,-35),(.01,1.05,-55),(.02,1,-70),(.03,.95,-85),(.04,.9,-100)]),
    "spotAccent": ("Signature Accent", [(0,1,0),(.22,.45,0),(.38,.18,0),(-.02,1.15,-95)]),
    "editorialContrast": ("Magazine Contrast", [(0,1,0),(-.28,.22,5),(.18,.2,5),(-.04,.75,110),(.12,1.05,115)]),
    "brightSwitch": ("Bright Pivot", [(0,1,0),(.36,.18,0),(-.01,1.2,-95),(.34,.25,155)]),
    "softNatural": ("Organic Soft", [(0,1,0),(.1,.35,5),(.36,.16,0),(.32,.22,145)]),
    "neutralMatch": ("Balanced Accent", [(0,1,0),(-.28,.22,5),(.18,.2,5),(-.1,1.05,-95),(.02,1.15,-95)]),
    "tonalFriends": ("Tonal Core", [(0,1,0),(-.28,.22,5),(.18,.2,5)]),
    "softDotAccent": ("Soft Accent Pair", [(0,1,0),(.18,.2,5),(-.02,.75,110),(.18,.28,115)]),
    "threePointAccent": ("Triad Accent", [(0,1,0),(-.06,1,125),(-.08,1.05,-95)]),
    "dustAccent": ("Dusty Accent", [(0,1,0),(-.28,.22,5),(.18,.2,5),(.12,1.05,115)]),
    "friendlyContrast": ("Friendly Pop", [(0,1,0),(.24,.95,0),(-.01,1.15,-95),(-.24,1.05,-95)]),
    "seededShades": ("Brand Shades", [(0,1,0),(.28,.45,-8),(.12,.85,6),(-.22,.8,0),(.34,.3,12)]),
    "cleanUi": ("Interface Kit", [(0,1,0),(.46,.04,0),(.36,.12,0),(-.38,.18,0),(.04,.85,-85),(.3,.08,0)]),
    "boldPop": ("Pop System", [(0,1,0),(.04,1.25,90),(-.02,1.2,-95),(.12,1.15,150),(-.18,.9,0)]),
    "mutedEditorial": ("Quiet Editorial", [(0,.7,0),(-.22,.22,4),(.16,.18,6),(.28,.1,0),(-.04,.45,105)]),
    "luxuryNeutral": ("Luxe Neutral", [(0,.65,0),(-.32,.16,20),(-.12,.12,35),(.2,.1,45),(.08,.55,115)]),
    "techDigital": ("Digital Pulse", [(0,1,0),(-.18,.9,-45),(.02,1.15,-90),(.24,.35,-70),(-.34,.2,-20)]),
    "warmHospitality": ("Welcoming Warmth", [(0,.85,0),(.16,.45,55),(.24,.28,85),(-.08,.7,120),(.32,.16,100)]),
    "highContrast": ("Sharp Contrast", [(0,1,0),(-.42,.35,0),(.42,.2,0),(-.05,1.15,180),(.3,.12,180)]),
    "gradientFriendly": ("Smooth Ramp", [(0,1,0),(.03,.98,24),(.06,.95,48),(.09,.9,72),(.12,.85,96)]),
    "monochromePlusAccent": ("Mono Accent", [(0,1,0),(-.22,.8,0),(.18,.55,0),(.34,.25,0),(-.03,1.05,180)]),
    "pastelBloom": ("Pastel Bloom", [(0,.55,0),(.18,.35,25),(.22,.32,-25),(.28,.25,85),(.32,.2,-80)]),
    "nightMode": ("Night Mode", [(0,.95,0),(-.42,.22,0),(-.32,.16,-20),(.08,1.1,-90),(.16,.7,120)]),
    "clayEarth": ("Clay Earth", [(0,.75,0),(.1,.38,45),(.18,.28,75),(-.14,.45,105),(.3,.14,60)]),
    "trustSignal": ("Trust Signal", [(0,.85,0),(-.18,.45,-30),(.18,.25,0),(.04,.95,-80),(.34,.1,0)]),
    "quietMono": ("Quiet Mono", [(0,.75,0),(-.3,.35,0),(-.12,.5,0),(.2,.28,0),(.38,.12,0)]),
    "duotonePoster": ("Duotone Poster", [(0,1,0),(-.05,1.05,180),(.28,.3,0),(.3,.28,180),(-.28,.4,0)]),
    "retroPop": ("Retro Pop", [(0,.9,0),(.08,.8,60),(.12,.7,130),(-.1,.65,-70),(.26,.22,35)]),
    "botanicalFresh": ("Botanical Fresh", [(0,.8,0),(.12,.42,-55),(.24,.28,-85),(-.1,.55,-110),(.34,.16,-70)]),
    "minimalAccent": ("Minimal Accent", [(0,.65,0),(-.34,.1,0),(-.12,.08,20),(.26,.06,35),(.04,1,-95)]),
    "signalSystem": ("Signal System", [(0,.85,0),(-.28,.25,0),(.3,.12,0),(.04,1,-90),(.1,.95,120)]),
}

def _linear(v): return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4
def _srgb(v): return 12.92 * v if v <= .0031308 else 1.055 * max(v, 0) ** (1 / 2.4) - .055

def hex_to_oklch(value):
    value = sanitize_hex(value)
    r, g, b = [_linear(int(value[i:i+2], 16) / 255) for i in (1,3,5)]
    ll = (0.4122214708*r + 0.5363325363*g + 0.0514459929*b) ** (1/3)
    mm = (0.2119034982*r + 0.6806995451*g + 0.1073969566*b) ** (1/3)
    ss = (0.0883024619*r + 0.2817188376*g + 0.6299787005*b) ** (1/3)
    L = .2104542553*ll + .793617785*mm - .0040720468*ss
    a = 1.9779984951*ll - 2.428592205*mm + .4505937099*ss
    b2 = .0259040371*ll + .7827717662*mm - .808675766*ss
    c = math.hypot(a, b2)
    return L, c, normalize_hue(math.degrees(math.atan2(b2, a))) if c > .0005 else 0

def _raw_rgb(color):
    L, c, h = color; rad = math.radians(h); a = c*math.cos(rad); b = c*math.sin(rad)
    ll = (L + .3963377774*a + .2158037573*b) ** 3
    mm = (L - .1055613458*a - .0638541728*b) ** 3
    ss = (L - .0894841775*a - 1.291485548*b) ** 3
    return (_srgb(4.0767416621*ll - 3.3077115913*mm + .2309699292*ss),
            _srgb(-1.2684380046*ll + 2.6097574011*mm - .3413193965*ss),
            _srgb(-.0041960863*ll - .7034186147*mm + 1.707614701*ss))

def oklch_to_hex(color):
    L, c, h = clamp(color[0], .08, .96), clamp(color[1], .02, .34), normalize_hue(color[2])
    rgb = _raw_rgb((L,c,h))
    if not all(0 <= v <= 1 for v in rgb):
        low, high = 0, c
        for _ in range(18):
            mid = (low + high) / 2
            if all(0 <= v <= 1 for v in _raw_rgb((L,mid,h))): low = mid
            else: high = mid
        rgb = _raw_rgb((L,max(.02,low),h))
    return "#" + "".join(f"{round(clamp(v,0,1)*255):02X}" for v in rgb)

def generate_recipe(base_color, recipe_id):
    transforms = RECIPES.get(recipe_id, RECIPES["none"])[1]
    if not transforms: return []
    L, c, h = hex_to_oklch(base_color)
    return [oklch_to_hex((L+dL, c*scale, h+dH)) for dL, scale, dH in transforms]
