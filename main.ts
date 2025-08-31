import { Plugin, WorkspaceLeaf } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {

	onload() {
		this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
			// Check for Ctrl/Cmd + W
			if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'w') {
				const activeLeaf = this.app.workspace.activeLeaf;

				// If there is an active leaf and it is pinned, prevent the default action
				if (activeLeaf && activeLeaf.getViewState()?.state?.pinned) {
					evt.preventDefault();
					evt.stopPropagation();
				}
			}
		});
	}

	onunload() {
		// All registered DOM events are automatically cleaned up by Obsidian when the plugin is disabled.
	}
}
