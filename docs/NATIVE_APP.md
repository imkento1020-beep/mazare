# mazare ネイティブアプリ（Capacitor）

ストア配布向けの iOS / Android シェルです。**中身は本番 Web（https://mazare.app）**を WebView で表示し、既存の Next.js をそのまま使います。

## 前提

- Node 24（`package.json` の engines）
- iOS: **Xcode（フル版）**、CocoaPods（`brew install cocoapods`）
  - Command Line Tools のみでは `pod install` は失敗します
  - `export LANG=en_US.UTF-8` をシェルに入れておくと CocoaPods エラーを防げます
- Android: Android Studio、JDK 17+

## 仕組み

| 項目 | 値 |
|------|-----|
| Bundle ID | `app.mazare.mobile` |
| 本番 URL | `https://mazare.app`（WebView） |
| URL スキーム（iOS） | `mazare://` |

アプリ本体はネイティブシェルで、機能は本番 Web と同一です。ストア審査用のアイコン差し替えは `@capacitor/assets` で行えます。

## 初回セットアップ

```bash
npm install
npx cap sync
```

`ios/` と `android/` が生成されていない場合:

```bash
npx cap add ios
npx cap add android
npx cap sync
```

## 開発

### 本番 URL をアプリ内で表示（通常）

```bash
npx cap open ios      # Xcode
npx cap open android  # Android Studio
```

シミュレータ / 実機で Run。アプリは `https://mazare.app` を開きます。

### ローカル Next と接続

```bash
# ターミナル1
npm run dev

# ターミナル2
CAPACITOR_USE_LOCAL=1 npx cap sync
npx cap open ios
```

実機から Mac の dev サーバーへ繋ぐ場合は `CAPACITOR_DEV_URL=http://<LAN IP>:3000` を指定してください。

## ストア提出前チェック

| 項目 | メモ |
|------|------|
| Bundle ID | `app.mazare.mobile`（`capacitor.config.ts`） |
| 表示名 | mazare |
| プライバシー | App Store / Play Console に `https://mazare.app/privacy` を記載 |
| スクリーンショット | 実機で取得 |
| Apple Developer | 年 $99 |
| Google Play | 登録 $25（一回） |

### アイコン・スプラッシュ

`public/icon-512.png` などから生成する場合:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --ios --android
```

## 認証（メールリンク）

v1 は **アプリ内 WebView で本番サイトを表示**するため、Supabase のリダイレクトは従来どおり `https://mazare.app/auth/callback` を利用できます。将来カスタム URL スキーム（`mazare://`）や Universal Links を足す場合は Supabase の Redirect URLs を追加してください。

## ディレクトリ

- `capacitor.config.ts` — アプリ ID・本番 URL
- `native/www/` — オフライン時の最小 HTML（通常は未使用）
- `ios/` / `android/` — ネイティブプロジェクト（リポジトリに含める）

## よく使うコマンド

```bash
npm run cap:sync   # Web 設定をネイティブへ反映
npm run cap:ios
npm run cap:android
```