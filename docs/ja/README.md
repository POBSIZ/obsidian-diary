# Diary (日本語)

Diary は、Obsidian の vault 内にある Markdown ファイルを日付ベースのプランナーとして表示するコミュニティプラグインです。年間、月間グリッド、月間リスト、日別、3日ビューを切り替えながら、ノート、カレンダー、todo、ローカル通知をまとめて扱えます。

完全なドキュメント: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## 現在の情報

| 項目 | 値 |
| --- | --- |
| プラグイン ID | `diary` |
| 現在のバージョン | `1.10.1` |
| 最小 Obsidian バージョン | `1.7.2` |
| 対応プラットフォーム | デスクトップ / モバイル (`isDesktopOnly: false`) |
| 既定の言語 | `en` |
| 既定のプランナーフォルダ | `Planner` |

## 最新バージョン

- `1.10.1`: 日別期間レイアウトの新しい配列 helper を ES2020 互換の型安全なロジックへ置き換え、`no-unsafe-assignment` と `no-unsafe-call` の監査警告を解消し、ローカルのエージェント指示をリリースソースから除外します。
- `1.10.0`: 複数日の範囲を日別・3日プランナーで連続する終日バーまたは日時区間として表示し、日付をまたぐ選択と境界調整を追加します。
- `1.9.4`: GitHub の暗号検証には成功したものの Obsidian Community Scorecard が拒否した、任意の artifact attestation 生成を削除します。
- `1.9.3`: 現行の build-provenance アクションと lightweight Git tag を使用し、リリース provenance を Obsidian Community Scorecard の検証方式に合わせます。
- `1.9.2`: JavaScript と CSS のリリースアセットにプラグインバージョンを記録し、各リリースに固有の digest と曖昧さのない provenance attestation を持たせます。
- `1.9.1`: 現行の attestation アクションを使用し、各リリースアセットに個別の GitHub 検証可能な provenance attestation を生成します。
- `1.9.0`: モバイルプランナーの内容、タイムライン末尾、コンパクト表示メニューを Obsidian の通常またはフローティング下部ナビゲーションの上に保ち、設定可能な最小余白も維持します。
- `1.8.3`: 型付けされた Obsidian element instance helper で要素を作成して直ちに detach し、直接の `Document` 生成呼び出しをすべて削除しました。
- `1.8.2`: 型付けされた `DocumentFragment` の Obsidian helper で detached プランナー DOM を生成し、community plugin audit の unsafe 型伝播警告を解消しました。
- `1.8.1`: 従来の設定画面との互換性を保ちながら Obsidian 1.13+ の検索可能な宣言型設定を追加し、DOM 生成を Obsidian helper に統一しました。
- `1.8.0`: 全プランナービューのチップ、コントロール、モーダル操作、コンパクトレイアウト状態、キーボードフォーカスを統一し、スクリーンショットを更新しました。
- `1.7.1`: 不要な DOM 型アサーションを削除し、共通期間ダイアログの typed lint 解決を安定化しました。
- `1.7.0`: 日別・3日タイムラインプランナー、直接ビュー選択、共通期間ナビゲーション、独立した開始/終了時刻、N日・週・か月・年ごとの仮想繰り返しを追加しました。
- `1.6.0`: 対応するすべての UI 言語の完全なドキュメント、スペインの祝日、代替カレンダー選択肢のローカライズ文言を追加しました。
- `1.5.0`: 英語に加えて、ドイツ語、スペイン語、フランス語、日本語、簡体字中国語、繁体字中国語、韓国語の UI 言語を追加しました。
- `1.4.2`: Diary のスタイル適用範囲をプランナー、設定、モーダルに限定し、色プリセットボタンにローカライズされたラベルを追加しました。
- `1.4.1`: 外部カレンダーイベントの操作、押下フィードバック、成功・エラー Notice を改善しました。
- `1.4.0`: カスタムカレンダーオーバーレイと任意の外部カレンダーフィードを追加しました。外部 `webcal://` または `https://` `.ics` イベントは、Markdown ノートを作成するまで読み取り専用オーバーレイとして表示されます。
- `1.3.6`: 型付きコミュニティプラグイン監査を安定させるメンテナンスリリースです。
- `1.3.5`: Obsidian プラグインの lint とリリース検証を揃えたメンテナンスリリースです。
- `1.3.4`: 型付き ESLint のための TypeScript プロジェクト設定と、再現可能な lint ツール固定を追加しました。
- `1.3.3`: 型付き ESLint の安全性チェックをより厳しくしました。
- `1.3.2`: ドキュメント、エージェントガイド、ESLint config 型、TypeScript lib target を整理しました。
- `1.3.1`: Obsidian 型定義の固定、依存関係 lockfile の整備、ESLint 互換性、繰り返し chip スタイルの整理を含みます。
- `1.3.0`: 年間、月間グリッド、月間リスト、サイドバー全体に繰り返しイベントと代替カレンダーラベルを追加しました。
- `1.2.1`: Obsidian コミュニティプラグイン lint 互換性と祝日依存関係のメンテナンスリリースです。
- `1.2.0`: 右サイドバーのプランナー、自動セットアップ、**Open monthly planner in sidebar** コマンド、同じサイドリーフでの表示切り替えを追加しました。

