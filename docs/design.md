# Commit Quest MVP 設計書

## 1. 目的

GitHub のコミット情報を取得し、RPG風のUIで可視化するMVPを構築する。

本MVPの主目的は、以下の技術スタックを実際に用いて、小規模ながら一通り動作するアプリケーションを作ること。

- React 19
- TypeScript
- Vite 6
- TanStack Router
- TanStack Query
- Tailwind CSS 4
- Turborepo
- pnpm
- GitHub REST API

副次目的として、以下を面接時に説明できる状態にする。

- APIから取得したServer StateをTanStack Queryで管理した経験
- SPAのルーティングをTanStack Routerで構築した経験
- Tailwind CSS 4でUIを構築した経験
- TurborepoでWeb/API/共通型をモノレポ管理した経験
- 抽象的な「RPGっぽいUI」を具体的な画面・挙動へ落とし込んだ経験
- AI生成コードを含む既存コードを読み、修正・整理する前提に近い開発経験

## 2. MVPコンセプト

GitHub上の開発活動を「冒険」に見立てて可視化する。

- Repository = ワールド / エリア
- Commit = クエスト
- Commit数 = 経験値
- 最新Commit = 現在地点
- Repositoryごとの活動量 = エリア進行度

ユーザーは自分のGitHubユーザー名を指定し、Repository一覧やCommit履歴をRPG風UIで確認できる。

## 3. スコープ

### 3.1 MVPで実装するもの

#### API

- GitHubユーザー情報取得
- GitHubリポジトリ一覧取得
- 指定RepositoryのCommit一覧取得
- GitHub APIレスポンスをUI向けDTOへ変換
- GitHub APIエラーのラップ
- GitHub Personal Access Tokenをサーバー側で保持

#### UI

- GitHubユーザー入力
- ユーザー情報表示
- Repository一覧
- Repository詳細
- Commit一覧
- Commit詳細
- RPG風ワールドマップ表示
- Repository / CommitをRPGメタファーで表現
- Loading / Error / Empty State
- 画面遷移後も主要なUI状態が不自然に崩れないこと

#### 技術検証

- TanStack QueryによるAPIデータ取得
- TanStack Queryのキャッシュ確認
- TanStack RouterによるRoute管理
- Tailwind CSS 4によるスタイリング
- Turborepoによるmonorepo管理
- API/UI間で共有型を利用

### 3.2 MVPでは実装しないもの

- GitHub OAuthログイン
- DBへの永続化
- 複数ユーザー管理
- LLM連携
- 本格的なゲームロジック
- Canvas/WebGL
- リアルタイム通信
- Repositoryへの書き込み
- GitHub webhook
- 管理画面
- 課金
- 高度なアクセシビリティ最適化
- 本番レベルのセキュリティ監査

## 4. システム構成

```text
Browser
  |
  v
React SPA
  |
  | TanStack Query
  v
API Server
  |
  v
GitHub REST API
```

Monorepo構成:

```text
commit-quest/
├─ apps/
│  ├─ web/
│  │  ├─ React 19
│  │  ├─ TypeScript
│  │  ├─ Vite 6
│  │  ├─ TanStack Router
│  │  ├─ TanStack Query
│  │  └─ Tailwind CSS 4
│  │
│  └─ api/
│     ├─ TypeScript
│     └─ GitHub REST API Client
│
├─ packages/
│  ├─ types/
│  │  └─ API DTO / 共通型
│  │
│  ├─ ui/
│  │  └─ 共通UIコンポーネント
│  │
│  └─ config/
│     └─ 共通設定
│
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

## 5. 技術スタック

### Frontend

- React 19
- TypeScript
- Vite 6
- TanStack Router
- TanStack Query
- Tailwind CSS 4

### Backend

- Node.js
- TypeScript
- 軽量HTTPフレームワーク
  - Honoを第一候補とする
  - Expressでも可

### Monorepo

- Turborepo
- pnpm workspaces

### External API

- GitHub REST API

## 6. 画面一覧

### 6.1 Home

Route:

```text
/
```

#### 役割

GitHubユーザー名を入力し、冒険を開始する。

#### UI

- タイトル: Commit Quest
- GitHub username入力
- 「冒険を始める」ボタン
- 簡単な説明

#### 遷移

```text
/ -> /users/:username
```

### 6.2 Player Dashboard

Route:

```text
/users/$username
```

#### 表示内容

- GitHub Avatar
- Username
- Name
- Bio
- Public Repository数
- Total Commit数（取得可能範囲内）
- Level
- XP
- Repository一覧

#### RPG表現

例:

```text
Lv. 12

