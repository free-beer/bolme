/**
 * Deletes a language from a character.
 */
function deleteCharacterLanguage(actor, languageId) {
	let language = actor.items.find((e) => e.id === languageId);

	if(language) {
	    actor.deleteEmbeddedDocuments("Item", [languageId]);
	} else {
		console.error(`Unable to locate language id '${languageId}' on actor id '${actor.id}' (name: ${actor.name}).`);
	}
}

export {deleteCharacterLanguage};