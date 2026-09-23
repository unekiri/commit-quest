# Commit Quest 改善提案

## 1. 目的

現状のMVPは、以下の技術要件を満たす土台としては成立している。

- React 19
- TypeScript
- Vite 6
- TanStack Router
- TanStack Query
- Tailwind CSS 4
- Turborepo
- Cloudflare Workers
- Hono
- GitHub REST API

一方で、面接用の成果物として見ると、以下の課題がある。

1. GitHub API呼び出しが多く、Rate Limitに到達しやすい
2. RPG風UIは存在するが、インタラクションがまだ弱い
3. TanStack RouterとTanStack Queryを「両方使っている」段階で、連携が弱い
4. Dashboard上のTotal Commit表現が実データと一致しない
5. Cloudflareを利用する技術的な意味を、もう一段出せる余地がある

本ドキュメントでは、面接までに優先して改善すべき内容を整理する。

---

# 2. 改善優先順位

## Priority 1
GitHub APIのN+1リクエストを解消する

## Priority 2
World MapのRPGインタラクションを強化する

## Priority 3
TanStack RouterとTanStack Queryを連携させる

## Priority 4
Dashboardの指標表現を見直す

## Priority 5
Cloudflare Cacheを追加する

---

# 3. Priority 1: GitHub APIのN+1リクエストを解消

## 3.1 現状

Repository一覧取得時に各RepositoryのCommit数を取得している。

概念的には以下の処理になっている。

```text
GET /users/:username/repos
        |
        +-- GET /repos/:owner/repo-a/commits
        +-- GET /repos/:owner/repo-b/commits
        +-- GET /repos/:owner/repo-c/commits
        +-- ...
```

Repositoryが30件ある場合、Repository一覧取得1回に加えて、最大30回程度の追加API呼び出しが発生する。

```text
Repository一覧取得    1 request
Commit情報取得       30 requests
--------------------------------
合計                 31 requests
```

実際の動作確認でもGitHub APIから `429 Too Many Requests` が発生している。

## 3.2 問題点

- GitHub APIのRate Limitに到達しやすい
- Dashboard表示が遅くなる
- Repository数に比例して負荷が増える
- 一覧表示に不要な詳細情報まで取得している
- N+1リクエストになっている

## 3.3 改善方針

Repository一覧取得時にはCommit数を取得しない。

```text
Repository一覧
  ↓
Repository APIのみ

Repository詳細を開く
  ↓
そのRepositoryのCommit情報を取得
```

必要なタイミングで取得するLazy Loading方式へ変更する。

## 3.4 RepositoryDto変更案

変更前のイメージ:

```ts
export type RepositoryDto = {
  owner: string
  name: string
  commitCount: number
}
```

変更後:

```ts
export type RepositoryDto = {
  owner: string
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  updatedAt: string
  htmlUrl: string
}
```

Commit数はRepository詳細側で取得する。

## 3.5 受け入れ条件

- Repository一覧取得で各Repositoryへの追加GitHub API呼び出しを行わない
- Repository一覧表示時のGitHub API呼び出し数がほぼ固定になる
- Repository詳細を開いたときに初めてCommit情報を取得する
- Dashboardを数回開いた程度でRate Limitに達しない

---

# 4. Priority 2: World MapのRPGインタラクション強化

## 4.1 現状

World Map上にRepositoryを配置し、Hoverやクリックによる画面遷移が実装されている。

ただしユーザー体験としては、

```text
Repositoryをクリック
  ↓
即座にRepository画面へ遷移
```

となっており、通常のWeb UIに近い。

募集要項で求められている以下の要素へのアピールがまだ弱い。

- RPGメタファー
- フィールド移動
- コマンドウィンドウ
- 心地よい挙動
- 抽象的な要望をUIへ落とし込む能力

## 4.2 改善方針

Repository選択から画面遷移までに、ゲーム的なInteractionを挟む。

```text
Repositoryを選択
  ↓
キャラクターが対象Repositoryへ移動
  ↓
到着
  ↓
Command Window表示
  ↓
「冒険する」を選択
  ↓
Repository Detailへ遷移
```

## 4.3 UI案

```text
             [repo-a]
                |
                |
[repo-b] ----  🧙  ---- [repo-c]
                |
                |
             [repo-d]
```

Repository選択後:

```text
             [repo-a]
                🧙
                 ↑
                 |
[repo-b] ---- [HOME] ---- [repo-c]
```

到着後:

```text
┌─────────────────────┐
│ repo-a              │
│                     │
│ ▶ 冒険する          │
│   Repository情報    │
│   戻る              │
└─────────────────────┘
```

## 4.4 State設計

Server StateではなくReactのClient Stateとして管理する。

候補:

```ts
type WorldMapState = {
  selectedRepository: string | null
  playerPosition: string
  commandOpen: boolean
  moving: boolean
}
```

役割分担を明確にする。

```text
GitHub Data
  → TanStack Query

URL / Route
  → TanStack Router

キャラクター位置
コマンドWindow
Animation
  → React State
```

