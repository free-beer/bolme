/**
 * This function resets an actors arcane points to their maximum value.
 */
function resetArcanePoints(actorId) {
	let actor = game.actors.find((a) => a.id === actorId);

	if(actor) {
	    actor.update({data: {arcanePoints: {value: actor.system.arcanePoints.max}}});
	} else {
		console.error(`Unable to locate an actor with the id '${actorId}'.`);
	}
}

export {resetArcanePoints};
