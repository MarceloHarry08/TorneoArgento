extends Control

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - TITLE MENU CONTROLLER
# ==============================================================================

@onready var main_container: VBoxContainer = $CenterContainer/MenuBox
@onready var btn_arcade: Button = $CenterContainer/MenuBox/BtnArcade
@onready var btn_versus: Button = $CenterContainer/MenuBox/BtnVersus
@onready var btn_training: Button = $CenterContainer/MenuBox/BtnTraining
@onready var btn_options: Button = $CenterContainer/MenuBox/BtnOptions
@onready var title_label: Label = $HeaderContainer/TitleBox/GameTitle
@onready var badge_label: Label = $HeaderContainer/TitleBox/RetroBadge
@onready var footer_label: Label = $FooterContainer/FooterLabel

# Modals
@onready var options_modal: Panel = $Modals/OptionsModal
@onready var crt_overlay: ColorRect = $CRT_Overlay

# Options Modal Controls (2-Column Layout)
@onready var opt_diff_btn: OptionButton = $Modals/OptionsModal/Margin/VBox/Columns/LeftCol/DiffRow/DiffOption
@onready var opt_stage_btn: OptionButton = $Modals/OptionsModal/Margin/VBox/Columns/LeftCol/StageRow/StageOption
@onready var opt_song_btn: OptionButton = $Modals/OptionsModal/Margin/VBox/Columns/LeftCol/SongRow/SongOption
@onready var opt_crt_btn: Button = $Modals/OptionsModal/Margin/VBox/Columns/LeftCol/CRTRow/BtnToggleCRT
@onready var opt_music_btn: Button = $Modals/OptionsModal/Margin/VBox/Columns/LeftCol/MusicRow/BtnToggleMusic
@onready var opt_sfx_btn: Button = $Modals/OptionsModal/Margin/VBox/Columns/LeftCol/SFXRow/BtnToggleSFX

var menu_buttons: Array[Button] = []
var current_button_idx: int = 0
var title_tween: Tween
var badge_tween: Tween
var footer_tween: Tween

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	menu_buttons = [btn_arcade, btn_versus, btn_training, btn_options]
	_setup_button_styles()
	_connect_buttons()
	_populate_options_modal()
	_start_title_animations()
	_update_crt_state()

	# Focus first button for pure keyboard navigation
	btn_arcade.grab_focus()

	# Start Title BGM only if music is enabled
	if GameManager.music_enabled and has_node("/root/SoundEngine"):
		var se = get_node("/root/SoundEngine")
		se.start_bgm("demusicaligera")

func _setup_button_styles() -> void:
	btn_arcade.add_theme_stylebox_override("normal", UIThemeManager.create_pill_style("arcade", "normal"))
	btn_arcade.add_theme_stylebox_override("hover", UIThemeManager.create_pill_style("arcade", "hover"))
	btn_arcade.add_theme_stylebox_override("focus", UIThemeManager.create_pill_style("arcade", "hover"))
	btn_arcade.add_theme_stylebox_override("pressed", UIThemeManager.create_pill_style("arcade", "pressed"))

	btn_versus.add_theme_stylebox_override("normal", UIThemeManager.create_pill_style("versus", "normal"))
	btn_versus.add_theme_stylebox_override("hover", UIThemeManager.create_pill_style("versus", "hover"))
	btn_versus.add_theme_stylebox_override("focus", UIThemeManager.create_pill_style("versus", "hover"))
	btn_versus.add_theme_stylebox_override("pressed", UIThemeManager.create_pill_style("versus", "pressed"))

	btn_training.add_theme_stylebox_override("normal", UIThemeManager.create_pill_style("training", "normal"))
	btn_training.add_theme_stylebox_override("hover", UIThemeManager.create_pill_style("training", "hover"))
	btn_training.add_theme_stylebox_override("focus", UIThemeManager.create_pill_style("training", "hover"))
	btn_training.add_theme_stylebox_override("pressed", UIThemeManager.create_pill_style("training", "pressed"))

	btn_options.add_theme_stylebox_override("normal", UIThemeManager.create_pill_style("options", "normal"))
	btn_options.add_theme_stylebox_override("hover", UIThemeManager.create_pill_style("options", "hover"))
	btn_options.add_theme_stylebox_override("focus", UIThemeManager.create_pill_style("options", "hover"))
	btn_options.add_theme_stylebox_override("pressed", UIThemeManager.create_pill_style("options", "pressed"))

