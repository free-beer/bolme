import constants from '../../scripts/constants.js';

export default class ConsumableSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "consumable-sheet"],
                            height:  430,
                            width:   700}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/consumable-sheet.html`);
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
            let fields = [html[0].querySelector('input[name="system.uses.max"]'),
                          html[0].querySelector('input[name="system.uses.value"]')];

            fields[0].addEventListener("input", () => {
                fields[1].value = fields[0].value;
            });
        }
    }
}