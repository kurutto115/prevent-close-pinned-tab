import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';

// Variable to store the original detach method
const originalDetach = WorkspaceLeaf.prototype.detach;

export default class PreventClosePinnedTabPlugin extends Plugin {
	onload() {
		new Notice('Prevent Close Pinned Tab Loaded!');

		// Override WorkspaceLeaf.prototype.detach with our custom function
		WorkspaceLeaf.prototype.detach = function(...args: any[]) {
			const leaf = this as any; // 'this' refers to an instance of WorkspaceLeaf

			// If the leaf is pinned, interrupt the process without doing anything
			if (leaf.pinned) {
				return;
			}

			// If not pinned, call the original detach method
			return originalDetach.apply(this, args);
		};
	}

		onunload() {
			// When the plugin is disabled, be sure to restore the original method
			WorkspaceLeaf.prototype.detach = originalDetach;
			new Notice('Prevent Close Pinned Tab Unloaded!');
		}
	}