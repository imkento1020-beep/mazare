# mazare ネイティブアプリ（Capacitor）

ストア配布向けの iOS / Android シェルです。**中身は本番 Web（https://www.mazare.app）**を WebView で表示し、既存の Next.js をそのまま使います。

## 前提

- Node 24（`package.json` の engines）
- iOS: **Xcode（フル版）**、CocoaPods（`brew install cocoapods`）、**最低 iOS 15**
  - Command Line Tools のみでは `pod install` は失敗します
  - `export LANG=en_US.UTF-8` をシェルに入れておくと CocoaPods エラーを防げます
- Android: Android Studio、JDK 17+

## 仕組み

| 項目 | 値 |
|------|-----|
| Bundle ID | `app.mazare.mobile` |
| 本番 URL | `https://www.mazare.app`（WebView。`mazare.app` は www へリダイレクトされるため直指定） |
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

シミュレータ / 実機で Run。アプリは `https://www.mazare.app/native/welcome` から起動し、ログイン or 新規登録の選択画面を表示します（ブラウザ版のランディング `/` は表示しません）。

**真っ暗な画面だけ出る場合:** 古い `capacitor.config` で `https://mazare.app` を開いていると、www へのリダイレクトが Capacitor にブロックされ真っ黒になることがあります。`npx cap sync ios` 後に Xcode でクリーンビルドしてください。

**戻る操作:** タブ直下以外の画面（プロフィール・お店・通知・メッセージ・編集など）では左上の戻るボタンが表示されます。履歴があれば前の画面へ、なければホームやマイページへ戻ります。

**Google で続ける:** ネイティブ WebView では Google のポリシーで OAuth が使えないため非表示です。ブラウザ版では引き続き利用できます。

**Xcode 27 で `UIScene life cycle is required` と落ちる場合:** `ios/App/App/SceneDelegate.swift` と `Info.plist` の `UIApplicationSceneManifest` が入っていることを確認してください（本リポジトリには同梱済み）。

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