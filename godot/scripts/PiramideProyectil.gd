extends Area2D

# ==============================================================================
# PiramideProyectil.gd - Proyectil místico de pirámide dorada
# Especial 1 de "Arquitecta Egipta"
# ==============================================================================

@export var speed: float = 460.0
@export var damage: float = 18.0

var direction: Vector2 = Vector2.RIGHT
var shooter: Node2D = null
var life_time: float = 2.5
var anim_timer: float = 0.0

func _ready() -> void:
	add_to_group("projectiles")
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)

func setup(p_shooter: Node2D, p_dir: Vector2, p_dmg: float = 18.0, p_speed: float = 460.0) -> void:
	shooter = p_shooter
	direction = p_dir.normalized()
	damage = p_dmg
	speed = p_speed

func _physics_process(delta: float) -> void:
	anim_timer += delta * 14.0
	position += direction * speed * delta
	queue_redraw()
	
	life_time -= delta
	if life_time <= 0.0 or position.x < -80.0 or position.x > 720.0:
		queue_free()

func _draw() -> void:
	# Dibujo vectorial pixel art retro de la pirámide dorada giratoria con aura celeste
	var pulse := sin(anim_timer * 0.5) * 2.0
	var aura_color := Color(0.2, 0.9, 1.0, 0.45)
	var gold_bright := Color(1.0, 0.85, 0.2, 0.95)
	var gold_dark := Color(0.85, 0.55, 0.1, 0.95)
	var glow_eye := Color(0.2, 1.0, 0.9, 1.0)
	
	# Aura mística exterior
	draw_circle(Vector2.ZERO, 18.0 + pulse, aura_color)
	
	# Pirámide de piedra dorada
	var pts_left := PackedVector2Array([Vector2(0, -16), Vector2(-15, 12), Vector2(0, 14)])
	var pts_right := PackedVector2Array([Vector2(0, -16), Vector2(15, 12), Vector2(0, 14)])
	draw_colored_polygon(pts_left, gold_bright)
	draw_colored_polygon(pts_right, gold_dark)
	
	# Ojo de Horus / Núcleo místico central
	draw_circle(Vector2(0, 0), 3.5, glow_eye)
	draw_circle(Vector2(0, 0), 1.5, Color.WHITE)

func _on_body_entered(body: Node2D) -> void:
	if body == shooter:
		return
	if body.has_method("take_damage") or body.has_method("recibir_daño"):
		_apply_damage(body)

func _on_area_entered(area: Area2D) -> void:
	var parent := area.get_parent()
	if parent != shooter and (area.name == "Hurtbox" or area.name == "hurtbox"):
		_apply_damage(parent)

func _apply_damage(target: Node) -> void:
	var hit_dir := "right" if direction.x > 0 else "left"
	if target.has_method("take_damage"):
		target.take_damage(damage, hit_dir, "special", global_position)
	elif target.has_method("recibir_daño"):
		target.recibir_daño(damage)
		
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_heavy_hit()
	queue_free()
