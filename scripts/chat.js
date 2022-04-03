import constants from "./constants.js";

/**
 * Applies common event handlers for elements within a chat message that is
 * being logged to the chat roller.
 */
function applyCommonChatEventHandlers(rootNode) {
	rootNode.querySelectorAll(".expander").forEach((node) => {
		let header = node.children[0];
		let toggle = node.children[1];

		header.addEventListener("click", (event) => {
			if(toggle.classList.contains("hidden")) {
				toggle.classList.remove("hidden");
			} else {
				toggle.classList.add("hidden");
			}
		});
	});
}

/**
 * This function does the actual work of showing a chat message on the
 * Foundry UI.
 */
function showMessage(templateKey, data, settings={}) {
    getTemplate(templateKey)
        .then((template) => {
            let message = {content: template(data, {allowProtoMethodsByDefault: true}),
            	           speaker: ChatMessage.getSpeaker(),
                           user:    game.user};

            ChatMessage.create(message);
        })
        .catch((error) => {
        	console.error("Show message failed. Error:", error);
        });
}

export {applyCommonChatEventHandlers,
	    showMessage};
