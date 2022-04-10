let constants = {
	allowdProtoMethods: {
		"name": true
	},
	armour: {
		types: [{key: "heavy", value: "bolme.armour.heavy.label"},
		        {key: "helmet", value: "bolme.armour.helmet.label"},
		        {key: "light", value: "bolme.armour.light.label"},
		        {key: "medium", value: "bolme.armour.medium.label"}]
	},
	attributes: [{key: "agility", value: "bolme.attributes.agility.label"},
                 {key: "appeal", value: "bolme.attributes.appeal.label"},
                 {key: "mind", value: "bolme.attributes.mind.label"},
                 {key: "strength", value: "bolme.attributes.strength.label"}],
	beasts: {
		priorities: [{key: "rabble", value: "bolme.beasts.priorities.rabble.label"},
		             {key: "tough", value: "bolme.beasts.priorities.tough.label"},
		             {key: "villain", value: "bolme.beasts.priorities.villain.label"}],
		sizes: [{key: "tiny", value: "bolme.beasts.sizes.tiny.label"},
		        {key: "very_small", value: "bolme.beasts.sizes.verySmall.label"},
		        {key: "small", value: "bolme.beasts.sizes.small.label"},
		        {key: "medium", value: "bolme.beasts.sizes.medium.label"},
		        {key: "large", value: "bolme.beasts.sizes.large.label"},
		        {key: "very_large", value: "bolme.beasts.sizes.veryLarge.label"},
		        {key: "huge", value: "bolme.beasts.sizes.huge.label"},
		        {key: "massive", value: "bolme.beasts.sizes.massive.label"},
		        {key: "enormous", value: "bolme.beasts.sizes.enormous.label"},
		        {key: "gigantic", value: "bolme.beasts.sizes.gigantic.label"},
		        {key: "immense", value: "bolme.beasts.sizes.immense.label"},
		        {key: "colossal", value: "bolme.beasts.sizes.colossal.label"}]
	},
	combatAbilities: [{key: "defence", value: "bolme.combat.defence.label"},
                      {key: "initiative", value: "bolme.combat.initiative.label"},
                      {key: "melee", value: "bolme.combat.melee.label"},
                      {key: "ranged", value: "bolme.combat.ranged.label"}],
    crafting: {
    	recipes: {
    		difficulties: [{key: "easy", modifier: 1, value: "bolme.difficulties.easy"},
    		               {key: "moderate", modifier: 0, value: "bolme.difficulties.moderate"},
    		               {key: "hard", modifier: -1, value: "bolme.difficulties.hard"},
    		               {key: "tough", modifier: -2, value: "bolme.difficulties.tough"},
    		               {key: "demanding", modifier: -4, value: "bolme.difficulties.demanding"},
    		               {key: "formidable", modifier: -6, value: "bolme.difficulties.formidable"}],
    		subtypes: [{key: "device", value: "bolme.crafting.recipes.subtypes.device.label"},
    		           {key: "potion", value: "bolme.crafting.recipes.subtypes.potion.label"}],
    		types: [{cost: 1, key: "common", value: "bolme.crafting.recipes.types.common.label"},
    		        {cost: 8, key: "legendary", value: "bolme.crafting.recipes.types.legendary.label"},
    		        {cost: 4, key: "mythic", value: "bolme.crafting.recipes.types.mythic.label"},
    		        {cost: 2, key: "uncommon", value: "bolme.crafting.recipes.types.uncommon.label"}]
    	}
    },
    rolls: {
    	results: [{key: "calamitous", value: "rolls.results.calamitous"},
    	          {key: "failure", value: "rolls.results.failure"},
    	          {key: "legendary", value: "rolls.results.legendary"},
    	          {key: "mighty", value: "rolls.results.mighty"},
    	          {key: "success", value: "rolls.results.success"}]
    },
	shields: {
		sizes: [{key: "large", value: "bolme.shields.large.label"},
		        {key: "small", value: "bolme.shields.small.label"}]
	},
	spells: {
		difficulties: [{key: "very_easy", modifier: 2, value: "bolme.difficulties.very_easy"},
		               {key: "easy", modifier: 1, value: "bolme.difficulties.easy"},
		               {key: "moderate", modifier: 0, value: "bolme.difficulties.moderate"},
		               {key: "hard", modifier: -1, value: "bolme.difficulties.hard"},
		               {key: "tough", modifier: -2, value: "bolme.difficulties.tough"},
		               {key: "demanding", modifier: -4, value: "bolme.difficulties.demanding"},
		               {key: "formidable", modifier: -6, value: "bolme.difficulties.formidable"},
		               {key: "heroic", modifier: -1, value: "bolme.difficulties.heroic"},],
		magnitudes: [{cost: {base: 1, minimum: 1}, key: "cantrip", value: "bolme.spells.magnitudes.cantrip.label"},
		             {cost: {base: 5, minimum: 2}, key: "first", value: "bolme.spells.magnitudes.first.label"},
		             {cost: {base: 10, minimum: 6}, key: "second", value: "bolme.spells.magnitudes.second.label"},
		             {cost: {base: 15, minimum: 11}, key: "third", value: "bolme.spells.magnitudes.third.label"}]
	},
	traits: {
		types: [{key: "boon", value: "bolme.traits.boon.label"},
			    {key: "flaw", value: "bolme.traits.flaw.label"}]
	},
	weapons: {
		hands: [{key: "one", value: "bolme.weapons.hands.one.label"},
		        {key: "two", value: "bolme.weapons.hands.two.label"}],
		types: [{key: "melee", value: "bolme.weapons.types.melee.label"},
		        {key: "ranged", value: "bolme.weapons.types.ranged.label"}]
	}
};

export default constants;
