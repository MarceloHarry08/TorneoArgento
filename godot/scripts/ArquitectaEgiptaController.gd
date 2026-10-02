# ==============================================================================
# ArquitectaEgiptaController.gd - Controlador de "Arquitecta Egipta"
# Personaje 2D Fighting Game para Godot Engine 4 (CharacterBody2D)
# Matching anatómico y proporciones de celda 192x192 px con "El León"
# ==============================================================================
class_name ArquitectaEgiptaController
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
	SPECIAL_PYRAMID,
	SPECIAL_INVISIBILITY,
	SPECIAL_CHORIPAN,
	SPECIAL_GIANT_HAND,
	HURT,
	KNOCKDOWN,
	WIN,
	LOSE
}

signal state_changed(old_state: State, new_state: State)
signal health_changed(current_hp: float, max_hp: float)
signal attack_hit_connected(attack_name: String, damage: float)
signal combo_executed(special_name: String)
signal invisibility_changed(is_invisible: bool)
signal character_defeated()

# ------------------------------------------------------------------------------
# 2. PARÁMETROS EXPORTADOS (FÍSICA Y COMBATE)
# ------------------------------------------------------------------------------
@export_group("Referencias")
@export var opponent: Node2D = null
@export var sprite_path: NodePath = "Sprite2D"
@export var anim_player_path: NodePath = "AnimationPlayer"
@export var collision_shape_path: NodePath = "CollisionShape2D"
@export var hitbox_path: NodePath = "Hitbox"

@export_group("Físicas y Velocidad")
@export var walk_speed: float = 150.0       # Caminata fluida a 150 px/s
@export var run_speed: float = 320.0        # Carrera (run) a 320 px/s
@export var jump_velocity: float = -580.0
@export var gravity: float = 1350.0

@export_group("Combate y Salud")
@export var max_health: float = 100.0
@export var current_health: float = 100.0
@export var block_damage_reduction: float = 0.80 # Reduce 80% del daño recibido

# ------------------------------------------------------------------------------
# 3. VARIABLES INTERNAS Y NODOS HIJOS
# ------------------------------------------------------------------------------
var current_state: State = State.IDLE
var current_attack_name: String = ""
var is_facing_right: bool = true

# Dimensiones exactas de cápsula de colisión (Base 192 px de altura)
var standing_capsule_height: float = 102.0
var standing_capsule_radius: float = 18.0
var standing_shape_pos_y: float = -51.0

# Sistema de Invisibilidad (Especial 2)
var is_invisible: bool = false
var invisibility_timer: Timer = null
const INVISIBILITY_DURATION: float = 5.0
const INVISIBILITY_ALPHA: float = 0.15

# Sistema de Input Buffer para detección de combos especiales
var input_buffer: Array[Dictionary] = []
const BUFFER_WINDOW: float = 0.45 # Ventana de tiempo máxima para encadenar combo

# Escenas precargadas de ataques especiales
const SCENE_PIRAMIDE := preload("res://scenes/PiramideProyectil.tscn")
const SCENE_CHORIPAN := preload("res://scenes/ChoripanBomba.tscn")

var tex_idle_walk_run: Texture2D = null
var tex_crouch_jump_block: Texture2D = null
var tex_punches: Texture2D = null
var tex_kicks: Texture2D = null
var tex_air_attacks: Texture2D = null
var tex_hurt_knockdown: Texture2D = null
var tex_specials_1_2: Texture2D = null
var tex_specials_3_4: Texture2D = null
var tex_win_lose_fatality: Texture2D = null

@onready var sprite: Sprite2D = get_node_or_null(sprite_path) as Sprite2D
@onready var anim_player: AnimationPlayer = get_node_or_null(anim_player_path) as AnimationPlayer
@onready var collision_shape: CollisionShape2D = get_node_or_null(collision_shape_path) as CollisionShape2D
@onready var hitbox: Area2D = get_node_or_null(hitbox_path) as Area2D

# ------------------------------------------------------------------------------
# 4. INICIALIZACIÓN
# ------------------------------------------------------------------------------
func _ready() -> void:
	add_to_group("fighters")
	_setup_input_map()
	_setup_collision_shape()
	_setup_invisibility_timer()
	_setup_hitbox()
	_setup_sprite_proportions()
	_load_all_spritesheets()
	
	if anim_player:
		_build_animation_library()
		if not anim_player.animation_finished.is_connected(_on_animation_finished):
			anim_player.animation_finished.connect(_on_animation_finished)
			
	_find_opponent_if_missing()
	_change_state(State.IDLE)


