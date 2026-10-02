extends Control

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - CHARACTER SELECT SCREEN
# ==============================================================================

# Roster definition matching web version exactly
const ROSTER_KEYS: Array[String] = [
	"leon", "latina", "ojosazules", "pepeargento",
	"eleternauta", "elcomandante", "elmesias", "hugo",
	"pergolas", "sangrejaponesa", "badbitch", "inmortal"
]

const GRID_COLS := 4
const GRID_ROWS := 3

# Node References
@onready var title_label: Label = $TopHeader/SelectTitle
@onready var diff_label: Label = $TopHeader/DifficultyTag
@onready var grid_container: GridContainer = $CenterArea/GridPanel/GridContainer

# P1 Preview Panel
@onready var p1_big_portrait: TextureRect = $CenterArea/P1Preview/Card/PortraitBox/BigPortrait
@onready var p1_name_label: Label = $CenterArea/P1Preview/Card/NameLabel
@onready var p1_alias_label: Label = $CenterArea/P1Preview/Card/AliasLabel
@onready var p1_quote_label: Label = $CenterArea/P1Preview/Card/QuoteLabel
@onready var p1_bar_atk: ProgressBar = $CenterArea/P1Preview/Card/StatBars/AtkRow/Bar
@onready var p1_bar_spd: ProgressBar = $CenterArea/P1Preview/Card/StatBars/SpdRow/Bar
@onready var p1_bar_spc: ProgressBar = $CenterArea/P1Preview/Card/StatBars/SpcRow/Bar

# P2 Preview Panel
@onready var p2_preview_panel: Control = $CenterArea/P2Preview
@onready var p2_big_portrait: TextureRect = $CenterArea/P2Preview/Card/PortraitBox/BigPortrait
@onready var p2_name_label: Label = $CenterArea/P2Preview/Card/NameLabel
@onready var p2_alias_label: Label = $CenterArea/P2Preview/Card/AliasLabel
@onready var p2_quote_label: Label = $CenterArea/P2Preview/Card/QuoteLabel
@onready var p2_bar_atk: ProgressBar = $CenterArea/P2Preview/Card/StatBars/AtkRow/Bar
@onready var p2_bar_spd: ProgressBar = $CenterArea/P2Preview/Card/StatBars/SpdRow/Bar
@onready var p2_bar_spc: ProgressBar = $CenterArea/P2Preview/Card/StatBars/SpcRow/Bar

# Footer Buttons
@onready var btn_back: Button = $BottomBar/BtnBack
@onready var btn_confirm: Button = $BottomBar/BtnConfirm
@onready var instructions_label: Label = $BottomBar/InstructionsLabel
@onready var crt_overlay: ColorRect = $CRT_Overlay

# Selection State
var current_grid_idx: int = 0
var selecting_player: int = 1 # 1 = Player 1, 2 = Player 2
var p1_confirmed_key: String = ""
var p2_confirmed_key: String = ""

# Grid button elements
var grid_cards: Array[Button] = []
var portrait_textures: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	if crt_overlay != null:
		crt_overlay.visible = false

	_load_portrait_textures()
	_build_character_grid()
	_update_header_title()
	
	# Initial preview
	_update_preview(1, ROSTER_KEYS[0])
	if GameManager.current_mode == GameManager.GameMode.ARCADE:
		p2_confirmed_key = GameManager.TOWER_ROSTER[0]
		_update_preview(2, p2_confirmed_key)
	else:
		_update_preview(2, ROSTER_KEYS[1])

	# Focus first character slot
	if grid_cards.size() > 0:
		grid_cards[0].grab_focus()

	btn_back.pressed.connect(_on_back_pressed)
	btn_confirm.pressed.connect(_on_confirm_pressed)

	if GameManager.music_enabled and has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").start_bgm("demusicaligera")

func _load_portrait_textures() -> void:
	for key in ROSTER_KEYS:
		var path := "res://assets/ui/portraits/%s.png" % key
		if ResourceLoader.exists(path):
			portrait_textures[key] = load(path)

