# ==============================================================================
# LeonController.gd - Controlador de "El León" (Torneo Argento)
# Versión 2.0 - Proporciones MK, Extremidades Largas, Sprites 192x192 px
# Diseñado para Godot Engine 4 (CharacterBody2D)
# ==============================================================================
class_name LeonController
extends CharacterBody2D

# ------------------------------------------------------------------------------
# 1. ENUMS Y SEÑALES
# ------------------------------------------------------------------------------
enum State {
	IDLE,
	WALK,
	RUN,
	CROUCH,
	JUMP,
	BLOCK,
	ATTACK,
	HURT,
	KNOCKDOWN,
	WIN,
	LOSE
}

signal state_changed(old_state: State, new_state: State)
signal health_changed(current_hp: float, max_hp: float)
signal attack_hit_connected(attack_name: String, damage: float)
signal character_defeated()

# ------------------------------------------------------------------------------
# 2. VARIABLES EXPORTADAS Y PARÁMETROS DE COMBATE
# ------------------------------------------------------------------------------
@export_group("Referencias")
@export var opponent: Node2D = null
@export var sprite_path: NodePath = "Sprite2D"
@export var anim_player_path: NodePath = "AnimationPlayer"
@export var collision_shape_path: NodePath = "CollisionShape2D"
@export var hitbox_path: NodePath = "Hitbox"

@export_group("Atributos Físicos (Base 192px)")
@export var walk_speed: float = 220.0
@export var run_multiplier: float = 2.0
@export var jump_velocity: float = -620.0
@export var gravity: float = 1400.0

@export_group("Combate y Salud")
@export var max_health: float = 100.0
@export var current_health: float = 100.0
@export var block_damage_reduction: float = 0.8 # Reduce 80% en bloqueo (recibe solo 20%)

# ------------------------------------------------------------------------------
# 3. VARIABLES INTERNAS Y DE ESTADO
# ------------------------------------------------------------------------------
var current_state: State = State.IDLE
var current_attack_name: String = ""
var is_facing_right: bool = true

# Dimensiones exactas para cuerpo de El León (Escala 0.375, 25% más grande que la versión anterior)
var standing_capsule_height: float = 102.0
var standing_capsule_radius: float = 18.0
var standing_shape_pos_y: float = -51.0

# Referencias a nodos hijos
@onready var sprite: Sprite2D = get_node_or_null(sprite_path) as Sprite2D
@onready var anim_player: AnimationPlayer = get_node_or_null(anim_player_path) as AnimationPlayer
@onready var collision_shape: CollisionShape2D = get_node_or_null(collision_shape_path) as CollisionShape2D
@onready var hitbox: Area2D = get_node_or_null(hitbox_path) as Area2D

# Texturas cacheadas para el set de animaciones 192x192
var tex_base: Texture2D = null
var tex_walk_run: Texture2D = null
var tex_crouch_jump_block: Texture2D = null
var tex_punches: Texture2D = null
var tex_kicks: Texture2D = null
var tex_air_attacks: Texture2D = null
var tex_hurt_knockdown: Texture2D = null
var tex_special: Texture2D = null
var tex_specials: Texture2D = null
var tex_win_lose: Texture2D = null
var tex_fatality: Texture2D = null

# ------------------------------------------------------------------------------
# 4. INICIALIZACIÓN Y CONFIGURACIÓN AUTOMÁTICA
# ------------------------------------------------------------------------------
func _ready() -> void:
	add_to_group("fighters")
	_setup_input_map()
	_setup_collision_shape()
	_setup_sprite_and_animations()
	
	if anim_player:
		if not anim_player.animation_finished.is_connected(_on_animation_finished):
			anim_player.animation_finished.connect(_on_animation_finished)
	
	_find_opponent_if_missing()
	_play_animation_for_state(State.IDLE)


