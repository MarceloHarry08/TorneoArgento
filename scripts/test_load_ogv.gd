extends SceneTree

func _init():
	var res = ResourceLoader.load("res://assets/video/intro.ogv")
	print("Loaded OGV resource: ", res)
	if res is VideoStreamTheora:
		print("VideoStreamTheora loaded successfully! File: ", res.file)
	quit()
