# Setting up an Adventure
You can make a new adventure by following the file format (or using the editor when that's ready), and saving it to `Scenes`
Afterwards, run `node generatePackagedPlayer.js "Adventure Directory Name" "starting_scene"` which will generate an adventure HTML file in `PackagedPlayers` with the name of your adventure directory. You can run `node generatePackagedPlayer.js "Quadrolax World" "fields"` to package the example adventure.
# Adventure Engine Format
The Adventure Engine is an engine designed for creating immersive text based adventures, It uses a scene, inventory, and flags system to keep track of the player's state, items, and history. Scenes are stored as JSON files, with each file being named after its scene ID. Item scenes follow a similar scheme but go into a subdirectory named `items` and are named as so `item_name_scene_to_be_used_in`
## Main keys
- `scene`: Defines the internal name of the scene, used for scene transitions.
- `scene_text`: An array of the potential text the player sees when within the scene, each dictionary instance has a `conditions` field and a `output` field. `output` defines what text is shown assuming the condition is true. `scene_text` entries are concatenated with one another first to last assuming multiple conditions are true. More on conditions later. each `scene_text` entry can also optionally have a style, this however is currently unsupported.
- `events`: An array of various types of events to activate when first entering the scene, each event is a dictionary taking a `type` and `value` key, the types of events are as follows, keep in mind that scene events differ from choice events:
  - `music_change`: Plays any song by name within the engine, loops automatically.
  - `play_sound`: Plays any sound by name within the engine.
  - `give_item`: Adds an item to the player's inventory based on the name provided by the `value`. The name is quite literally the item name, in title case.
  - `take_item`: Similar to `give_item` but removes it from the inventory if it exists. Each instance of this event removes just one of the item.
  - `set_flag`: Adds a flag of any name to the session. Flags are usually snake case.
  - `unset_flag`: Removes a flag of any name to the session.
  - `disable_item_use`: Does not take a value, disables the ability to use items until the next scene transition. Typically used within item scene's events to prevent using multiple items at once.
- `choices`: The main meat and potatoes of a scene, these are the clickable choices a player is given when within a scene, all choices have a `conditions`, `text`, and `events` field. `conditions` are in exactly the same format as scene text conditions and they define when a choice shows up. `text` defines what the player sees for that choice. `events` are similar to scene events but have different types, all scene events are usable within choice events, but not the other way around. They are as follows:
  - `change_scene`: Changes the scene to the ID name provided by the `value`
  - `popup`: Currently unsupported, do not use.
  - `popup_transitional`: Currently unsupported, do not use.
  - `give_item`: Works exactly the same as the scene event version.
  - `set_flag`: Works exactly the same as the scene event version.
  - `take_item`: Works exactly the same as the scene event version.
  - `unset_flag`: Works exactly the same as the scene event version.
  - `close_popup`: Used by item scenes, more on that later.
  - `play_sound`: Works exactly the same as the scene event version.
  - `music_change`:  Works exactly the same as the scene event version.
By the way, the order you define events can effect how they work.
And that's all for a basic scene, however, there's still more to the adventure engine.
## Conditions
Each condition is a dictionary of 3 keys, `type`, `key`, and `value`. There are only two `type`s; `flag`, and `item`. A condition is really quite simple, the `key` value is the name of the flag or item you want to check, and the `value` is whether or not you want it to be true or not. `value` is a boolean.
It's important to note that conditions are processed before events are processed but after scene text is written. This means scene text will display based on your state before you entered the scene.
## Item scenes
Item scenes are a special type of scene, they define what an item does when it is used. Along with the `scene` id, item scenes have an additional `item` key at the top of their file. The `scene` field is repurposed, instead serving as a condition for the item scene, if the `scene` matches the scene the player is currently in when the item is used, that scene is displayed. An empty `scene` field defines the default behavior/scene for an item when it is used in an unrecognized scene. Item scenes also always contain one choice that has the `close_popup` event, as a way to exit and acknowledge the use of the item. Other than those differences, item scenes are completely identical to regular scenes. Using an item is basically like having a choice you can bring with you.
## Scene Parents
Unfinished
## Endings
Unfinished
## Sounds and Music
By adding music and sounds of the mp3/wav/ogg format to their respective folders, you can use them in the adventure by name minus the extension.
## Endings
Unfinished
## AdventureMeta.json
Unfinished
## And that's it!
More features may come to the Adventure Engine at a later date, but as for now this is all there is to it.
## Examples
A cabin scene, where the player has many choices, the main text updates to reflect the satus of the cherry pie on the windowsill, and the player has many places to go.
```json
{
    "scene": "cabin",
    "scene_text": [
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "has_pie",
                    "value": false
                },
                {
                    "type": "flag",
                    "key": "eaten_pie",
                    "value": false
                }
            ],
            "output": "A log cabin lies between the hills. It is brown in color but wrapped in blue tarps. A cherry pie is visible on the windowsill, it smells like heaven itself has blessed your nose."
        },
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "has_pie",
                    "value": true
                }
            ],
            "output": "A log cabin lies between the hills. It is brown in color but wrapped in blue tarps. Despite having taken the pie, the heavenly smell still blesses your nose. Guilt curses your stomach, however."
        },
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "eaten_pie",
                    "value": true
                }
            ],
            "output": "A log cabin lies between the hills. It is brown in color but wrapped in blue tarps. Not a single smell blesses your nose, but woo boy, does guilt really clench the depths of your stomach now."
        }
    ],
    "events": [
        {
            "type": "music_change",
            "value": "Jaunty Gumption"
        }
    ],
    "choices": [
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "has_pie",
                    "value": false
                },
                {
                    "type": "flag",
                    "key": "eaten_pie",
                    "value": false
                }
            ],
            "text": "Steal the pie!",
            "events": [
                {
                    "type": "change_scene",
                    "value": "cabin_steal"
                }
            ]
        },
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "has_pie",
                    "value": true
                }
            ],
            "text": "Return the pie...",
            "events": [
                {
                    "type": "change_scene",
                    "value": "cabin_unsteal"
                }
            ]
        },
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "eaten_pie",
                    "value": true
                }
            ],
            "text": "Write a sorry note...",
            "events": [
                {
                    "type": "change_scene",
                    "value": "cabin_sorry"
                }
            ]
        },
        {
            "text": "Investigate the cabin.",
            "events": [
                {
                    "type": "change_scene",
                    "value": "cabin_invest"
                }
            ]
        },
        {
            "text": "Look elsewhere around the cabin.",
            "events": [
                {
                    "type": "change_scene",
                    "value": "cabin_elsewhere"
                }
            ]
        },
        {
            "text": "Go back.",
            "events": [
                {
                    "type": "change_scene",
                    "value": "fields"
                }
            ]
        }
    ]
}
```
An item scene, specifically, for when cherries are used within the `blue_gate` scene.
```json
{
    "item": "Cherries",
    "scene": "blue_gate",
    "scene_text": [
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "broke_gate_cherries",
                    "value": false
                }
            ],
            "output": "You wonder for a second how cherries will help pass this blue gate. Then you get a wonderful idea, you shove cherries into the keyhole. It breaks, and now the gate wont ever open."
        },
        {
            "conditions": [
                {
                    "type": "flag",
                    "key": "broke_gate_cherries",
                    "value": true
                }
            ],
            "output": "You shove more cherries into the keyhole in an attempt to hopefully fix it. It does not work, and you're wasting cherries."
        }
    ],
    "events": [
        {
            "type": "take_item",
            "value": "Cherries"
        },
        {
            "type": "disable_item_use"
        },
        {
            "type": "set_flag",
            "value": "broke_gate_cherries"
        }
    ],
    "choices": [
        {
            "conditions": [
            ],
            "text": "D:",
            "events": [
                {
                    "type": "close_popup"
                }
            ]
        }
    ]
}
```
For a more extensive example, check out the `Quadrolax World` subdirectory within the `Adventures` directory. It's a little adventure im working on that makes good use of various Adventure Engine features. As mentioned before you can run `node generatePackagedPlayer.js "Quadrolax World" "fields"` to package the adventure. I encourage you to play around with it and see how it works.