function onTabSelected(event, root, actor) {
    let tabId = event.currentTarget.dataset.id;

    if(tabId) {
        let tabElement = root.querySelector(`#${tabId}`);

        if(tabElement) {
            let allTabs   = root.querySelectorAll(".tab-selector");
            let allBodies = root.querySelectorAll(".tab-body");

            allTabs.forEach((t) => t.classList.remove("selected"));
            allBodies.forEach((b) => b.classList.add("hidden"));

            tabElement.classList.remove("hidden");
            event.currentTarget.classList.add("selected");
            console.log(`Updating tab selection to '${tabId}'.`);
            actor.update({system: {tabs: {selected: tabId}}});
        } else {
            console.error(`Unable to locate a tab body element with the id '${tabId}'.`);
        }
    } else {
        console.error(`Tab selected but selected element does not possess an id data attribute.`);
    }
}

export {onTabSelected};
