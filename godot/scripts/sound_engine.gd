extends Node

# TORNEO ARGENTO 16-BIT - CHIPTUNE SOUND SYNTHESIZER & MUSIC ENGINE

var sfx_players: Array[AudioStreamPlayer] = []
var current_sfx_idx: int = 0
var bgm_player: AudioStreamPlayer
var bgm_enabled: bool = false
var sfx_enabled: bool = true

var sfx_cache: Dictionary = {}
var bgm_cache: Dictionary = {}
var announcer_cache: Dictionary = {}

const SAMPLE_RATE = 22050

func _ready():
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Pool of 8 SFX audio players for multi-channel arcade sounds
	for i in range(8):
		var p = AudioStreamPlayer.new()
		p.bus = "Master"
		add_child(p)
		sfx_players.append(p)
		
	bgm_player = AudioStreamPlayer.new()
	bgm_player.bus = "Master"
	add_child(bgm_player)
	
	_prebake_sfx()
	_load_announcer_voices()

func _prebake_sfx():
	sfx_cache["light_hit"] = _generate_tone_wave(280.0, 0.08, "square", 0.7, 0.4, true)
	sfx_cache["heavy_hit"] = _generate_tone_wave(140.0, 0.16, "triangle", 0.9, 0.1, true)
	sfx_cache["block"] = _generate_tone_wave(180.0, 0.09, "noise", 0.6, 0.2)
	sfx_cache["jump"] = _generate_sweep_wave(180.0, 480.0, 0.14, "square")
	sfx_cache["special"] = _generate_arpeggio_wave([330.0, 440.0, 550.0, 660.0], 0.05, "sawtooth")
	sfx_cache["super"] = _generate_sweep_wave(150.0, 880.0, 0.35, "sawtooth")
	sfx_cache["freeze"] = _generate_tone_wave(880.0, 0.22, "sine", 0.7, 0.05)
	sfx_cache["laser"] = _generate_sweep_wave(900.0, 200.0, 0.18, "sawtooth")
	sfx_cache["explosion"] = _generate_tone_wave(70.0, 0.4, "noise", 0.95, 0.01)
	sfx_cache["ui_beep"] = _generate_tone_wave(660.0, 0.06, "sine", 0.5, 0.1)
	sfx_cache["ui_select"] = _generate_tone_wave(880.0, 0.12, "square", 0.6, 0.1)
	sfx_cache["round_gong"] = _generate_tone_wave(110.0, 0.6, "sawtooth", 0.8, 0.02)
	sfx_cache["fatality"] = _generate_sweep_wave(400.0, 60.0, 0.8, "sawtooth")
	sfx_cache["round_start"] = _generate_arpeggio_wave([220.0, 330.0, 440.0, 554.0], 0.08, "square")
	sfx_cache["fight"] = _generate_sweep_wave(620.0, 160.0, 0.32, "sawtooth")
	sfx_cache["ko"] = _generate_sweep_wave(240.0, 40.0, 0.65, "triangle")
	sfx_cache["liquidalo"] = _generate_arpeggio_wave([370.0, 311.0, 261.0, 174.0], 0.18, "triangle")
	sfx_cache["critical_hit"] = _generate_tone_wave(520.0, 0.18, "square", 0.95, 0.15, true)
	sfx_cache["combo"] = _generate_arpeggio_wave([440.0, 554.0, 659.0], 0.05, "sine")
	sfx_cache["kick_whoosh"] = _generate_sweep_wave(350.0, 110.0, 0.12, "noise")

func play_sfx(sfx_name: String):
	if not sfx_enabled:
		return
	if not sfx_cache.has(sfx_name):
		return
		
	var player = sfx_players[current_sfx_idx]
	current_sfx_idx = (current_sfx_idx + 1) % sfx_players.size()
	player.stream = sfx_cache[sfx_name]
	player.volume_db = -2.0
	player.play()

