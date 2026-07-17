# Diary (Deutsch)

Diary ist ein Obsidian-Community-Plugin, das Markdown-Dateien im Vault als datumsbasierte Planeransichten darstellt. Du kannst zwischen Jahres-, Monatsraster-, Monatslisten-, Tages- und 3-Tage-Ansicht wechseln und dabei Tagesnotizen, Zeitraum-Notizen, Kalender-Overlays, Todo-Status und lokale Erinnerungen verwalten.

Vollständige Dokumentation: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## Aktuelle Informationen

| Eintrag | Wert |
| --- | --- |
| Plugin-ID | `diary` |
| Aktuelle Version | `1.9.3` |
| Minimale Obsidian-Version | `1.7.2` |
| Plattformen | Desktop / Mobil (`isDesktopOnly: false`) |
| Standardsprache | `en` |
| Standardordner für Planer | `Planner` |

## Neueste Version

- `1.9.3`: Stimmt die Release-Provenienz durch die aktuelle Build-Provenienz-Aktion und Lightweight-Git-Tags auf die Prüfung der Obsidian Community Scorecard ab.
- `1.9.2`: Kennzeichnet JavaScript- und CSS-Release-Assets mit der Plugin-Version, damit jede Version eindeutige Digests und zweifelsfreie Herkunftsattestierungen erhält.
- `1.9.1`: Erstellt mit der aktuellen Attestierungsaktion für jedes Release-Asset eine separate, von GitHub verifizierbare Herkunftsattestierung.
- `1.9.0`: Hält mobile Planerinhalte, Zeitleistenenden und kompakte Ansichtsmenüs über der normalen oder schwebenden unteren Obsidian-Navigation und bewahrt den konfigurierbaren Mindestabstand.
- `1.8.3`: Entfernt direkte `Document`-Erzeugungsaufrufe vollständig, indem typisierte Obsidian-Elementhelfer mit sofortigem Ablösen verwendet werden.
- `1.8.2`: Erstellt getrenntes Planer-DOM über typisierte Obsidian-Helfer auf `DocumentFragment` und beseitigt dadurch unsichere Typweitergabe in Community-Plugin-Prüfungen.
- `1.8.1`: Ergänzt durchsuchbare deklarative Einstellungen für Obsidian 1.13+, behält die bisherige Einstellungsunterstützung bei und verwendet durchgehend Obsidian-DOM-Helfer.
- `1.8.0`: Vereinheitlicht Planer-Chips, Bedienelemente, Modal-Aktionen, Compact-Layout-Zustand und Tastaturfokus in allen Planeransichten und aktualisiert die Screenshots.
- `1.7.1`: Entfernt unnötige DOM-Typzusicherungen und stabilisiert die typisierte Lint-Auflösung für den gemeinsamen Planer-Zeitraumdialog.
- `1.7.0`: Fügt Tages- und 3-Tage-Zeitplaner, eine direkte Ansichtsauswahl, gemeinsame Zeitraum-Navigation, getrennte Start-/Endzeiten und virtuelle Wiederholungen alle N Tage, Wochen, Monate oder Jahre hinzu.
- `1.6.0`: Ergänzt vollständige Dokumentation für jede unterstützte UI-Sprache, Feiertage für Spanien und lokalisierte Texte für alternative Kalenderoptionen.
- `1.5.0`: Fügt neben Englisch UI-Sprachen für Deutsch, Spanisch, Französisch, Japanisch, vereinfachtes Chinesisch, traditionelles Chinesisch und Koreanisch hinzu.
- `1.4.2`: Begrenzt Diary-CSS auf Planer-, Einstellungs- und Modalflächen und ergänzt lokalisierte Beschriftungen für Farbvorgaben.
- `1.4.1`: Verfeinert Aktionen für externe Kalenderereignisse, Druckfeedback und Erfolgs- bzw. Fehlermeldungen.
- `1.4.0`: Fügt eigene Kalender-Overlays und optionale externe Kalenderfeeds hinzu. Externe `webcal://`- oder `https://`-`.ics`-Ereignisse bleiben schreibgeschützte Overlays, bis du daraus eine Markdown-Notiz erstellst.
- `1.3.6`: Wartungsrelease für stabilere typisierte Community-Plugin-Prüfungen.
- `1.3.5`: Wartungsrelease zur Angleichung von Obsidian-Plugin-Linting und Release-Prüfung.
- `1.3.4`: Wartungsrelease mit expliziter TypeScript-Projektanbindung für typisiertes ESLint und fixierten Lint-Versionen.
- `1.3.3`: Wartungsrelease mit strengeren typisierten ESLint-Sicherheitsprüfungen.
- `1.3.2`: Wartungsrelease für Dokumentation, Agent-Hinweise, ESLint-Konfigurationstypen und TypeScript-Lib-Ziele.
- `1.3.1`: Release mit fixierten Obsidian-Typen, Dependency-Lockfile-Wartung, ESLint-Kompatibilität und bereinigtem Wiederholungs-Chip-Styling.
- `1.3.0`: Wiederkehrende Ereignisse und alternative Kalenderbeschriftungen in Jahresplaner, Monatsraster, Monatsliste und Seitenplaner.
- `1.2.1`: Wartungsrelease für Obsidian-Community-Plugin-Lint-Kompatibilität und gebündelte Feiertagsabhängigkeit.
- `1.2.0`: Führt den rechten Seitenplaner, automatische Seitenleisten-Einrichtung, den Befehl **Open monthly planner in sidebar** und Layoutwechsel im Seitenblatt ein.

