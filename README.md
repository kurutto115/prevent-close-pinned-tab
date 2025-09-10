# Prevent Close Pinned Tab for Obsidian

This plugin prevents accidentally closing pinned tabs in [Obsidian](https://obsidian.md) by implementing a cooldown mechanism after unpinning.

このプラグインは、[Obsidian](https://obsidian.md)でピン留めされたタブが誤って閉じられるのを防ぐために、ピン留め解除後にクールダウン機能を設けます。

## 背景 Background

When you try to close a pinned tab in Obsidian, the tab does not close but instead gets unpinned. This can result in accidentally losing important pinned tabs if you perform consecutive close operations. This plugin prevents this by:

Obsidianではピン留めされたタブを閉じようとすると、タブは閉じませんがピン留めが解除されます。これにより、連続してタブを閉じる操作を行った場合に、重要なピン留めタブを誤って失う可能性があります。このプラグインは以下のようにこれを防ぎます：

## 機能 Features

### クールダウン機能 Cooldown Feature
- **3-second cooldown after unpinning**: When you unpin a tab, you cannot close it for 3 seconds to prevent accidental closure.
  （ピン留めを解除すると、誤操作を防ぐために3秒間そのタブを閉じられません。）
- **Visual feedback**: Shows notifications when actions are blocked.
  （操作がブロックされた際に通知を表示します。）

### 技術仕様 Technical Details
- **Method patching**: Uses advanced method patching on `WorkspaceLeaf` instances for reliable interception.
  （信頼性の高い捕捉のために、`WorkspaceLeaf`インスタンスのメソッドパッチングを使用します。）
- **Memory efficient**: Uses WeakMap for automatic cleanup when tabs are destroyed.
  （WeakMapを使用することで、タブ破棄時の自動クリーンアップを実現します。）

## 使い方 How to use

1.  Install `Prevent Close Pinned Tab` from the Community Plugins in Obsidian. 
    （Obsidianのコミュニティプラグインから`Prevent Close Pinned Tab`をインストールします。）
2.  Enable the plugin.（プラグインを有効にします。）

That's it. The plugin will automatically protect your pinned tabs and prevent accidental closures.

これだけで、プラグインが自動的にピン留めタブを保護し、誤った閉じる操作を防ぎます。

### 動作例 Usage Examples

- **After unpinning**: Unpin tab → Notification "ピン留めを解除しました。3秒間はタブを閉じられません。" → Cannot close for 3 seconds
  （ピン留め解除後：ピン留め解除 → 「ピン留めを解除しました。3秒間はタブを閉じられません。」通知 → 3秒間閉じられない）

- **Normal tab**: Unpinned tab closes normally without restrictions.
  （通常タブ：ピン留めされていないタブは制限なく閉じられます。）

## 作者 Author

[kurutto115](https://github.com/kurutto115)

## ライセンス License

[MIT License](LICENSE)