## 1. Mapeo de controles estrictos
func _setup_input_map() -> void:
	var bindings: Dictionary = {
		"move_left": KEY_LEFT,
		"move_right": KEY_RIGHT,
		"jump": KEY_UP,
		"crouch": KEY_DOWN,
		"punch_high": KEY_INSERT,  # INS
		"punch_low": KEY_HOME,     # INICIO
		"kick_high": KEY_DELETE,   # SUPR
		"kick_low": KEY_END,       # FIN
		"block": KEY_PAGEUP,       # RE PÁG
		"run": KEY_PAGEDOWN        # AV PÁG
	}
	
	for action_name in bindings.keys():
		var key_code: Key = bindings[action_name]
		if not InputMap.has_action(action_name):
			InputMap.add_action(action_name)
		
		var key_event := InputEventKey.new()
		key_event.physical_keycode = key_code
		
		var already_bound := false
		for ev in InputMap.action_get_events(action_name):
			if ev is InputEventKey and ev.physical_keycode == key_code:
				already_bound = true
				break
		if not already_bound:
			InputMap.action_add_event(action_name, key_event)


## Configuración de CollisionShape2D (cápsula base de 192 px de proporción)
func _setup_collision_shape() -> void:
	if not collision_shape:
		collision_shape = CollisionShape2D.new()
		collision_shape.name = "CollisionShape2D"
		add_child(collision_shape)
		
	if collision_shape.shape == null:
		collision_shape.shape = CapsuleShape2D.new()
	else:
		collision_shape.shape = collision_shape.shape.duplicate()
		
	if collision_shape.shape is CapsuleShape2D:
		var capsule := collision_shape.shape as CapsuleShape2D
		capsule.radius = standing_capsule_radius
		capsule.height = standing_capsule_height
		collision_shape.position = Vector2(0, standing_shape_pos_y)


## Configuración del Timer de Invisibilidad (5.0 segundos)
func _setup_invisibility_timer() -> void:
	invisibility_timer = Timer.new()
	invisibility_timer.name = "InvisibilityTimer"
	invisibility_timer.wait_time = INVISIBILITY_DURATION
	invisibility_timer.one_shot = true
	invisibility_timer.timeout.connect(_on_invisibility_timeout)
	add_child(invisibility_timer)


## Hitbox de combate con detección de colisión
func _setup_hitbox() -> void:
	if not hitbox:
		hitbox = Area2D.new()
		hitbox.name = "Hitbox"
		hitbox.collision_layer = 2
		hitbox.collision_mask = 2
		var hs := CollisionShape2D.new()
		var rect := RectangleShape2D.new()
		rect.size = Vector2(56.0, 34.0)
		hs.shape = rect
		hitbox.add_child(hs)
		add_child(hitbox)
		hitbox.position = Vector2(40.0, -50.0)
		
	if not hitbox.area_entered.is_connected(_on_hitbox_area_entered):
		hitbox.area_entered.connect(_on_hitbox_area_entered)
	_set_hitbox_enabled(false)


## Ajuste de proporciones exactas de 192x192 píxeles por celda matching con El León
func _setup_sprite_proportions() -> void:
	if not sprite:
		return
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = true
	sprite.scale = Vector2(0.375, 0.375) # Misma escala visual que El León
	sprite.offset = Vector2(0, -149.0)   # Anclaje perfecto a los pies


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


# ------------------------------------------------------------------------------
# 5. INPUT BUFFER Y DETECCIÓN DE COMBOS ESPECIALES
# ------------------------------------------------------------------------------
func _unhandled_input(event: InputEvent) -> void:
	if current_state in [State.HURT, State.KNOCKDOWN, State.LOSE, State.WIN]:
		return
		
	if event is InputEventKey and event.is_pressed() and not event.echo:
		var action_str := ""
		if event.is_action_pressed("move_left"): action_str = "left"
		elif event.is_action_pressed("move_right"): action_str = "right"
		elif event.is_action_pressed("crouch"): action_str = "down"
		elif event.is_action_pressed("jump"): action_str = "up"
		elif event.is_action_pressed("punch_high"): action_str = "punch_high"
		elif event.is_action_pressed("punch_low"): action_str = "punch_low"
		elif event.is_action_pressed("kick_high"): action_str = "kick_high"
		elif event.is_action_pressed("kick_low"): action_str = "kick_low"
		elif event.is_action_pressed("block"): action_str = "block"
		elif event.is_action_pressed("run"): action_str = "run"
		
		if action_str != "":
			_register_buffer_input(action_str)
			_check_special_combos()