## 1. Configuración automática de controles solicitados en el InputMap
func _setup_input_map() -> void:
	var bindings: Dictionary = {
		"move_left": KEY_LEFT,
		"move_right": KEY_RIGHT,
		"jump": KEY_UP,
		"crouch": KEY_DOWN,
		"punch_high": KEY_INSERT,
		"punch_low": KEY_HOME,
		"kick_high": KEY_DELETE,
		"kick_low": KEY_END,
		"block": KEY_PAGEUP,
		"run": KEY_PAGEDOWN
	}
	
	for action_name in bindings.keys():
		var key_code: Key = bindings[action_name]
		if not InputMap.has_action(action_name):
			InputMap.add_action(action_name)
		
		var key_event := InputEventKey.new()
		key_event.physical_keycode = key_code
		
		var already_bound := false
		for existing_event in InputMap.action_get_events(action_name):
			if existing_event is InputEventKey and existing_event.physical_keycode == key_code:
				already_bound = true
				break
		
		if not already_bound:
			InputMap.action_add_event(action_name, key_event)


## Configura la cápsula de colisión única para 192px de altura
func _setup_collision_shape() -> void:
	if collision_shape:
		if collision_shape.shape == null:
			collision_shape.shape = CapsuleShape2D.new()
		else:
			collision_shape.shape = collision_shape.shape.duplicate()
		
		if collision_shape.shape is CapsuleShape2D:
			var capsule := collision_shape.shape as CapsuleShape2D
			capsule.radius = standing_capsule_radius
			capsule.height = standing_capsule_height
			collision_shape.position = Vector2(0, standing_shape_pos_y)
		elif collision_shape.shape is RectangleShape2D:
			var rect := collision_shape.shape as RectangleShape2D
			rect.size = Vector2(standing_capsule_radius * 2.0, standing_capsule_height)
			collision_shape.position = Vector2(0, standing_shape_pos_y)


## Carga de texturas 192x192 y registro automático en AnimationPlayer si faltan
func _setup_sprite_and_animations() -> void:
	if not sprite:
		return
	
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = true
	# Escala del personaje: Un 25% más grande que la versión previa (0.30 * 1.25 = 0.375)
	sprite.scale = Vector2(0.375, 0.375)
	sprite.offset = Vector2(0, -149.0) # Anclado a los pies (piso en y=0) para altura 298px
	
	tex_base = _load_texture("res://assets/sprites/el_leon_mk_base.png")
	tex_walk_run = _load_texture("res://assets/sprites/leon_walk_run.png")
	tex_crouch_jump_block = _load_texture("res://assets/sprites/leon_crouch_jump_block.png")
	tex_punches = _load_texture("res://assets/sprites/leon_punches.png")
	tex_kicks = _load_texture("res://assets/sprites/leon_kicks.png")
	tex_air_attacks = _load_texture("res://assets/sprites/leon_air_attacks.png")
	tex_hurt_knockdown = _load_texture("res://assets/sprites/leon_hurt_knockdown.png")
	tex_specials = _load_texture("res://assets/sprites/leon_specials.png")
	tex_special = tex_specials if tex_specials != null else _load_texture("res://assets/sprites/leon_special_projectile.png")
	tex_win_lose = _load_texture("res://assets/sprites/leon_win_lose.png")
	tex_fatality = _load_texture("res://assets/sprites/leon_fatality.png")
	
	if tex_base and sprite.texture == null:
		sprite.texture = tex_base
		sprite.hframes = 1
		sprite.vframes = 1
		sprite.frame = 0
	
	if anim_player:
		_build_animation_library()


func _load_texture(path: String) -> Texture2D:
	if ResourceLoader.exists(path):
		return load(path)
	elif FileAccess.file_exists(path):
		var global_p = ProjectSettings.globalize_path(path)
		var img = Image.load_from_file(global_p)
		if img:
			return ImageTexture.create_from_image(img)
	return null


