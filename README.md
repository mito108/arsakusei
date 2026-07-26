# 🎨 幻想都市の白い鳥の群れ

*Fantasy Birds Over Imaginary City - WebAR Animation*

スマートフォンのQRコードから開く、インタラクティブなWeb アニメーション。

幻想的な都市景観の背景から、白い鳥の群れが遠方から飛んできて、画面手前を横切り、再び奥へ飛び去ります。

## 🎬 デモ

GitHub Pages で公開されています：

```
https://mito108.github.io/arsakusei
```

またはQRコードをスマートフォンで読み取ってアクセス

## ✨ 特徴

- **3D奥行き表現**: PerspectiveCamera による自然な遠近感
- **Boids アルゴリズム**: 約50羽の自然な群飛動作
- **背景統合**: 幻想都市の景観と鳥が一体化した演出
- **個体差**: 各鳥の速度・軌道・羽ばたきがすべて異なる
- **複合フェーズ**:
  - Phase 1: 遠景から出現
  - Phase 2: 群れを形成しながら接近
  - Phase 3: 画面前方で旋回
  - Phase 4: 飛び去る
  - Phase 5: 2.5秒の静寂
  - Phase 6: 再出現
  - Phase 7: 最終旋回
  - Phase 8: 奥へ帰る
  - Phase 9: 白い羽根が漂う

## 📱 対応環境

- **推奨**: iPhone Safari, Android Chrome
- **最適化**: スマートフォン縦画面
- **最低要件**: WebGL対応ブラウザ
- **フレームレート**: 30-60fps (最適化で調整可能)

## 📂 ファイル構成

```
arsakusei/
├── index.html          # メインHTML
├── style.css           # スタイルシート
├── script.js           # アニメーションロジック
├── config.js           # 設定ファイル（重要！）
├── README.md           # このファイル
└── assets/
    ├── background.png          # 背景画像（幻想都市）
    ├── bird-reference.png      # 鳥の配置参考画像
    └── bird.glb                # (オプション) 3Dモデル
```

## 🚀 GitHub Pages で公開する手順

### 1. GitHub にファイルをアップロード

```bash
# ローカルでリポジトリをクローン
git clone https://github.com/mito108/arsakusei.git
cd arsakusei

# ファイルをコピー
# index.html, style.css, script.js, config.js を配置

# assets/ ディレクトリを作成
mkdir -p assets

# 背景画像を配置（以下で説明）
```

### 2. 背景画像を設定

**重要**: `assets/background.png` を用意してください

```bash
# 背景画像をassets/に配置
cp /path/to/fantasy-city-image.png assets/background.png
```

背景画像の要件：
- **形式**: PNG または JPEG
- **推奨サイズ**: 1920 × 1080px 以上
- **アスペクト比**: 16:9 推奨
- **内容**: 幻想的な都市風景

### 3. 鳥の参考画像を配置（オプション）

開発時に鳥の配置を確認する場合：

```bash
cp /path/to/bird-reference-image.png assets/bird-reference.png
```

この画像は本番では表示されません（開発用リファレンス）

### 4. GitHub へ Push

```bash
git add .
git commit -m "Add fantasy birds animation with background image"
git push origin main
```

### 5. GitHub Pages を有効化

1. GitHub のリポジトリページを開く
2. **Settings** → **Pages** に移動
3. **Source** を `main` ブランチに設定
4. 数秒待つと自動的に公開されます

### 6. 公開URL を確認

**Settings** → **Pages** に表示される URL：

```
https://mito108.github.io/arsakusei
```

## 📲 QRコード化する

公開URL を QRコード化：

1. Google QR Code Generator を利用：
   ```
   https://www.qr-code-generator.com/
   ```

2. または オンラインツール：
   ```
   https://qr.io/
   ```

3. 生成したQRコードを印刷またはスクリーンショット

## 🎛️ 設定を変更する

**config.js** で以下の項目を調整可能：

### 鳥の数を変更

```javascript
// config.js
const CONFIG = {
    MAX_BIRDS: 50,        // 30, 50, 100 など自由に変更
    // ...
};
```

### 出現時間を変更

```javascript
// 最初の鳥が現れるまでの時間（秒）
FIRST_BIRD_TIME: 0.5,

// 全体の群れが完成する時間
FULL_FLOCK_TIME: 8.0,

// 鳥が飛び去り始める時間
FIRST_FLY_OUT_TIME: 15.0,

// 再出現まで待つ時間
EMPTY_SCENE_DURATION: 2.5,
```

### 鳥の速度を変更

```javascript
// 最遅・最速
MIN_SPEED: 0.35,
MAX_SPEED: 1.8,

// 層ごとの速度倍率
DISTANT_SPEED_MULT: 0.4,      // 遠景（遅い）
MIDGROUND_SPEED_MULT: 0.8,    // 中景
FOREGROUND_SPEED_MULT: 1.2,   // 近景（速い）
```

### 群れの大きさを変更

```javascript
// 旋回軌道の半径（X, Y, Z）
FLOCK_RADIUS_X: 8.0,
FLOCK_RADIUS_Y: 5.0,
FLOCK_RADIUS_Z: 6.0,
```