func _register_buffer_input(action_name: String) -> void:
	var now := Time.get_ticks_msec() / 1000.0
	input_buffer.append({ "action": action_name, "time": now })
	_clean_buffer(now)


func _clean_buffer(current_time: float) -> void:
	var valid: Array[Dictionary] = []
	for item in input_buffer:
		if current_time - item["time"] <= BUFFER_WINDOW:
			valid.append(item)
	input_buffer = valid
	if input_buffer.size() > 8:
		input_buffer.pop_front()


## Obtiene secuencia de acciones convertida a direcciones relativas ("fwd", "back", "down", etc.)
func _get_relative_buffer() -> Array[String]:
	var rel: Array[String] = []
	for item in input_buffer:
		var act: String = item["action"]
		match act:
			"left":
				rel.append("back" if is_facing_right else "fwd")
			"right":
				rel.append("fwd" if is_facing_right else "back")
			_:
				rel.append(act)
	return rel


## 3. Comprobación estricta de los 4 ATAQUES ESPECIALES
func _check_special_combos() -> bool:
	if not is_on_floor():
		return false
	if current_state in [State.HURT, State.KNOCKDOWN, State.LOSE, State.WIN]:
		return false
		
	var rel := _get_relative_buffer()
	if rel.size() < 3:
		return false
		
	var last_3 := rel.slice(-3)
	
	# Especial 1: Disparo de Pirámide (Abajo, Adelante + punch_high)
	if last_3 == ["down", "fwd", "punch_high"]:
		input_buffer.clear()
		_execute_special_piramide()
		return true
		
	# Especial 2: Invisibilidad 5 Segundos (Abajo, Abajo + block)
	if last_3 == ["down", "down", "block"]:
		input_buffer.clear()
		_execute_special_invisibility()
		return true
		
	# Especial 3: Mina de Choripán (Abajo, Atrás + kick_low)
	if last_3 == ["down", "back", "kick_low"]:
		input_buffer.clear()
		_execute_special_choripan()
		return true
		
	# Especial 4: Mano Fuck You Gigante (Atrás, Adelante + punch_high)
	if last_3 == ["back", "fwd", "punch_high"]:
		input_buffer.clear()
		_execute_special_giant_hand()
		return true
		
	return false


# ------------------------------------------------------------------------------
# 6. BUCLE DE FÍSICAS (FSM Y MOVIMIENTO)
# ------------------------------------------------------------------------------
func _physics_process(delta: float) -> void:
	_apply_gravity(delta)
	_update_orientation()
	_process_fsm(delta)
	move_and_slide()


func _apply_gravity(delta: float) -> void:
	if not is_on_floor():
		velocity.y += gravity * delta
	else:
		if velocity.y > 0.0:
			velocity.y = 0.0


## Orientación automática frente al rival
func _update_orientation() -> void:
	if opponent == null:
		_find_opponent_if_missing()
		
	if is_on_floor() and opponent != null and current_state not in [State.KNOCKDOWN, State.LOSE, State.WIN]:
		var opp_x: float = opponent.global_position.x
		var my_x: float = global_position.x
		
		if opp_x < my_x:
			is_facing_right = false
			if sprite:
				sprite.flip_h = true
			if hitbox:
				hitbox.position.x = -abs(hitbox.position.x)
		elif opp_x > my_x:
			is_facing_right = true
			if sprite:
				sprite.flip_h = false
			if hitbox:
				hitbox.position.x = abs(hitbox.position.x)