func _build_animation_library() -> void:
	if not anim_player:
		return
	
	var lib: AnimationLibrary = null
	if anim_player.has_animation_library(""):
		lib = anim_player.get_animation_library("")
	else:
		lib = AnimationLibrary.new()
		anim_player.add_animation_library("", lib)
	
	# Construir automáticamente las animaciones de las hojas de sprites si no existen
	if tex_base and not lib.has_animation("idle"):
		lib.add_animation("idle", _create_anim(tex_base, 1, 1, [0], 0.2, true))
	if tex_walk_run:
		if not lib.has_animation("walk_forward"):
			lib.add_animation("walk_forward", _create_anim(tex_walk_run, 4, 2, [0, 1, 2, 3], 0.12, true))
		if not lib.has_animation("walk_backward"):
			lib.add_animation("walk_backward", _create_anim(tex_walk_run, 4, 2, [3, 2, 1, 0], 0.12, true))
		if not lib.has_animation("run"):
			lib.add_animation("run", _create_anim(tex_walk_run, 4, 2, [4, 5, 6, 7], 0.08, true))
	elif tex_base and not lib.has_animation("walk_forward"):
		lib.add_animation("walk_forward", _create_anim(tex_base, 1, 1, [0], 0.15, true))
		lib.add_animation("walk_backward", _create_anim(tex_base, 1, 1, [0], 0.15, true))
		lib.add_animation("run", _create_anim(tex_base, 1, 1, [0], 0.1, true))
	
	if tex_crouch_jump_block:
		# Grid 4x3: Row 0 (0..2 crouch), Row 1 (4..7 jump), Row 2 (8 block estático)
		if not lib.has_animation("crouch"):
			lib.add_animation("crouch", _create_anim(tex_crouch_jump_block, 4, 3, [0, 1], 0.1, false))
		if not lib.has_animation("jump"):
			lib.add_animation("jump", _create_anim(tex_crouch_jump_block, 4, 3, [4, 5, 6, 7], 0.12, false))
		if not lib.has_animation("block"):
			lib.add_animation("block", _create_anim(tex_crouch_jump_block, 4, 3, [8], 0.20, false))
	
	if tex_punches:
		# Grid 4x3: Row 0 High punch (0..3), Row 1 Mid/Low punch (4..7), Row 2 Crouch punch (8..11)
		if not lib.has_animation("punch_high"):
			lib.add_animation("punch_high", _create_anim(tex_punches, 4, 3, [0, 1, 2, 3], 0.08, false))
		if not lib.has_animation("punch_low"):
			lib.add_animation("punch_low", _create_anim(tex_punches, 4, 3, [4, 5, 6, 7], 0.08, false))
		if not lib.has_animation("crouch_punch"):
			lib.add_animation("crouch_punch", _create_anim(tex_punches, 4, 3, [8, 9, 10, 11], 0.08, false))
	
	if tex_kicks:
		# Grid 4x3: Row 0 High kick (0..3), Row 1 Low kick (4..7), Row 2 Crouch sweep (8..11)
		if not lib.has_animation("kick_high"):
			lib.add_animation("kick_high", _create_anim(tex_kicks, 4, 3, [0, 1, 2, 3], 0.09, false))
		if not lib.has_animation("kick_low"):
			lib.add_animation("kick_low", _create_anim(tex_kicks, 4, 3, [4, 5, 6, 7], 0.08, false))
		if not lib.has_animation("crouch_kick"):
			lib.add_animation("crouch_kick", _create_anim(tex_kicks, 4, 3, [8, 9, 10, 11], 0.09, false))
	
	if tex_air_attacks:
		# Grid 3x2: Row 0 Jump punch (0..2), Row 1 Jump kick (3..5)
		if not lib.has_animation("air_punch"):
			lib.add_animation("air_punch", _create_anim(tex_air_attacks, 3, 2, [0, 1, 2], 0.1, false))
		if not lib.has_animation("air_kick"):
			lib.add_animation("air_kick", _create_anim(tex_air_attacks, 3, 2, [3, 4, 5], 0.1, false))
	
	if tex_hurt_knockdown:
		# Row 0 Hurt, Row 1 Knockdown
		if not lib.has_animation("hurt"):
			lib.add_animation("hurt", _create_anim(tex_hurt_knockdown, 5, 2, [0, 1, 2], 0.08, false))
		if not lib.has_animation("knockdown"):
			lib.add_animation("knockdown", _create_anim(tex_hurt_knockdown, 5, 2, [5, 6, 7, 8, 9], 0.12, false))
	
	if tex_win_lose:
		if not lib.has_animation("win"):
			lib.add_animation("win", _create_anim(tex_win_lose, 4, 2, [0, 1, 2, 3], 0.14, false))
		if not lib.has_animation("lose"):
			lib.add_animation("lose", _create_anim(tex_win_lose, 4, 2, [4, 5, 6, 7], 0.14, false))
			
	if tex_specials:
		if not lib.has_animation("special_mic"):
			lib.add_animation("special_mic", _create_anim(tex_specials, 4, 4, [0, 1, 2, 3], 0.09, false))
		if not lib.has_animation("special_chainsaw"):
			lib.add_animation("special_chainsaw", _create_anim(tex_specials, 4, 4, [4, 5, 6, 7], 0.08, false))
		if not lib.has_animation("special_roar"):
			lib.add_animation("special_roar", _create_anim(tex_specials, 4, 4, [8, 9, 10, 11], 0.09, false))
		if not lib.has_animation("special_mordisco"):
			lib.add_animation("special_mordisco", _create_anim(tex_specials, 4, 4, [12, 13, 14, 15], 0.09, false))
			
	if tex_fatality:
		if not lib.has_animation("fatality"):
			lib.add_animation("fatality", _create_anim(tex_fatality, 6, 1, [0, 1, 2, 3, 4, 5], 0.16, false))


