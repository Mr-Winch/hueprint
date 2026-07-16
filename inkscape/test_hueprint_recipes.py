import unittest
from hueprint_recipes import RECIPES, generate_recipe

class HuePrintRecipeTests(unittest.TestCase):
    def test_all_recipes_generate_valid_colors(self):
        self.assertEqual(len(RECIPES), 33)
        for recipe_id, (_label, transforms) in RECIPES.items():
            with self.subTest(recipe=recipe_id):
                colors = generate_recipe("#3366FF", recipe_id)
                self.assertEqual(len(colors), len(transforms))
                self.assertTrue(all(color.startswith("#") and len(color) == 7 for color in colors))

    def test_recipes_follow_active_color(self):
        self.assertNotEqual(generate_recipe("#3366FF", "spotAccent"), generate_recipe("#FF3333", "spotAccent"))

if __name__ == "__main__": unittest.main()