## スクリーンショット

画像は、終日・時刻付き・期間・todo・計画ノートを入れた隔離デモフォルダで撮影しました。一時データは撮影後に削除しています。狭幅画像では、横幅が限られたときに共通ヘッダーと月間ビューが適応する様子を確認できます。

### デスクトップ

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| 日別タイムライン | 3日タイムライン |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### 狭幅レイアウト

| 月間グリッド | 月間リスト |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## 主な機能

- **年間プランナー**: 日付ノートと期間ノートを `12 か月 x 31 日` の表で確認できます。展開した月セルの幅は再読み込み後も保存されます。
- **ローカライズ UI**: Diary を英語、ドイツ語、スペイン語、フランス語、日本語、簡体字中国語、繁体字中国語、韓国語に切り替えられます。
- **月間グリッド**: 1 か月を大きなカレンダーで表示し、chip、期間バー、祝日、カレンダーオーバーレイ、外部カレンダーを確認できます。
- **月間リスト**: 予定の多い月を日ごとの縦リストで確認し、`All`、`With notes`、`Upcoming` で絞り込めます。
- **日別プランナー**: 1日を24時間のタイムラインで計画します。複数日の範囲は連続する終日バーまたは日時区間として表示され、時刻付き範囲の境界は日付をまたいで調整できます。
- **3日プランナー**: 連続する3日を並列列で比較します。狭い画面では横スクロールで列幅を保ちます。
- **直接ビュー選択**: 年間、月間グリッド、月間リスト、日別、3日へ直接切り替えます。
- **右サイドバープランナー**: ノートをメイン領域に開いたまま、右サイドバーにコンパクトな月間プランナーを置けます。
- **計画ノートパネル**: 年間ノート (`YYYY.md`) と月間ノート (`YYYY-MM.md`) をプランナー上部で作成・プレビューできます。展開状態は保存され、モバイルは別状態で初期は折りたたまれます。
- **日付/期間ノート**: 単日または期間のファイル名をもとにノートを chip として表示します。既定では vault 全体をスキャンし、設定でプランナーフォルダ内に限定できます。
- **繰り返しイベント**: グレゴリオ暦または代替カレンダーを基準に、N日・週・か月・年ごとに繰り返せます。発生分は選択するまで仮想表示されます。
- **色、todo、完了状態**: frontmatter の `color`、`todo`、`completed` が chip の見た目とラベルに反映されます。
- **祝日オーバーレイ**: 対応 UI 言語圏の国別祝日を表示し、祝日 badge を選択すると名前を確認できます。
- **代替カレンダーラベル**: 韓国の旧暦、中国の旧暦、檀紀、ヘブライ暦、イスラム暦、ペルシア暦、インド国定暦、仏暦、和暦、民国暦、コプト暦、エチオピア暦などから 1 つをコンパクトに表示できます。選択肢の文言はすべての対応 UI 言語でローカライズされています。
- **カスタムカレンダーオーバーレイ**: ファンタジー世界やキャンペーン用に、月、曜日、簡単な閏日ルールを持つローカルプロファイルを作れます。ノートファイルは通常の `YYYY-MM-DD` のままです。
- **外部カレンダーオーバーレイ**: `webcal://` または `https://` の `.ics` フィードを追加し、手動または間隔で更新できます。イベントは読み取り専用 chip/期間として表示され、必要なものだけ Markdown ノートにできます。
- **限定されたスタイル**: Diary の CSS はプランナー、設定、プラグインモーダルだけに適用されます。
- **ローカルリマインダー**: `notify_minutes` を持つノートは、Obsidian が開いている間、当日に Obsidian Notice を表示します。
- **プランナークリップボード**: デスクトップでは選択した日付や chip をコピー、貼り付け、削除し、貼り付けを取り消せます。
- **キーボードとアクセシビリティ**: 日付セル、chip、期間バー、祝日 badge、プランナーラベル、月間リスト行はキーボード操作とアクセシブルなラベルに対応しています。
- **モバイル最適化**: 月間グリッドはピンチズーム、ズームリセット、日別サマリーシートに対応しています。

