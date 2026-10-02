extends CharacterBody2D

# ==============================================================================
# TORNEO ARGENTO 16-BIT - PROFESSIONAL 2D FIGHTING GAME CHARACTER CONTROLLER
# Architecture: Finite State Machine (FSM) + AnimationPlayer + Sprite2D (Grid)
# Pixel Art: Nearest Texture Filter, Foot Pivot Anchored, Zero Squash & Stretch
# ==============================================================================

signal health_changed(new_hp: float, max_hp: float)
signal meter_changed(new_meter: float, max_meter: float)
signal state_changed(new_state: State)
signal combo_hit(hits: int)
signal impact_landed(hit_pos: Vector2, damage: float, is_blocked: bool, hit_type: String)

enum State {
	IDLE,
	WALK_FORWARD,
	WALK_BACKWARD,
	RUN,
	CROUCH_START,
	CROUCHING,
	CROUCH_END,
	JUMP_UP,
	JUMP_FORWARD,
	FALL,
	LAND,
	# Ataques de pie obligatorios
	PUNCH_HIGH,
	PUNCH_LOW,
	KICK_HIGH,
	KICK_LOW,
	# Ataques agachados obligatorios
	CROUCH_PUNCH_HIGH,
	CROUCH_PUNCH_LOW,
	CROUCH_KICK_HIGH,
	CROUCH_KICK_LOW,
	# Estados legados para compatibilidad
	LIGHT_PUNCH,
	MID_PUNCH,
	HEAVY_PUNCH,
	LIGHT_KICK,
	MID_KICK,
	HEAVY_KICK,
	HIT_LIGHT,
	HIT_HEAVY,
	KNOCKDOWN,
	WIN,
	LOSE,
	VICTORY,
	DEFEAT,
	# Combat special states
	BLOCK,
	SPECIAL,
	SUPER_ATTACK,
	FATALITY,
	FATALITY_VICTIM
}

@export var player_id: int = 1 # 1 or 2
@export var is_cpu: bool = false
@export var character_id: String = "leon"
@export var difficulty: String = "normal"
@export var cell_size: Vector2i = Vector2i(128, 128)

const HFRAMES: int = 8
const VFRAMES: int = 10
const GRAVITY: float = 1100.0
const JUMP_FORCE: float = -420.0

var current_state: State = State.IDLE
var state_timer: float = 0.0

var max_hp: float = 100.0
var hp: float = 100.0
var max_meter: float = 100.0
var meter: float = 0.0

var speed: float = 190.0
var atk_power: float = 1.0
var facing_dir: int = 1 # 1 = right, -1 = left

var opponent: Node2D = null
var oponente: Node2D:
	get: return opponent
	set(val): opponent = val
var char_data: Dictionary = {}

# Status effects
var is_frozen: bool = false
var freeze_timer: float = 0.0
var is_poisoned: bool = false
var poison_timer: float = 0.0
var poison_tick: float = 0.0

# Hit-stop & buffer
var hit_stop_timer: float = 0.0
var combo_hits: int = 0
var combo_reset_timer: float = 0.0
var last_down_press_time: float = -10.0
var ai_decision_timer: float = 0.0

# Sistema de Combos Especiales e Input Buffer
const TIEMPO_MAX_COMBO: float = 0.5 # Segundos para completar la secuencia del combo
var input_buffer: Array[String] = [] # Secuencia reciente de inputs
var tiempo_ultimo_input: float = 0.0

# 96x96 Dual Sheet references
var tex_hoja1: Texture2D = null
var tex_hoja2: Texture2D = null
var uses_dual_96x96: bool = false

# 192x192 Mortal Kombat Leon references
var uses_192x192: bool = false
var tex_leon_base: Texture2D = null
var tex_leon_walk_run: Texture2D = null
var tex_leon_crouch_jump_block: Texture2D = null
var tex_leon_punches: Texture2D = null
var tex_leon_kicks: Texture2D = null
var tex_leon_air_attacks: Texture2D = null
var tex_leon_hurt_knockdown: Texture2D = null
var tex_leon_special: Texture2D = null
var tex_leon_specials: Texture2D = null
var tex_leon_win_lose: Texture2D = null
var tex_leon_fatality: Texture2D = null

# Nodes
@onready var sprite: Sprite2D = $Sprite2D
@onready var anim_player: AnimationPlayer = $AnimationPlayer
@onready var hitbox: Area2D = $Hitbox
@onready var hitbox_shape: CollisionShape2D = $Hitbox/CollisionShape2D
@onready var hurtbox: Area2D = $Hurtbox
@onready var hurtbox_shape: CollisionShape2D = $Hurtbox/CollisionShape2D
@onready var body_shape: CollisionShape2D = $CollisionShape2D
@onready var shadow: Polygon2D = $Shadow

var projectile_scene = preload("res://scenes/projectile.tscn")

func _ready():
	add_to_group("fighters")
	hitbox.area_entered.connect(_on_hitbox_area_entered)
	anim_player.animation_finished.connect(_on_animation_finished)
	_set_hitbox_enabled(false)
	setup_character(character_id)

func setup_character(p_char_id: String):
	character_id = p_char_id
	char_data = GameData.get_character(character_id)
	
	atk_power = char_data.stats.atk / 100.0
	speed = (char_data.stats.spd / 100.0) * 160.0 + 80.0
	
	_load_character_spritesheet()
	_setup_animation_player()
	reset_fighter(position.x, facing_dir)

func _load_texture(res_path: String) -> Texture2D:
	if FileAccess.file_exists(res_path):
		var global_p = ProjectSettings.globalize_path(res_path)
		var img = Image.load_from_file(global_p)
		if img:
			return ImageTexture.create_from_image(img)
	elif ResourceLoader.exists(res_path):
		return load(res_path)
	return null

func _setup_leon_192x192():
	uses_192x192 = true
	uses_dual_96x96 = false
	cell_size = Vector2i(300, 298)
	
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = true
	# Rediseño de tamaño: Un 25% más grande que el tamaño previo (0.30 * 1.25 = 0.375, altura ~107px proporcional al roster)
	sprite.scale = Vector2(0.375, 0.375)
	sprite.offset = Vector2(0, -149.0) # Anclado exactamente a los pies en el piso (y=0) para celda de 298px
	
	tex_leon_base = _load_texture("res://assets/sprites/el_leon_mk_base.png")
	tex_leon_walk_run = _load_texture("res://assets/sprites/leon_walk_run.png")
	tex_leon_crouch_jump_block = _load_texture("res://assets/sprites/leon_crouch_jump_block.png")
	tex_leon_punches = _load_texture("res://assets/sprites/leon_punches.png")
	tex_leon_kicks = _load_texture("res://assets/sprites/leon_kicks.png")
	tex_leon_air_attacks = _load_texture("res://assets/sprites/leon_air_attacks.png")
	tex_leon_hurt_knockdown = _load_texture("res://assets/sprites/leon_hurt_knockdown.png")
	tex_leon_specials = _load_texture("res://assets/sprites/leon_specials.png")
	tex_leon_special = tex_leon_specials if tex_leon_specials != null else _load_texture("res://assets/sprites/leon_special_projectile.png")
	tex_leon_win_lose = _load_texture("res://assets/sprites/leon_win_lose.png")
	tex_leon_fatality = _load_texture("res://assets/sprites/leon_fatality.png")
	
	sprite.texture = tex_leon_base
	sprite.hframes = 1
	sprite.vframes = 1
	sprite.frame = 0
	
	# Configurar colisiones para Leon escalado a 0.375 (~107px de altura efectiva)
	if body_shape:
		if body_shape.shape is CapsuleShape2D:
			body_shape.shape = body_shape.shape.duplicate()
			(body_shape.shape as CapsuleShape2D).radius = 18.0
			(body_shape.shape as CapsuleShape2D).height = 102.0
			body_shape.position = Vector2(0, -51.0)
	if hurtbox_shape:
		if hurtbox_shape.shape is RectangleShape2D:
			hurtbox_shape.shape = hurtbox_shape.shape.duplicate()
			(hurtbox_shape.shape as RectangleShape2D).size = Vector2(44.0, 102.0)
			hurtbox_shape.position = Vector2(0, -51.0)
	if hitbox_shape:
		if hitbox_shape.shape is RectangleShape2D:
			hitbox_shape.shape = hitbox_shape.shape.duplicate()
			(hitbox_shape.shape as RectangleShape2D).size = Vector2(54.0, 32.0)
	if shadow:
		shadow.scale = Vector2(1.05, 1.05)

func _load_character_spritesheet():
	# Configure Sprite2D for strict pixel art (Nearest) and foot pivot anchor
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = true
	
	# Si el personaje es El León, cargar exclusivamente el nuevo set 192x192 MK
	if character_id == "leon":
		_setup_leon_192x192()
		return
	
	sprite.scale = Vector2.ONE
	uses_192x192 = false
	var h1_path = "res://assets/sprites/%s_spritesheet_96x96_hoja1.png" % character_id
	var h2_path = "res://assets/sprites/%s_spritesheet_96x96_hoja2.png" % character_id
	
	tex_hoja1 = _load_texture(h1_path)
	tex_hoja2 = _load_texture(h2_path)
	
	if tex_hoja1 != null:
		uses_dual_96x96 = true
		cell_size = Vector2i(96, 96)
		sprite.hframes = 9
		sprite.vframes = 5
		# Foot anchor at y=90 in 96px cell -> offset.y = -42 places feet at local y=0
		sprite.offset = Vector2(0, -42)
		sprite.texture = tex_hoja1
		sprite.frame = 0
		return

	# Fallback to 128x128 8x10 grid if ever needed
	uses_dual_96x96 = false
	cell_size = Vector2i(128, 128)
	sprite.hframes = HFRAMES
	sprite.vframes = VFRAMES
	sprite.offset = Vector2(0, -cell_size.y / 2.0)
	sprite.frame = 0
	
	var grid_path = "res://assets/sprites/%s_grid.png" % character_id
	var tex = _load_texture(grid_path)
	if not tex:
		tex = _load_texture("res://assets/sprites/leon_grid.png")
	if tex:
		sprite.texture = tex
		tex_hoja1 = tex

