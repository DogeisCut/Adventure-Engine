let currentScene = {}
const scenes = {};
const inventory = [];
const flags = new Set();

function renderInventory() {
    const sceneTextElem = document.getElementById("scene-text")
    const choicesElem = document.getElementById("choices")
    const filledInventory = inventory.length > 0
    sceneTextElem.innerHTML = ""
    choicesElem.innerHTML = ""
    sceneTextElem.innerHTML = "Inventory:<br><br><span class=\"faint\">Empty :(</span>"
    if (filledInventory) {
        sceneTextElem.innerHTML = "Inventory:"
        inventory.forEach(item => {
            const itemElem = document.createElement("div");
            itemElem.className = "choice";
            itemElem.onclick = function() {
                useItem(item)
            };
            itemElem.innerHTML = `-${item}`;
            choicesElem.appendChild(itemElem);
        });
    }

    const closeChoiceElem = document.createElement("div");
    closeChoiceElem.className = "choice";
    closeChoiceElem.onclick = function() {
        closeInventory()
    };
    closeChoiceElem.innerHTML = (filledInventory ? "<br>" : "") + "-Close inventory.";
    choicesElem.appendChild(closeChoiceElem);
}

function handleCondition(condition) {
    const type = condition.type
    const key = condition.key
    const value = condition.value
    switch (type) {
        case "item":
            return inventory.includes(key) == value
        case "flag":
            return flags.has(key) == value
        default:
            throw new Error(`Found a condition with an unknown type: ${type}!`);
    }
}

function renderScene(scene, instant = false) {
    const sceneTextElem = document.getElementById("scene-text")
    const choicesElem = document.getElementById("choices")
    sceneTextElem.innerHTML = ""
    choicesElem.innerHTML = ""

    const sceneTexts = scene.scene_text
    const sceneChoices = scene.choices

    let finalSceneText = ""
    sceneTexts.forEach(sceneText => {
        const conditions = sceneText.conditions
        const text = sceneText.output
        const styleLookup = {
            undefined: "",
            "": "",
            "character name": "character-name",
            "link": "choice",
            "faint": "faint",
        }
        const style = sceneText.style
        let showsUp = true
        conditions.forEach(condition => {
            showsUp = showsUp && handleCondition(condition)
        })
        if (showsUp) {
            finalSceneText += `<span class="${styleLookup[style] ? styleLookup[style] : ""}">${text}</span>`
        }
    });

    sceneTextElem.innerHTML = finalSceneText;

    let i = 0
    sceneChoices.forEach(choice => {
        const conditions = choice.conditions
        const text = choice.text
        let showsUp = true
        if (conditions) {
            showsUp = conditions.every(condition => handleCondition(condition));  // i just learned about this!! :3
        }
        if (showsUp) {
            const choicElem = document.createElement("div");
            choicElem.className = "choice";
            const id = i
            choicElem.onclick = () => chooseOption(id)
            choicElem.innerHTML = `-${text}`;
            choicesElem.appendChild(choicElem);
        }
        i++
    });

    const openInventoryChoiceElem = document.createElement("div");
    openInventoryChoiceElem.className = "choice";
    openInventoryChoiceElem.onclick = function() {
        openInventory()
    };
    openInventoryChoiceElem.innerHTML = "<br>-Open inventory.";
    choicesElem.appendChild(openInventoryChoiceElem);
}

function renderError(errorText) {
    const sceneTextElem = document.getElementById("scene-text")
    const choicesElem = document.getElementById("choices")
    sceneTextElem.innerHTML = ""
    choicesElem.innerHTML = ""

    sceneTextElem.innerHTML = "<span class=\"error\">[ERROR: " + errorText + "]</span>";
}

function runSceneEvents(events) {
    events.forEach(event => {
        const value = event.value
        switch (event.type) {
            case "change_scene":
                currentScene = scenes[event.sceneId];
                renderScene(currentScene);
                if (currentScene.events) {
                    runChoiceEvents(currentScene.events);
                }
                break;
            case "give_item":
                inventory.push(value);
                break;
            case "set_flag":
                flags.add(value);
                break;
            case "unset_flag":
                flags.delete(value);
                break;
        }
    });
}

function runChoiceEvents(events) {

}

function openInventory() {
    renderInventory()
}

function closeInventory() {
    renderScene(currentScene, true)
}

function chooseOption(option) {
    console.log("Choice selected:", option);
}

function useItem(item) {
    console.log("Item used:", item);
}