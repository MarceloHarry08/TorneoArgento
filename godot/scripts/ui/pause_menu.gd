extends CanvasLayer

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - PAUSE MENU & COMBOS CONTROLLER
# ==============================================================================

signal resumed
signal exited_to_menu

@onready var main_view: VBoxContainer = $PauseBox/Margin/MainView
@onready var combos_view: VBoxContainer = $PauseBox/Margin/CombosView

@onready var btn_resume: Button = $PauseBox/Margin/MainView/ButtonsVBox/BtnResume
@onready var btn_combos: Button = $PauseBox/Margin/MainView/ButtonsVBox/BtnCombos
@onready var btn_crt: Button = $PauseBox/Margin/MainView/ButtonsVBox/BtnCRT
@onready var btn_audio: Button = $PauseBox/Margin/MainView/ButtonsVBox/BtnAudio
@onready var btn_quit: Button = $PauseBox/Margin/MainView/ButtonsVBox/BtnQuit

@onready var p1_title: Label = $PauseBox/Margin/CombosView/ScrollContainer/ColumnsHBox/P1Box/P1Title
@onready var p1_movelist: VBoxContainer = $PauseBox/Margin/CombosView/ScrollContainer/ColumnsHBox/P1Box/P1Movelist
@onready var p2_title: Label = $PauseBox/Margin/CombosView/ScrollContainer/ColumnsHBox/P2Box/P2Title
@onready var p2_movelist: VBoxContainer = $PauseBox/Margin/CombosView/ScrollContainer/ColumnsHBox/P2Box/P2Movelist
@onready var btn_back_from_combos: Button = $PauseBox/Margin/CombosView/BtnBackFromCombos

var action_buttons: Array[Button] = []
var active_button_idx: int = 0
var open_timestamp: int = 0
var space_released_after_open: bool = false
var current_p1_key: String = "leon"
var current_p2_key: String = "latina"

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	action_buttons = [btn_resume, btn_combos, btn_crt, btn_audio, btn_quit]
	
	for i in range(action_buttons.size()):
		var b := action_buttons[i]
		b.focus_entered.connect(_on_btn_focus_entered.bind(i))
		b.mouse_entered.connect(_on_btn_mouse_entered.bind(b))

	btn_resume.pressed.connect(_on_resume_pressed)
	btn_combos.pressed.connect(_on_combos_pressed)
	btn_crt.pressed.connect(_on_crt_pressed)
	btn_audio.pressed.connect(_on_audio_pressed)
	btn_quit.pressed.connect(_on_quit_pressed)
	btn_back_from_combos.pressed.connect(_on_back_from_combos_pressed)

	_refresh_toggles()

func open_pause(p1_key: String = "leon", p2_key: String = "latina") -> void:
	get_tree().paused = true
	visible = true
	space_released_after_open = false
	open_timestamp = Time.get_ticks_msec()
	current_p1_key = p1_key
	current_p2_key = p2_key
	
	_show_main_view()
	_populate_dual_movelists(p1_key, p2_key)
	_refresh_toggles()
	
	# Desactivar focus por teclado en botones para que la barra espaciadora no active acciones UI
	for b in action_buttons:
		b.focus_mode = Control.FOCUS_NONE
	btn_back_from_combos.focus_mode = Control.FOCUS_NONE

func close_pause() -> void:
	get_tree().paused = false
	visible = false
	space_released_after_open = false
	emit_signal("resumed")

func _show_main_view() -> void:
	main_view.visible = true
	combos_view.visible = false

func _show_combos_view() -> void:
	main_view.visible = false
	combos_view.visible = true

## Intercepta teclas globales para que la barra espaciadora solo cierre si se soltó y volvió a presionar
func _input(event: InputEvent) -> void:
	if not visible:
		return
		
	if event is InputEventKey and event.keycode == KEY_SPACE:
		get_viewport().set_input_as_handled()
		if not event.pressed:
			# El usuario soltó la barra espaciadora tras abrir la pausa
			space_released_after_open = true
			return
		elif event.pressed and not event.echo:
			# Solo si ya la soltó después de abrir, una nueva pulsación cierra el menú
			if space_released_after_open and (Time.get_ticks_msec() - open_timestamp > 150):
				close_pause()
			return

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ESCAPE:
			get_viewport().set_input_as_handled()
			if combos_view.visible:
				_show_main_view()
			else:
				close_pause()
			return

func _on_btn_focus_entered(idx: int) -> void:
	active_button_idx = idx
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_beep()

func _on_btn_mouse_entered(btn: Button) -> void:
	btn.grab_focus()

func _on_resume_pressed() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()
	close_pause()

func _on_combos_pressed() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()
	_show_combos_view()

func _on_back_from_combos_pressed() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()
	_show_main_view()

func _on_crt_pressed() -> void:
	GameManager.toggle_crt_filter()
	_refresh_toggles()
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()

func _on_audio_pressed() -> void:
	GameManager.toggle_music()
	_refresh_toggles()
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()

func _on_quit_pressed() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()
	get_tree().paused = false
	emit_signal("exited_to_menu")
	GameManager.goto_title()

func _refresh_toggles() -> void:
	btn_crt.text = "Filtro CRT: %s" % ("ACTIVADO" if GameManager.crt_filter_enabled else "DESACTIVADO")
	btn_audio.text = "Música 16-Bit: %s" % ("ACTIVADO" if GameManager.music_enabled else "DESACTIVADO")

