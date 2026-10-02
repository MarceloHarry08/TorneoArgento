extends Control

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - VICTORY / FATALITY SCREEN CONTROLLER
# ==============================================================================

@onready var victory_box: Panel = $Center/VictoryBox
@onready var title_label: Label = $Center/VictoryBox/Margin/VBox/TitleLabel
@onready var winner_portrait: TextureRect = $Center/VictoryBox/Margin/VBox/PortraitBox/Portrait
@onready var winner_name_label: Label = $Center/VictoryBox/Margin/VBox/WinnerName
@onready var quote_label: Label = $Center/VictoryBox/Margin/VBox/QuoteLabel
@onready var fatality_badge: PanelContainer = $Center/VictoryBox/Margin/VBox/FatalityBadge
@onready var btn_next_tower: Button = $Center/VictoryBox/Margin/VBox/Buttons/BtnNextTower
@onready var btn_rematch: Button = $Center/VictoryBox/Margin/VBox/Buttons/BtnRematch
@onready var btn_char_select: Button = $Center/VictoryBox/Margin/VBox/Buttons/BtnCharSelect
@onready var btn_main_menu: Button = $Center/VictoryBox/Margin/VBox/Buttons/BtnMainMenu
@onready var crt_overlay: ColorRect = $CRT_Overlay

var buttons: Array[Button] = []
var active_idx: int = 0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	if crt_overlay != null:
		crt_overlay.visible = false

	_setup_screen_data()
	_connect_buttons()
	_play_entrance_animation()

func _setup_screen_data() -> void:
	var winner_key := GameManager.last_winner_id
	if winner_key.is_empty():
		winner_key = "leon"

	var char_data: Dictionary = GameData.get_character(winner_key)
	winner_name_label.text = char_data.get("name", winner_key.to_upper())
	quote_label.text = '"' + char_data.get("quote", "¡Victoria Total!") + '"'

	# Load portrait
	var path := "res://assets/ui/portraits/%s.png" % winner_key
	if ResourceLoader.exists(path):
		winner_portrait.texture = load(path)

	# Fatality badge and title
	if GameManager.last_was_fatality:
		title_label.text = "¡FATALITY!"
		title_label.add_theme_color_override("font_color", UIThemeManager.COLOR_ARCADE_RED)
		fatality_badge.visible = true
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_fatality()
			get_node("/root/SoundEngine").announce_winner(winner_key)
	else:
		title_label.text = "¡VICTORIA!"
		title_label.add_theme_color_override("font_color", UIThemeManager.COLOR_ARCADE_GOLD)
		fatality_badge.visible = false
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_ko()
			get_node("/root/SoundEngine").announce_winner(winner_key)

	# Check Tower progression button
	var is_arcade := (GameManager.current_mode == GameManager.GameMode.ARCADE)
	var is_player_win := (winner_key == GameManager.p1_selected_id)
	var has_more_opponents := (GameManager.tower_index < GameManager.TOWER_ROSTER.size() - 1)

	if is_arcade and is_player_win and has_more_opponents:
		btn_next_tower.visible = true
	else:
		btn_next_tower.visible = false

func _connect_buttons() -> void:
	buttons.clear()
	if btn_next_tower.visible:
		buttons.append(btn_next_tower)
	buttons.append(btn_rematch)
	buttons.append(btn_char_select)
	buttons.append(btn_main_menu)

	for i in range(buttons.size()):
		var b := buttons[i]
		b.focus_entered.connect(_on_btn_focus_entered.bind(i))
		b.mouse_entered.connect(_on_btn_mouse_entered.bind(b))

	btn_next_tower.pressed.connect(_on_next_tower_pressed)
	btn_rematch.pressed.connect(_on_rematch_pressed)
	btn_char_select.pressed.connect(_on_char_select_pressed)
	btn_main_menu.pressed.connect(_on_main_menu_pressed)

	if buttons.size() > 0:
		buttons[0].grab_focus()

func _on_btn_focus_entered(idx: int) -> void:
	active_idx = idx
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_beep()

func _on_btn_mouse_entered(btn: Button) -> void:
	btn.grab_focus()

func _unhandled_input(event: InputEvent) -> void:
	# Contra-banda (\) o Escape: volver al menú principal
	if event.is_action_pressed("ui_cancel") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ESCAPE or event.keycode == KEY_BACKSLASH or event.unicode == 92)):
		_on_main_menu_pressed()
		get_viewport().set_input_as_handled()
		return

	# Barra Espaciadora: Volver al menú principal
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_SPACE:
		_on_main_menu_pressed()
		get_viewport().set_input_as_handled()
		return

	if event.is_action_pressed("ui_down") or (event is InputEventKey and event.pressed and event.keycode == KEY_DOWN):
		active_idx = (active_idx + 1) % buttons.size()
		buttons[active_idx].grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_up") or (event is InputEventKey and event.pressed and event.keycode == KEY_UP):
		active_idx = (active_idx - 1 + buttons.size()) % buttons.size()
		buttons[active_idx].grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_accept") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ENTER or event.keycode == KEY_KP_ENTER)):
		buttons[active_idx].emit_signal("pressed")
		get_viewport().set_input_as_handled()

func _on_next_tower_pressed() -> void:
	_play_confirm_sound()
	GameManager.advance_tower()
	GameManager.goto_battle()

func _on_rematch_pressed() -> void:
	_play_confirm_sound()
	GameManager.goto_battle()

func _on_char_select_pressed() -> void:
	_play_confirm_sound()
	GameManager.goto_character_select()

func _on_main_menu_pressed() -> void:
	_play_confirm_sound()
	GameManager.goto_title()

func _play_confirm_sound() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()

func _play_entrance_animation() -> void:
	victory_box.scale = Vector2(0.3, 0.3)
	victory_box.modulate.a = 0.0
	var t := create_tween()
	t.tween_property(victory_box, "scale", Vector2.ONE, 0.45).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.parallel().tween_property(victory_box, "modulate:a", 1.0, 0.3)
