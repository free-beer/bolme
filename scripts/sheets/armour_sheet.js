import constants from '../../scripts/constants.js';

export default class ArmourSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "armour-sheet"],
                            height:  430,
                            width:   700}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/armour-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = {armourTypes: constants.armour.types};

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