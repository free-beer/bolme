import constants from "./constants.js";
import {isInitiativeChangeAllowed,
	    RESULT_POSITION_MAP} from "./combat.js";

/**
 * Applies common event handlers for elements within a chat message that is
 * being logged to the chat roller.
 */
function applyCommonChatEventHandlers(rootNode) {
	rootNode.querySelectorAll(".expander").forEach((node) => {
		let header = node.children[0];
		let toggle = node.children[1];

		header.addEventListener("click", (event) => {
			if(toggle.classList.contains("hidden")) {
				toggle.classList.remove("hidden");
			} else {
				toggle.classList.add("hidden");
			}
		});
	});
}

/**
 * This function is invoked whenever a chat message relating to an initiative
 * roll is generated. It sets up event handlers for the message.
 */
function applyInitiativeRollEventHandlers(messageRoot) {
    let buttons = messageRoot.querySelectorAll(".upgrade-button");

    messageRoot.querySelectorAll(".downgrade-button").forEach((button) => {
    	button.addEventListener("click", (e) => onInitiativeDowngrade(e, messageRoot));
    });

    messageRoot.querySelectorAll(".upgrade-button").forEach((button) => {
    	button.addEventListener("click", (e) => onInitiativeUpgrade(e, messageRoot));
    });

    messageRoot.querySelectorAll(".reroll-button").forEach((button) => {
    	button.addEventListener("click", (e) => onInitiativeReroll(e, messageRoot));
    });
}

/**
 * This function is used when a character with a failure initiative roll wants
 * to downgrade it to a calmitous failure, gaining 1 hero point for doing so.
 */
function onInitiativeDowngrade(event, messageRoot) {
	event.preventDefault();
	let actorId = messageRoot.dataset.actor;
	let actor   = game.actors.find((a) => a.id === actorId);

    if(actor) {
    	let result = event.currentTarget.dataset.result;

		if(isInitiativeChangeAllowed(actor, result, "downgrade")) {
			let combatId  = messageRoot.dataset.combat;
			let combat    = Array.from(game.combats).find((c) => c.id === combatId);

			if(combat) {
				let combatant = combat.getCombatantByActor(actor.id);

                if(result === "failure") {
					combat.setInitiative(combatant.id, RESULT_POSITION_MAP["calamitous"]);
					actor.update({data: {heroPoints: actor.data.data.heroPoints + 1}});
					removeInitiativeOptions(messageRoot);
				}
			} else {
				console.error(`Unable to locate a combat with the id '${combatId}'.`);
				ui.notifications.error(game.i18n.localize("bolme.errors.combat.combat.notFound"));
			}
		}
	} else {
		ui.notifications.error(game.i18n.localize("bolme.errors.combat.actor.notFound"));
	}
}

function onInitiativeReroll(event, messageRoot) {
	event.preventDefault();
	let combat = Array.from(game.combats).find((c) => c.id === event.currentTarget.dataset.combat);

	if(combat) {
		let combatant = Array.from(combat.combatants).find((c) => c.id === event.currentTarget.dataset.combatant);

		if(combatant) {
			let result = event.currentTarget.dataset.result;

			if(isInitiativeChangeAllowed(combatant.actor, result, "reroll")) {
				combatant.rollInitiative("~").then(() => {
					let actor = combatant.actor;

					combatant = Array.from(combat.combatants).find((c) => c.id === event.currentTarget.dataset.combatant);
					combat.updateEmbeddedDocuments("Combatant", [{_id: combatant.id, initiative: combatant.initiative}]);
					actor.update({data: {heroPoints: actor.data.data.heroPoints - 1}});
				});
				removeInitiativeOptions(messageRoot);
			}
		} else {
			console.warn(`Unable to locate combatant id '${event.currentTarget.dataset.combatant}' in combat id '${combat.id}'.`);
		}
	} else {
		console.warn(`Unable to locate combat id '${event.currentTarget.dataset.combat}'.`);
	}
}

/**
 * This function is used when a character with a success or mighty success
 * initiative roll wants to upgrade it at the cost of 1 hero point.
 */
function onInitiativeUpgrade(event, messageRoot) {
	event.preventDefault();
	let actorId = messageRoot.dataset.actor;
	let actor   = game.actors.find((a) => a.id === actorId);

    if(actor) {
    	let result = event.currentTarget.dataset.result;

		if(isInitiativeChangeAllowed(actor, result, "upgrade")) {
			let combatId  = messageRoot.dataset.combat;
			let combat    = Array.from(game.combats).find((c) => c.id === combatId);

			if(combat) {
				let combatant = combat.getCombatantByActor(actor.id);

                if(["mighty", "success"].includes(result)) {
                	let newSetting = (result === "success" ? RESULT_POSITION_MAP["mighty"] : RESULT_POSITION_MAP["legendary"]);

					combat.setInitiative(combatant.id, newSetting);
					actor.update({data: {heroPoints: actor.data.data.heroPoints - 1}});
					removeInitiativeOptions(messageRoot);
				}
			} else {
				console.error(`Unable to locate a combat with the id '${combatId}'.`);
				ui.notifications.error(game.i18n.localize("bolme.errors.combat.combat.notFound"));
			}
		}
	} else {
		ui.notifications.error(game.i18n.localize("bolme.errors.combat.actor.notFound"));
	}
}

/**
 * Eliminates the initiative change buttons from an initiative roll chat message
 * which prevents them from being reused.
 */
function removeInitiativeOptions(messageRoot) {
	let element = messageRoot.querySelector(".initiative-options");

	if(element) {
		element.remove();
	}
}

/**
 * This function does the actual work of showing a chat message on the
 * Foundry UI.
 */
function showMessage(templateKey, data, settings={}) {
    getTemplate(templateKey)
        .then((template) => {
            let message = {content: template(data, {allowProtoMethodsByDefault: true}),
            	           speaker: ChatMessage.getSpeaker(),
                           user:    game.user};

            ChatMessage.create(message);
        })
        .catch((error) => {
        	console.error("Show message failed. Error:", error);
        });
}

export {applyCommonChatEventHandlers,
	    applyInitiativeRollEventHandlers,
	    showMessage};