func _setup_animation_player():
	var lib = AnimationLibrary.new()
	
	if uses_192x192:
		# Animaciones oficiales 192x192 de El León (Mortal Kombat)
		lib.add_animation("idle", _create_multi_sheet_anim(tex_leon_base, 1, 1, [0], 0.20, true))
		# Animación de caminata con pies moviéndose (Frames 0..3 de tex_leon_walk_run)
		lib.add_animation("walk_forward", _create_multi_sheet_anim(tex_leon_walk_run, 4, 2, [0, 1, 2, 3], 0.12, true))
		lib.add_animation("walk_backward", _create_multi_sheet_anim(tex_leon_walk_run, 4, 2, [3, 2, 1, 0], 0.12, true))
		# Animación de carrera con pies moviéndose velozmente (Frames 4..7 de tex_leon_walk_run)
		lib.add_animation("run", _create_multi_sheet_anim(tex_leon_walk_run, 4, 2, [4, 5, 6, 7], 0.08, true))
		
		# Agacharse (Row 0: 0 descenso, 1 agachado total, 2 reincorporacion)
		lib.add_animation("crouch_start", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [0], 0.06, false))
		lib.add_animation("crouching", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [1], 0.20, true))
		lib.add_animation("crouch_end", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [2], 0.06, false))
		
		# Salto (Row 1: 4 impulso, 5 ascenso, 6 apice, 7 aterrizaje)
		lib.add_animation("jump_up", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [4, 5, 6], 0.09, false))
		lib.add_animation("jump_forward", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [4, 5, 6], 0.09, false))
		lib.add_animation("fall", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [6], 0.10, true))
		lib.add_animation("land", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [7], 0.06, false))
		
		# Bloqueo: el personaje se cubre y se queda quieto (Frame 8 estático, sin bucle errático)
		lib.add_animation("block", _create_multi_sheet_anim(tex_leon_crouch_jump_block, 4, 3, [8], 0.20, false))
		
		# Piñas (Row 0: 0..3 alta, Row 1: 4..7 baja, Row 2: 8..11 agachado)
		lib.add_animation("punch_high", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [0, 1, 2, 3], 0.08, false))
		lib.add_animation("heavy_punch", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [0, 1, 2, 3], 0.08, false))
		lib.add_animation("punch_low", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [4, 5, 6, 7], 0.07, false))
		lib.add_animation("mid_punch", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [4, 5, 6, 7], 0.07, false))
		lib.add_animation("light_punch", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [4, 5, 6, 7], 0.07, false))
		lib.add_animation("crouch_punch_high", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [8, 9, 10, 11], 0.07, false))
		lib.add_animation("crouch_punch_low", _create_multi_sheet_anim(tex_leon_punches, 4, 3, [8, 9, 10, 11], 0.07, false))
		
		# Patadas (Row 0: 0..3 alta, Row 1: 4..7 baja, Row 2: 8..11 barrida)
		lib.add_animation("kick_high", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [0, 1, 2, 3], 0.09, false))
		lib.add_animation("heavy_kick", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [0, 1, 2, 3], 0.09, false))
		lib.add_animation("kick_low", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [4, 5, 6, 7], 0.08, false))
		lib.add_animation("mid_kick", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [4, 5, 6, 7], 0.08, false))
		lib.add_animation("light_kick", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [4, 5, 6, 7], 0.08, false))
		lib.add_animation("crouch_kick_high", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [8, 9, 10, 11], 0.09, false))
		lib.add_animation("crouch_kick_low", _create_multi_sheet_anim(tex_leon_kicks, 4, 3, [8, 9, 10, 11], 0.09, false))
		
		# Ataques Aéreos (Row 0: 0..2 air punch, Row 1: 3..5 air kick)
		lib.add_animation("air_punch", _create_multi_sheet_anim(tex_leon_air_attacks, 3, 2, [0, 1, 2], 0.09, false))
		lib.add_animation("air_kick", _create_multi_sheet_anim(tex_leon_air_attacks, 3, 2, [3, 4, 5], 0.09, false))
		
		# Daño y Derribo (Row 0: 0..2 hurt, Row 1: 5..9 knockdown)
		lib.add_animation("hit_light", _create_multi_sheet_anim(tex_leon_hurt_knockdown, 5, 2, [0, 1], 0.08, false))
		lib.add_animation("hit_heavy", _create_multi_sheet_anim(tex_leon_hurt_knockdown, 5, 2, [1, 2], 0.08, false))
		lib.add_animation("knockdown", _create_multi_sheet_anim(tex_leon_hurt_knockdown, 5, 2, [5, 6, 7, 8, 9], 0.12, false))
		
		# Especiales y Súper (Hoja unificada leon_specials.png: 4 columnas x 4 filas, 300x298 px por cuadro)
		# Fila 0 (Frames 0, 1, 2, 3): Ataque con Micrófono Vintage Shure 55SH con ondas de choque sonoras
		lib.add_animation("special_mic", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [0, 1, 2, 3], 0.09, false))
		lib.add_animation("especial_mic", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [0, 1, 2, 3], 0.09, false))
		
		# Fila 1 (Frames 4, 5, 6, 7): Ataque Motosierra Stihl con chispas de corte y arco de fuego
		lib.add_animation("special_chainsaw", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [4, 5, 6, 7], 0.08, false))
		lib.add_animation("especial_motosierra", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [4, 5, 6, 7], 0.08, false))
		
		# Fila 2 (Frames 8, 9, 10, 11): Rugido de León Sónico con anillos expansivos y aura dorada
		lib.add_animation("special", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [8, 9, 10, 11], 0.09, false))
		lib.add_animation("special_roar", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [8, 9, 10, 11], 0.09, false))
		lib.add_animation("especial_rugido", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [8, 9, 10, 11], 0.09, false))
		
		# Fila 3 (Frames 12, 13, 14, 15): Mordisco Salvaje / Mandíbula de León Astral
		lib.add_animation("super", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [12, 13, 14, 15], 0.09, false))
		lib.add_animation("bite", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [12, 13, 14, 15], 0.09, false))
		lib.add_animation("especial_mordisco", _create_multi_sheet_anim(tex_leon_specials, 4, 4, [12, 13, 14, 15], 0.09, false))
		
		# Victoria y Derrota
		lib.add_animation("win", _create_multi_sheet_anim(tex_leon_win_lose, 4, 2, [0, 1, 2, 3], 0.14, true))
		lib.add_animation("victory", _create_multi_sheet_anim(tex_leon_win_lose, 4, 2, [0, 1, 2, 3], 0.14, true))
		lib.add_animation("lose", _create_multi_sheet_anim(tex_leon_win_lose, 4, 2, [4, 5, 6, 7], 0.16, true))
		lib.add_animation("defeat", _create_multi_sheet_anim(tex_leon_win_lose, 4, 2, [4, 5, 6, 7], 0.16, true))
		
		# Fatality
		lib.add_animation("fatality", _create_multi_sheet_anim(tex_leon_fatality, 6, 1, [0, 1, 2, 3, 4, 5], 0.15, true))
		lib.add_animation("fatality_victim", _create_multi_sheet_anim(tex_leon_hurt_knockdown, 5, 2, [8, 9], 0.20, true))
	elif uses_dual_96x96:
		# Standard 96x96 9x5 Grid Mappings
		# Hoja 1:
		# Row 0 (0..8): Idle (0..3), Walk (4..7)
		# Row 1 (9..17): Crouch (9..10), Jump (11..14)
		# Row 2 (18..26): High Punch (18..20), Mid Punch (21..23), Low Punch (24..26)
		# Row 3 (27..35): High Kick (27..29), Mid Kick (30..32), Low Kick (33..35)
		# Row 4 (36..44): Hurt (36..37), Knockdown (38..40)
		lib.add_animation("idle", _create_frame_anim([0, 1, 2, 3], 0.125, true, tex_hoja1))
		lib.add_animation("walk_forward", _create_frame_anim([4, 5, 6, 7], 0.10, true, tex_hoja1))
		lib.add_animation("walk_backward", _create_frame_anim([7, 6, 5, 4], 0.10, true, tex_hoja1))
		lib.add_animation("run", _create_frame_anim([31, 32, 33, 34], 0.07, true, tex_hoja2))
		
		lib.add_animation("crouch_start", _create_frame_anim([9], 0.06, false, tex_hoja1))
		lib.add_animation("crouching", _create_frame_anim([10], 0.20, true, tex_hoja1))
		lib.add_animation("crouch_end", _create_frame_anim([9], 0.06, false, tex_hoja1))
		
		lib.add_animation("jump_up", _create_frame_anim([11, 12, 13], 0.08, false, tex_hoja1))
		lib.add_animation("jump_forward", _create_frame_anim([11, 12, 13], 0.08, false, tex_hoja1))
		lib.add_animation("fall", _create_frame_anim([13], 0.10, true, tex_hoja1))
		lib.add_animation("land", _create_frame_anim([14], 0.06, false, tex_hoja1))
		
		# Animaciones oficiales obligatorias de pie
		lib.add_animation("punch_high", _create_frame_anim([18, 19, 20, 21], 0.07, false, tex_hoja1))
		lib.add_animation("punch_low", _create_frame_anim([24, 25, 26], 0.07, false, tex_hoja1))
		lib.add_animation("kick_high", _create_frame_anim([27, 28, 29, 30], 0.07, false, tex_hoja1))
		lib.add_animation("kick_low", _create_frame_anim([30, 31, 32], 0.07, false, tex_hoja1))

		# Animaciones oficiales obligatorias agachado
		lib.add_animation("crouch_punch_high", _create_frame_anim([9, 24, 25, 26], 0.07, false, tex_hoja1))
		lib.add_animation("crouch_punch_low", _create_frame_anim([24, 25, 26], 0.07, false, tex_hoja1))
		lib.add_animation("crouch_kick_high", _create_frame_anim([9, 33, 34, 35], 0.08, false, tex_hoja1))
		lib.add_animation("crouch_kick_low", _create_frame_anim([9, 33, 34, 9], 0.07, false, tex_hoja1))
		
		# Compatibilidad
		lib.add_animation("light_punch", _create_frame_anim([24, 25, 26], 0.07, false, tex_hoja1))
		lib.add_animation("mid_punch", _create_frame_anim([21, 22, 23], 0.07, false, tex_hoja1))
		lib.add_animation("heavy_punch", _create_frame_anim([18, 19, 20, 21], 0.08, false, tex_hoja1))
		lib.add_animation("light_kick", _create_frame_anim([30, 31, 32], 0.07, false, tex_hoja1))
		lib.add_animation("mid_kick", _create_frame_anim([30, 31, 32], 0.07, false, tex_hoja1))
		lib.add_animation("heavy_kick", _create_frame_anim([27, 28, 29, 30], 0.08, false, tex_hoja1))
		
		lib.add_animation("hit_light", _create_frame_anim([36, 37], 0.07, false, tex_hoja1))
		lib.add_animation("hit_heavy", _create_frame_anim([36, 37], 0.08, false, tex_hoja1))
		lib.add_animation("knockdown", _create_frame_anim([38, 39, 40], 0.14, false, tex_hoja1))
		lib.add_animation("lose", _create_frame_anim([40], 0.20, true, tex_hoja1))
		
		# Hoja 2:
		# Row 0: Especial 1 - Rugido (0..3), Especial 3 - Micrófono (4..8)
		# Row 1: Especial 2 - Motosierra (9..13)
		# Row 2: Súper Ataque / Mordisco Feroz (18..21)
		# Row 3: Bloqueo (27..29), Correr/Dash (31..34)
		# Row 4: Victoria (36..41)
		lib.add_animation("block", _create_frame_anim([27, 28, 29], 0.10, true, tex_hoja2))
		lib.add_animation("special", _create_frame_anim([0, 1, 2, 3], 0.09, false, tex_hoja2))
		lib.add_animation("special_roar", _create_frame_anim([0, 1, 2, 3], 0.09, false, tex_hoja2))
		lib.add_animation("especial_rugido", _create_frame_anim([0, 1, 2, 3], 0.09, false, tex_hoja2))
		lib.add_animation("special_chainsaw", _create_frame_anim([9, 10, 11, 12, 13], 0.08, false, tex_hoja2))
		lib.add_animation("especial_motosierra", _create_frame_anim([9, 10, 11, 12, 13], 0.08, false, tex_hoja2))
		lib.add_animation("special_mic", _create_frame_anim([4, 5, 6, 7, 8], 0.08, false, tex_hoja2))
		lib.add_animation("especial_mic", _create_frame_anim([4, 5, 6, 7, 8], 0.08, false, tex_hoja2))
		lib.add_animation("super", _create_frame_anim([18, 19, 20, 21], 0.09, false, tex_hoja2))
		lib.add_animation("bite", _create_frame_anim([18, 19, 20, 21], 0.09, false, tex_hoja2))
		lib.add_animation("especial_mordisco", _create_frame_anim([18, 19, 20, 21], 0.09, false, tex_hoja2))
		lib.add_animation("win", _create_frame_anim([36, 37, 38, 39, 40, 41], 0.125, true, tex_hoja2))
		lib.add_animation("fatality", _create_frame_anim([36, 37, 38, 39, 40, 41], 0.14, true, tex_hoja2))
		lib.add_animation("fatality_victim", _create_frame_anim([38, 39, 40], 0.14, true, tex_hoja1))
	else:
		# Grid row mappings (HFRAMES=8, VFRAMES=10):
		lib.add_animation("idle", _create_frame_anim([0, 1, 2, 3], 0.125, true))
		lib.add_animation("walk_forward", _create_frame_anim([8, 9, 10, 11, 12, 13], 0.10, true))
		lib.add_animation("walk_backward", _create_frame_anim([16, 17, 18, 19, 20, 21], 0.10, true))
		lib.add_animation("run", _create_frame_anim([8, 9, 10, 11, 12, 13], 0.05, true))
		
		lib.add_animation("crouch_start", _create_frame_anim([4, 5], 0.06, false))
		lib.add_animation("crouching", _create_frame_anim([14, 15], 0.20, true))
		lib.add_animation("crouch_end", _create_frame_anim([6, 7], 0.06, false))
		
		lib.add_animation("jump_up", _create_frame_anim([24, 25, 26], 0.08, false))
		lib.add_animation("jump_forward", _create_frame_anim([27, 28, 29], 0.08, false))
		lib.add_animation("fall", _create_frame_anim([30, 31], 0.10, true))
		lib.add_animation("land", _create_frame_anim([22, 23], 0.06, false))
		
		# Animaciones oficiales de pie
		lib.add_animation("punch_high", _create_frame_anim([40, 41, 42, 43], 0.08, false))
		lib.add_animation("punch_low", _create_frame_anim([32, 33, 34], 0.06, false))
		lib.add_animation("kick_high", _create_frame_anim([51, 52, 53, 54], 0.08, false))
		lib.add_animation("kick_low", _create_frame_anim([44, 45, 46], 0.06, false))

		# Animaciones oficiales agachado
		lib.add_animation("crouch_punch_high", _create_frame_anim([4, 40, 41, 4], 0.07, false))
		lib.add_animation("crouch_punch_low", _create_frame_anim([4, 32, 33, 4], 0.06, false))
		lib.add_animation("crouch_kick_high", _create_frame_anim([4, 51, 52, 4], 0.08, false))
		lib.add_animation("crouch_kick_low", _create_frame_anim([4, 44, 45, 4], 0.06, false))

		# Compatibilidad
		lib.add_animation("light_punch", _create_frame_anim([32, 33, 34], 0.06, false))
		lib.add_animation("mid_punch", _create_frame_anim([35, 36, 37], 0.07, false))
		lib.add_animation("heavy_punch", _create_frame_anim([40, 41, 42, 43], 0.08, false))
		lib.add_animation("light_kick", _create_frame_anim([44, 45, 46], 0.06, false))
		lib.add_animation("mid_kick", _create_frame_anim([48, 49, 50], 0.07, false))
		lib.add_animation("heavy_kick", _create_frame_anim([51, 52, 53, 54], 0.08, false))
		
		lib.add_animation("hit_light", _create_frame_anim([56, 57], 0.07, false))
		lib.add_animation("hit_heavy", _create_frame_anim([58, 59, 60], 0.08, false))
		lib.add_animation("knockdown", _create_frame_anim([61, 62, 63], 0.14, false))
		
		lib.add_animation("win", _create_frame_anim([64, 65, 66, 67], 0.125, true))
		lib.add_animation("lose", _create_frame_anim([68, 69, 70, 71], 0.125, true))
		
		lib.add_animation("block", _create_frame_anim([72, 73], 0.10, true))
		lib.add_animation("special", _create_frame_anim([74, 75, 76], 0.10, false))
		lib.add_animation("super", _create_frame_anim([77, 78, 79], 0.12, false))
		lib.add_animation("fatality", _create_frame_anim([64, 65, 66, 67], 0.14, true))
		lib.add_animation("fatality_victim", _create_frame_anim([68, 69, 70, 71], 0.14, true))
	
	if anim_player.has_animation_library(""):
		anim_player.remove_animation_library("")
	anim_player.add_animation_library("", lib)

