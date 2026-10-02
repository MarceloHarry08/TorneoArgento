extends SceneTree

func _init():
	var res = ResourceLoader.load("res://assets/video/intro.mp4")
	print("Loaded res: ", res)
	quit()
