import unittest
from pathlib import Path
from hueprint_palette import generate_palette, harmony_hues, hex_to_hls, hls_to_hex, palette_from_text, palette_storage_path, palette_to_gpl, sanitize_hex, swatch_text_color, translate_palette_geometry

class HuePrintPaletteTests(unittest.TestCase):
    def test_sanitizes_hex(self): self.assertEqual(sanitize_hex("36f"), "#3366FF")
    def test_swatch_text_uses_two_contrast_neutrals(self):
        self.assertEqual(swatch_text_color("#FFFFFF"), "#101114")
        self.assertEqual(swatch_text_color("#F6D32D"), "#101114")
        self.assertEqual(swatch_text_color("#000000"), "#F7F8FA")
        self.assertEqual(swatch_text_color("#24104F"), "#F7F8FA")
        self.assertEqual({swatch_text_color(color) for color in ("#FF0000", "#00FF00", "#0000FF")}, {"#101114", "#F7F8FA"})
    def test_saved_palette_geometry_moves_with_new_anchor(self):
        old_anchor = hls_to_hex(350, .50, .70)
        colors = [old_anchor, hls_to_hex(30, .60, .50), hls_to_hex(170, .40, .80), hls_to_hex(320, .52, .40)]
        new_anchor = hls_to_hex(70, .55, .60)
        translated = translate_palette_geometry(colors, old_anchor, new_anchor)
        self.assertEqual(len(translated), len(colors))
        self.assertEqual(translated[0], new_anchor)
        old_hue, old_lightness, _ = hex_to_hls(old_anchor); new_hue, new_lightness, _ = hex_to_hls(new_anchor)
        for before, after in zip(colors[1:], translated[1:]):
            before_hue, before_lightness, _ = hex_to_hls(before); after_hue, after_lightness, _ = hex_to_hls(after)
            before_offset = (before_hue - old_hue) % 360; after_offset = (after_hue - new_hue) % 360
            hue_error = abs((after_offset - before_offset + 180) % 360 - 180)
            self.assertLess(hue_error, 1.5)
            self.assertAlmostEqual(after_lightness - new_lightness, before_lightness - old_lightness, delta=.012)
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
        self.assertTrue(payload.startswith("GIMP Palette\nName: HuePrint Saved Swatches\n"))
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


    def test_saved_palette_chooser_contract(self):
        gui_path = Path(__file__).with_name("hueprint_gui_v2.py")
        if not gui_path.exists(): gui_path = Path(__file__).resolve().parent.parent / "hueprint_gui_v2.py"
        source = gui_path.read_text(encoding="utf-8")
        self.assertIn("class SavedPaletteBrowser", source)
        self.assertIn('self._row("Saved Palettes",self.saved_palette)', source)
        self.assertIn("def delete_saved_palette", source)
        self.assertIn("def retarget_custom_palette", source)
        self.assertIn("translate_palette_geometry(template,anchor,next_color)", source)
        self.assertIn("self.custom_palette_template=list(colors)", source)
        self.assertIn("self.custom_palette_anchor=colors[0]", source)
        self.assertIn("def select_palette_color", source)
        self.assertIn("self._color_widget(color,30,self.select_palette_color)", source)
        self.assertIn("ColorNameResolver", source)
        self.assertIn("self._swatch_tooltip(color", source)
        self.assertIn('(("NTC",ntc_name),("CN.org",colornames_name))', source)
        self.assertIn("Name this color ↗", source)
        self.assertIn("colornames_color_url(color)", source)
        self.assertIn("Color naming: NTC by Chirag Mehta", source)
        self.assertIn("SetCurrentProcessExplicitAppUserModelID", source)
        self.assertIn('GLib.set_application_name("HuePrint")', source)
        self.assertLess(source.index('GLib.set_application_name("HuePrint")'), source.index('from gi.repository import Gdk, GdkPixbuf, Gtk, Pango'))
        launcher = Path(__file__).with_name("hueprint.py").read_text(encoding="utf-8")
        self.assertLess(launcher.index("SetCurrentProcessExplicitAppUserModelID"), launcher.index("import inkex"))
        self.assertIn('self.set_role("HuePrint")', source)
        self.assertIn("SHGetPropertyStoreForWindow", source)
        self.assertIn("key=PROPERTYKEY(app_guid,5)", source)
        self.assertIn('HUEPRINT_APP_ID="MrWinch.HuePrint"', source)
        self.assertIn("self.popover.set_position(Gtk.PositionType.BOTTOM)", source)
        self.assertIn("scroll.set_min_content_width(740)", source)
        self.assertIn("scroll.set_min_content_height(500)", source)
        self.assertIn("self.grid.set_max_children_per_line(3)", source)
        self.assertIn("wrapper=Gtk.Overlay()", source)
        self.assertIn("button.set_size_request(220,142)", source)
        self.assertIn("wrapper.add_overlay(delete)", source)
        self.assertIn("label.set_ellipsize(Pango.EllipsizeMode.END)", source)
        self.assertNotIn("button.set_size_request(232,96)", source)
        self.assertNotIn('self._row("Named palettes"', source)
        self.assertNotIn("Current Palette ↑", source)
        self.assertIn("outer.set_size_request(74,34)", source)
        self.assertIn("label.set_markup(f\"<span foreground='#000000'>{color}</span>\")", source)
        self.assertIn("label.set_opacity(.6)", source)
        self.assertIn('remove=self._saved_swatch_icon("close"', source)
        self.assertIn('lambda:self.remove_saved(index),14,.6)', source)
        self.assertIn("arrows.set_opacity(.5 if visible else 0)", source)
        self.assertIn('getattr(event,"detail",None)==Gdk.NotifyType.INFERIOR', source)
        self.assertIn('self._saved_swatch_icon("left"', source)
        self.assertIn('self._saved_swatch_icon("right"', source)
        self.assertIn("arrows.set_sensitive(False)", source)
        self.assertNotIn("Gtk.Popover.new(menu)", source)
        self.assertNotIn("hueprint-swatch-menu", source)
        self.assertEqual(source.count("Add active color to Saved Swatches"), 1)
        self.assertIn("Color harmony &amp; palette studio", source)
        self.assertNotIn("Color harmony & palette studio", source)
        self.assertNotIn("item.pack_start(controls", source)

    def test_picker_consumes_the_selection_click(self):
        gui_path = Path(__file__).with_name("hueprint_gui_v2.py")
        if not gui_path.exists(): gui_path = Path(__file__).resolve().parent.parent / "hueprint_gui_v2.py"
        source = gui_path.read_text(encoding="utf-8")
        self.assertIn("SetWindowsHookExW", source)
        self.assertIn("self.swallow_release=True; return 1", source)
        self.assertIn("def take_click", source)
        self.assertIn("window.set_transient_for(self)", source)
        self.assertNotIn("left_state&1", source)

if __name__ == "__main__": unittest.main()
