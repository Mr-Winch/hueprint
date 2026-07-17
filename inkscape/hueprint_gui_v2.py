"""HuePrint GTK interface: responsive metadata, collision-safe geometry, palettes."""
import colorsys, json, math, os, random, xml.etree.ElementTree as ET
from pathlib import Path
import gi
gi.require_version("Gtk","3.0"); gi.require_version("Gdk","3.0"); gi.require_version("GdkPixbuf","2.0")
from gi.repository import Gdk, GdkPixbuf, GLib, Gtk
from hueprint_palette import generate_palette, hex_to_hls, hls_to_hex, sanitize_hex
from hueprint_recipes import RECIPES, generate_recipe, hex_to_oklch
from hueprint_recipe_metadata import CATEGORY_LABELS, CATEGORY_ORDER, RECIPE_IDS_BY_CATEGORY, RECIPE_METADATA, RECIPE_METADATA_BY_ID

HARMONIES = [
 ("monochromatic","Monochromatic","One hue with a balanced light-to-dark range."),
 ("analogous","Analogous","Neighboring hues for a calm, cohesive palette."),
 ("complementary","Complementary","Opposing hues paired across the wheel."),
 ("split_complementary","Split Complementary","An anchor plus the two neighbors of its opposite."),
 ("triadic","Triadic","Three hue families separated by 120 degrees."),
 ("square","Square","Four hue families separated by 90 degrees."),
 ("rectangle_tetradic","Rectangle / Tetradic","Two complementary pairs in a rectangular harmony."),
 ("polygon","Polygon / Equidistant","Evenly spaces every swatch around the wheel."),
 ("tint","Tint","Mixes the active color toward white."),
 ("shade","Shade","Mixes the active color toward black."),
 ("tone","Tone","Reduces saturation while preserving lightness."),
]
def _rgba(value):
    color=Gdk.RGBA(); color.parse(sanitize_hex(value)); return color
def _palette_path():
    root=Path(os.environ.get("APPDATA",Path.home()/".config"))/"inkscape"; root.mkdir(parents=True,exist_ok=True)
    return root/"hueprint-palettes.json"
def _inkscape_prefers_dark():
    try:
        preferences=Path(os.environ.get("APPDATA",Path.home()/".config"))/"inkscape"/"preferences.xml"
        theme=ET.parse(preferences).getroot().find(".//*[@id='theme']")
        if theme is not None:return theme.get("preferDarkTheme",theme.get("darkTheme","0"))=="1"
    except (OSError,ET.ParseError):pass
    settings=Gtk.Settings.get_default(); return bool(settings and settings.get_property("gtk-application-prefer-dark-theme"))
def _clamp(value,low=0,high=1): return min(high,max(low,value))
def _distance(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])

SVG_ICONS = {
 "dropper":"<path d='M19 3l2 2-9.5 9.5-3-3zM8.5 11.5l-4.7 4.7-.8 4.8 4.8-.8 4.7-4.7' fill='none'/>",
 "copy":"<rect x='8' y='8' width='11' height='11' rx='2' fill='none'/><path d='M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' fill='none'/>",
 "check":"<path d='M5 12.5l4.2 4.2L19 7' fill='none'/>",
 "add":"<path d='M12 5v14M5 12h14' fill='none'/>",
 "minus":"<path d='M5 12h14' fill='none'/>",
 "random":"<path d='M4 7h3c4 0 5 10 9 10h4M16 13l4 4-4 4M4 17h3c1.8 0 3-2 4-4M13 7h7M16 3l4 4-4 4' fill='none'/>",
 "palette":"<path d='M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-1a1.8 1.8 0 0 1 0-3.6H16A5 5 0 0 0 21 9c0-3.3-4-6-9-6z' fill='none'/><circle cx='8' cy='8' r='1'/><circle cx='12' cy='6.5' r='1'/><circle cx='16' cy='8.5' r='1'/>",
 "import":"<path d='M12 3v12M7 10l5 5 5-5M4 20h16' fill='none'/>",
 "export":"<path d='M12 17V5M7 10l5-5 5 5M4 20h16' fill='none'/>",
 "trash":"<path d='M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 10v7M14 10v7' fill='none'/>",
 "left":"<path d='M15 5l-7 7 7 7' fill='none'/>",
 "right":"<path d='M9 5l7 7-7 7' fill='none'/>",
 "close":"<path d='M6 6l12 12M18 6L6 18' fill='none'/>",
 "moon":"<path d='M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z' fill='none'/>",
 "sun":"<circle cx='12' cy='12' r='4' fill='none'/><path d='M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4' fill='none'/>",
}
def _svg_image(name,size=17):
    settings=Gtk.Settings.get_default(); dark=bool(settings and settings.get_property("gtk-application-prefer-dark-theme")); stroke="#A9D4FF" if dark else "#245D91"
    body=SVG_ICONS[name]; svg=f"<svg xmlns='http://www.w3.org/2000/svg' width='{size}' height='{size}' viewBox='0 0 24 24'><g stroke='{stroke}' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>{body}</g></svg>"
    loader=GdkPixbuf.PixbufLoader.new_with_type("svg"); loader.set_size(size,size); loader.write(svg.encode("utf-8")); loader.close()
    return Gtk.Image.new_from_pixbuf(loader.get_pixbuf())
def _set_icon(button,name,size=17):
    button.hueprint_icon=name; button.hueprint_icon_size=size; button.set_image(_svg_image(name,size)); button.set_always_show_image(True)

