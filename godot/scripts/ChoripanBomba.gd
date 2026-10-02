extends Area2D

# ==============================================================================
# ChoripanBomba.gd - Mina de Choripán explosiva en el piso
# Especial 3 de "Arquitecta Egipta"
# ==============================================================================

@export var damage: float = 26.0
@export var blast_radius: float = 65.0
@export var fuse_time: float = 2.0

var planter: Node2D = null
var is_exploded: bool = false
var anim_timer: float = 0.0
var explosion_timer: float = 0.0

@onready var fuse_timer_node: Timer = Timer.new()

func _ready() -> void:
	add_to_group("hazards")
	add_child(fuse_timer_node)
	fuse_timer_node.wait_time = fuse_time
	fuse_timer_node.one_shot = true
	fuse_timer_node.timeout.connect(_on_fuse_timeout)
	fuse_timer_node.start()
	
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)

func setup(p_planter: Node2D, p_dmg: float = 26.0, p_fuse: float = 2.0) -> void:
	planter = p_planter
	damage = p_dmg
	fuse_time = p_fuse

func _process(delta: float) -> void:
	anim_timer += delta * 12.0
	
	if is_exploded:
		explosion_timer += delta
		queue_redraw()
		if explosion_timer >= 0.45:
			queue_free()
	else:
		queue_redraw()

func _draw() -> void:
	if not is_exploded:
		# Dibujo del Choripán humeante con mecha encendida
		# Pan francés
		draw_rect(Rect2(-14, -6, 28, 12), Color(0.85, 0.65, 0.35), true)
		# Chorizo criollo a la parrilla
		draw_rect(Rect2(-12, -3, 24, 6), Color(0.65, 0.20, 0.15), true)
		# Chimichurri
		draw_rect(Rect2(-6, -2, 12, 3), Color(0.35, 0.70, 0.20), true)
		
		# Mecha de dinamita con chispas
		var spark_flicker := randf_range(0.8, 1.2)
		draw_line(Vector2(10, -6), Vector2(16, -14), Color(0.3, 0.3, 0.3), 2.0)
		draw_circle(Vector2(16, -14), 3.5 * spark_flicker, Color(1.0, 0.8, 0.1))
		draw_circle(Vector2(16, -14), 1.8, Color(1.0, 0.3, 0.1))
	else:
		# Onda expansiva de fuego y humo naranja/rojo (~120px área)
		var progress := explosion_timer / 0.45
		var current_r := blast_radius * sin(progress * PI * 0.5)
		var alpha := 1.0 - progress
		draw_circle(Vector2.ZERO, current_r, Color(1.0, 0.4, 0.1, alpha * 0.7))
		draw_circle(Vector2.ZERO, current_r * 0.7, Color(1.0, 0.85, 0.2, alpha * 0.9))
		draw_circle(Vector2.ZERO, current_r * 0.4, Color(1.0, 1.0, 0.8, alpha))

func _on_body_entered(body: Node2D) -> void:
	if is_exploded or body == planter:
		return
	if body.has_method("take_damage") or body.has_method("recibir_daño"):
		_detonate()

func _on_area_entered(area: Area2D) -> void:
	if is_exploded:
		return
	var parent := area.get_parent()
	if parent != planter and (area.name == "Hurtbox" or area.name == "hurtbox"):
		_detonate()

func _on_fuse_timeout() -> void:
	if not is_exploded:
		_detonate()

func _detonate() -> void:
	if is_exploded:
		return
	is_exploded = true
	
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_special()
	
	# Daño masivo en área
	var tree := get_tree()
	if tree:
		for fighter in tree.get_nodes_in_group("fighters"):
			if fighter != planter and fighter is Node2D:
				var dist := global_position.distance_to(fighter.global_position)
				if dist <= blast_radius + 25.0:
					var hit_dir := "right" if fighter.global_position.x > global_position.x else "left"
					if fighter.has_method("take_damage"):
						fighter.take_damage(damage, hit_dir, "special", global_position)
					elif fighter.has_method("recibir_daño"):
						fighter.recibir_daño(damage)
