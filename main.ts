import { Plugin, Notice } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
	private originalCloseCallback: (() => void) | null = null;
	private originalExecuteCommandById: (id: string, ...args: any[]) => boolean;

	onload() {
		new Notice('Prevent Close Pinned Tab Loaded!');

		// Wait for workspace to be ready before accessing commands
		this.app.workspace.onLayoutReady(() => {
			// 500ミリ秒待ってからコマンドを探しに行く
			setTimeout(() => {

				// --- スパイコード開始 ---
				console.log("Setting up command spy...");
				this.originalExecuteCommandById = (this.app as any).commands.executeCommandById.bind((this.app as any).commands);
				(this.app as any).commands.executeCommandById = (id: string, ...args: any[]): boolean => {
					console.log(`Command executed: ${id}`);
					return this.originalExecuteCommandById(id, ...args);
				};
				// --- スパイコード終了 ---

				// Store the original close command callback
				const closeCommand = (this.app as any).commands?.commands?.['workspace:close'];
				if (closeCommand) {
					new Notice('Command "workspace:close" found. Overriding callback.');
					this.originalCloseCallback = closeCommand.callback;
					
					// Override the close command callback
					closeCommand.callback = () => {
						const activeLeaf = (this.app.workspace as any).activeLeaf;
						
						// --- ここから追加 ---
						if (activeLeaf) {
							new Notice(`Leaf detected. Pinned: ${activeLeaf.getViewState()?.state?.pinned}`);
						} else {
							new Notice('No active leaf.');
						}
						// --- ここまで追加 ---

						// If there's an active leaf and it's pinned, prevent closing
						if (activeLeaf && activeLeaf.getViewState()?.state?.pinned) {
							return;
						}
						
						// If not pinned or no active leaf, execute original behavior
						if (this.originalCloseCallback) {
							this.originalCloseCallback();
						}
					};
				} else {
					new Notice('Error: Command "workspace:close" NOT found.');
				}
			}, 500);
		});
	}

	onunload() {
		// Restore the original close command callback
		const closeCommand = (this.app as any).commands?.commands?.['workspace:close'];
		if (closeCommand && this.originalCloseCallback) {
			closeCommand.callback = this.originalCloseCallback;
		}

		// --- スパイ解除コード ---
		if (this.originalExecuteCommandById) {
			(this.app as any).commands.executeCommandById = this.originalExecuteCommandById;
			console.log("Command spy removed.");
		}
		// --- スパイ解除コード終了 ---
		
		new Notice('Prevent Close Pinned Tab Unloaded!');
	}
}