## Screenshots

Die Screenshots stammen aus einem isolierten Demo-Ordner mit ganztägigen, zeitgebundenen, mehrtägigen, Todo- und Plan-Notizen. Die temporären Daten wurden anschließend entfernt. Die schmalen Ansichten zeigen die Anpassung von gemeinsamem Header und Monatsansichten bei wenig Platz.

### Desktop

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| Tages-Zeitleiste | 3-Tage-Zeitleiste |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### Schmale Ansicht

| Monatsraster | Monatsliste |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Hauptfunktionen

- **Jahresplaner**: Zeigt Tages- und Zeitraum-Notizen in einer Tabelle mit `12 Monaten x 31 Tagen`. Erweiterte Monatszellenbreiten bleiben nach Reloads erhalten.
- **Lokalisierte Oberfläche**: Diary lässt sich zwischen Englisch, Deutsch, Spanisch, Französisch, Japanisch, vereinfachtem Chinesisch, traditionellem Chinesisch und Koreanisch umschalten.
- **Monatsraster**: Ein großer Monatskalender mit Chips, Zeitraumleisten, Feiertagen, Kalender-Overlay-Beschriftungen und externen Kalender-Overlays.
- **Monatsliste**: Eine vertikale Tagesliste für volle Monate, mit Filtern für `All`, `With notes` und `Upcoming`.
- **Tagesplaner**: Plane einen Tag auf einer 24-Stunden-Zeitleiste. Notizen mit `start_time` und `end_time` erscheinen auf der Zeitachse; ganztägige und unzeitierte Notizen stehen separat.
- **3-Tage-Planer**: Vergleiche drei aufeinanderfolgende Tage in parallelen Spalten. Auf schmalen Bildschirmen bleiben die Spalten per horizontalem Scrollen lesbar.
- **Direkte Ansichtsauswahl**: Wechsle direkt zwischen Jahr, Monatsraster, Monatsliste, Tag und 3 Tagen.
- **Rechter Seitenplaner**: Ein kompakter Monatsplaner bleibt in der rechten Seitenleiste geöffnet, während Notizen im Hauptbereich geöffnet werden.
- **Plan-Notiz-Panel**: Erstellt und zeigt Jahresnotizen (`YYYY.md`) und Monatsnotizen (`YYYY-MM.md`) oberhalb des Planers. Eingeklappter Zustand wird gespeichert; mobil gibt es einen eigenen Zustand, der zunächst eingeklappt ist.
- **Tages- und Zeitraum-Notizen**: Diary zeigt Notizen als Planer-Chips an, wenn Dateinamen Einzeltermine oder Zeiträume beschreiben. Standardmäßig wird der gesamte Vault gescannt; optional nur der Planerordner.
- **Wiederkehrende Ereignisse**: Wiederhole alle N Tage, Wochen, Monate oder Jahre mit gregorianischer oder alternativer Kalenderbasis. Vorkommen bleiben bis zur Auswahl virtuell.
- **Farbe, Todo und Erledigt-Status**: `color`, `todo` und `completed` aus dem Frontmatter beeinflussen Chip-Stil und Beschriftung.
- **Feiertage**: Zeigt landesspezifische Feiertage für die unterstützten UI-Sprachregionen. Feiertags-Badges lassen sich auswählen, um Namen zu sehen.
- **Alternative Kalenderbeschriftung**: Zeigt optional eine kompakte Zusatzbeschriftung, etwa koreanischen Mondkalender, chinesischen Mondkalender, Dangi, hebräischen, islamischen, persischen, indischen Nationalkalender, buddhistischen Kalender, japanische Ära, Minguo, koptischen oder äthiopischen Kalender. Die Optionsnamen sind in allen unterstützten UI-Sprachen lokalisiert.
- **Eigenes Kalender-Overlay**: Erstelle lokale Fantasy- oder Kampagnenkalender mit eigenen Monaten, Wochentagen und einfachen Schaltregeln. Diary zeigt das eigene Datum als Overlay, behält aber normale `YYYY-MM-DD`-Notizdateien.
- **Externe Kalender-Overlays**: Füge `webcal://`- oder `https://`-`.ics`-Feeds hinzu, aktualisiere sie manuell oder nach Intervall und zeige Ereignisse als schreibgeschützte Chips oder Leisten in allen Planerflächen. Erstelle nur dann eine Markdown-Notiz, wenn du ein externes Ereignis auswählst.
- **Begrenztes Styling**: Diary-CSS betrifft nur Planeransichten, Einstellungen und Plugin-Modals, nicht normale Vault-Inhalte.
- **Lokale Erinnerungen**: Notizen mit `notify_minutes` zeigen eine Obsidian Notice am Ereignistag, solange Obsidian geöffnet ist.
- **Planer-Zwischenablage**: Auf dem Desktop kannst du ausgewählte Termine oder Chips kopieren, einfügen, löschen und Einfügungen rückgängig machen.
- **Tastatur und Barrierefreiheit**: Datumszellen, Chips, Zeitraumleisten, Feiertags-Badges, Planerbeschriftungen und Monatslistenzeilen sind per Tastatur aktivierbar und haben zugängliche Labels.
- **Mobile Optimierung**: Das Monatsraster unterstützt Pinch-Zoom, Zoom-Reset und eine Tagesübersicht.