func _process_fsm(delta: float) -> void:
	match current_state:
		State.IDLE:
			velocity.x = move_toward(velocity.x, 0.0, 900.0 * delta)
			_check_ground_inputs()

		State.WALK:
			_handle_locomotion(walk_speed)
			_check_ground_inputs()

		State.RUN:
			_handle_locomotion(run_speed)
			_check_ground_inputs()

		State.CROUCH:
			velocity.x = 0.0
			if not Input.is_action_pressed("crouch"):
				_change_state(State.IDLE)
				return
			_check_crouch_attacks()

		State.JUMP:
			if is_on_floor() and velocity.y >= 0.0:
				_change_state(State.IDLE)
				return
			_check_air_attacks()

		State.BLOCK:
			# Bloqueo: fija la posición para no deslizarse
			velocity.x = 0.0
			if not Input.is_action_pressed("block"):
				_change_state(State.IDLE)

		State.ATTACK, State.SPECIAL_PYRAMID, State.SPECIAL_INVISIBILITY, State.SPECIAL_CHORIPAN, State.SPECIAL_GIANT_HAND:
			if is_on_floor():
				velocity.x = move_toward(velocity.x, 0.0, 750.0 * delta)
			else:
				if is_on_floor() and velocity.y >= 0.0:
					_change_state(State.IDLE)

		State.HURT:
			velocity.x = move_toward(velocity.x, 0.0, 500.0 * delta)

		State.KNOCKDOWN:
			velocity.x = move_toward(velocity.x, 0.0, 350.0 * delta)

		State.WIN, State.LOSE:
			velocity.x = 0.0


func _handle_locomotion(target_spd: float) -> void:
	var move_axis := 0.0
	if Input.is_action_pressed("move_right"): move_axis += 1.0
	if Input.is_action_pressed("move_left"): move_axis -= 1.0
	
	velocity.x = move_axis * target_spd
	
	if move_axis == 0.0:
		_change_state(State.IDLE)
	elif Input.is_action_pressed("run"):
		if current_state != State.RUN: _change_state(State.RUN)
	else:
		if current_state != State.WALK: _change_state(State.WALK)


func _check_ground_inputs() -> void:
	# Bloqueo (RE PÁG)
	if Input.is_action_pressed("block"):
		_change_state(State.BLOCK)
		return
		
	# Salto (Flecha Arriba)
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity
		var move_axis := 0.0
		if Input.is_action_pressed("move_right"): move_axis += 1.0
		if Input.is_action_pressed("move_left"): move_axis -= 1.0
		var current_spd := run_speed if Input.is_action_pressed("run") else walk_speed
		velocity.x = move_axis * current_spd
		_change_state(State.JUMP)
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_jump()
		return
		
	# Agacharse (Flecha Abajo)
	if Input.is_action_pressed("crouch") and is_on_floor():
		_change_state(State.CROUCH)
		return
		
	# Ataques estándar de pie
	if _check_stand_attacks():
		return
		
	# Movimiento
	var move_axis := 0.0
	if Input.is_action_pressed("move_right"): move_axis += 1.0
	if Input.is_action_pressed("move_left"): move_axis -= 1.0
	
	if move_axis != 0.0:
		if Input.is_action_pressed("run"):
			_change_state(State.RUN)
		else:
			_change_state(State.WALK)
	else:
		if current_state != State.IDLE:
			_change_state(State.IDLE)


func _check_stand_attacks() -> bool:
	if Input.is_action_just_pressed("punch_high"):
		_execute_attack("punch_high", 11.0, Vector2(50.0, -50.0), Vector2(58.0, 32.0))
		return true
	elif Input.is_action_just_pressed("punch_low"):
		_execute_attack("punch_low", 8.0, Vector2(44.0, -42.0), Vector2(52.0, 30.0))
		return true
	elif Input.is_action_just_pressed("kick_high"):
		_execute_attack("kick_high", 13.0, Vector2(54.0, -56.0), Vector2(62.0, 36.0))
		return true
	elif Input.is_action_just_pressed("kick_low"):
		_execute_attack("kick_low", 9.0, Vector2(48.0, -28.0), Vector2(54.0, 30.0))
		return true
	return false


func _check_crouch_attacks() -> bool:
	if Input.is_action_just_pressed("punch_high") or Input.is_action_just_pressed("punch_low"):
		_execute_attack("crouch_punch", 7.0, Vector2(48.0, -20.0), Vector2(56.0, 28.0))
		return true
	elif Input.is_action_just_pressed("kick_high") or Input.is_action_just_pressed("kick_low"):
		_execute_attack("crouch_sweep", 8.0, Vector2(56.0, -14.0), Vector2(66.0, 26.0))
		return true
	return false