### 奥行き層の位置を変更

```javascript
// Z座標（負の値ほど遠い）
DISTANT_Z: -30,         // 最も遠い（城・山）
BACKGROUND_Z: -18,      // 遠景
MIDGROUND_Z: -8,        // 中景
FOREGROUND_Z: -2.5,     // 近景（画面手前）
```

## 📊 スマートフォンで確認

### 方法1: 同じWiFiネットワーク内で確認

```bash
# ローカルサーバーを起動
python -m http.server 8000

# または Node.js
npx http-server
```

ブラウザで `http://localhost:8000` にアクセス

スマートフォンから：
```
http://<PC-IP-ADDRESS>:8000
```

### 方法2: GitHub Pages で確認

公開されたURL をスマートフォンのブラウザで直接開く：
```
https://mito108.github.io/arsakusei
```

## 🎮 操作

1. ページを開く
2. 背景に「鳥たちを呼ぶ」ボタンが表示
3. ボタンをタップ
4. アニメーション開始
5. 鳥の群れが遠景から手前へ飛んでくる
6. 自動的にループ

## 🔧 3Dモデルを追加（オプション）

デフォルトでは Three.js Geometry で生成された簡易鳥を使用します。

高品質な3Dモデルを使用する場合：

```bash
# GLB形式のモデルを用意
cp /path/to/bird-model.glb assets/bird.glb
```

script.js が自動的に検出して読み込みます。

## ⚡ パフォーマンス最適化

スマートフォンで重い場合：

### 方法1: 鳥の数を減らす

```javascript
MAX_BIRDS: 30,  // デフォルト: 50
```

### 方法2: フレームレート目標を下げる

```javascript
TARGET_FPS: 30,  // デフォルト: 60
```

### 方法3: ディレイを増やす

```javascript
FRAME_TIME: 1.0 / 30,  // 30fps に設定
```

## 🐛 トラブルシューティング

### Q: 背景が表示されない

**A**: `assets/background.png` が正しく配置されているか確認

```bash
# ファイルが存在するか確認
ls -la assets/background.png

# GitHub Pages に反映されるまで数分待つ
```

### Q: 鳥が表示されない

**A**:
1. ブラウザのコンソール(F12)でエラーを確認
2. Three.js が正しく読み込まれているか確認
3. WebGL 対応ブラウザを使用しているか確認

### Q: アニメーションが遅い・フレームドロップ

**A**: 
1. 鳥の数を減らす（`MAX_BIRDS`）
2. 別のアプリを閉じる
3. ブラウザを再起動
4. デバイスの描画品質を下げる（ブラウザ設定）

### Q: 音声が再生されない

**A**: 現在はサウンド機能はありません。将来実装予定。

## 📚 技術仕様

### 使用技術
- **HTML5**: ドキュメント構造
- **CSS3**: スタイリング・レスポンシブ対応
- **JavaScript (ES6)**: ロジック実装
- **Three.js**: 3D グラフィックス
- **WebGL**: GPU描画

### ブラウザ互換性
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome for Android

### 鳥のアルゴリズム
- **Movement**: Boids Flocking Algorithm
- **Depth**: Perspective Camera による自然な3D
- **Animation State**: 独立した状態機械
- **Wing**: Sinusoidal animation

## 📖 デザイン背景

このプロジェクトは、以下の概念を融合させています：

1. **AR的な体験**: QRコードから起動、実在しない世界
2. **奥行き表現**: 2D画像と3Dアニメーションの融合
3. **自然な動き**: 鳥のリアルな飛行パターン
4. **瞑想的な美しさ**: Dreamlike, ethereal 雰囲気
5. **インタラクティブ**: ユーザー操作による開始

## 🤝 カスタマイズガイド

### 背景画像を変更

1. 新しい画像を作成: `my-background.png`
2. `assets/background.png` に上書き
3. GitHub に push
4. キャッシュをクリア（Ctrl+Shift+R）

### 鳥のカラーを変更

script.js の `createBirdMesh()` で色を編集：

```javascript
const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,  // 白を他の色に変更
    // ...
});
```

カラーコード例：
- `0xff0000` : 赤
- `0x00ff00` : 緑
- `0x0000ff` : 青
- `0xffff00` : 黄
- `0xff00ff` : マゼンタ

### タイムラインを完全にカスタマイズ

`config.js` の時間設定をすべて変更：

```javascript
const CONFIG = {
    FIRST_BIRD_TIME: 1.0,      // 1秒後に出現
    FLOCK_BUILD_START: 3.0,    // 3秒から群れ作成
    FULL_FLOCK_TIME: 10.0,     // 10秒で完成
    // ...
};
```

## 📄 ライセンス

MIT License - 自由に改変・配布・使用可能

## 💡 アイデア・フィードバック

バグ報告や機能提案は GitHub Issues で

## 🙏 謝辞

- Three.js コミュニティ
- WebGL 仕様策定者
- Boids アルゴリズム考案者 (Craig Reynolds)

---

**作成者**: mito108  
**最終更新**: 2026年7月26日  
**バージョン**: 2.0.0

*"幻想都市の空を舞う、白い鳥たちの物語"*