func play_light_hit(): play_sfx("light_hit")
func play_heavy_hit(): play_sfx("heavy_hit")
func play_block(): play_sfx("block")
func play_jump(): play_sfx("jump")
func play_special(): play_sfx("special")
func play_super(): play_sfx("super")
func play_freeze(): play_sfx("freeze")
func play_laser(): play_sfx("laser")
func play_explosion(): play_sfx("explosion")
func play_ui_beep(): play_sfx("ui_beep")
func play_ui_select(): play_sfx("ui_select")
func play_gong(): play_sfx("round_gong")
func play_fatality(): play_sfx("fatality")
func play_round_start(): play_sfx("round_start")
func play_fight(): play_sfx("fight")
func play_ko(): play_sfx("ko")
func play_liquidalo(): play_sfx("liquidalo")
func play_critical_hit(): play_sfx("critical_hit")
func play_combo(): play_sfx("combo")
func play_kick_whoosh(): play_sfx("kick_whoosh")

# --- ANNOUNCER VOICE METHODS ---
func _load_announcer_voices() -> void:
	var keys = [
		"round_1", "round_2", "round_final", "fight", "ko",
		"win_leon", "win_latina", "win_ojosazules", "win_pepeargento",
		"win_eleternauta", "win_elcomandante", "win_elmesias", "win_hugo",
		"win_pergolas", "win_sangrejaponesa", "win_badbitch", "win_inmortal"
	]
	for k in keys:
		var p = "res://assets/audio/announcer/%s.wav" % k
		if ResourceLoader.exists(p):
			announcer_cache[k] = load(p)

func play_announcer(key: String):
	if not sfx_enabled:
		return
	if announcer_cache.has(key):
		var player = sfx_players[current_sfx_idx]
		current_sfx_idx = (current_sfx_idx + 1) % sfx_players.size()
		player.stream = announcer_cache[key]
		player.volume_db = 2.0
		player.play()
	else:
		var text_to_say = key.replace("win_", "").replace("_", " ").to_upper()
		if key.begins_with("win_"):
			text_to_say = text_to_say + " WINS"
		_speak_tts(text_to_say)

func announce_round(round_num: int, is_final: bool = false):
	if is_final:
		play_announcer("round_final")
	elif round_num == 1:
		play_announcer("round_1")
	elif round_num == 2:
		play_announcer("round_2")
	else:
		play_announcer("round_final")

func announce_winner(char_key: String):
	var key = "win_" + char_key.to_lower().replace(" ", "").replace("_", "")
	play_announcer(key)

func _speak_tts(text_to_say: String) -> void:
	if not sfx_enabled:
		return
	if DisplayServer.tts_is_speaking():
		DisplayServer.tts_stop()
	var voices = DisplayServer.tts_get_voices()
	var voice_id = voices[0]["id"] if voices.size() > 0 else ""
	DisplayServer.tts_speak(text_to_say, voice_id, 100, 0.85, 1.0)

# Generate 8-bit uncompressed PCM AudioStreamWAV in memory
func _generate_tone_wave(base_freq: float, duration: float, wave_type: String, peak_amp: float = 0.8, decay_pow: float = 0.2, mix_noise: bool = false) -> AudioStreamWAV:
	var num_samples = int(duration * SAMPLE_RATE)
	var bytes = PackedByteArray()
	bytes.resize(num_samples)
	
	var phase: float = 0.0
	var phase_inc = (base_freq * TAU) / float(SAMPLE_RATE)
	
	for i in range(num_samples):
		var t = float(i) / float(num_samples)
		var env = pow(1.0 - t, decay_pow * 4.0) * peak_amp
		var sample_val: float = 0.0
		
		if wave_type == "sine":
			sample_val = sin(phase)
		elif wave_type == "square":
			sample_val = 1.0 if sin(phase) >= 0.0 else -1.0
		elif wave_type == "sawtooth":
			sample_val = fmod(phase / PI, 2.0) - 1.0
		elif wave_type == "triangle":
			sample_val = 2.0 * abs(fmod(phase / PI, 2.0) - 1.0) - 1.0
		elif wave_type == "noise":
			sample_val = randf_range(-1.0, 1.0)
			
		if mix_noise:
			sample_val = sample_val * 0.7 + randf_range(-0.3, 0.3)
			
		phase += phase_inc
		var byte_val = clampi(int((sample_val * env * 0.5 + 0.5) * 255.0), 0, 255)
		bytes[i] = byte_val
		
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = SAMPLE_RATE
	wav.stereo = false
	wav.data = bytes
	return wav

