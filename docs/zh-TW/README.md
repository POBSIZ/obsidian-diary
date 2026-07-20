# Diary（繁體中文）

Diary 是一個 Obsidian 社群外掛，可以把 vault 中的 Markdown 檔案呈現為依日期組織的規劃視圖。你可以在年度、月度格狀、月度列表、單日和3日視圖間切換，同時管理筆記、日曆疊加、待辦狀態和本機提醒。

完整文件：[English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## 目前資訊

| 項目 | 值 |
| --- | --- |
| 外掛 ID | `diary` |
| 目前版本 | `1.10.1` |
| 最低 Obsidian 版本 | `1.7.2` |
| 支援平台 | 桌面 / 行動裝置 (`isDesktopOnly: false`) |
| 預設語言 | `en` |
| 預設規劃資料夾 | `Planner` |

## 最新版本

- `1.10.1`：將單日範圍版面中的較新陣列 helper 改為相容 ES2020 的型別安全邏輯，移除 `no-unsafe-assignment` 與 `no-unsafe-call` 稽核警告，並從發行原始碼排除本機 agent 指引。
- `1.10.0`：在單日與3日規劃器中將多日範圍顯示為連續全天橫條或日期時間區間，並支援跨日期選取與邊界調整。
- `1.9.4`：移除選用的產物證明；這些證明雖通過 GitHub 加密驗證，卻被 Obsidian Community Scorecard 拒絕。
- `1.9.3`：使用目前的 build-provenance action 與輕量 Git 標籤，讓發行來源符合 Obsidian Community Scorecard 的驗證方式。
- `1.9.2`：在 JavaScript 與 CSS 發行資產中寫入外掛版本，讓每個版本都有唯一摘要與明確的來源證明。
- `1.9.1`：使用目前的證明 action，為每個發行資產分別產生可由 GitHub 驗證的來源證明。
- `1.9.0`：讓行動裝置規劃內容、時間軸末端與精簡檢視選單保持在 Obsidian 標準或浮動底部導覽上方，同時保留可設定的最小間距。
- `1.8.3`：使用型別明確的 Obsidian 元素實例 helper 建立元素並立即分離，完整移除直接的 `Document` 建立呼叫。
- `1.8.2`：透過型別明確的 `DocumentFragment` Obsidian helper 建立分離的規劃器 DOM，移除社群外掛稽核中的不安全型別傳播警告。
- `1.8.1`：保留舊版設定相容性，同時為 Obsidian 1.13+ 加入可搜尋的宣告式設定，並統一使用 Obsidian DOM helper。
- `1.8.0`：統一所有規劃檢視中的規劃項目、控制項、對話框動作、精簡版面狀態與鍵盤焦點行為，並更新螢幕截圖。
- `1.7.1`：移除不必要的 DOM 型別斷言，並穩定共用規劃期間對話框的型別化 lint 解析。
- `1.7.0`：新增單日與3日時間軸規劃器、直接視圖選擇、統一期間導覽、獨立開始/結束時間，以及每N天、週、月或年的虛擬重複行程。
- `1.6.0`：新增所有支援 UI 語言的完整文件、西班牙節假日支援，以及替代日曆選項文字在地化。
- `1.5.0`：在英文之外，新增德文、西班牙文、法文、日文、簡體中文、繁體中文和韓文 UI 語言支援。
- `1.4.2`：將 Diary 樣式限制在規劃視圖、設定和 modal，並為顏色預設按鈕加入在地化標籤。
- `1.4.1`：改善外部日曆事件操作、按下回饋，以及成功/錯誤 Notice。
- `1.4.0`：新增自訂日曆疊加控制和可選外部日曆 feed。外部 `webcal://` 或 `https://` `.ics` 事件在你建立 Markdown 筆記前，會以唯讀疊加形式顯示。
- `1.3.6`：維護版本，穩定型別化社群外掛 audit 檢查。
- `1.3.5`：維護版本，對齊 Obsidian 外掛 lint 和 release 驗證流程。
- `1.3.4`：維護版本，為型別化 ESLint 明確接入 TypeScript project，並固定 lint 工具版本。
- `1.3.3`：維護版本，加入更嚴格的型別化 ESLint 安全檢查。
- `1.3.2`：維護版本，整理文件、agent 指引、ESLint config 型別和 TypeScript lib target。
- `1.3.1`：包含固定 Obsidian typings、維護 dependency lockfile、ESLint 相容性和重複事件 chip 樣式整理。
- `1.3.0`：在年度、月度格狀、月度列表和側邊欄規劃視圖中加入重複事件與替代日曆標籤。
- `1.2.1`：維護版本，處理 Obsidian 社群外掛 lint 相容性和打包節假日依賴。
- `1.2.0`：新增右側邊欄規劃器、自動側邊欄設定、**Open monthly planner in sidebar** 命令，以及同一側邊 leaf 內的視圖切換。

## 截圖

以下截圖來自隔離的 demo 資料夾，其中包含全天、定時、範圍、待辦與計畫筆記。暫存資料已在拍攝後移除。窄版截圖呈現橫向空間受限時，共用標題列與月度視圖的適應方式。

### 桌面

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| 單日時間軸 | 3日時間軸 |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### 窄版配置

| 月度格狀 | 月度列表 |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## 主要功能

- **年度規劃器**：以 `12 個月 x 31 天` 表格查看日期筆記和範圍筆記。展開後的月份儲存格寬度會在重新載入後保留。
- **在地化 UI**：Diary 可在英文、德文、西班牙文、法文、日文、簡體中文、繁體中文和韓文之間切換。
- **月度格狀檢視**：用大型日曆格狀查看一個月中的 chip、範圍條、節假日、日曆疊加標籤和外部日曆疊加。
- **月度列表**：用逐日垂直列表檢視繁忙月份，並用 `All`、`With notes`、`Upcoming` 篩選。
- **單日規劃器**：在24小時時間軸上規劃一天。多日範圍顯示為連續的全天橫條或日期時間區間，帶時間範圍的邊界可跨日期調整。
- **3日規劃器**：用並列欄比較連續三天。窄螢幕以橫向捲動保持欄寬可讀。
- **直接視圖選擇**：在年度、月度格狀、月度列表、單日和3日視圖間直接切換。
- **右側邊欄規劃器**：在主工作區開啟筆記的同時，把緊湊月度規劃器保留在右側邊欄。
- **計畫筆記面板**：在規劃器上方建立和預覽年度筆記 (`YYYY.md`) 與月度筆記 (`YYYY-MM.md`)。展開/收合狀態會儲存；行動裝置使用獨立狀態，初始為收合。
- **日期與範圍筆記**：依照單日或日期範圍檔名，把筆記顯示為規劃器 chip。預設掃描整個 vault，也可設定為只掃描規劃資料夾。
- **重複事件**：以公曆或替代日曆為基準，每N天、週、月或年重複。發生項在選取前保持為虛擬行程。
- **顏色、待辦與完成狀態**：frontmatter 的 `color`、`todo`、`completed` 會反映在 chip 樣式和標籤上。
- **節假日疊加**：顯示支援 UI 語言地區的國家/地區節假日。選取節假日徽章可查看名稱。
- **替代日曆標籤**：可選顯示一個緊湊標籤，包括韓國農曆、中國農曆、檀紀、希伯來曆、伊斯蘭曆、波斯曆、印度國定曆、佛曆、日本年號、民國紀年、科普特曆、衣索比亞曆等。所有選項文字都已覆蓋支援的 UI 語言。
- **自訂日曆疊加**：為幻想世界或跑團建立本機日曆設定，定義月份、星期和簡單閏日規則。Diary 會顯示自訂日期標籤，同時保留一般 `YYYY-MM-DD` 筆記檔案。
- **外部日曆疊加**：加入 `webcal://` 或 `https://` `.ics` feed，手動或定時重新整理，並以唯讀 chip/範圍條顯示在各規劃視圖。只有在你選擇外部事件時，才會建立一般 Markdown 筆記。
- **限定樣式範圍**：Diary 的 CSS 只作用於規劃視圖、設定面板和外掛 modal，不會改變一般 vault 內容樣式。
- **本機提醒**：帶有 `notify_minutes` 的筆記會在事件日期、Obsidian 開啟時顯示 Obsidian Notice。
- **規劃器剪貼簿**：桌面端可以複製、貼上、刪除和復原貼上的日期或 chip。
- **鍵盤與可及性**：日期儲存格、chip、範圍條、節假日徽章、規劃器標籤和月度列表列都支援鍵盤啟用和可及標籤。
- **行動裝置最佳化**：月度格狀檢視支援雙指縮放、重設縮放和當日摘要面板。

## 安裝

1. 從 [Releases](https://github.com/POBSIZ/obsidian-diary/releases) 下載最新版本。
2. 將 `main.js`、`manifest.json`、`styles.css` 複製到 `Vault/.obsidian/plugins/diary/`。
3. 在 Obsidian 中開啟 **Settings -> Community plugins**。
4. 如果 Restricted mode 已開啟，只在可信任 vault 中關閉它，然後啟用 **Diary**。
5. 從左側 ribbon 圖示或命令面板開啟規劃器。月度 ribbon 圖示會開啟右側邊欄規劃器。

## 快速開始

1. 執行 **Open monthly planner in sidebar** 開啟側邊欄規劃器，或執行 **Open monthly planner** 開啟完整工作區分頁。
2. 選取標題列中的新增檔案按鈕，或選取一個日期儲存格。
3. 選擇 **Single date** 或 **範圍**。
4. 輸入資料夾、日期、檔名、顏色、待辦狀態、提醒時間和可選重複設定。
5. 選取 **建立**。Diary 會建立 Markdown 筆記，並在規劃器中顯示為 chip 或範圍條。

建立出的筆記都是一般 Markdown 檔案。即使停用外掛，它們也會留在 vault 中。

## 開啟和切換視圖

Ribbon 圖示：

- `calendar-range`：在主工作區開啟年度規劃器
- `calendar-days`：在右側邊欄開啟或顯示月度規劃器
- `list-ordered`：在主工作區開啟月度列表

命令面板：

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

選取任一規劃器標題列中的重複圖示，可以讓同一個 leaf 按以下順序循環。

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

使用上一項/下一項按鈕切換年份或月份，使用日曆圖示回到目前年份或月份。選取年份或月份標籤可以輸入特定值。

## 右側邊欄規劃器

當 workspace 準備好後，Diary 會在右側邊欄建立一個緊湊月度規劃器。使用 **Open monthly planner in sidebar** 或月度 ribbon 圖示可以再次顯示它。

側邊欄規劃器是輔助視圖：

- 使用緊湊月度版面和當日摘要面板。
- 從側邊欄選取規劃筆記時，檔案會在主工作區開啟，因此側邊欄仍可保留。
- 視圖切換按鈕可在年度、月度格狀和月度列表之間切換。
- Diary 只保留一個規劃器側邊 leaf，並清理舊版本留下的右側月度規劃 leaf。

## 月度列表篩選器

月度列表有三個篩選器：

- **All**：顯示所選月份的每一天。
- **With notes**：只顯示包含單日筆記或範圍筆記的日期。
- **Upcoming**：顯示所選月份中今天及之後的日期。

當月度列表開啟目前月份時，Diary 會捲動到今天所在列。目前月份按鈕也會回到今天。

## 外部日曆 Feed

使用 **Settings -> Diary -> 外部日曆** 加入已發布的 `webcal://` URL 或 `https://` `.ics` URL。

- Feed URL 會儲存在本機外掛資料中，並可能隨 vault 同步。請把秘密 iCal URL 當作存取權杖處理。
- Diary 會拒絕本機或私有網路日曆 URL。
- 你可以設定 feed 名稱、顏色、是否包含描述、重新整理間隔，以及在哪些規劃界面顯示。
- 新 feed 預設每 60 分鐘自動重新整理，並顯示在年度、月度格狀、月度列表和側邊欄視圖中。
- 外部事件是唯讀規劃疊加，使用獨立的虛線/ghost 樣式，不支援拖曳、規劃器剪貼簿、待辦或顏色編輯。
- 選取外部事件會開啟詳細 modal，包含 **Create Markdown note**、**Refresh calendar**、**Copy details** 操作，並帶有在地化的按下、載入和完成回饋。
- 從外部事件建立 Markdown 筆記時，Diary 會儲存關聯 frontmatter，並隱藏該事件的重複疊加。

## 建立筆記

### 單日筆記

選取日期儲存格或新增檔案按鈕，然後使用 **Single date**。

- 預設檔名為 `YYYY-MM-DD.md`。
- 加入後綴可作為 chip 標題。例如：`2026-05-19-mobile-qa.md` -> `mobile-qa`
- 設定顏色會顯示 chip 邊框或行動裝置圓點。
- 啟用 **Todo file** 可在 chip 上顯示待辦狀態。
- 設定 **Reminder time** 會儲存 `notify_minutes` frontmatter。
- 啟用 **Repeat** 後，選擇每日、每週、每月或每年以及1到999的間隔，即可每N天、週、月或年重複，並可設定曆法基準和結束日期。

### 範圍筆記

桌面端可拖過日期儲存格來預填 **範圍** modal。行動裝置可選取新增檔案按鈕，選擇 **範圍**，再手動輸入開始和結束日期。

- 檔名格式為 `YYYY-MM-DD--YYYY-MM-DD.md`。
- 加入後綴可作為範圍標題。例如：`2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- 建立範圍筆記時會自動儲存 `date_start` 和 `date_end`。
- 年度規劃器使用垂直條和開始日期 chip 顯示範圍筆記。月度格狀和列表使用範圍條顯示。
- 選擇 **全天** 可將兩個時間都留空；如需指定時間，請同時填寫兩者，以定義從 `date_start` + `start_time` 到 `date_end` + `end_time` 的連續區間。
- 單日與3日規劃器將全天範圍顯示為跨日期的連續橫條。可將其拖到時間軸上設定時間，再拖曳首日或末日邊界來同時調整對應日期與時間。

### 計畫筆記

使用每個規劃器上方的計畫筆記面板建立年度或月度計畫筆記。

- 年度計畫筆記：`{plannerFolder}/{year}.md`
- 月度計畫筆記：`{plannerFolder}/{year}-{month}.md`
- 面板可收合或展開，狀態會保存在外掛資料中。
- 桌面端和行動裝置使用獨立狀態：桌面端預設展開，行動裝置預設收合。
- 如果計畫筆記已存在，Diary 會顯示預覽和開啟按鈕。

## 編輯筆記

選取規劃器中的 chip 或範圍條，會開啟檔案選項 modal。

- 查看檔案路徑
- 修改顯示標題
- 修改單日或範圍日期
- 修改 chip 顏色
- 修改待辦/完成狀態
- 修改提醒時間
- 預覽檔案
- 開啟檔案
- 刪除檔案

桌面端可將日期 chip 或範圍條拖到其他日期來移動。範圍筆記依開始日期移動，並保持相同持續時間。如果目標路徑已存在，Diary 不會移動檔案。

## 鍵盤與可及性

- 在聚焦的日期儲存格、規劃 chip、範圍條、節假日徽章、月度列表列、年份標籤或月份標籤上按 `Enter` 或 `Space` 可啟用。
- 規劃器控制項使用按鈕角色、狀態標籤和 `aria-label` 文字。
- 建立/編輯 modal 中的顏色預設按鈕提供在地化 `aria-label` 和 `title`。
- 月度列表篩選器透過 `aria-selected` 暴露選取狀態。
- modal 驗證訊息會透過 polite live region 通知。

## 規劃器剪貼簿（桌面端）

在規劃視圖中，選取日期或 chip 時按住 macOS 的 `Cmd`，或 Windows/Linux 的 `Ctrl`。

Diary 會把複製的規劃筆記保存在目前 Obsidian 工作階段的內部記憶體剪貼簿中。它不會讀取或寫入系統剪貼簿。

- `Cmd/Ctrl + click`：取代目前選取
- `Cmd/Ctrl + Shift + click`：加入選取或從選取中移除
- `Cmd/Ctrl + C`：把選取的規劃筆記複製到 Diary 內部剪貼簿
- `Cmd/Ctrl + V`：貼到選取的目標日期
- `Cmd/Ctrl + Delete` 或 `Cmd/Ctrl + Backspace`：將選取的規劃筆記移到垃圾桶
- `Cmd/Ctrl + Z`：復原上一次貼上，將貼出的檔案移到垃圾桶

貼上規則：

- 可以把一個複製的筆記貼到多個日期。
- 可以把多個複製的筆記貼到一個日期。
- Diary 會阻止多筆記到多日期的貼上組合，以避免衝突含義不清。
- 如果檔案已存在，Diary 會建立 `-copy` 或 `-copy2` 這樣的唯一路徑。

## 行動裝置使用

- 在月度格狀中點選某一天，開啟底部當日摘要面板。
- 使用摘要面板查看當天的單日筆記、範圍筆記和節假日。
- 選取 **Create note** 為該日期建立新筆記。
- 在月度格狀中使用雙指縮放。
- 使用重設縮放按鈕恢復格狀縮放等級。
- Diary 會自動讓內容與選單避開 Obsidian 的標準或浮動底部導覽。使用 **行動裝置底部間距** 設定額外最小間距，並用 **行動裝置儲存格寬度** 調整年度儲存格。

## 設定

| 設定 | 說明 |
| --- | --- |
| 語言 | 外掛 UI 語言。預設：`en`。支援 `en`、`de`、`es`、`fr`、`ja`、`zh-CN`、`zh-TW`、`ko`。 |
| Planner folder | 新規劃筆記和計畫面板筆記的預設資料夾。掃描範圍設定為規劃資料夾時也會使用。預設：`Planner`。 |
| Planner note scan scope | 控制 Diary 在整個 vault 中尋找規劃筆記，或只在 **Planner folder** 及其子資料夾中尋找。預設：`Entire vault`。 |
| Date format | 儲存的日期格式設定。目前規劃檔名使用 `YYYY-MM-DD` 規則。 |
| Show holidays | 開啟或關閉節假日渲染。 |
| 節假日國家/地區 | 節假日顯示國家/地區。支援 `KR`、`US`、`JP`、`CN`、`GB`、`DE`、`ES`、`FR`、`AU`、`CA`、`TW`、`None`。 |
| 顯示的日曆 | 為年度、月度格狀、月度列表、當日摘要和側邊欄規劃器選擇一個內建替代日曆或自訂日曆設定。預設：`None`。 |
| 自訂日曆 | 本機幻想/跑團日曆設定，可定義月份長度、星期名稱、epoch 映射、標籤格式和簡單閏日規則。 |
| 外部日曆 | 可選 `webcal://` 或 `https://` `.ics` feed，以唯讀疊加顯示。每個 feed 都有啟用狀態、顏色、重新整理間隔、描述開關和各視圖可見性設定。 |
| 行動裝置底部間距 | 所有行動裝置規劃器的最小底部間距。即使數值較小，navbar 與 safe area 自動間距仍會套用。 |
| 行動裝置儲存格寬度 | 行動裝置年度規劃器的月份儲存格寬度。`0` 使用預設值。 |

Diary 也會在外掛資料中保存僅用於 UI 的狀態：計畫筆記預覽展開狀態、行動裝置計畫筆記預覽展開狀態，以及年度規劃器展開月份儲存格寬度。

## Frontmatter 參考

| Key | 說明 |
| --- | --- |
| `color` | Chip 顏色。可使用任何有效 CSS 顏色，例如 `#22c55e`、`red`、`rgb(34, 197, 94)`。 |
| `todo` | 為 `true` 時顯示為待辦 chip。 |
| `completed` | 當 `todo: true` 時顯示完成狀態。 |
| `start_time` | 選用開始時間，格式為 `HH:mm`。在範圍筆記中，它是 `date_start` 的時間邊界；兩個時間須同時填寫或同時留空。 |
| `end_time` | 選用結束時間，格式為 `HH:mm`。在範圍筆記中，它是 `date_end` 的時間邊界；不會觸發提醒。 |
| `notify_minutes` | 事件日期從本機午夜開始計算的分鐘數。接受 `0` 到 `1439`。上午 9:00 為 `540`。 |
| `date_start` | 範圍筆記自動儲存的開始日期。 |
| `date_end` | 範圍筆記自動儲存的結束日期。 |
| `title` | 無法從檔名推導標題時使用的顯示標題。 |
| `recurrence_id` | 重複來源和生成發生項共享的穩定系列 ID。 |
| `recurrence_role` | `source` 表示重複定義，`occurrence` 表示生成筆記。 |
| `recurrence_calendar` | 日曆基準：`gregorian` 或支援的替代日曆 ID。 |
| `recurrence_rule` | 儲存頻率和選填間隔，例如 `FREQ=WEEKLY;INTERVAL=2`。沒有 `INTERVAL` 時表示1。 |
| `recurrence_anchor_date` | 作為系列開始的公曆來源日期。 |
| `recurrence_until_date` | 選填的包含式公曆結束日期。 |
| `recurrence_anchor_year/month/day` | 用於替代日曆匹配的基準日曆日期欄位。 |
| `recurrence_exdates` | 從系列中跳過的公曆發生日期。 |
| `recurrence_source_path` | 生成發生項中儲存的來源筆記路徑。 |
| `recurrence_occurrence_date` | 生成發生項代表的公曆日期。 |
| `diary_external_calendar` | 從外部事件建立 Markdown 筆記時儲存的外部日曆 feed ID。 |
| `diary_external_event_uid` | 外部事件 UID。 |
| `diary_external_event_instance` | 外部事件實例鍵，通常是事件開始日期/時間。 |
| `diary_external_event_source` | 用於抑制重複疊加的穩定連結鍵。 |
| `diary_external_event_linked_at` | Diary 從外部事件建立 Markdown 筆記的 ISO 時間戳。 |

提醒不是系統級通知。Obsidian 開啟時，Diary 大約每 15 秒檢查一次，並在事件日期的匹配分鐘內顯示 Obsidian Notice。

重複發生項預設為虛擬行程。建立筆記時，Diary 會重用同一 `recurrence_id` 的既有發生項，且不會覆寫一般筆記或其他系列。

## 檔名規則

Diary 預設掃描整個 vault 中的 Markdown 檔案，並顯示符合以下規則的筆記。在設定中，你可以把掃描限制到 **Planner folder** 及其子資料夾。新建筆記預設放入設定的 **Planner folder**。

單日：

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

範圍：

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

計畫筆記：

```text
2026.md
2026-05.md
```

顯示標題優先順序：

1. 檔名後綴
2. Frontmatter `title`
3. 第一個 Markdown 標題
4. 檔案 basename

建立或編輯規劃筆記標題時，可見標題中的空格會保留在檔名後綴中。Diary 不再把這些空格改成連字號。

## 開發

本 repo 使用 npm。CI matrix 目前驗證 Node.js `20.x` 和 `22.x`；本機開發也可使用目前 LTS 版本。

```bash
npm install
npm run dev
```

生產建置：

```bash
npm run build
```

Lint：

```bash
npm run lint
```

Test：

```bash
npm test
```

## Release

- Release workflow：`.github/workflows/release.yml`
- Release assets：`main.js`、`manifest.json`、`styles.css`
- 使用 `npm version patch|minor|major --no-git-tag-version`，讓 `package.json`、`package-lock.json`、`manifest.json` 和 `versions.json` 保持同步。
- GitHub release tag 必須與 `manifest.json` 的 version 完全一致，不應帶前綴 `v`。
- 本 repo 透過 GitHub Actions 從帶標籤的原始碼建置 `main.js`、`manifest.json`、`styles.css`，並將其作為個別 release asset 發布。

## 隱私與網路

- 規劃器功能只處理 vault 內的本機 Markdown 檔案。
- Diary 沒有隱藏 telemetry 或 analytics。
- 節假日和日曆疊加計算使用打包資料、瀏覽器提供資料或本機保存設定，不會為了規劃渲染向外部服務傳送 vault 內容。
- 外部日曆 feed 是可選的。Diary 只取得你加入的 feed URL，把事件快取存入外掛資料，並且只有在你選擇 **Create Markdown note** 時才建立 Markdown 檔案。
- `obsidian-reminder-endpoint-spec.md` 是未來提醒 endpoint 的設計筆記。目前發布的外掛不會透過網路傳送提醒資料。

## 疑難排解

- 如果外掛缺失，請確認 `main.js`、`manifest.json` 和 `styles.css` 直接位於 `Vault/.obsidian/plugins/diary/`。
- 如果命令缺失，請確認 **Diary** 已在 **Settings -> Community plugins** 中啟用。
- 如果側邊欄規劃器缺失，請執行 **Open monthly planner in sidebar**，或在啟用外掛後重新載入 Obsidian。
- 如果 chip 不出現，請確認檔名符合 `YYYY-MM-DD` 或 `YYYY-MM-DD--YYYY-MM-DD`。
- 若要在自動避開的行動導覽上方保留更多空間，請增加 **行動裝置底部間距**。
- 如果提醒沒有出現，請確認 Obsidian 已開啟、筆記日期是今天，且 `notify_minutes` 在 `0` 到 `1439` 之間。

## 授權

參見 `LICENSE`。