func _create_anim(tex: Texture2D, h_frames: int, v_frames: int, frames: Array, fps: float, loop: bool) -> Animation:
	var anim := Animation.new()
	anim.length = fps * max(1, frames.size())
	anim.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	
	var spr_path := String(sprite_path)
	
	var t_idx := anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(t_idx, spr_path + ":texture")
	anim.track_insert_key(t_idx, 0.0, tex)
	
	var h_idx := anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(h_idx, spr_path + ":hframes")
	anim.track_insert_key(h_idx, 0.0, h_frames)
	
	var v_idx := anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(v_idx, spr_path + ":vframes")
	anim.track_insert_key(v_idx, 0.0, v_frames)
	
	if tex != null:
		var off_idx := anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(off_idx, spr_path + ":offset")
		var frame_h := tex.get_height() / float(v_frames)
		anim.track_insert_key(off_idx, 0.0, Vector2(0, -frame_h / 2.0))
	
	var f_idx := anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(f_idx, spr_path + ":frame")
	for i in range(frames.size()):
		anim.track_insert_key(f_idx, i * fps, frames[i])
		
	return anim


func _find_opponent_if_missing() -> void:
	if opponent != null:
		return
	var tree := get_tree()
	if not tree:
		return
	for node in tree.get_nodes_in_group("fighters"):
		if node != self and node is Node2D:
			opponent = node
			break
	if opponent == null:
		for node in tree.get_nodes_in_group("opponents"):
			if node != self and node is Node2D:
				opponent = node
				break


# ------------------------------------------------------------------------------
# 5. BUCLE PRINCIPAL DE FÍSICA Y FSM
# ------------------------------------------------------------------------------
func _physics_process(delta: float) -> void:
	_apply_gravity(delta)
	_update_orientation()
	_process_state(delta)
	move_and_slide()


func _apply_gravity(delta: float) -> void:
	if not is_on_floor():
		velocity.y += gravity * delta
	else:
		if velocity.y > 0:
			velocity.y = 0.0


## 3. Mirar siempre al oponente en el suelo vía flip_h (PROHIBIDO modificar scale)
func _update_orientation() -> void:
	if opponent == null:
		_find_opponent_if_missing()
	
	if is_on_floor() and opponent != null and current_state != State.KNOCKDOWN and current_state != State.LOSE and current_state != State.WIN:
		var opp_pos_x: float = opponent.global_position.x
		var my_pos_x: float = global_position.x
		
		if opp_pos_x < my_pos_x:
			is_facing_right = false
			if sprite:
				sprite.flip_h = true
			if hitbox:
				hitbox.scale.x = -abs(hitbox.scale.x)
		elif opp_pos_x > my_pos_x:
			is_facing_right = true
			if sprite:
				sprite.flip_h = false
			if hitbox:
				hitbox.scale.x = abs(hitbox.scale.x)