class DescribedChooser(Gtk.MenuButton):
    def __init__(self,items,columns=1):
        super().__init__(); self.items={item[0]:item for item in items}; self.active_id=None; self.callbacks=[]
        self.label=Gtk.Label(); self.add(self.label); popover=Gtk.Popover.new(self); scroll=Gtk.ScrolledWindow(); scroll.set_policy(Gtk.PolicyType.NEVER,Gtk.PolicyType.AUTOMATIC); rows=math.ceil(len(items)/columns); scroll.set_min_content_height(min(420,rows*40+18)); scroll.set_max_content_height(420); scroll.set_min_content_width(270 if columns==1 else 520); scroll.set_propagate_natural_height(True)
        grid=Gtk.Grid(); grid.set_row_spacing(3); grid.set_column_spacing(3); grid.set_border_width(6)
        for index,(item_id,label,description) in enumerate(items):
            button=Gtk.Button(label=label); button.set_relief(Gtk.ReliefStyle.NONE); button.set_tooltip_text(description); button.connect("clicked",self.select,item_id); grid.attach(button,index%columns,index//columns,1,1)
        scroll.add(grid); popover.add(scroll); self.set_popover(popover); popover.show_all(); popover.hide()
    def select(self,_button,item_id): self.set_active_id(item_id); self.get_popover().popdown()
    def set_active_id(self,item_id):
        if item_id not in self.items:return False
        changed=item_id!=self.active_id; self.active_id=item_id; self.label.set_text(self.items[item_id][1])
        if changed:
            for callback in self.callbacks:callback(self)
        return True
    def get_active_id(self):return self.active_id
    def connect_changed(self,callback):self.callbacks.append(callback)
class RecipeBrowser(Gtk.MenuButton):
    FILTERS = ("all", "tonal", "accent", "spectrum", "contrast", "systems")
    def __init__(self,owner):
        super().__init__(); self.owner=owner; self.active_id=None; self.callbacks=[]; self.buttons={}; self.indicators={}; self.previews={}; self.preview_cache={}; self.sections={}; self.syncing=False
        self.label=Gtk.Label(); self.add(self.label); popover=Gtk.Popover.new(self); outer=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=8); outer.set_border_width(10)
        support=Gtk.Label(label="Choose how HuePrint develops colors from your base color."); support.set_xalign(0); outer.pack_start(support,False,False,0)
        filters=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=4); group=None; self.filter_buttons={}
        for filter_id in self.FILTERS:
            button=Gtk.RadioButton.new_with_label_from_widget(group,CATEGORY_LABELS.get(filter_id,"All")); group=group or button; button.set_mode(False); button.connect("toggled",self.filter_changed,filter_id); filters.pack_start(button,False,False,0); self.filter_buttons[filter_id]=button
        self.filter_buttons["all"].set_active(True); random_button=owner._icon_button("random","Generate a random base color and palette recipe",self.random_palette,28); filters.pack_start(random_button,False,False,0); outer.pack_start(filters,False,False,0)
        scroll=Gtk.ScrolledWindow(); scroll.set_policy(Gtk.PolicyType.NEVER,Gtk.PolicyType.AUTOMATIC); scroll.set_min_content_width(740); scroll.set_max_content_width(760); scroll.set_propagate_natural_width(True); scroll.set_min_content_height(500); scroll.set_max_content_height(560)
        content=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=10); content.set_border_width(2)
        manual_box=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=4); manual_title=Gtk.Label(); manual_title.set_markup("<span weight='bold'>Manual</span>"); manual_title.set_xalign(0); manual_box.pack_start(manual_title,False,False,0); manual_box.pack_start(self.make_card("none",compact=True),False,False,0); content.pack_start(manual_box,False,False,0)
        for category in CATEGORY_ORDER[1:]:
            section=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=4); heading=Gtk.Label(); heading.set_markup(f"<span size='large' weight='bold'>{CATEGORY_LABELS[category]}</span>"); heading.set_xalign(0); section.pack_start(heading,False,False,0)
            grid=Gtk.FlowBox(); grid.set_selection_mode(Gtk.SelectionMode.NONE); grid.set_column_spacing(6); grid.set_row_spacing(6); grid.set_min_children_per_line(1); grid.set_max_children_per_line(3); grid.set_homogeneous(True)
            for recipe_id in RECIPE_IDS_BY_CATEGORY[category]:grid.add(self.make_card(recipe_id))
            section.pack_start(grid,False,False,0); content.pack_start(section,False,False,0); self.sections[category]=section
        scroll.add(content); outer.pack_start(scroll,True,True,0); popover.add(outer); self.set_popover(popover); popover.show_all(); popover.hide(); self.set_active_id("none"); self.refresh_previews()
    def make_card(self,recipe_id,compact=False):
        meta=RECIPE_METADATA_BY_ID[recipe_id]; button=Gtk.ToggleButton(); button.set_relief(Gtk.ReliefStyle.NORMAL); button.set_hexpand(True); button.set_size_request(220,82 if compact else 142); button.connect("clicked",self.select,recipe_id)
        character=GLib.markup_escape_text(meta.character); description=GLib.markup_escape_text(meta.description); button.set_tooltip_markup(f"<span line_height='0.95'><span size='large' weight='bold'>{character}</span>\n<span size='small'>{description}</span></span>")
        accessible=button.get_accessible()
        if hasattr(accessible,"set_name"):accessible.set_name(meta.display_name)
        if hasattr(accessible,"set_description"):accessible.set_description(f"Preview of the {meta.display_name} palette generated from the current base color. {meta.character} {meta.description}")
        box=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=4); preview=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=1); preview.set_homogeneous(True); box.pack_start(preview,False,False,0); self.previews[recipe_id]=preview
        heading=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=4); name=Gtk.Label(); name.set_markup(f"<span weight='bold'>{GLib.markup_escape_text(meta.display_name)}</span>"); name.set_xalign(0); heading.pack_start(name,True,True,0); indicator=Gtk.Label(label="✓"); indicator.set_tooltip_text("Selected recipe"); heading.pack_end(indicator,False,False,0); box.pack_start(heading,False,False,0); self.indicators[recipe_id]=indicator
        if not compact:
            tone=Gtk.Label(); tone.set_markup(f"<span line_height='0.95'><span size='small' weight='bold'>{character}</span></span>"); tone.set_xalign(0); tone.set_line_wrap(True); tone.set_max_width_chars(34); box.pack_start(tone,False,False,0)
            detail=Gtk.Label(); detail.set_markup(f"<span line_height='0.95'><span size='small'>{description}</span></span>"); detail.set_xalign(0); detail.set_line_wrap(True); detail.set_max_width_chars(34); box.pack_start(detail,False,False,0)
        button.add(box); self.buttons[recipe_id]=button; return button
    def preview_colors(self,recipe_id):
        key=(self.owner.color,recipe_id)
        if key not in self.preview_cache:
            self.preview_cache[key]=[self.owner.color] if recipe_id=="none" else generate_recipe(self.owner.color,recipe_id)
            if len(self.preview_cache)>160:self.preview_cache={key:self.preview_cache[key]}
        return self.preview_cache[key]
    def refresh_previews(self):
        for recipe_id,preview in self.previews.items():
            colors=self.preview_colors(recipe_id); children=preview.get_children()
            if len(children)!=len(colors):
                for child in children:preview.remove(child)
                for color in colors:
                    area=Gtk.DrawingArea(); area.set_size_request(12,18); area.hueprint_color=color; area.connect("draw",self.draw_preview); preview.pack_start(area,True,True,0)
            else:
                for area,color in zip(children,colors):area.hueprint_color=color; area.queue_draw()
        self.get_popover().show_all(); self.apply_filter()
        for item_id,indicator in self.indicators.items():indicator.set_visible(item_id==self.active_id)
        self.get_popover().hide()
    @staticmethod
    def draw_preview(area,cr):
        color=Gdk.RGBA(); color.parse(area.hueprint_color); cr.set_source_rgba(color.red,color.green,color.blue,1); cr.rectangle(0,0,area.get_allocated_width(),area.get_allocated_height()); cr.fill(); return False
    def select(self,_button,recipe_id):
        if self.syncing:return
        self.set_active_id(recipe_id); self.get_popover().popdown()
    def set_active_id(self,recipe_id):
        if recipe_id not in RECIPE_METADATA_BY_ID:return False
        changed=recipe_id!=self.active_id; self.active_id=recipe_id; self.label.set_text(RECIPE_METADATA_BY_ID[recipe_id].display_name); self.syncing=True
        try:
            for item_id,button in self.buttons.items():button.set_active(item_id==recipe_id); self.indicators[item_id].set_visible(item_id==recipe_id)
        finally:self.syncing=False
        if changed:
            for callback in self.callbacks:callback(self)
        return True
    def get_active_id(self):return self.active_id
    def connect_changed(self,callback):self.callbacks.append(callback)
    def filter_changed(self,button,filter_id):
        if button.get_active():self.current_filter=filter_id; self.apply_filter()
    def random_palette(self,*_args):
        chooser=random.SystemRandom(); recipe_id=chooser.choice([item.id for item in RECIPE_METADATA if item.id!="none"]); self.set_active_id(recipe_id); self.owner.set_color("#%06X"%chooser.randrange(0x1000000)); self.get_popover().popdown()
    def apply_filter(self):
        current=getattr(self,"current_filter","all")
        for category,section in self.sections.items():section.set_visible(current=="all" or current==category)
