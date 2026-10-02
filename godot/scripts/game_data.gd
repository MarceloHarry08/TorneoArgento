extends Node

# TORNEO ARGENTO 16-BIT: Global Game Data & State Manager

const ROSTER_KEYS = [
	"leon", "latina", "ojosazules", "pepeargento",
	"eleternauta", "elcomandante", "elmesias", "hugo",
	"pergolas", "sangrejaponesa", "badbitch", "inmortal"
]

const STAGE_KEYS = [
	"obelisco", "casarosada", "caminito", "glaciar", "mesaza"
]

const STANDARD_FRAMES = {
	"portrait": Rect2(15, 10, 90, 70),
	"idle": [Rect2(15, 90, 120, 175), Rect2(145, 90, 120, 175), Rect2(275, 90, 120, 175)],
	"walk": [Rect2(15, 275, 120, 175), Rect2(145, 275, 120, 175), Rect2(275, 275, 120, 175), Rect2(405, 275, 120, 175)],
	"jump": [Rect2(15, 460, 120, 175), Rect2(145, 460, 120, 175)],
	"crouch": Rect2(275, 460, 120, 175),
	"block": Rect2(405, 460, 120, 175),
	"punch_light": [Rect2(15, 645, 120, 175), Rect2(145, 645, 130, 175)],
	"punch_heavy": [Rect2(285, 645, 120, 175), Rect2(415, 645, 140, 175)],
	"kick_light": [Rect2(15, 830, 120, 175), Rect2(145, 830, 130, 175)],
	"kick_heavy": [Rect2(285, 830, 120, 175), Rect2(415, 830, 140, 175)],
	"special": [Rect2(15, 1015, 130, 175), Rect2(155, 1015, 140, 175), Rect2(305, 1015, 150, 175)],
	"hurt": Rect2(15, 1200, 120, 175),
	"dizzy": [Rect2(145, 1200, 120, 175), Rect2(275, 1200, 120, 175), Rect2(405, 1200, 120, 175)],
	"defeat_kneeling": Rect2(15, 1385, 125, 175),
	"defeat_dead": Rect2(150, 1385, 175, 175),
	"victory": [Rect2(335, 1385, 120, 175), Rect2(465, 1385, 120, 175)]
}

