import { Plugin } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {

	onload() {
		this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
			// --- 検証用ログ ---
			console.log(`Keydown event fired: ${evt.key}, Ctrl: ${evt.ctrlKey}, Meta: ${evt.metaKey}`);
			// --- 検証用ログ終了 ---

			// Check for Ctrl/Cmd + W
			if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'w') {
				const activeLeaf = (this.app.workspace as any).activeLeaf;

				// If there is an active leaf and it is pinned, prevent the default action
				if (activeLeaf && activeLeaf.getViewState()?.state?.pinned) {
					evt.preventDefault();
					evt.stopPropagation();
				}
			}
		}, true); // <--- キャプチャフェーズで実行するためにtrueを追加
	}

	onunload() {
		// All registered DOM events are automatically cleaned up by Obsidian when the plugin is disabled.
	}
}