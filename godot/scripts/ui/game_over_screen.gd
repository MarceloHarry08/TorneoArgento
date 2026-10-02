extends Control

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - GAME OVER / CONTINUE SCREEN
# ==============================================================================

@onready var continue_label: Label = $Center/VBox/ContinueTitle
@onready var countdown_label: Label = $Center/VBox/CountdownNumber
@onready var btn_continue: Button = $Center/VBox/Buttons/BtnContinue
@onready var btn_give_up: Button = $Center/VBox/Buttons/BtnGiveUp
@onready var crt_overlay: ColorRect = $CRT_Overlay

var countdown_seconds: int = 9
var countdown_timer: Timer

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	if crt_overlay != null:
		crt_overlay.visible = false

	countdown_label.text = str(countdown_seconds)
	btn_continue.grab_focus()

	btn_continue.pressed.connect(_on_continue_pressed)
	btn_give_up.pressed.connect(_on_give_up_pressed)

	countdown_timer = Timer.new()
	countdown_timer.wait_time = 1.0
	countdown_timer.one_shot = false
	countdown_timer.autostart = true
	countdown_timer.timeout.connect(_on_timer_tick)
	add_child(countdown_timer)

	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ko()

func _on_timer_tick() -> void:
	countdown_seconds -= 1
	if countdown_seconds >= 0:
		countdown_label.text = str(countdown_seconds)
		_animate_number_pop()
		if has_node("/root/SoundEngine"):
			get_node("/root/SoundEngine").play_ui_beep()
	else:
		countdown_timer.stop()
		_on_give_up_pressed()

func _animate_number_pop() -> void:
	var t := create_tween()
	countdown_label.scale = Vector2(1.4, 1.4)
	t.tween_property(countdown_label, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _unhandled_input(event: InputEvent) -> void:
	# Contra-banda (\), Escape o Barra Espaciadora: Volver al menú principal
	if event.is_action_pressed("ui_cancel") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ESCAPE or event.keycode == KEY_BACKSLASH or event.unicode == 92 or event.keycode == KEY_SPACE)):
		_on_give_up_pressed()
		get_viewport().set_input_as_handled()
		return

	if event.is_action_pressed("ui_down") or (event is InputEventKey and event.pressed and event.keycode == KEY_DOWN):
		btn_give_up.grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_up") or (event is InputEventKey and event.pressed and event.keycode == KEY_UP):
		btn_continue.grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_accept") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_ENTER or event.keycode == KEY_KP_ENTER)):
		if btn_continue.has_focus():
			_on_continue_pressed()
		else:
			_on_give_up_pressed()
		get_viewport().set_input_as_handled()

func _on_continue_pressed() -> void:
	countdown_timer.stop()
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_ui_select()
	GameManager.goto_battle()

func _on_give_up_pressed() -> void:
	countdown_timer.stop()
	continue_label.text = "¡GAME OVER!"
	continue_label.add_theme_color_override("font_color", UIThemeManager.COLOR_ARCADE_RED)
	countdown_label.visible = false
	btn_continue.visible = false
	btn_give_up.visible = false
	
	if has_node("/root/SoundEngine"):
		get_node("/root/SoundEngine").play_gong()

	await get_tree().create_timer(1.8).timeout
	GameManager.goto_title()
