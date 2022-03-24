import constants from '../../scripts/constants.js';

export default class CareerSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "career-sheet"],
                            height:  400,
                            width:   600}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/career-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = constants;

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