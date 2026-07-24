# Diary（繁體中文）

Diary 是一款 Obsidian 社群外掛，可把儲存庫中的一般 Markdown 筆記顯示為日曆和時間軸。無須移到專用資料庫或檔案格式，就能在年度、月度、單日和3日視圖之間切換。

完整文件：[English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## 概覽

| 項目 | 值 |
| --- | --- |
| 外掛 ID | `diary` |
| 目前版本 | `1.15.1` |
| 最低 Obsidian 版本 | `1.7.2` |
| 支援平台 | 桌面 / 行動裝置 (`isDesktopOnly: false`) |
| 預設語言 | `en` |
| 預設規劃資料夾 | `Planner` |

## 1.15.1 更新

- `1.15.1`：重寫並精簡所有支援語言的文件，統一用語，並縮短版本說明。

較早的變更請參閱 [Releases](https://github.com/POBSIZ/obsidian-diary/releases)。

## 截圖

截圖使用一個暫存示範資料夾，其中包含全天、定時、範圍、待辦與計畫筆記。窄版範例呈現同一個介面在橫向空間不足時的效果；拍攝後已刪除示範資料夾。

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

- **年度規劃器**：以 `12 個月 × 31 天` 表格查看日期筆記和範圍筆記。調整後的月份儲存格寬度會在重新載入後保留。
- **在地化 UI**：Diary 可在英文、德文、西班牙文、法文、日文、簡體中文、繁體中文和韓文之間切換。
- **月度格狀檢視**：用大型日曆格狀查看一個月中的項目、範圍條、節假日、日曆疊加標籤和外部日曆疊加。
- **月度列表**：按日期瀏覽整月行程，並用 `All`、`With notes`、`Upcoming` 篩選。
- **單日規劃器**：在24小時時間軸上規劃一天。多日範圍顯示為連續的全天橫條或日期時間區間，帶時間範圍的邊界可跨日期調整。
- **3日規劃器**：用並列欄比較連續三天。窄螢幕以橫向捲動保持欄寬可讀。
- **直接視圖選擇**：在年度、月度格狀、月度列表、單日和3日視圖間直接切換。
- **右側邊欄規劃器**：在主工作區開啟筆記的同時，把緊湊月度規劃器保留在右側邊欄。
- **計畫筆記面板**：在規劃器上方建立和預覽年度筆記 (`YYYY.md`) 與月度筆記 (`YYYY-MM.md`)。展開/收合狀態會儲存；行動裝置使用獨立狀態，初始為收合。
- **日期與範圍筆記**：依照單日或日期範圍檔名，在規劃器中顯示對應項目。預設掃描整個儲存庫，也可設定為只掃描規劃資料夾。
- **重複事件**：以公曆或替代日曆為基準，每N天、週、月或年重複。發生項在選取前保持為虛擬行程。
- **顏色、待辦與完成狀態**：frontmatter 的 `color`、`todo`、`completed` 會反映在項目樣式和標籤上。
- **節假日疊加**：顯示支援 UI 語言地區的國家/地區節假日。選取節假日徽章可查看名稱。
- **替代日曆標籤**：可選顯示一個緊湊標籤，包括韓國農曆、中國農曆、檀紀、希伯來曆、伊斯蘭曆、波斯曆、印度國定曆、佛曆、日本年號、民國紀年、科普特曆、衣索比亞曆等。所有選項文字都已覆蓋支援的 UI 語言。
- **自訂日曆疊加**：為幻想世界或跑團建立本機日曆設定，定義月份、星期和簡單閏日規則。Diary 會顯示自訂日期標籤，同時保留一般 `YYYY-MM-DD` 筆記檔案。
- **外部日曆疊加**：加入 `webcal://` 或 `https://` `.ics` 訂閱來源，手動或定時重新整理，並以唯讀項目/範圍條顯示在各規劃視圖。只有在你選擇外部事件時，才會建立一般 Markdown 筆記。
- **限定樣式範圍**：Diary 的 CSS 只作用於規劃視圖、設定面板和外掛對話框，不會改變一般儲存庫內容樣式。
- **本機提醒**：帶有 `notify_minutes` 的筆記會在事件日期、Obsidian 開啟時顯示 Obsidian Notice。
- **規劃器剪貼簿**：桌面端可以複製、貼上、刪除和復原貼上的日期或項目。
- **鍵盤與可及性**：日期儲存格、項目、範圍條、節假日徽章、規劃器標籤和月度列表列都支援鍵盤啟用和可及標籤。
- **行動裝置最佳化**：月度格狀檢視支援雙指縮放、重設縮放和當日摘要面板。

## 安裝

1. 從 [Releases](https://github.com/POBSIZ/obsidian-diary/releases) 下載最新版本。
2. 將 `main.js`、`manifest.json`、`styles.css` 複製到 `Vault/.obsidian/plugins/diary/`。
3. 在 Obsidian 中開啟 **Settings → Community plugins**。
4. 如果 Restricted mode 已開啟，只在可信任儲存庫中關閉它，然後啟用 **Diary**。
5. 從左側 ribbon 圖示或命令面板開啟規劃器。月度 ribbon 圖示會開啟右側邊欄規劃器。

## 快速開始

1. 執行 **Open monthly planner in sidebar** 開啟側邊欄規劃器，或執行 **Open monthly planner** 開啟完整工作區分頁。
2. 選取標題列中的新增檔案按鈕，或選取一個日期儲存格。
3. 選擇 **Single date** 或 **範圍**。
4. 輸入資料夾、日期、檔名、顏色、待辦狀態、提醒時間和可選重複設定。
5. 選取 **建立**。Diary 會建立 Markdown 筆記，並在規劃器中顯示為項目或範圍條。

建立出的筆記都是一般 Markdown 檔案。即使停用外掛，它們也會留在儲存庫中。

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

## 外部日曆訂閱來源

使用 **Settings → Diary → 外部日曆** 加入已發布的 `webcal://` URL 或 `https://` `.ics` URL。

- 訂閱來源 URL 會儲存在本機外掛資料中，並可能隨儲存庫同步。請把秘密 iCal URL 當作存取權杖處理。
- Diary 會拒絕本機或私有網路日曆 URL。
- 你可以設定訂閱來源名稱、顏色、是否包含描述、重新整理間隔，以及在哪些規劃界面顯示。
- 新訂閱來源預設每 60 分鐘自動重新整理，並顯示在年度、月度格狀、月度列表和側邊欄視圖中。
- 外部事件是唯讀規劃疊加，以淡色虛線區分，不支援拖曳、規劃器剪貼簿、待辦或顏色編輯。
- 選取外部事件會開啟詳細對話框，包含 **Create Markdown note**、**Refresh calendar**、**Copy details** 操作，並帶有在地化的按下、載入和完成回饋。
- 從外部事件建立 Markdown 筆記時，Diary 會儲存關聯 frontmatter，並隱藏該事件的重複疊加。

## 建立筆記

### 單日筆記

選取日期儲存格或新增檔案按鈕，然後使用 **Single date**。

- 預設檔名為 `YYYY-MM-DD.md`。
- 加入後綴可作為項目標題。例如：`2026-05-19-mobile-qa.md` -> `mobile-qa`
- 設定顏色會顯示項目邊框或行動裝置圓點。
- 啟用 **Todo file** 可在項目上顯示待辦狀態。
- 設定 **Reminder time** 會儲存 `notify_minutes` frontmatter。
- 啟用 **Repeat** 後，選擇每日、每週、每月或每年以及1到999的間隔，即可每N天、週、月或年重複，並可設定曆法基準和結束日期。

### 範圍筆記

桌面端可拖過日期儲存格來預填 **範圍** 對話框。行動裝置可選取新增檔案按鈕，選擇 **範圍**，再手動輸入開始和結束日期。

- 檔名格式為 `YYYY-MM-DD--YYYY-MM-DD.md`。
- 加入後綴可作為範圍標題。例如：`2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- 建立範圍筆記時會自動儲存 `date_start` 和 `date_end`。
- 年度規劃器使用垂直條和開始日期項目顯示範圍筆記。月度格狀和列表使用範圍條顯示。
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

選取規劃器中的項目或範圍條，會開啟檔案選項對話框。

- 在 **Single date** 與 **Range** 之間切換
- 選擇現有資料夾或輸入自訂資料夾路徑
- 編輯包含日期、範圍和標題後綴的完整檔名
- 修改開始與結束日期；檔名會自動同步
- 修改項目顏色
- 修改待辦/完成狀態
- 修改提醒時間
- 預覽檔案
- 開啟檔案
- 刪除檔案

套用變更時，Diary 會移動或重新命名 Markdown 檔案。轉換為範圍筆記時會寫入 `date_start` 和 `date_end`；切回單日筆記時會移除這兩個欄位。如果目標資料夾已有同名檔案，操作會被阻止。

桌面端可將日期項目或範圍條拖到其他日期來移動。範圍筆記依開始日期移動，並保持相同持續時間。如果目標路徑已存在，Diary 不會移動檔案。

## 鍵盤與可及性

- 在聚焦的日期儲存格、規劃項目、範圍條、節假日徽章、月度列表列、年份標籤或月份標籤上按 `Enter` 或 `Space` 可啟用。
- 規劃器控制項使用按鈕角色、狀態標籤和 `aria-label` 文字。
- 建立/編輯對話框中的顏色預設按鈕提供在地化 `aria-label` 和 `title`。
- 月度列表篩選器透過 `aria-selected` 暴露選取狀態。
- 對話框驗證訊息會透過 polite live region 通知。

## 規劃器剪貼簿（桌面端）

在規劃視圖中，選取日期或項目時按住 macOS 的 `Cmd`，或 Windows/Linux 的 `Ctrl`。

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
| Planner note scan scope | 控制 Diary 在整個儲存庫中尋找規劃筆記，或只在 **Planner folder** 及其子資料夾中尋找。預設：`Entire vault`。 |
| Date format | 儲存的日期格式設定。目前規劃檔名使用 `YYYY-MM-DD` 規則。 |
| Show holidays | 開啟或關閉節假日渲染。 |
| 節假日國家/地區 | 節假日顯示國家/地區。支援 `KR`、`US`、`JP`、`CN`、`GB`、`DE`、`ES`、`FR`、`AU`、`CA`、`TW`、`None`。 |
| 顯示的日曆 | 為年度、月度格狀、月度列表、當日摘要和側邊欄規劃器選擇一個內建替代日曆或自訂日曆設定。預設：`None`。 |
| 自訂日曆 | 本機幻想/跑團日曆設定，可定義月份長度、星期名稱、epoch 映射、標籤格式和簡單閏日規則。 |
| 外部日曆 | 可選 `webcal://` 或 `https://` `.ics` 訂閱來源，以唯讀疊加顯示。每個訂閱來源都有啟用狀態、顏色、重新整理間隔、描述開關和各視圖可見性設定。 |
| 行動裝置底部間距 | 所有行動裝置規劃器的最小底部間距。即使數值較小，navbar 與 safe area 自動間距仍會套用。 |
| 行動裝置儲存格寬度 | 行動裝置年度規劃器的月份儲存格寬度。`0` 使用預設值。 |
| 意見回饋與支援 | 開啟用於意見回饋、錯誤回報和功能建議的公開 GitHub 表單。 |

Diary 也會在外掛資料中保存僅用於 UI 的狀態：計畫筆記預覽展開狀態、行動裝置計畫筆記預覽展開狀態，以及年度規劃器展開月份儲存格寬度。

## Frontmatter 參考

| Key | 說明 |
| --- | --- |
| `color` | 項目顏色。可使用任何有效 CSS 顏色，例如 `#22c55e`、`red`、`rgb(34, 197, 94)`。 |
| `todo` | 為 `true` 時顯示為待辦項目。 |
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
| `diary_external_calendar` | 從外部事件建立 Markdown 筆記時儲存的外部日曆訂閱來源 ID。 |
| `diary_external_event_uid` | 外部事件 UID。 |
| `diary_external_event_instance` | 外部事件實例鍵，通常是事件開始日期/時間。 |
| `diary_external_event_source` | 用於抑制重複疊加的穩定連結鍵。 |
| `diary_external_event_linked_at` | Diary 從外部事件建立 Markdown 筆記的 ISO 時間戳。 |

提醒不是系統級通知。Obsidian 開啟時，Diary 大約每 15 秒檢查一次，並在事件日期的匹配分鐘內顯示 Obsidian Notice。

重複發生項預設為虛擬行程。建立筆記時，Diary 會重用同一 `recurrence_id` 的既有發生項，且不會覆寫一般筆記或其他系列。

## 檔名規則

Diary 預設掃描整個儲存庫中的 Markdown 檔案，並顯示符合以下規則的筆記。在設定中，你可以把掃描限制到 **Planner folder** 及其子資料夾。新建筆記預設放入設定的 **Planner folder**。

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
4. 檔案 基本檔名

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

設計文件檢查：

```bash
npm run design:lint
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

## 意見回饋與支援

- [提供意見](https://github.com/POBSIZ/obsidian-diary/issues/new?template=訂閱來源back.yml)
- [回報錯誤](https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml)
- [建議功能](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml)

這些連結會開啟公開的 GitHub Issue，並且需要 GitHub 帳號。請勿包含私人 Vault 內容、日曆 URL、存取權杖或其他敏感資訊。

## 隱私與網路

- 規劃器功能只處理儲存庫內的本機 Markdown 檔案。
- Diary 沒有隱藏 telemetry 或 analytics。
- 節假日和日曆疊加計算使用打包資料、瀏覽器提供資料或本機保存設定，不會為了規劃渲染向外部服務傳送儲存庫內容。
- 外部日曆訂閱來源是可選的。Diary 只取得你加入的訂閱來源 URL，把事件快取存入外掛資料，並且只有在你選擇 **Create Markdown note** 時才建立 Markdown 檔案。
- 本機提醒只在 Obsidian 內處理，不會透過網路傳送提醒資料。

## 疑難排解

- 如果外掛缺失，請確認 `main.js`、`manifest.json` 和 `styles.css` 直接位於 `Vault/.obsidian/plugins/diary/`。
- 如果命令缺失，請確認 **Diary** 已在 **Settings → Community plugins** 中啟用。
- 如果側邊欄規劃器缺失，請執行 **Open monthly planner in sidebar**，或在啟用外掛後重新載入 Obsidian。
- 如果項目不出現，請確認檔名符合 `YYYY-MM-DD` 或 `YYYY-MM-DD--YYYY-MM-DD`。
- 若要在自動避開的行動導覽上方保留更多空間，請增加 **行動裝置底部間距**。
- 如果提醒沒有出現，請確認 Obsidian 已開啟、筆記日期是今天，且 `notify_minutes` 在 `0` 到 `1439` 之間。

## 授權

參見 `LICENSE`。
