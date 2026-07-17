"""Custom GTK interface for the HuePrint Inkscape extension."""
import colorsys
import json
import math
import os
from pathlib import Path

import gi
gi.require_version("Gtk", "3.0")
gi.require_version("Gdk", "3.0")
from gi.repository import Gdk, Gtk

from hueprint_palette import generate_palette, hex_to_hls, hls_to_hex, sanitize_hex
from hueprint_recipes import RECIPES, generate_recipe, hex_to_oklch

HARMONIES = [
    ("monochromatic", "Monochromatic"), ("analogous", "Analogous"),
    ("complementary", "Complementary"), ("split_complementary", "Split Complementary"),
    ("triadic", "Triadic"), ("square", "Square"),
    ("rectangle_tetradic", "Rectangle / Tetradic"), ("polygon", "Polygon / Equidistant"),
    ("tint", "Tint"), ("shade", "Shade"), ("tone", "Tone"),
]

def _rgba(value):
    color = Gdk.RGBA(); color.parse(sanitize_hex(value)); return color

def _palette_path():
    root = Path(os.environ.get("APPDATA", Path.home() / ".config")) / "inkscape"
    root.mkdir(parents=True, exist_ok=True)
    return root / "hueprint-palettes.json"

class ColorWheel(Gtk.DrawingArea):
    def __init__(self, owner):
        super().__init__(); self.owner = owner
        self.set_size_request(360, 360)
        self.add_events(Gdk.EventMask.BUTTON_PRESS_MASK | Gdk.EventMask.POINTER_MOTION_MASK | Gdk.EventMask.BUTTON1_MOTION_MASK)
        self.connect("draw", self.draw_wheel); self.connect("button-press-event", self.pick); self.connect("motion-notify-event", self.drag)

    def draw_wheel(self, _widget, cr):
        width, height = self.get_allocated_width(), self.get_allocated_height()
        cx, cy = width / 2, height / 2; outer = min(width, height) * .46; inner = outer * .53
        rings, segments = 12, 180
        for ring in range(rings):
            r1 = inner + (outer-inner)*ring/rings; r2 = inner + (outer-inner)*(ring+1)/rings + 1
            light = .28 + .52*(ring+.5)/rings
            for segment in range(segments):
                a1 = 2*math.pi*segment/segments; a2 = 2*math.pi*(segment+1)/segments + .01
                red, green, blue = colorsys.hls_to_rgb(segment/segments, light, .9)
                cr.set_source_rgb(red, green, blue); cr.set_line_width(r2-r1)
                cr.arc(cx, cy, (r1+r2)/2, a1, a2); cr.stroke()
        colors = self.owner.generated_colors()
        points = []
        for color in colors:
            hue, light, _sat = hex_to_hls(color); radius = inner + clamp01((light-.28)/.52)*(outer-inner)
            angle = math.radians(hue); points.append((cx+math.cos(angle)*radius, cy+math.sin(angle)*radius))
        if len(points) > 1:
            cr.set_source_rgba(1,1,1,.72); cr.set_line_width(2)
            cr.move_to(*points[0])
            for point in points[1:]: cr.line_to(*point)
            if self.owner.rule_id() in {"triadic","square","rectangle_tetradic","polygon"}: cr.close_path()
            cr.stroke()
        for index, (x,y) in enumerate(points):
            cr.set_source_rgb(1,1,1); cr.arc(x,y,7 if index else 9,0,2*math.pi); cr.fill_preserve()
            cr.set_source_rgb(.08,.08,.1); cr.set_line_width(2); cr.stroke()
        cr.set_source_rgba(.08,.09,.12,1); cr.arc(cx,cy,inner-3,0,2*math.pi); cr.fill()
        cr.set_source_rgb(1,1,1); cr.select_font_face("Sans"); cr.set_font_size(15)
        label = self.owner.color.upper(); ext = cr.text_extents(label); cr.move_to(cx-ext.width/2,cy+5); cr.show_text(label)
        return False

    def _set_from_event(self, event):
        width, height = self.get_allocated_width(), self.get_allocated_height(); cx,cy=width/2,height/2
        outer=min(width,height)*.46; inner=outer*.53; dx,dy=event.x-cx,event.y-cy; radius=math.hypot(dx,dy)
        if inner <= radius <= outer:
            hue = math.degrees(math.atan2(dy,dx)) % 360; light=.28+.52*clamp01((radius-inner)/(outer-inner))
            _h,_l,sat=hex_to_hls(self.owner.color); self.owner.set_color(hls_to_hex(hue,light,max(.35,sat)))
    def pick(self, _widget, event): self._set_from_event(event); return True
    def drag(self, _widget, event):
        if event.state & Gdk.ModifierType.BUTTON1_MASK: self._set_from_event(event)
        return True