func _check_air_attacks() -> bool:
	if Input.is_action_just_pressed("punch_high") or Input.is_action_just_pressed("punch_low"):
		_execute_attack("air_punch", 10.0, Vector2(46.0, -40.0), Vector2(54.0, 32.0))
		return true
	elif Input.is_action_just_pressed("kick_high") or Input.is_action_just_pressed("kick_low"):
		_execute_attack("air_kick", 12.0, Vector2(52.0, -32.0), Vector2(60.0, 34.0))
		return true
	return false


# ------------------------------------------------------------------------------
# 7. EJECUCIÓN DE ATAQUES BÁSICOS Y ESPECIALES
# ------------------------------------------------------------------------------
func _execute_attack(atk_name: String, dmg: float, reach_pos: Vector2, box_size: Vector2) -> void:
	# Al atacar, la invisibilidad se rompe inmediatamente
	if is_invisible:
		_deactivate_invisibility()
		
	current_attack_name = atk_name
	_change_state(State.ATTACK)
	_play_animation(atk_name)
	
	var facing_sign := 1.0 if is_facing_right else -1.0
	_set_hitbox_properties(Vector2(reach_pos.x * facing_sign, reach_pos.y), box_size, dmg, atk_name)
	_set_hitbox_enabled(true)
	
	if has_node("/root/SoundEngine"):
		if "punch" in atk_name:
			get_node("/root/SoundEngine").play_punch_whoosh()
		else:
			get_node("/root/SoundEngine").play_kick_whoosh()


## Especial 1: Disparo de Pirámide (instancia proyectil)
func _execute_special_piramide() -> void:
	if is_invisible: _deactivate_invisibility()
	_change_state(State.SPECIAL_PYRAMID)
	_play_animation("special_piramide")
	emit_signal("combo_executed", "Disparo de Pirámide")
	
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_special()
		
	# Instanciar el proyectil
	var proj := SCENE_PIRAMIDE.instantiate()
	var spawn_x := 38.0 if is_facing_right else -38.0
	proj.global_position = global_position + Vector2(spawn_x, -48.0)
	var dir := Vector2.RIGHT if is_facing_right else Vector2.LEFT
	proj.setup(self, dir, 18.0, 460.0)
	get_parent().add_child(proj)


## Especial 2: Invisibilidad 5 Segundos (modula sprite alpha a 0.15)
func _execute_special_invisibility() -> void:
	_change_state(State.SPECIAL_INVISIBILITY)
	_play_animation("special_invisibility")
	emit_signal("combo_executed", "Invisibilidad Mística")
	
	is_invisible = true
	emit_signal("invisibility_changed", true)
	
	if sprite:
		sprite.modulate.a = INVISIBILITY_ALPHA
	invisibility_timer.start(INVISIBILITY_DURATION)
	
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_special()


func _on_invisibility_timeout() -> void:
	_deactivate_invisibility()


func _deactivate_invisibility() -> void:
	if not is_invisible:
		return
	is_invisible = false
	invisibility_timer.stop()
	if sprite:
		sprite.modulate.a = 1.0
	emit_signal("invisibility_changed", false)


## Especial 3: Mina de Choripán (instancia nodo ChoripanBomba en el piso)
func _execute_special_choripan() -> void:
	if is_invisible: _deactivate_invisibility()
	_change_state(State.SPECIAL_CHORIPAN)
	_play_animation("special_choripan")
	emit_signal("combo_executed", "Mina de Choripán")
	
	var mina := SCENE_CHORIPAN.instantiate()
	var drop_x := -15.0 if is_facing_right else 15.0
	mina.global_position = Vector2(global_position.x + drop_x, global_position.y - 2.0)
	mina.setup(self, 26.0, 2.0)
	get_parent().add_child(mina)


## Especial 4: Mano Fuck You Gigante (hitbox gigante frontal y gran drenaje)
func _execute_special_giant_hand() -> void:
	if is_invisible: _deactivate_invisibility()
	_change_state(State.SPECIAL_GIANT_HAND)
	_play_animation("special_giant_hand")
	emit_signal("combo_executed", "Mano Fuck You Gigante")
	
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_special()
		
	# Hitbox gigante extendida frontal (gran área de impacto)
	var facing_sign := 1.0 if is_facing_right else -1.0
	var giant_box := Vector2(110.0, 68.0)
	var giant_pos := Vector2(72.0 * facing_sign, -50.0)
	_set_hitbox_properties(giant_pos, giant_box, 28.0, "giant_fuck_you")
	_set_hitbox_enabled(true)
	
	# Leve avance hacia adelante con el impulso del golpe
	velocity.x = facing_sign * 180.0


