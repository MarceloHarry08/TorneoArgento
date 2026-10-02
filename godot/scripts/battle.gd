extends Node2D

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - BATTLE ARENA CONTROLLER
# ==============================================================================

@onready var stage_node: Node2D = $Stage
@onready var p1_fighter: CharacterBody2D = $P1_Fighter
@onready var p2_fighter: CharacterBody2D = $P2_Fighter
@onready var camera: Camera2D = $Camera2D

@onready var battle_hud: CanvasLayer = $BattleHUD
@onready var pause_menu: CanvasLayer = $PauseMenu
@onready var crt_overlay: ColorRect = $CRT_Overlay

var match_timer: int = 99
var timer_tick: float = 0.0

var p1_round_wins: int = 0
var p2_round_wins: int = 0
var current_round: int = 1

var is_round_active: bool = false
var is_fatality_active: bool = false
var fatality_countdown: float = 5.0
var fatality_executed: bool = false

var screen_shake: float = 0.0
var camera_original_pos: Vector2 = Vector2.ZERO

func _ready() -> void:
	camera_original_pos = camera.position
	
	if crt_overlay != null:
		crt_overlay.visible = false
	
	# Setup Stage
	var stage_id: String = GameManager.selected_stage_id if GameManager.selected_stage_id != "" else GameData.selected_stage
	stage_node.set_stage(stage_id)
	
	# Setup Fighters
	var p1_key: String = GameManager.p1_selected_id if GameManager.p1_selected_id != "" else GameData.selected_p1
	var p2_key: String = GameManager.p2_selected_id if GameManager.p2_selected_id != "" else GameData.selected_p2
	
	p1_fighter.player_id = 1
	p1_fighter.is_cpu = false
	p1_fighter.character_id = p1_key
	p1_fighter.setup_character(p1_key)
	
	p2_fighter.player_id = 2
	p2_fighter.is_cpu = GameManager.is_cpu_match
	p2_fighter.difficulty = GameManager.difficulty
	p2_fighter.character_id = p2_key
	p2_fighter.setup_character(p2_key)
	
	p1_fighter.opponent = p2_fighter
	p2_fighter.opponent = p1_fighter
	
	# Connect signals from Fighters
	p1_fighter.health_changed.connect(_on_p1_health_changed)
	p1_fighter.meter_changed.connect(_on_p1_meter_changed)
	p1_fighter.combo_hit.connect(_on_p1_combo)
	p1_fighter.state_changed.connect(_on_p1_state_changed)
	p1_fighter.impact_landed.connect(_on_fighter_impact)
	
	p2_fighter.health_changed.connect(_on_p2_health_changed)
	p2_fighter.meter_changed.connect(_on_p2_meter_changed)
	p2_fighter.combo_hit.connect(_on_p2_combo)
	p2_fighter.state_changed.connect(_on_p2_state_changed)
	p2_fighter.impact_landed.connect(_on_fighter_impact)
	
	# Setup Battle HUD
	battle_hud.setup_match(p1_key, p2_key, p1_fighter.char_data.name, p2_fighter.char_data.name, current_round)

	# Start BGM for this stage (only if enabled)
	if GameManager.music_enabled:
		var song: String = str(GameData.get_stage(stage_id).get("song", "demusicaligera"))
		if GameManager.selected_song != "auto" and GameManager.selected_song != "":
			song = GameManager.selected_song
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").start_bgm(song)
	
	# Start Round 1
	start_round()

