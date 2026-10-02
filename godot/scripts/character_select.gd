extends Control

# TORNEO ARGENTO 16-BIT - CHARACTER & STAGE SELECTOR

@onready var grid_container: GridContainer = $CenterBox/VBox/RosterGrid
@onready var p1_preview_texture: TextureRect = $LeftPanel/PreviewTexture
@onready var p1_name_label: Label = $LeftPanel/NameLabel
@onready var p1_alias_label: Label = $LeftPanel/AliasLabel
@onready var p1_quote_label: Label = $LeftPanel/QuoteLabel
@onready var atk_bar: ProgressBar = $LeftPanel/StatsBox/AtkBar
@onready var spd_bar: ProgressBar = $LeftPanel/StatsBox/SpdBar
@onready var spc_bar: ProgressBar = $LeftPanel/StatsBox/SpcBar
@onready var specials_label: Label = $LeftPanel/SpecialsLabel

@onready var mode_button: Button = $RightPanel/VBox/ModeButton
@onready var p2_button: Button = $RightPanel/VBox/P2Button
@onready var stage_button: Button = $RightPanel/VBox/StageButton
@onready var diff_button: Button = $RightPanel/VBox/DiffButton
@onready var fight_button: Button = $RightPanel/VBox/FightButton

var selected_index: int = 0
var p2_selected_index: int = 1
var stage_index: int = 0
var diff_index: int = 1
var mode_index: int = 0

const DIFFICULTIES = ["easy", "normal", "hard", "extremo"]
const DIFF_NAMES = ["Fácil", "Normal", "Difícil", "Extremo"]
const MODES = ["arcade", "vs_cpu", "vs_player"]
const MODE_NAMES = ["Torre Arcade", "Versus CPU", "2 Jugadores (Local)"]

func _ready():
	SoundEngine.play_bgm("demusicaligera")
	_build_roster_grid()
	_update_p1_preview(GameData.ROSTER_KEYS[selected_index])
	_update_stage_button()
	_update_diff_button()
	_update_mode_button()
	_highlight_grid_buttons()

func _build_roster_grid():
	for child in grid_container.get_children():
		child.queue_free()
		
	for i in range(GameData.ROSTER_KEYS.size()):
		var char_key = GameData.ROSTER_KEYS[i]
		var data = GameData.get_character(char_key)
		
		var btn = Button.new()
		btn.custom_minimum_size = Vector2(56, 56)
		btn.text = data.name.substr(0, 7)
		btn.tooltip_text = "%s (%s)\n[Click Izq: P1 | Click Der: P2]" % [data.name, data.alias]
		
		# Set portrait texture icon
		var tex_path = "res://assets/sprites/%s_spritesheet.png" % char_key
		if ResourceLoader.exists(tex_path):
			var sheet = load(tex_path)
			var atlas = AtlasTexture.new()
			atlas.atlas = sheet
			atlas.region = GameData.STANDARD_FRAMES.portrait
			btn.icon = atlas
			btn.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
			btn.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
			btn.expand_icon = true
			
		var idx = i
		btn.pressed.connect(func(): _on_character_clicked(idx))
		btn.mouse_entered.connect(func(): _on_character_hovered(idx))
		btn.gui_input.connect(func(event):
			if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
				p2_selected_index = idx
				SoundEngine.play_ui_select()
				_update_p2_button()
				_highlight_grid_buttons()
		)
		grid_container.add_child(btn)

func _highlight_grid_buttons():
	for i in range(grid_container.get_child_count()):
		var btn = grid_container.get_child(i) as Button
		if not btn: continue
		if i == selected_index:
			btn.modulate = Color(1.3, 1.2, 0.4, 1.0) # P1 Yellow highlight
		elif mode_index != 0 and i == p2_selected_index:
			btn.modulate = Color(0.4, 0.9, 1.3, 1.0) # P2 Cyan highlight
		else:
			btn.modulate = Color(0.9, 0.9, 0.9, 1.0)

func _on_character_hovered(idx: int):
	selected_index = idx
	SoundEngine.play_ui_beep()
	_update_p1_preview(GameData.ROSTER_KEYS[selected_index])
	_highlight_grid_buttons()

func _on_character_clicked(idx: int):
	selected_index = idx
	SoundEngine.play_ui_select()
	_update_p1_preview(GameData.ROSTER_KEYS[selected_index])
	_highlight_grid_buttons()

