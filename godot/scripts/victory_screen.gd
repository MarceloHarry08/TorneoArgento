extends Control

# TORNEO ARGENTO 16-BIT - VICTORY / RESULTS CONTROLLER

@onready var winner_texture: TextureRect = $WinnerTexture
@onready var winner_name_label: Label = $WinnerNameLabel
@onready var winner_quote_label: Label = $WinnerQuoteLabel
@onready var fatality_badge: Panel = $FatalityBadge
@onready var fatality_name_label: Label = $FatalityBadge/FatalityNameLabel
@onready var tower_status_label: Label = $TowerStatusLabel
@onready var continue_tower_btn: Button = $Buttons/ContinueTowerBtn
@onready var restart_match_btn: Button = $Buttons/RestartBtn
@onready var menu_btn: Button = $Buttons/MenuBtn

func _ready():
	var winner_data = GameData.get_character(GameData.last_winner)
	SoundEngine.play_bgm("fanky")
	
	winner_name_label.text = "¡VICTORIA PARA %s!" % winner_data.name
	winner_quote_label.text = '"%s"' % winner_data.quote
	
	# Load winner victory pose
	var tex_path = "res://assets/sprites/%s_spritesheet.png" % winner_data.id
	if ResourceLoader.exists(tex_path):
		var sheet = load(tex_path)
		var atlas = AtlasTexture.new()
		atlas.atlas = sheet
		atlas.region = GameData.STANDARD_FRAMES.victory[0]
		winner_texture.texture = atlas
		
	# Fatality badge
	if GameData.last_was_fatality:
		fatality_badge.visible = true
		fatality_name_label.text = "FATALITY: %s" % winner_data.moves.fatality.name
	else:
		fatality_badge.visible = false
		
	# Tower mode logic
	if GameData.game_mode == "arcade" and GameData.last_winner == GameData.selected_p1:
		continue_tower_btn.visible = true
		if GameData.tower_index >= GameData.tower_opponents.size() - 1:
			tower_status_label.text = "🏆 ¡HAS COMPLETADO EL TORNEO ARGENTO! ¡ERES EL CAMPEÓN NACIONAL! 🇦🇷"
			continue_tower_btn.text = "¡Ver Créditos y Celebrar!"
		else:
			var next_opp = GameData.get_character(GameData.tower_opponents[GameData.tower_index + 1])
			tower_status_label.text = "Siguiente combate en la Torre: %s" % next_opp.name
			continue_tower_btn.text = "Siguiente Rival en la Torre (Piso %d)" % (GameData.tower_index + 2)
	else:
		continue_tower_btn.visible = false
		tower_status_label.text = "Duelo Finalizado."

func _on_continue_tower_btn_pressed():
	SoundEngine.play_ui_select()
	if GameData.advance_tower():
		get_tree().change_scene_to_file("res://scenes/tower_screen.tscn")
	else:
		# Beat whole tower
		get_tree().change_scene_to_file("res://scenes/title_screen.tscn")

func _on_restart_btn_pressed():
	SoundEngine.play_ui_select()
	get_tree().change_scene_to_file("res://scenes/battle.tscn")

func _on_menu_btn_pressed():
	SoundEngine.play_ui_select()
	get_tree().change_scene_to_file("res://scenes/character_select.tscn")
