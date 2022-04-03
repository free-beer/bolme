/**
 * Calculates the career rank given the number of starting and advancement
 * points that have been spent on it.
 */
function calculateCareerRank(name, settings) {
	let value   = settings.startingPoints - 1;
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let advances = settings.advancementPoints;

        console.log("Advancment policing is on.");
	    if(value < 0) {
	    	if(advances > 0) {
	    		value = 0;
	    		advances--;
	    	} else {
	    		console.warn(`Character has the '${name}' career but career has neither starting points or advancement points assigned to it.`);
	    		return(0);
	    	}
	    }

		while(advances > 0) {
			if(advances < (value + 1)) {
				throw(`Invalid advances value found for the '${name}' career. The next level of advancement would cost ${value+1} but there are only ${advances} points available.`);
			}
			advances -= value + 1;
			value++;
		}
	}

	return(value);
}

/**
 * Called when a career is first added to an actor to assign the appropriate
 * cost to the actors starting or career points.
 */
function careerAddedToCharacter(actor, career) {
	let expanded = expandCareer(career);
	let policed  = game.settings.get("bolme", "policeAdvancements");

	if(policed) {
		let data = actor.data.data;

        console.log("Advancment policing is on.");
	    if(data.points.starting.careers > 0) {
	    	console.log("Career is being paid for with starting points.");
	    	career.update({data: {startingPoints: 1}});
	    	actor.update({data: {points: {starting: {careers: data.points.starting.careers - 1}}}});
	    } else if(data.points.advancement > 0) {
	    	console.log("Career is being paid for with advancement points.");
	    	career.update({data: {advancementPoints: 1}});
	    	actor.update({data: {points: {advancement: data.points.advancement - 1}}});
	    } else {
	    	console.log(`Cannot add the ${career.name} career as their are insufficient points to pay for it.`);
	    	ui.notifications.error(game.i18n.localize("bolme.errors.careers.unaffordable"));
	    	actor.deleteEmbeddedDocuments("Item", [career.id]);
	    }
	} else {
		console.log("Advancment policing is off.");
		career.update({data: {advancementPoints: 1}});
	}
}

/**
 * This function checks whether a career is anywhere above minimum rank and, if
 * it is, reduces the rank by 1, restoring any points spent in acquiring the
 * rank.
 */
function decrementCareerRank(actor, careerId) {
	let career = actor.items.find((e) => e.id === careerId);

	if(career) {
		let expanded = expandCareer(career);

		if(expanded.rank > 0) {
			let data    = actor.data.data;
			let policed = game.settings.get("bolme", "policeAdvancements");

			if(policed) {
				let actorChanges  = {data: {points: {}}};
				let careerChanges = {data: {}};

                console.log("Advancment policing is on.");
				if(career.data.data.advancementPoints > 0) {
					console.log("Decrementing career rank to return advancement points.");
					actorChanges.data.points.advancement = data.points.advancement + expanded.decreaseRegain;
					careerChanges.data.advancementPoints = career.data.data.advancementPoints - expanded.decreaseRegain;
				} else {
					console.log("Decrementing career rank to return starting points.");
					actorChanges.data.points.starting = {careers: data.points.starting.careers + 1};
					careerChanges.data.startingPoints = career.data.data.startingPoints - 1;
				}

				actor.update(actorChanges);
				career.update(careerChanges);
			} else {
				console.log("Advancment policing is off.");
				career.update({data: {startingPoints: career.data.data.startingPoints - 1}});
			}
		} else {
			ui.notifications.error(game.i18n.localize("bolme.errors.careers.minedOut"));
		}
	} else {
		console.error(`Unable to locate career id ${careerId} on actor id ${actor.id} (${actor.name}).`);
	}	
}

/**
 * Deletes a career from a character, returning the points spent on the career
 * to the characters pool.
 */
function deleteCareer(actor, careerId) {
	let career = actor.items.find((e) => e.id === careerId);

	if(career) {
		let policed = game.settings.get("bolme", "policeAdvancements");

		actor.deleteEmbeddedDocuments("Item", [careerId]);

		if(policed) {
			actor.update({data: {points: {advancement: actor.data.data.points.advancement + career.data.data.advancementPoints,
			                              starting: {careers: actor.data.data.points.starting.careers + career.data.data.startingPoints}}}});
		}
	} else {
		console.error(`Unable to locate career id ${careerId} on actor id ${actor.id} (${actor.name}).`);
	}
}

/**
 * Generates an 'expanded' career object containing the base career details plus
 * things like rank and name.
 */
function expandCareer(career) {
	let output = Object.assign({}, career);

	output.rank           = calculateCareerRank(career.name, career.data.data);
    output.decreaseRegain = (output.rank > 0 ? output.rank : 0);
    output.id             = career.id;
    output.increaseCost   = output.rank + 1;
    output.name           = career.name;

	return(output);
}

/**
 * Creates an array of 'expanded' career objects based on the items possessed by
 * an actor.
 */
function generateCareerList(actor) {
	let list = [];

	actor.items.forEach((item) => {
		if(item.type === "career") {
			list.push(expandCareer(item));
		}
	});

	return(list);
}

/**
 * This function checks whether sufficient starting or advancement points are
 * available to allow for a rank increase with a career. If the points are
 * available the career is increased and the record of the points spent is
 * made.
 */
function incrementCareerRank(actor, careerId) {
	let career = actor.items.find((e) => e.id === careerId);

	if(career) {
		let expanded = expandCareer(career);

		if(expanded.rank < 5) {
			let data    = actor.data.data;
			let policed = game.settings.get("bolme", "policeAdvancements");

            if(policed) {
				let changed       = false;
				let actorChanges  = {data: {points: {}}};
				let careerChanges = {data: {}};

 
                console.log("Advancment policing is on.");
				if(data.points.starting.careers > 0) {
					console.log("Incrementing career rank using starting points.");
					if(expanded.rank < 3) {
						actorChanges.data.points.starting = {careers: data.points.starting.careers - 1};
						careerChanges.data.startingPoints = career.data.data.startingPoints + 1;
						changed                           = true;
					} else {
						ui.notifications.error(game.i18n.localize("bolme.errors.careers.maxStart"));
					}
				} else if(data.points.advancement >= expanded.increaseCost) {
					console.log("Incrementing career rank using advancement points.");
					actorChanges.data.points.advancement = data.points.advancement - expanded.increaseCost;
					careerChanges.data.advancementPoints = career.data.data.advancementPoints + expanded.increaseCost;
					changed                              = true;
				} else {
					console.log(`Unable to increase the rank of the ${expanded.name} career as it costs more than is currently available.`);
					ui.notifications.error(game.i18n.localize("bolme.errors.careers.advancement"));
				}

				if(changed) {
					actor.update(actorChanges);
					career.update(careerChanges);
				}
			} else {
				console.log("Advancment policing is off.");
				career.update({data: {startingPoints: career.data.data.startingPoints + 1}});
			}
		} else {
			ui.notifications.error(game.i18n.localize("bolme.errors.careers.maxedOut"));
		}
	} else {
		console.error(`Unable to locate career id ${careerId} on actor id ${actor.id} (${actor.name}).`);
	}
}

export {careerAddedToCharacter,
	    decrementCareerRank,
	    deleteCareer,
	    expandCareer,
	    generateCareerList,
	    incrementCareerRank};