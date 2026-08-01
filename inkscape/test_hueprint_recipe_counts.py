import unittest
from hueprint_recipes import generate_recipe

class HuePrintRecipeCountTests(unittest.TestCase):
    def test_recipe_respects_requested_swatch_count(self):
        for count in range(2, 9):
            with self.subTest(count=count):
                self.assertEqual(len(generate_recipe("#3366FF", "spotAccent", count)), count)

if __name__ == "__main__": unittest.main()
