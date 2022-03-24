import constants from '../../scripts/constants.js';

export default class TraitSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "trait-sheet"],
                            height:  400,
                            width:   600}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/trait-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = {traitTypes: constants.traits.types};

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