func _create_multi_sheet_anim(tex: Texture2D, h_frames: int, v_frames: int, frames: Array, step_time: float, loop: bool) -> Animation:
	var anim = Animation.new()
	anim.length = max(0.01, step_time * frames.size())
	anim.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	
	if tex != null:
		var tex_track = anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(tex_track, NodePath("Sprite2D:texture"))
		anim.value_track_set_update_mode(tex_track, Animation.UPDATE_DISCRETE)
		anim.track_insert_key(tex_track, 0.0, tex)
		
		var h_track = anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(h_track, NodePath("Sprite2D:hframes"))
		anim.value_track_set_update_mode(h_track, Animation.UPDATE_DISCRETE)
		anim.track_insert_key(h_track, 0.0, h_frames)
		
		var v_track = anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(v_track, NodePath("Sprite2D:vframes"))
		anim.value_track_set_update_mode(v_track, Animation.UPDATE_DISCRETE)
		anim.track_insert_key(v_track, 0.0, v_frames)
		
		var offset_track = anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(offset_track, NodePath("Sprite2D:offset"))
		anim.value_track_set_update_mode(offset_track, Animation.UPDATE_DISCRETE)
		var frame_h = tex.get_height() / float(v_frames)
		anim.track_insert_key(offset_track, 0.0, Vector2(0, -frame_h / 2.0))
		
	var track_idx = anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(track_idx, NodePath("Sprite2D:frame"))
	anim.value_track_set_update_mode(track_idx, Animation.UPDATE_DISCRETE)
	
	for i in range(frames.size()):
		anim.track_insert_key(track_idx, i * step_time, frames[i])
		
	return anim