██████████░░░  1,240 XP

Repositories
- kanbai          Lv. 7
- sample-app      Lv. 3
- playground      Lv. 2
```

#### Level算出

MVPでは単純なルールとする。

```text
1 commit = 10 XP
Level = floor(XP / 100) + 1
```

## 7. World Map

Route:

```text
/users/$username/world
```

### 目的

GitHub活動をRPGのフィールドとして表現する。

### 表現

Repositoryをエリアとして表示する。

例:

```text
          [kanbai]
             |
[tools] -- [HOME] -- [sandbox]
             |
         [archive]
```

またはカード型でも可。

各Repositoryには以下を表示:

- Repository名
- Commit数
- 最終Commit日時
- Level
- Progress

### Interaction

Repository選択時:

```text
/users/:username/repos/:owner/:repo
```

へ遷移。

### Animation

最低1つ実装する。

候補:

- Hover時に浮く
- 選択時にキャラクターが移動
- Repository選択時にフェード
- Quest Windowが開く

CSS transitionを優先し、過剰なライブラリ追加はしない。

## 8. Repository Detail

Route:

```text
/users/$username/repos/$owner/$repo
```

### 表示

- Repository名
- Description
- Language
- Stars
- Forks
- Last Updated
- Commit数
- Commit一覧

### Commit表示

各CommitをQuestとして表示。

例:

```text
Quest #12

Fix login redirect

Author: syogo
Date: 2026-09-20

[詳細を見る]
```

## 9. Commit Detail

Route:

```text
/users/$username/repos/$owner/$repo/commits/$sha
```

### 表示

- SHA
- Commit Message
- Author
- Commit Date
- GitHub URL
- Changed Files
- Additions
- Deletions

### RPG表現

Commitを「Quest Clear」として表示する。

例:

```text
QUEST CLEAR!

Fix login redirect

+42 XP
```

## 10. API仕様

Base URL:

```text
/api
```

### 10.1 GitHub User

```http
GET /api/github/users/:username
```

Response:

```json
{
  "login": "unekiri",
  "name": "Shogo Nakao",
  "avatarUrl": "...",
  "bio": "...",
  "publicRepos": 12,
  "profileUrl": "..."
}
```

### 10.2 Repositories

```http
GET /api/github/users/:username/repos
```

Query:

```text
page
perPage
```

Response:

```json
{
  "items": [
    {
      "owner": "unekiri",
      "name": "kanbai",
      "description": "...",
      "language": "TypeScript",
      "stars": 0,
      "forks": 0,
      "updatedAt": "2026-09-20T10:00:00Z",
      "htmlUrl": "..."
    }
  ]
}
```

### 10.3 Commits

```http
GET /api/github/repos/:owner/:repo/commits
```

Query:

```text
page
perPage
```

Response:

```json
{
  "items": [
    {
      "sha": "abc123",
      "message": "Fix login redirect",
      "authorName": "Shogo Nakao",
      "authorLogin": "unekiri",
      "committedAt": "2026-09-20T10:00:00Z",
      "htmlUrl": "..."
    }
  ]
}
```

### 10.4 Commit Detail

```http
GET /api/github/repos/:owner/:repo/commits/:sha
```

Response:

```json
{
  "sha": "abc123",
  "message": "Fix login redirect",
  "authorName": "Shogo Nakao",
  "authorLogin": "unekiri",
  "committedAt": "2026-09-20T10:00:00Z",
  "htmlUrl": "...",
  "stats": {
    "additions": 10,
    "deletions": 3,
    "total": 13
  },
  "files": [
    {
      "filename": "src/App.tsx",
      "status": "modified",
      "additions": 6,
      "deletions": 2
    }
  ]
}
```

## 11. Error Response

APIエラーは統一形式にする。

```json
{
  "error": {
    "code": "GITHUB_NOT_FOUND",
    "message": "GitHub resource was not found."
  }
}
```

想定コード:

```text
GITHUB_NOT_FOUND
GITHUB_RATE_LIMIT
GITHUB_UNAUTHORIZED
GITHUB_ERROR
INTERNAL_ERROR
```

## 12. TanStack Query 設計

Query Keyは一貫した形式にする。

```ts
['github', 'user', username]
['github', 'repos', username]
['github', 'commits', owner, repo]
['github', 'commit', owner, repo, sha]
```

### 12.1 User Query

```ts
useQuery({
  queryKey: ['github', 'user', username],
  queryFn: () => githubApi.getUser(username),
})
```

### 12.2 Repository Query

```ts
useQuery({
  queryKey: ['github', 'repos', username],
  queryFn: () => githubApi.getRepositories(username),
})
```

### 12.3 Commit Query

```ts
useQuery({
  queryKey: ['github', 'commits', owner, repo],
  queryFn: () => githubApi.getCommits(owner, repo),
})
```

## 13. Client State / Server State の分離

### Server State

TanStack Queryで管理する。

- GitHub User
- Repository
- Commit
- Commit Detail

### Client State

React Stateで管理する。

- Modal open/close
- 選択中のマップノード
- Animation state
- Menu open/close

### URL State

TanStack Routerで管理する。

- username
- owner
- repo
- sha
- page
- sort

## 14. TanStack Router 設計

想定Route:

```text
/
└─ users/$username
   ├─ /
   ├─ world
   └─ repos/$owner/$repo
      └─ commits/$sha
