class_name UIThemeManager
extends RefCounted

# ==============================================================================
# TORNEO ARGENTO 16-BIT - UI THEME & DESIGN SYSTEM (CSS -> GODOT 4 TRANSLATION)
# ==============================================================================

# Exact Colors from style.css
const COLOR_BG_DARK := Color("#0a0814")
const COLOR_GLASS_BG := Color(0.047, 0.039, 0.094, 0.92)
const COLOR_ARCADE_GOLD := Color("#ffd700")
const COLOR_ARCADE_BLUE := Color("#00e5ff")
const COLOR_ARCADE_RED := Color("#ff2a55")
const COLOR_ARCADE_GREEN := Color("#00ff66")
const COLOR_ARCADE_PURPLE := Color("#9d4edd")
const COLOR_BORDER_GOLD := Color("#f39c12")
const COLOR_BORDER_BLUE := Color("#3498db")
const COLOR_BORDER_DARK := Color("#3d355c")

# Preload Press Start 2P Font
const FONT_PRESS_START_2P := preload("res://assets/ui/PressStart2P.ttf")

static func create_glass_panel_style(border_color: Color = COLOR_BORDER_GOLD, border_width: int = 2, corner_rad: int = 6) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = COLOR_GLASS_BG
	sb.border_width_left = border_width
	sb.border_width_top = border_width
	sb.border_width_right = border_width
	sb.border_width_bottom = border_width
	sb.border_color = border_color
	sb.corner_radius_top_left = corner_rad
	sb.corner_radius_top_right = corner_rad
	sb.corner_radius_bottom_right = corner_rad
	sb.corner_radius_bottom_left = corner_rad
	sb.shadow_color = Color(0, 0, 0, 0.7)
	sb.shadow_size = 8
	return sb

static func create_button_style(bg_color: Color, border_color: Color, corner_rad: int = 6) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg_color
	sb.border_width_left = 2
	sb.border_width_top = 2
	sb.border_width_right = 2
	sb.border_width_bottom = 2
	sb.border_color = border_color
	sb.corner_radius_top_left = corner_rad
	sb.corner_radius_top_right = corner_rad
	sb.corner_radius_bottom_right = corner_rad
	sb.corner_radius_bottom_left = corner_rad
	sb.shadow_color = Color(0, 0, 0, 0.6)
	sb.shadow_size = 4
	sb.content_margin_left = 10
	sb.content_margin_right = 10
	sb.content_margin_top = 6
	sb.content_margin_bottom = 6
	return sb

static func create_pill_style(type: String, state: String = "normal") -> StyleBoxFlat:
	var bg: Color
	var border: Color
	match type:
		"arcade":
			# Orange Gold Pill
			bg = Color("#d35400") if state == "normal" else (Color("#f39c12") if state == "hover" else Color("#a04000"))
			border = Color("#ffd700") if state != "pressed" else Color("#ffffff")
		"versus":
			# Purple Pill
			bg = Color("#4834d4") if state == "normal" else (Color("#6c5ce7") if state == "hover" else Color("#341f97"))
			border = Color("#a29bfe") if state != "pressed" else Color("#ffffff")
		"training":
			# Cyan / Blue Pill
			bg = Color("#005086") if state == "normal" else (Color("#0984e3") if state == "hover" else Color("#00385c"))
			border = Color("#74b9ff") if state != "pressed" else Color("#ffffff")
		"options":
			# Emerald / Green Pill
			bg = Color("#1b5e20") if state == "normal" else (Color("#2e7d32") if state == "hover" else Color("#0e3d12"))
			border = Color("#00ff66") if state != "pressed" else Color("#ffffff")
		"credits", _:
			# Slate Gray Pill
			bg = Color("#2d3436") if state == "normal" else (Color("#636e72") if state == "hover" else Color("#1e2324"))
			border = Color("#b2bec3") if state != "pressed" else Color("#ffffff")
			
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_width_left = 2
	sb.border_width_top = 2
	sb.border_width_right = 2
	sb.border_width_bottom = 2
	sb.border_color = border
	sb.corner_radius_top_left = 8
	sb.corner_radius_top_right = 8
	sb.corner_radius_bottom_right = 8
	sb.corner_radius_bottom_left = 8
	sb.shadow_color = Color(0, 0, 0, 0.7)
	sb.shadow_size = 5 if state == "hover" else 3
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	sb.content_margin_top = 6
	sb.content_margin_bottom = 6
	return sb
