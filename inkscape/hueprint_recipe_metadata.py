"""User-facing HuePrint recipe organization; recipe mathematics live elsewhere."""
from typing import NamedTuple

class RecipeMetadata(NamedTuple):
    id: str
    current_name: str
    display_name: str
    category: str
    character: str
    description: str

CATEGORY_ORDER = ("manual", "tonal", "accent", "spectrum", "contrast", "systems")
CATEGORY_LABELS = {
    "manual": "Manual", "tonal": "Tonal", "accent": "Accent",
    "spectrum": "Spectrum", "contrast": "Contrast", "systems": "Systems",
}

RECIPE_METADATA = (
    RecipeMetadata("none", "No Recipe", "Manual Palette", "manual", "Unstructured and user-directed.", "Applies no predefined color relationship. Use the base color alone or build the palette manually."),
    RecipeMetadata("tonalFriends", "Tonal Core", "Essential Tonal", "tonal", "Compact, cohesive, and dependable.", "Creates a compact family consisting of the base, a darker muted tone, and a lighter muted tone."),
    RecipeMetadata("quietMono", "Quiet Mono", "Soft Monochrome", "tonal", "Minimal, subdued, and tonally rich.", "Generates a broad light-to-dark scale from the same hue while keeping saturation restrained."),
    RecipeMetadata("luxuryNeutral", "Luxe Neutral", "Refined Neutral", "tonal", "Elegant, understated, and composed.", "Creates a restrained family of deep and pale low-saturation tones with subtle hue variation."),
    RecipeMetadata("mutedEditorial", "Quiet Editorial", "Restrained Editorial", "tonal", "Sophisticated, quiet, and content-first.", "Builds a calm hierarchy of dark, light, and near-neutral tones with one subdued color variation."),
    RecipeMetadata("clayEarth", "Clay Earth", "Grounded Tones", "tonal", "Material, subdued, and organic.", "Develops muted neighboring hues across light and dark values, producing a grounded tonal family."),
    RecipeMetadata("seededShades", "Brand Shades", "Extended Brand Scale", "tonal", "Versatile, cohesive, and expansive.", "Develops dark, light, vivid, and softened versions of the base color into a flexible extended palette."),
    RecipeMetadata("dustAccent", "Dusty Accent", "Muted Highlight", "accent", "Quiet and selectively accented.", "Builds a restrained tonal foundation and introduces one subdued secondary highlight."),
    RecipeMetadata("softDotAccent", "Soft Accent Pair", "Subtle Accent Pair", "accent", "Gentle, nuanced, and low-contrast.", "Combines the base with a pale support tone and two closely related, softened accents."),
    RecipeMetadata("minimalAccent", "Minimal Accent", "Minimal Accent", "accent", "Clean, restrained, and precise.", "Builds a mostly neutral tonal hierarchy and introduces one clear saturated accent."),
    RecipeMetadata("spotAccent", "Signature Accent", "Focused Accent", "accent", "Restrained with one decisive focal point.", "Combines the base with pale tonal companions and one vivid contrasting focal color."),
    RecipeMetadata("trustSignal", "Trust Signal", "Trust Signal", "accent", "Stable, credible, and selectively assertive.", "Combines a moderated base with stable dark and light support tones and one controlled vivid accent."),
    RecipeMetadata("neutralMatch", "Balanced Accent", "Structured Accent", "accent", "Balanced, practical, and controlled.", "Adds dark and light tonal support plus two variations of a contrasting accent."),
    RecipeMetadata("monochromePlusAccent", "Mono Accent", "Mono Accent", "accent", "Disciplined and selectively expressive.", "Creates a complete monochromatic hierarchy and adds one opposing signal color."),
    RecipeMetadata("brightSwitch", "Bright Pivot", "Vivid Pivot", "accent", "Clean, bright, and deliberately contrasting.", "Pairs the base with pale supporting tones and two clearly differentiated accent colors."),
    RecipeMetadata("softNatural", "Organic Soft", "Gentle Harmony", "spectrum", "Calm, soft, and approachable.", "Surrounds the base with light, muted companions and a softly shifted secondary hue."),
    RecipeMetadata("warmHospitality", "Welcoming Warmth", "Soft Welcome", "spectrum", "Comfortable, human, and inviting.", "Develops a range of lighter, softened hues with one deeper supporting tone."),
    RecipeMetadata("botanicalFresh", "Botanical Fresh", "Organic Range", "spectrum", "Fresh, varied, and naturally cohesive.", "Moves through a related directional hue range with softened saturation and varied lightness."),
    RecipeMetadata("pastelBloom", "Pastel Bloom", "Airy Pastels", "spectrum", "Light, gentle, and optimistic.", "Produces several light, low-saturation hues around the base with gentle color separation."),
    RecipeMetadata("coolArc", "Cool Spectrum", "Cohesive Spectrum", "spectrum", "Controlled, coordinated, and fluid.", "Moves gradually through related hues while becoming slightly lighter and softer."),
    RecipeMetadata("gradientFriendly", "Smooth Ramp", "Progressive Ramp", "spectrum", "Continuous, directional, and transition-oriented.", "Changes hue, lightness, and saturation in measured steps for smooth sequential transitions."),
    RecipeMetadata("warmArc", "Warm Spectrum", "Expansive Spectrum", "spectrum", "Broad, expressive, and progressive.", "Extends the base through a wide hue progression that becomes lighter and softer."),
    RecipeMetadata("retroPop", "Retro Pop", "Eclectic Vintage", "contrast", "Nostalgic, unconventional, and playful.", "Combines softened colors through broad, irregular hue and tonal shifts."),
    RecipeMetadata("friendlyContrast", "Friendly Pop", "Playful Contrast", "contrast", "Bright, optimistic, and approachable.", "Combines a brighter base variation with two lively contrasting colors."),
    RecipeMetadata("threePointAccent", "Triad Accent", "Energetic Triad", "contrast", "Lively, varied, and chromatically distinct.", "Adds two saturated hues in different directions from the base to create a distinct three-color palette."),
    RecipeMetadata("duotonePoster", "Duotone Poster", "Opposing Duotone", "contrast", "Bold, graphic, and polarized.", "Pairs the base with its opposite hue and creates light and dark variations of both."),
    RecipeMetadata("boldPop", "Pop System", "High-Energy Mix", "contrast", "Bold, saturated, and attention-seeking.", "Combines the base with several highly saturated hues and one darker anchoring tone."),
    RecipeMetadata("highContrast", "Sharp Contrast", "Sharp Contrast", "contrast", "Decisive, dramatic, and highly differentiated.", "Combines extreme dark and light tones with a vivid opposing hue for maximum separation."),
    RecipeMetadata("editorialContrast", "Magazine Contrast", "Editorial Hierarchy", "systems", "Structured, authoritative, and content-led.", "Builds a strong dark-to-light hierarchy and introduces two related accent roles."),
    RecipeMetadata("cleanUi", "Interface Kit", "Interface Essentials", "systems", "Functional, neutral, and system-ready.", "Generates distinct colors for primary emphasis, pale surfaces, dark content, and secondary accents."),
    RecipeMetadata("signalSystem", "Signal System", "Multi-Signal System", "systems", "Informational, systematic, and multifunctional.", "Combines a stable tonal foundation with two vivid accents for clearly differentiated signals."),
    RecipeMetadata("techDigital", "Digital Pulse", "Electric Interface", "systems", "Futuristic, sharp, and digitally energetic.", "Builds a dark digital foundation with a vivid contrasting accent and lighter supporting colors."),
    RecipeMetadata("nightMode", "Night Mode", "Dark Interface", "systems", "Immersive, luminous, and screen-focused.", "Adds deep surface colors and brighter accents intended to remain distinct in dark environments."),
)

RECIPE_METADATA_BY_ID = {item.id: item for item in RECIPE_METADATA}
RECIPE_IDS_BY_CATEGORY = {
    category: tuple(item.id for item in RECIPE_METADATA if item.category == category)
    for category in CATEGORY_ORDER
}