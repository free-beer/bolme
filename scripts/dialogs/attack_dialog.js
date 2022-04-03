import {showMessage} from "../chat.js";
import constants from "../constants.js";
import {getRollResultLevel,
        generateAttackRollFormula,
        rollIt,
        translateDieFormula} from "../dice.js";

export default class AttackDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 275}));
    }

	constructor(settings) {
        let buttons = {attack: {callback: () => this._rollAttack(),
                                label: game.i18n.localize("bolme.buttons.roll")}};

        super(Object.assign({}, settings, {buttons: buttons}));
        this._actorId  = settings.actorId;
        this._defence  = settings.defence;
        this._weaponId = settings.weaponId;
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

    get combatAbility() {
        return(this.element[0].querySelector('select[name="combatAbility"]').value);
    }

    get defence() {
        return(parseInt(this.element[0].querySelector('input[name="defence"]').value));
    }

    get penaltyDice() {
        return(parseInt(this.element[0].querySelector('input[name="penaltyDice"]').value));
    }

    get rangeModifier() {
        return(parseInt(this.element[0].querySelector('input[name="rangeModifier"]').value));
    }

    get weapon() {
        let weapon = this.actor.items.find((i) => i.type === "weapon" && i.id === this._weaponId);

        if(!weapon) {
            throw(`Unable to locate a weapon with the id '${this._weaponId}'.`);
        }

        return(weapon);
    }

    get weaponId() {
        return(this._weaponId);
    }

    _rollAttack() {
        let actor  = this.actor;
        let weapon = this.weapon;
        let data   = {actorId:       actor.id,
                      actorName:     actor.name,
                      attribute:     this.attribute,
                      bonusDice:     this.bonusDice,
                      combatAbility: this.combatAbility,
                      defence:       this.defence,
                      penaltyDice:   this.penaltyDice,
                      rangeModifier: this.rangeModifier,
                      weaponId:      weapon.id,
                      weaponName:    weapon.name,
                      weaponType:    weapon.data.data.type};
        let dice;

        data.formula = generateAttackRollFormula(actor.id,
                                                 data.attribute,
                                                 data.combatAbility,
                                                 data.bonusDice,
                                                 data.penaltyDice,
                                                 data.defence,
                                                 data.rangeModifier);
        data.roll   = new Roll(data.formula);

        rollIt(data.roll)
            .then((roll) => {
                getRollResultLevel(roll);
                data.dice        = roll.dice;
                data.resultLevel = getRollResultLevel(roll);
                data.rollTotal   = roll.total;
                showMessage("systems/bolme/templates/chat/attack-roll.html", data);
            });
    }

    static build(element, options) {
        let settings = Object.assign({}, options);
        let data     = {};
        let actor    = game.actors.find((a) => a.id === element.dataset.actor);

        settings.title = game.i18n.localize(`bolme.dialogs.titles.attack`);
        if(actor) {
            let weapon  = actor.items.find((i) => i.id === element.dataset.weapon);

            if(weapon) {
                let settings = Object.assign({}, options);
                let data     = {actorId:       actor.id,
                                attribute:     "agility",
                                bonusDice:     0,
                                combat:        weapon.data.data.type,
                                constants:     {attributes: constants.attributes,
                                                combatAbilities: constants.combatAbilities},
                                damage:        weapon.data.data.damage,
                                defence:       (options.defence || 0),
                                name:          weapon.name,
                                penaltyDice:   0,
                                rangeModifier: 0,
                                weaponId:      weapon.id};

                settings.actorId  = actor.id;
                settings.defence  = data.defence;
                settings.title    = game.i18n.localize(`bolme.dialogs.titles.attack`);
                settings.weaponId = weapon.id;
                return(renderTemplate("systems/bolme/templates/dialogs/attack-dialog.html", data)
                           .then((content) => {
                                     settings.content = content;
                                     return(new AttackDialog(settings));
                                 }));   
            } else {
                console.error(`Unable to locate weapon id '${element.dataset.weapon}' on actor id '${actor.id}' (${actor.name}).`);
            }
        } else {
            console.error(`Unable to locate actor id '${actor.id}'.`);
        }
    }
}
