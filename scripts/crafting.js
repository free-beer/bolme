import {calculateAttributeValue} from "./attributes.js";
import {findHighestRankeCareerWithGrant} from "./careers.js";
import {showMessage} from "./chat.js";
import constants from "./constants.js";
import {getRollResultLevel,
	    rollIt} from "./dice.js";

/**
 * Event handler used to deal with requests to decrement the progress on an
 * actor crafting recipe.
 */
function decrementCraftingProgressClicked(event, actor) {
	let recipeId = event.currentTarget.dataset.recipe;
	let recipe   = actor.items.find((i) => i.id === recipeId && i.type === "crafting recipe");

	if(recipe) {
		let expandedRecipe = expandRecipe(recipe, actor.id);

		if(expandedRecipe.progress > 0) {
			actor.updateEmbeddedDocuments("Item", [{_id: recipeId, data: {progress: expandedRecipe.progress - 1}}], {render: true});
			actor.update({data: {craftingPoints: {value: actor.data.data.craftingPoints.value + 1}}});
		}
	} else {
		console.error(`Unable to find recipe id '${recipeId}' on actor id '${actorId}' (${actor.name}).`);
	}
}

/**
 * Event handler that responds to requests to delete a crafting recipe from an
 * actor.
 */
function deleteCraftingRecipe(event, actor) {
	actor.deleteEmbeddedDocuments("Item", [event.currentTarget.dataset.id]);
}

/**
 * Generates an 'expanded' object based on a crafting recipe.
 */
function expandRecipe(recipe, actorId) {
    let data    = recipe.data.data;
    let type    = constants.crafting.recipes.types.find((t) => t.key === data.type);
    let details = {actorId:    actorId,
                   complete:   (data.progress >= type.cost),
                   cost:       type.cost,
                   difficulty: data.difficulty,
                   id:         recipe.id,
                   item:       data.item,
                   name:       recipe.name,
                   progress:   data.progress};

    return(details);
}

/**
 * Event handler used to deal with requests to increment the progress on an
 * actor crafting recipe.
 */
function incrementCraftingProgressClicked(event, actor) {
	let recipeId = event.currentTarget.dataset.recipe;
	let recipe   = actor.items.find((i) => i.id === recipeId && i.type === "crafting recipe");

	if(recipe) {
		let expandedRecipe = expandRecipe(recipe, actor.id);

		if(!expandedRecipe.complete) {
			if(actor.data.data.craftingPoints.value > 0) {
				actor.updateEmbeddedDocuments("Item", [{_id: recipeId, data: {progress: expandedRecipe.progress + 1}}], {render: true});
				actor.update({data: {craftingPoints: {value: actor.data.data.craftingPoints.value - 1}}});
			} else {
				ui.notifications.warn(game.i18n.localize("bolme.warnings.crafting.points.unavailable"));
			}
		}
	} else {
		console.error(`Unable to find recipe id '${recipeId}' on actor id '${actorId}' (${actor.name}).`);
	}
}

/**
 * Makes the crafting roll for a crafted item. If the roll is successful the
 * actor gains the item (if one is assigned to the recipe) and the recipe is
 * reset.
 */
function rollForCraftedItem(actor, recipeId) {
	let recipe = actor.items.find((i) => i.id === recipeId);

	if(recipe) {
		let expanded = expandRecipe(recipe);

		if(expanded.complete) {
			let attribute  = calculateAttributeValue("mind", actor.data.data.attributes.mind);
			let career     = findHighestRankeCareerWithGrant(actor, "crafting");
			let difficulty = constants.crafting.recipes.difficulties.find((d) => d.key === expanded.difficulty);
			let modifier   = difficulty.modifier + attribute + career.rank;
			let data       = {actorName: actor.name, formula: "2d6"};

            // Construct the crafting roll formula.
			if(modifier < 0) {
				data.formula = `${data.formula} - ${Math.abs(modifier)}`;
			} else if(modifier > 0) {
				data.formula = `${data.formula} + ${modifier}`;
			}

            // Reset the recipe.
			actor.updateEmbeddedDocuments("Item", [{_id: recipeId, data: {progress: 0}}], {render: true});

			// Make the crafting roll.
			rollIt(new Roll(data.formula))
			    .then((roll) => {
			    	data.dice        = roll.dice;
			    	data.resultLevel = getRollResultLevel(roll);
			    	data.roll        = roll;
			    	data.rollTotal   = roll.total;

			    	if(data.resultLevel !== "failure") {
			    		if(expanded.item.id && expanded.item.id !== "") {
			    			let templateItem = game.items.find((i) => i.id === expanded.item.id);

			    			if(templateItem) {
			    				let copy = templateItem.clone({}, true, {parent: actor});

			    				actor.createEmbeddedDocuments("Item", [{name: templateItem.name,
			    					                                    data: templateItem.data.data,
			    					                                    type: templateItem.type}], {parent: actor, render: true});
			    				ui.notifications.info(game.i18n.format("bolme.notices.crafting.item.created", {name: templateItem.name}));
			    			} else {
			    				ui.notifications.warn(game.i18n.localize("bolme.warnings.crafting.item.missing"));
			    			}
			    		} else {
			    			ui.notifications.warn(game.i18n.localize("bolme.warnings.crafting.item.unassigned"));
			    		}
			    	}
			    	showMessage("systems/bolme/templates/chat/craft-roll.html", data)
			    });
		} else {
			console.error(`Craft roll requested on incomplete recipe id '${recipe.id}' (${recipe.name}).`);
		}
	} else {
		console.error(`Unable to locate recipe id '${recipeId}' on actor id '${actor.id}' (${actor.name}).`);
	}
}

export {decrementCraftingProgressClicked,
	    deleteCraftingRecipe,
	    expandRecipe,
        incrementCraftingProgressClicked,
        rollForCraftedItem};