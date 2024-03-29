import ArmourRollDialog from "../dialogs/armour_roll_dialog.js";
import AttackDialog from "../dialogs/attack_dialog.js";
import {decrementCareerRank,
        deleteCareer,
        generateCareerList,
        incrementCareerRank} from "../careers.js";
import constants from "../constants.js";
import InfoDialog from "../dialogs/info_dialog.js";
import SpellCastDialog from "../dialogs/spell_cast_dialog.js";
import TaskRollDialog from "../dialogs/task_roll_dialog.js";
import {resetArcanePoints} from "../magic.js";
import {onTabSelected} from "../tabs.js";

export default class BoLMENPCSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes:  ["bolme", "sheet", "npc-sheet"],
                            height:   900,
                            template: "systems/bolme/templates/sheets/npc-sheet.html",
                            width:    800}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/npc-sheet.html`);
    }

    /** @override */
    getData() {
        const context = super.getData();

        context.constants = {priorities: constants.npcs.priorities};
        context.traits = context.items.filter((i) => i.type === "trait");

        context.actorId = this.actor.id;
        context.armour  = [];
        context.boons   = [];
        context.careers = generateCareerList(context.actor, true);
        context.flaws   = [];
        context.shields = [];
        context.spells  = {cantrip:    [],
                           first:      [],
                           hasCantrip: false,
                           hasFirst:   false,
                           hasSecond:  false,
                           hasThird:   false,
                           second:     [],
                           third:      []};
        context.weapons = [];

        context.items.forEach((item) => {
            switch(item.type) {
                case "armour":
                    context.armour.push(item);
                    break;

                case "shield":
                    context.shields.push(item);
                    break;

                case "spell":
                    let magnitude = item.system.magnitude;
                    context.spells[magnitude].push(item);
                    context.spells[`has${magnitude.substr(0, 1).toUpperCase()}${magnitude.substr(1)}`] = true;
                    break;

                case "trait":
                    if(item.system.type === "boon") {
                        context.boons.push(item);
                    } else {
                        context.flaws.push(item);
                    }
                    break;

                case "weapon":
                    context.weapons.push(item);
                    break;
            }
        });
        context.asShield = (context.shields.length > 0);

        return(context);
    }

    activateListeners(html) {
        let arcaneFields    = [html[0].querySelector('input[name="system.arcanePoints.max"]'),
                               html[0].querySelector('input[name="system.arcanePoints.value"]')];
        let fateFields      = [html[0].querySelector('input[name="system.fatePoints.max"]'),
                               html[0].querySelector('input[name="system.fatePoints.value"]')];
        let lifebloodFields = [html[0].querySelector('input[name="system.lifeblood.max"]'),
                               html[0].querySelector('input[name="system.lifeblood.value"]')];
        let villainFields   = [html[0].querySelector('input[name="system.villainPoints.max"]'),
                               html[0].querySelector('input[name="system.villainPoints.value"]')];

        super.activateListeners(html);

        arcaneFields[0].addEventListener("input", () => arcaneFields[1].value = arcaneFields[0].value);
        fateFields[0].addEventListener("input", () => fateFields[1].value = fateFields[0].value);
        lifebloodFields[0].addEventListener("input", () => lifebloodFields[1].value = lifebloodFields[0].value);
        villainFields[0].addEventListener("input", () => villainFields[1].value = villainFields[0].value);

        html.find(".attack-icon").click((e) => this._showAttackDialog(e));
        html.find(".career-decrementer").click((e) => decrementCareerRank(this.actor, e.currentTarget.dataset.id, true));
        html.find(".career-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
        html.find(".career-incrementer").click((e) => incrementCareerRank(this.actor, e.currentTarget.dataset.id, true));
        html.find(".info-icon").click((e) => InfoDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".item-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
        html.find(".item-name").click((e) => this._itemNameClicked(e));
        html.find(".reset-arcane-icon").click((e) => resetArcanePoints(e.currentTarget.dataset.actor));
        html.find(".roll-armour-icon").click((e) => ArmourRollDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".spell-cast-icon").click((e) => this._showSpellCastDialog(e));
        html.find(".task-roll").click((e) => TaskRollDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".tab-selector").click((e) => onTabSelected(e, html[0], this.actor));
        html.find(".trait-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
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

    _showSpellCastDialog(event) {
        SpellCastDialog.build(event.currentTarget, {}).then((dialog) => dialog.render(true));
    }
}