func start_round() -> void:
	is_round_active = false
	is_fatality_active = false
	fatality_executed = false
	match_timer = 99
	timer_tick = 0.0
	battle_hud.update_timer(match_timer)
	
	p1_fighter.reset_fighter(180, 1)
	p2_fighter.reset_fighter(460, -1)
	
	battle_hud.update_rounds(p1_round_wins, p2_round_wins)
	battle_hud.set_round_number(current_round)
	
	# Announcer sequence: Round 1, Round 2, Final Round
	var is_final := (p1_round_wins == 1 and p2_round_wins == 1) or current_round >= 3
	var round_title := "RONDA FINAL" if is_final else ("RONDA %d" % current_round)
	var round_subtitle := "FINAL ROUND" if is_final else ("ROUND %d" % current_round)
		
	battle_hud.show_announcer(round_title, round_subtitle, 1.2)
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_round_start()
		get_node("/root/SoundEngine").announce_round(current_round, is_final)
	
	await get_tree().create_timer(1.2).timeout
	battle_hud.show_announcer("¡A PELEAR!", "FIGHT!", 0.8)
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_fight()
		get_node("/root/SoundEngine").play_announcer("fight")
	
	await get_tree().create_timer(0.7).timeout
	is_round_active = true

func _process(delta: float) -> void:
	# Screen Shake decay
	if screen_shake > 0.0:
		screen_shake = move_toward(screen_shake, 0.0, delta * 30.0)
		camera.position = camera_original_pos + Vector2(randf_range(-screen_shake, screen_shake), randf_range(-screen_shake, screen_shake))
	else:
		camera.position = camera_original_pos
		
	# Match Timer
	if is_round_active and not is_fatality_active:
		timer_tick += delta
		if timer_tick >= 1.0:
			timer_tick = 0.0
			match_timer -= 1
			battle_hud.update_timer(match_timer)
			if match_timer <= 0:
				_handle_time_out()
				
	# Fatality Timer
	if is_fatality_active and not fatality_executed:
		fatality_countdown -= delta
		battle_hud.update_fatality_countdown(int(ceil(fatality_countdown)))
		
		# Check for player inputs to execute Fatality
		if Input.is_action_just_pressed("punch_high") or Input.is_action_just_pressed("punch_low") or Input.is_action_just_pressed("kick_high") or Input.is_action_just_pressed("kick_low") or Input.is_action_just_pressed("p1_special1") or Input.is_action_just_pressed("p1_super"):
			_execute_fatality()
			
		if fatality_countdown <= 0.0:
			_finish_fatality_timeout()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.keycode == KEY_SPACE:
		if event.pressed and not event.echo:
			if not pause_menu.visible:
				_open_pause()
				get_viewport().set_input_as_handled()
		return
	if event.is_action_pressed("pause") or (event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE):
		if not pause_menu.visible:
			_open_pause()
			get_viewport().set_input_as_handled()
		return

func _open_pause() -> void:
	var p1_id: String = p1_fighter.character_id if p1_fighter else "leon"
	var p2_id: String = p2_fighter.character_id if p2_fighter else "latina"
	pause_menu.open_pause(p1_id, p2_id)

func _toggle_pause() -> void:
	if pause_menu.visible:
		pause_menu.close_pause()
	else:
		_open_pause()

func _on_p1_health_changed(new_hp: float, max_hp: float) -> void:
	battle_hud.update_p1_health(new_hp, max_hp)
	if new_hp <= 0.0 and is_round_active:
		_handle_round_over(p2_fighter, p1_fighter)

func _on_p2_health_changed(new_hp: float, max_hp: float) -> void:
	battle_hud.update_p2_health(new_hp, max_hp)
	if new_hp <= 0.0 and is_round_active:
		_handle_round_over(p1_fighter, p2_fighter)

func _on_p1_meter_changed(new_meter: float, max_meter: float) -> void:
	battle_hud.update_p1_meter(new_meter, max_meter)

func _on_p2_meter_changed(new_meter: float, max_meter: float) -> void:
	battle_hud.update_p2_meter(new_meter, max_meter)

func _on_p1_combo(hits: int) -> void:
	if hits > 1:
		battle_hud.show_combo(1, hits)
		screen_shake = 6.0
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_combo()

func _on_p2_combo(hits: int) -> void:
	if hits > 1:
		battle_hud.show_combo(2, hits)
		screen_shake = 6.0
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_combo()