def clamp01(value): return min(1,max(0,value))

class HuePrintDialog(Gtk.Dialog):
    def __init__(self):
        super().__init__(title="HuePrint", flags=0)
        self.set_default_size(920, 720); self.set_resizable(True)
        self.add_button("Cancel", Gtk.ResponseType.CANCEL); self.add_button("Apply to Inkscape", Gtk.ResponseType.APPLY)
        self.color = "#2F80ED"; self.saved = self._load_saved()
        self._build(); self.refresh()

    def _build(self):
        root=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=22); root.set_border_width(18)
        self.get_content_area().pack_start(root,True,True,0)
        left=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=12); right=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=10)
        root.pack_start(left,True,True,0); root.pack_start(right,False,False,0)
        self.wheel=ColorWheel(self); left.pack_start(self.wheel,True,True,0)
        self.swatches=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=5); left.pack_start(self.swatches,False,False,0)
        self.info=Gtk.Label(); self.info.set_xalign(0); self.info.set_selectable(True); left.pack_start(self.info,False,False,0)
        buttons=Gtk.Box(spacing=6); left.pack_start(buttons,False,False,0)
        add=Gtk.Button(label="Save generated palette"); add.connect("clicked",self.save_generated); buttons.pack_start(add,False,False,0)
        imp=Gtk.Button(label="Import"); imp.connect("clicked",self.import_palette); buttons.pack_start(imp,False,False,0)
        exp=Gtk.Button(label="Export"); exp.connect("clicked",self.export_palette); buttons.pack_start(exp,False,False,0)
        self.saved_box=Gtk.FlowBox(); self.saved_box.set_max_children_per_line(10); self.saved_box.set_selection_mode(Gtk.SelectionMode.NONE)
        saved_scroll=Gtk.ScrolledWindow(); saved_scroll.set_size_request(-1,100); saved_scroll.add(self.saved_box); left.pack_start(saved_scroll,False,False,0)

        title=Gtk.Label(); title.set_markup("<span size='x-large' weight='bold'>HuePrint</span>\nColor harmony studio for Inkscape"); title.set_xalign(0); right.pack_start(title,False,False,6)
        self.color_entry=Gtk.Entry(); self.color_entry.set_text(self.color); self.color_entry.connect("activate",self.entry_changed)
        color_row=self._row("Active color",self.color_entry); choose=Gtk.ColorButton(rgba=_rgba(self.color)); choose.connect("color-set",self.color_chosen); color_row.pack_start(choose,False,False,0); self.color_button=choose
        right.pack_start(color_row,False,False,0)
        self.harmony=Gtk.ComboBoxText(); [self.harmony.append(i,label) for i,label in HARMONIES]; self.harmony.set_active_id("analogous"); self.harmony.connect("changed",self.control_changed); right.pack_start(self._row("Harmony",self.harmony),False,False,0)
        self.count=Gtk.SpinButton.new_with_range(2,8,1); self.count.set_value(5); self.count.connect("value-changed",self.control_changed); right.pack_start(self._row("Swatches",self.count),False,False,0)
        self.recipe=Gtk.ComboBoxText(); [self.recipe.append(i,data[0]) for i,data in RECIPES.items()]; self.recipe.set_active_id("none"); self.recipe.connect("changed",self.control_changed); right.pack_start(self._row("Palette recipe",self.recipe),False,False,0)
        sep=Gtk.Separator(); right.pack_start(sep,False,False,8)
        self.target=Gtk.ComboBoxText(); self.target.append("fill","Fill selected objects"); self.target.append("stroke","Stroke selected objects"); self.target.set_active_id("fill"); right.pack_start(self._row("Apply colors to",self.target),False,False,0)
        self.create=Gtk.CheckButton(label="Create palette swatches on canvas"); self.create.set_active(True); right.pack_start(self.create,False,False,0)
        note=Gtk.Label(label="Tip: click or drag around the donut to choose hue and lightness. Click any generated or saved swatch to make it active."); note.set_line_wrap(True); note.set_max_width_chars(34); note.set_xalign(0); right.pack_start(note,False,False,12)
        self.show_all()

    def _row(self,label,widget):
        box=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=3); text=Gtk.Label(label=label); text.set_xalign(0); box.pack_start(text,False,False,0); box.pack_start(widget,False,False,0); return box
    def rule_id(self): return self.harmony.get_active_id() or "analogous"
    def generated_colors(self):
        recipe=self.recipe.get_active_id() if hasattr(self,"recipe") else "none"
        return generate_recipe(self.color,recipe) if recipe and recipe != "none" else generate_palette(self.color,self.rule_id(),int(self.count.get_value()) if hasattr(self,"count") else 5)
    def set_color(self,color):
        self.color=sanitize_hex(color); self.color_entry.set_text(self.color); self.color_button.set_rgba(_rgba(self.color)); self.refresh()
    def entry_changed(self,entry): self.set_color(entry.get_text())
    def color_chosen(self,button):
        rgba=button.get_rgba(); self.set_color("#%02X%02X%02X"%(round(rgba.red*255),round(rgba.green*255),round(rgba.blue*255)))
    def control_changed(self,*_args): self.refresh()
    def refresh(self):
        if not hasattr(self,"swatches"): return
        for child in self.swatches.get_children(): self.swatches.remove(child)
        colors=self.generated_colors()
        for color in colors: self.swatches.pack_start(self._swatch(color,54,True),True,True,0)
        h,l,s=hex_to_hls(self.color); r,g,b=[int(self.color[i:i+2],16) for i in (1,3,5)]
        rn,gn,bn=r/255,g/255,b/255; k=1-max(rn,gn,bn)
        if k >= .999: c=m=y=0
        else: c=(1-rn-k)/(1-k); m=(1-gn-k)/(1-k); y=(1-bn-k)/(1-k)
        ok_l,ok_c,ok_h=hex_to_oklch(self.color)
        self.info.set_markup(
            f"<b>Active color details</b>\n"
            f"HEX  {self.color}     RGB  {r}, {g}, {b}     CMYK  {round(c*100)}%, {round(m*100)}%, {round(y*100)}%, {round(k*100)}%\n"
            f"HSL  {round(h)}°, {round(s*100)}%, {round(l*100)}%     OKLCH  {ok_l:.3f}, {ok_c:.3f}, {round(ok_h)}°")
        self.swatches.show_all(); self.wheel.queue_draw(); self._render_saved()
    def _swatch(self,color,height,clickable=False):
        event=Gtk.EventBox(); event.set_tooltip_text(color)
        area=Gtk.DrawingArea(); area.set_size_request(38,height)
        red,green,blue=[int(color[index:index+2],16)/255 for index in (1,3,5)]
        def draw_swatch(widget,cr):
            cr.set_source_rgb(red,green,blue); cr.rectangle(0,0,widget.get_allocated_width(),widget.get_allocated_height()); cr.fill(); return False
        area.connect("draw",draw_swatch); event.add(area)
        if clickable: event.connect("button-press-event",lambda *_: self.set_color(color))
        return event
    def _render_saved(self):
        if not hasattr(self,"saved_box"): return
        for child in self.saved_box.get_children(): self.saved_box.remove(child)
        for color in self.saved: self.saved_box.add(self._swatch(color,34,True))
        self.saved_box.show_all()
    def _load_saved(self):
        try:
            data=json.loads(_palette_path().read_text(encoding="utf-8")); return [sanitize_hex(c) for c in data if isinstance(c,str)]
        except (OSError,ValueError,TypeError): return []
    def _save_saved(self):
        try: _palette_path().write_text(json.dumps(self.saved,indent=2),encoding="utf-8")
        except OSError: pass
    def save_generated(self,*_args):
        for color in self.generated_colors():
            if color not in self.saved: self.saved.append(color)
        self._save_saved(); self._render_saved()
    def import_palette(self,*_args):
        chooser=Gtk.FileChooserDialog(title="Import HuePrint palette",parent=self,action=Gtk.FileChooserAction.OPEN,buttons=("Cancel",Gtk.ResponseType.CANCEL,"Import",Gtk.ResponseType.OK))
        if chooser.run()==Gtk.ResponseType.OK:
            try:
                data=json.loads(Path(chooser.get_filename()).read_text(encoding="utf-8")); colors=data.get("colors",data) if isinstance(data,dict) else data
                self.saved=[sanitize_hex(c) for c in colors if isinstance(c,str)]; self._save_saved(); self._render_saved()
            except (OSError,ValueError,TypeError): self._error("That file is not a valid HuePrint palette.")
        chooser.destroy()
    def export_palette(self,*_args):
        chooser=Gtk.FileChooserDialog(title="Export HuePrint palette",parent=self,action=Gtk.FileChooserAction.SAVE,buttons=("Cancel",Gtk.ResponseType.CANCEL,"Export",Gtk.ResponseType.OK)); chooser.set_current_name("hueprint-palette.json"); chooser.set_do_overwrite_confirmation(True)
        if chooser.run()==Gtk.ResponseType.OK:
            try: Path(chooser.get_filename()).write_text(json.dumps({"name":"HuePrint Palette","colors":self.generated_colors()},indent=2),encoding="utf-8")
            except OSError: self._error("HuePrint could not save the palette there.")
        chooser.destroy()
    def _error(self,message):
        alert=Gtk.MessageDialog(parent=self,flags=0,message_type=Gtk.MessageType.ERROR,buttons=Gtk.ButtonsType.OK,text=message); alert.run(); alert.destroy()
