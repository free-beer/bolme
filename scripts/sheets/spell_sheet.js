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