import unittest
from hueprint_recipes import RECIPES
from hueprint_recipe_metadata import CATEGORY_ORDER,RECIPE_IDS_BY_CATEGORY,RECIPE_METADATA,RECIPE_METADATA_BY_ID

EXPECTED={
 "manual":("none",),
 "tonal":("tonalFriends","quietMono","luxuryNeutral","mutedEditorial","clayEarth","seededShades","richTonal"),
 "accent":("dustAccent","softDotAccent","minimalAccent","spotAccent","trustSignal","neutralMatch","monochromePlusAccent","brightSwitch","brightAccentPair"),
 "spectrum":("softNatural","warmHospitality","botanicalFresh","pastelBloom","coolArc","gradientFriendly","warmArc","vividArc"),
 "contrast":("retroPop","friendlyContrast","highContrast","vividCounterpoint"),
 "systems":("editorialContrast","cleanUi","signalSystem","lightInterfaceSignals","categoricalFive"),
 "vibrant":("boldPop","vividAnalogous","chromaticBurst","vividTriad"),
 "harmony":("threePointAccent","duotonePoster","directComplement","splitComplement","doubleComplement","complementaryBridge"),
 "darkLuminous":("techDigital","nightMode","midnightComplement","darkWarmSignals","darkCoolSignals","neonTriad"),
 "temperature":("warmAccents","coolAccents","warmCoolSplit"),
}
class RecipeMetadataTests(unittest.TestCase):
 def test_every_recipe_has_one_metadata_entry(self):
  ids=[item.id for item in RECIPE_METADATA];self.assertEqual(len(ids),53);self.assertEqual(len(ids),len(set(ids)));self.assertEqual(set(ids),set(RECIPES));self.assertEqual(set(RECIPE_METADATA_BY_ID),set(RECIPES))
 def test_categories_and_order_match_specification(self):
  self.assertEqual(CATEGORY_ORDER,tuple(EXPECTED));self.assertEqual(RECIPE_IDS_BY_CATEGORY,EXPECTED)
 def test_manual_maps_only_to_none(self):self.assertEqual(RECIPE_IDS_BY_CATEGORY["manual"],("none",))
 def test_cards_have_complete_safe_copy(self):
  for item in RECIPE_METADATA:
   self.assertTrue(item.display_name.strip() and item.character.strip() and item.description.strip());self.assertNotIn("accessible",item.description.lower());self.assertNotIn("wcag",item.description.lower())
if __name__=="__main__":unittest.main()