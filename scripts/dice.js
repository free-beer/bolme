import {expandAttribute} from "./attributes.js";
import {expandCareer} from "./careers.js";
import {expandCombatAbility} from "./combat_abilities.js";

/**
 * A regular expression that is used to pick out the BoL bonus die pattern
 * (i.e. '6H') from a string.
 */
const BONUS_DIE_PATTERN = /(?<!\d)[dD]6[hH]/g;

/**
 * A regular expression that is used to pick out dice expressions that do not
 * explicitly set a quantity of dice (e.g. 'd6').
 */
const DIE_WITH_NO_QUANTITY_PATTERN = /(?<!\d)[dD]6/g;

/**
 * A regular expression that is used to pick out the BoL penalty die pattern
 * (i.e. '6L') from a string.
 */
const PENALTY_DIE_PATTERN = /(?<!\d)[dD]6[lL]/g;

/**
 * Fetches the result level (i.e. failure, success or mighty) for a given roll
 * object. Only the first dice within a Roll object are considered and these
 * must be a roll consisting of 2 or more d6s, only two of which are up for
 * consideration. If these criteria are not met then the function throws an
 * exception.
 */
function getRollResultLevel(roll, target=9) {
    let result = "unknown"
    let dice   = roll.dice[0];

    if(/^\d+[dD]{1}6[^6]*$/.test(dice.expression)) {
        let used = dice.results.filter((r) => !r.discarded);

        if(used.length === 2) {
            if(used[0].result === 1 && used[1].result === 1) {
                result = "failure";
            } else if(used[0].result === 6 && used[1].result === 6) {
                result = "mighty";
            } else {
                result = (roll.total >= target ? "success" : "failure")
            }
        } else {
            console.error(`First dice expression in dice roll (${dice.expression}) does not have exactly 2 used dice.`);
        }
    } else {
        console.error(`First expression in dice roll (${dice.expression}) is not a group of two or more 6-side dice.`)
    }

    return(result)
}

/**
 * Generates a dice roll formula for an attack based on factors such as
 * attributes, combat abilities, careers and bonus/penalty dice.
 */
function generateAttackRollFormula(actorId, attribute, ability, bonusDice, penaltyDice, defence, rangeModifier) {
    let actor   = game.actors.find((a) => a.id === actorId);
    let formula = generateBaseSkillRollFormula(bonusDice, penaltyDice);

    if(actor) {
        let modifier = 0;

        if(actor.type === "Character") {
            let expandedAbility   = expandCombatAbility(actor.data, ability);
            let expandedAttribute = expandAttribute(actor.data, attribute);

            // Apply attribute, combat ability, career and range modifications.
            modifier = expandedAttribute.value + expandedAbility.value;
        } else {
            modifier = actor.data.data[attribute] + actor.data.data[ability]
        }

        modifier = (modifier + parseInt(`${rangeModifier}`)) - parseInt(`${defence}`)
        if(modifier !== 0) {
            if(modifier > 0) {
                formula = `${formula} + ${modifier}`;
            } else {
                formula = `${formula} - ${Math.abs(modifier)}`;
            }
        }
    } else {
        console.error(`Failed to find an actor with the id '${actorId}'.`);
    }

    return(formula);
}

/**
 * Generates a dice formula for a skill roll taking the number of bonus or
 * penalty dice into accout.
 */
function generateBaseSkillRollFormula(bonusDice, penaltyDice) {
    let formula = "2d6";

    if(bonusDice !== penaltyDice) {
        let totalDice = bonusDice - penaltyDice;

        if(totalDice > 0) {
            formula = `${2 + totalDice}d6kh2`;
        } else {
            formula = `${2 + Math.abs(totalDice)}d6kl2`;
        }
    }

    return(formula);
}

/**
 * Generates a dice roll formula for a spell casting based on factors such as
 * attributes, spell difficulty, careers and bonus/penalty dice.
 */
function generateSpellCastRollFormula(attributeRating, careerRank, difficulty, bonusDice, penaltyDice) {
    let formula  = generateBaseSkillRollFormula(bonusDice, penaltyDice);
    let modifier = attributeRating + careerRank + difficulty;

    if(modifier !== 0) {
        if(modifier > 0) {
            formula = `${formula} + ${modifier}`;
        } else {
            formula = `${formula} - ${Math.abs(modifier)}`;
        }
    }

    return(formula);
}

/**
 * Generates a dice roll formula for a task based on factors such as attribute,
 * career rank and bonus/penalty dice.
 */
function generateTaskRollFormula(actorId, attribute, careerRank, bonusDice, penaltyDice) {
    let actor   = game.actors.find((a) => a.id === actorId);
    let formula = generateBaseSkillRollFormula(bonusDice, penaltyDice);

    if(actor) {
        let modifier = 0;

        if(actor.type === "Character") {
            let expandedAttribute = expandAttribute(actor.data, attribute);

            // Apply attribute, combat ability, career and range modifications.
            modifier = expandedAttribute.value + careerRank;
        } else {
            modifier = actor.data.data[attribute] + careerRank;
        }

        if(modifier !== 0) {
            if(modifier > 0) {
                formula = `${formula} + ${modifier}`;
            } else {
                formula = `${formula} - ${Math.abs(modifier)}`;
            }
        }
    } else {
        console.error(`Failed to find an actor with the id '${actorId}'.`);
    }

    return(formula);
}

/**
 * Wrapper for integration with the DiceSoNice module. Prefer this route over
 * evaluating dice rolls directly.
 */
function rollIt(roll) {
    return(roll.evaluate({async: true}).then((result) => {
        if(game.dice3d) {
            game.dice3d.showForRoll(result);
        }
        return(result);
    }));
}

/**
 * Attempts to translate a dice formula containing expressions that BoL uses but
 * that Foundry won't understand.
 */
function translateDieFormula(source) {
	let output = source.replaceAll(BONUS_DIE_PATTERN, "(2d6kh)");

    output = output.replaceAll(PENALTY_DIE_PATTERN, "(2d6kl)");
    output = output.replaceAll(DIE_WITH_NO_QUANTITY_PATTERN, "1d6");
	return(output)
}

export {generateAttackRollFormula,
        generateSpellCastRollFormula,
        generateTaskRollFormula,
        getRollResultLevel,
        rollIt,
        translateDieFormula};

