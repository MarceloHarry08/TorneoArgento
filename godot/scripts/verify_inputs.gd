extends SceneTree

# Script de prueba y verificación automatizada del esquema de controles oficial
func _init():
	print("==================================================================")
	print("  🇦🇷 TORNEO ARGENTO 16-BIT - VERIFICACIÓN DE CONTROLES OFICIALES")
	print("==================================================================")
	
	var expected_keys = {
		"move_left": KEY_LEFT,
		"move_right": KEY_RIGHT,
		"jump": KEY_UP,
		"crouch": KEY_DOWN,
		"punch_high": KEY_INSERT,
		"punch_low": KEY_HOME,
		"kick_high": KEY_DELETE,
		"kick_low": KEY_END,
		"block": KEY_PAGEUP,
		"run": KEY_PAGEDOWN
	}
	
	var all_ok = true
	for act in expected_keys.keys():
		if not InputMap.has_action(act):
			printerr("❌ FALTA ACCIÓN: ", act)
			all_ok = false
			continue
			
		var events = InputMap.action_get_events(act)
		var key_found = false
		for ev in events:
			if ev is InputEventKey:
				var target_k = expected_keys[act]
				if ev.physical_keycode == target_k or ev.keycode == target_k:
					key_found = true
					print("  ✅ [%s] -> %s (Código: %d)" % [act, OS.get_keycode_string(target_k), target_k])
		if not key_found:
			printerr("❌ TECLA INCORRECTA PARA: ", act)
			all_ok = false

	# Verificar purga de acciones obsoletas
	var obsolete_test = ["p1_left", "p1_punch_low", "light_punch", "heavy_kick", "special1"]
	var obsolete_clean = true
	for old in obsolete_test:
		if InputMap.has_action(old):
			printerr("❌ ACCIÓN OBSOLETA DETECTADA EN INPUTMAP: ", old)
			obsolete_clean = false
			all_ok = false

	if obsolete_clean:
		print("  ✅ Acciones obsoletas purgadas correctamente.")

	print("==================================================================")
	if all_ok:
		print("  🎉 ¡TODOS LOS CONTROLES ESTÁN CONFIGURADOS A LA PERFECCIÓN!")
	else:
		print("  ⚠️ SE DETECTARON ERRORES EN LA CONFIGURACIÓN.")
	print("==================================================================")
	quit(0 if all_ok else 1)