## インストール

1. [Releases](https://github.com/POBSIZ/obsidian-diary/releases) から最新リリースをダウンロードします。
2. `main.js`、`manifest.json`、`styles.css` を `Vault/.obsidian/plugins/diary/` にコピーします。
3. Obsidian で **Settings -> Community plugins** を開きます。
4. Restricted mode が有効な場合は、信頼できる vault でのみ無効にして **Diary** を有効化します。
5. 左リボンのアイコンまたはコマンドパレットからプランナーを開きます。月間アイコンは右サイドバーのプランナーを開きます。

## クイックスタート

1. サイドバーには **Open monthly planner in sidebar**、通常タブには **Open monthly planner** を実行します。
2. ヘッダーのファイル追加ボタンまたは日付セルを選択します。
3. **Single date** または **期間** を選びます。
4. フォルダ、日付、ファイル名、色、todo 状態、リマインダー時刻、必要なら繰り返しを入力します。
5. **作成** を選択します。Diary は Markdown ノートを作成し、chip または期間バーとして表示します。

作成されるノートは通常の Markdown ファイルです。プラグインを無効にしても vault に残ります。

## ビューを開く・切り替える

リボンアイコン:

- `calendar-range`: メイン領域で年間プランナーを開く
- `calendar-days`: 右サイドバーで月間プランナーを開く、または表示する
- `list-ordered`: メイン領域で月間リストを開く

コマンドパレット:

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

各プランナーヘッダーの繰り返しアイコンを選択すると、同じ leaf が次の順で切り替わります。

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

前後ボタンで年または月を移動し、カレンダーアイコンで現在の年または月に戻ります。年や月のラベルを選択すると直接入力できます。

## 右サイドバープランナー

Diary は workspace の準備ができると、右サイドバーにコンパクトな月間プランナーを 1 つ作ります。**Open monthly planner in sidebar** または月間リボンアイコンで再表示できます。

サイドプランナーは補助ビューです。

- コンパクトな月間レイアウトと日別サマリーシートを使います。
- サイドバーからノートを選ぶと、ファイルはメイン領域に開きます。
- レイアウト切り替えボタンで年間、月間グリッド、月間リストを切り替えます。
- Diary はサイドバー leaf を 1 つだけ保ち、古いバージョンの月間サイド leaf を整理します。

## 月間リストのフィルター

月間リストには 3 つのフィルターがあります。

- **All**: 選択した月のすべての日を表示します。
- **With notes**: 単日ノートまたは期間ノートがある日だけを表示します。
- **Upcoming**: 選択した月の今日以降を表示します。

現在の月で開いた場合、Diary は今日の行までスクロールします。現在月ボタンも今日へ戻ります。

## 外部カレンダーフィード

**Settings -> Diary -> 外部カレンダー** から、公開された `webcal://` URL または `https://` の `.ics` URL を追加します。

- フィード URL はローカルのプラグインデータに保存され、vault と同期される可能性があります。秘密の iCal URL はアクセストークンとして扱ってください。
- Diary はローカルまたはプライベートネットワークの URL を拒否します。
- フィード名、色、説明の取り込み、更新間隔、表示するプランナー面を選べます。
- 新しいフィードは既定で 60 分ごとに自動更新され、年間、月間グリッド、月間リスト、サイドバーに表示されます。
- 外部イベントは読み取り専用で、点線または ghost の見た目です。ドラッグ、プランナークリップボード、todo、色編集はできません。
- 外部イベントを選択すると、**Create Markdown note**、**Refresh calendar**、**Copy details** を持つ詳細モーダルが開き、押下・読み込み・完了のフィードバックも表示されます。
- 外部イベントから Markdown ノートを作成すると、Diary はリンク用 frontmatter を保存し、そのイベントの重複オーバーレイを隠します。

## ノートを作成する

### 単日ノート

日付セルまたはファイル追加ボタンを選択し、**Single date** を使います。

- 既定のファイル名は `YYYY-MM-DD.md` です。
- サフィックスを付けると chip タイトルになります。例: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- 色を設定すると chip の枠線またはモバイルの点として表示されます。
- **Todo file** を有効にすると chip に todo 状態が表示されます。
- **Reminder time** を設定すると `notify_minutes` が保存されます。
- **Repeat** を有効にし、毎日・毎週・毎月・毎年と1〜999の間隔を選びます。N日・週・か月・年ごとの繰り返しに対応し、カレンダー基準と終了日も指定できます。

### 期間ノート

デスクトップでは日付セルをドラッグして **期間** モーダルを事前入力できます。モバイルではファイル追加ボタンから **期間** を選び、開始日と終了日を入力します。

- ファイル名形式は `YYYY-MM-DD--YYYY-MM-DD.md` です。
- サフィックスを付けると期間タイトルになります。例: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- 作成時に `date_start` と `date_end` が自動保存されます。
- 年間プランナーでは縦バーと開始日の chip として表示されます。月間グリッドとリストでは期間バーとして表示されます。
- **終日**を選ぶと両方の時刻が空になり、時刻を指定する場合は `date_start` + `start_time` から `date_end` + `end_time` までの連続区間になるよう両方を入力します。
- 日別・3日プランナーでは終日範囲を日付をまたぐバーとして表示します。時間軸へドラッグして時刻を割り当てた後、最初または最後の境界をドラッグすると対応する日付と時刻を変更できます。

### 計画ノート

各プランナー上部の計画ノートパネルで、年間または月間の計画ノートを作成できます。

- 年間計画ノート: `{plannerFolder}/{year}.md`
- 月間計画ノート: `{plannerFolder}/{year}-{month}.md`
- パネルは折りたたみ・展開でき、その状態はプラグインデータに保存されます。
- デスクトップとモバイルは別状態です。デスクトップは初期展開、モバイルは初期折りたたみです。
- 既に存在する場合、Diary はプレビューと開くボタンを表示します。

## ノートを編集する

プランナーの chip または期間バーを選択すると、ファイルオプションモーダルが開きます。

- ファイルパスを確認
- 表示タイトルを変更
- 単日または期間の日付を変更
- chip の色を変更
- todo / completed 状態を変更
- リマインダー時刻を変更
- ファイルをプレビュー
- ファイルを開く
- ファイルを削除

デスクトップでは、日付 chip や期間バーを別の日へドラッグして移動できます。期間ノートは開始日を基準に移動し、期間の長さは保たれます。移動先のパスが存在する場合、Diary はファイルを移動しません。

## キーボードとアクセシビリティ

- フォーカスされた日付セル、chip、期間バー、祝日 badge、月間リスト行、年ラベル、月ラベルで `Enter` または `Space` を押すと実行できます。
- プランナー操作部は button ロール、状態ラベル、`aria-label` を使います。
- 作成/編集モーダルの色プリセットボタンにはローカライズされた `aria-label` と `title` があります。
- 月間リストフィルターは `aria-selected` で選択状態を示します。
- モーダルの検証メッセージは polite live region で通知されます。

## プランナークリップボード (デスクトップ)

プランナーで日付や chip を選択するとき、macOS では `Cmd`、Windows/Linux では `Ctrl` を押します。

Diary はコピーしたプランナーノートを、現在の Obsidian セッション内のメモリにだけ保持します。システムクリップボードは読み書きしません。

- `Cmd/Ctrl + click`: 現在の選択を置き換え
- `Cmd/Ctrl + Shift + click`: 選択に追加または削除
- `Cmd/Ctrl + C`: 選択したプランナーノートを内部クリップボードへコピー
- `Cmd/Ctrl + V`: 選択した日付へ貼り付け
- `Cmd/Ctrl + Delete` または `Cmd/Ctrl + Backspace`: 選択したノートをゴミ箱へ移動
- `Cmd/Ctrl + Z`: 直前の貼り付けを取り消し、貼り付けたファイルをゴミ箱へ移動

貼り付けルール:

- 1 つのコピー済みノートを複数の日付へ貼り付けられます。
- 複数のコピー済みノートを 1 つの日付へ貼り付けられます。
- 多数対多数の貼り付けは曖昧な衝突を避けるためブロックされます。
- ファイルが既にある場合、Diary は `-copy` や `-copy2` のような一意のパスを作ります。

## モバイルでの使い方

- 月間グリッドの日をタップすると、下部の日別サマリーシートが開きます。
- サマリーシートでその日の単日ノート、期間ノート、祝日を確認できます。
- **Create note** を選択すると、その日付の新しいノートを作れます。
- 月間グリッドではピンチズームを使えます。
- ズームリセットボタンでグリッドのズームを戻せます。
- Diary は内容とメニューを Obsidian の通常またはフローティング下部ナビゲーションの上に自動配置します。**モバイル下部余白** は追加の最小余白、**モバイルセル幅** は年表示セルの調整に使います。

## 設定

| 設定 | 説明 |
| --- | --- |
| 言語 | プラグイン UI の言語。既定: `en`。`en`, `de`, `es`, `fr`, `ja`, `zh-CN`, `zh-TW`, `ko` に対応。 |
| Planner folder | 新しいプランナーノートと計画ノートの既定フォルダ。スキャン範囲をプランナーフォルダに限定する場合にも使われます。既定: `Planner`。 |
| Planner note scan scope | Diary が vault 全体を探すか、**Planner folder** とその下位フォルダだけを探すかを決めます。既定: `Entire vault`。 |
| Date format | 保存される日付形式設定。現在のプランナーファイル名は `YYYY-MM-DD` を使います。 |
| Show holidays | 祝日表示のオン/オフ。 |
| 祝日の国 | 祝日表示に使う国。`KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW`, `None` に対応。 |
| 表示するカレンダー | 年間、月間グリッド、月間リスト、日別サマリー、サイドバーに表示する組み込み代替カレンダーまたはカスタムプロファイルを選びます。既定: `None`。 |
| カスタムカレンダー | ファンタジー/キャンペーン用のローカルカレンダープロファイル。月の長さ、曜日、エポック、ラベル形式、簡単な閏日ルールを定義できます。 |
| 外部カレンダー | 任意の `webcal://` または `https://` `.ics` フィードを読み取り専用オーバーレイとして表示します。フィードごとに有効状態、色、更新間隔、説明、表示ビューを設定できます。 |
| モバイル下部余白 | すべてのモバイルプランナーの最小下部余白。値が小さくても navbar と safe area の自動余白は適用されます。 |
| モバイルセル幅 | モバイル年間プランナーの月セル幅。`0` で既定値を使います。 |

Diary は、計画ノートプレビューの展開状態、モバイル用の展開状態、年間プランナーで展開した月セル幅などの UI 状態もプラグインデータに保存します。

## Frontmatter リファレンス

| キー | 説明 |
| --- | --- |
| `color` | chip の色。有効な CSS 色を使えます。例: `#22c55e`, `red`, `rgb(34, 197, 94)` |
| `todo` | `true` のとき todo chip として表示します。 |
| `completed` | `todo: true` のとき完了状態を表示します。 |
| `start_time` | 任意の開始時刻（`HH:mm`）。範囲ノートでは `date_start` の時刻境界で、両方の時刻を入力するか両方を空にします。 |
| `end_time` | 任意の終了時刻（`HH:mm`）。範囲ノートでは `date_end` の時刻境界で、リマインダーは実行されません。 |
| `notify_minutes` | イベント日のローカル午前 0 時からの分数。`0` から `1439`。午前 9 時は `540`。 |
| `date_start` | 期間ノートの開始日。 |
| `date_end` | 期間ノートの終了日。 |
| `title` | ファイル名からタイトルを導けない場合の表示タイトル。 |
| `recurrence_id` | 繰り返し元と生成された発生分で共有する安定したシリーズ ID。 |
| `recurrence_role` | 定義ノートは `source`、生成ノートは `occurrence`。 |
| `recurrence_calendar` | 基準カレンダー: `gregorian` または対応する代替カレンダー ID。 |
| `recurrence_rule` | `FREQ=WEEKLY;INTERVAL=2` のように頻度と任意の間隔を保存します。`INTERVAL` なしは1です。 |
| `recurrence_anchor_date` | シリーズ開始に使うグレゴリオ暦の日付。 |
| `recurrence_until_date` | 終了日を含む任意のグレゴリオ暦終了日。 |
| `recurrence_anchor_year/month/day` | 代替カレンダー照合に使う基準カレンダーの日付フィールド。 |
| `recurrence_exdates` | シリーズから除外するグレゴリオ暦の日付。 |
| `recurrence_source_path` | 生成された発生分に保存される元ノートのパス。 |
| `recurrence_occurrence_date` | 生成された発生分が表すグレゴリオ暦の日付。 |
| `diary_external_calendar` | 外部イベントから作成した Markdown ノートに保存されるフィード ID。 |
| `diary_external_event_uid` | 外部イベントの UID。 |
| `diary_external_event_instance` | インスタンスキー。通常はイベント開始日時。 |
| `diary_external_event_source` | 重複オーバーレイを抑制する安定したリンクキー。 |
| `diary_external_event_linked_at` | Diary が Markdown ノートを作成した ISO 時刻。 |

リマインダーは OS 通知ではありません。Obsidian が開いている間、Diary は約 15 秒ごとに確認し、イベント日の該当する 1 分間に Obsidian Notice を表示します。

繰り返し発生分は既定で仮想表示です。ノート作成時に同じ `recurrence_id` の発生分があれば再利用し、通常ノートや別シリーズは上書きしません。

## ファイル名ルール

Diary は既定で vault 全体の Markdown ファイルをスキャンし、次のルールに合うファイルを表示します。設定で **Planner folder** とその下位フォルダに限定できます。新しいノートは既定で **Planner folder** に作成されます。

単日:

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

期間:

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

計画ノート:

```text
2026.md
2026-05.md
```

表示タイトルの優先順位:

1. ファイル名サフィックス
2. Frontmatter `title`
3. 最初の Markdown 見出し
4. 拡張子なしのファイル名

プランナーノートのタイトルを作成または編集すると、表示タイトル内のスペースはファイル名サフィックスにも保持されます。Diary はそれらをハイフンに変換しません。

## 開発

このリポジトリは npm を使います。CI は現在 Node.js `20.x` と `22.x` を検証しており、ローカル開発は現在の LTS でも動作します。

```bash
npm install
npm run dev
```

本番ビルド:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Test:

```bash
npm test
```

## リリース

- リリースワークフロー: `.github/workflows/release.yml`
- リリースファイル: `main.js`, `manifest.json`, `styles.css`
- `npm version patch|minor|major --no-git-tag-version` を使うと、`package.json`, `package-lock.json`, `manifest.json`, `versions.json` を同期できます。
- GitHub Release のタグは `manifest.json` の version と完全一致し、先頭に `v` を付けません。
- このリポジトリはタグ付きソースから `main.js`, `manifest.json`, `styles.css` を GitHub Actions でビルドし、個別の release asset として公開します。

## プライバシーとネットワーク

- プランナー機能は vault 内のローカル Markdown ファイルで動作します。
- Diary に隠れた telemetry や analytics はありません。
- 祝日とカレンダーオーバーレイの計算は、同梱データ、ブラウザ提供データ、またはローカル保存プロファイルを使い、vault 内容を外部サービスへ送りません。
- 外部カレンダーフィードは任意です。Diary は追加した feed URL だけを取得し、イベント cache をプラグインデータに保存します。**Create Markdown note** を選ばない限り Markdown ファイルは作成しません。
- `obsidian-reminder-endpoint-spec.md` は将来のリマインダー endpoint 設計ノートです。公開済みプラグインは現在、リマインダーデータをネットワーク送信しません。

## トラブルシューティング

- プラグインが見つからない場合は、`main.js`, `manifest.json`, `styles.css` が `Vault/.obsidian/plugins/diary/` 直下にあるか確認してください。
- コマンドが出ない場合は、**Settings -> Community plugins** で **Diary** が有効か確認してください。
- サイドバープランナーが見つからない場合は、**Open monthly planner in sidebar** を実行するか、プラグイン有効化後に Obsidian を再読み込みしてください。
- chip が表示されない場合は、ファイル名が `YYYY-MM-DD` または `YYYY-MM-DD--YYYY-MM-DD` に従っているか確認してください。
- 自動確保されたモバイルナビゲーション余白より広い空間が必要な場合は、**モバイル下部余白** を増やしてください。
- リマインダーが出ない場合は、Obsidian が開いていること、イベント日が今日であること、`notify_minutes` が `0` から `1439` の範囲にあることを確認してください。

## ライセンス

`LICENSE` を参照してください。
