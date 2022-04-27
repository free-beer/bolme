import {calculateAttributeValue} from "./attributes.js";
import {calculateCombatAbilityValue} from "./combat_abilities.js";

const RESULT_POSITION_MAP = {
	legendary:  7,
	mighty:     6,
	success:    5,
	villain:    4,
	tough:      3,
    failure:    2,
	rabble:     1,
    calamitous: 0
};

/**
 * Create a Roll instance for the initiative roll for a given actor. This
 * function returns a promise that returns the Roll object when it is realized. 
 */
function generateCharacterInitiativeRoll(actor, modifier=0) {
	let mind          = calculateAttributeValue("mind", actor.data.data.attributes.mind);
	let initiative    = calculateCombatAbilityValue("initiative", actor.data.data.combat.initiative);
	let totalModifier = mind + initiative + modifier;
	let formula;

	if(totalModifier !== 0) {
		if(totalModifier > 0) {
			formula = `2d6 + ${totalModifier}`;
		} else {
			formula = `2d6 - ${Math.abs(totalModifier)}`;
		}
	}

	return(new Roll(formula));
}

/**
 * Used to determine whether a change to initiative is permitted. Has some
 * variable functionality depending on whether it's an upgradem, downgrade or
 * reroll. This also checks that there is an existing, on-started combat before
 * the change is allowed.
 */
function isInitiativeChangeAllowed(actor, result, type) {
	let allowed = false;
	let combats = Array.from(game.combats);

	if(combats.length > 0) {
		let combat  = combats[combats.length - 1];

		if(combat) {
			if(!combat.started) {
				if(actor.data.data.heroPoints > 0) {
					let combatant = combat.getCombatantByActor(actor.id);

					if(combatant) {
						if(type === "upgrade") {
							if(result === "success" || result === "mighty") {
								allowed = true;
							} else {
								ui.notifications.error(game.i18n.localize("bolme.errors.combat.update.impossible"));
							}
						} else if(type === "downgrade") {
							if(result === failure) {
								allowed = true;
							} else {
								ui.notifications.error(game.i18n.localize("bolme.errors.combat.update.impossible"));
							}
						} else {
							if(result === "failure") {
								allowed = true;
							} else {
								ui.notifications.error(game.i18n.localize("bolme.errors.combat.update.impossible"));
							}
						}
					} else {
						ui.notifications.error(game.i18n.localize("bolme.errors.combat.actors.notCombatant"));
					}
				} else {
					ui.notifications.error(game.i18n.localize("bolme.errors.combat.actor.noHeroPoints"));
				}
			} else {
				ui.notifications.error(game.i18n.localize("bolme.errors.combat.alreadyStarted"));
			}
		} else {
			ui.notifications.error(game.i18n.localize("bolme.errors.combat.notFound"));
		}
	}

	return(allowed);
}

/**
 * Used to downgrade an actor current initiative value. Can only to be used with
 * characters and only on characters that have a failed initiative result (i.e.
 * some one who wants a calamitous failure result). Grants an automatic +1 hero
 * point.
 */
function onDowngradeInitiativeClicked(event) {
	let actorId = event.currentTarget.dataset.actor;
	let actor   = game.actors.filter((a) => a.id === actorId);

	if(isInitiativeChangeAllowed(actor, event.currentTarget.dataset.result, "upgrade")) {
		let combatant = combat.getCombatantByActor(actor.id);

		combat.setInitiative(combatant.id, 7);
		actor.update({data: {heroPoints: actor.data.data.heroPoints + 1}});
	} else {
		ui.notifications.error(game.i18n.localize("bolme.errors.combat.actor.notFound"));
	}
}

/**
 * Used to upgrade an actor current initiative value. Can only to be used with
 * characters and only on characters that have a success or mighty initiative
 * result . Applies an automatic 1 hero point cost to the character.
 */
