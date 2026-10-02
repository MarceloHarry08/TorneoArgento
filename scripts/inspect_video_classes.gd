extends SceneTree

func _init():
	print("Video classes:")
	for c in ClassDB.get_class_list():
		if "Video" in c or "Stream" in c:
			print("  ", c)
	quit()
