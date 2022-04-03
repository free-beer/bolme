export default class InfoDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 450}));
    }

	constructor(settings) {
        let buttons = {close: {callback: () => {},
                               label: game.i18n.localize("bolme.buttons.close")}};

        super(Object.assign({}, settings, {buttons: buttons}));
	}

    static build(element, options={}) {
        let settings = Object.assign({}, options);
        let data     = {description: element.dataset.description};

        settings.title = game.i18n.localize(`bolme.dialogs.titles.info`);

        return(renderTemplate("systems/bolme/templates/dialogs/info-dialog.html", data)
                   .then((content) => {
                             settings.content = content;
                             return(new InfoDialog(settings));
                         }));   
    }
}
