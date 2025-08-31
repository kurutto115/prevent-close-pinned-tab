import { Plugin, WorkspaceLeaf } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
    // 以前にピン留めされていたタブの状態を追跡するためのSet
    private previouslyPinnedLeaves: WeakSet<WorkspaceLeaf> = new WeakSet();

    onload() {
        this.app.workspace.onLayoutReady(() => {
            console.log('PreventClosePinnedTabPlugin: Initializing...');
            this.updatePinnedState();

            // レイアウトの変更（タブの開閉、ピン留め状態の変更など）を監視
            this.registerEvent(this.app.workspace.on('layout-change', () => {
                console.log('%c--- Layout change detected ---', 'color: blue');
                this.app.workspace.iterateAllLeaves(leaf => {
                    const isPinned = leaf.getViewState()?.state?.pinned;
                    const wasPinned = this.previouslyPinnedLeaves.has(leaf);
                    const leafText = (leaf.view as any).title || leaf.getViewState()?.state?.title || '(no name)';

                    console.log(`Checking leaf: "${leafText}", Pinned: ${isPinned}, Was Pinned: ${wasPinned}`);

                    // 以前ピン留めされていたのに、現在ピン留めされていない場合
                    if (wasPinned && !isPinned) {
                        // 即座に再度ピン留めする
                        console.log(`%c!!! Attempting to re-pin: "${leafText}"`, 'color: orange; font-weight: bold;');
                        leaf.setPinned(true);
                    }
                });

                // 現在の状態を更新
                this.updatePinnedState();
                console.log('%c--- Finished layout-change handler ---', 'color: blue');
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

    onunload() {
        console.log('PreventClosePinnedTabPlugin: Unloaded.');
    }
}