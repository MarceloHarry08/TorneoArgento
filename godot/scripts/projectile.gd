extends Area2D

# Projectile spawned during special moves

@export var speed: float = 420.0
var direction: Vector2 = Vector2.RIGHT
var damage: float = 18.0
var proj_type: String = "energy"
var shooter: Node = null
var life_timer: float = 2.0
var anim_time: float = 0.0

func _ready():
	add_to_group("projectiles")
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)

func setup(p_shooter: Node, p_type: String, p_dmg: float, p_dir: Vector2, p_speed: float = 420.0):
	shooter = p_shooter
	proj_type = p_type
	damage = p_dmg
	direction = p_dir.normalized()
	speed = p_speed
	
	if proj_type == "summon_drop":
		direction = Vector2.DOWN
		speed = 500.0

func _physics_process(delta: float):
	anim_time += delta * 12.0
	position += direction * speed * delta
	queue_redraw()
	
	life_timer -= delta
	if life_timer <= 0.0 or position.x < -100 or position.x > 740:
		queue_free()

func _on_body_entered(body: Node2D):
	if body == shooter:
		return
	if body.has_method("take_damage"):
		_apply_hit(body)

func _on_area_entered(area: Area2D):
	# If hitting opponent hurtbox
	var parent = area.get_parent()
	if parent != shooter and parent.has_method("take_damage") and area.name == "Hurtbox":
		_apply_hit(parent)

func _apply_hit(target: Node2D):
	var hit_dir = "right" if direction.x > 0 else "left"
	target.take_damage(damage, hit_dir)
	SoundEngine.play_heavy_hit()
	
	if proj_type == "ice_blast":
		if target.has_method("freeze_fighter"):
			target.freeze_fighter(2.0)
			SoundEngine.play_freeze()
	elif proj_type in ["poison_lips", "poison_cloud"]:
		if target.has_method("poison_fighter"):
			target.poison_fighter(3.5)
			
	# Spawn impact spark
	_spawn_spark()
	queue_free()

func _spawn_spark():
	var spark = CPUParticles2D.new()
	spark.emitting = true
	spark.one_shot = true
	spark.explosiveness = 1.0
	spark.amount = 12
	spark.lifetime = 0.3
	spark.direction = -direction
	spark.spread = 180.0
	spark.initial_velocity_min = 60.0
	spark.initial_velocity_max = 140.0
	spark.color = _get_spark_color()
	spark.global_position = global_position
	get_parent().add_child(spark)

func _get_spark_color() -> Color:
	match proj_type:
		"ice_blast", "ice_sculpture": return Color("#00ffff")
		"poison_lips", "poison_cloud": return Color("#ff007f")
		"lion_roar", "curved_ball", "gold_ball", "dollars": return Color("#ffd700")
		"pyramids", "fuchsia_beam": return Color("#bf55ec")
		_: return Color("#ffdd55")

func _draw():
	var t = anim_time
	match proj_type:
		"lion_roar":
			# Golden sonic shockwaves
			for i in range(3):
				var r = 12.0 + i * 8.0 + fmod(t * 4.0, 10.0)
				draw_arc(Vector2.ZERO, r, -PI/3, PI/3, 8, Color("#ffd700", 0.8 - i * 0.2), 3.0)
		"ice_blast":
			# Cyan crystalline star
			draw_circle(Vector2.ZERO, 9.0, Color("#a8dadc"))
			draw_rect(Rect2(-12, -3, 24, 6), Color("#ffffff"))
			draw_rect(Rect2(-3, -12, 6, 24), Color("#ffffff"))
			draw_circle(Vector2.ZERO, 5.0, Color("#ffffff"))
		"dollars", "dollar_bundle":
			# Green 100-dollar bill
			draw_rect(Rect2(-14, -8, 28, 16), Color("#2a9d8f"))
			draw_rect(Rect2(-12, -6, 24, 12), Color("#e76f51"), false, 1.0)
			draw_string(ThemeDB.fallback_font, Vector2(-6, 4), "$", HORIZONTAL_ALIGNMENT_CENTER, -1, 12, Color("#ffffff"))
		"curved_ball", "gold_ball":
			# Golden soccer ball
			draw_circle(Vector2.ZERO, 10.0, Color("#ffd700"))
			draw_circle(Vector2.ZERO, 7.0, Color("#ffffff"))
			draw_circle(Vector2.ZERO, 3.0, Color("#000000"))
		"flying_cat", "kittens":
			# Pixel kitten projectile
			draw_rect(Rect2(-10, -7, 20, 14), Color("#ffd166"))
			draw_rect(Rect2(6, -11, 4, 5), Color("#f77f00")) # Ear 1
			draw_rect(Rect2(0, -11, 4, 5), Color("#f77f00")) # Ear 2
			draw_circle(Vector2(6, -2), 2.0, Color("#00b4d8")) # Blue eye
		"pyramids":
			# Mystic pyramid
			var points = PackedVector2Array([Vector2(0, -14), Vector2(-12, 10), Vector2(12, 10)])
			draw_colored_polygon(points, Color("#ffd700"))
			draw_polyline(points, Color("#ffffff"), 2.0)
		"poison_lips":
			# Toxic kiss lips
			draw_circle(Vector2(-5, 0), 7.0, Color("#ff006e"))
			draw_circle(Vector2(5, 0), 7.0, Color("#ff006e"))
			draw_circle(Vector2(0, 3), 6.0, Color("#8338ec"))
		"grand_piano":
			# Piano dropping from sky
			draw_rect(Rect2(-18, -12, 36, 24), Color("#111111"))
			draw_rect(Rect2(-16, 4, 32, 6), Color("#ffffff"))
			for k in range(5):
				draw_rect(Rect2(-14 + k * 6, 4, 2, 4), Color("#000000"))
		"silver_cutlery":
			# Telekinetic silver knife/fork
			draw_line(Vector2(-14, 0), Vector2(14, 0), Color("#e0e1dd"), 3.0)
			draw_circle(Vector2(14, 0), 4.0, Color("#ffd700"))
		_:
			# Standard glowing 16-bit energy orb
			draw_circle(Vector2.ZERO, 10.0, Color("#ffaa00", 0.6))
			draw_circle(Vector2.ZERO, 7.0, Color("#ffffff"))