func _update_p1_preview(char_key: String):
	var data = GameData.get_character(char_key)
	p1_name_label.text = data.name
	p1_alias_label.text = "(%s)" % data.alias
	p1_quote_label.text = '"%s"' % data.quote
	
	atk_bar.value = data.stats.atk
	spd_bar.value = data.stats.spd
	spc_bar.value = data.stats.spc
	
	# Load preview sprite
	var tex_path = "res://assets/sprites/%s_spritesheet.png" % char_key
	if ResourceLoader.exists(tex_path):
		var sheet = load(tex_path)
		var atlas = AtlasTexture.new()
		atlas.atlas = sheet
		atlas.region = GameData.STANDARD_FRAMES.idle[0]
		p1_preview_texture.texture = atlas
		
	# Specials text
	var m = data.moves
	var spec_text = "• Esp 1: %s\n• Esp 2: %s\n• Esp 3: %s\n• SÚPER: %s\n• FATALITY: %s" % [
		m.special1.name, m.special2.name, m.special3.name, m.super.name, m.fatality.name
	]
	specials_label.text = spec_text

func _on_stage_button_pressed():
	stage_index = (stage_index + 1) % GameData.STAGE_KEYS.size()
	SoundEngine.play_ui_beep()
	_update_stage_button()

func _update_stage_button():
	var st_key = GameData.STAGE_KEYS[stage_index]
	var st = GameData.get_stage(st_key)
	stage_button.text = "Escenario: %s" % st.name

func _on_diff_button_pressed():
	diff_index = (diff_index + 1) % DIFFICULTIES.size()
	SoundEngine.play_ui_beep()
	_update_diff_button()

func _update_diff_button():
	diff_button.text = "Dificultad: %s" % DIFF_NAMES[diff_index]

func _on_mode_button_pressed():
	mode_index = (mode_index + 1) % MODES.size()
	SoundEngine.play_ui_beep()
	_update_mode_button()
	_highlight_grid_buttons()

func _update_mode_button():
	mode_button.text = "Modo: %s" % MODE_NAMES[mode_index]
	p2_button.visible = (mode_index != 0)
	diff_button.visible = (mode_index != 2)
	_update_p2_button()

func _on_p2_button_pressed():
	p2_selected_index = (p2_selected_index + 1) % GameData.ROSTER_KEYS.size()
	SoundEngine.play_ui_beep()
	_update_p2_button()
	_highlight_grid_buttons()

func _update_p2_button():
	var p2_key = GameData.ROSTER_KEYS[p2_selected_index]
	var p2_data = GameData.get_character(p2_key)
	p2_button.text = "Rival (P2): %s" % p2_data.name.substr(0, 10)

func _unhandled_input(event: InputEvent):
	if event is InputEventKey and event.pressed:
		var p1_move = 0
		if event.physical_keycode == KEY_RIGHT or event.physical_keycode == KEY_D: p1_move = 1
		elif event.physical_keycode == KEY_LEFT or event.physical_keycode == KEY_A: p1_move = -1
		elif event.physical_keycode == KEY_DOWN or event.physical_keycode == KEY_S: p1_move = 4
		elif event.physical_keycode == KEY_UP or event.physical_keycode == KEY_W: p1_move = -4
		
		if p1_move != 0:
			selected_index = posmod(selected_index + p1_move, GameData.ROSTER_KEYS.size())
			SoundEngine.play_ui_beep()
			_update_p1_preview(GameData.ROSTER_KEYS[selected_index])
			_highlight_grid_buttons()
			return
			
		if mode_index != 0:
			var p2_move = 0
			if event.physical_keycode == KEY_KP_6: p2_move = 1
			elif event.physical_keycode == KEY_KP_4: p2_move = -1
			elif event.physical_keycode == KEY_KP_2: p2_move = 4
			elif event.physical_keycode == KEY_KP_8: p2_move = -4
			
			if p2_move != 0:
				p2_selected_index = posmod(p2_selected_index + p2_move, GameData.ROSTER_KEYS.size())
				SoundEngine.play_ui_beep()
				_update_p2_button()
				_highlight_grid_buttons()
				return

func _on_fight_button_pressed():
	SoundEngine.play_gong()
	GameData.selected_p1 = GameData.ROSTER_KEYS[selected_index]
	GameData.selected_stage = GameData.STAGE_KEYS[stage_index]
	GameData.difficulty = DIFFICULTIES[diff_index]
	GameData.game_mode = MODES[mode_index]
	
	if GameData.game_mode == "arcade":
		GameData.tower_index = 0
		GameData.selected_p2 = GameData.tower_opponents[0]
		get_tree().change_scene_to_file("res://scenes/tower_screen.tscn")
	else:
		GameData.selected_p2 = GameData.ROSTER_KEYS[p2_selected_index]
		get_tree().change_scene_to_file("res://scenes/battle.tscn")

func _on_back_button_pressed():
	SoundEngine.play_ui_select()
	get_tree().change_scene_to_file("res://scenes/title_screen.tscn")