func _generate_sweep_wave(start_freq: float, end_freq: float, duration: float, wave_type: String) -> AudioStreamWAV:
	var num_samples = int(duration * SAMPLE_RATE)
	var bytes = PackedByteArray()
	bytes.resize(num_samples)
	
	var phase: float = 0.0
	for i in range(num_samples):
		var t = float(i) / float(num_samples)
		var current_freq = lerp(start_freq, end_freq, t)
		var phase_inc = (current_freq * TAU) / float(SAMPLE_RATE)
		phase += phase_inc
		
		var env = (1.0 - t) * 0.8
		var sample_val: float = 0.0
		if wave_type == "square":
			sample_val = 1.0 if sin(phase) >= 0.0 else -1.0
		elif wave_type == "sawtooth":
			sample_val = fmod(phase / PI, 2.0) - 1.0
		else:
			sample_val = sin(phase)
			
		var byte_val = clampi(int((sample_val * env * 0.5 + 0.5) * 255.0), 0, 255)
		bytes[i] = byte_val
		
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = SAMPLE_RATE
	wav.stereo = false
	wav.data = bytes
	return wav

func _generate_arpeggio_wave(notes: Array, note_duration: float, wave_type: String) -> AudioStreamWAV:
	var total_duration = note_duration * notes.size()
	var num_samples = int(total_duration * SAMPLE_RATE)
	var bytes = PackedByteArray()
	bytes.resize(num_samples)
	
	var samples_per_note = int(note_duration * SAMPLE_RATE)
	var phase: float = 0.0
	
	for i in range(num_samples):
		var note_idx = clampi(int(float(i) / float(samples_per_note)), 0, notes.size() - 1)
		var freq: float = notes[note_idx]
		var phase_inc = (freq * TAU) / float(SAMPLE_RATE)
		phase += phase_inc
		
		var local_t = float(i % samples_per_note) / float(samples_per_note)
		var env = (1.0 - local_t * 0.5) * 0.75
		var sample_val: float = 0.0
		if wave_type == "sine":
			sample_val = sin(phase)
		elif wave_type == "sawtooth":
			sample_val = fmod(phase / PI, 2.0) - 1.0
		elif wave_type == "triangle":
			sample_val = 2.0 * abs(fmod(phase / PI, 2.0) - 1.0) - 1.0
		elif wave_type == "noise":
			sample_val = randf_range(-1.0, 1.0)
		else: # "square"
			sample_val = 1.0 if sin(phase) >= 0.0 else -1.0
		
		var byte_val = clampi(int((sample_val * env * 0.5 + 0.5) * 255.0), 0, 255)
		bytes[i] = byte_val
		
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = SAMPLE_RATE
	wav.stereo = false
	wav.data = bytes
	return wav

# --- BGM CHIPTUNE SYNTHESIZER ---
func play_bgm(song_name: String):
	if not bgm_enabled:
		return
	if not bgm_cache.has(song_name):
		bgm_cache[song_name] = _render_chiptune_track(song_name)
		
	bgm_player.stream = bgm_cache[song_name]
	bgm_player.volume_db = -6.0
	bgm_player.play()

func start_bgm(song_name: String):
	play_bgm(song_name)

func stop_bgm():
	bgm_player.stop()

