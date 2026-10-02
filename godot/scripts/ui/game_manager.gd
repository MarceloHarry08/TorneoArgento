extends Node

# ==============================================================================
# TORNEO ARGENTO 16-BIT - GLOBAL GAME MANAGER (AUTOLOAD SINGLETON)
# ==============================================================================

signal match_settings_changed
signal crt_filter_toggled(enabled: bool)
signal audio_settings_changed

# Game Modes
enum GameMode {
	ARCADE,
	VERSUS,
	TRAINING
}

var current_mode: GameMode = GameMode.ARCADE
var is_cpu_match: bool = true

# Character Selections
var p1_selected_id: String = "leon"
var p2_selected_id: String = "latina"

# Stage & Difficulty
var selected_stage_id: String = "obelisco"
var difficulty: String = "normal" # "easy", "normal", "hard", "extremo"
var selected_song: String = "auto"

# Settings
var crt_filter_enabled: bool = false
var music_enabled: bool = false
var sfx_enabled: bool = true

# Arcade Tower Progression
var tower_index: int = 0
const TOWER_ROSTER: Array[String] = [
	"latina", "ojosazules", "pepeargento", "eleternauta",
	"elcomandante", "elmesias", "badbitch", "inmortal"
]

# Match Outcomes
var last_winner_id: String = "leon"
var last_loser_id: String = "latina"
var last_was_fatality: bool = false
var last_was_perfect: bool = false
var p1_round_wins: int = 0
var p2_round_wins: int = 0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	# Sync with SoundEngine if available
	_apply_audio_settings()

func set_mode(mode: GameMode) -> void:
	current_mode = mode
	match mode:
		GameMode.ARCADE:
			is_cpu_match = true
			tower_index = 0
			p2_selected_id = TOWER_ROSTER[0]
		GameMode.VERSUS:
			is_cpu_match = false
		GameMode.TRAINING:
			is_cpu_match = true
	emit_signal("match_settings_changed")

func start_arcade_match() -> void:
	set_mode(GameMode.ARCADE)
	goto_character_select()

func start_versus_match() -> void:
	set_mode(GameMode.VERSUS)
	goto_character_select()

func start_training_match() -> void:
	set_mode(GameMode.TRAINING)
	goto_character_select()

func confirm_selections(p1: String, p2: String, stage: String = "auto") -> void:
	p1_selected_id = p1
	p2_selected_id = p2
	
	if stage == "auto" or stage.is_empty():
		if current_mode == GameMode.ARCADE:
			selected_stage_id = _get_stage_for_opponent(p2)
		else:
			var stages: Array = ["obelisco", "casarosada", "caminito", "glaciar", "mesaza"]
			selected_stage_id = stages[randi() % stages.size()]
	else:
		selected_stage_id = stage
		
	# Synchronize with legacy GameData if it exists
	if has_node("/root/GameData"):
		var gd = get_node("/root/GameData")
		gd.selected_p1 = p1_selected_id
		gd.selected_p2 = p2_selected_id
		gd.selected_stage = selected_stage_id
		gd.difficulty = difficulty
		gd.game_mode = "arcade" if current_mode == GameMode.ARCADE else ("vs_cpu" if is_cpu_match else "vs_player")
		
	goto_battle()

func advance_tower() -> bool:
	tower_index += 1
	if tower_index < TOWER_ROSTER.size():
		p2_selected_id = TOWER_ROSTER[tower_index]
		selected_stage_id = _get_stage_for_opponent(p2_selected_id)
		if has_node("/root/GameData"):
			var gd = get_node("/root/GameData")
			gd.tower_index = tower_index
			gd.selected_p2 = p2_selected_id
			gd.selected_stage = selected_stage_id
		return true
	return false

func _get_stage_for_opponent(opp_key: String) -> String:
	match opp_key:
		"inmortal":
			return "mesaza"
		"leon", "latina", "ojosazules":
			return "casarosada"
		"elmesias", "pepeargento", "hugo", "pergolas":
			return "caminito"
		"sangrejaponesa", "eleternauta":
			return "glaciar"
		_:
			return "obelisco"

func record_match_result(winner_id: String, loser_id: String, was_fatality: bool = false, was_perfect: bool = false) -> void:
	last_winner_id = winner_id
	last_loser_id = loser_id
	last_was_fatality = was_fatality
	last_was_perfect = was_perfect

func toggle_crt_filter() -> bool:
	crt_filter_enabled = not crt_filter_enabled
	emit_signal("crt_filter_toggled", crt_filter_enabled)
	return crt_filter_enabled

func toggle_music() -> bool:
	music_enabled = not music_enabled
	_apply_audio_settings()
	return music_enabled

func toggle_sfx() -> bool:
	sfx_enabled = not sfx_enabled
	_apply_audio_settings()
	return sfx_enabled

func _apply_audio_settings() -> void:
	if has_node("/root/SoundEngine"):
		var se = get_node("/root/SoundEngine")
		se.bgm_enabled = music_enabled
		se.sfx_enabled = sfx_enabled
		if not music_enabled and se.bgm_player != null:
			se.bgm_player.stop()
	emit_signal("audio_settings_changed")

# Scene Navigation Helpers
func goto_title() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/title_menu.tscn")

func goto_character_select() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/character_select.tscn")

func goto_battle() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/battle.tscn")

func goto_victory() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/victory_screen.tscn")

func goto_game_over() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/game_over_screen.tscn")

func _input(event: InputEvent) -> void:
	if not (event is InputEventKey and event.pressed and not event.echo):
		return
		
	var key_ev := event as InputEventKey
	var key: int = key_ev.keycode
	var is_backslash: bool = (key == KEY_BACKSLASH or key_ev.unicode == 92)
	
	var current_scene: Node = get_tree().current_scene
	var scene_name: String = current_scene.name if current_scene != null else ""
	var is_in_battle: bool = (scene_name == "Battle")

	# Contra-banda (\): En todo momento regresa hacia atrás, SALVO en la pelea
	if is_backslash:
		if is_in_battle:
			# Durante la pelea no hace nada (salvo en el momento de la pelea)
			return
		
		# Si estamos en el modal de TitleMenu, cerrarlo
		if scene_name == "TitleMenu" and current_scene != null:
			var opt_modal := current_scene.get_node_or_null("Modals/OptionsModal") as CanvasItem
			if opt_modal != null and opt_modal.visible:
				opt_modal.visible = false
				get_viewport().set_input_as_handled()
				return
		elif scene_name != "TitleMenu":
			# Volver hacia atrás al menú principal
			goto_title()
			get_viewport().set_input_as_handled()
			return
