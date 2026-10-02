extends Node2D

# Stage background and atmospheric 16-bit environmental effects

@export var stage_id: String = "obelisco"

@onready var background_sprite: TextureRect = $BackgroundTexture
@onready var snow_particles: CPUParticles2D = $SnowParticles

var anim_time: float = 0.0

func _ready():
	set_stage(stage_id)

func set_stage(p_stage_id: String):
	stage_id = p_stage_id
	var data = GameData.get_stage(stage_id)
	
	if ResourceLoader.exists(data.file):
		background_sprite.texture = load(data.file)
	else:
		background_sprite.texture = load("res://assets/stages/stage_obelisco.jpg")
		
	# Snow particles only active on Glaciar
	snow_particles.emitting = (stage_id == "glaciar")
	
	# Start Stage BGM
	SoundEngine.play_bgm(data.song)

func _process(delta: float):
	anim_time += delta * 4.0
	queue_redraw()

func _draw():
	var t = anim_time
	match stage_id:
		"obelisco":
			# Warm street lamp halo
			var alpha1 = 0.35 + sin(t * 1.5) * 0.08
			draw_circle(Vector2(31, 125), 32.0, Color(1.0, 0.9, 0.5, alpha1))
			
			# Traffic light cycle
			var sem_step = int(fmod(t * 0.8, 3.0))
			var sem_color = Color("#ff3333") if sem_step == 0 else (Color("#ffbb00") if sem_step == 1 else Color("#00ff66"))
			draw_rect(Rect2(215, 137, 4, 4), sem_color)
			draw_rect(Rect2(426, 137, 4, 4), sem_color)
			
			# Distant headlights flashing on 9 de Julio
			var car_x = 160.0 + fmod(t * 30.0, 140.0)
			draw_rect(Rect2(car_x, 210, 3, 2), Color("#fffbb0"))
			draw_rect(Rect2(car_x + 6, 210, 3, 2), Color("#fffbb0"))
			
		"casarosada":
			# Flag waving wave & Golden Sun of May shimmer
			var wave = sin(t * 2.0) * 3.0
			draw_rect(Rect2(320 + wave, 22, 6, 20), Color(0.45, 0.65, 0.85, 0.5))
			var sun_pulse = 0.5 + sin(t * 2.5) * 0.4
			draw_rect(Rect2(336, 31 + wave * 0.5, 4, 4), Color(1.0, 0.84, 0.0, sun_pulse))
			
			# Plaza lamps halo
			draw_circle(Vector2(50, 115), 26.0, Color(1.0, 0.9, 0.4, 0.3))
			draw_circle(Vector2(590, 115), 26.0, Color(1.0, 0.9, 0.4, 0.3))
			
		"caminito":
			# Balcony laundry swaying
			var sway = sin(t * 1.8) * 3.0
			draw_rect(Rect2(135 + sway, 108, 5, 12), Color(1.0, 1.0, 1.0, 0.4))
			draw_rect(Rect2(163 - sway, 108, 5, 12), Color(1.0, 0.2, 0.2, 0.4))
			
			# Blinking cat eyes on curb
			if sin(t) > 0.85:
				draw_rect(Rect2(209, 276, 2, 2), Color("#00ffcc"))
				draw_rect(Rect2(213, 276, 2, 2), Color("#00ffcc"))
				
		"glaciar":
			# Cold glacial mist over the water
			var mist_alpha = 0.08 + sin(t * 0.8) * 0.04
			draw_rect(Rect2(0, 190, 640, 40), Color(0.8, 0.95, 1.0, mist_alpha))
			
		"mesaza":
			# Crystal chandelier sparkles
			if sin(t * 2.0) > 0.4:
				draw_circle(Vector2(135, 80), 3.0, Color(1.0, 1.0, 1.0, 0.8))
			if sin(t * 2.0 + 1.0) > 0.4:
				draw_circle(Vector2(505, 80), 3.0, Color(1.0, 1.0, 1.0, 0.8))
			if sin(t * 1.5 + 2.0) > 0.5:
				draw_circle(Vector2(320, 45), 4.0, Color(1.0, 0.84, 0.0, 0.9))
				
			# Candelabra dancing flames
			var fl = sin(t * 5.0) * 2.0
			draw_rect(Rect2(235, 186 + fl, 3, 3), Color("#ffaa00"))
			draw_rect(Rect2(393, 186 - fl, 3, 3), Color("#ffaa00"))
