import {calculateAttributeValue} from "../attributes.js";
import {findHighestRankeCareerWithGrant} from "../careers.js";
import {showMessage} from "../chat.js";
import constants from "../constants.js";
import {generateSpellCastRollFormula,
        getRollResultLevel,
        rollIt,
        translateDieFormula} from "../dice.js";

export default class SpellCastDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 275}));
    }

	constructor(settings) {
        let buttons = {attack: {callback: () => this._rollCast(),
                                label: game.i18n.localize("bolme.buttons.roll")}};

        super(Object.assign({}, settings, {buttons: buttons}));
        this._actorId = settings.actorId;
        this._spellId = settings.spellId;
	}

    get actor() {
        let actor = game.actors.find((a) => a.id === this._actorId);

        if(!actor) {
            throw(`Unable to locate an actor with the id '${this._actorId}'.`);
        }

        return(actor);
    }

    get actorId() {
        return(this._actorId);
    }

    get armourPenalty() {
        return(Math.abs(parseInt(this.element[0].querySelector('input[name="armourPenalty"]').value)));
    }

    get bonusDice() {
        return(Math.abs(parseInt(this.element[0].querySelector('input[name="bonusDice"]').value)));
    }

    get casterArcanePoints() {
        return(this.actor.data.data.arcanePoints.value);
    }

    get careerRank() {
        return(parseInt(this.element[0].querySelector('input[name="careerRank"]').value));
    }

    get cost() {
        return(this.spell.data.data.cost + this.armourPenalty);
    }

    get difficulty() {
        return(this.spell.data.data.difficulty);
    }

    get difficultyPenalty() {
        return(parseInt(this.element[0].querySelector('input[name="difficultyPenalty"]').value));
    }

    get mindRating() {
        return(SpellCastDialog.mindRating(this.actor));
    }

    get penaltyDice() {
        return(Math.abs(parseInt(this.element[0].querySelector('input[name="penaltyDice"]').value)));
    }

    get spell() {
        let spell = this.actor.items.find((i) => i.type === "spell" && i.id === this._spellId);

        if(!spell) {
            throw(`Unable to locate a spell with the id '${this._weaponId}'.`);
        }

        return(spell);
    }

    get spellId() {
        return(this._spellId);
    }

    _rollCast() {
        if(this.casterArcanePoints >= this.cost) {
            let actor = this.actor;
            let spell = this.spell;
            let data  = {actorId:           actor.id,
                         actorName:         actor.name,
                         attribute:         "mind",
                         attributeRating:   this.mindRating,
                         automatic:         (this.difficulty === "automatic"),
                         bonusDice:         this.bonusDice,
                         careerRank:        this.careerRank,
                         cost:              this.cost,
                         difficulty:        this.difficulty,
                         difficultyPenalty: this.difficultyPenalty,
                         magnitude:         spell.data.data.magnitude,
                         penaltyDice:       this.penaltyDice,
                         requiresRoll:      (this.difficulty !== "automatic"),
                         spellId:           spell.id,
                         spellName:         spell.name};

            actor.update({data: {arcanePoints: {value: actor.data.data.arcanePoints.value - data.cost}}});
            if(data.difficulty !== "automatic") {
                let dice;

                data.formula = generateSpellCastRollFormula(data.attributeRating,
                                                            data.careerRank,
                                                            data.difficultyPenalty,
                                                            data.bonusDice,
                                                            data.penaltyDice);
                data.roll   = new Roll(data.formula);

                rollIt(data.roll)
                    .then((roll) => {
                        data.dice        = roll.dice;
                        data.resultLevel = getRollResultLevel(roll);
                        data.rollTotal   = roll.total;
                        showMessage("systems/bolme/templates/chat/spell-cast-roll.html", data);
                    });
            } else {
                showMessage("systems/bolme/templates/chat/spell-cast-roll.html", data);
            }
        } else {
            ui.notifications.error(game.i18n.localize("bolme.errors.spells.casting.tooExpensive"));
        }
    }

    static build(element, options) {
        let settings = Object.assign({}, options);
        let data     = {};
        let actor    = game.actors.find((a) => a.id === element.dataset.actor);

        settings.title = game.i18n.localize(`bolme.dialogs.titles.spellCast`);
        if(actor) {
            let spell  = actor.items.find((i) => i.id === element.dataset.spell);

            if(spell) {
                let settings = Object.assign({}, options);
                let data     = {actorId:           actor.id,
                                armourPenalty:     0,
                                bonusDice:         0,
                                difficultyPenalty: SpellCastDialog.difficultyPenalty(spell),
                                mind:              SpellCastDialog.mindRating(actor),
                                name:              spell.name,
                                penaltyDice:       0,
                                careerRank:         SpellCastDialog.careerRank(actor),
                                spellId:           spell.id};

                settings.actorId = actor.id;
                settings.title   = game.i18n.localize(`bolme.dialogs.titles.spellCast`);
                settings.spellId = spell.id;
                return(renderTemplate("systems/bolme/templates/dialogs/spell-cast-dialog.html", data)
                           .then((content) => {
                                     settings.content = content;
                                     return(new SpellCastDialog(settings));
                                 }));   
            } else {
                console.error(`Unable to locate spell id '${element.dataset.spell}' on actor id '${actor.id}' (${actor.name}).`);
            }
        } else {
            console.error(`Unable to locate actor id '${actor.id}'.`);
        }
    }

    static difficultyPenalty(spell) {
        let difficulty = constants.spells.difficulties.find((d) => d.key === spell.data.data.difficulty);

        return(difficulty ? difficulty.modifier : 0); 
    }

    static mindRating(actor) {
        if(actor.data.data.attributes) {
            return(calculateAttributeValue("mind", actor.data.data.attributes.mind));
        } else {
            return(actor.data.data.mind);
        }
    }

    static careerRank(actor) {
        let career = findHighestRankeCareerWithGrant(actor, "arcane");

        if(career) {
            return(career.rank);
        } else {
            ui.notifications.error(game.i18n.localize("bolme.errors.spells.casting.untrained"));
            throw(`Actor id '${actor.id}' (${actor.name}) does not possess a career that grants them the spell casting ability.`);
        }
    }
}
