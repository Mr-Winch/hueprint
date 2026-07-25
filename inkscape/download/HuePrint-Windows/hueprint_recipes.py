"""HuePrint OKLCH palette recipes, ported from the React component."""
import math, random, secrets
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
    "richTonal": ("Rich Tonal", [{"base":True},{"dL":-.24,"cScale":.90,"cMin":.11,"dH":-4},{"dL":-.12,"cScale":1.05,"cMin":.14},{"dL":.16,"cScale":.95,"cMin":.12,"dH":4},{"dL":.30,"cScale":.55,"cMin":.08,"dH":8}]),
    "brightAccentPair": ("Bright Accent Pair", [{"base":True},{"L":.18,"C":.035,"dH":0},{"L":.94,"C":.025,"dH":0},{"L":.72,"C":.21,"dH":150},{"L":.78,"C":.20,"dH":205}]),
    "vividArc": ("Vivid Arc", [{"base":True},{"dL":-.04,"cScale":1.00,"cMin":.18,"dH":-60},{"dL":0,"cScale":1.00,"cMin":.20,"dH":-30},{"dL":.06,"cScale":1.00,"cMin":.20,"dH":30},{"dL":.12,"cScale":.95,"cMin":.18,"dH":60}]),
    "vividCounterpoint": ("Vivid Counterpoint", [{"base":True},{"L":.18,"C":.035,"dH":0},{"L":.94,"C":.025,"dH":0},{"L":.72,"C":.22,"dH":180},{"L":.88,"C":.08,"dH":180}]),
    "lightInterfaceSignals": ("Light Interface Signals", [{"base":True},{"L":.98,"C":.02,"dH":0},{"L":.92,"C":.025,"dH":0},{"L":.22,"C":.035,"dH":0},{"L":.70,"C":.20,"dH":150},{"L":.72,"C":.19,"dH":210}]),
    "categoricalFive": ("Categorical Five", [{"base":True},{"L":.68,"C":.18,"dH":72},{"L":.70,"C":.18,"dH":144},{"L":.66,"C":.18,"dH":216},{"L":.72,"C":.18,"dH":288}]),
    "vividAnalogous": ("Vivid Analogous", [{"base":True},{"dL":-.04,"cScale":1.00,"cMin":.19,"dH":-70},{"dL":0,"cScale":1.00,"cMin":.20,"dH":-35},{"dL":.05,"cScale":1.00,"cMin":.20,"dH":35},{"dL":.10,"cScale":.95,"cMin":.19,"dH":70}]),
    "chromaticBurst": ("Chromatic Burst", [{"base":True},{"L":.72,"C":.20,"dH":90},{"L":.70,"C":.20,"dH":180},{"L":.68,"C":.20,"dH":270},{"L":.94,"C":.025,"dH":0}]),
    "vividTriad": ("Vivid Triad", [{"base":True},{"L":.72,"C":.21,"dH":120},{"L":.70,"C":.21,"dH":240},{"L":.18,"C":.03,"dH":0},{"L":.94,"C":.025,"dH":0}]),
    "directComplement": ("Direct Complement", [{"base":True},{"L":.72,"C":.21,"dH":180},{"L":.24,"C":.08,"dH":0},{"L":.88,"C":.08,"dH":180},{"L":.94,"C":.025,"dH":0}]),
    "splitComplement": ("Split Complement", [{"base":True},{"L":.72,"C":.20,"dH":150},{"L":.72,"C":.20,"dH":210},{"L":.22,"C":.035,"dH":0},{"L":.94,"C":.025,"dH":0}]),
    "doubleComplement": ("Double Complement", [{"base":True},{"L":.70,"C":.19,"dH":60},{"L":.70,"C":.20,"dH":180},{"L":.70,"C":.19,"dH":240},{"L":.20,"C":.03,"dH":0}]),
    "complementaryBridge": ("Complementary Bridge", [{"base":True},{"L":.70,"C":.18,"dH":145},{"L":.74,"C":.21,"dH":180},{"L":.70,"C":.18,"dH":215},{"L":.94,"C":.025,"dH":0}]),
    "midnightComplement": ("Midnight Complement", [{"L":.12,"C":.025,"dH":0},{"L":.20,"C":.04,"dH":0},{"base":True},{"L":.78,"C":.22,"dH":180},{"L":.94,"C":.025,"dH":0}]),
    "darkWarmSignals": ("Dark Warm Signals", [{"L":.12,"C":.025,"dH":0},{"L":.20,"C":.04,"dH":0},{"base":True},{"L":.82,"C":.18,"H":85},{"L":.76,"C":.21,"H":55},{"L":.68,"C":.22,"H":25},{"L":.94,"C":.025,"H":75}]),
    "darkCoolSignals": ("Dark Cool Signals", [{"L":.12,"C":.025,"dH":0},{"L":.20,"C":.04,"dH":0},{"base":True},{"L":.76,"C":.19,"H":195},{"L":.70,"C":.21,"H":275},{"L":.72,"C":.20,"H":330},{"L":.94,"C":.025,"H":240}]),
    "neonTriad": ("Neon Triad", [{"L":.12,"C":.025,"dH":0},{"L":.20,"C":.04,"dH":0},{"base":True},{"L":.72,"C":.23,"dH":120},{"L":.70,"C":.23,"dH":240},{"L":.94,"C":.025,"dH":0}]),
    "warmAccents": ("Warm Accents", [{"base":True},{"L":.18,"C":.035,"dH":0},{"L":.82,"C":.18,"H":85},{"L":.76,"C":.21,"H":55},{"L":.68,"C":.22,"H":25},{"L":.94,"C":.04,"H":75}]),
    "coolAccents": ("Cool Accents", [{"base":True},{"L":.18,"C":.035,"dH":0},{"L":.76,"C":.19,"H":195},{"L":.70,"C":.21,"H":275},{"L":.72,"C":.20,"H":330},{"L":.94,"C":.04,"H":240}]),
    "warmCoolSplit": ("Warm–Cool Split", [{"base":True},{"L":.74,"C":.20,"H":55},{"L":.82,"C":.18,"H":85},{"L":.76,"C":.19,"H":195},{"L":.72,"C":.20,"H":315},{"L":.18,"C":.035,"dH":0}]),
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

