import {calculateSpentAdvancements} from "../advancements.js";
import {decrementAttribute,
        expandAttribute,
        incrementAttribute} from "../attributes.js";
import {decrementCombatAbility,
        expandCombatAbility,
        incrementCombatAbility} from "../combat_abilities.js";
import constants from "../constants.js";
import {decrementCareerRank,
        deleteCareer,
        generateCareerList,
        incrementCareerRank} from "../careers.js";
import InfoDialog from "../dialogs/info_dialog.js";
import {deleteCharacterLanguage} from "../languages.js";
import {traitRemovedFromCharacter} from "../traits.js";

export default class BoLMECharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes:  ["bolme", "sheet", "character-sheet"],
                            height:   900,
                            template: "systems/bolme/templates/sheets/character-sheet.html",
                            width:    1100}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/character-sheet.html`);
    }

    /** @override */
    getData() {
        const context = super.getData();
        let career;
        let policed = game.settings.get("bolme", "policeAdvancements");

        console.log("ACTOR:", context.actor);

        context.constants = constants;
        Object.keys(context.data.data.attributes).forEach((attribute) => {
            context.data.data[attribute] = expandAttribute(context.data, attribute);
        });

        Object.keys(context.data.data.combat).forEach((ability) => {
            context.data.data[ability] = expandCombatAbility(context.data, ability);
        });

        context.data.data.lifeblood.max = context.data.data.strength.value + 10;

        context.data.armour    = [];
        context.data.boons     = [];
        context.data.flaws     = [];
        context.data.languages = [];
        context.data.shields   = [];
        context.data.weapons   = [];
        context.actor.items.forEach((item) => {
            switch(item.type) {
                case "armour":
                    context.data.armour.push(item);
                    break;

                case "language":
                    context.data.languages.push(item);
                    break;

                case "shield":
                    if(!context.data.hasShield) {
                        context.data.hasShield = true;
                    }
                    context.data.shields.push(item);
                    break;

                case "trait":
                    if(item.data.data.type === "boon") {
                        context.data.boons.push(item);
                    } else {
                        context.data.flaws.push(item);
                    }
                    break;

                case "weapon":
                    context.data.weapons.push(item);
                    break;
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
        context.data.data.starting = (policed &&
                                      (context.data.data.points.starting.attributes > 0 ||
                                       context.data.data.points.starting.careers > 0 ||
                                       context.data.data.points.starting.combat > 0 ||
                                       context.data.data.points.starting.traits > 0));

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
        html.find(".career-deleter").click((e) => deleteCareer(this.actor, e.currentTarget.dataset.id));
        html.find(".language-deleter").click((e) => deleteCharacterLanguage(this.actor, e.currentTarget.dataset.id));
        html.find(".info-icon").click((e) => InfoDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".item-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
        html.find(".trait-deleter").click((e) => traitRemovedFromCharacter(this.actor, e.currentTarget.dataset.id));
        traitRemovedFromCharacter
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

    /**@override */
    _onCreate() {
        super._onCreate();
        console.log("Character._onCreate() called.");
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