func _create_frame_anim(frames: Array, step_time: float, loop: bool, target_tex: Texture2D = null) -> Animation:
	var anim = Animation.new()
	anim.length = max(0.01, step_time * frames.size())
	anim.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	
	if target_tex != null:
		var tex_track = anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(tex_track, NodePath("Sprite2D:texture"))
		anim.value_track_set_update_mode(tex_track, Animation.UPDATE_DISCRETE)
		anim.track_insert_key(tex_track, 0.0, target_tex)
		
	var track_idx = anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(track_idx, NodePath("Sprite2D:frame"))
	anim.value_track_set_update_mode(track_idx, Animation.UPDATE_DISCRETE)
	
	for i in range(frames.size()):
		anim.track_insert_key(track_idx, i * step_time, frames[i])
		
	return anim

func reset_fighter(start_x: float, dir: int):
	position = Vector2(start_x, 315)
	velocity = Vector2.ZERO
	facing_dir = dir
	hp = max_hp
	meter = 0.0
	is_frozen = false
	is_poisoned = false
	hit_stop_timer = 0.0
	combo_hits = 0
	last_down_press_time = -10.0
	_set_hitbox_enabled(false)
	sprite.modulate = Color.WHITE
	if uses_192x192:
		sprite.scale = Vector2(0.375, 0.375)
	else:
		sprite.scale = Vector2.ONE
	_update_facing()
	change_state(State.IDLE)
	emit_signal("health_changed", hp, max_hp)
	emit_signal("meter_changed", meter, max_meter)

func _set_hitbox_enabled(enable: bool):
	if hitbox_shape:
		hitbox_shape.set_deferred("disabled", not enable)

func _set_hitbox_size_and_pos(pos: Vector2, size: Vector2, dmg: float, type: String):
	hitbox.position = pos
	if hitbox_shape and hitbox_shape.shape is RectangleShape2D:
		(hitbox_shape.shape as RectangleShape2D).size = size
	hitbox.set_meta("damage", dmg)
	hitbox.set_meta("hit_type", type)
	_set_hitbox_enabled(true)
	# Verificación inmediata si ya colisiona con el rival
	for area in hitbox.get_overlapping_areas():
		_on_hitbox_area_entered(area)

func trigger_hit_stop(duration: float = 0.06):
	hit_stop_timer = duration
	if anim_player.is_playing():
		anim_player.pause()

# ==============================================================================
# FINITE STATE MACHINE (FSM)
# ==============================================================================
func change_state(new_state: State):
	if current_state == new_state:
		return
		
	_exit_state(current_state)
	current_state = new_state
	state_timer = 0.0
	_enter_state(current_state)
	emit_signal("state_changed", current_state)

# Backwards compatibility alias for external callers
func set_state(s: int):
	change_state(s as State)

func _exit_state(state: State):
	match state:
		State.PUNCH_HIGH, State.PUNCH_LOW, State.KICK_HIGH, State.KICK_LOW, \
		State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW, State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW, \
		State.LIGHT_PUNCH, State.MID_PUNCH, State.HEAVY_PUNCH, \
		State.LIGHT_KICK, State.MID_KICK, State.HEAVY_KICK, \
		State.SPECIAL, State.SUPER_ATTACK:
			_set_hitbox_enabled(false)

func _enter_state(state: State):
	var anim_name = _state_to_anim_name(state)
	
	# Texture swapping for dual 96x96 sheets
	if uses_dual_96x96:
		match state:
			State.BLOCK, State.SPECIAL, State.SUPER_ATTACK, State.WIN, State.VICTORY, State.FATALITY:
				if tex_hoja2 and sprite.texture != tex_hoja2:
					sprite.texture = tex_hoja2
			_:
				if tex_hoja1 and sprite.texture != tex_hoja1:
					sprite.texture = tex_hoja1

	# Adjust collision and hurtbox heights physically according to state (Zero scale changes!)
	if uses_192x192:
		match state:
			State.CROUCH_START, State.CROUCHING, State.CROUCH_END:
				_set_hitbox_enabled(false)
				hurtbox_shape.position = Vector2(0, -26)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(44, 52)
				body_shape.position = Vector2(0, -26)
				(body_shape.shape as CapsuleShape2D).height = 52.0
			State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW, State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW:
				hurtbox_shape.position = Vector2(0, -26)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(44, 52)
				body_shape.position = Vector2(0, -26)
				(body_shape.shape as CapsuleShape2D).height = 52.0
			_:
				hurtbox_shape.position = Vector2(0, -51)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(44, 102)
				body_shape.position = Vector2(0, -51)
				(body_shape.shape as CapsuleShape2D).height = 102.0
	elif uses_dual_96x96:
		match state:
			State.CROUCH_START, State.CROUCHING, State.CROUCH_END, \
			State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW, State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW:
				_set_hitbox_enabled(false)
				hurtbox_shape.position = Vector2(0, -22)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(36, 44)
				body_shape.position = Vector2(0, -22)
				(body_shape.shape as CapsuleShape2D).height = 44.0
			_:
				hurtbox_shape.position = Vector2(0, -36)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(36, 72)
				body_shape.position = Vector2(0, -36)
				(body_shape.shape as CapsuleShape2D).height = 70.0
	else:
		match state:
			State.CROUCH_START, State.CROUCHING, State.CROUCH_END, \
			State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW, State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW:
				_set_hitbox_enabled(false)
				hurtbox_shape.position = Vector2(0, -32)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(40, 60)
				body_shape.position = Vector2(0, -30)
				(body_shape.shape as CapsuleShape2D).height = 58.0
			_:
				hurtbox_shape.position = Vector2(0, -52)
				(hurtbox_shape.shape as RectangleShape2D).size = Vector2(44, 100)
				body_shape.position = Vector2(0, -50)
				(body_shape.shape as CapsuleShape2D).height = 96.0

	match state:
		State.IDLE, State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN, State.BLOCK:
			_set_hitbox_enabled(false)
		State.JUMP_UP, State.JUMP_FORWARD, State.FALL, State.LAND:
			_set_hitbox_enabled(false)
		State.PUNCH_HIGH, State.HEAVY_PUNCH:
			var reach_x = 46.0 * facing_dir if uses_192x192 else (36.0 * facing_dir)
			var pos_y = -60.0 if uses_192x192 else (-48.0 if uses_dual_96x96 else -58.0)
			var box_size = Vector2(56.0, 34.0) if uses_192x192 else Vector2(40.0, 32.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, 16.0 * atk_power, "punch_high")
			SoundEngine.play_kick_whoosh()
		State.PUNCH_LOW, State.LIGHT_PUNCH, State.MID_PUNCH:
			var reach_x = 44.0 * facing_dir if uses_192x192 else (34.0 * facing_dir)
			var pos_y = -46.0 if uses_192x192 else (-36.0 if uses_dual_96x96 else -46.0)
			var box_size = Vector2(52.0, 32.0) if uses_192x192 else Vector2(36.0, 30.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, 8.0 * atk_power, "punch_low")
			SoundEngine.play_kick_whoosh()
		State.KICK_HIGH, State.HEAVY_KICK:
			var reach_x = 52.0 * facing_dir if uses_192x192 else (40.0 * facing_dir)
			var pos_y = -62.0 if uses_192x192 else (-46.0 if uses_dual_96x96 else -58.0)
			var box_size = Vector2(60.0, 36.0) if uses_192x192 else Vector2(44.0, 34.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, 18.0 * atk_power, "kick_high")
			velocity.x = facing_dir * 90.0
			SoundEngine.play_kick_whoosh()
		State.KICK_LOW, State.LIGHT_KICK, State.MID_KICK:
			var reach_x = 48.0 * facing_dir if uses_192x192 else (38.0 * facing_dir)
			var pos_y = -22.0 if uses_192x192 else (-26.0 if uses_dual_96x96 else -36.0)
			var box_size = Vector2(56.0, 32.0) if uses_192x192 else Vector2(42.0, 30.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, 10.0 * atk_power, "kick_low")
			velocity.x = facing_dir * 60.0
			SoundEngine.play_kick_whoosh()
		State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW:
			var reach_x = 48.0 * facing_dir if uses_192x192 else (36.0 * facing_dir)
			var pos_y = -32.0 if uses_192x192 else (-26.0 if uses_dual_96x96 else -30.0)
			var box_size = Vector2(58.0, 36.0) if uses_192x192 else Vector2(44.0, 32.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, 6.0 * atk_power, "punch_low")
			SoundEngine.play_kick_whoosh()
		State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW:
			var reach_x = 52.0 * facing_dir if uses_192x192 else (40.0 * facing_dir)
			var pos_y = -22.0 if uses_192x192 else (-20.0 if uses_dual_96x96 else -24.0)
			var box_size = Vector2(64.0, 36.0) if uses_192x192 else Vector2(48.0, 32.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, 7.0 * atk_power, "kick_low")
			SoundEngine.play_kick_whoosh()
		State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN:
			_set_hitbox_enabled(false)
		State.WIN, State.LOSE, State.VICTORY, State.DEFEAT, State.FATALITY, State.FATALITY_VICTIM:
			_set_hitbox_enabled(false)
			velocity = Vector2.ZERO

	if anim_player.has_animation(anim_name):
		anim_player.play(anim_name)

