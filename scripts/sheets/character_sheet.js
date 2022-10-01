import ArmourRollDialog from "../dialogs/armour_roll_dialog.js";
import AttackDialog from "../dialogs/attack_dialog.js";
import {calculateSpentAdvancements} from "../advancements.js";
import {decrementAttribute,
        expandAttribute,
        incrementAttribute} from "../attributes.js";
import {decrementCombatAbility,
        expandCombatAbility,
        incrementCombatAbility} from "../combat_abilities.js";
import {decrementConsumableItem,
        incrementConsumableItem} from "../consumables.js";
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
import {resetArcanePoints} from "../magic.js";
import SpellCastDialog from "../dialogs/spell_cast_dialog.js";
import {onTabSelected} from "../tabs.js";
import TaskRollDialog from "../dialogs/task_roll_dialog.js";
import {traitRemovedFromCharacter} from "../traits.js";

import WeaponSheet from "./weapon_sheet.js";

export default class BoLMECharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes:  ["bolme", "bolme-sheet", "bolme-character-sheet", "sheet"],
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
        const context = super.getData().actor;
        let career;
        let policed = game.settings.get("bolme", "policeAdvancements");

        context.constants = constants;
        Object.keys(context.system.attributes).forEach((attribute) => {
            context.system[attribute] = expandAttribute(context.system, attribute);
        });

        Object.keys(context.system.combat).forEach((ability) => {
            context.system[ability] = expandCombatAbility(context.system, ability);
        });

        context.system.lifeblood.max = context.system.strength.value + 10;

        context.system.actorId     = this.actor.id;
        context.system.armour      = [];
        context.system.boons       = [];
        context.system.consumables = [];
        context.system.flaws       = [];
        context.system.equipment   = [];
        context.system.languages   = [];
        context.system.recipes     = [];
        context.system.shields     = [];
        context.system.spells      = {cantrip: [],
                                      first:   [],
                                      second:  [],
                                      third:   []};
        context.system.weapons     = [];
        context.items.forEach((item) => {
            switch(item.type) {
                case "armour":
                    context.system.armour.push(this._generateArmourData(item));
                    break;

                case "crafting recipe":
                    context.system.recipes.push(this._generateRecipeDetails(item));
                    break;

                case "consumable":
                    context.system.consumables.push(item);
                    break;

                case "equipment":
                    context.system.equipment.push(item);
                    break;

                case "language":
                    context.system.languages.push(item);
                    break;

                case "shield":
                    if(!context.system.hasShield) {
                        context.system.hasShield = true;
                    }
                    context.system.shields.push(item);
                    context.system.armour.push(this._generateArmourData(item));
                    break;

                case "spell":
                    let magnitude = item.system.magnitude;
                    context.system.spells[magnitude].push(item);
                    context.system.spells[`has${magnitude.substr(0, 1).toUpperCase()}${magnitude.substr(1)}`] = true;
                    break;

                case "trait":
                    if(item.system.type === "boon") {
                        context.system.boons.push(item);
                    } else {
                        context.system.flaws.push(item);
                    }
                    break;

                case "weapon":
                    context.system.weapons.push(item);
                    break;
            }
        });

        context.system.careers = generateCareerList(context);

        context.system.spentAdvancements = calculateSpentAdvancements(context);
        context.system.starting = (policed &&
                                   (context.system.points.starting.attributes > 0 ||
                                    context.system.points.starting.careers > 0 ||
                                    context.system.points.starting.combat > 0 ||
                                    context.system.points.starting.traits > 0));

        return(context);
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".attack-icon").click((e) => this._showAttackDialog(e));
        html.find(".attribute-decrementer").click((e) => decrementAttribute(this.actor, e.currentTarget.dataset.attribute));
        html.find(".attribute-incrementer").click((e) => incrementAttribute(this.actor, e.currentTarget.dataset.attribute));
        html.find(".combat-ability-decrementer").click((e) => decrementCombatAbility(this.actor, e.currentTarget.dataset.ability));
        html.find(".combat-ability-incrementer").click((e) => incrementCombatAbility(this.actor, e.currentTarget.dataset.ability));
        html.find(".consumable-decrementer").click(decrementConsumableItem);
        html.find(".consumable-incrementer").click(incrementConsumableItem);
        html.find(".career-decrementer").click((e) => decrementCareerRank(this.actor, e.currentTarget.dataset.id));
        html.find(".career-incrementer").click((e) => incrementCareerRank(this.actor, e.currentTarget.dataset.id));
        html.find(".career-deleter").click((e) => deleteCareer(this.actor, e.currentTarget.dataset.id));
        html.find(".crafting-point-reset").click((e) => this._resetCraftingPoints(this.actor));
        html.find(".crafting-progress-decrementer").click((e) => decrementCraftingProgressClicked(e, this.actor));
        html.find(".crafting-progress-incrementer").click((e) => incrementCraftingProgressClicked(e, this.actor));
        html.find(".language-deleter").click((e) => deleteCharacterLanguage(this.actor, e.currentTarget.dataset.id));
        html.find(".info-icon").click((e) => InfoDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".item-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
        html.find(".item-name").click((e) => this._itemNameClicked(e));
        html.find(".recipe-deleter").click((e) => deleteCraftingRecipe(e, this.actor));
        html.find(".reset-arcane-icon").click((e) => resetArcanePoints(e.currentTarget.dataset.actor));
        html.find(".roll-armour-icon").click((e) => ArmourRollDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".roll-crafting").click((e) => rollForCraftedItem(this.actor, e.currentTarget.dataset.id));
        html.find(".spell-cast-icon").click((e) => this._showSpellCastDialog(e));
        html.find(".tab-selector").click((e) => onTabSelected(e, html[0], this.actor));
        html.find(".task-roll").click((e) => this._showTaskRollDialog(e));
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

    _generateArmourData(armour) {
        return({description: (armour.type === "armour" ? this._generateArmourDescription(armour) : this._generateShieldDescription(armour)),
                id:          armour.id,
                kind:        this._generateArmourKind(armour),
                name:        armour.name,
                protection:  armour.system.protection,
                type:        armour.type});
    }

    _generateArmourDescription(armour) {
        let data        = armour.system;
        let description = data.description.trim();
        let penalties   = (data.penalties || "").trim();
        let text        = "";

        if(description !== "") {
            text = `${data.description}`;
        }

        if(penalties !== "") {
            if(description !== "") {
                text = `${text}<br>`;
            }
            text = `${text}<strong>${game.i18n.localize("bolme.armour.titles.penalties")}</strong><br>${data.penalties}`;
        }

        return(text);
    }

    _generateArmourKind(armour) {
        let data = armour.system;

        if(armour.type === "armour") {
            return(game.i18n.localize(`bolme.armour.${data.type}.label`));
        } else {
            let size = game.i18n.localize(`bolme.shields.sizes.${data.size}.label`);
            return(`${game.i18n.localize("bolme.armour.shield.label")} (${size})`);
        }
    }

    _generateShieldDescription(shield) {
        return(game.i18n.localize(`bolme.shields.descriptions.${shield.system.size}`));
    }

    _itemNameClicked(event) {
        let element = event.currentTarget;
        let actor   = game.actors.find((a) => a.id === element.dataset.actor);

        if(actor) {
            let item = actor.items.find((i) => i.id === element.dataset.id);

            if(item) {
                item.sheet.render(true);
            }
        }
    }

    /**@override */
    _onCreate() {
        super._onCreate();
        console.log("Character._onCreate() called.");
    }

    /** @override */
    _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId);
    }

    _generateRecipeDetails(recipe) {
        return(expandRecipe(recipe, this.actor.id));
    }

    _resetCraftingPoints(actor) {
        actor.update({data: {craftingPoints: {value: actor.system.craftingPoints.max}}});
    }

    _showAttackDialog(event) {
        let defence = 0;

        if(game.user.targets.size === 1) {
            let target = game.user.targets.first().actor;

            if(game.user.targets.size === 1) {
                let target = game.user.targets.first().actor;

                if(target.type === "Character") {
                    defence = expandCombatAbility(target.system, "defence").value;
                } else {
                    defence = target.system.defence;
                }
            }
        }
        AttackDialog.build(event.currentTarget, {defence: defence}).then((dialog) => dialog.render(true));
    }

    _showTaskRollDialog(event) {
        TaskRollDialog.build(event.currentTarget, {}).then((dialog) => dialog.render(true));
    }

    _showSpellCastDialog(event) {
        SpellCastDialog.build(event.currentTarget, {}).then((dialog) => dialog.render(true));
    }
}