func _on_p1_state_changed(_state: int) -> void:
	pass

func _on_p2_state_changed(_state: int) -> void:
	pass

func _on_fighter_impact(hit_pos: Vector2, damage: float, is_blocked: bool, hit_type: String) -> void:
	var shake_val := 3.0
	if is_blocked:
		shake_val = 2.0
	elif damage >= 20.0 or hit_type in ["super", "special"]:
		shake_val = 14.0
	elif damage >= 14.0 or hit_type in ["punch_high", "kick_high"]:
		shake_val = 8.0
	screen_shake = max(screen_shake, shake_val)
	
	_spawn_hit_spark(hit_pos, is_blocked, damage >= 16.0)
	_spawn_damage_popup(hit_pos, damage, is_blocked, hit_type)

func _spawn_hit_spark(pos: Vector2, is_blocked: bool, is_heavy: bool) -> void:
	var particles := CPUParticles2D.new()
	particles.position = pos
	particles.emitting = false
	particles.one_shot = true
	particles.explosiveness = 0.95
	particles.amount = 16 if is_heavy else 10
	particles.lifetime = 0.28
	particles.direction = Vector2(0, -1)
	particles.spread = 180.0
	particles.gravity = Vector2(0, 320)
	particles.initial_velocity_min = 60.0
	particles.initial_velocity_max = 140.0 if is_heavy else 85.0
	particles.scale_amount_min = 2.0
	particles.scale_amount_max = 4.0 if is_heavy else 3.0
	
	var grad := Gradient.new()
	if is_blocked:
		grad.colors = PackedColorArray([Color("#00ffff"), Color("#0088ff"), Color(0, 0.5, 1.0, 0.0)])
	elif is_heavy:
		grad.colors = PackedColorArray([Color("#ffffff"), Color("#ffd700"), Color("#ff2200"), Color(1, 0, 0, 0.0)])
	else:
		grad.colors = PackedColorArray([Color("#ffffff"), Color("#ffdd55"), Color("#ff8800"), Color(1, 0.5, 0, 0.0)])
	particles.color_ramp = grad
	
	add_child(particles)
	particles.emitting = true
	get_tree().create_timer(0.35).timeout.connect(particles.queue_free)

func _spawn_damage_popup(pos: Vector2, dmg: float, is_blocked: bool, hit_type: String) -> void:
	var lbl := Label.new()
	lbl.position = pos + Vector2(randf_range(-15, 15), -20)
	lbl.z_index = 20
	lbl.add_theme_font_override("font", UIThemeManager.FONT_PRESS_START_2P)
	lbl.add_theme_font_size_override("font_size", 9)
	
	if is_blocked:
		lbl.text = "¡BLOQUEO!"
		lbl.modulate = Color("#66d9ef")
	elif dmg >= 20.0 or hit_type == "super":
		lbl.text = "-%d ¡CRÍTICO!" % int(round(dmg))
		lbl.modulate = Color("#ff0055")
		lbl.add_theme_font_size_override("font_size", 11)
	elif hit_type == "kick_high":
		lbl.text = "-%d ¡PATADA!" % int(round(dmg))
		lbl.modulate = Color("#ff9900")
	elif hit_type == "punch_high":
		lbl.text = "-%d ¡GANCHO!" % int(round(dmg))
		lbl.modulate = Color("#ffd700")
	else:
		lbl.text = "-%d" % int(round(dmg))
		lbl.modulate = Color("#ffffff")
		
	add_child(lbl)
	
	var tween := create_tween()
	tween.tween_property(lbl, "position:y", lbl.position.y - 32.0, 0.45).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.parallel().tween_property(lbl, "modulate:a", 0.0, 0.45).set_delay(0.15)
	tween.tween_callback(lbl.queue_free)