func _process_state(delta: float) -> void:
	match current_state:
		State.IDLE:
			velocity.x = 0.0
			_check_common_inputs()

		State.WALK:
			_handle_movement(walk_speed)
			_check_common_inputs()

		State.RUN:
			_handle_movement(walk_speed * run_multiplier)
			_check_common_inputs()

		State.CROUCH:
			velocity.x = 0.0
			if not Input.is_action_pressed("crouch"):
				change_state(State.IDLE)
				return
			_check_attack_inputs()

		State.JUMP:
			if is_on_floor() and velocity.y >= 0:
				change_state(State.IDLE)
				return
			_check_air_attack_inputs()

		State.BLOCK:
			velocity.x = 0.0
			if not Input.is_action_pressed("block"):
				change_state(State.IDLE)
				return

		State.ATTACK:
			if is_on_floor():
				velocity.x = move_toward(velocity.x, 0.0, 800.0 * delta)
			else:
				if is_on_floor() and velocity.y >= 0:
					change_state(State.IDLE)

		State.HURT:
			velocity.x = move_toward(velocity.x, 0.0, 600.0 * delta)

		State.KNOCKDOWN:
			velocity.x = move_toward(velocity.x, 0.0, 400.0 * delta)

		State.WIN, State.LOSE:
			velocity.x = 0.0


func _handle_movement(target_speed: float) -> void:
	var move_axis := 0.0
	if Input.is_action_pressed("move_right"): move_axis += 1.0
	if Input.is_action_pressed("move_left"): move_axis -= 1.0
	
	velocity.x = move_axis * target_speed
	
	if move_axis == 0.0:
		change_state(State.IDLE)
	elif Input.is_action_pressed("run"):
		if current_state != State.RUN: change_state(State.RUN)
	else:
		if current_state != State.WALK: change_state(State.WALK)


func _check_common_inputs() -> void:
	if Input.is_action_pressed("block"):
		change_state(State.BLOCK)
		return
	
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity
		var move_axis := 0.0
		if Input.is_action_pressed("move_right"): move_axis += 1.0
		if Input.is_action_pressed("move_left"): move_axis -= 1.0
		var current_spd := (walk_speed * run_multiplier) if Input.is_action_pressed("run") else walk_speed
		velocity.x = move_axis * current_spd
		change_state(State.JUMP)
		return
	
	if Input.is_action_pressed("crouch") and is_on_floor():
		change_state(State.CROUCH)
		return
	
	if _check_attack_inputs():
		return
	
	var move_axis := 0.0
	if Input.is_action_pressed("move_right"): move_axis += 1.0
	if Input.is_action_pressed("move_left"): move_axis -= 1.0
	
	if move_axis != 0.0:
		if Input.is_action_pressed("run"):
			change_state(State.RUN)
		else:
			change_state(State.WALK)
	else:
		if current_state != State.IDLE:
			change_state(State.IDLE)


func _check_attack_inputs() -> bool:
	var attack_action: String = ""
	
	if Input.is_action_just_pressed("punch_high"):
		attack_action = "punch_high"
	elif Input.is_action_just_pressed("punch_low"):
		attack_action = "punch_low"
	elif Input.is_action_just_pressed("kick_high"):
		attack_action = "kick_high"
	elif Input.is_action_just_pressed("kick_low"):
		attack_action = "kick_low"
	
	if attack_action == "":
		return false
	
	if current_state == State.CROUCH:
		if attack_action in ["punch_high", "punch_low"]:
			_execute_attack("crouch_punch")
		else:
			_execute_attack("crouch_kick")
		return true
	else:
		_execute_attack(attack_action)
		return true


func _check_air_attack_inputs() -> bool:
	if Input.is_action_just_pressed("punch_high") or Input.is_action_just_pressed("punch_low"):
		_execute_attack("air_punch")
		return true
	elif Input.is_action_just_pressed("kick_high") or Input.is_action_just_pressed("kick_low"):
		_execute_attack("air_kick")
		return true
	return false


func _execute_attack(attack_name: String) -> void:
	current_attack_name = attack_name
	change_state(State.ATTACK)
	_play_animation(attack_name)


# ------------------------------------------------------------------------------
# 6. GESTOR DE TRANSICIÓN DE ESTADOS Y AJUSTE DE COLISIONES
# ------------------------------------------------------------------------------
func change_state(new_state: State) -> void:
	if current_state == new_state and new_state != State.ATTACK:
		return
	
	var old_state := current_state
	current_state = new_state
	
	_adjust_collision_for_state(new_state)
	_play_animation_for_state(new_state)
	
	emit_signal("state_changed", old_state, new_state)


