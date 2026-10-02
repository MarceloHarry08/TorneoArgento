extends Control

# TORNEO ARGENTO 16-BIT - ARCADE TOWER LADDER CONTROLLER

@onready var tower_list_container: VBoxContainer = $CenterPanel/TowerScroll/TowerList
@onready var p1_portrait: TextureRect = $VS_Panel/P1_Portrait
@onready var p2_portrait: TextureRect = $VS_Panel/P2_Portrait
@onready var p1_label: Label = $VS_Panel/P1_Label
@onready var p2_label: Label = $VS_Panel/P2_Label
@onready var fight_button: Button = $FightButton

func _ready():
	SoundEngine.play_bgm("hadaelmago")
	_build_tower_ladder()
	_update_vs_display()

func _build_tower_ladder():
	for child in tower_list_container.get_children():
		child.queue_free()
		
	var opps = GameData.tower_opponents
	# Display top to bottom (Inmortal at top)
	for i in range(opps.size() - 1, -1, -1):
		var char_key = opps[i]
		var c = GameData.get_character(char_key)
		
		var panel = PanelContainer.new()
		panel.custom_minimum_size = Vector2(180, 28)
		
		var hbox = HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 8)
		
		var num_lbl = Label.new()
		num_lbl.text = " #%d" % (i + 1)
		num_lbl.add_theme_font_size_override("font_size", 11)
		
		var name_lbl = Label.new()
		name_lbl.text = c.name
		name_lbl.add_theme_font_size_override("font_size", 11)
		
		if i == opps.size() - 1:
			name_lbl.text = "👑 " + c.name + " (JEFA)"
			name_lbl.add_theme_color_override("font_color", Color("#ffd700"))
			
		hbox.add_child(num_lbl)
		hbox.add_child(name_lbl)
		panel.add_child(hbox)
		
		# Highlight current opponent
		if i == GameData.tower_index:
			name_lbl.add_theme_color_override("font_color", Color("#ff3366"))
			num_lbl.add_theme_color_override("font_color", Color("#ff3366"))
			panel.modulate = Color(1.3, 1.3, 1.3, 1.0)

		elif i < GameData.tower_index:
			# Defeated
			name_lbl.text += " (DERROTADO)"
			panel.modulate = Color(0.4, 0.4, 0.4, 0.8)
			
		tower_list_container.add_child(panel)

func _update_vs_display():
	var p1 = GameData.get_character(GameData.selected_p1)
	var p2 = GameData.get_character(GameData.selected_p2)
	
	p1_label.text = p1.name
	p2_label.text = p2.name
	
	var p1_tex_path = "res://assets/sprites/%s_spritesheet.png" % p1.id
	if ResourceLoader.exists(p1_tex_path):
		var sheet = load(p1_tex_path)
		var atlas = AtlasTexture.new()
		atlas.atlas = sheet
		atlas.region = GameData.STANDARD_FRAMES.portrait
		p1_portrait.texture = atlas
		
	var p2_tex_path = "res://assets/sprites/%s_spritesheet.png" % p2.id
	if ResourceLoader.exists(p2_tex_path):
		var sheet = load(p2_tex_path)
		var atlas = AtlasTexture.new()
		atlas.atlas = sheet
		atlas.region = GameData.STANDARD_FRAMES.portrait
		p2_portrait.texture = atlas

func _on_fight_button_pressed():
	SoundEngine.play_gong()
	get_tree().change_scene_to_file("res://scenes/battle.tscn")