func _handle_round_over(winner: Node2D, loser: Node2D) -> void:
	is_round_active = false
	screen_shake = 14.0
	
	if winner == p1_fighter:
		p1_round_wins += 1
	else:
		p2_round_wins += 1
		
	battle_hud.update_rounds(p1_round_wins, p2_round_wins)
	
	# Check if Match Point (Best of 3)
	if p1_round_wins >= 2 or p2_round_wins >= 2:
		_trigger_fatality_state(winner, loser)
	else:
		battle_hud.show_announcer("¡K.O.!", "¡GANADOR DE RONDA: %s!" % winner.char_data.name, 2.6)
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_ko()
			get_node("/root/SoundEngine").announce_winner(winner.character_id)
		
		await get_tree().create_timer(2.6).timeout
		current_round += 1
		start_round()

func _handle_time_out() -> void:
	is_round_active = false
	var winner: Node2D = null
	if p1_fighter.hp > p2_fighter.hp:
		winner = p1_fighter
		p1_round_wins += 1
	elif p2_fighter.hp > p1_fighter.hp:
		winner = p2_fighter
		p2_round_wins += 1
		
	battle_hud.update_rounds(p1_round_wins, p2_round_wins)
	var win_sub: String = ("¡GANADOR: %s!" % winner.char_data.name) if winner else "¡EMPATE!"
	battle_hud.show_announcer("¡TIEMPO AGOTADO!", win_sub, 2.6)
	
	await get_tree().create_timer(2.6).timeout
	
	if p1_round_wins >= 2 or p2_round_wins >= 2:
		_end_match(winner, false)
	else:
		current_round += 1
		start_round()

func _trigger_fatality_state(winner: Node2D, loser: Node2D) -> void:
	is_fatality_active = true
	fatality_countdown = 5.0
	fatality_executed = false
	
	loser.set_state(loser.State.LOSE)
	winner.set_state(winner.State.IDLE)
	
	battle_hud.show_fatality_prompt("↓ ↓ + CUALQUIER BOTÓN DE ATAQUE")
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_liquidalo()

func _execute_fatality() -> void:
	if fatality_executed:
		return
	fatality_executed = true
	battle_hud.hide_fatality_prompt()
	
	var winner: Node2D = p1_fighter if p1_round_wins >= 2 else p2_fighter
	var loser: Node2D = p2_fighter if winner == p1_fighter else p1_fighter
	
	loser.set_state(loser.State.FATALITY_VICTIM)
	winner.set_state(winner.State.FATALITY)
	
	battle_hud.show_announcer("¡FATALITY!", winner.char_data.moves.fatality.name, 3.2)
	screen_shake = 25.0
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_fatality()
	
	await get_tree().create_timer(3.2).timeout
	_end_match(winner, true)

func _finish_fatality_timeout() -> void:
	battle_hud.hide_fatality_prompt()
	var winner: Node2D = p1_fighter if p1_round_wins >= 2 else p2_fighter
	var loser: Node2D = p2_fighter if winner == p1_fighter else p1_fighter
	loser.set_state(loser.State.LOSE)
	winner.set_state(winner.State.WIN)
	_end_match(winner, false)

func _end_match(winner: Node2D, was_fatality: bool) -> void:
	var winner_id: String = winner.character_id if winner else "leon"
	var loser_id: String = p2_fighter.character_id if winner == p1_fighter else p1_fighter.character_id
	var was_perfect: bool = (winner != null and winner.hp >= 100.0)
	
	GameManager.record_match_result(winner_id, loser_id, was_fatality, was_perfect)
	
	# Also update legacy GameData
	if has_node("/root/GameData"):
		var gd = get_node("/root/GameData")
		gd.last_winner = winner_id
		gd.last_was_fatality = was_fatality
		gd.p1_wins = p1_round_wins
		gd.p2_wins = p2_round_wins
	
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").announce_winner(winner_id)
	
	if GameManager.current_mode == GameManager.GameMode.ARCADE and winner != p1_fighter:
		GameManager.goto_game_over()
	else:
		GameManager.goto_victory()