func _state_to_anim_name(state: State) -> String:
	match state:
		State.IDLE: return "idle"
		State.WALK_FORWARD: return "walk_forward"
		State.WALK_BACKWARD: return "walk_backward"
		State.RUN: return "run"
		State.CROUCH_START: return "crouch_start"
		State.CROUCHING: return "crouching"
		State.CROUCH_END: return "crouch_end"
		State.JUMP_UP: return "jump_up"
		State.JUMP_FORWARD: return "jump_forward"
		State.FALL: return "fall"
		State.LAND: return "land"
		State.PUNCH_HIGH: return "punch_high"
		State.PUNCH_LOW: return "punch_low"
		State.KICK_HIGH: return "kick_high"
		State.KICK_LOW: return "kick_low"
		State.CROUCH_PUNCH_HIGH: return "crouch_punch_high"
		State.CROUCH_PUNCH_LOW: return "crouch_punch_low"
		State.CROUCH_KICK_HIGH: return "crouch_kick_high"
		State.CROUCH_KICK_LOW: return "crouch_kick_low"
		# Fallbacks de compatibilidad
		State.LIGHT_PUNCH: return "punch_low"
		State.MID_PUNCH: return "punch_low"
		State.HEAVY_PUNCH: return "punch_high"
		State.LIGHT_KICK: return "kick_low"
		State.MID_KICK: return "kick_low"
		State.HEAVY_KICK: return "kick_high"
		State.HIT_LIGHT: return "hit_light"
		State.HIT_HEAVY: return "hit_heavy"
		State.KNOCKDOWN: return "knockdown"
		State.WIN, State.VICTORY: return "win"
		State.LOSE, State.DEFEAT: return "lose"
		State.BLOCK: return "block"
		State.SPECIAL: return "special"
		State.SUPER_ATTACK: return "super"
		State.FATALITY: return "fatality"
		State.FATALITY_VICTIM: return "fatality_victim"
		_: return "idle"

func _on_animation_finished(anim_name: StringName):
	var holding_down = not is_cpu and _is_input_action_pressed("crouch")
	
	match anim_name:
		"crouch_start":
			if holding_down or (is_cpu and current_state == State.CROUCH_START):
				change_state(State.CROUCHING)
			else:
				change_state(State.CROUCH_END)
		"crouch_end":
			change_state(State.IDLE)
		"land":
			if holding_down:
				change_state(State.CROUCHING)
			else:
				change_state(State.IDLE)
		"punch_high", "punch_low", "kick_high", "kick_low", \
		"crouch_punch_high", "crouch_punch_low", "crouch_kick_high", "crouch_kick_low", \
		"light_punch", "mid_punch", "heavy_punch", \
		"light_kick", "mid_kick", "heavy_kick", \
		"special", "super", "special_roar", "special_chainsaw", "special_mic", "bite", \
		"especial_rugido", "especial_motosierra", "especial_mic", "especial_mordisco":
			if is_on_floor() and holding_down:
				change_state(State.CROUCHING)
			else:
				change_state(State.IDLE)
		"hit_light", "hit_heavy":
			change_state(State.IDLE)
		"knockdown":
			if hp <= 0.0:
				change_state(State.LOSE)
			else:
				change_state(State.CROUCH_END)

# ==============================================================================
# PHYSICS & GAME LOOP
# ==============================================================================
func _physics_process(delta: float):
	# Hit-stop micro freeze frame (arcade impact pause)
	if hit_stop_timer > 0.0:
		hit_stop_timer -= delta
		if hit_stop_timer <= 0.0:
			if not is_frozen and current_state not in [State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]:
				anim_player.play()
		return
		
	state_timer += delta
	
	# Combo decay
	if combo_reset_timer > 0.0:
		combo_reset_timer -= delta
		if combo_reset_timer <= 0.0:
			combo_hits = 0
			
	# Actualizar buffer de combos especiales
	if not is_cpu:
		check_input_combos(delta)
			
	# Status Effects
	if is_frozen:
		freeze_timer -= delta
		sprite.modulate = Color(0.4, 0.8, 1.0, 1.0)
		if freeze_timer <= 0.0:
			is_frozen = false
			sprite.modulate = Color.WHITE
		return
		
	if is_poisoned:
		poison_timer -= delta
		poison_tick += delta
		sprite.modulate = Color(0.9, 0.4, 0.9, 1.0)
		if poison_tick >= 0.35:
			poison_tick = 0.0
			hp = max(1.0, hp - 1.0)
			emit_signal("health_changed", hp, max_hp)
		if poison_timer <= 0.0:
			is_poisoned = false
			sprite.modulate = Color.WHITE

	# Gravity & Airborne State Machine
	if not is_on_floor():
		velocity.y += GRAVITY * delta
		if velocity.y >= 0.0 and current_state in [State.JUMP_UP, State.JUMP_FORWARD]:
			change_state(State.FALL)
	else:
		if current_state in [State.FALL, State.JUMP_UP, State.JUMP_FORWARD]:
			change_state(State.LAND)
			
	# Ground friction when idle / recovering / attacking / blocking
	if is_on_floor() and current_state not in [State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN]:
		velocity.x = move_toward(velocity.x, 0.0, 750.0 * delta)
		
	# Auto-face / Actualizar orientación frente al rival
	actualizar_orientacion()
			
	# Input / AI handling
	if not is_frozen and current_state not in [State.LOSE, State.DEFEAT, State.WIN, State.VICTORY, State.FATALITY, State.FATALITY_VICTIM]:
		if is_cpu:
			_process_cpu_ai(delta)
		else:
			_process_player_input()
			
	# Detección activa continua mientras el hitbox esté activo
	if hitbox_shape and not hitbox_shape.disabled:
		for area in hitbox.get_overlapping_areas():
			_on_hitbox_area_entered(area)
			
	# Move and clamp within stage boundaries
	move_and_slide()
	position.x = clamp(position.x, 40.0, 600.0)

func actualizar_orientacion():
	var opp = opponent if opponent != null else oponente
	if opp == null:
		return
		
	# Solo girar si el personaje está en el suelo y no está atacando ni en hitstun
	if is_on_floor() and not _is_attacking_or_hurt():
		var target_dir = -1 if opp.global_position.x < global_position.x else 1
		if target_dir != facing_dir:
			facing_dir = target_dir
			_update_facing()

func _is_attacking_or_hurt() -> bool:
	return current_state in [
		State.PUNCH_HIGH, State.PUNCH_LOW, State.KICK_HIGH, State.KICK_LOW,
		State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW, State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW,
		State.LIGHT_PUNCH, State.MID_PUNCH, State.HEAVY_PUNCH,
		State.LIGHT_KICK, State.MID_KICK, State.HEAVY_KICK,
		State.SPECIAL, State.SUPER_ATTACK,
		State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LAND,
		State.LOSE, State.DEFEAT, State.WIN, State.VICTORY, State.FATALITY, State.FATALITY_VICTIM
	]

func _update_facing():
	sprite.flip_h = (facing_dir == -1)
	hitbox.position.x = abs(hitbox.position.x) * facing_dir
	# Si está caminando en este momento, actualiza si es hacia adelante o hacia atrás
	if current_state in [State.WALK_FORWARD, State.WALK_BACKWARD]:
		if velocity.x != 0.0:
			var is_forward = (velocity.x > 0 and facing_dir > 0) or (velocity.x < 0 and facing_dir < 0)
			change_state(State.WALK_FORWARD if is_forward else State.WALK_BACKWARD)

# ==============================================================================
# COMBAT ATTACK ACTIONS (INPUT DISPATCH)
# ==============================================================================
func attack_punch_high():
	if _can_attack():
		change_state(State.PUNCH_HIGH)

func attack_punch_low():
	if _can_attack():
		change_state(State.PUNCH_LOW)

func attack_kick_high():
	if _can_attack():
		change_state(State.KICK_HIGH)

func attack_kick_low():
	if _can_attack():
		change_state(State.KICK_LOW)

func attack_crouch_punch_high():
	if _can_attack_crouch():
		change_state(State.CROUCH_PUNCH_HIGH)

func attack_crouch_punch_low():
	if _can_attack_crouch():
		change_state(State.CROUCH_PUNCH_LOW)

func attack_crouch_kick_high():
	if _can_attack_crouch():
		change_state(State.CROUCH_KICK_HIGH)

func attack_crouch_kick_low():
	if _can_attack_crouch():
		change_state(State.CROUCH_KICK_LOW)

