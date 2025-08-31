import { Plugin, WorkspaceLeaf } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
    // 以前にピン留めされていたタブの状態を追跡するためのSet
    private previouslyPinnedLeaves: WeakSet<WorkspaceLeaf> = new WeakSet();

    onload() {
        this.app.workspace.onLayoutReady(() => {
            this.updatePinnedState();

            // レイアウトの変更（タブの開閉、ピン留め状態の変更など）を監視
            this.registerEvent(this.app.workspace.on('layout-change', () => {
                this.app.workspace.iterateAllLeaves(leaf => {
                    const isPinned = leaf.getViewState()?.state?.pinned;
                    const wasPinned = this.previouslyPinnedLeaves.has(leaf);

                    // 以前ピン留めされていたのに、現在ピン留めされていない場合
                    if (wasPinned && !isPinned) {
                        // 即座に再度ピン留めする
                        leaf.setPinned(true);
                    }
                });

                // 現在の状態を更新
                this.updatePinnedState();
            }));
        });
    }

    // 現在のすべてのタブのピン留め状態を記録するヘルパー関数
    updatePinnedState() {
        this.previouslyPinnedLeaves = new WeakSet();
        this.app.workspace.iterateAllLeaves(leaf => {
            if (leaf.getViewState()?.state?.pinned) {
                this.previouslyPinnedLeaves.add(leaf);
            }
        });
    }

    onunload() {
        // クリーンアップは不要
    }
}
