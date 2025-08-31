import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
    // 保護中のタブを管理（WeakMapを使用）
    private protectedLeaves: WeakMap<WorkspaceLeaf, number> = new WeakMap();
    // 保護時間（ミリ秒）
    private PROTECTION_DURATION = 5000; // 5秒
    
    // 以前にピン留めされていたタブの追跡
    private previouslyPinnedLeaves: WeakSet<WorkspaceLeaf> = new WeakSet();
    
    onload() {
        this.app.workspace.onLayoutReady(() => {
            console.log('PreventClosePinnedTabPlugin: Initializing...');
            this.updatePinnedState();

            // レイアウトの変更（タブの開閉、ピン留め状態の変更など）を監視
            this.registerEvent(this.app.workspace.on('layout-change', () => {
                this.app.workspace.iterateAllLeaves(leaf => {
                    const isPinned = leaf.getViewState()?.state?.pinned;
                    const wasPinned = this.previouslyPinnedLeaves.has(leaf);
                    
                    // ピン留め解除を検知したら保護モードに
                    if (wasPinned && !isPinned) {
                        console.log(`%c!!! Protecting tab for ${this.PROTECTION_DURATION/1000}s`, 'color: orange');
                        this.protectLeaf(leaf);
                        
                        // ユーザーへの通知
                        const leafTitle = (leaf.view as any).title || 'タブ';
                        new Notice(`🛡️ ${leafTitle} は ${this.PROTECTION_DURATION/1000}秒間保護されます`, 3000);
                    }
                });
                
                // 現在の状態を更新
                this.updatePinnedState();            
            }));
        });
    }

    // 現在のすべてのタブのピン留め状態を記録するヘルパー関数
    updatePinnedState() {
        console.log('--- Updating pinned state cache ---');
        this.previouslyPinnedLeaves = new WeakSet();
        this.app.workspace.iterateAllLeaves(leaf => {
            if (leaf.getViewState()?.state?.pinned) {
                const leafText = (leaf.view as any).title || leaf.getViewState()?.state?.title || '(no name)';
                console.log(`Caching pinned leaf: "${leafText}"`);
                this.previouslyPinnedLeaves.add(leaf);
            }
        });
    }

    // 保護モードのチェック
    private isProtected(leaf: WorkspaceLeaf): boolean {
        const protectionEndTime = this.protectedLeaves.get(leaf);
        if (!protectionEndTime) return false;
        
        const now = Date.now();
        if (now >= protectionEndTime) {
            // 保護期間終了
            this.protectedLeaves.delete(leaf);
            return false;
        }
        return true;
    }
    
    // タブを保護モードにする
    private protectLeaf(leaf: WorkspaceLeaf) {
        const protectionEndTime = Date.now() + this.PROTECTION_DURATION;
        this.protectedLeaves.set(leaf, protectionEndTime);
        
        // 保護期間終了後に自動解除
        setTimeout(() => {
            this.protectedLeaves.delete(leaf);
        }, this.PROTECTION_DURATION);
    }

    onunload() {
        console.log('PreventClosePinnedTabPlugin: Unloaded.');
    }
}

// 設定クラス
// interface PreventClosePinnedTabSettings {
//     protectionDuration: number;
// }

// const DEFAULT_SETTINGS: PreventClosePinnedTabSettings = {
//     protectionDuration: 5
// };

// 設定タブの実装
// class PreventClosePinnedTabSettingTab extends PluginSettingTab {
//     plugin: PreventClosePinnedTabPlugin;

//     constructor(app: App, plugin: PreventClosePinnedTabPlugin) {
//         super(app, plugin);
//         this.plugin = plugin;
//     }

//     display(): void {
//         const { containerEl } = this;
//         containerEl.empty();

//         new Setting(containerEl)
//             .setName('保護時間')
//             .setDesc('ピン留め解除後の保護時間（秒）')
//             .addSlider(slider => slider
//                 .setLimits(1, 30, 1)
//                 .setValue(this.plugin.settings.protectionDuration)
//                 .setDynamicTooltip()
//                 .onChange(async (value) => {
//                     this.plugin.settings.protectionDuration = value;
//                     this.plugin.PROTECTION_DURATION = value * 1000;
//                     await this.plugin.saveSettings();
//                 }));
//     }
// }