class CompactCount(Gtk.Box):
    def __init__(self,owner,minimum=2,maximum=8,value=5):
        super().__init__(orientation=Gtk.Orientation.HORIZONTAL,spacing=1); self.minimum=minimum; self.maximum=maximum; self.value=value; self.callbacks=[]
        self.minus=owner._icon_button("minus","Remove one swatch",lambda *_:self.set_value(self.value-1),28); self.pack_start(self.minus,False,False,0)
        self.entry=Gtk.Entry(); self.entry.set_width_chars(1); self.entry.set_max_width_chars(1); self.entry.set_size_request(24,30); self.entry.set_alignment(.5); self.entry.set_text(str(value)); self.entry.connect("activate",self.commit); self.entry.connect("focus-out-event",self.commit); self.pack_start(self.entry,False,False,0)
        self.plus=owner._icon_button("add","Add one swatch",lambda *_:self.set_value(self.value+1),28); self.pack_start(self.plus,False,False,0)
    def get_value(self):return self.value
    def set_value(self,value):
        next_value=max(self.minimum,min(self.maximum,int(round(value)))); changed=next_value!=self.value; self.value=next_value; self.entry.set_text(str(next_value)); self.minus.set_sensitive(next_value>self.minimum); self.plus.set_sensitive(next_value<self.maximum)
        if changed:
            for callback in self.callbacks:callback(self)
    def connect_changed(self,callback):self.callbacks.append(callback)
    def commit(self,*_args):
        try:self.set_value(int(self.entry.get_text()))
        except ValueError:self.entry.set_text(str(self.value))
        return False