# ------------------------------------------------------------------------------
# 8. HITBOXES, COLISIONES Y DAÑO
# ------------------------------------------------------------------------------
func _set_hitbox_properties(pos: Vector2, size: Vector2, dmg: float, atk_id: String) -> void:
	if not hitbox:
		return
	hitbox.position = pos
	hitbox.set_meta("damage", dmg)
	hitbox.set_meta("attack_id", atk_id)
	var shape_node := hitbox.get_node_or_null("CollisionShape2D") as CollisionShape2D
	if shape_node and shape_node.shape is RectangleShape2D:
		(shape_node.shape as RectangleShape2D).size = size


func _set_hitbox_enabled(enabled: bool) -> void:
	if not hitbox:
		return
	var shape_node := hitbox.get_node_or_null("CollisionShape2D") as CollisionShape2D
	if shape_node:
		shape_node.set_deferred("disabled", not enabled)


func _on_hitbox_area_entered(area: Area2D) -> void:
	if area.name == "Hurtbox" or area.name == "hurtbox":
		var target := area.get_parent()
		if target != self and target != null:
			var dmg: float = hitbox.get_meta("damage") if hitbox.has_meta("damage") else 10.0
			var atk_id: String = hitbox.get_meta("attack_id") if hitbox.has_meta("attack_id") else "strike"
			var hit_dir := "right" if is_facing_right else "left"
			
			if target.has_method("take_damage"):
				target.take_damage(dmg, hit_dir, atk_id, hitbox.global_position)
			elif target.has_method("recibir_daño"):
				target.recibir_daño(dmg)
				
			emit_signal("attack_hit_connected", atk_id, dmg)
			_set_hitbox_enabled(false) # Consumir tras conectar


## Recepción de daño y Bloqueo (-80% daño)
func take_damage(raw_dmg: float, hit_dir: String = "left", _hit_type: String = "punch", _pos: Vector2 = Vector2.ZERO) -> void:
	if current_state in [State.LOSE, State.WIN]:
		return
		
	# Al recibir daño, la invisibilidad se rompe
	if is_invisible:
		_deactivate_invisibility()
		
	var final_dmg := raw_dmg
	
	if current_state == State.BLOCK:
		# Bloqueo: reduce 80% del daño y fija la posición
		final_dmg = raw_dmg * (1.0 - block_damage_reduction)
		velocity.x = 0.0
		_play_animation("block")
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_block()
	else:
		var push_dir := 1.0 if hit_dir == "right" else -1.0
		velocity.x = push_dir * 160.0
		_change_state(State.HURT)
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_light_hit()
			
	current_health = max(0.0, current_health - final_dmg)
	emit_signal("health_changed", current_health, max_health)
	
	if current_health <= 0.0:
		emit_signal("character_defeated")
		_change_state(State.LOSE)


func recibir_daño(cantidad: float) -> void:
	take_damage(cantidad)


# ------------------------------------------------------------------------------
# 9. GESTOR DE ESTADOS Y AJUSTE DE COLISIONES
# ------------------------------------------------------------------------------
func _change_state(new_state: State) -> void:
	if current_state == new_state and new_state != State.ATTACK:
		return
	var old_state := current_state
	current_state = new_state
	
	_adjust_collision_shape(new_state)
	_play_animation_for_state(new_state)
	emit_signal("state_changed", old_state, new_state)


func _adjust_collision_shape(state: State) -> void:
	if not collision_shape or not collision_shape.shape:
		return
		
	var is_crouching: bool = (state == State.CROUCH) or (state == State.ATTACK and current_attack_name in ["crouch_punch", "crouch_sweep"])
	
	if is_crouching:
		if collision_shape.shape is CapsuleShape2D:
			(collision_shape.shape as CapsuleShape2D).height = standing_capsule_height * 0.5
		collision_shape.position.y = standing_shape_pos_y * 0.5
	else:
		if collision_shape.shape is CapsuleShape2D:
			(collision_shape.shape as CapsuleShape2D).height = standing_capsule_height
		collision_shape.position.y = standing_shape_pos_y


