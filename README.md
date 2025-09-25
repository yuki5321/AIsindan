# DermaAI - AI皮膚画像診断サポートシステム

DermaAIは、AIを活用して皮膚の状態に関する洞察を提供するWebアプリケーションです。ユーザーは皮膚の画像をアップロードしたり、症状を選択したりすることで、考えられる皮膚疾患の候補とその信頼度を確認できます。また、日々の症状を画像付きで記録できる日記機能も備えています。

## ✨ 主な機能

- **AI画像診断:** 皮膚の画像をアップロードすると、AIが分析し、関連する可能性のある皮膚疾患の候補を信頼度順に表示します。
- **症状診断:** 自覚症状をリストから選択することで、関連する疾患の可能性を絞り込みます。
- **症状日記:** 日付ごとにメモと画像を記録し、皮膚の状態の変化を追跡できます。カレンダー表示で過去の記録を簡単に振り返れます。
- **疾患情報モーダル:** 診断結果の各疾患について、詳細な概要や症状、治療法などを確認できます。
- **多言語対応:** UIは日本語、英語、韓国語、中国語に対応しています。（※現在の実装ではUIの一部が対応）

## 🛠️ 技術スタック

このプロジェクトは、以下の技術を使用して構築されています。

#### **フロントエンド**
- **React**: UI構築のためのメインライブラリ
- **TypeScript**: 型安全な開発を実現
- **Vite**: 高速なフロントエンド開発環境
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **Supabase.js**: Supabaseとの連携用クライアントライブラリ
- **Lucide React**: シンプルで美しいアイコンセット

#### **バックエンド**
- **Python**: バックエンドロジックの主要言語
- **Flask**: AIモデルをAPIとして提供するためのWebフレームワーク
- **TensorFlow (Keras)**: 画像診断AIモデルの構築と実行
- **Supabase-py**: Supabaseとの連携用クライアントライブラリ

#### **プラットフォーム**
- **Supabase**: オープンソースのFirebase代替
  - **PostgreSQL**: データベース
  - **Storage**: 画像ファイルの保存
  - **Auth**: ユーザー認証

## 🚀 セットアップ手順

このプロジェクトをローカル環境でセットアップし、実行するための手順です。

### 1. リポジトリをクローン
```bash
git clone <repository-url>
cd Derma-MNIST
```

### 2. Supabaseプロジェクトのセットアップ
このアプリケーションはSupabaseをバックエンドとして利用します。
1. [Supabase公式サイト](https://supabase.com/)でアカウントを作成し、新しいプロジェクトを開始します。
2. プロジェクトを作成したら、プロジェクトのURLと`anon`キーを控えておきます。（プロジェクト設定の `API` タブで確認できます）

### 3. 環境変数の設定
プロジェクトのルートディレクトリに `.env` という名前のファイルを作成し、以下の内容を記述します。

```
# .env

# SupabaseのプロジェクトURLとanonキー
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
```
`YOUR_SUPABASE_URL` と `YOUR_SUPABASE_ANON_KEY` を、ステップ2で控えた自身のものに置き換えてください。

### 4. データベースのマイグレーション
ローカルのスキーマ定義を、Supabase上のデータベースに適用します。
1. Supabase CLIをインストール・ログインします。
   ```bash
   npm install -g supabase
   supabase login
   ```
2. プロジェクトをリンクします。`YOUR_PROJECT_REF`はプロジェクト設定の`General`タブで確認できます。
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
3. データベースの変更を適用します。
   ```bash
   supabase db push
   ```

### 5. Supabaseストレージのセットアップ
日記機能でアップロードされた画像を保存するためのストレージ（バケット）を作成します。

1. Supabaseダッシュボードの左メニューから**ストレージ**を開きます。
2. 「**New bucket**」をクリックします。
3. バケット名を `diary-images` とし、「**Public bucket**」を**ON**にして作成します。
4. 左メニューから**SQLエディタ**を開き、「**+ New query**」をクリックして、以下のSQLをすべて貼り付けて実行し、セキュリティポリシーを設定します。
   ```sql
   -- Public read access
   CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING ( bucket_id = 'diary-images' );
   -- Allow authenticated users to upload
   CREATE POLICY "Allow uploads for own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'diary-images' AND (storage.foldername(name))[1] = auth.uid()::text );
   -- Allow authenticated users to update their own images
   CREATE POLICY "Allow updates for own images" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'diary-images' AND (storage.foldername(name))[1] = auth.uid()::text );
   -- Allow authenticated users to delete their own images
   CREATE POLICY "Allow deletes for own images" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'diary-images' AND (storage.foldername(name))[1] = auth.uid()::text );
   ```

### 6. 依存関係のインストール
#### フロントエンド
```bash
npm install
```

#### バックエンド
```bash
cd backend
pip install -r requirements.txt
```

## 🏃 アプリケーションの実行

### 1. バックエンドサーバーの起動
まず、バックエンドのFlaskサーバーを起動します。
```bash
# /backend ディレクトリで実行
python src/app.py
```
サーバーは `http://127.0.0.1:5000` で起動します。

### 2. フロントエンドサーバーの起動
次に、別のターミナルを開き、プロジェクトのルートディレクトリでフロントエンドの開発サーバーを起動します。
```bash
# プロジェクトのルートディレクトリで実行
npm run dev
```
ブラウザで `http://localhost:5173` （またはターミナルに表示されたURL）にアクセスすると、アプリケーションが表示されます。

## 使い方

1. **サインアップ/ログイン:** まずはアカウントを作成してログインします。日記機能など、一部の機能はログインが必要です。
2. **画像診断:** トップページまたはナビゲーションから「画像診断」ページに移動し、ファイルを選択するかカメラで撮影して画像をアップロードし、「AI診断を開始」ボタンを押します。
3. **症状で絞り込み:** 画像診断の結果が出たら、右側の症状選択エリアで自覚症状を追加し、「選択した症状で絞り込む」ボタンを押すと、診断候補の信頼度が更新されます。
4. **症状日記:** ナビゲーションから「症状日記」ページに移動します。カレンダーの日付を選択し、「記録を追加」ボタンからその日のメモと画像を保存できます。