function onUpgradeInitiativeClicked(event) {
	let actorId = event.currentTarget.dataset.actor;
	let actor   = game.actors.filter((a) => a.id === actorId);

	if(isInitiativeChangeAllowed(actor, event.currentTarget.dataset.result, "upgrade")) {
		let combatant = combat.getCombatantByActor(actor.id);

		combat.setInitiative(combatant.id, (result === "success" ? RESULT_POSITION_MAP["mighty"] : RESULT_POSITION_MAP["legendary"]));
		actor.update({data: {heroPoints: actor.data.data.heroPoints - 1}});
	} else {
		ui.notifications.error(game.i18n.localize("bolme.errors.combat.actor.notFound"));
	}
}

function onRerollInitiativeClicked() {
	// TBD!!!
}

class BoLMECombat extends Combat {
	constructor(options) {
		super(options);
	}

	 async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
	 	if(ids.length > 0) {
	 		let combatants = this.combatants.filter((c) => ids.includes(c.id));
	 		Promise.all(combatants.map((c) => c.rollInitiative("")))
	 		    .then(() => {
			 		let changes = combatants.map((combatant) => {
			 			return({_id: combatant.id, initiative: combatant.initiativeValue});
			 		});

			 		this.updateEmbeddedDocuments("Combatant", changes);
	 		    })
	 		    .then(() => {
	 		    	this.update({combatants: this.combatants.toJSON(), round: this.round, turn: this.turn});
	 		    });
		 }
	 }

	nextTurn() {
	 	let turn = this.turn;
	 	let combatants  = this._orderedCombatants;

	 	if(this.round == 1 && this._toughsAndRabbleDumbfounded) {
	 		turn++;
	 		while(turn < combatants.length && ["rabble", "tough"].includes(combatants[turn].initiativeLevel)) {
	 			turn++;
	 		}

	 		if(turn >= combatants.length) {
	 			this.nextRound();
	 		} else {
	 			this.update({turn: turn});
	 		}
	 	} else {
	 		super.nextTurn();
	 	}
	}

	previousRound() {
		if(this.round == 2 && this._toughsAndRabbleDumbfounded) {
			let combatants = this._orderedCombatants;
			let levels     = combatants.map((c) => c.initiativeLevel);
			let turn       = levels.length - 1;

			while(turn > 0 && ["rabble", "tough"].includes(levels[turn])) {
				turn--;
			}

			this.update({round: 1, turn: turn});
		} else {
			super.previousRound();
		}
	}

	previousTurn() {
		if(this.round == 1 && this._toughsAndRabbleDumbfounded) {
			if(this.turn > 0) {
				let levels = this._orderedCombatants.slice(0, this.turn).map((c) => c.initiativeLevel);
				let turn   = levels.length - 1;

				while(turn > 0 && ["rabble", "tough"].includes(levels[turn])) {
					turn--;
				}

				this.update({turn: turn});
			} else {
				super.previousTurn();
			}
		} else {
			super.previousTurn();
		}
	}

	setupTurns() {
        return(this.turns = this._orderedCombatants);
	}

	get _orderedCombatants() {
        return(Array.from(this.combatants).sort((lhs, rhs) => {
                	if(lhs.initiative && rhs.initiative) {
                		return(lhs.initiative - rhs.initiative);
                	} else if(lhs.initiative) {
                		return(-1);
                	} else if(rhs.initiative) {
                		return(1);
                	} else {
                		return(lhs.name.localeCompare(rhs.name) * -1);
                	}
                }).reverse());
	}

	get _toughsAndRabbleDumbfounded() {
		let index = Array.from(this.combatants).findIndex((combatant) => {
			return([RESULT_POSITION_MAP["legendary"],
				    RESULT_POSITION_MAP["mighty"]].includes(combatant.initiative));
		});

		return(index !== -1);
	}
}

export {BoLMECombat,
	    generateCharacterInitiativeRoll,
	    onRerollInitiativeClicked,
	    onDowngradeInitiativeClicked,
        onUpgradeInitiativeClicked,
        RESULT_POSITION_MAP};
