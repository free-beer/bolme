import AttackDialog from "../dialogs/attack_dialog.js";
import {calculateSpentAdvancements} from "../advancements.js";
import {decrementAttribute,
        expandAttribute,
        incrementAttribute} from "../attributes.js";
import {decrementCombatAbility,
        expandCombatAbility,
        incrementCombatAbility} from "../combat_abilities.js";
import constants from "../constants.js";
import {decrementCraftingProgressClicked,
        deleteCraftingRecipe,
        expandRecipe,
        incrementCraftingProgressClicked,
        rollForCraftedItem} from "../crafting.js";
import {decrementCareerRank,
        deleteCareer,
        generateCareerList,
        incrementCareerRank} from "../careers.js";
import InfoDialog from "../dialogs/info_dialog.js";
import {deleteCharacterLanguage} from "../languages.js";
import SpellCastDialog from "../dialogs/spell_cast_dialog.js";
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
        context.data.recipes   = [];
        context.data.shields   = [];
        context.data.spells    = {cantrip: [],
                                  first:   [],
                                  second:  [],
                                  third:   []};
        context.data.weapons   = [];
        context.actor.items.forEach((item) => {
            switch(item.type) {
                case "armour":
                    context.data.armour.push(item);
                    break;

                case "crafting recipe":
                    context.data.recipes.push(this._generateRecipeDetails(item));
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

                case "spell":
                    let magnitude = item.data.data.magnitude;
                    context.data.spells[magnitude].push(item);
                    context.data.spells[`has${magnitude.substr(0, 1).toUpperCase()}${magnitude.substr(1)}`] = true;
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
        html.find(".attack-icon").click((e) => this._showAttackDialog(e));
        html.find(".attribute-decrementer").click((e) => decrementAttribute(this.actor, e.currentTarget.dataset.attribute));
        html.find(".attribute-incrementer").click((e) => incrementAttribute(this.actor, e.currentTarget.dataset.attribute));
        html.find(".combat-ability-decrementer").click((e) => decrementCombatAbility(this.actor, e.currentTarget.dataset.ability));
        html.find(".combat-ability-incrementer").click((e) => incrementCombatAbility(this.actor, e.currentTarget.dataset.ability));
        html.find(".career-decrementer").click((e) => decrementCareerRank(this.actor, e.currentTarget.dataset.id));
        html.find(".career-incrementer").click((e) => incrementCareerRank(this.actor, e.currentTarget.dataset.id));
        html.find(".career-deleter").click((e) => deleteCareer(this.actor, e.currentTarget.dataset.id));
        html.find(".crafting-point-reset").click((e) => this._resetCraftingPoints(this.actor));
        html.find(".crafting-progress-decrementer").click((e) => decrementCraftingProgressClicked(e, this.actor));
        html.find(".crafting-progress-incrementer").click((e) => incrementCraftingProgressClicked(e, this.actor));
        html.find(".language-deleter").click((e) => deleteCharacterLanguage(this.actor, e.currentTarget.dataset.id));
        html.find(".info-icon").click((e) => InfoDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".item-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
        html.find(".recipe-deleter").click((e) => deleteCraftingRecipe(e, this.actor));
        html.find(".roll-crafting").click((e) => rollForCraftedItem(this.actor, e.currentTarget.dataset.id));
        html.find(".spell-cast-icon").click((e) => this._showSpellCastDialog(e));
        html.find(".tab-selector").click((e) => this._onTabSelected(e, html[0]));
        html.find(".trait-deleter").click((e) => traitRemovedFromCharacter(this.actor, e.currentTarget.dataset.id));
    }

    _findArcaneCareer(careers) {
        let output;

        careers.forEach((career) => {
            if(career.grants.arcane) {
                if(!output || output.rank < career.rank) {
                    output = career;
                }
            }
        });

        return(output);
    }

    _findCraftingCareer(careers) {
        let output;

        careers.forEach((career) => {
            if(career.grants.crafting) {
                if(!output || output.rank < career.rank) {
                    output = career;
                }
            }
        });

        return(output);
    }

    _findFateCareer(careers) {
        let output;

        careers.forEach((career) => {
            if(career.grants.fate) {
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

    _generateRecipeDetails(recipe) {
        return(expandRecipe(recipe, this.actor.id));
    }

    _resetCraftingPoints(actor) {
        actor.update({data: {craftingPoints: {value: actor.data.data.craftingPoints.max}}});
    }

    _showAttackDialog(event) {
        let defence = 0;

        if(game.user.targets.size === 1) {
            let target = game.user.targets.first().actor;

            if(game.user.targets.size === 1) {
                let target = game.user.targets.first().actor;

                if(target.type === "character") {
                    defence = expandCombatAbility(target.data, "defence").value;
                } else {
                    defence = target.data.data.defence;
                }
            }
        }
        AttackDialog.build(event.currentTarget, {defence: defence}).then((dialog) => dialog.render(true));
    }

    _showSpellCastDialog(event) {
        let defence = 0;

        if(game.user.targets.size === 1) {
            let target = game.user.targets.first().actor;

            if(game.user.targets.size === 1) {
                let target = game.user.targets.first().actor;

                if(target.type === "character") {
                    defence = expandCombatAbility(target.data, "defence").value;
                } else {
                    defence = target.data.data.defence;
                }
            }
        }
        SpellCastDialog.build(event.currentTarget, {}).then((dialog) => dialog.render(true));
    }

    _onTabSelected(event, root) {
        let tabId = event.currentTarget.dataset.id;

        if(tabId) {
            let tabElement = root.querySelector(`#${tabId}`);

            if(tabElement) {
                let allTabs   = root.querySelectorAll(".tab-selector");
                let allBodies = root.querySelectorAll(".tab-body");

                allTabs.forEach((t) => t.classList.remove("selected"));
                allBodies.forEach((b) => b.classList.add("hidden"));

                tabElement.classList.remove("hidden");
                event.currentTarget.classList.add("selected");
                console.log(`Updating tab selection to '${tabId}'.`);
                this.actor.update({data: {tabs: {selected: tabId}}});
            } else {
                console.error(`Unable to locate a tab body element with the id '${tabId}'.`);
            }
        } else {
            console.error(`Tab selected but selected element does not possess an id data attribute.`);
        }
    }
}