func _connect_buttons() -> void:
	for i in range(menu_buttons.size()):
		var b := menu_buttons[i]
		b.focus_entered.connect(_on_button_focus_entered.bind(i))
		b.mouse_entered.connect(_on_button_mouse_entered.bind(b))
		
	btn_arcade.pressed.connect(_on_btn_arcade_pressed)
	btn_versus.pressed.connect(_on_btn_versus_pressed)
	btn_training.pressed.connect(_on_btn_training_pressed)
	btn_options.pressed.connect(_on_btn_options_pressed)

func _on_button_focus_entered(index: int) -> void:
	current_button_idx = index
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_beep()

func _on_button_mouse_entered(btn: Button) -> void:
	btn.grab_focus()

func _unhandled_input(event: InputEvent) -> void:
	if options_modal.visible:
		if event.is_action_pressed("ui_cancel") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ESCAPE or event.keycode == KEY_BACKSLASH or event.unicode == 92)):
			_close_options_modal()
			get_viewport().set_input_as_handled()
		return

	# Contra-banda (\): volver o salir
	if event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_BACKSLASH or event.unicode == 92):
		if options_modal.visible:
			_close_options_modal()
			get_viewport().set_input_as_handled()
		return

	# Arrow Key navigation up/down
	if event.is_action_pressed("ui_down") or (event is InputEventKey and event.pressed and event.keycode == KEY_DOWN):
		current_button_idx = (current_button_idx + 1) % menu_buttons.size()
		menu_buttons[current_button_idx].grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_up") or (event is InputEventKey and event.pressed and event.keycode == KEY_UP):
		current_button_idx = (current_button_idx - 1 + menu_buttons.size()) % menu_buttons.size()
		menu_buttons[current_button_idx].grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_accept") or (event is InputEventKey and event.pressed and (event.keycode == KEY_ENTER or event.keycode == KEY_SPACE)):
		if current_button_idx >= 0 and current_button_idx < menu_buttons.size():
			menu_buttons[current_button_idx].emit_signal("pressed")
			get_viewport().set_input_as_handled()

func _on_btn_arcade_pressed() -> void:
	_play_confirm_sound()
	GameManager.set_mode(GameManager.GameMode.ARCADE)
	GameManager.goto_character_select()

func _on_btn_versus_pressed() -> void:
	_play_confirm_sound()
	GameManager.set_mode(GameManager.GameMode.VERSUS)
	GameManager.goto_character_select()

func _on_btn_training_pressed() -> void:
	_play_confirm_sound()
	GameManager.set_mode(GameManager.GameMode.TRAINING)
	GameManager.goto_character_select()

func _on_btn_options_pressed() -> void:
	_play_confirm_sound()
	_open_options_modal()

func _play_confirm_sound() -> void:
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()

func _start_title_animations() -> void:
	# 1. Title gentle scaling pulse
	title_tween = create_tween().set_loops()
	title_tween.tween_property(title_label, "scale", Vector2(1.03, 1.03), 1.2).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	title_tween.tween_property(title_label, "scale", Vector2(0.98, 0.98), 1.2).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

	# 2. Retro badge bounce
	badge_tween = create_tween().set_loops()
	badge_tween.tween_property(badge_label, "position:y", badge_label.position.y - 3.0, 0.8).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	badge_tween.tween_property(badge_label, "position:y", badge_label.position.y, 0.8).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)

	# 3. Footer blink animation
	footer_tween = create_tween().set_loops()
	footer_tween.tween_property(footer_label, "modulate:a", 0.3, 0.7).set_trans(Tween.TRANS_SINE)
	footer_tween.tween_property(footer_label, "modulate:a", 1.0, 0.7).set_trans(Tween.TRANS_SINE)

