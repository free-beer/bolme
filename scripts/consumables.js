/**
 * This function attempts to reduce the uses for a consumable item by 1. This
 * can fail it the actor or item cannot be located or the item uses are already
 * at 0. The first don't will be logged, the third issue will generate a
 * notification message.
 */
function decrementConsumableItem(event) {
    let node  = event.currentTarget;
    let actor = game.actors.find((a) => a.id === node.dataset.actor);

    if(actor) {
        let consumable = actor.items.find((i) => i.id === node.dataset.item);

        if(consumable) {
            if(consumable.system.uses.value > 0) {
                let uses = consumable.system.uses.value - 1;

                if(uses > 0 || consumable.system.rechargable) {
                    consumable.update({data: {uses: {value: uses}}});
                } else {
                    ui.notifications.info(game.i18n.format("bolme.notices.consumables.consumed", {name: consumable.name}));
                    actor.deleteEmbeddedDocuments("Item", [consumable.id]);
                }
            } else {
                    ui.notifications.error(game.i18n.localize("bolme.errors.consumables.depleted"));
            }
        } else {
            console.error(`Unable to locate item id '${node.dataset.item}' on actor id '${actor.id}' (${actor.name}).`);
        }
    } else {
        console.error(`Unable to locate an actor with the id '${node.dataset.actor}'.`);
    }
}

/**
 * This function attempts to increase the uses for a consumable item by 1. This
 * can fail it the actor or item cannot be located or the item uses are already
 * at maximum. The first don't will be logged, the third issue will generate a
 * notification message.
 */
function incrementConsumableItem(event) {
    let node  = event.currentTarget;
    let actor = game.actors.find((a) => a.id === node.dataset.actor);

    if(actor) {
        let consumable = actor.items.find((i) => i.id === node.dataset.item);

        if(consumable) {
            if(consumable.system.uses.value < consumable.system.uses.max) {
                    consumable.update({data: {uses: {value: consumable.system.uses.value + 1}}});
            } else {
                    ui.notifications.error(game.i18n.localize("bolme.errors.consumables.maxedOut"));
            }
        } else {
            console.error(`Unable to locate item id '${node.dataset.item}' on actor id '${actor.id}' (${actor.name}).`);
        }
    } else {
        console.error(`Unable to locate an actor with the id '${node.dataset.actor}'.`);
    }
}

export {decrementConsumableItem,
        incrementConsumableItem};