# ------------------------------------------------------------------------------
# 10. GESTIÓN DE ANIMACIONES
# ------------------------------------------------------------------------------
func _play_animation_for_state(state: State) -> void:
	match state:
		State.IDLE: _play_animation("idle")
		State.WALK:
			var moving_fwd := (velocity.x > 0 and is_facing_right) or (velocity.x < 0 and not is_facing_right)
			_play_animation("walk_forward" if moving_fwd else "walk_backward")
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


func _on_animation_finished(_anim_name: String) -> void:
	_set_hitbox_enabled(false)
	
	match current_state:
		State.ATTACK, State.SPECIAL_PYRAMID, State.SPECIAL_INVISIBILITY, State.SPECIAL_CHORIPAN, State.SPECIAL_GIANT_HAND:
			if Input.is_action_pressed("crouch") and is_on_floor():
				_change_state(State.CROUCH)
			elif not is_on_floor():
				_change_state(State.JUMP)
			else:
				_change_state(State.IDLE)
		State.HURT:
			_change_state(State.IDLE if is_on_floor() else State.JUMP)
		State.KNOCKDOWN:
			if current_health > 0.0:
				_change_state(State.IDLE)
			else:
				_change_state(State.LOSE)


func _load_texture(path: String) -> Texture2D:
	if ResourceLoader.exists(path):
		return load(path)
	elif FileAccess.file_exists(path):
		var global_p = ProjectSettings.globalize_path(path)
		var img = Image.load_from_file(global_p)
		if img:
			return ImageTexture.create_from_image(img)
	return null


func _load_all_spritesheets() -> void:
	tex_idle_walk_run = _load_texture("res://assets/sprites/arquitecta_egipta_idle_walk_run_192x192.png")
	tex_crouch_jump_block = _load_texture("res://assets/sprites/arquitecta_egipta_crouch_jump_block_192x192.png")
	tex_punches = _load_texture("res://assets/sprites/arquitecta_egipta_punches_192x192.png")
	tex_kicks = _load_texture("res://assets/sprites/arquitecta_egipta_kicks_192x192.png")
	tex_air_attacks = _load_texture("res://assets/sprites/arquitecta_egipta_air_attacks_192x192.png")
	tex_hurt_knockdown = _load_texture("res://assets/sprites/arquitecta_egipta_hurt_knockdown_192x192.png")
	tex_specials_1_2 = _load_texture("res://assets/sprites/arquitecta_egipta_specials_1_2_192x192.png")
	tex_specials_3_4 = _load_texture("res://assets/sprites/arquitecta_egipta_specials_3_4_192x192.png")
	tex_win_lose_fatality = _load_texture("res://assets/sprites/arquitecta_egipta_win_lose_fatality_192x192.png")