## 4.5 Animation

外部Animationライブラリは必須ではない。

まずはTailwind / CSS transitionで実装する。

例:

- transform
- translate
- scale
- opacity
- transition-duration

## 4.6 受け入れ条件

- Repositoryクリックで即時遷移しない
- 選択したRepositoryへキャラクターが移動する
- 移動完了後にCommand Windowが開く
- Command WindowからRepository詳細へ遷移できる
- Back操作後も不自然な状態にならない

---

# 5. Priority 3: TanStack Router + TanStack Query連携

## 5.1 現状

TanStack RouterとTanStack Queryは導入済みだが、それぞれ独立して利用している。

```text
Route Component
  ↓
useQuery()
  ↓
Loading
  ↓
Render
```

これでも問題はないが、面接時のアピールとしてはやや弱い。

## 5.2 改善方針

TanStack RouterのloaderからTanStack QueryのQueryClientを利用し、遷移前に必要データをprefetchする。

```text
World Map
  ↓
Repository選択
  ↓
Router loader
  ↓
queryClient.ensureQueryData()
  ↓
Repository Detail
```

## 5.3 実装対象

まずRepository Detailだけでよい。

Query Optionを共通化する。

例:

```ts
export const repositoryQueryOptions = (
  owner: string,
  repo: string,
) => ({
  queryKey: ['github', 'repository', owner, repo],
  queryFn: () => githubApi.getRepository(owner, repo),
})
```

Router側:

```ts
loader: ({ context, params }) =>
  context.queryClient.ensureQueryData(
    repositoryQueryOptions(params.owner, params.repo)
  )
```

Page側:

```ts
useSuspenseQuery(
  repositoryQueryOptions(owner, repo)
)
```

実装方式はプロジェクト構成に合わせて調整してよい。

## 5.4 狙い

面接時に以下を説明できる状態にする。

> TanStack RouterとTanStack Queryを個別に導入しただけではなく、RouterのloaderからQuery Cacheを利用し、画面遷移前に必要なServer Stateをprefetchする構成を試しました。

## 5.5 受け入れ条件

- Repository Detailの遷移時にloaderが動作する
- Query Cacheに既存データがあれば再利用される
- 不要な二重fetchが発生しない
- Browser Back / Forwardが正常に動作する

---

# 6. Priority 4: Dashboardの指標を見直す

## 6.1 現状

Dashboardに以下のような情報が存在する。

```text
Total Commit
```

ただし実際には取得可能なRepositoryやページ範囲だけを集計している。

そのため、

```text
Total
```

という表現と実態が一致しない。

また、正確なTotal Commitを取得しようとするとGitHub API呼び出し数が増加する。

## 6.2 改善方針

MVPではTotal Commitを正確に算出しない。

以下の指標へ変更する。

候補:

```text
Public Repositories
Recent Activities
Latest Commit
Quest XP
Active Repository
```

## 6.3 XPについて

XPはGitHub上の正式な値ではなく、Commit Quest内のゲーム指標とする。

例:

```text
Fetched Commit = 10 XP
```

UI上でも、

```text
Quest XP
```

など独自指標であることが分かる名称にする。

## 6.4 受け入れ条件

- 「Total」と表示しながら一部データのみ集計する箇所をなくす
- GitHub APIへの追加取得を増やさない
- ゲーム指標とGitHub実データを区別する

---

# 7. Priority 5: Cloudflare Cache導入

## 7.1 現状

現在のキャッシュ構造:

```text
Browser
  ↓
TanStack Query Cache
  ↓
Cloudflare Worker
  ↓
GitHub API
```

TanStack Query Cacheはブラウザ単位のため、別ユーザーや別セッションではGitHub APIへ再アクセスする。

## 7.2 改善後

```text
Browser
  ↓
TanStack Query Cache
  ↓
Cloudflare Cache
  ↓
GitHub API
```

## 7.3 対象

更新頻度の低いAPIを優先する。

候補:

- GitHub User
- Repository一覧
- Repository情報

Commit Detailなどは短めのTTL、またはCache対象外でもよい。

## 7.4 TTL例

```text
GitHub User       5分
Repository一覧    2分
Repository Detail 2分
Commit一覧        30秒〜1分
Commit Detail     30秒〜1分
```

厳密な値はMVPでは重要ではない。

## 7.5 狙い

Cloudflare Workerを単なるProxyではなく、Edge APIとして活用する。

面接では以下の説明が可能になる。

> Client側ではTanStack QueryによるServer State Cache、API側ではCloudflare Cacheを使い、クライアントキャッシュとEdgeキャッシュの責務を分けました。

## 7.6 受け入れ条件

- 同一GitHubリソースへの短時間の再アクセスでGitHub API呼び出しを削減できる
- GitHub TokenはWorker側のみで保持する
- Cacheがなくても正常動作する

---

# 8. 現状維持でよい点

以下は現時点で大きく変更する必要はない。

## 8.1 Turborepo構成

```text
apps/
├─ web
└─ api

packages/
├─ types
├─ ui
└─ config
```

