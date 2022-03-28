function calculateCombatAbilityValue(ability, settings) {
	let value    = settings.startingPoints;
	let advances = settings.advancementPoints;

	while(advances > 0) {
		if(value > 0) {
			if(advances < value + 1) {
				throw(`Invalid advances value found for the '${ability}' ability. The next level of advancement would cost ${value+1} but there are only ${advances} points available.`);
			}
			advances -= value + 2;
			value++;
		} else {
			value++;
			advances--;
		}
	}

	return(value);
}

/**
 * Reduces a combat ability by a single point, restoring the starting or
 * advancement points that were spent to acquire the raise. Will not allow an
 * ability to be taken below -1.
 */
function decrementCombatAbility(actor, ability) {
	let data    = actor.data.data;
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let benefit;

        console.log("Advancment policing is on.");
		if(!data[ability]) {
			data[ability] = expandCombatAbility(actor.data, ability);
		}
		benefit = data[ability].decreaseRegain;

	    if(data[ability].value > -1) {
			let changes = {data: {combat: {},
		                          points: {}}};

		    if(data[ability].advancementPoints > 0) {
				changes.data.combat[ability] = {advancementPoints: data.combat[ability].advancementPoints - benefit};
				changes.data.points.advancement    = data.points.advancement + benefit;
		    } else {
				changes.data.combat[ability] = {startingPoints: data[ability].startingPoints - 1};
				changes.data.points.starting       = {combat: data.points.starting.combat + 1};
		    }
		    actor.update(changes);
	    } else {
	    	console.log(`Unable to lower the '${ability}' ability as combat abilities are not permitted to drop below -1.`);
	    	ui.notifications.error(game.i18n.format("bolme.errors.combatAbilities.decrement.forbidden", {minimum: -1}));
	    }
	} else {
		let changes = {data: {combat: {}}};

		console.log("Advancment policing is off.");
		changes.data.combat[ability] = {startingPoints: actor.data.data.combat[ability].startingPoints - 1};
		actor.update(changes);
	}
}

/**
 * This function takes a standard ability definition and expands upon it to
 * details things like the current ability value and whether the ability
 * can be upgrade or downgraded.
 */
function expandCombatAbility(character, ability) {
	let output = Object.assign({}, character.data.combat[ability]);

    output.value          = calculateCombatAbilityValue(ability, output);
    output.decreaseRegain = Math.abs(output.value);
    output.increaseCost   = Math.abs(output.value + 2);

    console.log(ability, "Expanded:", output);

	return(output);
}

/**
 * Checks that the starting/advancement points are available to increment a
 * combat ability then increments the ability by 1 and reduces the appropriate
 * points total as needed.
 */
function incrementCombatAbility(actor, ability) {
	let data = actor.data.data;
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let cost;

        console.log("Advancment policing is on.");
		if(!data[ability]) {
			data[ability] = expandCombatAbility(actor.data, ability);
		}
		cost = data[ability].increaseCost;

		if(data.points.starting.combat > 0 || data.points.advancement >= cost) {
			let changes = {data: {combat: {},
		                          points: {}}};

			if(data.points.starting.combat > 0) {
				let value = data.combat[ability].startingPoints + 1;

				if(value < 4) {
					changes.data.combat[ability] = {startingPoints: value};
					changes.data.points.starting = {combat: data.points.starting.combat - 1};
				} else {
					console.error(`You can't use starting points to increment a combat ability higher than 3.`);
					ui.notifications.error(game.i18n.localize("bolme.errors.combatAbilities.increment.starting"));
				}
			} else {
				changes.data.combat[ability]    = {advancementPoints: data.combat[ability].advancementPoints + cost};
				changes.data.points.advancement = data.points.advancement - cost;
			}
			actor.update(changes);
		} else {
			console.error(`Increment for the '${ability}' ability failed because their are no advancements available to cover the cost.`);
			ui.notifications.error(game.i18n.localize("bolme.errors.combatAbilities.increment.advancement"));
		}
	} else {
		let changes = {data: {combat: {}}};

		console.log("Advancment policing is off.");
		changes.data.combat[ability] = {startingPoints: actor.data.data.combat[ability].startingPoints + 1};
		actor.update(changes);
	}
}

export {decrementCombatAbility,
	    expandCombatAbility,
	    incrementCombatAbility};