func _build_character_grid() -> void:
	# Clear existing children
	for child in grid_container.get_children():
		child.queue_free()
	grid_cards.clear()

	for i in range(ROSTER_KEYS.size()):
		var key := ROSTER_KEYS[i]
		var char_data: Dictionary = GameData.get_character(key)
		
		var card := Button.new()
		card.custom_minimum_size = Vector2(72, 60)
		card.focus_mode = Control.FOCUS_ALL
		card.clip_text = false

		# Normal style
		var sb_norm := StyleBoxFlat.new()
		sb_norm.bg_color = Color("#151224")
		sb_norm.border_width_left = 2
		sb_norm.border_width_top = 2
		sb_norm.border_width_right = 2
		sb_norm.border_width_bottom = 2
		sb_norm.border_color = UIThemeManager.COLOR_BORDER_DARK
		sb_norm.corner_radius_top_left = 4
		sb_norm.corner_radius_top_right = 4
		sb_norm.corner_radius_bottom_right = 4
		sb_norm.corner_radius_bottom_left = 4
		card.add_theme_stylebox_override("normal", sb_norm)

		# Focus / Hover style (Gold)
		var sb_focus := StyleBoxFlat.new()
		sb_focus.bg_color = Color(0.12, 0.1, 0.25, 0.95)
		sb_focus.border_width_left = 2
		sb_focus.border_width_top = 2
		sb_focus.border_width_right = 2
		sb_focus.border_width_bottom = 2
		sb_focus.border_color = UIThemeManager.COLOR_ARCADE_GOLD
		sb_focus.corner_radius_top_left = 4
		sb_focus.corner_radius_top_right = 4
		sb_focus.corner_radius_bottom_right = 4
		sb_focus.corner_radius_bottom_left = 4
		sb_focus.shadow_color = Color(1, 0.85, 0, 0.4)
		sb_focus.shadow_size = 6
		card.add_theme_stylebox_override("hover", sb_focus)
		card.add_theme_stylebox_override("focus", sb_focus)

		# Inner layout with TextureRect and Label
		var vbox := VBoxContainer.new()
		vbox.anchors_preset = Control.PRESET_FULL_RECT
		vbox.alignment = BoxContainer.ALIGNMENT_CENTER
		vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vbox.add_theme_constant_override("separation", 2)

		var tex_rect := TextureRect.new()
		tex_rect.custom_minimum_size = Vector2(34, 34)
		tex_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tex_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tex_rect.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		tex_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		if portrait_textures.has(key):
			tex_rect.texture = portrait_textures[key]
		vbox.add_child(tex_rect)

		var lbl := Label.new()
		var char_raw_name: String = char_data.get("name", key.to_upper())
		if char_raw_name.contains(" "):
			lbl.text = char_raw_name.replace(" ", "\n")
		else:
			lbl.text = char_raw_name
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		lbl.add_theme_font_override("font", UIThemeManager.FONT_PRESS_START_2P)
		lbl.add_theme_font_size_override("font_size", 5)
		lbl.add_theme_color_override("font_color", Color("#ffffff"))
		lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vbox.add_child(lbl)

		card.add_child(vbox)

		# Connect Events
		card.focus_entered.connect(_on_slot_focus_entered.bind(i))
		card.mouse_entered.connect(_on_slot_mouse_entered.bind(card))
		card.pressed.connect(_on_slot_pressed.bind(i))

		grid_container.add_child(card)
		grid_cards.append(card)

func _update_header_title() -> void:
	match GameManager.current_mode:
		GameManager.GameMode.ARCADE:
			title_label.text = "TORRE ARCADE: SELECCIONA TU LUCHADOR"
			instructions_label.text = "FLECHAS: NAVEGAR • ENTER: CONFIRMAR • ESPACIO / \\: MENÚ PRINCIPAL"
		GameManager.GameMode.VERSUS:
			title_label.text = "DUELO VERSUS: JUGADOR 1 ELIGE" if selecting_player == 1 else "DUELO VERSUS: JUGADOR 2 ELIGE"
			instructions_label.text = "FLECHAS: NAVEGAR • ENTER: CONFIRMAR • ESPACIO / \\: MENÚ PRINCIPAL"
		GameManager.GameMode.TRAINING:
			title_label.text = "ENTRENAMIENTO: SELECCIONA TU LUCHADOR"
			instructions_label.text = "FLECHAS: NAVEGAR • ENTER: INICIAR • ESPACIO / \\: MENÚ PRINCIPAL"

	diff_label.text = "DIFICULTAD: " + GameManager.difficulty.to_upper()

func _on_slot_focus_entered(index: int) -> void:
	current_grid_idx = index
	var key := ROSTER_KEYS[index]
	_update_preview(selecting_player, key)

	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_beep()

func _on_slot_mouse_entered(btn: Button) -> void:
	btn.grab_focus()

func _on_slot_pressed(index: int) -> void:
	_confirm_slot_selection(index)

