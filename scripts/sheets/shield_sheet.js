import constants from '../../scripts/constants.js';

export default class ShieldSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "shield-sheet"],
                            height:  400,
                            width:   600}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/shield-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = {shieldSizes: constants.shields.sizes};

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