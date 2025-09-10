import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';

export default class PreventClosePinnedTabPlugin extends Plugin {
  originalLeafMethods: WeakMap<WorkspaceLeaf, { 
    setPinned: (pinned: boolean) => void; 
    detach: () => void; 
  }>;
  cooldownLeaves: WeakMap<WorkspaceLeaf, boolean>;
  private cooldownTimeouts: Map<string, NodeJS.Timeout> = new Map();

  onload() {
    console.log('Loading Prevent Close Pinned Tab plugin');

    this.originalLeafMethods = new WeakMap();
    this.cooldownLeaves = new WeakMap();

    // 既存のタブにパッチを適用
    this.app.workspace.iterateAllLeaves(this.patchLeaf.bind(this));

    // 新しいタブが開かれたときにパッチを適用するためにイベントリスナーを登録
    this.registerEvent(this.app.workspace.on('layout-change', () => {
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (!this.originalLeafMethods.has(leaf)) {
          this.patchLeaf(leaf);
        }
      });
    }));
  }

  onunload() {
    console.log('Unloading Prevent Close Pinned Tab plugin');
    
    // 全てのタイムアウトをクリア
    for (const timeout of this.cooldownTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.cooldownTimeouts.clear();
    
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
        
        // leafにユニークなキーを作成してタイムアウトを管理し、メモリリークを防止
        const leafKey = this.getLeafKey(leaf);
        if (this.cooldownTimeouts.has(leafKey)) {
          clearTimeout(this.cooldownTimeouts.get(leafKey)!);
        }
        
        const timeout = setTimeout(() => {
          this.cooldownLeaves.delete(leaf);
          this.cooldownTimeouts.delete(leafKey);
        }, 3000);
        
        this.cooldownTimeouts.set(leafKey, timeout);
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
      
      // 関連するタイムアウトをクリア
      const leafKey = this.getLeafKey(leaf);
      if (this.cooldownTimeouts.has(leafKey)) {
        clearTimeout(this.cooldownTimeouts.get(leafKey)!);
        this.cooldownTimeouts.delete(leafKey);
      }
    }
  }

  private getLeafKey(leaf: WorkspaceLeaf): string {
    // leafのメモリアドレスをキーとして使用
    return leaf.constructor.name + '_' + (leaf as any).containerEl?.id || 'unknown';
  }
}