func _can_attack() -> bool:
	return is_on_floor() and current_state in [State.IDLE, State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN]

func _can_attack_crouch() -> bool:
	return is_on_floor() and current_state in [
		State.CROUCH_START, State.CROUCHING, State.CROUCH_END,
		State.IDLE, State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN
	]

# Métodos legados de compatibilidad
func attack_light_punch(): attack_punch_low()
func attack_mid_punch(): attack_punch_low()
func attack_heavy_punch(): attack_punch_high()
func attack_light_kick(): attack_kick_low()
func attack_mid_kick(): attack_kick_low()
func attack_heavy_kick(): attack_kick_high()
func attack_light(): attack_punch_low()
func attack_heavy(): attack_punch_high()

func attack_special1():
	if current_state in [State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]: return
	if character_id == "leon":
		ejecutar_especial("rugido", 12.0)
		return
	if meter < 15.0: return
	
	meter -= 15.0
	emit_signal("meter_changed", meter, max_meter)
	change_state(State.SPECIAL)
	SoundEngine.play_special()
	
	var m = char_data.moves.special1
	if m.type in ["projectile", "vertical_beam", "freeze_projectile"]:
		_spawn_projectile(m.projType if m.has("projType") else "energy", m.dmg)
	else:
		var reach_x = 52.0 * facing_dir
		var pos_y = -50.0
		var box_size = Vector2(66.0, 46.0)
		_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, m.dmg * atk_power, "special")
		velocity.x = facing_dir * 220.0

func attack_special2():
	if current_state in [State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]: return
	if character_id == "leon":
		ejecutar_especial("motosierra", 14.0)
		return
	if meter < 20.0: return
	
	meter -= 20.0
	emit_signal("meter_changed", meter, max_meter)
	change_state(State.SPECIAL)
	SoundEngine.play_special()
	
	var m = char_data.moves.special2
	if m.type in ["projectile", "ground_hazard", "summon_drop"]:
		_spawn_projectile(m.projType if m.has("projType") else "energy", m.dmg)
	else:
		var reach_x = 54.0 * facing_dir
		var pos_y = -48.0
		var box_size = Vector2(70.0, 48.0)
		_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, m.dmg * atk_power, "special")
		velocity.x = facing_dir * 260.0

func attack_special3():
	if current_state in [State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]: return
	if character_id == "leon":
		ejecutar_especial("mic", 14.0, true)
		return
	if meter < 25.0: return
	
	meter -= 25.0
	emit_signal("meter_changed", meter, max_meter)
	change_state(State.SPECIAL)
	SoundEngine.play_special()
	
	var m = char_data.moves.special3
	if m.type == "projectile":
		_spawn_projectile(m.projType if m.has("projType") else "energy", m.dmg)
	else:
		var reach_x = 50.0 * facing_dir
		var pos_y = -52.0
		var box_size = Vector2(66.0, 44.0)
		_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, m.dmg * atk_power, "special")
		velocity.x = facing_dir * 300.0

func attack_super():
	if current_state in [State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]: return
	if character_id == "leon":
		ejecutar_especial("mordisco", 18.0)
		return
	if meter < 100.0: return
	
	meter = 0.0
	emit_signal("meter_changed", meter, max_meter)
	change_state(State.SUPER_ATTACK)
	SoundEngine.play_super()
	
	var m = char_data.moves.super
	var reach_x = 50.0 * facing_dir
	var pos_y = -50.0
	var box_size = Vector2(66.0, 48.0)
	_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, m.dmg * atk_power, "super")
	_spawn_projectile("gold_ball", 28.0)

func _spawn_projectile(p_type: String, p_dmg: float):
	var proj = projectile_scene.instantiate()
	var spawn_pos = global_position + Vector2(34 * facing_dir, -46)
	if p_type == "summon_drop":
		spawn_pos = Vector2(opponent.global_position.x, 30.0) if opponent else Vector2(global_position.x + 80 * facing_dir, 30.0)
	proj.global_position = spawn_pos
	get_parent().add_child(proj)
	proj.setup(self, p_type, p_dmg * atk_power, Vector2(facing_dir, 0))

func take_damage(dmg: float, hit_dir: String, hit_type: String = "punch", impact_pos: Vector2 = Vector2.ZERO):
	if current_state in [State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]:
		return
		
	var is_blocked = (current_state == State.BLOCK)
	var actual_dmg = dmg * 0.2 if is_blocked else dmg
	
	if is_blocked:
		hp -= actual_dmg
		meter = min(max_meter, meter + 6.0)
		SoundEngine.play_block()
		trigger_hit_stop(0.04)
	else:
		hp -= actual_dmg
		meter = min(max_meter, meter + 12.0)
		velocity.x = (190.0 if hit_dir == "right" else -190.0) * (1.3 if dmg >= 18.0 else 1.0)
		
		if hp <= 0.0:
			hp = 0.0
			change_state(State.KNOCKDOWN)
		elif dmg >= 24.0 or hit_type == "super":
			trigger_hit_stop(0.09)
			SoundEngine.play_critical_hit()
			change_state(State.KNOCKDOWN)
		elif dmg >= 14.0 or hit_type in ["punch_high", "kick_high"]:
			trigger_hit_stop(0.07)
			SoundEngine.play_heavy_hit()
			change_state(State.HIT_HEAVY)
		else:
			trigger_hit_stop(0.05)
			SoundEngine.play_light_hit()
			change_state(State.HIT_LIGHT)
			
	emit_signal("health_changed", hp, max_hp)
	emit_signal("meter_changed", meter, max_meter)
	
	var spark_pos = impact_pos if impact_pos != Vector2.ZERO else (global_position + Vector2(0, -42))
	emit_signal("impact_landed", spark_pos, actual_dmg, is_blocked, hit_type)
	
	if hp <= 0.0 and current_state != State.KNOCKDOWN:
		change_state(State.LOSE)

func freeze_fighter(duration: float = 2.0):
	is_frozen = true
	freeze_timer = duration
	velocity = Vector2.ZERO

func poison_fighter(duration: float = 3.5):
	is_poisoned = true
	poison_timer = duration

func _on_hitbox_area_entered(area: Area2D):
	if area.name == "Hurtbox" and area.get_parent() != self:
		var target = area.get_parent()
		if target.has_method("take_damage"):
			var dmg = hitbox.get_meta("damage") if hitbox.has_meta("damage") else 10.0
			var hit_type = hitbox.get_meta("hit_type") if hitbox.has_meta("hit_type") else "punch"
			var hit_dir = "right" if facing_dir > 0 else "left"
			var impact_pos = hitbox.global_position
			target.take_damage(dmg, hit_dir, hit_type, impact_pos)
			
			_set_hitbox_enabled(false) # Consumed hitbox safely
			trigger_hit_stop(0.06 if dmg < 20.0 else 0.09)
			combo_hits += 1
			combo_reset_timer = 1.4
			emit_signal("combo_hit", combo_hits)

# ==============================================================================
# PLAYER CONTROLS (FSM DISPATCH)
# ==============================================================================
func _is_input_action_pressed(action_name: String) -> bool:
	if player_id == 1:
		return Input.is_action_pressed(action_name)
	var p2_name = "p2_" + action_name
	if InputMap.has_action(p2_name):
		return Input.is_action_pressed(p2_name)
	return Input.is_action_pressed(action_name)

func _is_input_action_just_pressed(action_name: String) -> bool:
	if player_id == 1:
		return Input.is_action_just_pressed(action_name)
	var p2_name = "p2_" + action_name
	if InputMap.has_action(p2_name):
		return Input.is_action_just_pressed(p2_name)
	return Input.is_action_just_pressed(action_name)

# ==============================================================================
# SISTEMA DE INPUT BUFFER Y COMBOS ESPECIALES (MORTAL KOMBAT STYLE)
# ==============================================================================
func _unhandled_input(event: InputEvent):
	if is_cpu or current_state in [State.LOSE, State.DEFEAT, State.FATALITY, State.FATALITY_VICTIM]:
		return
		
	if event is InputEventKey and not event.echo and event.is_pressed():
		var action_name = ""
		if _event_is_action(event, "move_left"): action_name = "left"
		elif _event_is_action(event, "move_right"): action_name = "right"
		elif _event_is_action(event, "move_down") or _event_is_action(event, "crouch"): action_name = "down"
		elif _event_is_action(event, "punch_high"): action_name = "p_high"
		elif _event_is_action(event, "kick_high"): action_name = "k_high"
		elif _event_is_action(event, "punch_low"): action_name = "p_low"
		elif _event_is_action(event, "kick_low"): action_name = "k_low"
		
		if action_name != "":
			input_buffer.append(action_name)
			tiempo_ultimo_input = 0.0
			if input_buffer.size() > 8:
				input_buffer.pop_front()
			verificar_combos()

func _event_is_action(event: InputEvent, base_action: String) -> bool:
	if player_id == 1:
		return event.is_action_pressed(base_action)
	var p2_act = "p2_" + base_action
	if InputMap.has_action(p2_act) and event.is_action_pressed(p2_act):
		return true
	return event.is_action_pressed(base_action)

func check_input_combos(delta: float):
	if input_buffer.size() > 0:
		tiempo_ultimo_input += delta
		if tiempo_ultimo_input > TIEMPO_MAX_COMBO:
			input_buffer.clear()

