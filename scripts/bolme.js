import ArmourSheet from "./sheets/armour_sheet.js";
import BoLMECharacterSheet from "./sheets/character_sheet.js";
import CareerSheet from "./sheets/career_sheet.js";
import LanguageSheet from "./sheets/language_sheet.js";
import ShieldSheet from "./sheets/shield_sheet.js";
import TraitSheet from "./sheets/trait_sheet.js";
import WeaponSheet from "./sheets/weapon_sheet.js";
import {careerAddedToCharacter} from "./careers.js"

async function preloadHandlebarsTemplates() {
    const paths = ["systems/bolme/templates/partials/a-partial.hbs"];
    return(loadTemplates([]))
}

Hooks.once("init", () => {
    console.log("Initializing the Barbarian Of Lemuria (Mythic Edition) system.");

    // Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("bolme",
                         BoLMECharacterSheet, {label: "bolme.sheets.character.title",
                                               makeDefault: true,
                                               types: ["character"]});

    //Items.unregisterSheet("core", ItemSheet);

    Items.registerSheet("bolme",
                        ArmourSheet, {label: "bolme.sheets.armour.title",
                                      makeDefault: true,
                                      types: ["armour"]});
    Items.registerSheet("bolme",
                        CareerSheet, {label: "bolme.sheets.career.title",
                                      makeDefault: true,
                                      types: ["career"]});
    Items.registerSheet("bolme",
                        LanguageSheet, {label: "bolme.sheets.language.title",
                                        makeDefault: true,
                                        types: ["language"]});
    Items.registerSheet("bolme",
                        ShieldSheet, {label: "bolme.sheets.shield.title",
                                     makeDefault: true,
                                     types: ["shield"]});
    Items.registerSheet("bolme",
                        TraitSheet, {label: "bolme.sheets.trait.title",
                                     makeDefault: true,
                                     types: ["trait"]});
    Items.registerSheet("bolme",
                        WeaponSheet, {label: "bolme.sheets.weapon.title",
                                     makeDefault: true,
                                     types: ["weapon"]});

    Handlebars.registerHelper("selectOption", function(chosen) {
        let selected = (chosen === this.key ? " selected" : " ");
        return(`<option${selected} value="${this.key}">${game.i18n.localize(this.value)}</option>`);
    });

    Handlebars.registerHelper("localizeWeaponType", function(type) {
        return(game.i18n.localize(`bolme.weapons.types.${type}.label`));
    });

Hooks.on("dropActorSheetData", (actor, sheet, data) => {
        setTimeout(() => {
            let item = actor.items.contents[actor.items.contents.length - 1];
            if(item.type === "career") {
                careerAddedToCharacter(actor, item);
            }
        }, 250);
    });
});
