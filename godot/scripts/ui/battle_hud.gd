extends CanvasLayer

const UIThemeManager = preload("res://scripts/ui/ui_theme_manager.gd")

# ==============================================================================
# TORNEO ARGENTO 16-BIT - IN-GAME BATTLE HUD CONTROLLER
# ==============================================================================

# P1 Top Status
@onready var p1_portrait: TextureRect = $HUD/TopBar/P1Status/PortraitBox/Portrait
@onready var p1_name_label: Label = $HUD/TopBar/P1Status/InfoBox/NameRow/NameLabel
@onready var p1_rounds_box: HBoxContainer = $HUD/TopBar/P1Status/InfoBox/NameRow/RoundsBox
@onready var p1_hp_bar: ProgressBar = $HUD/TopBar/P1Status/InfoBox/HealthFrame/HPBar
@onready var p1_chip_bar: ProgressBar = $HUD/TopBar/P1Status/InfoBox/HealthFrame/ChipBar
@onready var p1_meter_bar: ProgressBar = $HUD/TopBar/P1Status/InfoBox/MeterFrame/MeterBar
@onready var p1_meter_label: Label = $HUD/TopBar/P1Status/InfoBox/MeterFrame/MeterLabel

# Central Timer & Round Info
@onready var timer_box: PanelContainer = $HUD/TopBar/TimerBox
@onready var timer_label: Label = $HUD/TopBar/TimerBox/VBox/TimerLabel
@onready var round_indicator_label: Label = $HUD/TopBar/TimerBox/VBox/RoundLabel

# P2 Top Status
@onready var p2_portrait: TextureRect = $HUD/TopBar/P2Status/PortraitBox/Portrait
@onready var p2_name_label: Label = $HUD/TopBar/P2Status/InfoBox/NameRow/NameLabel
@onready var p2_rounds_box: HBoxContainer = $HUD/TopBar/P2Status/InfoBox/NameRow/RoundsBox
@onready var p2_hp_bar: ProgressBar = $HUD/TopBar/P2Status/InfoBox/HealthFrame/HPBar
@onready var p2_chip_bar: ProgressBar = $HUD/TopBar/P2Status/InfoBox/HealthFrame/ChipBar
@onready var p2_meter_bar: ProgressBar = $HUD/TopBar/P2Status/InfoBox/MeterFrame/MeterBar
@onready var p2_meter_label: Label = $HUD/TopBar/P2Status/InfoBox/MeterFrame/MeterLabel

# Combo Counters
@onready var p1_combo_banner: Label = $HUD/Combos/P1ComboLabel
@onready var p2_combo_banner: Label = $HUD/Combos/P2ComboLabel

# Announcer Overlay Banner
@onready var announcer_banner: Control = $HUD/AnnouncerBanner
@onready var announcer_title: Label = $HUD/AnnouncerBanner/VBox/AnnouncerTitle
@onready var announcer_sub: Label = $HUD/AnnouncerBanner/VBox/AnnouncerSub

# Fatality Prompt Overlay
@onready var fatality_prompt: Panel = $HUD/FatalityPrompt
@onready var fatality_cmd_label: Label = $HUD/FatalityPrompt/VBox/CommandLabel
@onready var fatality_timer_label: Label = $HUD/FatalityPrompt/VBox/TimerLabel

# Preloaded Textures
const TEX_SUN_ROUND := preload("res://assets/ui/icons/round_sun.png")
const TEX_EMPTY_ROUND := preload("res://assets/ui/icons/round_empty.png")

# State & Tweens
var p1_chip_tween: Tween
var p2_chip_tween: Tween
var p1_combo_tween: Tween
var p2_combo_tween: Tween
var announcer_tween: Tween
var timer_pulse_tween: Tween

var p1_meter_glow_tween: Tween
var p2_meter_glow_tween: Tween

func _ready() -> void:
	layer = 15
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	announcer_banner.visible = false
	fatality_prompt.visible = false
	p1_combo_banner.visible = false
	p2_combo_banner.visible = false

func setup_match(p1_id: String, p2_id: String, p1_name: String, p2_name: String, round_num: int = 1) -> void:
	p1_name_label.text = p1_name
	p2_name_label.text = p2_name

	# Load portraits
	var p1_path := "res://assets/ui/portraits/%s.png" % p1_id
	if ResourceLoader.exists(p1_path):
		p1_portrait.texture = load(p1_path)

	var p2_path := "res://assets/ui/portraits/%s.png" % p2_id
	if ResourceLoader.exists(p2_path):
		p2_portrait.texture = load(p2_path)

	# Reset bars
	p1_hp_bar.value = 100.0
	p1_chip_bar.value = 100.0
	p2_hp_bar.value = 100.0
	p2_chip_bar.value = 100.0

	p1_meter_bar.value = 0.0
	p2_meter_bar.value = 0.0

	update_rounds(0, 0)
	update_timer(99)
	set_round_number(round_num)

func set_round_number(round_num: int) -> void:
	round_indicator_label.text = "RONDA %d" % round_num

func update_p1_health(current_hp: float, max_hp: float) -> void:
	var pct: float = (current_hp / maxf(1.0, max_hp)) * 100.0
	p1_hp_bar.value = pct

	if p1_chip_tween != null and p1_chip_tween.is_valid():
		p1_chip_tween.kill()
	p1_chip_tween = create_tween()
	# Chip bar smoothly catches up with a 0.35s delay
	p1_chip_tween.tween_interval(0.35)
	p1_chip_tween.tween_property(p1_chip_bar, "value", pct, 0.45).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

