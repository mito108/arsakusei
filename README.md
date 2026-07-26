# 🎨 WebAR Fantasy Bird Flock Animation

白いファンタジー鳥の群れが、印刷されたアート作品からスマートフォンをかざすと飛び出す、自然な群飛アニメーション。

## 📱 デモ

https://mito108.github.io/arsakusei

## ✨ 特徴

- **自然な群飛動作**: Boidsアルゴリズムを使用した本当のような群れの動き
- **羽ばたきアニメーション**: 各鳥が独立した羽ばたき・滑空サイクルを実行
- **奥行き表現**: 手前と奥の鳥で異なる速度・サイズで3D感を表現
- **個体差**: 各鳥が異なる速度、軌道、羽ばたきパターンで飛ぶ
- **風の影響**: リアルな風の影響と羽根のゆっくりした落下
- **60fps対応**: スマートフォンでも滑らかに動作
- **カスタマイズ性**: コード内の定数で簡単に調整可能

## 🎬 アニメーション流れ

### タイムライン

```
0秒      → 白い1羽の鳥が絵の中から飛び出す
0～8秒   → 次々と鳥が飛び出し、最終的に50羽の群れを形成
5～8秒   → 大きな円軌道で旋回する群れ
8秒      → 群れが一度画面外へ飛び去る
8～10.5秒 → 画面外で待機（鳥がいない状態）
10.5秒   → 遠方から群れが再び現れ、元の位置へ戻る
13秒     → すべての鳥が消え、白い羽根が数枚ふんわり落ちる
```

## 🎛️ 調整ガイド

すべての設定は`script.js`の先頭にある定数で調整できます。

### 1. 鳥の数を変更

```javascript
const MAX_BIRDS = 50;  // 30, 50, 100など任意の数に変更可能
```

### 2. 飛び出すスピードを調整

```javascript
const FLY_OUT_START_TIME = 0;   // 開始時刻
const FLY_OUT_END_TIME = 8;     // 終了時刻（4秒で高速、12秒でゆっくり）
```

### 3. 全体的な飛行速度を調整

```javascript
const SPEED_MULTIPLIER = 1.0;  // 0.5で半速、2.0で2倍速
```

### 4. 群れの旋回範囲を調整

```javascript
const FLOCK_ORBIT_RADIUS = 30;  // 15で小さい円、60で大きい円
```

### 5. 飛行高度を調整

```javascript
const FLOCK_HEIGHT = 15;  // 5で低い高さ、30で高い高さ
```

### 6. 群れのまとまり感を調整

```javascript
// より密集させる
const COHESION_STRENGTH = 0.5;      // デフォルト: 0.3
const SEPARATION_STRENGTH = 0.5;    // デフォルト: 0.8

// より分散させる
const COHESION_STRENGTH = 0.1;      // デフォルト: 0.3
const SEPARATION_STRENGTH = 1.2;    // デフォルト: 0.8
```

### 7. 羽ばたき速度を調整

```javascript
const FLAP_CYCLE_TIME = 0.6;  // 0.3で速い、1.0でゆっくり
```

### 8. 画面外の待機時間を調整

```javascript
const RETURN_DELAY = 2.5;  // 秒単位で調整
```

## 🎨 その他のビジュアルパラメータ

```javascript
// 奥行き感
const SIZE_VARIATION = 0.7;     // サイズの差（大きいほど奥行き強調）
const DEPTH_SCALE = 1.5;        // 奥行きによる速度差

// 風
const WIND_STRENGTH = 2;        // 風の強さ
const WIND_FREQUENCY = 0.3;     // 風の周期

// フロッキング
const SEPARATION_DISTANCE = 3;  // 鳥同士の最小距離
const ALIGNMENT_STRENGTH = 0.5; // 方向そろえの強さ
```

## 🏗️ ファイル構成

```
arsakusei/
├── index.html       # HTMLファイル
├── style.css        # スタイルシート
├── script.js        # メインアニメーションロジック（調整はここ）
└── README.md        # このファイル
```

## 🚀 使用方法

### ローカルで実行

1. ファイルをダウンロード
2. `index.html`をブラウザで開く

### ローカルサーバーで実行（推奨）

```bash
# Python 3.x
python -m http.server 8000

# または Node.js (http-server)
npx http-server
```

ブラウザで `http://localhost:8000` にアクセス

### GitHub Pagesで公開

1. このリポジトリを自分のアカウントにフォーク、またはクローン
2. Settings → Pages → Source を `main`（またはデプロイするブランチ）に設定
3. 数秒後、GitHub Pagesで自動的に公開されます

## 🎨 ビジュアルデザイン

### 鳥の特徴

- **色**: 白（ゴールドのクチバシ）
- **スタイル**: ファンタジーRPG風
- **翼**: 細長く美しいデザイン
- **発光**: 微かな青紫色の発光で神秘的

### 雰囲気

- Dreamlike（夢のような）
- Fantasy RPG（ファンタジーRPG）
- Ethereal（幽玄な）
- Magical（魔法的）
- Cinematic（映画的）
- Elegant（上品）

## 🔬 技術的詳細

### Boidsアルゴリズム

群れの自然な動きは、以下の3つの力を組み合わせることで実現：

- **Separation**: 鳥同士が互いに近づきすぎないようにする
- **Alignment**: 周囲の鳥と同じ方向に飛もうとする
- **Cohesion**: 群れの中心に向かおうとする

### 羽ばたきアニメーション

各鳥が独立した状態機械を持つ：

```
FLAPPING → GLIDING → BANKING_TURN → FLAPPING...
```

### 奥行き表現

カメラから距離が異なる3層の鳥を混在：

- **Foreground**: カメラ近く、高速、大きく表示
- **Midground**: 中程度の距離、中速
- **Background**: 遠方、低速、小さく表示

## 📊 パフォーマンス

- **対応ブラウザ**: Chrome、Firefox、Safari、Edge（WebGL対応）
- **推奨環境**: スマートフォン（iOS/Android）、タブレット、PC
- **目標フレームレート**: 60fps
- **最適化**: InstancedMesh対応可、軽量ジオメトリを使用

## 🐛 トラブルシューティング

### アニメーションが表示されない

- ブラウザが WebGL に対応しているか確認
- ブラウザのコンソールでエラーを確認
- Three.js が正しく読み込まれているか確認

### パフォーマンスが低い

- `MAX_BIRDS` を減らしてみる
- `SPEED_MULTIPLIER` を減らしてみる
- ブラウザのハードウェアアクセラレーションを有効化

## 📝 ライセンス

MIT License

## 👨‍💻 作成者

mito108

## 🤝 フィードバック

バグ報告や機能提案は Issues でお願いします！

---

**楽しいWebAR体験をお楽しみください！** ✨🐦