## Reducción de cápsula a la mitad únicamente en CROUCH (PROHIBIDO tocar scale)
func _adjust_collision_for_state(state: State) -> void:
	if not collision_shape or not collision_shape.shape:
		return
	
	var is_crouching_or_crouch_attack: bool = (state == State.CROUCH) or (state == State.ATTACK and current_attack_name in ["crouch_punch", "crouch_kick"])
	
	if is_crouching_or_crouch_attack:
		if collision_shape.shape is CapsuleShape2D:
			var capsule := collision_shape.shape as CapsuleShape2D
			capsule.height = standing_capsule_height * 0.5
		elif collision_shape.shape is RectangleShape2D:
			var rect := collision_shape.shape as RectangleShape2D
			rect.size.y = standing_capsule_height * 0.5
		
		collision_shape.position.y = standing_shape_pos_y * 0.5
	else:
		if collision_shape.shape is CapsuleShape2D:
			var capsule := collision_shape.shape as CapsuleShape2D
			capsule.height = standing_capsule_height
		elif collision_shape.shape is RectangleShape2D:
			var rect := collision_shape.shape as RectangleShape2D
			rect.size.y = standing_capsule_height
		
		collision_shape.position.y = standing_shape_pos_y


# ------------------------------------------------------------------------------
# 7. GESTIÓN DE ANIMACIONES
# ------------------------------------------------------------------------------
func _play_animation_for_state(state: State) -> void:
	match state:
		State.IDLE: _play_animation("idle")
		State.WALK:
			var moving_forward := (velocity.x > 0 and is_facing_right) or (velocity.x < 0 and not is_facing_right)
			_play_animation("walk_forward" if moving_forward else "walk_backward")
		State.RUN: _play_animation("run")
		State.CROUCH: _play_animation("crouch")
		State.JUMP: _play_animation("jump")
		State.BLOCK: _play_animation("block")
		State.HURT: _play_animation("hurt")
		State.KNOCKDOWN: _play_animation("knockdown")
		State.WIN: _play_animation("win")
		State.LOSE: _play_animation("lose")


func _play_animation(anim_name: String) -> void:
	if not anim_player:
		return
	if anim_player.has_animation(anim_name):
		anim_player.play(anim_name)
	else:
		if anim_name in ["walk_forward", "walk_backward"] and anim_player.has_animation("walk"):
			anim_player.play("walk")


func _on_animation_finished(anim_name: String) -> void:
	match current_state:
		State.ATTACK:
			if Input.is_action_pressed("crouch") and is_on_floor():
				change_state(State.CROUCH)
			elif not is_on_floor():
				change_state(State.JUMP)
			else:
				change_state(State.IDLE)
		State.HURT:
			change_state(State.IDLE if is_on_floor() else State.JUMP)
		State.KNOCKDOWN:
			if current_health > 0:
				change_state(State.IDLE)
			else:
				change_state(State.LOSE)


# ------------------------------------------------------------------------------
# 8. SISTEMA DE DAÑO Y BLOQUEO
# ------------------------------------------------------------------------------
func take_damage(raw_damage: float, is_heavy_knockdown: bool = false, attack_source_pos: Vector2 = Vector2.ZERO) -> void:
	if current_state == State.LOSE or current_state == State.WIN:
		return
	
	var final_damage := raw_damage
	
	# En BLOCK: reduce el daño un 80%
	if current_state == State.BLOCK:
		final_damage = raw_damage * (1.0 - block_damage_reduction)
		var push_dir: float = -1.0 if is_facing_right else 1.0
		velocity.x = push_dir * 120.0
		_play_animation("block")
	else:
		var push_dir: float = -1.0 if is_facing_right else 1.0
		velocity.x = push_dir * (350.0 if is_heavy_knockdown else 180.0)
		if is_heavy_knockdown:
			velocity.y = -350.0
			change_state(State.KNOCKDOWN)
		else:
			change_state(State.HURT)
	
	current_health = max(0.0, current_health - final_damage)
	emit_signal("health_changed", current_health, max_health)
	
	if current_health <= 0:
		emit_signal("character_defeated")
		change_state(State.LOSE)
