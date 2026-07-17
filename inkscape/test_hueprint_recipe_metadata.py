import unittest
from hueprint_recipes import RECIPES
from hueprint_recipe_metadata import CATEGORY_ORDER, RECIPE_IDS_BY_CATEGORY, RECIPE_METADATA, RECIPE_METADATA_BY_ID

class RecipeMetadataTests(unittest.TestCase):
    def test_every_recipe_has_one_metadata_entry(self):
        ids=[item.id for item in RECIPE_METADATA]
        self.assertEqual(len(ids),33)
        self.assertEqual(len(ids),len(set(ids)))
        self.assertEqual(set(ids),set(RECIPES))
        self.assertEqual(set(RECIPE_METADATA_BY_ID),set(RECIPES))

    def test_categories_and_order_match_specification(self):
        expected={
            "manual":("none",),
            "tonal":("tonalFriends","quietMono","luxuryNeutral","mutedEditorial","clayEarth","seededShades"),
            "accent":("dustAccent","softDotAccent","minimalAccent","spotAccent","trustSignal","neutralMatch","monochromePlusAccent","brightSwitch"),
            "spectrum":("softNatural","warmHospitality","botanicalFresh","pastelBloom","coolArc","gradientFriendly","warmArc"),
            "contrast":("retroPop","friendlyContrast","threePointAccent","duotonePoster","boldPop","highContrast"),
            "systems":("editorialContrast","cleanUi","signalSystem","techDigital","nightMode"),
        }
        self.assertEqual(CATEGORY_ORDER,tuple(expected))
        self.assertEqual(RECIPE_IDS_BY_CATEGORY,expected)

    def test_required_user_facing_names_are_retained(self):
        expected={
            "highContrast":"Sharp Contrast",
            "monochromePlusAccent":"Mono Accent",
            "minimalAccent":"Minimal Accent",
            "trustSignal":"Trust Signal",
            "seededShades":"Extended Brand Scale",
            "none":"Manual Palette",
        }
        self.assertEqual({key:RECIPE_METADATA_BY_ID[key].display_name for key in expected},expected)

    def test_all_cards_have_complete_user_facing_copy(self):
        for item in RECIPE_METADATA:
            with self.subTest(recipe=item.id):
                self.assertTrue(item.display_name.strip())
                self.assertTrue(item.character.strip())
                self.assertTrue(item.description.strip())
                self.assertNotIn(item.id,item.display_name)

if __name__=="__main__":unittest.main()