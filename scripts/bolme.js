import ArmourSheet from "./sheets/armour_sheet.js";
import BoLMECharacterSheet from "./sheets/character_sheet.js";
import CareerSheet from "./sheets/career_sheet.js";
import ConsumableSheet from "./sheets/consumable_sheet.js";
import CraftingRecipeSheet from "./sheets/crafting_recipe_sheet.js";
import DeviceSheet from "./sheets/device_sheet.js";
import LanguageSheet from "./sheets/language_sheet.js";
import ShieldSheet from "./sheets/shield_sheet.js";
import TraitSheet from "./sheets/trait_sheet.js";
import WeaponSheet from "./sheets/weapon_sheet.js";
import {careerAddedToCharacter} from "./careers.js"
import {applyCommonChatEventHandlers} from "./chat.js";
import {traitAddedToCharacter} from "./traits.js";

async function preloadHandlebarsTemplates() {
    const paths = ["systems/bolme/templates/partials/dice-result.html",
                   "systems/bolme/templates/chat/attack-roll.html",
                   "systems/bolme/templates/chat/craft-roll.html"];
    return(loadTemplates(paths))
}

Hooks.once("init", () => {
    console.log("Initializing the Barbarian Of Lemuria (Mythic Edition) system.");
    preloadHandlebarsTemplates();

    console.log("Registering module settings.");
    game.settings.register("bolme", "policeAdvancements", {config:  true,
                                                           default: true,
                                                           hint:    "Indicates if changes to attributes, combat abilites and careers should be policed.",
                                                           name:    "Police Advancement",
                                                           scope:   "world",
                                                           type:    Boolean});
    game.settings.register("bolme", "startingAttributes", {config:  true,
                                                           default: 4,
                                                           hint:    "The number of starting attribute points for characters.",
                                                           name:    "Starting Attribute Points",
                                                           scope:   "world",
                                                           type:    Number});
    game.settings.register("bolme", "startingCombatAbilities", {config:  true,
                                                                default: 4,
                                                                hint:    "The number of starting combat ability points for characters.",
                                                                name:    "Starting Combat Ability Points",
                                                                scope:   "world",
                                                                type:    Number});
    game.settings.register("bolme", "startingCareers", {config:  true,
                                                        default: 8,
                                                        hint:    "The number of starting career points for characters.",
                                                        name:    "Starting Career Points",
                                                        scope:   "world",
                                                        type:    Number});
    game.settings.register("bolme", "startingTraits", {config:  true,
                                                       default: 1,
                                                       hint:    "The number of starting traits for characters.",
                                                       name:    "Starting Trait Points",
                                                       scope:   "world",
                                                       type:    Number});

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
                        ConsumableSheet, {label: "bolme.sheets.consumable.title",
                                      makeDefault: true,
                                      types: ["consumable"]});
    Items.registerSheet("bolme",
                        CraftingRecipeSheet, {label: "bolme.sheets.recipe.title",
                                      makeDefault: true,
                                      types: ["crafting recipe"]});
    Items.registerSheet("bolme",
                        DeviceSheet, {label: "bolme.sheets.device.title",
                                      makeDefault: true,
                                      types: ["device"]});
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

    Handlebars.registerHelper("localizeWeaponType", function(type) {
        return(game.i18n.localize(`bolme.weapons.types.${type}.label`));
    });

    Handlebars.registerHelper("localizeShieldSize", function(size) {
        return(game.i18n.localize(`bolme.shields.sizes.${size}.label`));
    });

    Handlebars.registerHelper("localizeTraitType", function(type) {
        return(game.i18n.localize(`bolme.traits.types.${type}.label`));
    });

    Handlebars.registerHelper("rollResultLevel", function(level) {
        let className = "is-success";

        if(level === "failure") {
            className = "is-failure"
        } else if(level === "mighty") {
            className = "is-mighty";
        }
        return(`<span class="${className}">${game.i18n.localize(`bolme.rolls.results.${level}`)}</span>`);
    });

    Handlebars.registerHelper("selectOption", function(chosen) {
        let selected = (chosen === this.key ? " selected" : " ");
        return(`<option${selected} value="${this.key}">${game.i18n.localize(this.value)}</option>`);
    });

    Handlebars.registerHelper("tabActiveCheck", function(tabName, activeClass, inactiveClass) {
        let data = Object.assign({tabs: {selected: "front_page"}}, this.actor.data.data);
        return(tabName === data.tabs.selected ? activeClass : inactiveClass);
    });

    Hooks.on("dropActorSheetData", (actor, sheet, data) => {
            setTimeout(() => {
                let item = actor.items.contents[actor.items.contents.length - 1];

                if(item.type === "career") {
                    careerAddedToCharacter(actor, item);
                } else if(item.type === "trait") {
                    traitAddedToCharacter(actor, item);
                }
            }, 250);
        });

    Hooks.on("createActor", (actor, options, userId) => {
        if(actor.type === "character") {
            let attributes = game.settings.get("bolme", "startingAttributes");
            let combat     = game.settings.get("bolme", "startingCombatAbilities");
            let careers    = game.settings.get("bolme", "startingCareers");
            let traits     = game.settings.get("bolme", "startingTraits");

            //console.log(`STARTING POINTS: attributes=${attributes}, careers=${careers}, combat=${combat}, traits: ${traits}`);
            actor.update({data: {points: {starting: {attributes: attributes,
                                                     careers:    careers,
                                                     combat:     combat,
                                                     traits:     traits}}}})
        }
    });

    Hooks.on("renderChatMessage", (message, html, data) => {
        let messageRoot = html[0].querySelector(".bolme-chat-message");

        if(messageRoot) {
            applyCommonChatEventHandlers(messageRoot);
            if(messageRoot.classList.contains("attack-roll")) {
                console.log("Attack roll chat message logged.");
            } else {
                console.log("Unrecognised chat message logged.");
            }
        } else {
            console.log("Chat message logged and ignored.");
        }
    });
});
