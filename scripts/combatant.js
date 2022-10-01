import {showMessage} from "./chat.js";
import {generateCharacterInitiativeRoll,
        RESULT_POSITION_MAP} from "./combat.js";
import {getRollResultLevel,
            rollIt} from "./dice.js";

/**
 * An extension of the Combatant class specifically for the BoLME system. This
 * is a fairly minimalist extension, overriding the bare minimum to get the
 * interaction with the combat system working.
 */
export default class BoLMECombatant extends Combatant {
    constructor(data, parent) {
        super(data, parent);
        this._initiativeRoll  = null;
        this._initiativeValue = null;
    }

    get initiaive() {
        return(this._initiativeRoll ? RESULT_POSITION_MAP[getRollResultLevel(roll)] : null);
    }

    get initiativeValue() {
        return(this._initiativeValue);
    }

    set initiativeValue(value) {
        this._initiativeValue = value;
    }

    get initiativeLevel() {
        var level;

        if(this.actor) {
            if(this.actor.type === "Character" && this._initiativeRoll) {
                level = getRollResultLevel(this._initiativeRoll);
            } else {
                level = this.actor.system.priority;
            }
        }

        return(level);
    }

    set initiativeRoll(roll) {
        this._initiativeRoll = roll;
    }

    /** @override */
    getInitiativeRoll(formula) {
        if(this.actor.type === "Character") {
            return(generateCharacterInitiativeRoll(this.actor));
        } else {
            return(new Roll(`${RESULT_POSITION_MAP[this.actor.system.priority]}`));
        }
    }

    /** @override */
    async rollInitiative(formula) {
        let actor = this.actor;

        if(actor) {
            if(actor.type === "Character") {
                await rollIt(this.getInitiativeRoll(formula))
                    .then((roll) => {
                        let data = {actorId:           this.actor.id,
                                    actorName:         actor.name,
                                    combatId:          this.combat.id,
                                    combatantId:       this.id,
                                    dice:              roll.dice,
                                    formula:           roll.formula,
                                    isFailure:         (roll.total < 9),
                                    isSuccessOrMighty: (roll.total > 8),
                                    isSnakeEyes:       (roll.dice[0].total === 2),
                                    resultLevel:       getRollResultLevel(roll),
                                    rollTotal:         roll.total,
                                    showOptions:       (formula !== "~")};

                        this._initiativeRoll  = roll;
                        this._initiativeValue = RESULT_POSITION_MAP[getRollResultLevel(roll)];
                        this.update({initiative: this._initiativeValue});
                        console.log(`Generated initiative for '${actor.name}', value is ${this._initiativeValue}.`, this._initiativeRoll);
                        showMessage("systems/bolme/templates/chat/initiative-roll.html", data);

                    });
            } else {
                this._initiativeValue = RESULT_POSITION_MAP[actor.system.priority];
                console.log(`Generated initiative for '${actor.name}', value is ${this._initiativeValue}.`);
                this.update({initiative: this._initiativeValue});
            }
        } else {
            console.warn("Combatant actor not set, unable to generate initiative value.");
        }
        return(this);
    }
}
