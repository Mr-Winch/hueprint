import unittest
from pathlib import Path
from hueprint_palette import generate_palette, harmony_hues, palette_from_text, palette_storage_path, palette_to_gpl, sanitize_hex

class HuePrintPaletteTests(unittest.TestCase):
    def test_sanitizes_hex(self): self.assertEqual(sanitize_hex("36f"), "#3366FF")
    def test_polygon_spacing(self): self.assertEqual(harmony_hues(210, "polygon", 5), [210, 282, 354, 66, 138])
    def test_fixed_harmonies(self):
        self.assertEqual(harmony_hues(45, "complementary", 2), [45, 225])
        self.assertEqual(harmony_hues(45, "split_complementary", 3), [45, 195, 255])
    def test_all_rules_return_requested_palette(self):
        rules = ["monochromatic","analogous","complementary","split_complementary","triadic","square","rectangle_tetradic","polygon","tint","shade","tone"]
        for rule in rules:
            with self.subTest(rule=rule):
                colors = generate_palette("#3366FF", rule, 5)
                self.assertEqual(len(colors), 5)
                self.assertTrue(all(len(color) == 7 and color.startswith("#") for color in colors))
    def test_extended_swatch_count(self):
        for rule in ("analogous","complementary","split_complementary","triadic","polygon"):
            with self.subTest(rule=rule):self.assertEqual(len(generate_palette("#3366FF",rule,16)),16)


    def test_gpl_round_trip(self):
        colors = ["#2F80ED", "#FFAA00", "#111111"]
        payload = palette_to_gpl(colors)
        self.assertTrue(payload.startswith("GIMP Palette\nName: HuePrint Saved Palette\n"))
        self.assertEqual(palette_from_text(payload), colors)
    def test_imports_hueprint_json_entries(self):
        payload = '{"colors":["#123456",{"hex":"#ABCDEF"},{"bad":true}]}'
        self.assertEqual(palette_from_text(payload), ["#123456", "#ABCDEF"])

    def test_palette_storage_stays_outside_inkscape_config(self):
        home = Path("/home/winton")
        self.assertEqual(
            palette_storage_path({}, home, "linux"),
            home / ".local" / "share" / "HuePrint" / "saved-palettes.json",
        )
        self.assertEqual(
            palette_storage_path({"LOCALAPPDATA": "C:/Users/Winton/AppData/Local"}, home, "win32"),
            Path("C:/Users/Winton/AppData/Local") / "HuePrint" / "saved-palettes.json",
        )


if __name__ == "__main__": unittest.main()
