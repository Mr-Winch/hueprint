#!/usr/bin/env python3
"""Full HuePrint color harmony studio for Inkscape."""
import inkex
from hueprint_gui_v2 import Gtk, HuePrintDialog

class HuePrint(inkex.EffectExtension):
    def effect(self):
        dialog = HuePrintDialog()
        response = dialog.run()
        if response != Gtk.ResponseType.APPLY:
            dialog.destroy()
            return
        colors = dialog.generated_colors()
        for index, element in enumerate(self.svg.selection.values()):
            element.style[dialog.target.get_active_id()] = colors[index % len(colors)]
        if dialog.create.get_active():
            self._create_swatches(colors, dialog.rule_id())
        dialog.destroy()

    def _create_swatches(self, colors, label):
        size = self.svg.unittouu("18mm"); gap = self.svg.unittouu("2mm")
        x, y = self.svg.namedview.center
        x -= (len(colors) * size + (len(colors) - 1) * gap) / 2
        group = inkex.Group(); group.label = f"HuePrint - {label}"
        for index, color in enumerate(colors):
            swatch = inkex.Rectangle(x=str(x + index * (size + gap)), y=str(y), width=str(size), height=str(size))
            swatch.style = {"fill": color, "stroke": "none"}; swatch.label = color; group.add(swatch)
        self.svg.get_current_layer().add(group)

if __name__ == "__main__": HuePrint().run()
