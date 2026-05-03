# AI Site Factory

サイトファクトリー — Claude Codeで全自動運用するアフィリエイト/ディレクトリサイト群のモノレポ。

## ポートフォリオ
- **Site #1**: [whichaitool.com](https://whichaitool.com) — AIツール ディレクトリ+比較（**Phase 1: 構築中**）
- Site #2: 旅行スポット比較（予定）
- Site #3: パーソナルファイナンス比較（予定）
- Site #4: ノーコード/B2B SaaS比較（予定）
- Site #5: クリプト/Web3ツール（予定）

## 技術スタック
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (Postgres) + Vercel + Cloudflare
- npm workspaces (将来Turborepo化)

## ディレクトリ
```
apps/
  site-1-aitools/       Next.jsアプリ (whichaitool.com)
packages/
  (将来 @factory/* 共通パッケージ)
docs/
  (運用ドキュメント)
```

## セットアップ
```bash
# 依存インストール
npm install

# 開発サーバ
npm run dev
# → http://localhost:3000
```

## 必要な外部アカウント
- Supabase（既存）
- Vercel（既存）
- Cloudflare（DNS/CDN/Registrar用）
- Anthropic（Claude Pro/API）

## デプロイ
Vercelに繋いで自動。ドメインはCloudflareで管理し、VercelにDNSレコードで指す。

## ライセンス
Private — 個人運用専用
