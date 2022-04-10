import constants from '../../scripts/constants.js';

export default class SpellSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "spell-sheet"],
                            height:  575,
                            width:   620}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/spell-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = {difficulties: constants.spells.difficulties,
                             magnitudes: constants.spells.magnitudes};
        switch(context.data.data.magnitude) {
            case "first":
                console.log("ASSIGNING: ", constants.spells.requirements.first);
                context.requirementOptions = constants.spells.requirements.first;
                break;

            case "second":
                console.log("ASSIGNING: ", constants.spells.requirements.second);
                context.requirementOptions = constants.spells.requirements.second;
                break;

            case "third":
                console.log("ASSIGNING: ", constants.spells.requirements.third);
                context.requirementOptions = constants.spells.requirements.third;
                break;

            default:
                console.log("ASSIGNING EMPTY LIST");
                context.requirementOptions = [];
        }
        console.log("CONTEXT:", context);

        return(context);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if(this.options.editable) {
            // TBD: Activate listeners here!!!
        }
    }
}