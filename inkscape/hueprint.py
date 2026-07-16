#!/usr/bin/env python3
"""HuePrint effect extension for Inkscape 1.2+."""
import inkex
from hueprint_palette import generate_palette

class HuePrint(inkex.EffectExtension):
    def add_arguments(self, pars):
        pars.add_argument("--base_color", type=inkex.Color, default=inkex.Color("#2F80ED"))
        pars.add_argument("--harmony", default="analogous")
        pars.add_argument("--count", type=int, default=5)
        pars.add_argument("--target", default="fill")
        pars.add_argument("--create_swatches", type=inkex.Boolean, default=True)
        pars.add_argument("--swatch_size", type=float, default=18.0)
        pars.add_argument("--gap", type=float, default=2.0)

    def effect(self):
        base_color = str(self.options.base_color)
        if not base_color.startswith("#"):
            base_color = f"#{int(self.options.base_color) >> 8:06X}"
        colors = generate_palette(base_color, self.options.harmony, self.options.count)
        for index, element in enumerate(self.svg.selection.values()):
            element.style[self.options.target] = colors[index % len(colors)]
        if self.options.create_swatches:
            self._create_swatches(colors)

    def _create_swatches(self, colors):
        size = self.svg.unittouu(f"{max(1, self.options.swatch_size)}mm")
        gap = self.svg.unittouu(f"{max(0, self.options.gap)}mm")
        x, y = self.svg.namedview.center
        x -= (len(colors) * size + (len(colors) - 1) * gap) / 2
        group = inkex.Group()
        group.label = f"HuePrint - {self.options.harmony}"
        for index, color in enumerate(colors):
            swatch = inkex.Rectangle(x=str(x + index * (size + gap)), y=str(y), width=str(size), height=str(size))
            swatch.style = {"fill": color, "stroke": "none"}
            swatch.label = color
            group.add(swatch)
        self.svg.get_current_layer().add(group)

if __name__ == "__main__":
    HuePrint().run()
