import { Plugin, Notice } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
	private originalCloseCallback: (() => void) | null = null;

	onload() {
		new Notice('Prevent Close Pinned Tab Loaded!');

		// Wait for workspace to be ready before accessing commands
		this.app.workspace.onLayoutReady(() => {
			// Store the original close command callback
			const closeCommand = this.app.commands.commands['workspace:close'];
			if (closeCommand) {
				this.originalCloseCallback = closeCommand.callback;
				
				// Override the close command callback
				closeCommand.callback = () => {
					const activeLeaf = this.app.workspace.activeLeaf;
					
					// If there's an active leaf and it's pinned, prevent closing
					if (activeLeaf && activeLeaf.getViewState().state.pinned) {
						return;
					}
					
					// If not pinned or no active leaf, execute original behavior
					if (this.originalCloseCallback) {
						this.originalCloseCallback();
					}
				};
			}
		});
	}

	onunload() {
		// Restore the original close command callback
		const closeCommand = this.app.commands.commands['workspace:close'];
		if (closeCommand && this.originalCloseCallback) {
			closeCommand.callback = this.originalCloseCallback;
		}
		
		new Notice('Prevent Close Pinned Tab Unloaded!');
	}
}