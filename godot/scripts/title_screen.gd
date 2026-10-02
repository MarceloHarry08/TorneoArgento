extends Control

# TORNEO ARGENTO 16-BIT - TITLE MENU CONTROLLER

@onready var controls_modal: Panel = $ControlsModal
@onready var controls_text: Label = $ControlsModal/VBoxContainer/TextLabel

func _ready():
	controls_modal.visible = false
	SoundEngine.play_bgm("hadaelmago")
	_setup_controls_text()

func _setup_controls_text():
	var txt = "=== 🇦🇷 CONTROLES OFICIALES (ARCADE ESTÁNDAR) ===\n\n"
	txt += "🔴 MOVIMIENTO (FLECHAS DEL TECLADO):\n"
	txt += "• Flecha Izquierda (←): Moverse a la Izquierda\n"
	txt += "• Flecha Derecha (→): Moverse a la Derecha\n"
	txt += "• Flecha Arriba (↑): Saltar\n"
	txt += "• Flecha Abajo (↓): Agacharse\n\n"
	txt += "🔵 BLOQUE DE COMBATE (6 BOTONES ARCADE):\n"
	txt += "• PIÑA ALTA (Gancho): INS / INSERT\n"
	txt += "• PIÑA BAJA (Jab): INICIO / HOME\n"
	txt += "• PATADA ALTA (Fuerte): SUPR / DELETE\n"
	txt += "• PATADA BAJA (Barrida): FIN / END\n"
	txt += "• CUBRIRSE / GUARDIA: RE PÁG / PAGE UP (Reduce 80%% daño)\n"
	txt += "• CORRER: AV PÁG / PAGE DOWN (+ Dirección)\n"
	txt += "• PAUSA: Escape\n\n"
	txt += "⚡ COMBOS Y FATALITY:\n"
	txt += "• Ataques Agachados: Mantén ↓ y presiona cualquier piña o patada.\n"
	txt += "• ↓ + → + Piña: Poder Especial 1  |  ↓ + ← + Patada: Poder Especial 2\n"
	txt += "• ¡FATALITY! Cuando el rival caiga noqueado al final de la pelea,\n"
	txt += "  presiona cualquier botón de ataque para liquidarlo."
	controls_text.text = txt

func _on_arcade_button_pressed():
	SoundEngine.play_ui_select()
	GameData.game_mode = "arcade"
	get_tree().change_scene_to_file("res://scenes/character_select.tscn")

func _on_versus_button_pressed():
	SoundEngine.play_ui_select()
	GameData.game_mode = "vs_cpu"
	get_tree().change_scene_to_file("res://scenes/character_select.tscn")

func _on_controls_button_pressed():
	SoundEngine.play_ui_beep()
	controls_modal.visible = true

func _on_close_controls_pressed():
	SoundEngine.play_ui_beep()
	controls_modal.visible = false

func _on_exit_button_pressed():
	SoundEngine.play_ui_select()
	get_tree().quit()