def resolve_transform(base, step):
    """Resolve one legacy tuple or advanced mapping without gamut conversion."""
    L,c,h=base
    if isinstance(step,(tuple,list)):
        dL,c_scale,dH=step; return L+dL,c*c_scale,h+dH
    resolved_L=step.get("L",L+step.get("dL",0)); scaled=c*step.get("cScale",1); resolved_c=step.get("C",max(scaled,step.get("cMin",0))); resolved_h=step.get("H",h+step.get("dH",0))
    return clamp(resolved_L,.08,.96),clamp(resolved_c,.02,.34),normalize_hue(resolved_h)

def transforms_for_count(transforms,count):
    transforms=list(transforms)
    if count is None:return transforms
    count=int(clamp(count,2,8)); original=list(transforms)
    while len(transforms)<count:transforms.append(original[len(transforms)%len(original)])
    return transforms[:count]

def generate_recipe(base_color, recipe_id, count=None):
    original_hex=sanitize_hex(base_color); transforms=transforms_for_count(RECIPES.get(recipe_id,RECIPES["none"])[1],count)
    if not transforms:return []
    base=hex_to_oklch(original_hex); colors=[]
    for step in transforms:
        if isinstance(step,dict) and step.get("base"):colors.append(original_hex)
        else:colors.append(oklch_to_hex(resolve_transform(base,step)))
    return colors

RANDOM_JITTER = {
    "tonal":(.025,.08,6), "accent":(.030,.10,10), "spectrum":(.035,.10,14),
    "contrast":(.040,.12,14), "systems":(.030,.08,10), "vibrant":(.035,.12,14),
    "harmony":(.035,.12,12), "darkLuminous":(.025,.10,10), "temperature":(.025,.10,5),
}
STRUCTURAL_CATEGORIES={"tonal","accent","contrast","systems","darkLuminous","temperature"}
VIVID_CATEGORIES={"vibrant","harmony","darkLuminous","temperature"}

def _oklab_distance(first,second):
    L1,c1,h1=first;L2,c2,h2=second;a1=c1*math.cos(math.radians(h1));b1=c1*math.sin(math.radians(h1));a2=c2*math.cos(math.radians(h2));b2=c2*math.sin(math.radians(h2));return math.sqrt((L1-L2)**2+(a1-a2)**2+(b1-b2)**2)

def _valid_random(colors,base_hex,category):
    if not colors or base_hex not in colors or len(colors)!=len(set(colors)):return False
    final=[hex_to_oklch(color) for color in colors]; threshold=.030 if category=="tonal" else .045
    if any(_oklab_distance(final[i],final[j])<threshold for i in range(len(final)) for j in range(i)):return False
    spread=max(item[0] for item in final)-min(item[0] for item in final); minimum=.25 if category in STRUCTURAL_CATEGORIES else .18
    if spread<minimum:return False
    if category in VIVID_CATEGORIES and sum(item[1]>=.15 for item in final)<2:return False
    if category=="darkLuminous" and not (any(item[0]<=.22 for item in final) and any(item[0]>=.72 for item in final) and any(item[1]>=.16 for item in final)):return False
    return True

def randomize_recipe(base_color,recipe_id,category,count=None,seed=None):
    """Return a reproducible validated temporary palette state."""
    base_hex=sanitize_hex(base_color); source=list(RECIPES[recipe_id][1]); transforms=transforms_for_count(source,count); seed=seed or secrets.token_hex(12); rng=random.Random(seed); jitter=RANDOM_JITTER[category]; has_explicit_base=any(isinstance(step,dict) and step.get("base") for step in transforms)
    for _attempt in range(20):
        colors=[]; randomized=[]; requested=[]
        for index,step in enumerate(transforms):
            preserve=(isinstance(step,dict) and step.get("base")) or (not has_explicit_base and index==0)
            if preserve:colors.append(base_hex); randomized.append({"base":True}); requested.append(hex_to_oklch(base_hex)); continue
            L,c,h=resolve_transform(hex_to_oklch(base_hex),step); L=clamp(L+rng.uniform(-jitter[0],jitter[0]),.08,.96); c=clamp(c*(1+rng.uniform(-jitter[1],jitter[1])),.02,.34); h=normalize_hue(h+rng.uniform(-jitter[2],jitter[2])); randomized.append({"L":L,"C":c,"H":h}); requested.append((L,c,h)); colors.append(oklch_to_hex((L,c,h)))
        if _valid_random(colors,base_hex,category):return {"seed":seed,"source_recipe_id":recipe_id,"source_category":category,"randomized_transforms":randomized,"requested_oklch":requested,"final_oklch":[hex_to_oklch(color) for color in colors],"colors":colors}
    colors=generate_recipe(base_hex,recipe_id,count)
    if base_hex not in colors and colors:colors[0]=base_hex
    return {"seed":seed,"source_recipe_id":recipe_id,"source_category":category,"randomized_transforms":transforms,"requested_oklch":[],"final_oklch":[hex_to_oklch(color) for color in colors],"colors":colors,"fallback":True}
