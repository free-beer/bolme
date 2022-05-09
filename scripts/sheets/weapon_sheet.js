import constants from '../../scripts/constants.js';

export default class WeaponSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "weapon-sheet"],
                            height:  500,
                            width:   630}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/weapon-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = {weaponHands: constants.weapons.hands,
                             weaponTypes: constants.weapons.types};

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