var CHARACTERS = {
	"leon": {
		"id": "leon",
		"name": "LEON",
		"alias": "Javier Milei",
		"quote": "¡Viva la libertad carajo!",
		"stats": { "atk": 88, "spd": 85, "spc": 92 },
		"theme_color": Color("#e09b10"),
		"moves": {
			"special1": { "id": "roar", "name": "Rugido Sónico", "type": "special", "dmg": 12, "cost": 15, "desc": "Rugido colosal con ondas sonoras doradas expansivas." },
			"special2": { "id": "chainsaw", "name": "Motosierra", "type": "special", "dmg": 14, "cost": 20, "desc": "Ataque ígneo de motosierra cortante con chispas de fuego." },
			"special3": { "id": "mic", "name": "Micrófono Sónico", "type": "special", "dmg": 14, "cost": 20, "desc": "Lanza micrófono vintage con onda sonora que atrae al rival." },
			"super": { "id": "mordisco", "name": "Mordisco Astral", "type": "super", "dmg": 18, "cost": 100, "desc": "Mandíbula celestial de león que desgarra al rival." },
			"fatality": { "name": "Privatización Total", "desc": "¡Desintegra al rival con el rugido y garras de león definitivas!" }
		},
		"combos": [
			{ "name": "Rugido Sónico", "input": "↓ → + Piña Baja (J)", "hits": 3 },
			{ "name": "Motosierra", "input": "↓ ← + Piña Alta (K)", "hits": 4 },
			{ "name": "Micrófono", "input": "↓ ← + Patada Baja (N)", "hits": 2 },
			{ "name": "Mordisco Astral", "input": "↓ → + Patada Alta (M)", "hits": 3 }
		]
	},
	"latina": {
		"id": "latina",
		"name": "LATINA",
		"alias": "Cristina Kirchner",
		"quote": "¡No nos fue tan mal!",
		"stats": { "atk": 78, "spd": 72, "spc": 96 },
		"theme_color": Color("#4ea8de"),
		"moves": {
			"special1": { "id": "solar_ray", "name": "Rayo de Sol de Mayo", "type": "vertical_beam", "projType": "pyramids", "dmg": 18, "cost": 20, "desc": "Un rayo solar dorado calcinante desciende del cielo." },
			"special2": { "id": "pyramid_barrage", "name": "Lluvia de Pirámides", "type": "projectile", "projType": "pyramids", "dmg": 16, "cost": 20, "desc": "Dispara pirámides místicas en abanico." },
			"special3": { "id": "cadena_blast", "name": "Cadena Nacional Blast", "type": "projectile", "projType": "cadena", "dmg": 20, "cost": 25, "desc": "Onda expansiva de energía dorada con el sol patrio." },
			"super": { "id": "pyramid_prison", "name": "Poder Piramidal Cósmico", "type": "super", "dmg": 44, "cost": 100, "desc": "Encierra al enemigo en una pirámide electrocutante." },
			"fatality": { "name": "Cadena 24 Horas", "desc": "¡Atrapa al enemigo en un discurso infinito de 16-bits!" }
		}
	},
	"ojosazules": {
		"id": "ojosazules",
		"name": "OJOS AZULES",
		"alias": "Mauricio Macri",
		"quote": "¡Pasaron cosas... y se puede!",
		"stats": { "atk": 72, "spd": 82, "spc": 88 },
		"theme_color": Color("#ffd166"),
		"moves": {
			"special1": { "id": "cat_throw", "name": "Lanzamiento Gatuno", "type": "projectile", "projType": "flying_cat", "dmg": 16, "cost": 15, "desc": "Lanza un gato siamés de píxeles que vuela y araña." },
			"special2": { "id": "kitten_stampede", "name": "Estampida de Gatitos", "type": "ground_hazard", "projType": "kittens", "dmg": 18, "cost": 20, "desc": "Gatitos corriendo por el piso haciendo tropezar al rival." },
			"special3": { "id": "yellow_balloon", "name": "Globo Amarillo Mine", "type": "projectile", "projType": "balloon", "dmg": 19, "cost": 25, "desc": "Mina flotante que detona con confeti electrificado." },
			"super": { "id": "feline_presidential", "name": "Garra Felina Presidencial", "type": "super", "dmg": 42, "cost": 100, "desc": "Zarpazo felino gigante con destellos celestes en los ojos." },
			"fatality": { "name": "Reposera Mortal", "desc": "¡Aplasta al rival con un Globo Amarillo Gigante!" }
		}
	},
	"pepeargento": {
		"id": "pepeargento",
		"name": "PEPE ARGENTO",
		"alias": "El Patrón / Guillermo F.",
		"quote": "¡Hermosa mañana, ¿verdad?!",
		"stats": { "atk": 86, "spd": 80, "spc": 84 },
		"theme_color": Color("#00a8e8"),
		"moves": {
			"special1": { "id": "racing_fury", "name": "Furia Racing Club", "type": "melee_special", "dmg": 18, "cost": 20, "desc": "Ráfaga devastadora de piñas con cara de furia total." },
			"special2": { "id": "shoe_kick", "name": "Zapatazo Rabioso", "type": "strike_special", "dmg": 20, "cost": 20, "desc": "Patada acrobática de zapatero envuelta en llamas." },
			"special3": { "id": "contraband_call", "name": "Pistola de Píxeles", "type": "projectile", "projType": "pistol_shot", "dmg": 20, "cost": 25, "desc": "Saca una pistola retro y dispara un proyectil certero." },
			"super": { "id": "soquete_strike", "name": "¡Pedazo de Soooquete!", "type": "super", "dmg": 46, "cost": 100, "desc": "Tormenta de insultos cómicos y combos demoliendo al rival." },
			"fatality": { "name": "Portazo y Carcajada", "desc": "¡Lanza su carcajada legendaria pulverizando la pantalla!" }
		}
	},
	"eleternauta": {
		"id": "eleternauta",
		"name": "EL ETERNAUTA",
		"alias": "Juan Salvo / Ricardo D.",
		"quote": "¡Nevada fosforescente en Buenos Aires!",
		"stats": { "atk": 88, "spd": 78, "spc": 94 },
		"theme_color": Color("#a8dadc"),
		"moves": {
			"special1": { "id": "freeze_blast", "name": "Nevada Mortal", "type": "freeze_projectile", "projType": "ice_blast", "dmg": 16, "cost": 25, "desc": "Ráfaga criogénica que CONGELA al rival en un témpano." },
			"special2": { "id": "ice_monolith", "name": "Monolito de Hielo", "type": "summon_drop", "projType": "ice_sculpture", "dmg": 22, "cost": 25, "desc": "Escultura de hielo macizo que cae aplastando al enemigo." },
			"special3": { "id": "voxel_barrier", "name": "Voxel Barrier", "type": "projectile", "projType": "voxel_wall", "dmg": 15, "cost": 20, "desc": "Muro defensivo de cubos de hielo cortantes." },
			"super": { "id": "absolute_zero", "name": "Esferas de Cero Absoluto", "type": "super", "dmg": 48, "cost": 100, "desc": "Orbes helados que estallan congelando todo el escenario." },
			"fatality": { "name": "Criogenización Urbana", "desc": "¡Encierra al enemigo en una tumba de nieve letal fosforescente!" }
		}
	},
	"elcomandante": {
		"id": "elcomandante",
		"name": "EL COMANDANTE",
		"alias": "Ricardo Fort",
		"quote": "¡Basta chicos! ¡Miami me lo confirmó!",
		"stats": { "atk": 92, "spd": 76, "spc": 88 },
		"theme_color": Color("#e63946"),
		"moves": {
			"special1": { "id": "money_storm", "name": "Tormenta de Billetes", "type": "projectile", "projType": "dollars", "dmg": 18, "cost": 20, "desc": "Dispara ráfaga de billetes de 100 dólares afilados giratorios." },
			"special2": { "id": "gold_suitcase", "name": "Lluvia de Dólares y Oro", "type": "summon_drop", "projType": "suitcase", "dmg": 22, "cost": 25, "desc": "Valija de lingotes de oro y fajos cae golpeando al rival." },
			"special3": { "id": "rolls_royce_dash", "name": "Rolls Royce Dash", "type": "strike_special", "dmg": 20, "cost": 20, "desc": "Embestida de lujo a alta velocidad impulsada con aura dorada." },
			"super": { "id": "basta_chicos", "name": "¡Basta Chicos! Miami Explosion", "type": "super", "dmg": 48, "cost": 100, "desc": "Detonación masiva de champán, fuegos artificiales y fajos." },
			"fatality": { "name": "Cutucucho Miami", "desc": "¡Atropella al rival con un Rolls Royce plateado lleno de dólares!" }
		}
	},
	"elmesias": {
		"id": "elmesias",
		"name": "EL MESÍAS",
		"alias": "Lionel Messi",
		"quote": "¡Qué mirás, bobo! ¡Andá pa allá!",
		"stats": { "atk": 92, "spd": 96, "spc": 96 },
		"theme_color": Color("#00b4d8"),
		"moves": {
			"special1": { "id": "free_kick", "name": "Tiro Libre Chanfle 10", "type": "projectile", "projType": "curved_ball", "dmg": 20, "cost": 20, "desc": "Remate con comba de fuego celeste y blanco al ángulo." },
			"special2": { "id": "cosmic_dribble", "name": "Gambeta Cósmica", "type": "strike_special", "dmg": 18, "cost": 20, "desc": "Esquiva veloz dejando sombras y remata una pelota dorada." },
			"special3": { "id": "balon_oro", "name": "Balón de Oro Cannon", "type": "projectile", "projType": "gold_ball", "dmg": 22, "cost": 25, "desc": "Disparo de pelota de oro macizo a la velocidad de la luz." },
			"super": { "id": "bicycle_kick", "name": "Chilena del Campeón del Mundo", "type": "super", "dmg": 52, "cost": 100, "desc": "Salto celestial de chilena que dispara un cometa dorado." },
			"fatality": { "name": "Qué Mirás Bobo Laser", "desc": "¡Cañonazo dorado legendario que pulveriza al oponente!" }
		}
	},
	"hugo": {
		"id": "hugo",
		"name": "HUGO",
		"alias": "Marcelo Tinelli",
		"quote": "¡Chau, chau, chauuu!",
		"stats": { "atk": 78, "spd": 88, "spc": 84 },
		"theme_color": Color("#8338ec"),
		"moves": {
			"special1": { "id": "sonic_laugh", "name": "Risa Sónica Ultrasónica", "type": "projectile", "projType": "laugh_waves", "dmg": 16, "cost": 15, "desc": "Carcajadas en ondas de sonido que aturden y frenan." },
			"special2": { "id": "lightning_dance", "name": "Movimiento Relámpago", "type": "strike_special", "dmg": 19, "cost": 20, "desc": "Desplazamiento zigzagueante con sombras que confunden." },
			"special3": { "id": "rexona_missile", "name": "Rexona Missile", "type": "projectile", "projType": "deodorant", "dmg": 18, "cost": 20, "desc": "Aerosol presurizado disparado como cohete químico." },
			"super": { "id": "chau_blitz", "name": "¡Chau Chau Chauuu! Blitz", "type": "super", "dmg": 43, "cost": 100, "desc": "Ráfaga supersónica que expulsa al rival del estudio." },
			"fatality": { "name": "Puntaje 10 Final", "desc": "¡Cae una paleta gigante del número 10 aplastando al enemigo!" }
		}
	},
	"pergolas": {
		"id": "pergolas",
		"name": "PERGOLAS",
		"alias": "Mario Pergolini",
		"quote": "¡Caiga quien caiga!",
		"stats": { "atk": 82, "spd": 86, "spc": 86 },
		"theme_color": Color("#3a86ff"),
		"moves": {
			"special1": { "id": "spy_drone", "name": "Dron Espía de Ataque", "type": "projectile", "projType": "drone", "dmg": 18, "cost": 20, "desc": "Dron volador pixelado que sobrevuela y dispara lásers." },
			"special2": { "id": "robot_sentry", "name": "Robot Centinela 16-Bit", "type": "strike_special", "dmg": 20, "cost": 25, "desc": "Robot mecánico que embiste y dispara micromisiles." },
			"special3": { "id": "cqc_whip", "name": "CQC Mic Whip", "type": "melee_special", "dmg": 18, "cost": 20, "desc": "Látigo de cable de micrófono con descarga eléctrica." },
			"super": { "id": "orbital_hack", "name": "Hackeo Satelital CQC", "type": "super", "dmg": 46, "cost": 100, "desc": "Disparo de cañón orbital espacial que hace temblar la pantalla." },
			"fatality": { "name": "Glitch de Televisión", "desc": "¡Atrapa al rival en un sintonizador de TV retro destruido!" }
		}
	},
	"sangrejaponesa": {
		"id": "sangrejaponesa",
		"name": "SANGRE JAPONESA",
		"alias": "China Suárez",
		"quote": "¡Beso letal y libertad!",
		"stats": { "atk": 86, "spd": 84, "spc": 90 },
		"theme_color": Color("#ff006e"),
		"moves": {
			"special1": { "id": "poison_kiss", "name": "Beso Venenoso", "type": "projectile", "projType": "poison_lips", "dmg": 17, "cost": 20, "desc": "Labios de energía rosa tóxica con veneno duradero." },
			"special2": { "id": "toxic_mist", "name": "Niebla Tóxica", "type": "ground_hazard", "projType": "poison_cloud", "dmg": 18, "cost": 20, "desc": "Nube violeta en el suelo que daña continuamente al rival." },
			"special3": { "id": "saber_slash", "name": "Sablazo Granadero", "type": "strike_special", "dmg": 20, "cost": 20, "desc": "Estocada rápida de sable militar con chispas cortantes." },
			"super": { "id": "poison_thorns", "name": "Espinas del Amor Venenoso", "type": "super", "dmg": 45, "cost": 100, "desc": "Ráfaga de rosas con espinas impregnadas en toxinas letales." },
			"fatality": { "name": "Carga de Caballería Tóxica", "desc": "¡Estampida con espadas de veneno púrpura!" }
		}
	},
	"badbitch": {
		"id": "badbitch",
		"name": "BAD BITCH",
		"alias": "Wanda Nara",
		"quote": "¡Siempre consigue lo que quiere!",
		"stats": { "atk": 82, "spd": 84, "spc": 88 },
		"theme_color": Color("#f72585"),
		"moves": {
			"special1": { "id": "glitter_bomb", "name": "Bomba de Glitter", "type": "projectile", "projType": "glitter_bomb", "dmg": 18, "cost": 20, "desc": "Cosmético que estalla en detonación de fuego y chispas." },
			"special2": { "id": "vip_landmine", "name": "Mina Antipersona VIP", "type": "ground_hazard", "projType": "landmine", "dmg": 20, "cost": 20, "desc": "Explosivo en el piso que detona al acercarse el rival." },
			"special3": { "id": "louis_strike", "name": "Cartera Louis Strike", "type": "melee_special", "dmg": 18, "cost": 15, "desc": "Golpe contundente con bolso de diseño que aturde." },
			"super": { "id": "paparazzi_c4", "name": "Detonación Paparazzi", "type": "super", "dmg": 46, "cost": 100, "desc": "Explosión en cadena de flashes y pólvora." },
			"fatality": { "name": "Enjambre Paparazzi C4", "desc": "¡Flashes enceguecedores y detonaciones hacen volar al enemigo!" }
		}
	},
	"inmortal": {
		"id": "inmortal",
		"name": "INMORTAL",
		"alias": "Mirtha Legrand (JEFA FINAL)",
		"quote": "¡Como te ven te tratan, y si te ven mal te maltratan!",
		"stats": { "atk": 98, "spd": 90, "spc": 100 },
		"theme_color": Color("#ffd700"),
		"moves": {
			"special1": { "id": "telekinetic_tableware", "name": "Vajilla y Sillas", "type": "projectile", "projType": "silver_cutlery", "dmg": 24, "cost": 15, "desc": "Sillas de oro y copas de cristal telequinéticas." },
			"special2": { "id": "immortal_lightning", "name": "Rayos de Inmortalidad", "type": "projectile", "projType": "divine_lightning", "dmg": 26, "cost": 20, "desc": "Relámpagos divinos desde sus manos rebotando en el mármol." },
			"special3": { "id": "mesaza_hammer", "name": "Mesaza Table Smash", "type": "strike_special", "dmg": 25, "cost": 20, "desc": "Impacto sísmico con el martillo dorado del mediodía." },
			"super": { "id": "eternal_judgment", "name": "Juicio Milenario", "type": "super", "dmg": 58, "cost": 100, "desc": "Mesa imperial gigante cae del cielo en tormenta de rayos." },
			"fatality": { "name": "La Mesaza Final y Eterna", "desc": "¡Sienta al rival a la mesaza histórica para el banquete definitivo!" }
		}
	}
}