# --- OPTIONS MODAL LOGIC ---
func _populate_options_modal() -> void:
	# Difficulties
	opt_diff_btn.clear()
	opt_diff_btn.add_item("FÁCIL", 0)
	opt_diff_btn.add_item("NORMAL", 1)
	opt_diff_btn.add_item("DIFÍCIL", 2)
	opt_diff_btn.add_item("EXTREMO", 3)
	match GameManager.difficulty:
		"easy": opt_diff_btn.selected = 0
		"normal": opt_diff_btn.selected = 1
		"hard": opt_diff_btn.selected = 2
		"extremo": opt_diff_btn.selected = 3
	opt_diff_btn.item_selected.connect(_on_diff_selected)

	# Stages
	opt_stage_btn.clear()
	opt_stage_btn.add_item("ALEATORIO", 0)
	opt_stage_btn.add_item("1. Obelisco", 1)
	opt_stage_btn.add_item("2. Casa Rosada", 2)
	opt_stage_btn.add_item("3. Caminito", 3)
	opt_stage_btn.add_item("4. Glaciar", 4)
	opt_stage_btn.add_item("5. Mesaza", 5)
	opt_stage_btn.item_selected.connect(_on_stage_selected)

	# Rock Songs
	opt_song_btn.clear()
	opt_song_btn.add_item("AUTOMÁTICO", 0)
	opt_song_btn.add_item("1. De Música Ligera", 1)
	opt_song_btn.add_item("2. La Leyenda", 2)
	opt_song_btn.add_item("3. Homero", 3)
	opt_song_btn.add_item("4. Hacelo por Mí", 4)
	opt_song_btn.add_item("5. Fanky", 5)
	opt_song_btn.add_item("6. La Balada", 6)
	opt_song_btn.item_selected.connect(_on_song_selected)

	# Toggles
	_refresh_toggle_buttons()
	opt_crt_btn.pressed.connect(_on_toggle_crt_pressed)
	opt_music_btn.pressed.connect(_on_toggle_music_pressed)
	opt_sfx_btn.pressed.connect(_on_toggle_sfx_pressed)

	$Modals/OptionsModal/Margin/VBox/CloseRow/BtnCloseOptions.pressed.connect(_close_options_modal)

func _open_options_modal() -> void:
	options_modal.visible = true
	$Modals/OptionsModal/Margin/VBox/CloseRow/BtnCloseOptions.grab_focus()

func _close_options_modal() -> void:
	options_modal.visible = false
	btn_options.grab_focus()
	_play_confirm_sound()

func _on_diff_selected(index: int) -> void:
	var diffs := ["easy", "normal", "hard", "extremo"]
	GameManager.difficulty = diffs[index]
	_play_confirm_sound()

func _on_stage_selected(index: int) -> void:
	var stages := ["auto", "obelisco", "casarosada", "caminito", "glaciar", "mesaza"]
	GameManager.selected_stage_id = stages[index]
	_play_confirm_sound()

func _on_song_selected(index: int) -> void:
	var songs := ["auto", "demusicaligera", "hadaelmago", "homero", "hacelopormi", "fanky", "labalada"]
	GameManager.selected_song = songs[index]
	if songs[index] != "auto" and has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").start_bgm(songs[index])
	_play_confirm_sound()

func _on_toggle_crt_pressed() -> void:
	GameManager.toggle_crt_filter()
	_update_crt_state()
	_refresh_toggle_buttons()
	_play_confirm_sound()

func _on_toggle_music_pressed() -> void:
	GameManager.toggle_music()
	_refresh_toggle_buttons()
	_play_confirm_sound()

func _on_toggle_sfx_pressed() -> void:
	GameManager.toggle_sfx()
	_refresh_toggle_buttons()
	_play_confirm_sound()

func _refresh_toggle_buttons() -> void:
	opt_crt_btn.text = "ACTIVADO" if GameManager.crt_filter_enabled else "DESACTIVADO"
	opt_music_btn.text = "ACTIVADO" if GameManager.music_enabled else "DESACTIVADO"
	opt_sfx_btn.text = "ACTIVADO" if GameManager.sfx_enabled else "DESACTIVADO"

func _update_crt_state() -> void:
	if crt_overlay != null:
		crt_overlay.visible = GameManager.crt_filter_enabled
