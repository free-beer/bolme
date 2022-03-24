import constants from '../../scripts/constants.js';

export default class LanguageSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "language-sheet"],
                            height:  350,
                            width:   500}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/language-sheet.html`);
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