extends CharacterBody2D
class_name OjosAzules

# ==============================================================================
# TORNEO ARGENTO 16-BIT - OJOS AZULES (MAURICIO MACRI) CONTROLLER
# ==============================================================================

# Buffer de entradas y ventana de tiempo requeridos por PROMPT 7
var buffer_entradas: Array = []
var tiempo_buffer: float = 0.0
var rival_en_finish_him: bool = false

# Referencias a nodos y animaciones
@onready var sprite: Sprite2D = $Sprite2D if has_node("Sprite2D") else null
@onready var anim_player: AnimationPlayer = $AnimationPlayer if has_node("AnimationPlayer") else null
@onready var hitbox: Area2D = $Hitbox if has_node("Hitbox") else null

var projectile_scene = preload("res://scenes/projectile.tscn")
var facing_dir: int = 1
var oponente: Node2D = null

func _ready():
	add_to_group("fighters")
	# Suscripción a señales de Fatality si el battle manager existe
	var battle = get_tree().get_first_node_in_group("battle")
	if battle and battle.has_signal("fatality_state_started"):
		battle.fatality_state_started.connect(func(): rival_en_finish_him = true)
		battle.fatality_state_ended.connect(func(): rival_en_finish_him = false)

func registrar_tecla(accion: String):
	buffer_entradas.append(accion)
	tiempo_buffer = 0.35 # Ventana de tiempo para completar el combo (en segundos)
	verificar_combos()

func _process(delta):
	if tiempo_buffer > 0:
		tiempo_buffer -= delta
		if tiempo_buffer <= 0:
			buffer_entradas.clear()

func _unhandled_input(event: InputEvent):
	if event is InputEventKey and event.is_pressed() and not event.echo:
		if event.is_action_pressed("crouch") or event.is_action_pressed("move_down"):
			registrar_tecla("crouch")
		elif event.is_action_pressed("move_right"):
			registrar_tecla("move_right")
		elif event.is_action_pressed("move_left"):
			registrar_tecla("move_left")
		elif event.is_action_pressed("punch_high"):
			registrar_tecla("punch_high")
		elif event.is_action_pressed("punch_low"):
			registrar_tecla("punch_low")
		elif event.is_action_pressed("kick_high"):
			registrar_tecla("kick_high")
		elif event.is_action_pressed("kick_low"):
			registrar_tecla("kick_low")

func verificar_combos():
	var combo_str = "_".join(buffer_entradas)
	
	# Combo 1: Lluvia de Dólares (Abajo, Adelante, Piña Alta)
	if combo_str.ends_with("crouch_move_right_punch_high") or combo_str.ends_with("crouch_move_left_punch_high"):
		ejecutar_poder_dolares()
		buffer_entradas.clear()
		
	# Combo 2: Invocación Gato (Atrás, Abajo, Adelante, Patada Alta)
	elif "crouch" in combo_str and combo_str.ends_with("kick_high"):
		ejecutar_invocacion_gato()
		buffer_entradas.clear()

	# Fatality: Reposera Mortal (Adelante, Adelante, Abajo, Patada Baja)
	elif combo_str.ends_with("crouch_kick_low") and rival_en_finish_him:
		ejecutar_fatality_reposera()
		buffer_entradas.clear()

# ==============================================================================
# EJECUCIÓN DE PODERES Y COMBOS
# ==============================================================================
func ejecutar_poder_dolares():
	print("[Ojos Azules] ¡Poder 1: Lluvia de Dólares! (Fajo de 100 USD shuriken)")
	if anim_player and anim_player.has_animation("special"):
		anim_player.play("special")
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_special()
		
	_lanzar_fajo_dolares(20.0)

func ejecutar_invocacion_gato():
	print("[Ojos Azules] ¡Poder 2: Invocación Felina / El Gato!")
	if anim_player and anim_player.has_animation("special_roar"):
		anim_player.play("special_roar")
	elif anim_player and anim_player.has_animation("special"):
		anim_player.play("special")
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_critical_hit()
		
	_lanzar_gato_siames(24.0)

func ejecutar_fatality_reposera():
	print("[Ojos Azules] ¡FATALITY: Timba & Reposera!")
	if anim_player and anim_player.has_animation("fatality"):
		anim_player.play("fatality")
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_fatality()
		
	# Notificar a la escena de batalla si está disponible
	var battle = get_tree().get_first_node_in_group("battle")
	if battle and battle.has_method("_execute_fatality"):
		battle._execute_fatality()

func _lanzar_fajo_dolares(daño: float):
	if projectile_scene:
		var proj = projectile_scene.instantiate()
		var spawn_pos = global_position + Vector2(34 * facing_dir, -46)
		proj.global_position = spawn_pos
		get_parent().add_child(proj)
		if proj.has_method("setup"):
			proj.setup(self, "dollar_bundle", daño, Vector2(facing_dir, 0))

func _lanzar_gato_siames(daño: float):
	if projectile_scene:
		var proj = projectile_scene.instantiate()
		var spawn_pos = global_position + Vector2(30 * facing_dir, -30)
		proj.global_position = spawn_pos
		get_parent().add_child(proj)
		if proj.has_method("setup"):
			proj.setup(self, "flying_cat", daño, Vector2(facing_dir * 1.2, -0.2))