var STAGES = {
	"obelisco": {
		"id": "obelisco",
		"name": "Obelisco de Buenos Aires",
		"file": "res://assets/stages/stage_obelisco.jpg",
		"song": "homero",
		"skyColor": Color("#0a081a"),
		"groundColor": Color("#22222b")
	},
	"casarosada": {
		"id": "casarosada",
		"name": "Plaza de Mayo / Casa Rosada",
		"file": "res://assets/stages/stage_casarosada.jpg",
		"song": "hacelopormi",
		"skyColor": Color("#1a102f"),
		"groundColor": Color("#3a251e")
	},
	"caminito": {
		"id": "caminito",
		"name": "Caminito (La Boca)",
		"file": "res://assets/stages/stage_caminito.jpg",
		"song": "fanky",
		"skyColor": Color("#190e24"),
		"groundColor": Color("#3a2e2b")
	},
	"glaciar": {
		"id": "glaciar",
		"name": "Glaciar Perito Moreno",
		"file": "res://assets/stages/stage_glaciar.jpg",
		"song": "labalada",
		"skyColor": Color("#061729"),
		"groundColor": Color("#1d3557")
	},
	"mesaza": {
		"id": "mesaza",
		"name": "Templo Inmortal de la Mesaza",
		"file": "res://assets/stages/stage_mesaza.jpg",
		"song": "hadaelmago",
		"skyColor": Color("#1e001e"),
		"groundColor": Color("#4a0e2e")
	}
}