func _build_animation_library() -> void:
	if not anim_player:
		return
	
	var lib: AnimationLibrary = null
	if anim_player.has_animation_library(""):
		lib = anim_player.get_animation_library("")
	else:
		lib = AnimationLibrary.new()
		anim_player.add_animation_library("", lib)
	
	# 1. Idle, Walk, Run (Grid 4x3)
	if tex_idle_walk_run:
		if not lib.has_animation("idle"):
			lib.add_animation("idle", _create_anim(tex_idle_walk_run, 4, 3, [0, 1, 2, 3], 0.16, true))
		if not lib.has_animation("walk_forward"):
			lib.add_animation("walk_forward", _create_anim(tex_idle_walk_run, 4, 3, [4, 5, 6, 7], 0.12, true))
		if not lib.has_animation("walk_backward"):
			lib.add_animation("walk_backward", _create_anim(tex_idle_walk_run, 4, 3, [7, 6, 5, 4], 0.12, true))
		if not lib.has_animation("walk"):
			lib.add_animation("walk", _create_anim(tex_idle_walk_run, 4, 3, [4, 5, 6, 7], 0.12, true))
		if not lib.has_animation("run"):
			lib.add_animation("run", _create_anim(tex_idle_walk_run, 4, 3, [8, 9, 10, 11], 0.08, true))
	
	# 2. Crouch, Jump, Block (Grid 4x3)
	if tex_crouch_jump_block:
		if not lib.has_animation("crouch"):
			lib.add_animation("crouch", _create_anim(tex_crouch_jump_block, 4, 3, [0, 1], 0.1, false))
		if not lib.has_animation("jump"):
			lib.add_animation("jump", _create_anim(tex_crouch_jump_block, 4, 3, [4, 5, 6, 7], 0.12, false))
		if not lib.has_animation("block"):
			lib.add_animation("block", _create_anim(tex_crouch_jump_block, 4, 3, [8, 9], 0.20, false))
	
	# 3. Punches (Grid 4x3)
	if tex_punches:
		if not lib.has_animation("punch_high"):
			lib.add_animation("punch_high", _create_anim(tex_punches, 4, 3, [0, 1, 2, 3], 0.08, false))
		if not lib.has_animation("punch_low"):
			lib.add_animation("punch_low", _create_anim(tex_punches, 4, 3, [4, 5, 6, 7], 0.08, false))
		if not lib.has_animation("crouch_punch"):
			lib.add_animation("crouch_punch", _create_anim(tex_punches, 4, 3, [8, 9, 10, 11], 0.08, false))
	
	# 4. Kicks (Grid 4x3)
	if tex_kicks:
		if not lib.has_animation("kick_high"):
			lib.add_animation("kick_high", _create_anim(tex_kicks, 4, 3, [0, 1, 2, 3], 0.09, false))
		if not lib.has_animation("kick_low"):
			lib.add_animation("kick_low", _create_anim(tex_kicks, 4, 3, [4, 5, 6, 7], 0.08, false))
		if not lib.has_animation("crouch_sweep"):
			lib.add_animation("crouch_sweep", _create_anim(tex_kicks, 4, 3, [8, 9, 10, 11], 0.09, false))
		if not lib.has_animation("crouch_kick"):
			lib.add_animation("crouch_kick", _create_anim(tex_kicks, 4, 3, [8, 9, 10, 11], 0.09, false))
	
	# 5. Air Attacks (Grid 3x2)
	if tex_air_attacks:
		if not lib.has_animation("air_punch"):
			lib.add_animation("air_punch", _create_anim(tex_air_attacks, 3, 2, [0, 1, 2], 0.1, false))
		if not lib.has_animation("air_kick"):
			lib.add_animation("air_kick", _create_anim(tex_air_attacks, 3, 2, [3, 4, 5], 0.1, false))
	
	# 6. Hurt & Knockdown (Grid 5x2)
	if tex_hurt_knockdown:
		if not lib.has_animation("hurt"):
			lib.add_animation("hurt", _create_anim(tex_hurt_knockdown, 5, 2, [0, 1, 2], 0.08, false))
		if not lib.has_animation("knockdown"):
			lib.add_animation("knockdown", _create_anim(tex_hurt_knockdown, 5, 2, [5, 6, 7, 8, 9], 0.12, false))
	
	# 7. Specials 1 & 2 (Grid 4x3)
	if tex_specials_1_2:
		if not lib.has_animation("special_piramide"):
			lib.add_animation("special_piramide", _create_anim(tex_specials_1_2, 4, 3, [0, 1, 2, 3], 0.10, false))
		if not lib.has_animation("special_invisibility"):
			lib.add_animation("special_invisibility", _create_anim(tex_specials_1_2, 4, 3, [8, 9, 10, 11], 0.10, false))
	
	# 8. Specials 3 & 4 (Grid 4x3)
	if tex_specials_3_4:
		if not lib.has_animation("special_choripan"):
			lib.add_animation("special_choripan", _create_anim(tex_specials_3_4, 4, 3, [0, 1, 2, 3], 0.10, false))
		if not lib.has_animation("special_giant_hand"):
			lib.add_animation("special_giant_hand", _create_anim(tex_specials_3_4, 4, 3, [4, 5, 6, 7, 8, 9], 0.09, false))
	
	# 9. Win, Lose, Fatality (Grid 6x3)
	if tex_win_lose_fatality:
		if not lib.has_animation("win"):
			lib.add_animation("win", _create_anim(tex_win_lose_fatality, 6, 3, [0, 1, 2, 3], 0.18, false))
		if not lib.has_animation("lose"):
			lib.add_animation("lose", _create_anim(tex_win_lose_fatality, 6, 3, [6, 7, 8, 9], 0.18, false))
		if not lib.has_animation("fatality"):
			lib.add_animation("fatality", _create_anim(tex_win_lose_fatality, 6, 3, [12, 13, 14, 15, 16, 17], 0.20, false))


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

