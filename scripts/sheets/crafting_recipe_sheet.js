import constants from '../../scripts/constants.js';

export default class CraftingRecipeSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bolme", "item-sheet", "crafting-recipe-sheet"],
                            height:  480,
                            width:   570}));
    }

    /** @override */
    get template() {
        return(`systems/bolme/templates/sheets/crafting-recipe-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();

        context.constants = {recipeSubtypes: constants.crafting.recipes.subtypes,
                             recipeTypes: constants.crafting.recipes.types};
        context.data.hasProduct = (context.data.data.item.id !== "");

        return(context);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if(this.options.editable) {
            let itemId = html[0].dataset.id;

            html.find(".product-deleter").click((event) => this._deleteRecipeProduct());
            html.find(".quantity-decrementer").click((event) => this._decrementRecipeProductQuantity());
            html.find(".quantity-incrementer").click((event) => this._incrementRecipeProductQuantity());
            html.find(".type-selector").change((event) => {
                let value = event.currentTarget.value;
                let field = html.find('input[name="data.cost"]')[0];
                let type  = constants.crafting.recipes.types.find((t) => t.key === value);

                console.log(`TYPE CHANGED TO: ${value}`);
                field.value = type.cost;
            });

            // Add appropriate drag & drop handlers.
            html[0].addEventListener("drop", (event) => {
                let recipe = game.items.find((i) => i.id === itemId);
                let data   = JSON.parse(event.dataTransfer.getData("text/plain"));
                let item   = game.items.find((i) => i.id === data.id);

                if(item.type !== "crafting recipe") {
                    recipe.update({data: {item: {id: data.id, name: item.name}}});
                }
            });
            html[0].addEventListener("dragenter", (event) => {
                event.preventDefault();
            });
            html[0].addEventListener("dragleave", (event) => {
                event.preventDefault();
            });
        }
    }

    _decrementRecipeProductQuantity() {
        let quantity = this.item.data.data.item.quantity;

        if(quantity > 1) {
            quantity--;
        }
        this.item.update({data: {item: {quantity: quantity}}});
    }

    _deleteRecipeProduct() {
        this.item.update({data: {item: {id: "", name: "", quantity: 1}}});
    }

    _incrementRecipeProductQuantity() {
        let quantity = this.item.data.data.item.quantity + 1;
        this.item.update({data: {item: {quantity: quantity}}});
    }
}