# Current Match Session Config
var game_mode: String = "arcade" # "arcade", "vs_cpu", "vs_player"
var selected_p1: String = "leon"
var selected_p2: String = "latina"
var selected_stage: String = "obelisco"
var difficulty: String = "normal" # "easy", "normal", "hard", "extremo"

# Arcade Tower Progression
var tower_index: int = 0
var tower_opponents = [
	"latina", "ojosazules", "pepeargento", "eleternauta",
	"elcomandante", "elmesias", "moria", "inmortal"
]

# Last Match Results
var last_winner: String = ""
var last_was_fatality: bool = false
var p1_wins: int = 0
var p2_wins: int = 0

func get_character(char_key: String) -> Dictionary:
	if CHARACTERS.has(char_key):
		return CHARACTERS[char_key]
	return CHARACTERS["leon"]

func get_stage(stage_key: String) -> Dictionary:
	if STAGES.has(stage_key):
		return STAGES[stage_key]
	return STAGES["obelisco"]

func advance_tower() -> bool:
	tower_index += 1
	if tower_index < tower_opponents.size():
		selected_p2 = tower_opponents[tower_index]
		# Alternate stages for tower progression
		selected_stage = STAGE_KEYS[tower_index % STAGE_KEYS.size()]
		return true
	return false # Tower beaten!