class ColorWheel(Gtk.DrawingArea):
    LIGHT_MIN=.08; LIGHT_MAX=.92
    def __init__(self,owner):
        super().__init__(); self.owner=owner; self.set_size_request(320,320)
        self.add_events(Gdk.EventMask.BUTTON_PRESS_MASK|Gdk.EventMask.POINTER_MOTION_MASK|Gdk.EventMask.BUTTON1_MOTION_MASK)
        self.connect("draw",self.draw_wheel); self.connect("button-press-event",self.pick); self.connect("motion-notify-event",self.drag)
    def metrics(self):
        size=min(self.get_allocated_width(),self.get_allocated_height()); outer=size*.46; inner=outer*.65
        return self.get_allocated_width()/2,self.get_allocated_height()/2,inner,outer
    def color_point(self,color,cx,cy,inner,outer):
        hue,light,_sat=hex_to_hls(color); t=_clamp((light-self.LIGHT_MIN)/(self.LIGHT_MAX-self.LIGHT_MIN)); radius=inner+(outer-inner)*t
        angle=math.radians(hue); return {"color":color,"hue":hue,"radius":radius,"angle":angle,"x":cx+math.cos(angle)*radius,"y":cy+math.sin(angle)*radius}
    def resolve_collisions(self,points,cx,cy,inner,outer,fixed_index=None):
        placed=[]; resolved=[None]*len(points); order=list(range(len(points)))
        if fixed_index is not None:order.remove(fixed_index); order.insert(0,fixed_index)
        for index in order:
            point=points[index]; candidate=dict(point); attempt=0
            while any(_distance((candidate["x"],candidate["y"]),(other["x"],other["y"]))<19 for other in placed) and attempt<40:
                step=(attempt//2+1)*math.radians(5); angle=point["angle"]+(step if attempt%2 else -step)
                radius=_clamp(point["radius"]+((attempt%3)-1)*3,inner+2,outer-2)
                candidate.update(angle=angle,radius=radius,x=cx+math.cos(angle)*radius,y=cy+math.sin(angle)*radius); attempt+=1
            resolved[index]=candidate; placed.append(candidate)
        return resolved
    def connectors(self,points):
        if len(points)<2 or (not self.owner.recipe_active() and self.owner.rule_id() in {"tint","shade","tone","monochromatic"}): return []
        # Collision resolution may move repeated hues slightly; order by the final
        # polar angle so the perimeter cannot self-intersect.
        center_x=sum(p["x"] for p in points)/len(points); center_y=sum(p["y"] for p in points)/len(points)
        ordered=sorted(points,key=lambda p:math.atan2(p["y"]-center_y,p["x"]-center_x)); pairs=list(zip(ordered,ordered[1:]))
        if len(ordered)>2: pairs.append((ordered[-1],ordered[0]))
        return pairs
    def draw_wheel(self,_widget,cr):
        cx,cy,inner,outer=self.metrics(); rings,segments=14,180
        for ring in range(rings):
            r1=inner+(outer-inner)*ring/rings; r2=inner+(outer-inner)*(ring+1)/rings+1
            light=self.LIGHT_MIN+(self.LIGHT_MAX-self.LIGHT_MIN)*(ring+.5)/rings
            for segment in range(segments):
                a1=2*math.pi*segment/segments; a2=2*math.pi*(segment+1)/segments+.01
                red,green,blue=colorsys.hls_to_rgb(segment/segments,light,.9); cr.set_source_rgb(red,green,blue); cr.set_line_width(r2-r1); cr.arc(cx,cy,(r1+r2)/2,a1,a2); cr.stroke()
        # Paint the hole first so connectors remain fully visible over it.
        cr.set_source_rgb(*self.owner.background_rgb()); cr.arc(cx,cy,inner-2,0,2*math.pi); cr.fill()
        generated=self.owner.generated_colors(); raw=[self.color_point(color,cx,cy,inner,outer) for color in generated]
        exact=next((i for i,color in enumerate(generated) if color.upper()==self.owner.color.upper()),None); active_point=self.color_point(self.owner.color,cx,cy,inner,outer); points=self.resolve_collisions(raw,cx,cy,inner,outer,exact)
        fg=(.96,.96,.98) if self.owner.dark_mode() else (.08,.09,.12); outline=(.08,.09,.12) if self.owner.dark_mode() else (.98,.98,.98); connectors=self.connectors(points)
        cr.set_line_cap(1)
        for color,width,alpha in ((outline,3.4,.76),(fg,1.45,1)):
            cr.set_source_rgba(*color,alpha); cr.set_line_width(width)
            for start,end in connectors: cr.move_to(start["x"],start["y"]); cr.line_to(end["x"],end["y"]); cr.stroke()
        for index,point in enumerate(points):
            is_active=index==exact; marker_color=self.owner.color if is_active else point["color"]; radius=11 if is_active else 6.8; red,green,blue=[int(marker_color[i:i+2],16)/255 for i in (1,3,5)]; border=2 if is_active else 1.7
            cr.set_source_rgb(*fg); cr.arc(point["x"],point["y"],radius+border,0,2*math.pi); cr.fill(); cr.set_source_rgb(red,green,blue); cr.arc(point["x"],point["y"],radius,0,2*math.pi); cr.fill()
        if exact is None:
            red,green,blue=[int(self.owner.color[i:i+2],16)/255 for i in (1,3,5)]; cr.set_source_rgb(*fg); cr.arc(active_point["x"],active_point["y"],13,0,2*math.pi); cr.fill(); cr.set_source_rgb(red,green,blue); cr.arc(active_point["x"],active_point["y"],11,0,2*math.pi); cr.fill()
        return False
    def _set(self,event):
        cx,cy,inner,outer=self.metrics(); dx,dy=event.x-cx,event.y-cy; distance=math.hypot(dx,dy)
        if inner<=distance<=outer:
            hue=math.degrees(math.atan2(dy,dx))%360; light=self.LIGHT_MIN+(self.LIGHT_MAX-self.LIGHT_MIN)*_clamp((distance-inner)/(outer-inner))
            _h,_l,sat=hex_to_hls(self.owner.color); self.owner.set_color(hls_to_hex(hue,light,max(.35,sat)))
    def pick(self,_widget,event): self._set(event); return True
    def drag(self,_widget,event):
        if event.state&Gdk.ModifierType.BUTTON1_MASK:self._set(event)
        return True

class HuePrintDialog(Gtk.Dialog):
    def __init__(self):
        super().__init__(title="HuePrint © — Version 1",flags=0); self.set_default_size(1,900); self.set_resizable(True)
        self.add_button("Cancel",Gtk.ResponseType.CANCEL); self.add_button("Apply",Gtk.ResponseType.APPLY)
        self.color="#2F80ED"; self.saved=self._load_saved(); self.updating_lightness=False; self.icon_buttons=[]; self.hairline_provider=Gtk.CssProvider(); self.lightness_provider=Gtk.CssProvider(); self.initial_dark=_inkscape_prefers_dark(); settings=Gtk.Settings.get_default()
        if settings:settings.set_property("gtk-application-prefer-dark-theme",self.initial_dark)
        self._build(); self.refresh()
    def described_combo(self,items,wrap=0):return DescribedChooser(items,wrap or 1)
    def _build(self):
        root=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=8); root.set_border_width(14); self.get_content_area().pack_start(root,True,True,0)
        header=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=8)
        title=Gtk.Label(); title.set_markup("<span line_height='0.95'><span size='28000' weight='bold' foreground='#FFFFFF'>HuePrint ©</span>\n<span size='small'>Color harmony studio · Version 1 · © 2026 Winton Diaz Dauhajre</span>\n<span size='small'>Hover over any harmony or recipe for details. Drag the donut to change hue and lightness.</span></span>"); title.set_xalign(0); header.pack_start(title,True,True,0)
        self.theme_toggle=Gtk.ToggleButton(); self.theme_toggle.set_size_request(36,36); self.theme_toggle.set_valign(Gtk.Align.CENTER); self.theme_toggle.set_active(self.initial_dark); _set_icon(self.theme_toggle,"sun" if self.theme_toggle.get_active() else "moon"); self.theme_toggle.connect("toggled",self.theme_changed); header.pack_end(self.theme_toggle,False,False,0); root.pack_start(header,False,False,0)
        workspace=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=18); root.pack_start(workspace,True,True,0)
        self.wheel=ColorWheel(self); workspace.pack_start(self.wheel,True,True,0)
        controls=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=10); controls.set_size_request(470,-1); controls.set_valign(Gtk.Align.CENTER); workspace.pack_start(controls,False,False,0)
        active=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=5); self.active_swatch=Gtk.DrawingArea(); self.active_swatch.set_size_request(36,32); self.active_swatch.connect("draw",self.draw_active_swatch); active.pack_start(self.active_swatch,False,False,0)
        self.color_entry=Gtk.Entry(); self.color_entry.set_width_chars(7); self.color_entry.set_max_width_chars(7); self.color_entry.set_size_request(82,-1); self.color_entry.set_text(self.color); self.color_entry.connect("activate",self.entry_changed); active.pack_start(self.color_entry,False,False,0)
        lightness_label=Gtk.Label(label="L"); lightness_label.set_tooltip_text("Lightness"); active.pack_start(lightness_label,False,False,0); self.lightness=Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,8,92,1); self.lightness.set_name("hueprint-lightness"); self.lightness.get_style_context().add_provider(self.lightness_provider,Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION); self.lightness.set_draw_value(False); self.lightness.set_size_request(170,-1); self.lightness.set_hexpand(True); self.lightness.set_tooltip_text("Active color lightness"); self.lightness.set_value(hex_to_hls(self.color)[1]*100); self.lightness.connect("value-changed",self.lightness_changed); active.pack_start(self.lightness,True,True,0)
        self.add_active_button=self._icon_button("add","Add active color to Saved Palette",self.add_active); active.pack_start(self.add_active_button,False,False,0)
        self.color_button=self._icon_button("dropper","Pick a color anywhere on the active screen",self.start_screen_pick); active.pack_start(self.color_button,False,False,0)
        self.copy_button=self._icon_button("copy","Copy active color",self.copy_color); active.pack_start(self.copy_button,False,False,0); controls.pack_start(self._row("Active Color",active,17363),False,False,0)
        selectors=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=8)
        self.harmony=self.described_combo(HARMONIES); self.harmony.set_hexpand(True); self.harmony.set_active_id("analogous"); self.harmony.connect_changed(self.harmony_changed); selectors.pack_start(self._row("Harmony",self.harmony),True,True,0)
        self.recipe=RecipeBrowser(self); self.recipe.set_hexpand(True); self.recipe.connect_changed(self.control_changed); selectors.pack_start(self._row("Palette recipe",self.recipe),True,True,0); controls.pack_start(selectors,False,False,0)
        self.target=Gtk.ComboBoxText(); self.target.append("fill","Fill selected objects"); self.target.append("stroke","Stroke selected objects"); self.target.set_active_id("fill"); controls.pack_start(self._row("Apply Colors To",self.target),False,False,0)
        self.create=Gtk.CheckButton(label="Create palette swatches on canvas"); self.create.set_active(True); controls.pack_start(self.create,False,False,0)
        swatch_separator=self._hairline(14,8); root.pack_start(swatch_separator,False,False,0)
        swatch_header=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=8); swatch_title=Gtk.Label(); swatch_title.set_markup("<span size='17363' weight='bold' foreground='#FFFFFF'>Swatches</span>"); swatch_title.set_xalign(0); swatch_header.pack_start(swatch_title,False,False,0)
        self.count=CompactCount(self,2,8,5); self.count.connect_changed(self.control_changed); swatch_header.pack_end(self.count,False,False,0); root.pack_start(swatch_header,False,False,0)
        self.metadata_grid=Gtk.Grid(); self.metadata_grid.set_row_spacing(0); self.metadata_grid.set_column_spacing(7); self.metadata_grid.set_column_homogeneous(True); root.pack_start(self.metadata_grid,False,False,0)
        saved_separator=self._hairline(12,8); root.pack_start(saved_separator,False,False,0)
        saved_header=Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL,spacing=8); saved_title=Gtk.Label(); saved_title.set_markup("<span size='17363' weight='bold' foreground='#FFFFFF'>Saved Palette</span>"); saved_title.set_xalign(0); saved_header.pack_start(saved_title,True,True,0)
        for icon,tooltip,handler in (("add","Add active color",self.add_active),("palette","Add generated swatches",self.save_generated),("import","Import palette",self.import_palette),("export","Export palette",self.export_palette),("trash","Clear saved palette",self.clear_saved)):
            saved_header.pack_start(self._icon_button(icon,tooltip,handler),False,False,0)
        root.pack_start(saved_header,False,False,0)
        self.saved_box=Gtk.FlowBox(); self.saved_box.set_selection_mode(Gtk.SelectionMode.NONE); self.saved_box.set_column_spacing(5); self.saved_box.set_row_spacing(5); self.saved_box.set_min_children_per_line(8); self.saved_box.set_max_children_per_line(8); self.saved_box.set_homogeneous(True); root.pack_start(self.saved_box,False,False,0)
        self.show_all(); self.harmony.get_popover().hide(); self.recipe.get_popover().hide(); self.theme_changed()
    def _row(self,label,widget,size=14840):
        box=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=3); text=Gtk.Label(); text.set_markup(f"<span size='{size}' weight='bold' foreground='#FFFFFF'>{label}</span>"); text.set_xalign(0); box.pack_start(text,False,False,0); box.pack_start(widget,False,False,0); return box
    def _icon_button(self,icon,tooltip,handler,size=32):
        button=Gtk.Button(); button.set_size_request(size,size); button.set_valign(Gtk.Align.CENTER); button.set_relief(Gtk.ReliefStyle.NONE if size<=24 else Gtk.ReliefStyle.NORMAL)
        if size<=24:
            context=button.get_style_context(); context.add_class("hueprint-mini-icon"); context.add_provider(self.hairline_provider,Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
        _set_icon(button,icon,16 if size>=30 else 13); button.set_tooltip_text(tooltip); button.connect("clicked",handler); self.icon_buttons.append(button); return button
    def _hairline(self,top,bottom,table=False):
        separator=Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL); separator.set_margin_top(top); separator.set_margin_bottom(bottom); context=separator.get_style_context(); context.add_class("hueprint-table-hairline" if table else "hueprint-section-hairline"); context.add_provider(self.hairline_provider,Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION); return separator
    def dark_mode(self): return self.theme_toggle.get_active()
    def background_rgb(self):
        found,color=self.get_style_context().lookup_color("theme_bg_color"); return (color.red,color.green,color.blue) if found else ((.2,.2,.2) if self.dark_mode() else (.96,.96,.96))
    def theme_changed(self,*_args):
        dark=self.dark_mode(); settings=Gtk.Settings.get_default()
        if settings:settings.set_property("gtk-application-prefer-dark-theme",dark)
        css=".hueprint-section-hairline { background-color: rgba(255,255,255,0.42); min-height: 1px; } .hueprint-table-hairline { background-color: rgba(255,255,255,0.17); min-height: 1px; } .hueprint-mini-icon { padding: 0; min-width: 20px; min-height: 20px; }" if dark else ".hueprint-section-hairline { background-color: rgba(20,30,45,0.34); min-height: 1px; } .hueprint-table-hairline { background-color: rgba(20,30,45,0.13); min-height: 1px; } .hueprint-mini-icon { padding: 0; min-width: 20px; min-height: 20px; }"; self.hairline_provider.load_from_data(css.encode("utf-8"))
        _set_icon(self.theme_toggle,"sun" if dark else "moon"); self.theme_toggle.set_tooltip_text("Switch to light mode" if dark else "Switch to dark mode")
        for button in self.icon_buttons:_set_icon(button,button.hueprint_icon,button.hueprint_icon_size)
        self.update_lightness_gradient(); self.wheel.queue_draw()
    def recipe_active(self): return self.recipe.get_active_id() not in (None,"none")
    def rule_id(self): return self.harmony.get_active_id() or "analogous"
    def generated_colors(self):
        count=int(self.count.get_value()) if hasattr(self,"count") else 5; recipe=self.recipe.get_active_id() if hasattr(self,"recipe") else "none"
        colors=generate_recipe(self.color,recipe,count) if recipe not in (None,"none") else generate_palette(self.color,self.rule_id(),count)
        colors=list(colors[:count]); originals=list(colors); offsets=(-.14,.14,-.24,.24)
        while len(colors)<count:
            base=originals[len(colors)%len(originals)]; hue,light,saturation=hex_to_hls(base); offset=offsets[(len(colors)-len(originals))%len(offsets)]
            colors.append(hls_to_hex(hue,_clamp(light+offset,.08,.92),saturation*.82))
        return colors
    def active_point_index(self,colors):
        active=self.color.upper(); return next((i for i,color in enumerate(colors) if color.upper()==active),0)
    def harmony_changed(self,*_args):
        if hasattr(self,"recipe") and self.recipe_active():self.recipe.set_active_id("none")
        else:self.refresh()
    def control_changed(self,*_args):self.refresh()
    def update_lightness_gradient(self):
        if not hasattr(self,"lightness"):return
        hue,_light,saturation=hex_to_hls(self.color); stops=[hls_to_hex(hue,value,saturation) for value in (.08,.28,.50,.72,.92)]; css="#hueprint-lightness trough { min-height: 7px; background-image: linear-gradient(to right, %s); } #hueprint-lightness highlight { background-color: transparent; background-image: none; }"%", ".join(stops); self.lightness_provider.load_from_data(css.encode("utf-8"))
    def set_color(self,color):
        self.color=sanitize_hex(color); self.color_entry.set_text(self.color); self.updating_lightness=True
        if hasattr(self,"lightness"):self.lightness.set_value(hex_to_hls(self.color)[1]*100)
        self.updating_lightness=False; self.update_lightness_gradient(); _set_icon(self.copy_button,"copy"); self.copy_button.set_tooltip_text("Copy active color"); self.active_swatch.queue_draw(); self.refresh()
    def lightness_changed(self,scale):
        if self.updating_lightness:return
        hue,_light,saturation=hex_to_hls(self.color); self.set_color(hls_to_hex(hue,scale.get_value()/100,saturation))
    def entry_changed(self,entry):self.set_color(entry.get_text())
    def start_screen_pick(self,*_args):
        if getattr(self,"picker_overlay",None):return
        root=Gdk.get_default_root_window(); root_x=root_y=0; width,height=root.get_width(),root.get_height(); snapshot=Gdk.pixbuf_get_from_window(root,root_x,root_y,width,height)
        if not snapshot:return
        overlay=Gtk.Window(type=Gtk.WindowType.TOPLEVEL); self.picker_overlay=overlay; self.picker_snapshot=snapshot; self.picker_origin=(root_x,root_y); overlay.set_screen(self.get_screen()); overlay.set_transient_for(self); overlay.set_modal(True); overlay.set_decorated(False); overlay.set_keep_above(True); overlay.set_skip_taskbar_hint(True); overlay.set_skip_pager_hint(True); overlay.set_resizable(False); overlay.add_events(Gdk.EventMask.BUTTON_PRESS_MASK|Gdk.EventMask.KEY_PRESS_MASK)
        overlay.connect("button-press-event",self.finish_screen_pick); overlay.connect("key-press-event",self.cancel_screen_pick); overlay.add(Gtk.Image.new_from_pixbuf(snapshot)); overlay.move(root_x,root_y); overlay.set_default_size(width,height); overlay.show_all(); overlay.present()
        if overlay.get_window():overlay.get_window().set_cursor(Gdk.Cursor.new_from_name(Gdk.Display.get_default(),"crosshair"))
    def finish_screen_pick(self,_overlay,event):
        snapshot=self.picker_snapshot; origin_x,origin_y=self.picker_origin; x=max(0,min(snapshot.get_width()-1,round(event.x_root-origin_x))); y=max(0,min(snapshot.get_height()-1,round(event.y_root-origin_y))); pixels=bytes(snapshot.get_pixels()); offset=y*snapshot.get_rowstride()+x*snapshot.get_n_channels(); color="#%02X%02X%02X"%(pixels[offset],pixels[offset+1],pixels[offset+2])
        self.picker_overlay.destroy(); self.picker_overlay=None; self.picker_snapshot=None; self.set_color(color); return True
    def cancel_screen_pick(self,overlay,event):
        if event.keyval==Gdk.KEY_Escape:
            overlay.destroy(); self.picker_overlay=None; self.picker_snapshot=None; GLib.idle_add(self.restore_after_picker); return True
        return False
    def restore_after_picker(self):self.present(); return False
    def copy_color(self,*_args):
        Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD).set_text(self.color,-1); _set_icon(self.copy_button,"check"); self.copy_button.set_tooltip_text("Color copied")
    def draw_active_swatch(self,widget,cr):
        red,green,blue=[int(self.color[i:i+2],16)/255 for i in (1,3,5)]; cr.set_source_rgb(red,green,blue); cr.rectangle(0,0,widget.get_allocated_width(),widget.get_allocated_height()); cr.fill(); return False
    def _color_widget(self,color,height,handler=None):
        event=Gtk.EventBox(); event.set_hexpand(True); event.set_halign(Gtk.Align.FILL); area=Gtk.DrawingArea(); area.set_size_request(36,height); area.set_hexpand(True); red,green,blue=[int(color[i:i+2],16)/255 for i in (1,3,5)]
        area.connect("draw",lambda w,cr:(cr.set_source_rgb(red,green,blue),cr.rectangle(0,0,w.get_allocated_width(),w.get_allocated_height()),cr.fill(),False)[-1]); event.add(area); event.set_tooltip_text(color)
        if handler:event.connect("button-press-event",lambda *_:handler(color))
        return event
    def refresh(self):
        if not hasattr(self,"metadata_grid"):return
        colors=self.generated_colors(); self.recipe.refresh_previews(); self.render_metadata(colors); self.render_saved(); self.wheel.queue_draw()
    def _metadata(self,color):
        h,l,s=hex_to_hls(color); r,g,b=[int(color[i:i+2],16) for i in (1,3,5)]; rn,gn,bn=r/255,g/255,b/255; k=1-max(rn,gn,bn)
        c=m=y=0 if k>=.999 else None
        if k<.999:c=(1-rn-k)/(1-k);m=(1-gn-k)/(1-k);y=(1-bn-k)/(1-k)
        ok_l,ok_c,ok_h=hex_to_oklch(color)
        return {"HEX":color,"RGB":f"{r}\n{g}\n{b}","CMYK":f"{round(c*100)}%\n{round(m*100)}%\n{round(y*100)}%\n{round(k*100)}%","HSL":f"{round(h)}°\n{round(s*100)}%\n{round(l*100)}%","OKLCH":f"{ok_l:.3f}\n{ok_c:.3f}\n{round(ok_h)}°"}
    def _table_label(self,markup,align=1):
        label=Gtk.Label(); label.set_markup(f"<span line_height='0.85'>{markup}</span>"); label.set_xalign(align); label.set_yalign(0); label.set_hexpand(True); label.set_halign(Gtk.Align.FILL)
        if align>=.99:label.set_justify(Gtk.Justification.RIGHT)
        layout=label.get_layout()
        if hasattr(layout,"set_line_spacing"):layout.set_line_spacing(.85)
        return label
    def render_metadata(self,colors):
        for child in self.metadata_grid.get_children():self.metadata_grid.remove(child)
        other_colors=list(colors); active_index=next((i for i,color in enumerate(other_colors) if color.upper()==self.color.upper()),0)
        if other_colors:other_colors.pop(active_index)
        generated_columns=[(str(i),color) for i,color in enumerate(other_colors,start=2)]; columns=[("Active",self.color)]+generated_columns; channel={"HEX":"","RGB":"R\nG\nB","CMYK":"C\nM\nY\nK","HSL":"H\nS\nL","OKLCH":"L\nC\nH"}; total=len(columns)+2
        for col,title in enumerate(("Format","Parts")):
            heading=self._table_label(f"<span size='large' weight='bold'>{title}</span>"); heading.set_yalign(1); heading.set_margin_bottom(6); heading.set_margin_end(16 if col==1 else 0); self.metadata_grid.attach(heading,col,1,1,1)
        for col,(name,color) in enumerate(columns,2):
            foreground=" foreground='#FFFFFF'" if name=="Active" else ""
            header=self._table_label(f"<span size='14840' weight='bold'{foreground}>{name}</span>",1); header.set_size_request(53,-1); header.set_margin_start(16 if col==2 else 0); self.metadata_grid.attach(header,col,0,1,1)
            swatch=self._color_widget(color,30,self.set_color); swatch.set_margin_top(5); swatch.set_margin_bottom(6); swatch.set_margin_start(16 if col==2 else 0); self.metadata_grid.attach(swatch,col,1,1,1)
        for index,kind in enumerate(("HEX","RGB","CMYK","HSL","OKLCH")):
            separator=self._hairline(4,4,table=True); self.metadata_grid.attach(separator,0,2+index*2,total,1)
            row=3+index*2; self.metadata_grid.attach(self._table_label(f"<span size='large' weight='bold'>{kind}</span>"),0,row,1,1)
            parts=self._table_label(f"<span size='medium' weight='bold'>{channel[kind]}</span>"); parts.set_margin_end(16); self.metadata_grid.attach(parts,1,row,1,1)
            for col,(_name,color) in enumerate(columns,2):
                value=self._table_label(f"<span size='medium'>{self._metadata(color)[kind]}</span>"); value.set_selectable(True); value.set_margin_start(16 if col==2 else 0); self.metadata_grid.attach(value,col,row,1,1)
        self.metadata_grid.show_all()
    def _load_saved(self):
        try:return [sanitize_hex(c) for c in json.loads(_palette_path().read_text(encoding="utf-8")) if isinstance(c,str)]
        except (OSError,ValueError,TypeError):return []
    def _save_saved(self):
        try:_palette_path().write_text(json.dumps(self.saved,indent=2),encoding="utf-8")
        except OSError:pass
    def add_active(self,*_args):
        if self.color not in self.saved:self.saved.append(self.color);self._save_saved();self.render_saved()
    def save_generated(self,*_args):
        self.saved.extend(self.generated_colors()); self._save_saved(); self.render_saved()
    def move_saved(self,index,delta):
        target=max(0,min(len(self.saved)-1,index+delta))
        if target!=index:self.saved.insert(target,self.saved.pop(index));self._save_saved();self.render_saved()
    def remove_saved(self,index):self.saved.pop(index);self._save_saved();self.render_saved()
    def clear_saved(self,*_args):self.saved=[];self._save_saved();self.render_saved()
    def render_saved(self):
        if not hasattr(self,"saved_box"):return
        for child in self.saved_box.get_children():self.saved_box.remove(child)
        if not self.saved:self.saved_box.add(Gtk.Label(label="No saved colors"))
        for index,color in enumerate(self.saved):
            item=Gtk.Box(orientation=Gtk.Orientation.VERTICAL,spacing=2); item.set_hexpand(True); item.pack_start(self._color_widget(color,34,self.set_color),False,False,0); controls=Gtk.Box(spacing=1); controls.set_homogeneous(True)
            for icon,tooltip,handler in (("left","Move left",lambda _b,i=index:self.move_saved(i,-1)),("right","Move right",lambda _b,i=index:self.move_saved(i,1)),("close","Remove color",lambda _b,i=index:self.remove_saved(i))):
                controls.pack_start(self._icon_button(icon,tooltip,handler,24),True,True,0)
            item.pack_start(controls,False,False,0); self.saved_box.add(item)
        self.saved_box.show_all()
    def import_palette(self,*_args):
        chooser=Gtk.FileChooserDialog(title="Import HuePrint palette",parent=self,action=Gtk.FileChooserAction.OPEN,buttons=("Cancel",Gtk.ResponseType.CANCEL,"Import",Gtk.ResponseType.OK))
        if chooser.run()==Gtk.ResponseType.OK:
            try:
                data=json.loads(Path(chooser.get_filename()).read_text(encoding="utf-8")); colors=data.get("colors",data) if isinstance(data,dict) else data; self.saved=[sanitize_hex(c) for c in colors if isinstance(c,str)]; self._save_saved();self.render_saved()
            except (OSError,ValueError,TypeError):pass
        chooser.destroy()
    def export_palette(self,*_args):
        chooser=Gtk.FileChooserDialog(title="Export HuePrint palette",parent=self,action=Gtk.FileChooserAction.SAVE,buttons=("Cancel",Gtk.ResponseType.CANCEL,"Export",Gtk.ResponseType.OK));chooser.set_current_name("hueprint-palette.json");chooser.set_do_overwrite_confirmation(True)
        if chooser.run()==Gtk.ResponseType.OK:
            try:Path(chooser.get_filename()).write_text(json.dumps({"name":"HuePrint Palette","colors":self.generated_colors()},indent=2),encoding="utf-8")
            except OSError:pass
        chooser.destroy()