func update_p2_health(current_hp: float, max_hp: float) -> void:
	var pct: float = (current_hp / maxf(1.0, max_hp)) * 100.0
	p2_hp_bar.value = pct

	if p2_chip_tween != null and p2_chip_tween.is_valid():
		p2_chip_tween.kill()
	p2_chip_tween = create_tween()
	p2_chip_tween.tween_interval(0.35)
	p2_chip_tween.tween_property(p2_chip_bar, "value", pct, 0.45).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

func update_p1_meter(current_meter: float, max_meter: float) -> void:
	var pct: float = (current_meter / maxf(1.0, max_meter)) * 100.0
	p1_meter_bar.value = pct

	if pct >= 100.0:
		if p1_meter_glow_tween == null or not p1_meter_glow_tween.is_valid():
			p1_meter_glow_tween = create_tween().set_loops()
			p1_meter_glow_tween.tween_property(p1_meter_bar, "modulate", Color(1.5, 0.2, 1.5, 1.0), 0.3)
			p1_meter_glow_tween.tween_property(p1_meter_bar, "modulate", Color(1.0, 1.0, 1.0, 1.0), 0.3)
	else:
		if p1_meter_glow_tween != null and p1_meter_glow_tween.is_valid():
			p1_meter_glow_tween.kill()
		p1_meter_bar.modulate = Color(1.0, 1.0, 1.0, 1.0)

func update_p2_meter(current_meter: float, max_meter: float) -> void:
	var pct: float = (current_meter / maxf(1.0, max_meter)) * 100.0
	p2_meter_bar.value = pct

	if pct >= 100.0:
		if p2_meter_glow_tween == null or not p2_meter_glow_tween.is_valid():
			p2_meter_glow_tween = create_tween().set_loops()
			p2_meter_glow_tween.tween_property(p2_meter_bar, "modulate", Color(1.5, 0.2, 1.5, 1.0), 0.3)
			p2_meter_glow_tween.tween_property(p2_meter_bar, "modulate", Color(1.0, 1.0, 1.0, 1.0), 0.3)
	else:
		if p2_meter_glow_tween != null and p2_meter_glow_tween.is_valid():
			p2_meter_glow_tween.kill()
		p2_meter_bar.modulate = Color(1.0, 1.0, 1.0, 1.0)

func update_timer(seconds: int) -> void:
	timer_label.text = "%02d" % max(0, seconds)
	if seconds <= 10 and seconds > 0:
		timer_label.add_theme_color_override("font_color", UIThemeManager.COLOR_ARCADE_RED)
		if timer_pulse_tween == null or not timer_pulse_tween.is_valid():
			timer_pulse_tween = create_tween().set_loops()
			timer_pulse_tween.tween_property(timer_box, "scale", Vector2(1.15, 1.15), 0.25).set_trans(Tween.TRANS_QUAD)
			timer_pulse_tween.tween_property(timer_box, "scale", Vector2(1.0, 1.0), 0.25).set_trans(Tween.TRANS_QUAD)
	else:
		timer_label.add_theme_color_override("font_color", Color("#ffffff"))
		if timer_pulse_tween != null and timer_pulse_tween.is_valid():
			timer_pulse_tween.kill()
		timer_box.scale = Vector2.ONE

func update_rounds(p1_wins: int, p2_wins: int) -> void:
	# Clear boxes
	for c in p1_rounds_box.get_children():
		c.queue_free()
	for c in p2_rounds_box.get_children():
		c.queue_free()

	for i in range(2):
		var icon1 := TextureRect.new()
		icon1.custom_minimum_size = Vector2(12, 12)
		icon1.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon1.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon1.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		icon1.texture = TEX_SUN_ROUND if i < p1_wins else TEX_EMPTY_ROUND
		p1_rounds_box.add_child(icon1)

		var icon2 := TextureRect.new()
		icon2.custom_minimum_size = Vector2(12, 12)
		icon2.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon2.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon2.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		icon2.texture = TEX_SUN_ROUND if i < p2_wins else TEX_EMPTY_ROUND
		p2_rounds_box.add_child(icon2)

func show_combo(player: int, hits: int) -> void:
	var label := p1_combo_banner if player == 1 else p2_combo_banner
	label.text = "¡%d HITS! COMBO" % hits
	label.visible = true

	var t := create_tween()
	label.scale = Vector2(1.7, 1.7)
	label.modulate.a = 1.0
	t.tween_property(label, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.tween_interval(0.8)
	t.tween_property(label, "modulate:a", 0.0, 0.35)
	t.tween_callback(func(): label.visible = false)

func show_announcer(title: String, subtext: String = "", duration: float = 1.8) -> void:
	announcer_title.text = title
	announcer_sub.text = subtext
	announcer_banner.visible = true
	announcer_banner.scale = Vector2(0.2, 0.2)
	announcer_banner.modulate.a = 0.0

	if announcer_tween != null and announcer_tween.is_valid():
		announcer_tween.kill()

	announcer_tween = create_tween()
	# Zoom and bounce in
	announcer_tween.tween_property(announcer_banner, "scale", Vector2(1.0, 1.0), 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	announcer_tween.parallel().tween_property(announcer_banner, "modulate:a", 1.0, 0.2)
	announcer_tween.tween_interval(duration)
	announcer_tween.tween_property(announcer_banner, "scale", Vector2(1.3, 1.3), 0.25).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	announcer_tween.parallel().tween_property(announcer_banner, "modulate:a", 0.0, 0.25)
	announcer_tween.tween_callback(func(): announcer_banner.visible = false)

func show_fatality_prompt(command_text: String) -> void:
	fatality_cmd_label.text = command_text
	fatality_timer_label.text = "TIEMPO: 5s"
	fatality_prompt.visible = true

func update_fatality_countdown(seconds: int) -> void:
	fatality_timer_label.text = "TIEMPO: %ds" % max(0, seconds)

func hide_fatality_prompt() -> void:
	fatality_prompt.visible = false
