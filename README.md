# Commit Quest

GitHubのコミット情報を取得し、RPG風のUIで可視化するMVPです。

Repositoryを「エリア」、Commitを「クエスト」に見立て、GitHub上の開発活動を冒険として表示します。

## なぜこの技術構成にしたか

React 19 / TypeScript / Vite 6 / TanStack Router / TanStack Query / Tailwind CSS 4 / Turborepo / pnpm / GitHub REST API という技術スタックを、小規模でも一通り動くアプリケーションとして実際に使い、以下を経験・説明できる状態にすることを目的としています。

- APIから取得したServer StateをTanStack Queryで管理した経験
- SPAのルーティングをTanStack Routerで型安全に構築した経験
- Tailwind CSS 4でRPG風の独自UIを構築した経験
- TurborepoでWeb/API/共通型をモノレポ管理した経験
- 抽象的な「RPGっぽいUI」を具体的な画面・挙動へ落とし込んだ経験

### Why TanStack Query

API由来のServer StateをReactのローカルstateから分離し、fetch/cache/refetch/error/loadingを宣言的に管理するため。`staleTime` によるキャッシュ共有により、同じデータへ戻ったときの再取得待ちを減らせます。

### Why TanStack Router

SPAのルーティングとURL state（username / owner / repo / sha / page）をTypeScriptで型安全に管理するため。File-based routingによりRoute構造がディレクトリ構造から把握しやすくなります。

### Why Tailwind CSS

UIコンポーネント単位で高速にスタイルを構築し、RPGのコマンドウィンドウ風という独自UIを実装するため。CSS-first configuration（`@theme`）でデザイントークンをCSS側に閉じ込めています。

### Why Turborepo

Web / API / 共通型（packages/types）を1リポジトリで管理し、複数package間の依存関係とbuild/lint/typecheckタスクを整理するため。

## Architecture

```text
commit-quest/
├─ apps/
│  ├─ web/    React 19 + Vite 6 + TanStack Router/Query + Tailwind CSS 4 (SPA)
│  └─ api/    Hono on Cloudflare Workers (GitHub REST APIラッパー)
├─ packages/
│  ├─ types/  API DTO（apps/web・apps/apiで共有）
│  ├─ ui/     RPG風共通UIコンポーネント（RpgPanel / RpgButton / XpBar など）
│  └─ config/ 共通tsconfig / eslint設定
```

### Cloudflare Workers統合デプロイ構成

本番では `apps/web` のビルド成果物（`apps/web/dist`）を、`apps/api` の同一Workerが **Static Assets** としてそのまま配信します。

- `apps/api/wrangler.jsonc` の `assets.directory` が `../web/dist` を指す
- `assets.not_found_handling: "single-page-application"` により、`/users/octocat/world` のような深いURLへの直アクセス・リロードでも `index.html` が返り、TanStack Router側でルーティングされる（SPA fallback）
- `assets.run_worker_first: ["/api/*"]` により、`/api/*` 配下のリクエストのみ先にWorker（Hono）が処理し、それ以外は静的アセット配信が優先される
- つまり **WebとAPIは同一オリジン・同一Workerとしてデプロイされ**、Web側は相対パス `/api/...` でバックエンドへアクセスする（CORS設定が不要）

## Setup

```bash
corepack enable
pnpm install
```

GitHub APIへの認証なしアクセスは60 req/h（IP単位）に制限されます。ローカル開発でレート制限に当たりやすい場合は、`apps/api/.dev.vars` にfine-grained PAT（public repository read-only権限で十分）を設定してください。未設定でも動作します。

```env
# apps/api/.dev.vars
GITHUB_TOKEN=github_pat_xxxxxxxx
```

## 起動方法

```bash
pnpm dev
```

- Web: http://localhost:5173 （Vite dev server。`/api` を8787へproxy）
- API: http://localhost:8787 （`wrangler dev`。Hono on Workers）

## Environment Variables

### apps/api

| 変数           | 用途                                                      | 必須 |
| -------------- | ----------------------------------------------------------- | ---- |
| `GITHUB_TOKEN` | GitHub REST APIへのリクエストに使用するfine-grained PAT。未設定でも動作するが、レート制限が60 req/hに制限される | 任意 |

GitHub Tokenは`apps/api`（サーバー側）にのみ保持され、Web（ブラウザ）へは一切渡りません。

### apps/web

ビルド後は同一Workerから配信されるため、`VITE_API_BASE_URL` のような環境変数は不要です（`/api` への相対パスでアクセスします）。

## 技術スタックと各ライブラリの利用理由

| ライブラリ                | 利用理由                                                             |
| -------------------------- | ---------------------------------------------------------------------- |
| React 19                   | UIライブラリ                                                           |
| TypeScript                 | 型安全性の確保                                                         |
| Vite 6                     | 高速な開発サーバー・ビルド                                             |
| TanStack Router            | 型安全なfile-based routing、URL stateの管理                            |
| TanStack Query             | Server Stateの取得・キャッシュ・エラー/ローディング管理                |
| Tailwind CSS 4              | CSS-first configurationによる高速なRPG風UI構築                         |
| Hono                       | Cloudflare Workers上で動く軽量HTTPフレームワーク（API側）              |
| Turborepo / pnpm workspace | Web/API/共通型のmonorepo管理、build/lint/typecheckタスクのオーケストレーション |