```

URLをアプリ状態の一部として利用する。

ページ再読み込み後も同じURLから同じ情報へ到達できること。

## 15. Tailwind CSS 4 方針

CSS-first configurationを利用する。

テーマ例:

```css
@theme {
  --color-rpg-bg: #121212;
  --color-rpg-panel: #1e1e1e;
  --color-rpg-gold: #d6b85a;
  --color-rpg-hp: #c94b4b;
  --color-rpg-xp: #5788c7;
}
```

### デザイン方針

- Dark theme
- RPG command window風
- 過度な装飾を避ける
- ゲームUIらしさとWeb UIとしての読みやすさを両立する

## 16. UI Component

packages/uiへ切り出す候補:

```text
RpgPanel
RpgButton
XpBar
LevelBadge
LoadingPanel
ErrorPanel
EmptyState
```

apps/web側:

```text
RepositoryCard
CommitQuestCard
WorldMap
PlayerStatus
```

## 17. 共通型

packages/types:

```ts
export type GitHubUserDto = {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  publicRepos: number
  profileUrl: string
}

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

export type CommitDto = {
  sha: string
  message: string
  authorName: string | null
  authorLogin: string | null
  committedAt: string
  htmlUrl: string
}
```

## 18. API GitHub Client

apps/api内部にGitHub依存を閉じ込める。

```text
src/
├─ routes/
│  └─ github.ts
├─ services/
│  └─ github.service.ts
├─ clients/
│  └─ github.client.ts
└─ mappers/
   └─ github.mapper.ts
```

UIはGitHub APIの生レスポンス形式を知らないこと。

## 19. 環境変数

### API

```env
GITHUB_TOKEN=
PORT=3001
```

GitHub Tokenは絶対にWeb側へ渡さない。

### Web

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 20. Security

MVPでも以下を守る。

- GitHub Tokenをブラウザへ公開しない
- .envをGit管理しない
- API入力値を最低限validateする
- GitHub APIエラーをそのままUIへ露出しない
- dangerouslySetInnerHTMLを使用しない

## 21. Loading / Error UX

各画面に必ず以下を用意する。

### Loading

RPG風:

```text
Loading Quest...
```

### Error

例:

```text
QUEST FAILED

Repository could not be loaded.