func _ready():
	_setup_input_map()

func _setup_input_map():
	# Player 1 Inputs (Original keyboard + WASD/laptop keys + joypad)
	_register_key_action("p1_left", [KEY_LEFT, KEY_A])
	_register_key_action("p1_right", [KEY_RIGHT, KEY_D])
	_register_key_action("p1_up", [KEY_UP, KEY_W])
	_register_key_action("p1_down", [KEY_DOWN, KEY_S])
	
	# Player 1 Inputs - Complete 4-button arcade setup + specials
	_register_key_action("p1_punch_low", [KEY_INSERT, KEY_J, KEY_X])
	_register_joy_action("p1_punch_low", JOY_BUTTON_X)
	_register_key_action("p1_light_punch", [KEY_INSERT, KEY_J, KEY_X])
	_register_joy_action("p1_light_punch", JOY_BUTTON_X)
	
	_register_key_action("p1_punch_high", [KEY_HOME, KEY_K, KEY_C])
	_register_joy_action("p1_punch_high", JOY_BUTTON_Y)
	_register_key_action("p1_heavy_punch", [KEY_HOME, KEY_K, KEY_C])
	_register_joy_action("p1_heavy_punch", JOY_BUTTON_Y)
	
	_register_key_action("p1_kick_low", [KEY_PAGEDOWN, KEY_END, KEY_N, KEY_Z])
	_register_joy_action("p1_kick_low", JOY_BUTTON_A)
	
	_register_key_action("p1_kick_high", [KEY_PAGEUP, KEY_M, KEY_V])
	_register_joy_action("p1_kick_high", JOY_BUTTON_B)
	
	_register_key_action("p1_block", [KEY_DELETE, KEY_L])
	_register_joy_action("p1_block", JOY_BUTTON_LEFT_SHOULDER)
	
	_register_key_action("p1_special1", [KEY_U, KEY_1])
	_register_joy_action("p1_special1", JOY_BUTTON_RIGHT_SHOULDER)
	
	_register_key_action("p1_special2", [KEY_I, KEY_2])
	_register_key_action("p1_special3", [KEY_SCROLLLOCK, KEY_PRINT, KEY_O, KEY_3])
	_register_key_action("p1_super", [KEY_P, KEY_4])
	
	_register_key_action("pause", [KEY_ESCAPE, KEY_PAUSE, KEY_SPACE])
	_register_joy_action("pause", JOY_BUTTON_START)
	
	# Player 2 Local Inputs (NumPad & Secondary)
	_register_key_action("p2_left", [KEY_KP_4])
	_register_key_action("p2_right", [KEY_KP_6])
	_register_key_action("p2_up", [KEY_KP_8])
	_register_key_action("p2_down", [KEY_KP_2])
	
	_register_key_action("p2_punch_low", [KEY_KP_1])
	_register_key_action("p2_light_punch", [KEY_KP_1])
	_register_key_action("p2_punch_high", [KEY_KP_2])
	_register_key_action("p2_heavy_punch", [KEY_KP_2])
	
	_register_key_action("p2_kick_low", [KEY_KP_0])
	_register_key_action("p2_kick_high", [KEY_KP_3])
	
	_register_key_action("p2_block", [KEY_KP_PERIOD, KEY_KP_ADD])
	_register_key_action("p2_special1", [KEY_KP_7])
	_register_key_action("p2_special2", [KEY_KP_8])
	_register_key_action("p2_special3", [KEY_KP_9])
	_register_key_action("p2_super", [KEY_KP_ENTER])

func _register_key_action(action_name: String, key_codes: Array):
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	for code in key_codes:
		var ev = InputEventKey.new()
		ev.physical_keycode = code
		InputMap.action_add_event(action_name, ev)

func _register_joy_action(action_name: String, button_index: JoyButton):
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	var ev = InputEventJoypadButton.new()
	ev.button_index = button_index
	InputMap.action_add_event(action_name, ev)