Web/API/共通型の責務分離として自然。

特に `packages/types` をWeb/API双方から利用している点は、Monorepoを採用する理由として説明しやすい。

---

## 8.2 APIレイヤ分離

以下の構造は維持する。

```text
Route
  ↓
Service
  ↓
Client
  ↓
GitHub API

GitHub Raw Response
  ↓
Mapper
  ↓
DTO
```

UI側がGitHub APIのRaw Response形式へ直接依存しない設計は適切。

---

## 8.3 State責務

以下を維持する。

```text
Server State
  → TanStack Query

URL State
  → TanStack Router

Client UI State
  → React State
```

---

## 8.4 Cloudflare構成

以下の構成はMVPとして適切。

```text
Cloudflare
├─ /api/*
│   └─ Worker + Hono
│
└─ /*
    └─ React SPA Static Assets
```

APIとWebを同一originで公開することで、CORS構成を単純化できる。

---

# 9. 面接までの実装順

## Step 1
N+1 GitHub API問題を解消する

## Step 2
World Mapへキャラクター移動を追加する

## Step 3
Command Windowを追加する

## Step 4
Repository DetailにRouter loader + Query prefetchを導入する

## Step 5
Cloudflareへdeployする

## Step 6
余裕があればCloudflare Cacheを追加する

---

# 10. 面接で説明する改善ストーリー

以下の流れで説明する。

```text
募集要項確認
  ↓
未経験技術を洗い出し
  ↓
MVPを作成
  ↓
実際に動作確認
  ↓
GitHub APIのRate Limit問題を発見
  ↓
N+1リクエストだと判明
  ↓
取得タイミングをLazy Loadingへ変更
  ↓
Router / Query / UI Stateの責務も整理
```

説明例:

> 募集要項を見て、TanStack Router/Query、Tailwind CSS、Turborepoが自分の未経験領域だったため、実際に手を動かして理解する目的でMVPを作りました。
>
> GitHubの開発活動をRPG風に可視化するアプリとして、WebとAPIをTurborepoで管理し、React 19、Vite、TanStack Router/Query、Tailwind CSS、Cloudflare Workers、Honoで構成しました。
>
> 実際に動作確認したところ、Repository一覧取得時に各RepositoryのCommit数を取得していたためN+1リクエストになり、GitHub APIのRate Limitにも到達しました。
>
> そのため、一覧では必要最低限のデータだけを取得し、詳細画面へ入ったタイミングでCommit情報を取得するLazy Loadingへ変更しました。
>
> また、Server StateはTanStack Query、URL StateはTanStack Router、キャラクター位置やコマンドUIなどのClient StateはReact Stateと、状態の責務も分離しています。

---

# 11. 完成イメージ

面接時に以下のデモができる状態を目標とする。

```text
1. Home
   ↓
2. GitHub username入力
   ↓
3. Player Dashboard
   ↓
4. World Map
   ↓
5. Repositoryを選択
   ↓
6. キャラクター移動
   ↓
7. Command Window表示
   ↓
8. Repository Detail
   ↓
9. Commit Quest一覧
   ↓
10. Commit Detail
```

技術的な説明ポイント:

- TurborepoによるWeb/API/typesのMonorepo管理
- ViteによるReact SPA
- TanStack Routerによるfile-based routing
- TanStack QueryによるServer State管理
- Router loaderとQuery Cacheの連携
- Tailwind CSS 4によるRPG風UI
- React Stateによるゲーム的Interaction
- Cloudflare Worker + HonoによるBackend API
- GitHub TokenをServer側へ隔離
- GitHub API Rate Limitを意識したAPI設計
- Cloudflare CacheによるEdge Cache

---

# 12. 最終受け入れ条件

## API

- [ ] Repository一覧取得でN+1リクエストが発生しない
- [ ] GitHub API Rate Limitに短時間で到達しない
- [ ] GitHub TokenがClientへ露出しない
- [ ] API Errorが統一フォーマットで返却される

## Router

- [ ] file-based routingを利用
- [ ] Dynamic Paramsが型安全に扱われる
- [ ] Repository Detailでloader/prefetchを利用
- [ ] Back / Forwardが正常に動作

## Query

- [ ] Server StateをTanStack Queryで管理
- [ ] Query Keyが統一されている
- [ ] Cacheが再利用される
- [ ] Loading / Error / Empty Stateがある

## RPG UX

- [ ] World Mapが存在する
- [ ] キャラクターがRepositoryへ移動する
- [ ] Command Windowが表示される
- [ ] CommitがQuestとして表現される
- [ ] UI操作がページ遷移だけに依存していない

## Cloudflare

- [ ] React SPAを公開できる
- [ ] `/api/*` をWorkerで処理
- [ ] GitHub APIアクセスはWorker経由
- [ ] 余裕があればEdge Cacheを実装

## Quality

- [ ] TypeScript Error 0
- [ ] ESLint Error 0
- [ ] Production Build成功
- [ ] README更新済み
- [ ] 公開URLからデモ可能
