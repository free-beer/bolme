export default class InfoDialog extends Dialog {
	constructor(settings) {
        let buttons = {close: {callback: () => {},
                               label: game.i18n.localize("bolme.buttons.close")}};

        super(Object.assign({}, settings, {buttons: buttons}));
	}

    static build(element, options={}) {
        let settings = Object.assign({}, options);
        let data     = {description: element.dataset.description};

        settings.title = game.i18n.localize(`bolme.dialogs.titles.info`);

        console.log("DATA:", data);
        console.log("ELEMENT:", element);
        return(renderTemplate("systems/bolme/templates/dialogs/info-dialog.html", data)
                   .then((content) => {
                   	         console.log("CONTENT:", content);
                             settings.content = content;
                             console.log("SETTINGS:", settings);
                             return(new InfoDialog(settings));
                         }));   
    }
}
