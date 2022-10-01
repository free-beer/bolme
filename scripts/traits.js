/**
 * Handles the addition of a boon to a character by subtracting the appropriate
 * number of points, either starting or advancement, from the character and
 * adding them to the boon.
 */
function boonAddedToCharacter(actor, trait) {
	let data = actor.system;

	if(data.points.starting.traits > 0) {
		actor.update({data: {points: {starting: {traits: data.points.starting.traits - 1}}}});
		trait.update({data: {startingPoints: 1}});
	} else if(data.points.advancement > 1) {
		actor.update({data: {points: {advancement: data.points.advancement - 2}}});
		trait.update({data: {advancementPoints: 2}});
	} else {
    	ui.notifications.error(game.i18n.localize("bolme.errors.traits.unaffordable"));
    	actor.deleteEmbeddedDocuments("Item", [trait.id]);
	}
}

/**
 * Handles the removal of a boon from a character by restoring the starting or
 * advancement points spent to acquire it.
 */
function boonRemovedFromCharacter(actor, traitId) {
	let trait = actor.items.find((e) => e.id === traitId);

	if(trait) {
		let actorChanges = {system: {points: {}}};
		let data         = actor.system;

		if(trait.system.startingPoints > 0) {
			actorChanges.system.points.starting = {traits: data.points.starting.traits + trait.system.startingPoints};
		} else if(trait.system.advancementPoints > 0) {
			actorChanges.system.points.advancement = data.points.advancement + trait.system.advancementPoints;
		}

		actor.deleteEmbeddedDocuments("Item", [traitId]);
		actor.update(actorChanges);
	} else {
		console.error(`Unable to locate a boon with the id '${traitId}' on character id '${actor.id}' (${actor.name}).`);
	}
}

/**
 * Handles the addition of a flaw to a character by granting the character 2
 * advancement points.
 */
function flawAddedToCharacter(actor, trait) {
	let data = actor.system;

	actor.update({data: {points: {advancement: data.points.advancement + 2}}});
}

/**
 * Handles the removal of a flaw from a character by charging the character the
 * appropriate amount of advancement points for it's removal, preventing the
 * removal if the character cannot pay.
 */
function flawRemovedFromCharacter(actor, traitId) {
	let trait = actor.items.find((e) => e.id === traitId);

	if(trait) {
		let data = actor.system;

		if(data.points.advancement > 1) {
			actor.deleteEmbeddedDocuments("Item", [traitId]);
			actor.update({data: {points: {advancement: data.points.advancement - 2}}});
		} else {
			ui.notifications.error(game.i18n.localize("bolme.errors.traits.flaw.unaffordable"));
		}
	} else {
		console.error(`Unable to locate a flaw with the id '${traitId}' on character id '${actor.id}' (${actor.name}).`);
	}
}

/**
 * An action function that gets invoked whenever a trait is added to a
 * character sheet.
 */
function traitAddedToCharacter(actor, trait) {
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		if(trait.system.type === "boon") {
			boonAddedToCharacter(actor, trait);
		} else {
			flawAddedToCharacter(actor, trait);
		}
	}
}

/**
 * An action function that gets invoked whenever a trait is removed from a
 * character sheet.
 */
function traitRemovedFromCharacter(actor, traitId) {
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let trait = actor.items.find((e) => e.id === traitId);

		if(trait.system.type === "boon") {
			boonRemovedFromCharacter(actor, traitId);
		} else {
			flawRemovedFromCharacter(actor, traitId);
		}
	}
}

export {traitAddedToCharacter,
	    traitRemovedFromCharacter};