func _get_relative_buffer() -> Array[String]:
	var rel: Array[String] = []
	for inp in input_buffer:
		match inp:
			"left":
				rel.append("back" if facing_dir > 0 else "fwd")
			"right":
				rel.append("fwd" if facing_dir > 0 else "back")
			_:
				rel.append(inp)
	return rel

func verificar_combos():
	if input_buffer.size() < 3:
		return
		
	var rel_last_3 = _get_relative_buffer().slice(-3)
	var raw_last_3 = input_buffer.slice(-3)
	
	# 1. RUGIDO SÓNICO: ↓ → + Piña Baja (p_low) o ← ← + Piña Baja (J / INSERT)
	# Daño: 12% con ondas expansivas doradas
	if rel_last_3 in [["down", "fwd", "p_low"], ["back", "back", "p_low"], ["fwd", "fwd", "p_low"]] or \
	   raw_last_3 in [["down", "right" if facing_dir > 0 else "left", "p_low"], ["left", "left", "p_low"]]:
		ejecutar_especial("rugido", 12.0)
		return
		
	# 2. MOTOSIERRA: ↓ ← + Piña Alta (p_high) (K / HOME)
	# Daño: 14% de vida con corte ígneo y chispas
	if rel_last_3 in [["down", "back", "p_high"], ["back", "down", "p_high"]] or \
	   raw_last_3 in [["down", "left" if facing_dir > 0 else "right", "p_high"], ["left", "down", "p_high"]]:
		ejecutar_especial("motosierra", 14.0)
		return
		
	# 3. MICRÓFONO: ↓ ← + Patada Baja (k_low) o ← → + Patada Baja (N / FIN)
	# Daño: 14% de vida, atrae al rival con onda sónica y aplica aturdimiento
	if rel_last_3 in [["down", "back", "k_low"], ["back", "fwd", "k_low"], ["fwd", "back", "k_low"]] or \
	   raw_last_3 in [["down", "left" if facing_dir > 0 else "right", "k_low"], ["left", "right", "k_low"]]:
		ejecutar_especial("mic", 14.0, true)
		return
		
	# 4. MORDISCO ASTRAL: ↓ → + Patada Alta (k_high) o → → + Patada Alta (M / RE PÁG)
	# Daño letal (18 HP base) con embestida hacia adelante y mandíbula celestial
	if rel_last_3 in [["down", "fwd", "k_high"], ["fwd", "fwd", "k_high"]] or \
	   raw_last_3 in [["down", "right" if facing_dir > 0 else "left", "k_high"], ["right", "right", "k_high"]]:
		ejecutar_especial("mordisco", 18.0)
		return

func ejecutar_especial(nombre_ataque: String, daño_base: float = 0.0, _stun: bool = false):
	# Evitar interrumpir si está recibiendo daño o en knockdown
	if current_state in [State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LOSE, State.DEFEAT, State.FATALITY, State.FATALITY_VICTIM]:
		return
		
	input_buffer.clear()
	tiempo_ultimo_input = 0.0
	print("[El León] Combo Especial Ejecutado: ", nombre_ataque)
	
	change_state(State.SPECIAL)
	velocity = Vector2.ZERO
	
	match nombre_ataque:
		"rugido":
			if anim_player.has_animation("especial_rugido"):
				anim_player.play("especial_rugido")
			elif anim_player.has_animation("special_roar"):
				anim_player.play("special_roar")
			SoundEngine.play_special()
			var dmg = daño_base if daño_base > 0.0 else 12.0
			aplicar_daño_aoe(dmg)
			activar_hitbox_especial("rugido", dmg)
			
		"motosierra":
			if anim_player.has_animation("especial_motosierra"):
				anim_player.play("especial_motosierra")
			elif anim_player.has_animation("special_chainsaw"):
				anim_player.play("special_chainsaw")
			SoundEngine.play_special()
			var dmg = daño_base if daño_base > 0.0 else 14.0
			activar_hitbox_especial("motosierra", dmg)
			
		"mic":
			if anim_player.has_animation("especial_mic"):
				anim_player.play("especial_mic")
			elif anim_player.has_animation("special_mic"):
				anim_player.play("special_mic")
			SoundEngine.play_special()
			var dmg = daño_base if daño_base > 0.0 else 14.0
			activar_hitbox_especial("mic", dmg)
			atraer_y_stun_oponente(1.8)
			# Conexión directa asegurada si el oponente está en rango de atracción
			var opp = get_oponente()
			if opp != null:
				var dist = abs(opp.global_position.x - global_position.x)
				var is_in_front = (opp.global_position.x - global_position.x) * facing_dir >= -25.0
				if dist <= 180.0 and is_in_front:
					if opp.has_method("take_damage"):
						var hit_dir = "right" if facing_dir > 0 else "left"
						opp.take_damage(dmg, hit_dir, "special", opp.global_position + Vector2(0, -50))
					elif opp.has_method("recibir_daño"):
						opp.recibir_daño(dmg)
			
		"mordisco":
			if anim_player.has_animation("especial_mordisco"):
				anim_player.play("especial_mordisco")
			elif anim_player.has_animation("bite"):
				anim_player.play("bite")
			elif anim_player.has_animation("super"):
				anim_player.play("super")
			SoundEngine.play_super()
			velocity.x = facing_dir * 250.0
			velocity.y = -70.0 # Embestida despegando levemente del suelo
			var dmg = daño_base if daño_base > 0.0 else 18.0
			activar_hitbox_especial("mordisco", dmg)

func get_oponente() -> Node2D:
	if opponent != null:
		return opponent
	if oponente != null:
		return oponente
	return get_parent().get_node_or_null("Oponente")

func aplicar_daño_aoe(daño_base: float):
	var opp = get_oponente()
	if opp != null:
		var dist = abs(opp.global_position.x - global_position.x)
		var is_in_front = (opp.global_position.x - global_position.x) * facing_dir >= -30.0
		if dist <= 280.0 and is_in_front:
			if opp.has_method("recibir_daño"):
				opp.recibir_daño(daño_base)
			elif opp.has_method("take_damage"):
				var hit_dir = "right" if facing_dir > 0 else "left"
				opp.take_damage(daño_base, hit_dir, "special", opp.global_position + Vector2(0, -42))

func activar_hitbox_especial(tipo_arma: String, daño_base: float):
	match tipo_arma:
		"motosierra":
			var reach_x = 54.0 * facing_dir
			var pos_y = -48.0
			var box_size = Vector2(70.0, 48.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, daño_base * atk_power, "special")
		"mic":
			var reach_x = 50.0 * facing_dir
			var pos_y = -52.0
			var box_size = Vector2(66.0, 44.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, daño_base * atk_power, "special")
		"mordisco":
			var reach_x = 50.0 * facing_dir
			var pos_y = -50.0
			var box_size = Vector2(66.0, 48.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, daño_base * atk_power, "super")
		"rugido":
			var reach_x = 58.0 * facing_dir
			var pos_y = -50.0
			var box_size = Vector2(78.0, 52.0)
			_set_hitbox_size_and_pos(Vector2(reach_x, pos_y), box_size, daño_base * atk_power, "special")

func atraer_y_stun_oponente(segundos_stun: float = 2.0):
	var opp = get_oponente()
	if opp != null:
		if opp.has_method("atraer_por_mic"):
			opp.atraer_por_mic(global_position)
		elif opp is CharacterBody2D:
			var target_x = global_position.x + (65.0 * facing_dir)
			var tw = create_tween()
			tw.tween_property(opp, "global_position:x", target_x, 0.32).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
			
		if opp.has_method("quedar_inconciente"):
			opp.quedar_inconciente(segundos_stun)
		elif opp.has_method("freeze_fighter"):
			opp.freeze_fighter(segundos_stun)

# Receptores en El León (y cualquier otro luchador compatible)
func recibir_daño(daño_base: float):
	var hit_dir = "left" if facing_dir > 0 else "right"
	take_damage(daño_base, hit_dir, "special", global_position + Vector2(0, -42))

func quedar_inconciente(segundos: float = 2.0):
	freeze_fighter(segundos)
	if current_state not in [State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]:
		change_state(State.HIT_LIGHT)

func atraer_por_mic(origen: Vector2):
	var target_x = origen.x + (-60.0 if origen.x > global_position.x else 60.0)
	var tw = create_tween()
	tw.tween_property(self, "global_position:x", target_x, 0.32).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	if current_state not in [State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]:
		change_state(State.HIT_LIGHT)

