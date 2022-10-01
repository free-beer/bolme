/**
 * Calculates the career rank given the number of starting and advancement
 * points that have been spent on it.
 */
function calculateCareerRank(name, settings, ignorePolicing=false) {
	let value   = settings.startingPoints - 1;
	let policed = game.settings.get("bolme", "policeAdvancements");

	if(!ignorePolicing && policed) {
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
	let updates  = {system: {}};
	let other;

	other = findHighestRankeCareerWithGrant(actor, "arcane");
	if(other) {
		updates.system.arcanePoints = {max: 10 + other.rank};
	}

	other = findHighestRankeCareerWithGrant(actor, "crafting");
	if(other) {
		updates.system.craftingPoints = {max: other.rank};
	}

	other = findHighestRankeCareerWithGrant(actor, "fate");
	if(other) {
		updates.system.fatePoints = {max: other.rank};
	}

	if(policed) {
		let data    = actor.data.data;

        console.log("Advancment policing is on.");
	    if(data.points.starting.careers > 0) {
	    	console.log("Career is being paid for with starting points.");
	    	career.update({data: {startingPoints: 1}});
	    	updates.system.points = {starting: {careers: data.points.starting.careers - 1}};
	    } else if(data.points.advancement > 0) {
	    	console.log("Career is being paid for with advancement points.");
	    	career.update({data: {advancementPoints: 1}});
	    	updates.system.points = {points: {advancement: data.points.advancement - 1}};
	    } else {
	    	console.log(`Cannot add the ${career.name} career as their are insufficient points to pay for it.`);
	    	ui.notifications.error(game.i18n.localize("bolme.errors.careers.unaffordable"));
	    	actor.deleteEmbeddedDocuments("Item", [career.id]);
	    }
	} else {
		console.log("Advancment policing is off.");
		career.update({data: {advancementPoints: 1}});
	}

	if(updates.system !== {}) {
		actor.update(updates);
	}
}

/**
 * This function checks whether a career is anywhere above minimum rank and, if
 * it is, reduces the rank by 1, restoring any points spent in acquiring the
 * rank.
 */
function decrementCareerRank(actor, careerId, ignorePolicing=false) {
	let career = actor.items.find((e) => e.id === careerId);

	if(career) {
		let expanded = expandCareer(career, ignorePolicing);

		if(expanded.rank > 0) {
			let actorChanges = {system: {}};
			let data         = actor.system;
			let policed      = game.settings.get("bolme", "policeAdvancements");

            // Check for arcane points affecting changes.
			if(expanded.grants.arcane && actor.type === "Character") {
				let role = findHighestRankeCareerWithGrant(actor, "arcane");
				actorChanges.arcanePoints = {max: 10 + role.rank};
			}

            // Check for crafting points affecting changes.
			if(expanded.grants.crafting && actor.type === "Character") {
				let role = findHighestRankeCareerWithGrant(actor, "crafting");
				actorChanges.craftingPoints = {max: role.rank};
			}

            // Check for fate points affecting changes.
			if(expanded.grants.fate && actor.type === "Character") {
				let role = findHighestRankeCareerWithGrant(actor, "fate");
				actorChanges.fatePoints = {max: role.rank};
			}

			if(!ignorePolicing && policed) {
				let careerChanges = {system: {}};

                console.log("Advancment policing is on.");
                actorChanges.system.points = {};
				if(career.system.advancementPoints > 0) {
					console.log("Decrementing career rank to return advancement points.");
					actorChanges.system.points.advancement = data.points.advancement + expanded.decreaseRegain;
					careerChanges.system.advancementPoints = career.data.data.advancementPoints - expanded.decreaseRegain;
				} else {
					console.log("Decrementing career rank to return starting points.");
					actorChanges.system.points.starting = {careers: data.points.starting.careers + 1};
					careerChanges.system.startingPoints = career.system.startingPoints - 1;
				}

				career.update(careerChanges);
			} else {
				console.log("Advancment policing is off.");
				career.update({data: {startingPoints: career.system.startingPoints - 1}});
			}

			actor.update(actorChanges);
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
		let updates = {system: {}};
		let alternative;

        // Check if the career granted arcane points.
        if(career.system.grants.arcane) {
			let alternative = findHighestRankeCareerWithGrant(actor, "arcane")

			if(alternative) {
				updates.system.arcanePoints = {max: 10 + alternative.rank};
			} else {
				updates.system.arcanePoints = {max: 0, value: 0};
			}
		}

        // Check if the career granted crafting points.
        if(career.system.grants.crafting) {
			let alternative = findHighestRankeCareerWithGrant(actor, "crafting")

			if(alternative) {
				updates.system.craftingPoints = {max: alternative.rank};
			} else {
				updates.system.craftingPoints = {max: 0, value: 0};
			}
		}

        // Check if the career granted fate points.
        if(career.system.grants.fate) {
			let alternative = findHighestRankeCareerWithGrant(actor, "fate")

			if(alternative) {
				updates.system.fatePoints = {max: alternative.rank};
			} else {
				updates.system.fatePoints = {max: 0, value: 0};
			}
		}

		actor.deleteEmbeddedDocuments("Item", [careerId]);

		if(policed) {
			updates.system.points = {advancement: actor.system.points.advancement + career.system.advancementPoints,
			                       starting: {careers: actor.system.points.starting.careers + career.system.startingPoints}};
		}

		if(updates.system !== {}) {
		    actor.update(updates);
		}
	} else {
		console.error(`Unable to locate career id ${careerId} on actor id ${actor.id} (${actor.name}).`);
	}
}

/**
 * Generates an 'expanded' career object containing the base career details plus
 * things like rank and name.
 */
function expandCareer(career, ignorePolicing=false) {
	let output = Object.assign({}, career);

	output.rank           = calculateCareerRank(career.name, career.system, ignorePolicing);
    output.decreaseRegain = (output.rank > 0 ? output.rank : 0);
    output.grants         = career.system.grants;
    output.id             = career.id;
    output.increaseCost   = output.rank + 1;
    output.name           = career.name;

	return(output);
}

/**
 * Finds the highest ranked career possessed by an actor that grants one of
 * arcane points, crafting points or fate points. Returns undefined if the actor
 * has no careers that grant the appropriate point types. The career returned
 * from this function is the expanded form.
 */
function findHighestRankeCareerWithGrant(actor, grant) {
	let career;

	actor.items.forEach((item) => {
		if(item.type === "career") {
			if(item.system.grants[grant]) {
				let expanded = expandCareer(item);

				if(career) {
					if(career.rank < expanded.rank) {
						career = expanded;
					}
				} else {
					career = expanded;
				}
			}
		}
	});

	return(career);
}

/**
 * Creates an array of 'expanded' career objects based on the items possessed by
 * an actor.
 */
function generateCareerList(actor, ignorePolicing=false) {
	let list = [];

	actor.items.forEach((item) => {
		if(item.type === "career") {
			list.push(expandCareer(item, ignorePolicing));
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
function incrementCareerRank(actor, careerId, ignorePolicing=false) {
	let career = actor.items.find((e) => e.id === careerId);

	if(career) {
		let expanded = expandCareer(career, ignorePolicing);

		if(expanded.rank < 5) {
			let actorChanges  = {system: {points: {}}};
			let data          = actor.system;
			let policed       = game.settings.get("bolme", "policeAdvancements");

            // Check for arcane point affecting changes.
			if(expanded.grants.arcane && actor.type === "Character") {
				let role    = findHighestRankeCareerWithGrant(actor, "arcane");
				let newRank = expanded.rank + 1;

				if(role.id != expanded.id && role.rank > newRank) {
					newRank = role.rank;
				}
				actorChanges.system.arcanePoints = {max: 10 + newRank};
			}

            // Check for crafting point affecting changes.
			if(expanded.grants.crafting && actor.type === "Character") {
				let role    = findHighestRankeCareerWithGrant(actor, "crafting");
				let newRank = expanded.rank + 1;

				if(role.id != expanded.id && role.rank > newRank) {
					newRank = role.rank;
				}
				actorChanges.system.craftingPoints = {max: newRank};
			}

            // Check for arcane point affecting changes.
			if(expanded.grants.fate && actor.type === "Character") {
				let role    = findHighestRankeCareerWithGrant(actor, "fate");
				let newRank = expanded.rank + 1;

				if(role.id != expanded.id && role.rank > newRank) {
					newRank = role.rank;
				}
				actorChanges.system.fatePoints = {max: newRank};
			}

            if(!ignorePolicing && policed) {
				let changed       = false;
				let careerChanges = {data: {}};
 
                console.log("Advancment policing is on.");
				if(data.points.starting.careers > 0) {
					console.log("Incrementing career rank using starting points.");
					if(expanded.rank < 3) {
						actorChanges.system.points.starting = {careers: data.points.starting.careers - 1};
						careerChanges.system.startingPoints = career.system.startingPoints + 1;
						changed                           = true;
					} else {
						ui.notifications.error(game.i18n.localize("bolme.errors.careers.maxStart"));
					}
				} else if(data.points.advancement >= expanded.increaseCost) {
					console.log("Incrementing career rank using advancement points.");
					actorChanges.system.points.advancement = data.points.advancement - expanded.increaseCost;
					careerChanges.system.advancementPoints = career.system.advancementPoints + expanded.increaseCost;
					changed                              = true;
				} else {
					console.log(`Unable to increase the rank of the ${expanded.name} career as it costs more than is currently available.`);
					ui.notifications.error(game.i18n.localize("bolme.errors.careers.advancement"));
				}

				if(changed) {
					career.update(careerChanges);
				}
			} else {
				console.log("Advancment policing is off.");
				career.update({data: {startingPoints: career.system.startingPoints + 1}});
			}

			if(actorChanges.system !== {}) {
				actor.update(actorChanges);
			}
		} else {
			ui.notifications.error(game.i18n.localize("bolme.errors.careers.maxedOut"));
		}
	} else {
		console.error(`Unable to locate career id ${careerId} on actor id ${actor.id} (${actor.name}).`);
	}
}

export {calculateCareerRank,
	    careerAddedToCharacter,
	    decrementCareerRank,
	    deleteCareer,
	    expandCareer,
	    findHighestRankeCareerWithGrant,
	    generateCareerList,
	    incrementCareerRank};