import constants from '../../scripts/constants.js';

export default class DeviceSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "device-sheet"],
                            height:  430,
                            width:   530}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/device-sheet.html`);
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