## MVP Scope

実装したもの:

- GitHub username入力 → Player Dashboard / World Map / Repository Detail / Commit Detail
- RPGメタファー（Level / XP / Quest / QUEST CLEAR!）
- Loading（Loading Quest...） / Error（QUEST FAILED） / Empty（NO QUESTS FOUND）状態
- GitHub TokenをAPI側にのみ保持
- TanStack QueryによるServer State管理とキャッシュ

実装しなかったもの（詳細は `docs/design.md` §3.2）:

- GitHub OAuthログイン、DBへの永続化、複数ユーザー管理、LLM連携
- 本格的なゲームロジック、Canvas/WebGL、リアルタイム通信
- Repositoryへの書き込み、GitHub webhook、管理画面、課金
- 高度なアクセシビリティ最適化、本番レベルのセキュリティ監査

## 改善内容（面接前の改善対応）

MVP完成後、実際に動作確認した際に見つかった課題を`docs/improvement-proposal.md`に整理し、以下を実施した。

### GitHub APIのN+1リクエスト解消

Repository一覧取得時、以前は各RepositoryのCommit数を`per_page=1`のCommit取得で個別に問い合わせており、Repositoryが30件あれば最大31リクエスト（一覧1回 + Commit数取得30回）が発生し、GitHubのRate Limitに到達することがあった。

```text
変更前: GET /users/:username/repos → 1 + N requests（Nはrepo数、最大30）
変更後: GET /users/:username/repos → 1 request固定
```

`RepositoryDto`からは`commitCount`を削除し、Repository Detail専用の`RepositoryDetailDto`（`RepositoryDto & { commitCount: number }`）を新設。Commit数の取得はRepository Detail画面を開いたタイミングのみに限定した（Lazy Loading）。これに伴い、World MapとRepositoryCardの表示は名前・Language・最終更新日のみに簡素化し、Repository DetailでCommit数から算出する「Quest XP」「Level」を新たに表示している（GitHubの正式な値ではなくCommit Quest独自のゲーム指標である旨を明記）。DashboardのTotal Commit / Player Level / XPは実態と合わない指標だったため廃止し、追加のAPI呼び出しなしで得られるGitHub実データ（Public Repositories / Active Repository / Last Updated）を表示する「GitHub Stats」パネルに置き換えた。

### State責務の分離（World Mapのインタラクション強化）

World MapのRepositoryノードはクリックしても即座に遷移せず、以下の流れにした。

```text
ノード選択 → キャラクター(🧙)がHOMEから対象ノードへCSS transitionで移動 → 到着 → Command Window表示 → 「冒険する」でRepository Detailへ遷移
```

キャラクター位置・移動中フラグ・Command Windowの開閉といったClient StateはServer State（TanStack Query）やURL State（TanStack Router）と混在させず、`useWorldMapState`（`useReducer`）に分離して管理している。

```text
GitHub Data              → TanStack Query
URL / Route（page等）     → TanStack Router
キャラクター位置・Command Window → React State（useWorldMapState）
```

### Router loaderとQuery Cacheの連携

Repository Detailルートで、`createRootRouteWithContext`によりRouter contextへ`queryClient`を渡し、`loader`から`queryClient.ensureQueryData`でRepositoryとCommit一覧のデータを`Promise.all`で並行取得するようにした。コンポーネント側は`useSuspenseQuery`でそのキャッシュを読むだけになり、Loading/ErrorはRouteの`pendingComponent` / `errorComponent`に委譲している。Query Cacheが既にあれば再利用されるため、同じRepositoryへ再度遷移した際の待ち時間が減る。Routerの`defaultPreloadStaleTime`は`0`にし、鮮度判定はQuery側（`staleTime`）に一本化した。

Commit Detailルートも同方式に統一し、`loader`から`commitDetailQueryOptions`を`ensureQueryData`する形にした。Repository DetailとCommit Detailで共通の`errorComponent`ロジック（キャッシュのreset + `router.invalidate()`）は`RouteErrorPanel`に切り出して両ルートで再利用している。また、World MapでCommand Windowが開いた時点（`selectedRepository`確定時）に`router.preloadRoute`でRepository Detailのルートloaderを先読みし、「冒険する」選択時の体感待ち時間を減らしている。

## Future Work

- Repository一覧・World Mapの複数ページ対応（現状は取得可能な最初の1ページのみで表示）
- GitHub OAuthによるログインとprivate repositoryの閲覧
- Commit差分（diff）の表示
- E2Eテストの追加（現状はPlaywright MCPによる手動確認のみ）
- Cloudflare Cacheの導入（`docs/improvement-proposal.md` Priority 5）

## 既知の制約

- `apps/web/src/routeTree.gen.ts` は TanStack Router の vite plugin（`@tanstack/router-plugin/vite`）が自動生成するファイルです。クローン直後でも typecheck が通るよう Git 管理に含めています。手で編集しないでください。
- GitHub APIの認証なしレート制限（60 req/h）に達すると、画面には `QUEST FAILED` として日本語の案内メッセージが表示されます（GitHubの生エラー文はそのまま表示しません）。
