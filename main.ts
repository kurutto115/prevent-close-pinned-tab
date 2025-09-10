import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
  originalLeafMethods: WeakMap<WorkspaceLeaf, { 
    setPinned: (pinned: boolean) => void; 
    detach: () => void; 
  }>;
  cooldownLeaves: WeakMap<WorkspaceLeaf, boolean>;

  onload() {
    console.log('Loading Prevent Close Pinned Tab plugin');

    this.originalLeafMethods = new WeakMap();
    this.cooldownLeaves = new WeakMap();

    this.app.workspace.iterateAllLeaves(this.patchLeaf.bind(this));
  }

  onunload() {
    console.log('Unloading Prevent Close Pinned Tab plugin');
    this.app.workspace.iterateAllLeaves(this.unpatchLeaf.bind(this));
  }

  patchLeaf(leaf: WorkspaceLeaf): void {
    if (this.originalLeafMethods.has(leaf)) {
      return;
    }

    // プロトタイプメソッドを保存
    const originalSetPinned = WorkspaceLeaf.prototype.setPinned;
    const originalDetach = WorkspaceLeaf.prototype.detach;
    this.originalLeafMethods.set(leaf, { 
      setPinned: originalSetPinned.bind(leaf), 
      detach: originalDetach.bind(leaf) 
    });

    // パッチ適用
    leaf.setPinned = (pinned: boolean) => {
      originalSetPinned.call(leaf, pinned);
      if (!pinned) {
        this.cooldownLeaves.set(leaf, true);
        new Notice('ピン留めを解除しました。3秒間はタブを閉じられません。');
        setTimeout(() => {
          this.cooldownLeaves.delete(leaf);
        }, 3000);
      }
    };

    leaf.detach = () => {
      if (this.cooldownLeaves.has(leaf)) {
        new Notice('ピン留め解除直後のため、まだタブを閉じられません。');
        return;
      }
      originalDetach.call(leaf);
    };
  }

  unpatchLeaf(leaf: WorkspaceLeaf): void {
    const originalMethods = this.originalLeafMethods.get(leaf);
    if (originalMethods) {
      // プロトタイプメソッドに戻す
      leaf.setPinned = WorkspaceLeaf.prototype.setPinned;
      leaf.detach = WorkspaceLeaf.prototype.detach;
      this.originalLeafMethods.delete(leaf);
    }
  }
}