func _process_player_input():
	# Si está ejecutando un golpe o recuperación de impacto, se bloquea el movimiento hasta terminar la animación
	if current_state in [
		State.PUNCH_HIGH, State.PUNCH_LOW, State.KICK_HIGH, State.KICK_LOW,
		State.CROUCH_PUNCH_HIGH, State.CROUCH_PUNCH_LOW, State.CROUCH_KICK_HIGH, State.CROUCH_KICK_LOW,
		State.LIGHT_PUNCH, State.MID_PUNCH, State.HEAVY_PUNCH,
		State.LIGHT_KICK, State.MID_KICK, State.HEAVY_KICK,
		State.SPECIAL, State.SUPER_ATTACK,
		State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LAND
	]:
		return
	
	# Guardar tiempo del toque hacia abajo para detección de combos especiales (↓ → + Piña)
	if _is_input_action_just_pressed("crouch"):
		last_down_press_time = Time.get_ticks_msec() / 1000.0
		
	# 1. BLOQUEO DEFENSIVO (RE PÁG / KEY_PAGEUP)
	# Si mantiene presionado 'block', entra en estado BLOCK (no puede atacar ni caminar, reduce daño recibido)
	if _is_input_action_pressed("block") and is_on_floor():
		velocity.x = 0.0
		if current_state != State.BLOCK:
			change_state(State.BLOCK)
		return
	elif current_state == State.BLOCK and not _is_input_action_pressed("block"):
		change_state(State.IDLE)

	# 2. ESTADO AGACHADO Y ATAQUES AGACHADOS (Flecha Abajo / KEY_DOWN)
	# Si presiona una piña o patada mientras mantiene abajo, ejecuta el ataque agachado
	if _is_input_action_pressed("crouch") and is_on_floor():
		velocity.x = 0.0
		if _is_input_action_just_pressed("punch_high") or _is_input_action_just_pressed("punch_low"):
			attack_crouch_punch_low()
			return
		if _is_input_action_just_pressed("kick_high") or _is_input_action_just_pressed("kick_low"):
			attack_crouch_kick_low()
			return
			
		if current_state in [State.IDLE, State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN]:
			change_state(State.CROUCH_START)
			return
		elif current_state == State.CROUCHING:
			return
	elif current_state == State.CROUCHING and not _is_input_action_pressed("crouch"):
		change_state(State.CROUCH_END)
		return

	# 3. SALTO (Flecha Arriba / KEY_UP)
	if _is_input_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_FORCE
		SoundEngine.play_jump()
		var move_h = 0.0
		if _is_input_action_pressed("move_left"): move_h -= 1.0
		if _is_input_action_pressed("move_right"): move_h += 1.0
		
		if move_h != 0.0:
			velocity.x = move_h * speed
			change_state(State.JUMP_FORWARD)
		else:
			change_state(State.JUMP_UP)
		return

	# 4. ATAQUES DE PIE Y COMBOS
	var now_time = Time.get_ticks_msec() / 1000.0
	var had_recent_down = (now_time - last_down_press_time) < 0.35
	var pressing_toward = (facing_dir > 0 and _is_input_action_pressed("move_right")) or (facing_dir < 0 and _is_input_action_pressed("move_left"))
	var pressing_away = (facing_dir > 0 and _is_input_action_pressed("move_left")) or (facing_dir < 0 and _is_input_action_pressed("move_right"))

	# Piña Baja -> INICIO / HOME / J -> RUGIDO SÓNICO si hace ↓ →
	if _is_input_action_just_pressed("punch_low"):
		if character_id == "leon":
			if had_recent_down and pressing_toward:
				ejecutar_especial("rugido", 12.0)
				return
		elif had_recent_down and pressing_toward and meter >= 15.0:
			attack_special1()
			return
		attack_punch_low()
		return

	# Piña Alta -> INS / INSERT / K -> MOTOSIERRA si hace ↓ ←
	if _is_input_action_just_pressed("punch_high"):
		if character_id == "leon":
			if had_recent_down and pressing_away:
				ejecutar_especial("motosierra", 14.0)
				return
		elif had_recent_down and pressing_toward and meter >= 15.0:
			attack_special1()
			return
		attack_punch_high()
		return
		
	# Patada Baja -> FIN / END / N -> MICRÓFONO si hace ↓ ←
	if _is_input_action_just_pressed("kick_low"):
		if character_id == "leon":
			if had_recent_down and (pressing_away or pressing_toward):
				ejecutar_especial("mic", 14.0, true)
				return
		attack_kick_low()
		return

	# Patada Alta -> SUPR / RE PÁG / M -> MORDISCO ASTRAL si hace ↓ →
	if _is_input_action_just_pressed("kick_high"):
		if character_id == "leon":
			if had_recent_down and pressing_toward:
				ejecutar_especial("mordisco", 18.0)
				return
		elif had_recent_down and pressing_away and meter >= 20.0:
			attack_special2()
			return
		attack_kick_high()
		return

	# 5. MOVIMIENTO TERRESTRE (CAMINATA Y CARRERA)
	# Si presiona 'run' mientras mantiene una dirección, entra en estado RUN (duplica velocidad horizontal con animación de carrera)
	if current_state in [State.IDLE, State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN]:
		var dir_input = 0.0
		if _is_input_action_pressed("move_left"):
			dir_input -= 1.0
		if _is_input_action_pressed("move_right"):
			dir_input += 1.0
			
		var is_running = _is_input_action_pressed("run")
		
		if dir_input != 0.0:
			if is_running:
				velocity.x = dir_input * speed * 2.0
				change_state(State.RUN)
			else:
				velocity.x = dir_input * speed
				var is_forward = (dir_input > 0 and facing_dir > 0) or (dir_input < 0 and facing_dir < 0)
				if is_forward:
					change_state(State.WALK_FORWARD)
				else:
					change_state(State.WALK_BACKWARD)
		else:
			velocity.x = 0.0
			change_state(State.IDLE)

# ==============================================================================
# CPU AI LOGIC
# ==============================================================================
func _process_cpu_ai(delta: float):
	if not opponent:
		return
		
	# En modo entrenamiento, el NPC NO debe golpear
	if GameManager.current_mode == GameManager.GameMode.TRAINING:
		velocity.x = 0.0
		if current_state not in [State.HIT_LIGHT, State.HIT_HEAVY, State.KNOCKDOWN, State.LOSE, State.DEFEAT, State.FATALITY_VICTIM]:
			if current_state != State.IDLE:
				change_state(State.IDLE)
		return

	ai_decision_timer += delta
	
	# Intervalos más relajados para una curva de dificultad justa
	var interval = 0.65 # Normal (mucho más amigable y accesible)
	match difficulty:
		"easy": interval = 0.85
		"hard": interval = 0.30
		"extremo": interval = 0.15
		
	if ai_decision_timer < interval:
		return
	ai_decision_timer = 0.0
	
	# Probabilidad de vacilación/pausa según dificultad (da aire al jugador)
	var hesitation_chance = 0.55 if difficulty == "easy" else (0.45 if difficulty == "normal" else 0.10)
	if randf() < hesitation_chance:
		# Simplemente mantiene distancia o guardia sin atacar
		if is_on_floor() and current_state not in [State.BLOCK, State.IDLE]:
			change_state(State.IDLE)
		return
	
	var dist = abs(global_position.x - opponent.global_position.x)
	var opponent_attack = opponent.current_state in [
		State.PUNCH_HIGH, State.PUNCH_LOW, State.KICK_HIGH, State.KICK_LOW,
		State.LIGHT_PUNCH, State.MID_PUNCH, State.HEAVY_PUNCH,
		State.LIGHT_KICK, State.MID_KICK, State.HEAVY_KICK,
		State.SPECIAL, State.SUPER_ATTACK
	]
	
	# Reactive Block (solo en hard y extremo con frecuencia alta)
	if (difficulty in ["hard", "extremo"]) and opponent_attack:
		if randf() < 0.60:
			change_state(State.BLOCK)
			return
	elif difficulty == "normal" and opponent_attack and randf() < 0.15:
		change_state(State.BLOCK)
		return
	elif current_state == State.BLOCK:
		change_state(State.IDLE)
		
	# Super Attack when meter full (menos spam en normal)
	var super_chance = 0.15 if difficulty == "normal" else 0.40
	if meter >= 100.0 and (dist < 95.0 or randf() < super_chance):
		attack_super()
		return
		
	# Distant Combat (Projectiles & Approach)
	if dist > 140.0:
		var special_chance = 0.12 if difficulty == "normal" else 0.35
		if meter >= 25.0 and randf() < special_chance:
			attack_special3()
		elif meter >= 15.0 and randf() < special_chance:
			attack_special1()
		else:
			var approach_dir = 1.0 if opponent.global_position.x > global_position.x else -1.0
			velocity.x = approach_dir * (speed * 0.8 if difficulty == "normal" else speed)
			change_state(State.WALK_FORWARD if approach_dir == facing_dir else State.WALK_BACKWARD)
	# Close Quarters Combat
	elif dist < 70.0:
		# En dificultad normal, 38% de las veces retrocede para no agobiar
		if difficulty in ["easy", "normal"] and randf() < 0.38:
			var retreat_dir = -1.0 if opponent.global_position.x > global_position.x else 1.0
			velocity.x = retreat_dir * (speed * 0.7)
			change_state(State.WALK_BACKWARD)
			return
			
		if meter >= 20.0 and randf() < (0.15 if difficulty == "normal" else 0.40):
			attack_special2()
		else:
			var pick = randf()
			if pick < 0.25:
				attack_heavy_punch()
			elif pick < 0.50:
				attack_heavy_kick()
			elif pick < 0.75:
				attack_light_punch()
			else:
				attack_light_kick()
	# Mid Range
	else:
		if randf() < 0.20 and is_on_floor():
			velocity.y = JUMP_FORCE
			SoundEngine.play_jump()
			change_state(State.JUMP_FORWARD)
		elif randf() < 0.35:
			attack_heavy_kick()
		elif randf() < 0.55:
			attack_heavy_punch()
		else:
			var approach_dir = 1.0 if opponent.global_position.x > global_position.x else -1.0
			velocity.x = approach_dir * (speed * 0.8 if difficulty == "normal" else speed)
			change_state(State.WALK_FORWARD if approach_dir == facing_dir else State.WALK_BACKWARD)
