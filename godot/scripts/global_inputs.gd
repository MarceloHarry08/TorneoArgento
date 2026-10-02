extends Node

# ==============================================================================
# TORNEO ARGENTO 16-BIT - GLOBAL INPUT CONTROLLER (AUTOLOAD)
# Definición unificada, global y definitiva del esquema de controles arcade.
# ==============================================================================

# Esquema oficial obligatorio:
# 1. Movimiento (Flechas del teclado):
#    - move_left  -> Flecha Izquierda (KEY_LEFT)
#    - move_right -> Flecha Derecha (KEY_RIGHT)
#    - jump       -> Flecha Arriba (KEY_UP)
#    - crouch     -> Flecha Abajo (KEY_DOWN)
# 2. Bloque de Combate (6 botones arcade sobre las flechas):
#    - punch_high -> INS / INSERT (KEY_INSERT) -> Piña Alta
#    - punch_low  -> INICIO / HOME (KEY_HOME)   -> Piña Baja
#    - kick_high  -> SUPR / DELETE (KEY_DELETE) -> Patada Alta
#    - kick_low   -> FIN / END (KEY_END)       -> Patada Baja
#    - block      -> RE PÁG / PAGE UP (KEY_PAGEUP) -> Cubrirse / Guardia
#    - run        -> AV PÁG / PAGE DOWN (KEY_PAGEDOWN) -> Correr

const STANDARD_ACTIONS: Dictionary = {
	"move_left": KEY_LEFT,
	"move_right": KEY_RIGHT,
	"jump": KEY_UP,
	"crouch": KEY_DOWN,
	"move_down": KEY_DOWN,
	"punch_high": KEY_INSERT,
	"punch_low": KEY_HOME,
	"kick_high": KEY_DELETE,
	"kick_low": KEY_END,
	"block": KEY_PAGEUP,
	"run": KEY_PAGEDOWN
}

# Acciones obsoletas a eliminar para evitar conflictos
const OBSOLETE_ACTIONS: Array[String] = [
	"p1_left", "p1_right", "p1_up", "p1_down",
	"p1_punch_low", "p1_punch_high", "p1_kick_low", "p1_kick_high",
	"p1_block", "p1_special1", "p1_special2", "p1_special3", "p1_super",
	"p1_light_punch", "p1_heavy_punch", "p1_light_kick", "p1_heavy_kick",
	"light_punch", "mid_punch", "heavy_punch",
	"light_kick", "mid_kick", "heavy_kick",
	"special1", "special2", "special3", "super"
]

func _enter_tree():
	setup_input_map()

func setup_input_map():
	# 1. Eliminar cualquier acción previa obsoleta
	for old_act in OBSOLETE_ACTIONS:
		if InputMap.has_action(old_act):
			InputMap.erase_action(old_act)

	# 2. Configurar exactamente las 10 acciones estándar obligatorias
	for action_name in STANDARD_ACTIONS.keys():
		var keycode: Key = STANDARD_ACTIONS[action_name]
		
		# Si ya existe, la recreamos para garantizar que solo tenga esta tecla física asignada
		if InputMap.has_action(action_name):
			InputMap.erase_action(action_name)
			
		InputMap.add_action(action_name, 0.5)
		
		var ev := InputEventKey.new()
		ev.physical_keycode = keycode
		ev.keycode = keycode
		InputMap.action_add_event(action_name, ev)

	# 3. Preservar acción esencial de pausa del sistema (Escape)
	if not InputMap.has_action("pause"):
		InputMap.add_action("pause", 0.5)
		var ev_esc := InputEventKey.new()
		ev_esc.physical_keycode = KEY_ESCAPE
		ev_esc.keycode = KEY_ESCAPE
		InputMap.action_add_event("pause", ev_esc)

	print("[GlobalInputs] InputMap unificado exitosamente con el esquema estándar de 6 botones arcade.")

# Métodos de utilidad y consulta
func get_key_name(action_name: String) -> String:
	match action_name:
		"move_left": return "Flecha Izquierda"
		"move_right": return "Flecha Derecha"
		"jump": return "Flecha Arriba"
		"crouch": return "Flecha Abajo"
		"punch_high": return "INS / INSERT"
		"punch_low": return "INICIO / HOME"
		"kick_high": return "SUPR / DELETE"
		"kick_low": return "FIN / END"
		"block": return "RE PÁG / PAGE UP"
		"run": return "AV PÁG / PAGE DOWN"
		_: return ""
