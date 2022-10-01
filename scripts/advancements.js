function calculateSpentAdvancements(actor) {
	let total = 0;
	let data  = actor.system;

	Object.keys(data.attributes).forEach((attribute) => {
		total += data.attributes[attribute].advancementPoints;
	});

	Object.keys(data.combat).forEach((ability) => {
		total += data.combat[ability].advancementPoints;
	});

	actor.items.forEach((item) => {
		if(item.type === "career" || item.type === "trait") {
			total += item.system.advancementPoints;
		}
	});

	return(total);
}

export {calculateSpentAdvancements};