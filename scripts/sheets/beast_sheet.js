import constants from "../constants.js";
import InfoDialog from "../dialogs/info_dialog.js";

export default class BoLMEBeastSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes:  ["bolme", "sheet", "beast-sheet"],
                            height:   700,
                            template: "systems/bolme/templates/sheets/beast-sheet.html",
                            width:    750}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/beast-sheet.html`);
    }

    /** @override */
    getData() {
        const context = super.getData();

        context.constants = {priorities: constants.beasts.priorities,
                             sizes: constants.beasts.sizes};
        context.traits = this.actor.items.filter((i) => i.type === "trait");
        context.boons  = context.traits.filter((t) => t.system.type === "boon");
        context.flaws  = context.traits.filter((t) => t.system.type === "flaw");

        return(context);
    }

    activateListeners(html) {
        let lifebloodFields = [html[0].querySelector('input[name="system.lifeblood.max"]'),
                               html[0].querySelector('input[name="system.lifeblood.value"]')];
        super.activateListeners(html);

        lifebloodFields[0].addEventListener("input", () => lifebloodFields[1].value = lifebloodFields[0].value);
        html.find(".info-icon").click((e) => InfoDialog.build(e.currentTarget).then((dialog) => dialog.render(true)));
        html.find(".item-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
        html.find(".trait-deleter").click((e) => this.actor.deleteEmbeddedDocuments("Item", [e.currentTarget.dataset.id]));
    }
}