# Argentine Rock Classics encoded as chiptune patterns
func _render_chiptune_track(song_name: String) -> AudioStreamWAV:
	var notes = []
	var bpm: float = 140.0
	
	# Frequency mapping (only active notes)
	var D3 = 146.83; var E3 = 164.81; var F3 = 174.61; var Fs3 = 185.00; var G3 = 196.00; var A3 = 220.00; var B3 = 246.94
	var C4 = 261.63; var D4 = 293.66; var E4 = 329.63; var Fs4 = 369.99; var G4 = 392.00; var A4 = 440.00; var B4 = 493.88
	var C5 = 523.25; var D5 = 587.33; var E5 = 659.25; var R = 0.0


	
	if song_name == "hadaelmago":
		# Rata Blanca - La Leyenda del Hada y el Mago
		bpm = 168.0
		notes = [
			E4, G4, B4, E5, B4, G4, E4, B3,
			D4, Fs4, A4, D5, A4, Fs4, D4, A3,
			C4, E4, G4, C5, G4, E4, C4, G3,
			B3, E4, Fs4, B4, A4, Fs4, E4, B3,
			E4, E4, G4, Fs4, E4, D4, E4, R,
			B4, A4, G4, Fs4, G4, E4, R, R
		]
	elif song_name == "demusicaligera":
		# Soda Stereo - De Música Ligera
		bpm = 132.0
		notes = [
			B3, B3, D4, D4, C4, C4, B3, Fs3,
			G3, G3, B3, B3, A3, A3, G3, D3,
			D4, D4, Fs4, Fs4, E4, E4, D4, A3,
			A3, A3, C4, C4, B3, B3, A3, Fs3,
			Fs4, Fs4, Fs4, G4, Fs4, E4, D4, E4,
			B3, D4, B3, R, B3, D4, B3, R
		]
	elif song_name == "homero":
		# Viejas Locas - Homero
		bpm = 126.0
		notes = [
			E3, B3, E4, G3, D4, G4, A3, E4,
			A4, Fs3, C4, Fs4, Fs3, G3, Fs3, E3,
			E4, E4, E4, D4, B3, A3, G3, E3,
			E3, G3, A3, G3, E3, R, E4, D4,
			B3, B3, A3, G3, E3, R, E3, R
		]
	elif song_name == "fanky":
		# Charly García - Fanky
		bpm = 120.0
		notes = [
			E3, G3, A3, B3, D4, B3, A3, G3,
			E3, E3, G3, A3, B3, A3, G3, E3,
			A3, C4, D4, E4, G4, E4, D4, C4,
			E3, G3, A3, B3, D4, B3, A3, G3
		]
	else:
		# Attack 77 - Hacelo por mí / generic rock
		bpm = 140.0
		notes = [
			A3, A3, C4, D4, E4, E4, D4, C4,
			G3, G3, B3, C4, D4, D4, C4, B3,
			F3, F3, A3, B3, C4, C4, B3, A3,
			E3, E3, G3, A3, B3, B3, A3, G3
		]
		
	var step_duration = (60.0 / bpm) * 0.5
	var total_duration = step_duration * notes.size()
	var num_samples = int(total_duration * SAMPLE_RATE)
	var samples_per_step = int(step_duration * SAMPLE_RATE)
	
	var bytes = PackedByteArray()
	bytes.resize(num_samples)
	var lead_phase: float = 0.0
	var bass_phase: float = 0.0
	
	for i in range(num_samples):
		var step_idx = clampi(int(float(i) / float(samples_per_step)), 0, notes.size() - 1)
		var lead_freq: float = notes[step_idx]
		var bass_freq: float = lead_freq * 0.5 if lead_freq > 0.0 else 0.0
		
		var local_t = float(i % samples_per_step) / float(samples_per_step)
		var lead_env = pow(1.0 - local_t, 0.4) * 0.4
		var bass_env = pow(1.0 - local_t, 0.8) * 0.35
		
		var lead_sample: float = 0.0
		if lead_freq > 0.0:
			lead_phase += (lead_freq * TAU) / float(SAMPLE_RATE)
			lead_sample = fmod(lead_phase / PI, 2.0) - 1.0 # Sawtooth lead
			
		var bass_sample: float = 0.0
		if bass_freq > 0.0:
			bass_phase += (bass_freq * TAU) / float(SAMPLE_RATE)
			bass_sample = 1.0 if sin(bass_phase) >= 0.0 else -1.0 # Square bass
			
		# Drum beat (Kick on beat 0 and 2, Snare on 1 and 3)
		var drum_sample: float = 0.0
		var beat = step_idx % 4
		if beat == 0:
			# Kick drum
			drum_sample = sin(float(i % samples_per_step) * 0.04) * (1.0 - local_t) * 0.3
		elif beat == 2:
			# Snare noise
			drum_sample = randf_range(-1.0, 1.0) * pow(1.0 - local_t, 3.0) * 0.25
			
		var mixed = lead_sample * lead_env + bass_sample * bass_env + drum_sample
		var byte_val = clampi(int((mixed * 0.45 + 0.5) * 255.0), 0, 255)
		bytes[i] = byte_val
		
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = SAMPLE_RATE
	wav.stereo = false
	wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
	wav.loop_begin = 0
	wav.loop_end = num_samples
	wav.data = bytes
	return wav
