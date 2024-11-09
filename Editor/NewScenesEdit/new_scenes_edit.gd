extends Control

@export var cool: Dictionary

var text_and_condition_container: PackedScene = load("res://NewScenesEdit/text_and_condition_container.tscn")


func _on_add_text_pressed():
	var load = text_and_condition_container.instantiate()
	%ConditionalPanelContainer.add_child(load)
