import {calculateSpentAdvancements} from "../advancements.js";
import {decrementAttribute,
        expandAttribute,
        incrementAttribute} from "../attributes.js";
import {decrementCombatAbility,
        expandCombatAbility,
        incrementCombatAbility} from "../combat_abilities.js";
import constants from "../constants.js";
import {decrementCareerRank,
        generateCareerList,
        incrementCareerRank} from "../careers.js";

export default class BoLMECharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes:  ["bolme", "sheet", "character-sheet"],
                            height:   900,
                            template: "systems/bolme/templates/sheets/character-sheet.html",
                            width:    900}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/character-sheet.html`);
    }

    /** @override */
    getData() {
        const context = super.getData();
        let career;

        context.constants = constants;
        Object.keys(context.data.data.attributes).forEach((attribute) => {
            context.data.data[attribute] = expandAttribute(context.data, attribute);
        });

        Object.keys(context.data.data.combat).forEach((ability) => {
            context.data.data[ability] = expandCombatAbility(context.data, ability);
        });

        context.data.data.lifeblood.max = context.data.data.strength.value + 10;

        context.data.armour  = [];
        context.data.weapons = [];
        context.actor.items.forEach((item) => {
            if(item.type === "armour") {
                context.data.armour.push(item);
            } else if(item.type === "weapon") {
                context.data.weapons.push(item);
            }
        });

        context.data.careers = generateCareerList(context.actor);
        career = this._findArcaneCareer(context.data.careers);
        if(career) {
            context.data.data.arcanePoints.max = career.rank + 10;
        } else {
            context.data.data.arcanePoints = {max: 0, value: 0};
        }
        context.data.data.spentAdvancements = calculateSpentAdvancements(context.actor);

        return(context);
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".attribute-decrementer").click((e) => decrementAttribute(this.actor, e.currentTarget.dataset.attribute));
        html.find(".attribute-incrementer").click((e) => incrementAttribute(this.actor, e.currentTarget.dataset.attribute));
        html.find(".combat-ability-decrementer").click((e) => decrementCombatAbility(this.actor, e.currentTarget.dataset.ability));
        html.find(".combat-ability-incrementer").click((e) => incrementCombatAbility(this.actor, e.currentTarget.dataset.ability));
        html.find(".career-decrementer").click((e) => decrementCareerRank(this.actor, e.currentTarget.dataset.id));
        html.find(".career-incrementer").click((e) => incrementCareerRank(this.actor, e.currentTarget.dataset.id));
        html.find(".item-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
    }

    _findArcaneCareer(careers) {
        let output;

        careers.forEach((career) => {
            if(career.grantsArcane) {
                if(!output || output.rank < career.rank) {
                    output = career;
                }
            }
        });

        return(output);
    }

    /** @override */
    _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        console.log("embeddedName:", embeddedName);
        console.log("documents:", documents);
        console.log("result:", result);
        console.log("options:", options);
        console.log("userId:", userId);
        super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId);
    }
}
