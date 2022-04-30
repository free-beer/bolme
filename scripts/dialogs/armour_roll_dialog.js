import {showMessage} from "../chat.js";
import constants from "../constants.js";
import {rollIt,
        translateDieFormula} from "../dice.js";

const DIE_ROLL_PATTERN = /[0-9]+[dD]6/;

export default class ArmourRollDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 325}));
    }

	constructor(settings) {
        let buttons = {attack: {callback: () => this._rollTask(),
                                label: game.i18n.localize("bolme.buttons.roll")}};

        super(Object.assign({}, settings, {buttons: buttons}));
        this._actorId = settings.actorId;
	}

    get actor() {
        let actor = game.actors.find((a) => a.id === this._actorId);

        if(!actor) {
            throw(`Unable to locate an actor with the id '${this._actorId}'.`);
        }

        return(actor);
    }

    get actorId() {
        return(this._actorId);
    }

    get armourItems() {
        this.actor.items.filter((i) => i.type === "armour").map();
    }

    _rollTask() {
        let actor         = this.actor;
        let checkboxes    = this.element[0].querySelectorAll("input:checked");


        if(checkboxes.length > 0) {
            let data   = {actorId:   actor.id,
                          actorName: actor.name};
            let pieces = [];

            checkboxes.forEach((c) => {
                let formula = translateDieFormula(c.dataset.protection);

                if(DIE_ROLL_PATTERN.test(formula)) {
                    pieces.push(`(max(0, ${formula}))`);
                } else {
                    pieces.push(`(${formula})`);
                }
            });
            data.formula = pieces.join(" + ");
            data.roll    = new Roll(data.formula);

            rollIt(data.roll).then((roll) => {
                data.dice      = roll.dice;
                data.rollTotal = roll.total;
                showMessage("systems/bolme/templates/chat/armour-roll.html", data);
            });
        } else {
            console.warn("No armour items selected, so no armour protection roll will be made.");
        }
    }

    static build(element, options) {
        let data  = {};
        let actor = game.actors.find((a) => a.id === element.dataset.actor);

        if(actor) {
            let settings = Object.assign({}, options);
            let items    = actor.items.filter((item) => item.type === "armour");

            if(items.length > 0) {
                let data     = {actorId: actor.id,
                                armour:  items,
                                name:    actor.name};

                settings.actorId   = actor.id;
                settings.title     = game.i18n.localize(`bolme.dialogs.titles.armourRoll`);
                return(renderTemplate("systems/bolme/templates/dialogs/armour-roll-dialog.html", data)
                           .then((content) => {
                                     settings.content = content;
                                     return(new ArmourRollDialog(settings));
                                 }));
            } else {
                ui.notifications.error(game.i18n.localize("bolme.errors.armourRoll.noArmour"));
            }
        } else {
            console.error(`Unable to locate actor id '${actor.id}'.`);
        }
    }
}