func _unhandled_input(event: InputEvent) -> void:
	# Contra-banda (\) o Escape: volver hacia atrás
	if event.is_action_pressed("ui_cancel") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ESCAPE or event.keycode == KEY_BACKSLASH or event.unicode == 92)):
		_on_back_pressed()
		get_viewport().set_input_as_handled()
		return

	# Barra Espaciadora: Volver al menú principal
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_SPACE:
		_on_back_pressed()
		get_viewport().set_input_as_handled()
		return

	# Grid Navigation with Arrow Keys
	var col := current_grid_idx % GRID_COLS
	var row := current_grid_idx / GRID_COLS

	if event.is_action_pressed("ui_right") or (event is InputEventKey and event.pressed and event.keycode == KEY_RIGHT):
		col = (col + 1) % GRID_COLS
		_focus_grid_slot(row * GRID_COLS + col)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_left") or (event is InputEventKey and event.pressed and event.keycode == KEY_LEFT):
		col = (col - 1 + GRID_COLS) % GRID_COLS
		_focus_grid_slot(row * GRID_COLS + col)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_down") or (event is InputEventKey and event.pressed and event.keycode == KEY_DOWN):
		row = (row + 1) % GRID_ROWS
		_focus_grid_slot(row * GRID_COLS + col)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_up") or (event is InputEventKey and event.pressed and event.keycode == KEY_UP):
		row = (row - 1 + GRID_ROWS) % GRID_ROWS
		_focus_grid_slot(row * GRID_COLS + col)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_accept") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ENTER or event.keycode == KEY_KP_ENTER)):
		_confirm_slot_selection(current_grid_idx)
		get_viewport().set_input_as_handled()

func _focus_grid_slot(idx: int) -> void:
	if idx >= 0 and idx < grid_cards.size():
		current_grid_idx = idx
		grid_cards[idx].grab_focus()

func _update_preview(player: int, key: String) -> void:
	var char_data: Dictionary = GameData.get_character(key)
	var stats: Dictionary = char_data.get("stats", { "atk": 80, "spd": 80, "spc": 80 })
	var portrait_tex: Texture2D = portrait_textures.get(key, null)

	if player == 1:
		p1_name_label.text = char_data.get("name", key.to_upper())
		p1_alias_label.text = "(" + char_data.get("alias", "") + ")"
		p1_quote_label.text = '"' + char_data.get("quote", "") + '"'
		p1_bar_atk.value = stats.get("atk", 80)
		p1_bar_spd.value = stats.get("spd", 80)
		p1_bar_spc.value = stats.get("spc", 80)
		if portrait_tex != null:
			p1_big_portrait.texture = portrait_tex
	else:
		p2_name_label.text = char_data.get("name", key.to_upper())
		p2_alias_label.text = "(" + char_data.get("alias", "") + ")"
		p2_quote_label.text = '"' + char_data.get("quote", "") + '"'
		p2_bar_atk.value = stats.get("atk", 80)
		p2_bar_spd.value = stats.get("spd", 80)
		p2_bar_spc.value = stats.get("spc", 80)
		if portrait_tex != null:
			p2_big_portrait.texture = portrait_tex

func _confirm_slot_selection(idx: int) -> void:
	var selected_key := ROSTER_KEYS[idx]
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()

	if selecting_player == 1:
		p1_confirmed_key = selected_key
		_mark_slot_confirmed(idx, UIThemeManager.COLOR_ARCADE_BLUE)
		
		if GameManager.current_mode == GameManager.GameMode.VERSUS:
			selecting_player = 2
			_update_header_title()
			# Move to another slot for P2 to choose
			var next_idx := (idx + 1) % ROSTER_KEYS.size()
			_focus_grid_slot(next_idx)
		else:
			# In Arcade or Training, P1 locks and we can proceed immediately
			p2_confirmed_key = GameManager.TOWER_ROSTER[0] if GameManager.current_mode == GameManager.GameMode.ARCADE else "latina"
			_launch_match()
	else:
		# Player 2 Confirmed
		p2_confirmed_key = selected_key
		_mark_slot_confirmed(idx, UIThemeManager.COLOR_ARCADE_RED)
		_launch_match()

func _mark_slot_confirmed(idx: int, border_color: Color) -> void:
	var card := grid_cards[idx]
	var sb := StyleBoxFlat.new()
	sb.bg_color = border_color * Color(1, 1, 1, 0.35)
	sb.border_width_left = 2
	sb.border_width_top = 2
	sb.border_width_right = 2
	sb.border_width_bottom = 2
	sb.border_color = border_color
	sb.corner_radius_top_left = 4
	sb.corner_radius_top_right = 4
	sb.corner_radius_bottom_right = 4
	sb.corner_radius_bottom_left = 4
	sb.shadow_color = border_color
	sb.shadow_size = 6
	card.add_theme_stylebox_override("normal", sb)

func _launch_match() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_fight()
		
	# Brief delay for dramatic confirmation sound
	await get_tree().create_timer(0.4).timeout
	GameManager.confirm_selections(p1_confirmed_key, p2_confirmed_key, GameManager.selected_stage_id)

func _on_confirm_pressed() -> void:
	_confirm_slot_selection(current_grid_idx)

func _on_back_pressed() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_beep()
	GameManager.goto_title()
