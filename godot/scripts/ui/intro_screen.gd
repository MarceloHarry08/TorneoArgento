extends Control

# ==============================================================================
# TORNEO ARGENTO 16-BIT - INTRO CINEMATIC SCREEN
# ==============================================================================

@onready var video_player: VideoStreamPlayer = $VideoPlayer
@onready var skip_label: Label = $SkipContainer/SkipLabel
@onready var fade_overlay: ColorRect = $FadeOverlay

var is_transitioning: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Stop any background music before playing intro video
	if has_node("/root/SoundEngine"):
		var se = get_node("/root/SoundEngine")
		se.stop_bgm()
		
	# Connect video finished signal
	video_player.finished.connect(_on_video_finished)
	
	# Fade in from black
	fade_overlay.color = Color(0, 0, 0, 1.0)
	fade_overlay.visible = true
	var t_fade := create_tween()
	t_fade.tween_property(fade_overlay, "color:a", 0.0, 0.45)
	
	# Gentle pulse for skip prompt
	var t_skip := create_tween().set_loops()
	t_skip.tween_property(skip_label, "modulate:a", 0.25, 0.8).set_trans(Tween.TRANS_SINE)
	t_skip.tween_property(skip_label, "modulate:a", 0.85, 0.8).set_trans(Tween.TRANS_SINE)
	
	# Start video playback
	video_player.play()

func _unhandled_input(event: InputEvent) -> void:
	if is_transitioning:
		return
		
	if event is InputEventKey and event.pressed and not event.echo:
		var k: int = event.keycode
		if k in [KEY_SPACE, KEY_ENTER, KEY_KP_ENTER, KEY_ESCAPE, KEY_BACKSLASH]:
			_skip_to_title()
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed:
		_skip_to_title()
		get_viewport().set_input_as_handled()

func _on_video_finished() -> void:
	_skip_to_title()

func _skip_to_title() -> void:
	if is_transitioning:
		return
	is_transitioning = true
	
	# Smooth fade out to black and transition to title menu
	var t := create_tween()
	t.tween_property(fade_overlay, "color:a", 1.0, 0.35)
	t.tween_callback(func():
		if video_player.is_playing():
			video_player.stop()
		get_tree().change_scene_to_file("res://scenes/ui/title_menu.tscn")
	)