[Retry]
```

### Empty

```text
NO QUESTS FOUND
```

## 22. README

READMEには以下を記載する。

- プロジェクト概要
- なぜこの技術構成にしたか
- Architecture
- Setup
- 起動方法
- Environment Variables
- 技術スタック
- 各ライブラリの利用理由
- MVP Scope
- Future Work

特に以下を書くこと。

### Why TanStack Query

API由来のServer StateをReactのローカルstateから分離し、fetch/cache/refetch/error/loadingを宣言的に管理するため。

### Why TanStack Router

SPAのルーティングとURL stateをTypeScriptで型安全に管理するため。

### Why Tailwind CSS

UIコンポーネント単位で高速にスタイルを構築し、RPG風の独自UIを実装するため。

### Why Turborepo

Web/API/共通型を1リポジトリで管理し、複数package間の依存関係やbuild taskを整理するため。

## 23. 実装順序

### Phase 1 Monorepo

1. pnpm workspace作成
2. Turborepo設定
3. apps/web作成
4. apps/api作成
5. packages/types作成
6. packages/ui作成

完了条件:

```bash
pnpm dev
```

でWeb/APIが同時起動する。

### Phase 2 API

1. GitHub client作成
2. User endpoint
3. Repository endpoint
4. Commit endpoint
5. Commit Detail endpoint
6. Error handling
7. DTO mapping

### Phase 3 Frontend Base

1. TanStack Router導入
2. TanStack Query導入
3. Tailwind CSS 4導入
4. Layout作成
5. Home作成

### Phase 4 GitHub UI

1. User画面
2. Repository一覧
3. Repository詳細
4. Commit一覧
5. Commit詳細

### Phase 5 RPG UX

1. Player Status
2. XP / Level
3. World Map
4. Quest Card
5. Transition / animation
6. RPG-style Error/Loading

### Phase 6 Polish

1. Responsive
2. Error handling
3. Empty state
4. Loading state
5. README
6. lint
7. typecheck
8. build確認

## 24. 受け入れ条件

以下をすべて満たしたらMVP完成とする。

### Architecture

- [ ] Turborepo構成になっている
- [ ] Web/APIがapps配下に分離されている
- [ ] 共通型がpackages/typesに存在する
- [ ] Web/API双方から共通型を参照している

### Frontend

- [ ] React 19
- [ ] TypeScript
- [ ] Vite 6
- [ ] TanStack Router
- [ ] TanStack Query
- [ ] Tailwind CSS 4

### API

- [ ] GitHub User取得可能
- [ ] Repository一覧取得可能
- [ ] Commit一覧取得可能
- [ ] Commit詳細取得可能
- [ ] GitHub TokenがServer側にのみ存在

### UX

- [ ] RPG風UIになっている
- [ ] World Mapがある
- [ ] CommitがQuestとして表現される
- [ ] 最低1つアニメーションがある
- [ ] Loading状態がある
- [ ] Error状態がある
- [ ] Empty状態がある

### Routing

- [ ] URL直打ちで各画面を開ける
- [ ] Repository Routeが動く
- [ ] Commit Routeが動く
- [ ] Browser Back/Forwardが正常

### Query

- [ ] QueryKeyが統一されている
- [ ] LoadingをQuery Stateから取得
- [ ] ErrorをQuery Stateから取得
- [ ] 同一データへの遷移時にCacheが利用される

### Quality

- [ ] TypeScript Errorなし
- [ ] lint errorなし
- [ ] build成功
- [ ] READMEあり

## 25. コーディングルール

### TypeScript

- anyは禁止
- 型アサーションは最小限
- APIレスポンス型を明示する
- Domain/UI用型とGitHub生API型を分離する

### React

- Page componentを肥大化させない
- API fetchをComponent内に直接書かない
- Query hooks / API Clientへ分離する
- UI StateとServer Stateを混在させない

### API

- Route内にGitHub fetch処理を直接書かない
- client/service/mapperを分離する
- GitHub APIのレスポンスをそのままUIへ返さない

## 26. 面接デモ時に見せるポイント

以下の順番でデモする。

1. HomeでGitHub username入力
2. Player Dashboard表示
3. World Map表示
4. Repository選択
5. Commit一覧
6. Commit詳細
7. Backで戻る
8. Query cacheにより再取得待ちが少ないことを確認

説明ポイント:

- TanStack QueryでServer Stateを管理
- TanStack Routerで型安全なRoute
- Tailwind CSSでRPG風UI
- Web/API/typesをTurborepoで管理
- GitHub TokenをAPI側に閉じ込めた
- 抽象的な「RPGっぽい」を具体的なUI/Interactionへ落とした

## 27. コーディングエージェントへの指示

実装時は以下を厳守すること。

1. 最初に既存リポジトリ構成を確認する
2. 既存コードを破壊しない
3. 不要なライブラリを追加しない
4. MVPスコープ外の機能を勝手に追加しない
5. UIとAPIで共通型を利用する
6. TypeScriptの型安全性を優先する
7. APIアクセスはTanStack Query経由にする
8. URL stateはTanStack Routerで管理する
9. GitHub APIアクセスは必ずBackend経由にする
10. Tailwind CSS 4を利用する
11. 各Phase完了時にlint/typecheck/buildを実行する
12. READMEを最後に更新する

不明点があっても、MVP目的に照らして合理的なデフォルトを選択し、実装を止めないこと。
