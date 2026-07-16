# Diary（简体中文）

Diary 是一个 Obsidian 社区插件，可以把 vault 中的 Markdown 文件显示为按日期组织的计划视图。你可以在年度、月度网格、月度列表、单日和3日视图之间切换，同时管理笔记、日历叠加、待办状态和本地提醒。

完整文档：[English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## 当前信息

| 项目 | 值 |
| --- | --- |
| 插件 ID | `diary` |
| 当前版本 | `1.8.3` |
| 最低 Obsidian 版本 | `1.7.2` |
| 支持平台 | 桌面 / 移动端 (`isDesktopOnly: false`) |
| 默认语言 | `en` |
| 默认计划文件夹 | `Planner` |

## 最新版本

- `1.8.3`：使用类型明确的 Obsidian 元素实例 helper 创建元素并立即分离，彻底移除直接的 `Document` 创建调用。
- `1.8.2`：通过类型明确的 `DocumentFragment` Obsidian helper 创建分离的计划器 DOM，消除社区插件审查中的不安全类型传播警告。
- `1.8.1`：在保留旧版设置兼容性的同时，为 Obsidian 1.13+ 添加可搜索的声明式设置，并统一使用 Obsidian DOM helper。
- `1.8.0`：统一所有计划视图中的计划条目、控件、对话框操作、紧凑布局状态和键盘焦点行为，并更新截图。
- `1.7.1`：移除不必要的 DOM 类型断言，并稳定共享计划周期对话框的类型化 lint 解析。
- `1.7.0`：新增单日和3日时间轴计划器、直接视图选择、统一周期导航、独立开始/结束时间，以及每N天、周、月或年的虚拟重复日程。
- `1.6.0`：新增所有支持界面语言的完整文档、西班牙节假日支持，以及备用日历选项文字本地化。
- `1.5.0`：在英语之外，新增德语、西班牙语、法语、日语、简体中文、繁体中文和韩语界面支持。
- `1.4.2`：将 Diary 样式限制在计划视图、设置和模态框，并为颜色预设按钮添加本地化标签。
- `1.4.1`：优化外部日历事件操作、按下反馈，以及成功/错误提示。
- `1.4.0`：新增自定义日历叠加控件和可选外部日历 feed。外部 `webcal://` 或 `https://` `.ics` 事件在你创建 Markdown 笔记之前，会以只读叠加形式显示。
- `1.3.6`：维护版本，稳定类型化社区插件审计检查。
- `1.3.5`：维护版本，对齐 Obsidian 插件 lint 和发布验证流程。
- `1.3.4`：维护版本，为类型化 ESLint 显式接入 TypeScript project，并固定 lint 工具版本。
- `1.3.3`：维护版本，加强类型化 ESLint 安全检查。
- `1.3.2`：维护版本，整理文档、代理指南、ESLint config 类型和 TypeScript lib target。
- `1.3.1`：包含固定 Obsidian 类型、维护 dependency lockfile、ESLint 兼容性和重复事件 chip 样式整理。
- `1.3.0`：在年度、月度网格、月度列表和侧边栏计划视图中加入重复事件和备用日历标签。
- `1.2.1`：维护版本，处理 Obsidian 社区插件 lint 兼容性和打包节假日依赖。
- `1.2.0`：新增右侧边栏计划器、自动侧边栏设置、**Open monthly planner in sidebar** 命令，以及同一侧边 leaf 内的视图切换。

## 截图

以下截图来自一个隔离的演示文件夹，其中包含全天、定时、范围、待办和计划笔记。临时数据在拍摄后已删除。窄屏截图展示了横向空间受限时，共享标题栏和月度视图的适配方式。

### 桌面端

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| 单日时间轴 | 3日时间轴 |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### 窄屏布局

| 月度网格 | 月度列表 |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## 主要功能

- **年度计划器**：用 `12 个月 x 31 天` 的表格查看日期笔记和范围笔记。展开后的月份单元格宽度会在重新加载后保留。
- **本地化界面**：Diary 可在英语、德语、西班牙语、法语、日语、简体中文、繁体中文和韩语之间切换。
- **月度网格**：用大型日历网格查看一个月中的 chip、范围条、节假日、日历叠加标签和外部日历叠加。
- **月度列表**：按天纵向查看繁忙月份，并用 `All`、`With notes`、`Upcoming` 过滤。
- **单日计划器**：在24小时时间轴上规划一天。带 `start_time` 和 `end_time` 的笔记显示在时间轴上；全天和无时间笔记单独显示。
- **3日计划器**：用并列列比较连续三天。窄屏通过横向滚动保持列宽可读。
- **直接视图选择**：在年度、月度网格、月度列表、单日和3日视图间直接切换。
- **右侧边栏计划器**：在主工作区打开笔记的同时，把紧凑月度计划器保留在右侧边栏。
- **计划笔记面板**：在计划器上方创建和预览年度笔记 (`YYYY.md`) 与月度笔记 (`YYYY-MM.md`)。展开/折叠状态会保存；移动端使用单独状态，初始为折叠。
- **日期和范围笔记**：根据单日和日期范围文件名，把笔记显示为计划器 chip。默认扫描整个 vault，也可以设置为只扫描计划文件夹。
- **重复事件**：以公历或备用日历为基准，每N天、周、月或年重复。发生项在选中前保持为虚拟日程。
- **颜色、待办和完成状态**：frontmatter 中的 `color`、`todo`、`completed` 会反映在 chip 样式和标签上。
- **节假日叠加**：显示支持界面语言地区的国家/地区节假日。选择节假日徽标可以查看名称。
- **备用日历标签**：可选显示一个紧凑标签，包括韩国农历、中国农历、檀纪、希伯来历、伊斯兰历、波斯历、印度国定历、佛历、日本年号、民国纪年、科普特历、埃塞俄比亚历等。所有选项文案都已覆盖支持的界面语言。
- **自定义日历叠加**：为幻想世界或跑团创建本地日历配置，定义月份、星期和简单闰日规则。Diary 会显示自定义日期标签，同时保留普通 `YYYY-MM-DD` 笔记文件。
- **外部日历叠加**：添加 `webcal://` 或 `https://` `.ics` feed，手动或定时刷新，并以只读 chip/范围条显示在各计划视图中。只有在你选择外部事件时，才会创建普通 Markdown 笔记。
- **限定样式作用域**：Diary 的 CSS 只作用于计划视图、设置面板和插件模态框，不会改变普通 vault 内容样式。
- **本地提醒**：带有 `notify_minutes` 的笔记会在事件日期、Obsidian 打开时显示 Obsidian Notice。
- **计划器剪贴板**：桌面端可以复制、粘贴、删除和撤销粘贴选中的日期或 chip。
- **键盘和可访问性**：日期单元格、chip、范围条、节假日徽标、计划器标签和月度列表行都支持键盘激活和可访问标签。
- **移动端优化**：月度网格支持双指缩放、重置缩放和当日摘要面板。

## 安装

1. 从 [Releases](https://github.com/POBSIZ/obsidian-diary/releases) 下载最新版本。
2. 将 `main.js`、`manifest.json`、`styles.css` 复制到 `Vault/.obsidian/plugins/diary/`。
3. 在 Obsidian 中打开 **Settings -> Community plugins**。
4. 如果 Restricted mode 已开启，只在可信 vault 中关闭它，然后启用 **Diary**。
5. 从左侧 ribbon 图标或命令面板打开计划器。月度 ribbon 图标会打开右侧边栏计划器。

## 快速开始

1. 运行 **Open monthly planner in sidebar** 打开侧边栏计划器，或运行 **Open monthly planner** 打开完整工作区标签。
2. 选择标题栏中的添加文件按钮，或选择一个日期单元格。
3. 选择 **Single date** 或 **范围**。
4. 输入文件夹、日期、文件名、颜色、待办状态、提醒时间和可选重复设置。
5. 选择 **创建**。Diary 会创建 Markdown 笔记，并在计划器中显示为 chip 或范围条。

创建出的笔记都是普通 Markdown 文件。即使禁用插件，它们也会留在 vault 中。

## 打开和切换视图

Ribbon 图标：

- `calendar-range`：在主工作区打开年度计划器
- `calendar-days`：在右侧边栏打开或显示月度计划器
- `list-ordered`：在主工作区打开月度列表

命令面板：

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

选择任意计划器标题栏中的重复图标，可以让同一个 leaf 按以下顺序循环。

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

使用上一项/下一项按钮切换年份或月份，使用日历图标回到当前年份或月份。选择年份或月份标签可以输入具体值。

## 右侧边栏计划器

当工作区准备好后，Diary 会在右侧边栏创建一个紧凑月度计划器。使用 **Open monthly planner in sidebar** 或月度 ribbon 图标可以再次显示它。

侧边栏计划器是辅助视图：

- 使用紧凑月度布局和当日摘要面板。
- 从侧边栏选择计划笔记时，文件会在主工作区打开，因此侧边栏仍可保留。
- 视图切换按钮可在年度、月度网格和月度列表之间切换。
- Diary 只保留一个计划器侧边 leaf，并清理旧版本遗留的右侧月度计划 leaf。

## 月度列表过滤器

月度列表有三个过滤器：

- **All**：显示选中月份的每一天。
- **With notes**：只显示包含单日笔记或范围笔记的日期。
- **Upcoming**：显示选中月份中今天及之后的日期。

当月度列表打开当前月份时，Diary 会滚动到今天所在行。当前月份按钮也会回到今天。

## 外部日历 Feed

使用 **Settings -> Diary -> 外部日历** 添加已发布的 `webcal://` URL 或 `https://` `.ics` URL。

- Feed URL 保存在本地插件数据中，并可能随 vault 同步。请把秘密 iCal URL 当作访问令牌处理。
- Diary 会拒绝本地或私有网络日历 URL。
- 你可以设置 feed 名称、颜色、是否包含描述、刷新间隔，以及在哪些计划界面显示。
- 新 feed 默认每 60 分钟自动刷新，并显示在年度、月度网格、月度列表和侧边栏视图中。
- 外部事件是只读计划叠加，使用单独的虚线/ghost 样式，不支持拖拽、计划器剪贴板、待办或颜色编辑。
- 选择外部事件会打开详情模态框，包含 **Create Markdown note**、**Refresh calendar**、**Copy details** 操作，并带有本地化的按下、加载和完成反馈。
- 从外部事件创建 Markdown 笔记时，Diary 会保存关联 frontmatter，并隐藏该事件的重复叠加。

## 创建笔记

### 单日笔记

选择日期单元格或添加文件按钮，然后使用 **Single date**。

- 默认文件名为 `YYYY-MM-DD.md`。
- 添加后缀可作为 chip 标题。例如：`2026-05-19-mobile-qa.md` -> `mobile-qa`
- 设置颜色会显示 chip 边框或移动端圆点。
- 启用 **Todo file** 可在 chip 上显示待办状态。
- 设置 **Reminder time** 会保存 `notify_minutes` frontmatter。
- 启用 **Repeat** 后，选择每日、每周、每月或每年以及1到999的间隔，即可每N天、周、月或年重复，并可设置日历基准和结束日期。

### 范围笔记

桌面端可拖过日期单元格来预填 **范围** 模态框。移动端可选择添加文件按钮，选择 **范围**，再手动输入开始和结束日期。

- 文件名格式为 `YYYY-MM-DD--YYYY-MM-DD.md`。
- 添加后缀可作为范围标题。例如：`2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- 创建范围笔记时会自动保存 `date_start` 和 `date_end`。
- 年度计划器使用竖向条和开始日期 chip 显示范围笔记。月度网格和列表使用范围条显示。

### 计划笔记

使用每个计划器上方的计划笔记面板创建年度或月度计划笔记。

- 年度计划笔记：`{plannerFolder}/{year}.md`
- 月度计划笔记：`{plannerFolder}/{year}-{month}.md`
- 面板可折叠或展开，状态会保存在插件数据中。
- 桌面端和移动端使用独立状态：桌面端默认展开，移动端默认折叠。
- 如果计划笔记已存在，Diary 会显示预览和打开按钮。

## 编辑笔记

选择计划器中的 chip 或范围条，会打开文件选项模态框。

- 查看文件路径
- 修改显示标题
- 修改单日或范围日期
- 修改 chip 颜色
- 修改待办/完成状态
- 修改提醒时间
- 预览文件
- 打开文件
- 删除文件

桌面端可将日期 chip 或范围条拖到其他日期来移动。范围笔记按开始日期移动，并保持相同持续时间。如果目标路径已存在，Diary 不会移动文件。

## 键盘和可访问性

- 在聚焦的日期单元格、计划 chip、范围条、节假日徽标、月度列表行、年份标签或月份标签上按 `Enter` 或 `Space` 可激活。
- 计划器控件使用按钮角色、状态标签和 `aria-label` 文本。
- 创建/编辑模态框中的颜色预设按钮提供本地化 `aria-label` 和 `title`。
- 月度列表过滤器通过 `aria-selected` 暴露选中状态。
- 模态框验证信息会通过 polite live region 通知。

## 计划器剪贴板（桌面端）

在计划视图中，选择日期或 chip 时按住 macOS 的 `Cmd`，或 Windows/Linux 的 `Ctrl`。

Diary 会把复制的计划笔记保存在当前 Obsidian 会话的内部内存剪贴板中。它不会读取或写入系统剪贴板。

- `Cmd/Ctrl + click`：替换当前选择
- `Cmd/Ctrl + Shift + click`：添加到选择或从选择中移除
- `Cmd/Ctrl + C`：把选中的计划笔记复制到 Diary 内部剪贴板
- `Cmd/Ctrl + V`：粘贴到选中的目标日期
- `Cmd/Ctrl + Delete` 或 `Cmd/Ctrl + Backspace`：将选中的计划笔记移到废纸篓
- `Cmd/Ctrl + Z`：撤销上一次粘贴，将粘贴出的文件移到废纸篓

粘贴规则：

- 可以把一个复制的笔记粘贴到多个日期。
- 可以把多个复制的笔记粘贴到一个日期。
- Diary 会阻止多笔记到多日期的粘贴组合，以避免冲突含义不清。
- 如果文件已存在，Diary 会创建 `-copy` 或 `-copy2` 这样的唯一路径。

## 移动端使用

- 在月度网格中点击某一天，打开底部当日摘要面板。
- 使用摘要面板查看当天的单日笔记、范围笔记和节假日。
- 选择 **Create note** 为该日期创建新笔记。
- 在月度网格中使用双指缩放。
- 使用重置缩放按钮恢复网格缩放级别。
- 使用 **移动端底部间距** 和 **移动端单元格宽度** 调整间距和单元格宽度。

## 设置

| 设置 | 说明 |
| --- | --- |
| 语言 | 插件界面语言。默认：`en`。支持 `en`、`de`、`es`、`fr`、`ja`、`zh-CN`、`zh-TW`、`ko`。 |
| Planner folder | 新计划笔记和计划面板笔记的默认文件夹。扫描范围设置为计划文件夹时也会使用。默认：`Planner`。 |
| Planner note scan scope | 控制 Diary 在整个 vault 中查找计划笔记，还是只在 **Planner folder** 及其子文件夹中查找。默认：`Entire vault`。 |
| Date format | 保存的日期格式设置。当前计划文件名使用 `YYYY-MM-DD` 规则。 |
| Show holidays | 开启或关闭节假日渲染。 |
| 节假日国家/地区 | 节假日显示国家/地区。支持 `KR`、`US`、`JP`、`CN`、`GB`、`DE`、`ES`、`FR`、`AU`、`CA`、`TW`、`None`。 |
| 显示的日历 | 为年度、月度网格、月度列表、当日摘要和侧边栏计划器选择一个内置备用日历或自定义日历配置。默认：`None`。 |
| 自定义日历 | 本地幻想/跑团日历配置，可定义月份长度、星期名称、epoch 映射、标签格式和简单闰日规则。 |
| 外部日历 | 可选 `webcal://` 或 `https://` `.ics` feed，以只读叠加显示。每个 feed 都有启用状态、颜色、刷新间隔、描述开关和各视图可见性设置。 |
| 移动端底部间距 | 移动端计划器底部间距，避免内容被 Obsidian 移动端控件遮挡。 |
| 移动端单元格宽度 | 移动端年度计划器的月份单元格宽度。`0` 使用默认值。 |

Diary 还会在插件数据中保存仅用于界面的状态：计划笔记预览展开状态、移动端计划笔记预览展开状态，以及年度计划器展开月份单元格宽度。

## Frontmatter 参考

| Key | 说明 |
| --- | --- |
| `color` | Chip 颜色。可使用任何有效 CSS 颜色，例如 `#22c55e`、`red`、`rgb(34, 197, 94)`。 |
| `todo` | 为 `true` 时显示为待办 chip。 |
| `completed` | 当 `todo: true` 时显示完成状态。 |
| `start_time` | 可选的 chip 开始时间，格式为 `HH:mm`。带时间的 chip 按开始时间排序。 |
| `end_time` | 可选的 chip 结束时间，格式为 `HH:mm`。此值不会触发提醒。 |
| `notify_minutes` | 事件日期从本地午夜开始计算的分钟数。接受 `0` 到 `1439`。上午 9:00 为 `540`。 |
| `date_start` | 范围笔记自动保存的开始日期。 |
| `date_end` | 范围笔记自动保存的结束日期。 |
| `title` | 无法从文件名推导标题时使用的显示标题。 |
| `recurrence_id` | 重复源和生成发生项共享的稳定系列 ID。 |
| `recurrence_role` | `source` 表示重复定义，`occurrence` 表示生成笔记。 |
| `recurrence_calendar` | 日历基准：`gregorian` 或支持的备用日历 ID。 |
| `recurrence_rule` | 保存频率和可选间隔，例如 `FREQ=WEEKLY;INTERVAL=2`。没有 `INTERVAL` 时表示1。 |
| `recurrence_anchor_date` | 作为系列开始的公历源日期。 |
| `recurrence_until_date` | 可选的包含式公历结束日期。 |
| `recurrence_anchor_year/month/day` | 用于备用日历匹配的基准日历日期字段。 |
| `recurrence_exdates` | 从系列中跳过的公历发生日期。 |
| `recurrence_source_path` | 生成发生项中保存的源笔记路径。 |
| `recurrence_occurrence_date` | 生成发生项代表的公历日期。 |
| `diary_external_calendar` | 从外部事件创建 Markdown 笔记时保存的外部日历 feed ID。 |
| `diary_external_event_uid` | 外部事件 UID。 |
| `diary_external_event_instance` | 外部事件实例键，通常是事件开始日期/时间。 |
| `diary_external_event_source` | 用于抑制重复叠加的稳定链接键。 |
| `diary_external_event_linked_at` | Diary 从外部事件创建 Markdown 笔记的 ISO 时间戳。 |

提醒不是系统级通知。Obsidian 打开时，Diary 大约每 15 秒检查一次，并在事件日期的匹配分钟内显示 Obsidian Notice。

重复发生项默认是虚拟日程。创建笔记时，Diary 会复用同一 `recurrence_id` 的已有发生项，并且不会覆盖普通笔记或其他系列。

## 文件名规则

Diary 默认扫描整个 vault 中的 Markdown 文件，并显示符合以下规则的笔记。在设置中，你可以把扫描限制到 **Planner folder** 及其子文件夹。新建笔记默认放入配置的 **Planner folder**。

单日：

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

范围：

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

计划笔记：

```text
2026.md
2026-05.md
```

显示标题优先级：

1. 文件名后缀
2. Frontmatter `title`
3. 第一个 Markdown 标题
4. 文件 basename

创建或编辑计划笔记标题时，可见标题中的空格会保留在文件名后缀中。Diary 不再把这些空格改成连字符。

## 开发

本仓库使用 npm。CI 矩阵当前验证 Node.js `20.x` 和 `22.x`；本地开发也可使用当前 LTS 版本。

```bash
npm install
npm run dev
```

生产构建：

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

## 发布

- 发布 workflow：`.github/workflows/release.yml`
- 发布资产：`main.js`、`manifest.json`、`styles.css`
- 使用 `npm version patch|minor|major --no-git-tag-version`，让 `package.json`、`package-lock.json`、`manifest.json` 和 `versions.json` 保持同步。
- GitHub release tag 必须与 `manifest.json` 的版本完全一致，不应带前缀 `v`。
- 本仓库会把发布资产作为单独文件发布，并由 release workflow 为 `main.js`、`manifest.json`、`styles.css` 生成构建来源 attestation。

## 隐私和网络

- 计划器功能只处理 vault 内的本地 Markdown 文件。
- Diary 没有隐藏 telemetry 或 analytics。
- 节假日和日历叠加计算使用打包数据、浏览器提供的数据或本地保存的配置，不会为了计划渲染向外部服务发送 vault 内容。
- 外部日历 feed 是可选的。Diary 只获取你添加的 feed URL，把事件缓存存入插件数据，并且只有在你选择 **Create Markdown note** 时才创建 Markdown 文件。
- `obsidian-reminder-endpoint-spec.md` 是未来提醒 endpoint 的设计笔记。当前发布的插件不会通过网络发送提醒数据。

## 故障排查

- 如果插件缺失，请确认 `main.js`、`manifest.json` 和 `styles.css` 直接位于 `Vault/.obsidian/plugins/diary/`。
- 如果命令缺失，请确认 **Diary** 已在 **Settings -> Community plugins** 中启用。
- 如果侧边栏计划器缺失，请运行 **Open monthly planner in sidebar**，或在启用插件后重新加载 Obsidian。
- 如果 chip 不出现，请确认文件名符合 `YYYY-MM-DD` 或 `YYYY-MM-DD--YYYY-MM-DD`。
- 如果移动端底部内容被遮挡，请增加 **移动端底部间距**。
- 如果提醒没有出现，请确认 Obsidian 已打开、笔记日期是今天，且 `notify_minutes` 在 `0` 到 `1439` 之间。

## 许可证

参见 `LICENSE`。
