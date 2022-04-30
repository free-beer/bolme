import {showMessage} from "../chat.js";
import {expandCareer} from "../careers.js";
import constants from "../constants.js";
import {getRollResultLevel,
        generateTaskRollFormula,
        rollIt,
        translateDieFormula} from "../dice.js";

export default class TaskRollDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 275}));
    }

	constructor(settings) {
        let buttons = {attack: {callback: () => this._rollTask(),
                                label: game.i18n.localize("bolme.buttons.roll")}};

        super(Object.assign({}, settings, {buttons: buttons}));
        this._actorId   = settings.actorId;
        this._attribute = settings.attribute;
        this._careerId  = settings.careerId;
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

    get attribute() {
        return(this.element[0].querySelector('select[name="attribute"]').value);
    }

    get bonusDice() {
        return(parseInt(this.element[0].querySelector('input[name="bonusDice"]').value));
    }

    get careerId() {
        return(this.element[0].querySelector('select[name="career"]').value);
    }

    get penaltyDice() {
        return(parseInt(this.element[0].querySelector('input[name="penaltyDice"]').value));
    }

    _rollTask() {
        let actor  = this.actor;
        let career = actor.items.find((i) => i.id === this.careerId);
        let data   = {actorId:     actor.id,
                      actorName:   actor.name,
                      attribute:   this.attribute,
                      bonusDice:   this.bonusDice,
                      careerRank:  0,
                      careerUsed:  false,
                      penaltyDice: this.penaltyDice};
        let dice;

        if(career) {
            career          = expandCareer(career);
            data.careerId   = career.id;
            data.careerName = career.name;
            data.careerRank = career.rank;
            data.careerUsed = true;
        }

        data.formula = generateTaskRollFormula(actor.id,
                                               data.attribute,
                                               data.careerRank,
                                               data.bonusDice,
                                               data.penaltyDice);
        data.roll   = new Roll(data.formula);

        rollIt(data.roll)
            .then((roll) => {
                data.dice        = roll.dice;
                data.resultLevel = getRollResultLevel(roll);
                data.rollTotal   = roll.total;
                showMessage("systems/bolme/templates/chat/task-roll.html", data);
            });
    }

    static build(element, options={}) {
        let settings = Object.assign({}, options);
        let data     = {};
        let actor    = game.actors.find((a) => a.id === element.dataset.actor);

        settings.title = game.i18n.localize(`bolme.dialogs.titles.taskRoll`);
        if(actor) {
            let settings = Object.assign({}, options);
            let careers  = actor.items.filter((i) => i.type === "career").map((i) => expandCareer(i));
            let data     = {actorId:       actor.id,
                            attribute:     element.dataset.attribute,
                            careers:       careers,
                            careerId:      element.dataset.career,
                            bonusDice:     0,
                            constants:     {attributes: constants.attributes},
                            penaltyDice:   0,
                            type:          (element.dataset.attribute ? "attribute" : "career")};

            careers.forEach((c) => {
                c.selected = (c.id === data.careerId);
            });
            if(data.type === "career") {
                data.name            = game.i18n.localize("bolme.dialogs.headers.taskRoll.careerBased");
                data.attributeLocked = false;
                data.careerLocked    = true;
            } else {
                data.name            = game.i18n.localize("bolme.dialogs.headers.taskRoll.attributeBased");
                data.attributeLocked = true;
                data.careerLocked    = false;
            }

            settings.actorId   = actor.id;
            settings.attribute = data.attribute;
            settings.careerId  = (data.careerId ? data.careerId : null);
            settings.title     = game.i18n.localize(`bolme.dialogs.titles.taskRoll`);
            return(renderTemplate("systems/bolme/templates/dialogs/task-roll-dialog.html", data)
                       .then((content) => {
                                 settings.content = content;
                                 return(new TaskRollDialog(settings));
                             }));   
        } else {
            console.error(`Unable to locate actor id '${actor.id}'.`);
        }
    }
}
