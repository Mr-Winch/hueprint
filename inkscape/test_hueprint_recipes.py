import hashlib
import re
import unittest
from hueprint_recipes import RECIPES, generate_recipe, hex_to_oklch, oklch_to_hex, randomize_recipe, resolve_transform

LEGACY_DIGESTS={
    "#0070C0":"078b770ba21c439fc4a32d1981a1a652cfde74e1b4b84aee952c3c771d9cbe68",
    "#3C75A7":"1006e3338a8872df5ee17f87ce81582704021b365f165ab6c671c89ba39dd5c4",
    "#FF0000":"d6df5aa76b5385ca9ce434fba2c51e6c9dd3cbbffd3ac56187207ca478a7efa0",
    "#92D050":"327e81a3e95537d4f6a4c6324870637667d5858fd42efd2287bc561e7b86cdf7",
    "#7F7F7F":"37ec6648e442500040f8e0745f557bb3efbc69301a085e0c26104ad3638dad3b",
    "#221133":"0f5aa23760d60cdfe39c00642ffe75d50a7a753ae706f13074ea70c7810ef9df",
    "#F1C40F":"317de96fdec204bc4125672ba2f436e94fb10a7416a4888dc92adbf4e209b699",
}
LEGACY_IDS=tuple(RECIPES)[:33]
NEW_IDS=tuple(RECIPES)[33:]
HEX=re.compile(r"^#[0-9A-F]{6}$")

class HuePrintRecipeTests(unittest.TestCase):
    def test_catalog_and_all_outputs(self):
        self.assertEqual(len(RECIPES),53)
        for recipe_id,(_label,transforms) in RECIPES.items():
            colors=generate_recipe("#3366FF",recipe_id)
            self.assertEqual(len(colors),len(transforms),recipe_id)
            self.assertTrue(all(HEX.fullmatch(color) for color in colors),recipe_id)

    def test_legacy_outputs_are_unchanged(self):
        ids=[recipe_id for recipe_id in LEGACY_IDS if recipe_id!="none"]
        for seed,digest in LEGACY_DIGESTS.items():
            payload="|".join(",".join(generate_recipe(seed,recipe_id)) for recipe_id in ids)
            self.assertEqual(hashlib.sha256(payload.encode()).hexdigest(),digest,seed)

    def test_advanced_precedence_and_exact_base(self):
        base=(.5,.1,350)
        self.assertEqual(resolve_transform(base,{"L":.7,"dL":-.2,"C":.2,"cScale":.1,"cMin":.3,"H":20,"dH":40}),(.7,.2,20))
        self.assertEqual(resolve_transform(base,{"cScale":.5,"cMin":.12})[1],.12)
        self.assertEqual(resolve_transform(base,{"dH":30})[2],20)
        for recipe_id in NEW_IDS:
            transforms=RECIPES[recipe_id][1]
            colors=generate_recipe("#3C75A7",recipe_id)
            for index,step in enumerate(transforms):
                if step.get("base"):self.assertEqual(colors[index],"#3C75A7",recipe_id)

    def test_seeded_randomization_is_reproducible_and_preserves_base(self):
        first=randomize_recipe("#7F7F7F","vividAnalogous","vibrant",5,"fixed-seed")
        second=randomize_recipe("#7F7F7F","vividAnalogous","vibrant",5,"fixed-seed")
        self.assertEqual(first,second)
        self.assertIn("#7F7F7F",first["colors"])
        self.assertEqual(first["source_category"],"vibrant")
        self.assertEqual(first["source_recipe_id"],"vividAnalogous")

    def test_visual_matrix_is_valid(self):
        for hue in (0,45,90,135,180,225,270,315):
            for lightness in (.30,.60,.85):
                for chroma in (.05,.14,.24):
                    seed=oklch_to_hex((lightness,chroma,hue))
                    for recipe_id in NEW_IDS:
                        colors=generate_recipe(seed,recipe_id)
                        self.assertTrue(colors and all(HEX.fullmatch(color) for color in colors),(seed,recipe_id))

    def test_temperature_and_luminous_recipes_keep_their_character(self):
        warm=generate_recipe("#3366FF","warmAccents")
        cool=generate_recipe("#FF8800","coolAccents")
        warm_hues=[hex_to_oklch(color)[2] for color in warm[2:5]]
        cool_hues=[hex_to_oklch(color)[2] for color in cool[2:5]]
        self.assertTrue(all(10<=hue<=100 for hue in warm_hues),warm_hues)
        self.assertTrue(all(180<=hue<=345 for hue in cool_hues),cool_hues)
        dark=generate_recipe("#3366FF","darkWarmSignals")
        values=[hex_to_oklch(color) for color in dark]
        self.assertTrue(any(item[0]<=.22 for item in values))
        self.assertTrue(any(item[0]>=.72 for item in values))

if __name__=="__main__":unittest.main()