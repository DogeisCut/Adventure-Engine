extends VBoxContainer

var condition_container: PackedScene = load("res://NewScenesEdit/condition_container.tscn")

func _on_add_condition_pressed():
	var load = condition_container.instantiate()
	%Conditions.add_child(load)