## Carga los movimientos y combos de AMBOS personajes en juego
func _populate_dual_movelists(p1_key: String, p2_key: String) -> void:
	_populate_fighter_column(p1_key, p1_title, p1_movelist, "JUGADOR 1 (P1)", Color(0.0, 0.9, 1.0))
	_populate_fighter_column(p2_key, p2_title, p2_movelist, "JUGADOR 2 (P2)", Color(1.0, 0.5, 0.2))

func _populate_fighter_column(char_key: String, title_lbl: Label, container: VBoxContainer, default_tag: String, header_color: Color) -> void:
	for child in container.get_children():
		child.queue_free()

	var char_data: Dictionary = GameData.get_character(char_key)
	var c_name: String = char_data.get("name", char_key.to_upper())
	var c_alias: String = char_data.get("alias", "")
	
	if c_alias != "":
		title_lbl.text = "%s: %s\n(%s)" % [default_tag, c_name, c_alias]
	else:
		title_lbl.text = "%s: %s" % [default_tag, c_name]
	title_lbl.add_theme_color_override("font_color", header_color)

	var moves: Dictionary = char_data.get("moves", {})
	var combo_list: Array = char_data.get("combos", [])

	# Separador de Golpes Básicos
	_add_header_row(container, "--- GOLPES BÁSICOS ---", Color(0.8, 0.8, 0.8))
	_add_row(container, "Piña Baja (Jab)", "INSERT / J")
	_add_row(container, "Piña Alta (Gancho)", "INICIO / K")
	_add_row(container, "Patada Baja", "FIN / N")
	_add_row(container, "Patada Alta", "RE PÁG / M")
	_add_row(container, "Golpe Agachado", "↓ + Piña")
	_add_row(container, "Patada Agachada", "↓ + Patada")
	_add_row(container, "Bloqueo (-80% Daño)", "SUPR / L")

	# Poderes Especiales
	_add_header_row(container, "--- PODERES ESPECIALES ---", Color(1.0, 0.85, 0.2))
	if char_key == "leon":
		_add_row(container, "Rugido Sónico", "↓ → + Piña Baja (J)", Color(1.0, 0.9, 0.4))
		_add_row(container, "Motosierra", "↓ ← + Piña Alta (K)", Color(1.0, 0.6, 0.2))
		_add_row(container, "Micrófono (Atrae)", "↓ ← + Patada Baja (N)", Color(0.2, 0.9, 1.0))
		_add_row(container, "Mordisco Astral", "↓ → + Patada Alta (M)", Color(1.0, 0.3, 0.3))
	else:
		if moves.has("special1"):
			_add_row(container, moves["special1"].get("name", "Especial 1"), "↓ → + Piña", Color(1.0, 0.9, 0.4))
		if moves.has("special2"):
			_add_row(container, moves["special2"].get("name", "Especial 2"), "↓ ← + Patada", Color(1.0, 0.6, 0.2))
		if moves.has("special3"):
			_add_row(container, moves["special3"].get("name", "Especial 3"), "↓ → + Patada Baja", Color(0.2, 0.9, 1.0))

	# Súper Ataque y Fatality
	_add_header_row(container, "--- SÚPER & FATALITY ---", Color(1.0, 0.2, 0.5))
	if moves.has("super"):
		_add_row(container, moves["super"].get("name", "Súper"), "RE PÁG (100%)", Color(1.0, 0.3, 1.0))
	if moves.has("fatality"):
		_add_row(container, "FATALITY", "↓ ↓ + FIN / RE PÁG", Color(1.0, 0.2, 0.2))

	# Lista de Combos si existen
	if combo_list.size() > 0:
		_add_header_row(container, "--- COMBOS ---", Color(0.3, 1.0, 0.5))
		for c in combo_list:
			_add_row(container, c.get("name", "Combo") + " (%d Golpes)" % c.get("hits", 3), c.get("input", "J, K"), Color(0.9, 0.9, 0.3))

func _add_header_row(container: VBoxContainer, text: String, col: Color) -> void:
	var lbl := Label.new()
	lbl.text = text
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.add_theme_font_override("font", UIThemeManager.FONT_PRESS_START_2P)
	lbl.add_theme_font_size_override("font_size", 6)
	lbl.add_theme_color_override("font_color", col)
	container.add_child(lbl)

func _add_row(container: VBoxContainer, move_name: String, move_cmd: String, col: Color = Color("#ffffff")) -> void:
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER

	var lbl_name := Label.new()
	lbl_name.text = move_name
	lbl_name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl_name.add_theme_font_override("font", UIThemeManager.FONT_PRESS_START_2P)
	lbl_name.add_theme_font_size_override("font_size", 6)
	lbl_name.add_theme_color_override("font_color", col)
	row.add_child(lbl_name)

	var lbl_cmd := Label.new()
	lbl_cmd.text = move_cmd
	lbl_cmd.add_theme_font_override("font", UIThemeManager.FONT_PRESS_START_2P)
	lbl_cmd.add_theme_font_size_override("font_size", 6)
	lbl_cmd.add_theme_color_override("font_color", UIThemeManager.COLOR_ARCADE_GREEN if col == Color("#ffffff") else col)
	lbl_cmd.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(lbl_cmd)

	container.add_child(row)