## Installation

1. Lade die neueste Version unter [Releases](https://github.com/POBSIZ/obsidian-diary/releases) herunter.
2. Kopiere `main.js`, `manifest.json` und `styles.css` nach `Vault/.obsidian/plugins/diary/`.
3. Öffne in Obsidian **Settings -> Community plugins**.
4. Falls Restricted mode aktiv ist, deaktiviere ihn nur für Vaults, denen du vertraust, und aktiviere **Diary**.
5. Öffne einen Planer über die Ribbon-Icons oder die Command Palette. Das Monats-Icon öffnet den rechten Seitenplaner.

## Schnellstart

1. Starte **Open monthly planner in sidebar** für den Seitenplaner oder **Open monthly planner** für einen vollständigen Tab.
2. Wähle die Datei-hinzufügen-Schaltfläche im Kopfbereich oder eine Datumszelle.
3. Wähle **Einzelnes Datum** oder **Zeitraum**.
4. Gib Ordner, Datum bzw. Zeitraum, Dateinamen, Farbe, Todo-Status, Erinnerungszeit und optionale Wiederholung ein.
5. Wähle **Erstellen**. Diary erstellt eine Markdown-Notiz und zeigt sie als Chip oder Zeitraumleiste an.

Erstellte Notizen sind normale Markdown-Dateien. Sie bleiben im Vault, auch wenn das Plugin deaktiviert wird.

## Ansichten öffnen und wechseln

Ribbon-Icons:

- `calendar-range`: Jahresplaner im Hauptbereich öffnen
- `calendar-days`: Monatsplaner in der rechten Seitenleiste öffnen oder anzeigen
- `list-ordered`: Monatsliste im Hauptbereich öffnen

Command Palette:

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

Wähle das Wiederholen-Icon in einem Planerkopf, um dasselbe Blatt in dieser Reihenfolge zu wechseln.

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

Mit Zurück/Vorwärts wechselst du Jahre oder Monate. Das Kalender-Icon springt zum aktuellen Jahr oder Monat. Wähle die Jahres- oder Monatsbeschriftung, um einen konkreten Wert einzugeben.

## Rechter Seitenplaner

Diary erstellt einen kompakten Monatsplaner in der rechten Seitenleiste, sobald der Workspace bereit ist. Mit **Open monthly planner in sidebar** oder dem Monats-Ribbon-Icon kannst du ihn wieder anzeigen.

Der Seitenplaner ist als Begleitansicht gedacht:

- Er nutzt das kompakte Monatslayout und die Tagesübersicht.
- Wenn du eine Planernotiz aus der Seitenleiste auswählst, öffnet sich die Datei im Hauptbereich.
- Die Layout-Schaltfläche wechselt das Seitenblatt zwischen Jahresplaner, Monatsraster und Monatsliste.
- Diary hält nur ein Seitenleistenblatt aktiv und räumt ältere Monatsplaner-Blätter aus früheren Versionen auf.

## Filter der Monatsliste

Die Monatsliste hat drei Filter:

- **All**: zeigt jeden Tag des ausgewählten Monats.
- **With notes**: zeigt nur Tage mit Tages- oder Zeitraum-Notizen.
- **Upcoming**: zeigt heute und zukünftige Tage im ausgewählten Monat.

Wenn die Monatsliste im aktuellen Monat geöffnet wird, scrollt Diary zur heutigen Zeile. Die Schaltfläche für den aktuellen Monat springt ebenfalls zu heute.

## Externe Kalenderfeeds

Nutze **Settings -> Diary -> Externe Kalender**, um eine veröffentlichte `webcal://`-URL oder eine `https://`-`.ics`-URL hinzuzufügen.

- Feed-URLs werden in lokalen Plugin-Daten gespeichert und können mit deinem Vault synchronisiert werden. Behandle geheime iCal-URLs wie Zugriffstoken.
- Diary blockiert lokale und private Netzwerk-URLs.
- Du kannst Feedname, Farbe, Beschreibung, Aktualisierungsintervall und sichtbare Planerflächen einstellen.
- Neue Feeds werden standardmäßig alle 60 Minuten aktualisiert und in Jahresplaner, Monatsraster, Monatsliste und Seitenleiste angezeigt.
- Externe Ereignisse sind schreibgeschützte Overlays mit gestricheltem bzw. Ghost-Stil. Sie unterstützen kein Ziehen, keine Planer-Zwischenablage, keine Todo-Aktion und keine Farbbearbeitung.
- Die Auswahl eines externen Ereignisses öffnet ein Detailmodal mit **Create Markdown note**, **Refresh calendar** und **Copy details**, inklusive lokalisiertem Druck-, Lade- und Erfolgsfeedback.
- Wenn du aus einem externen Ereignis eine Markdown-Notiz erstellst, speichert Diary verknüpfendes Frontmatter und blendet das doppelte Overlay für dieses Ereignis aus.

## Notizen erstellen

### Tagesnotizen

Wähle eine Datumszelle oder die Datei-hinzufügen-Schaltfläche und nutze **Einzelnes Datum**.

- Standarddateiname: `YYYY-MM-DD.md`
- Ein Suffix wird als Chip-Titel genutzt. Beispiel: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- Eine Farbe zeigt einen Chip-Rand oder mobilen Punkt.
- **Todo file** zeigt den Todo-Status auf dem Chip.
- **Reminder time** speichert `notify_minutes` im Frontmatter.
- Mit **Repeat** wählst du täglich, wöchentlich, monatlich oder jährlich und ein Intervall von 1 bis 999. So sind alle N Tage, Wochen, Monate oder Jahre möglich; Kalenderbasis und Enddatum bleiben wählbar.

### Zeitraum-Notizen

Auf dem Desktop kannst du über Datumszellen ziehen, um ein **Zeitraum**-Modal vorzubelegen. Mobil wählst du die Datei-hinzufügen-Schaltfläche, **Zeitraum** und gibst Start und Ende manuell ein.

- Dateiformat: `YYYY-MM-DD--YYYY-MM-DD.md`
- Ein Suffix wird als Zeitraumtitel genutzt. Beispiel: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- `date_start` und `date_end` werden beim Erstellen automatisch gespeichert.
- Der Jahresplaner zeigt Zeitraum-Notizen mit vertikalen Leisten und einem Chip am Startdatum. Monatsraster und Monatsliste zeigen Zeitraumleisten.

### Plan-Notizen

Nutze das Plan-Notiz-Panel oberhalb jedes Planers, um Jahres- oder Monatspläne zu erstellen.

- Jahresplan: `{plannerFolder}/{year}.md`
- Monatsplan: `{plannerFolder}/{year}-{month}.md`
- Das Panel kann ein- und ausgeklappt werden; der Zustand wird in Plugin-Daten gespeichert.
- Desktop und Mobil haben getrennte Zustände: Desktop startet ausgeklappt, Mobil eingeklappt.
- Wenn die Plan-Notiz existiert, zeigt Diary eine Vorschau und eine Öffnen-Schaltfläche.

## Notizen bearbeiten

Wähle einen Chip oder eine Zeitraumleiste, um das Dateioptionen-Modal zu öffnen.

- Dateipfad prüfen
- Anzeigetitel ändern
- Datum oder Zeitraum ändern
- Chip-Farbe ändern
- Todo- und Erledigt-Status ändern
- Erinnerungszeit ändern
- Datei vorschauen
- Datei öffnen
- Datei löschen

Auf dem Desktop kannst du einen Chip oder eine Zeitraumleiste auf ein anderes Datum ziehen. Zeitraum-Notizen werden über das Startdatum verschoben und behalten ihre Dauer. Wenn der Zielpfad existiert, verschiebt Diary die Datei nicht.

## Tastatur und Barrierefreiheit

- Drücke `Enter` oder `Space` auf einer fokussierten Datumszelle, einem Chip, einer Zeitraumleiste, einem Feiertags-Badge, einer Monatslistenzeile, Jahresbeschriftung oder Monatsbeschriftung.
- Planersteuerungen nutzen Button-Rollen, Statuslabels und `aria-label`-Texte.
- Farbvorgaben in Erstellen/Bearbeiten-Modals haben lokalisierte `aria-label`- und `title`-Texte.
- Monatslistenfilter zeigen den ausgewählten Zustand mit `aria-selected`.
- Validierungsmeldungen in Modals werden über polite live regions angekündigt.

## Planer-Zwischenablage (Desktop)

Halte in einer Planeransicht `Cmd` auf macOS oder `Ctrl` auf Windows/Linux gedrückt, während du Daten oder Chips auswählst.

Diary hält kopierte Planernotizen in einer internen In-Memory-Zwischenablage für die aktuelle Obsidian-Sitzung. Die Systemzwischenablage wird nicht gelesen oder beschrieben.

- `Cmd/Ctrl + click`: aktuelle Auswahl ersetzen
- `Cmd/Ctrl + Shift + click`: Auswahl erweitern oder reduzieren
- `Cmd/Ctrl + C`: ausgewählte Planernotizen in die interne Zwischenablage kopieren
- `Cmd/Ctrl + V`: auf ausgewählte Zieldaten einfügen
- `Cmd/Ctrl + Delete` oder `Cmd/Ctrl + Backspace`: ausgewählte Planernotizen in den Papierkorb verschieben
- `Cmd/Ctrl + Z`: letzte Einfügeaktion rückgängig machen, indem eingefügte Dateien in den Papierkorb verschoben werden

Einfügeregeln:

- Eine kopierte Notiz kann auf mehrere Daten eingefügt werden.
- Mehrere kopierte Notizen können auf ein Datum eingefügt werden.
- Viele-zu-viele-Einfügen wird blockiert, um unklare Konflikte zu vermeiden.
- Falls eine Datei existiert, erzeugt Diary einen eindeutigen Pfad wie `-copy` oder `-copy2`.

## Mobile Nutzung

- Tippe im Monatsraster auf einen Tag, um die Tagesübersicht unten zu öffnen.
- Nutze die Übersicht für Tagesnotizen, Zeitraum-Notizen und Feiertage.
- Wähle **Create note**, um eine neue Notiz für diesen Tag zu erstellen.
- Nutze Pinch-Zoom im Monatsraster.
- Nutze den Zoom-Reset, um die Rastergröße zurückzusetzen.
- Diary hält Inhalte und Menüs automatisch über der normalen oder schwebenden unteren Obsidian-Navigation. **Unterer Abstand mobil** legt zusätzlichen Mindestabstand fest; **Mobile Zellbreite** passt die Jahreszellen an.

## Einstellungen

| Einstellung | Beschreibung |
| --- | --- |
| Sprache | Sprache der Plugin-Oberfläche. Standard: `en`. Unterstützt `en`, `de`, `es`, `fr`, `ja`, `zh-CN`, `zh-TW` und `ko`. |
| Planner folder | Standardordner für neue Planernotizen und Plan-Notizen. Wird auch genutzt, wenn der Scan auf den Planerordner begrenzt ist. Standard: `Planner`. |
| Planner note scan scope | Legt fest, ob Diary im gesamten Vault oder nur in **Planner folder** und Unterordnern sucht. Standard: `Entire vault`. |
| Date format | Gespeicherte Datumseinstellung. Planerdateinamen nutzen derzeit `YYYY-MM-DD`. |
| Show holidays | Schaltet Feiertagsanzeige ein oder aus. |
| Feiertagsland | Feiertagsland. Unterstützt `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW` und `None`. |
| Angezeigter Kalender | Wählt einen eingebauten alternativen Kalender oder ein eigenes Kalenderprofil für Jahresplaner, Monatsraster, Monatsliste, Tagesübersicht und Seitenplaner. Standard: `None`. |
| Eigene Kalender | Lokale Fantasy- oder Kampagnenkalenderprofile mit Monatslängen, Wochentagen, Epoche, Beschriftungsformat und einfacher Schaltregel. |
| Externe Kalender | Optionale `webcal://`- oder `https://`-`.ics`-Feeds als schreibgeschützte Overlays. Jeder Feed hat Aktivierung, Farbe, Aktualisierungsintervall, Beschreibung und Sichtbarkeit pro Ansicht. |
| Unterer Abstand mobil | Mindestabstand für alle mobilen Planer. Automatischer Navbar- und Safe-Area-Abstand bleibt auch bei einem kleineren Wert aktiv. |
| Mobile Zellbreite | Breite der Monatszellen im mobilen Jahresplaner. `0` nutzt den Standardwert. |

Diary speichert außerdem reine UI-Zustände in Plugin-Daten: Plan-Notiz-Vorschau, mobile Plan-Notiz-Vorschau und erweiterte Monatszellenbreiten im Jahresplaner.

## Frontmatter-Referenz

| Schlüssel | Beschreibung |
| --- | --- |
| `color` | Chip-Farbe. Jede gültige CSS-Farbe ist möglich, z. B. `#22c55e`, `red`, `rgb(34, 197, 94)`. |
| `todo` | Zeigt die Notiz als Todo-Chip, wenn `true`. |
| `completed` | Zeigt Erledigt-Status, wenn `todo: true`. |
| `start_time` | Optionale Chip-Startzeit im Format `HH:mm`. Chips mit Zeit werden nach Startzeit sortiert. |
| `end_time` | Optionale Chip-Endzeit im Format `HH:mm`. Dieser Wert löst keine Erinnerung aus. |
| `notify_minutes` | Minuten ab lokaler Mitternacht am Ereignistag. Erlaubt `0` bis `1439`. 9:00 Uhr ist `540`. |
| `date_start` | Startdatum für Zeitraum-Notizen. |
| `date_end` | Enddatum für Zeitraum-Notizen. |
| `title` | Fallback-Anzeigetitel, wenn der Titel nicht aus dem Dateinamen abgeleitet werden kann. |
| `recurrence_id` | Stabile Serien-ID für Wiederholungsquelle und erzeugte Vorkommen. |
| `recurrence_role` | `source` für die Definition, `occurrence` für erzeugte Notizen. |
| `recurrence_calendar` | Kalenderbasis: `gregorian` oder eine unterstützte alternative Kalender-ID. |
| `recurrence_rule` | Frequenz mit optionalem Intervall, z. B. `FREQ=WEEKLY;INTERVAL=2`. Ohne `INTERVAL` gilt 1. |
| `recurrence_anchor_date` | Gregorianisches Quelldatum als Serienstart. |
| `recurrence_until_date` | Optionales inklusives gregorianisches Enddatum. |
| `recurrence_anchor_year/month/day` | Ankerfelder der Kalenderbasis für alternative Kalender. |
| `recurrence_exdates` | Gregorianische Vorkommensdaten, die aus der Serie übersprungen werden. |
| `recurrence_source_path` | Pfad der Quellnotiz auf erzeugten Vorkommen. |
| `recurrence_occurrence_date` | Gregorianisches Datum, das ein erzeugtes Vorkommen darstellt. |
| `diary_external_calendar` | Feed-ID des externen Kalenders auf einer aus einem externen Ereignis erstellten Markdown-Notiz. |
| `diary_external_event_uid` | UID des externen Ereignisses. |
| `diary_external_event_instance` | Instanzschlüssel, meistens Startdatum bzw. Startzeit. |
| `diary_external_event_source` | Stabiler Linkschlüssel zur Unterdrückung doppelter Overlays. |
| `diary_external_event_linked_at` | ISO-Zeitpunkt, zu dem Diary die Markdown-Notiz erstellt hat. |

Erinnerungen sind keine Betriebssystem-Benachrichtigungen. Solange Obsidian geöffnet ist, prüft Diary etwa alle 15 Sekunden und zeigt während der passenden Minute am Ereignistag eine Obsidian Notice.

Wiederkehrende Vorkommen sind standardmäßig virtuell. Beim Erstellen einer Notiz verwendet Diary ein vorhandenes Vorkommen derselben `recurrence_id`; normale Notizen oder andere Serien werden nicht überschrieben.

## Dateinamenregeln

Diary scannt standardmäßig Markdown-Dateien im gesamten Vault und zeigt Notizen an, deren Dateinamen diesen Regeln entsprechen. In den Einstellungen kannst du den Scan auf **Planner folder** und Unterordner begrenzen. Neue Notizen landen standardmäßig im konfigurierten **Planner folder**.

Einzelnes Datum:

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

Zeitraum:

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

Plan-Notizen:

```text
2026.md
2026-05.md
```

Priorität für den Anzeigetitel:

1. Dateinamen-Suffix
2. Frontmatter `title`
3. Erste Markdown-Überschrift
4. Dateiname ohne Erweiterung

Wenn du Planernotiz-Titel erstellst oder bearbeitest, bleiben Leerzeichen im sichtbaren Titel als Dateinamen-Suffix erhalten. Diary ersetzt sie nicht mehr durch Bindestriche.

## Entwicklung

Dieses Repository nutzt npm. Die CI-Matrix prüft aktuell Node.js `20.x` und `22.x`; lokale Entwicklung funktioniert auch mit der aktuellen LTS-Version.

```bash
npm install
npm run dev
```

Produktionsbuild:

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

## Release

- Release-Workflow: `.github/workflows/release.yml`
- Release-Dateien: `main.js`, `manifest.json`, `styles.css`
- Nutze `npm version patch|minor|major --no-git-tag-version`, damit `package.json`, `package-lock.json`, `manifest.json` und `versions.json` synchron bleiben.
- Der GitHub-Release-Tag muss exakt der Version in `manifest.json` entsprechen und sollte kein führendes `v` haben.
- Das Repository veröffentlicht Release-Dateien einzeln; der Release-Workflow erzeugt Build-Provenance-Attestierungen für `main.js`, `manifest.json` und `styles.css`.

## Datenschutz und Netzwerk

- Planerfunktionen arbeiten mit lokalen Markdown-Dateien im Vault.
- Diary enthält keine versteckte Telemetrie oder Analytics.
- Feiertags- und Kalender-Overlay-Berechnung nutzt gebündelte Daten, Browserdaten oder lokal gespeicherte Profile und sendet keine Vault-Inhalte an externe Dienste.
- Externe Kalenderfeeds sind optional. Diary ruft nur die Feed-URL ab, die du hinzufügst, speichert Ereigniscaches in Plugin-Daten und erstellt Markdown-Dateien nur nach Auswahl von **Create Markdown note**.
- `obsidian-reminder-endpoint-spec.md` ist eine zukünftige Designnotiz. Das veröffentlichte Plugin sendet derzeit keine Erinnerungsdaten über das Netzwerk.

## Fehlerbehebung

- Wenn das Plugin fehlt, prüfe, ob `main.js`, `manifest.json` und `styles.css` direkt in `Vault/.obsidian/plugins/diary/` liegen.
- Wenn Befehle fehlen, stelle sicher, dass **Diary** unter **Settings -> Community plugins** aktiviert ist.
- Wenn der Seitenplaner fehlt, führe **Open monthly planner in sidebar** aus oder lade Obsidian nach Aktivierung neu.
- Wenn Chips nicht erscheinen, prüfe, ob Dateinamen `YYYY-MM-DD` oder `YYYY-MM-DD--YYYY-MM-DD` folgen.
- Wenn mehr Platz über der automatisch freigehaltenen mobilen Navigation gewünscht ist, erhöhe **Unterer Abstand mobil**.
- Wenn eine Erinnerung nicht erscheint, prüfe, ob Obsidian geöffnet ist, das Ereignis heute liegt und `notify_minutes` zwischen `0` und `1439` liegt.

## Lizenz

Siehe `LICENSE`.
