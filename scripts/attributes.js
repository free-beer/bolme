/**
 * Calculate the current value for an attribute based on the amount of starting
 * and advancement points that have been spent on it.
 */
function calculateAttributeValue(attribute, settings) {
	let value    = settings.startingPoints;
	let advances = settings.advancementPoints;

	while(advances > 0) {
		if(value > 0) {
			if(advances < (value * 2) + 1) {
				throw(`Invalid advances value found for the '${attribute}' attribute. The next level of advancement would cost ${(value*2)+1} but there are only ${advances} points available.`);
			}
			advances -= (value * 2) + 1;
			value++;
		} else {
			value++;
			advances--;
		}
	}

	return(value);
}

/**
 * Reduces an attribute by a single point, restoring the starting or advancement
 * points that were spent to acquire the raise. Will not allow attributes to be
 * taken below -1.
 */
function decrementAttribute(actor, attribute) {
	let data    = actor.data.data;
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let benefit;

        console.log("Advancment policing is on.");
		if(!data[attribute]) {
			data[attribute] = expandAttribute(actor.data, attribute);
		}
		benefit = data[attribute].decreaseRegain;

	    if(data[attribute].value > -1) {
			let changes = {data: {attributes: {},
		                          points: {}}};

		    if(data[attribute].advancementPoints > 0) {
				changes.data.attributes[attribute] = {advancementPoints: data.attributes[attribute].advancementPoints - benefit};
				changes.data.points.advancement    = data.points.advancement + benefit;
		    } else {
				changes.data.attributes[attribute] = {startingPoints: data[attribute].startingPoints - 1};
				changes.data.points.starting       = {attributes: data.points.starting.attributes + 1};
		    }
		    actor.update(changes);
	    } else {
	    	console.log(`Unable to lower the '${attribute}' attribute as attributes are not permitted to drop below -1.`);
	    	ui.notifications.error(game.i18n.format("bolme.errors.attributes.decrement.forbidden", {minimum: -1}));
	    }
	} else {
		let changes = {data: {attributes: {}}};

		console.log("Advancment policing is off.");
		changes.data.attributes[attribute] = {startingPoints: actor.data.data.attributes[attribute].startingPoints - 1};
		actor.update(changes);
	}
}

/**
 * This function takes a standard attribute definition and expands upon it to
 * details things like the current attribute value and whether the attribute
 * can be upgrade or downgraded.
 */
function expandAttribute(character, attribute) {
	let output = Object.assign({}, character.data.attributes[attribute]);

    output.value          = calculateAttributeValue(attribute, output);
    output.decreaseRegain = Math.abs(((output.value - 1) * 2) + 1);
    output.increaseCost   = Math.abs((output.value * 2) + 1);

    console.log(attribute, "Expanded:", output);

	return(output);
}

/**
 * Checks that the starting/advancement points are available to increment an
 * attribute then increments the attribute by 1 and reduces the appropriate
 * points total as needed.
 */
function incrementAttribute(actor, attribute) {
	let data    = actor.data.data;
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let cost;

        console.log("Advancment policing is on.");
		if(!data[attribute]) {
			data[attribute] = expandAttribute(actor.data, attribute);
		}
		cost  = data[attribute].increaseCost;

		if(data.points.starting.attributes > 0 || data.points.advancement >= cost) {
			let changes = {data: {attributes: {},
		                          points: {}}};

			if(data.points.starting.attributes > 0) {
				let value = data.attributes[attribute].startingPoints + 1;

				if(value < 4) {
					changes.data.attributes[attribute] = {startingPoints: value};
					changes.data.points.starting       = {attributes: data.points.starting.attributes - 1};
				} else {
					console.error(`You can't use starting points to increment an attribute higher than 3.`);
					ui.notifications.error(game.i18n.localize("bolme.errors.attributes.increment.starting"));
				}
			} else {
				changes.data.attributes[attribute] = {advancementPoints: data.attributes[attribute].advancementPoints + cost};
				changes.data.points.advancement    = data.points.advancement - cost;
			}
			actor.update(changes);
		} else {
			console.error(`Increment for the '${attribute}' attribute failed because their are no advancements available to cover the cost.`);
			ui.notifications.error(game.i18n.localize("bolme.errors.attributes.increment.advancement"));
		}
	} else {
		let changes = {data: {attributes: {}}};

		console.log("Advancment policing is off.");
		changes.data.attributes[attribute] = {startingPoints: actor.data.data.attributes[attribute].startingPoints + 1};
		actor.update(changes);
	}
}

export {decrementAttribute,
	    expandAttribute,
        incrementAttribute};