# Diary (Español)

Diary muestra tus notas Markdown como calendarios y líneas de tiempo dentro de Obsidian. Puedes pasar de la vista anual a la mensual, diaria o de 3 días sin trasladar las notas a una base de datos ni a un formato propio.

Documentación completa: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## De un vistazo

| Elemento | Valor |
| --- | --- |
| ID del plugin | `diary` |
| Versión actual | `1.15.1` |
| Versión mínima de Obsidian | `1.7.2` |
| Plataformas | Escritorio / móvil (`isDesktopOnly: false`) |
| Idioma predeterminado | `en` |
| Carpeta predeterminada del planificador | `Planner` |

## Novedades de 1.15.1

- `1.15.1`: Revisa y simplifica la documentación en todos los idiomas compatibles, con términos más claros y notas de versión más breves.

Los cambios anteriores están disponibles en [Releases](https://github.com/POBSIZ/obsidian-diary/releases).

## Capturas

Las capturas usan una carpeta temporal con notas de todo el día, con hora, de rango, de tarea y de planificación. Los ejemplos estrechos muestran las mismas vistas con menos espacio horizontal; la carpeta se eliminó después.

### Escritorio

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| Línea de tiempo diaria | Línea de tiempo de 3 días |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### Diseño estrecho

| Cuadrícula mensual | Lista mensual |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Funciones principales

- **Planificador anual**: Muestra notas de fecha y de rango en una tabla de `12 meses × 31 días`. El ancho elegido para cada mes se conserva al recargar.
- **Interfaz localizada**: Cambia Diary entre inglés, alemán, español, francés, japonés, chino simplificado, chino tradicional y coreano.
- **Cuadrícula mensual**: Revisa un mes en una cuadrícula grande con chips, barras de rango, festivos, etiquetas de calendario y calendarios externos.
- **Lista mensual**: Recorre un mes día a día y filtra la lista con `All`, `With notes` o `Upcoming`.
- **Planificador diario**: Organiza un día en una línea de tiempo de 24 horas. Los rangos de varios días se muestran como barras continuas de todo el día o intervalos de fecha y hora; sus límites temporales se pueden ajustar entre fechas.
- **Planificador de 3 días**: Compara tres días consecutivos en columnas paralelas. En pantallas estrechas conserva columnas legibles mediante desplazamiento horizontal.
- **Selector directo de vista**: Cambia directamente entre año, cuadrícula mensual, lista mensual, día y 3 días.
- **Planificador lateral derecho**: Mantén un planificador mensual compacto en la barra lateral derecha mientras las notas se abren en el área principal.
- **Panel de notas de plan**: Crea y previsualiza notas anuales (`YYYY.md`) y mensuales (`YYYY-MM.md`) encima del planificador. El estado expandido o contraído se guarda; en móvil se guarda por separado y empieza contraído.
- **Notas de fecha y rango**: Muestra notas como chips según nombres de archivo de fecha única o rango. Diary escanea todo el vault de forma predeterminada o solo la carpeta del planificador si lo configuras.
- **Eventos recurrentes**: Repite cada N días, semanas, meses o años con base gregoriana o de calendario alternativo. Las apariciones permanecen virtuales hasta seleccionarlas.
- **Color, tarea y estado completado**: `color`, `todo` y `completed` en frontmatter se reflejan en el estilo y la etiqueta del chip.
- **Festivos**: Muestra festivos públicos de las regiones cubiertas por los idiomas de la interfaz. Puedes seleccionar una insignia de festivo para ver su nombre.
- **Etiqueta de calendario alternativo**: Muestra opcionalmente una etiqueta compacta, como calendario lunar coreano, lunar chino, Dangi, hebreo, islámico, persa, nacional indio, budista, era japonesa, Minguo, copto o etíope. Las opciones están localizadas en todos los idiomas de la interfaz.
- **Calendario personalizado**: Crea perfiles locales para mundos de fantasía o campañas, con meses, días de la semana y reglas simples de año bisiesto. Diary muestra la fecha personalizada como etiqueta, pero conserva archivos `YYYY-MM-DD`.
- **Calendarios externos**: Añade feeds `.ics` por `webcal://` o `https://`, actualízalos manualmente o por intervalo y muéstralos como chips o rangos de solo lectura. Crea una nota Markdown solo cuando selecciones un evento externo.
- **Estilos acotados**: El CSS de Diary se limita a vistas del planificador, paneles de ajustes y modales del plugin.
- **Recordatorios locales**: Las notas con `notify_minutes` muestran un aviso de Obsidian en la fecha del evento mientras Obsidian está abierto.
- **Portapapeles del planificador**: En escritorio puedes copiar, pegar, eliminar y deshacer pegados de fechas o chips seleccionados.
- **Teclado y accesibilidad**: Celdas de fecha, chips, barras de rango, insignias de festivos, etiquetas y filas de lista mensual tienen activación por teclado y etiquetas accesibles.
- **Optimización móvil**: La cuadrícula mensual admite pellizcar para hacer zoom, restablecer zoom y abrir una hoja de resumen del día.

## Instalación

1. Descarga la última versión desde [Releases](https://github.com/POBSIZ/obsidian-diary/releases).
2. Copia `main.js`, `manifest.json` y `styles.css` en `Vault/.obsidian/plugins/diary/`.
3. En Obsidian, abre **Settings → Community plugins**.
4. Si Restricted mode está activo, desactívalo solo en vaults de confianza y activa **Diary**.
5. Abre un planificador desde los iconos laterales o la paleta de comandos. El icono mensual abre el planificador en la barra lateral derecha.

## Inicio rápido

1. Ejecuta **Open monthly planner in sidebar** para el planificador lateral o **Open monthly planner** para una pestaña completa.
2. Selecciona el botón de añadir archivo en el encabezado o una celda de fecha.
3. Elige **Single date** o **Rango**.
4. Introduce carpeta, fechas, nombre de archivo, color, estado de tarea, hora de recordatorio y repetición opcional.
5. Selecciona **Crear**. Diary crea una nota Markdown y la muestra como chip o barra de rango.

Las notas creadas son archivos Markdown normales y permanecen en el vault aunque desactives el plugin.

## Abrir y cambiar vistas

Iconos laterales:

- `calendar-range`: abre el planificador anual en el área principal
- `calendar-days`: abre o muestra el planificador mensual en la barra lateral derecha
- `list-ordered`: abre la lista mensual en el área principal

Paleta de comandos:

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

Selecciona el icono de repetición en cualquier encabezado del planificador para alternar la misma hoja en este orden.

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

Usa anterior/siguiente para moverte entre años o meses, y el icono de calendario para volver al año o mes actual. Selecciona la etiqueta de año o mes para escribir un valor concreto.

## Planificador lateral derecho

Diary crea un planificador mensual compacto en la barra lateral derecha cuando el workspace está listo. Usa **Open monthly planner in sidebar** o el icono mensual para mostrarlo de nuevo.

El planificador lateral está pensado como vista de apoyo:

- Usa el diseño mensual compacto y la hoja de resumen del día.
- Al seleccionar una nota desde la barra lateral, el archivo se abre en el área principal.
- El botón de cambio de vista alterna entre planificador anual, cuadrícula mensual y lista mensual.
- Diary mantiene una sola hoja lateral y limpia hojas antiguas de versiones anteriores.

## Filtros de la lista mensual

La lista mensual tiene tres filtros:

- **All**: muestra todos los días del mes seleccionado.
- **With notes**: muestra solo días con notas de fecha o rango.
- **Upcoming**: muestra hoy y fechas futuras dentro del mes seleccionado.

Cuando la lista abre el mes actual, Diary desplaza la vista hasta la fila de hoy. El botón de mes actual también vuelve a hoy.

## Feeds de calendarios externos

Usa **Settings → Diary → Calendarios externos** para añadir una URL `webcal://` publicada o una URL `.ics` por `https://`.

- Las URL de feed se guardan en datos locales del plugin y pueden sincronizarse con el vault. Trata las URL secretas de iCal como tokens de acceso.
- Diary rechaza URL de red local o privada.
- Puedes elegir nombre, color, inclusión de descripción, intervalo de actualización y superficies donde se muestra.
- Los feeds nuevos se actualizan cada 60 minutos de forma predeterminada y son visibles en anual, cuadrícula mensual, lista mensual y barra lateral.
- Los eventos externos son superposiciones de solo lectura con estilo separado. No admiten arrastrar, portapapeles, acciones de tarea ni edición de color.
- Al seleccionar un evento externo, se abre un modal con **Create Markdown note**, **Refresh calendar** y **Copy details**, con etiquetas localizadas y respuesta de pulsado, carga y finalización.
- Cuando creas una nota Markdown desde un evento externo, Diary guarda frontmatter de enlace y oculta el duplicado de ese evento.

## Crear notas

### Notas de una fecha

Selecciona una celda de fecha o el botón de añadir archivo y usa **Single date**.

- El nombre predeterminado es `YYYY-MM-DD.md`.
- Añade un sufijo para usarlo como título del chip. Ejemplo: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- Define un color para mostrar borde de chip o punto móvil.
- Activa **Todo file** para mostrar estado de tarea.
- Define **Reminder time** para guardar `notify_minutes`.
- Activa **Repeat**, elige frecuencia diaria, semanal, mensual o anual y un intervalo de 1 a 999. Esto permite repetir cada N días, semanas, meses o años, con base de calendario y fecha final opcionales.

### Notas de rango

En escritorio, arrastra sobre celdas de fecha para rellenar un modal de **Rango**. En móvil, selecciona añadir archivo, elige **Rango** e introduce inicio y fin manualmente.

- Formato de nombre: `YYYY-MM-DD--YYYY-MM-DD.md`
- Añade un sufijo para usarlo como título del rango. Ejemplo: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- `date_start` y `date_end` se guardan automáticamente al crear la nota.
- El planificador anual muestra barras verticales y un chip en la fecha inicial. La cuadrícula y la lista mensual muestran barras de rango.
- Selecciona **Todo el día** para dejar ambas horas vacías, o introduce las dos para definir un intervalo continuo desde `date_start` + `start_time` hasta `date_end` + `end_time`.
- Los planificadores diario y de 3 días muestran los rangos de todo el día como barras continuas. Arrastra uno a la línea de tiempo para asignar horas y ajusta después el primer o último límite junto con su fecha y hora.

### Notas de plan

Usa el panel de notas de plan encima de cada planificador para crear planes anuales o mensuales.

- Plan anual: `{plannerFolder}/{year}.md`
- Plan mensual: `{plannerFolder}/{year}-{month}.md`
- El panel puede contraerse o expandirse, y el estado se guarda en datos del plugin.
- Escritorio y móvil mantienen estados separados: escritorio empieza expandido, móvil contraído.
- Si la nota ya existe, Diary muestra una vista previa y un botón para abrirla.

## Editar notas

Selecciona un chip o una barra de rango para abrir el modal de opciones de archivo.

- Cambiar entre **Single date** y **Range**
- Elegir una carpeta existente o escribir una ruta personalizada
- Editar el nombre completo, incluidas las fechas y el sufijo usado como título
- Cambiar las fechas de inicio y fin; el nombre se mantiene sincronizado
- Cambiar el color del chip
- Cambiar estado de tarea o completado
- Cambiar hora de recordatorio
- Previsualizar el archivo
- Abrir el archivo
- Eliminar el archivo

Al aplicar los cambios, Diary mueve o renombra el archivo Markdown. Al convertirlo en rango se escriben `date_start` y `date_end`; al volver a una sola fecha se eliminan esos campos. Si ya existe un archivo con el mismo nombre en el destino, la operación se bloquea.

En escritorio, arrastra un chip o una barra a otra fecha para moverla. Las notas de rango se mueven por fecha inicial y conservan su duración. Si la ruta de destino ya existe, Diary no mueve el archivo.

## Teclado y accesibilidad

- Pulsa `Enter` o `Space` en una celda de fecha, chip, barra de rango, insignia de festivo, fila mensual, etiqueta de año o etiqueta de mes con foco.
- Los controles del planificador usan roles de botón, estados y textos `aria-label`.
- Los botones de color en modales de crear/editar exponen `aria-label` y `title` localizados.
- Los filtros de lista mensual exponen estado seleccionado con `aria-selected`.
- Los mensajes de validación se anuncian con live regions polite.

## Portapapeles del planificador (escritorio)

En una vista del planificador, mantén `Cmd` en macOS o `Ctrl` en Windows/Linux mientras seleccionas fechas o chips.

Diary guarda las notas copiadas en un portapapeles interno en memoria para la sesión actual de Obsidian. No lee ni escribe en el portapapeles del sistema.

- `Cmd/Ctrl + click`: reemplaza la selección actual.
- `Cmd/Ctrl + Shift + click`: añade o quita de la selección.
- `Cmd/Ctrl + C`: copia notas seleccionadas al portapapeles interno.
- `Cmd/Ctrl + V`: pega en fechas destino seleccionadas.
- `Cmd/Ctrl + Delete` o `Cmd/Ctrl + Backspace`: mueve las notas seleccionadas a la papelera.
- `Cmd/Ctrl + Z`: deshace el último pegado moviendo los archivos pegados a la papelera.

Reglas de pegado:

- Puedes pegar una nota copiada en varias fechas.
- Puedes pegar varias notas copiadas en una fecha.
- Diary bloquea muchas notas a muchas fechas para evitar conflictos ambiguos.
- Si el archivo ya existe, Diary crea una ruta única como `-copy` o `-copy2`.

## Uso móvil

- Toca un día en la cuadrícula mensual para abrir la hoja inferior de resumen.
- Usa la hoja para revisar notas del día, rangos y festivos.
- Selecciona **Create note** para crear una nota nueva en esa fecha.
- Usa gesto de pellizco para hacer zoom.
- Usa el botón de restablecer zoom para volver al tamaño de la cuadrícula.
- Diary mantiene automáticamente el contenido y los menús sobre la navegación inferior normal o flotante de Obsidian. Usa **Espacio inferior en móvil** como separación mínima adicional y **Ancho de celda en móvil** para las celdas anuales.

## Ajustes

| Ajuste | Descripción |
| --- | --- |
| Idioma | Idioma de la interfaz. Predeterminado: `en`. Admite `en`, `de`, `es`, `fr`, `ja`, `zh-CN`, `zh-TW` y `ko`. |
| Planner folder | Carpeta predeterminada para nuevas notas del planificador y notas de plan. También se usa cuando el escaneo se limita a la carpeta del planificador. Predeterminado: `Planner`. |
| Planner note scan scope | Decide si Diary busca notas en todo el vault o solo en **Planner folder** y subcarpetas. Predeterminado: `Entire vault`. |
| Date format | Ajuste de formato guardado. Los nombres de archivo del planificador usan `YYYY-MM-DD`. |
| Show holidays | Activa o desactiva festivos. |
| País de festivos | País para festivos. Admite `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW` y `None`. |
| Calendario mostrado | Selecciona un calendario alternativo integrado o un perfil personalizado para anual, cuadrícula mensual, lista mensual, resumen del día y planificador lateral. Predeterminado: `None`. |
| Calendarios personalizados | Perfiles locales de fantasía o campaña con longitudes de mes, días de la semana, época, formato de etiqueta y regla simple de año bisiesto. |
| Calendarios externos | Feeds `.ics` opcionales por `webcal://` o `https://` como superposiciones de solo lectura. Cada feed tiene estado, color, intervalo, descripciones y visibilidad por vista. |
| Espacio inferior en móvil | Espacio inferior mínimo para todos los planificadores móviles. La separación automática de navbar y safe area sigue activa con valores menores. |
| Ancho de celda en móvil | Ancho de celdas de mes en el planificador anual móvil. `0` usa el valor predeterminado. |
| Comentarios y soporte | Abre formularios públicos de GitHub para comentarios, errores y sugerencias de funciones. |

Diary también guarda estado solo de interfaz: expansión del panel de plan, expansión móvil del panel y anchos de meses expandidos en el planificador anual.

## Referencia de frontmatter

| Clave | Descripción |
| --- | --- |
| `color` | Color del chip. Puede ser cualquier color CSS válido, como `#22c55e`, `red` o `rgb(34, 197, 94)`. |
| `todo` | Muestra la nota como chip de tarea cuando es `true`. |
| `completed` | Muestra estado completado cuando `todo: true`. |
| `start_time` | Hora de inicio opcional en formato `HH:mm`. En una nota de rango, es el límite de `date_start`; deben indicarse ambas horas o ninguna. |
| `end_time` | Hora de fin opcional en formato `HH:mm`. En una nota de rango, es el límite de `date_end`; no activa un recordatorio. |
| `notify_minutes` | Minutos desde la medianoche local del día del evento. Acepta `0` a `1439`; 9:00 AM es `540`. |
| `date_start` | Fecha inicial guardada automáticamente para notas de rango. |
| `date_end` | Fecha final guardada automáticamente para notas de rango. |
| `title` | Título visible de respaldo cuando no puede derivarse del nombre del archivo. |
| `recurrence_id` | ID estable compartido por la fuente y las ocurrencias. |
| `recurrence_role` | `source` para la definición, `occurrence` para notas generadas. |
| `recurrence_calendar` | Base de calendario: `gregorian` o un ID de calendario alternativo compatible. |
| `recurrence_rule` | Frecuencia con intervalo opcional, por ejemplo `FREQ=WEEKLY;INTERVAL=2`. Sin `INTERVAL` se usa 1. |
| `recurrence_anchor_date` | Fecha gregoriana fuente usada como inicio de serie. |
| `recurrence_until_date` | Fecha gregoriana final inclusiva opcional. |
| `recurrence_anchor_year/month/day` | Campos de anclaje usados para coincidencias con calendarios alternativos. |
| `recurrence_exdates` | Fechas gregorianas omitidas de la serie. |
| `recurrence_source_path` | Ruta de la nota fuente guardada en ocurrencias. |
| `recurrence_occurrence_date` | Fecha gregoriana representada por una ocurrencia. |
| `diary_external_calendar` | ID del feed externo guardado en una nota creada desde un evento externo. |
| `diary_external_event_uid` | UID del evento externo. |
| `diary_external_event_instance` | Clave de instancia, normalmente fecha/hora de inicio. |
| `diary_external_event_source` | Clave estable para ocultar superposiciones duplicadas. |
| `diary_external_event_linked_at` | Marca ISO del momento en que Diary creó la nota. |

Los recordatorios no son notificaciones del sistema operativo. Mientras Obsidian está abierto, Diary comprueba aproximadamente cada 15 segundos y muestra una Notice durante el minuto correspondiente en la fecha del evento.

Las apariciones son virtuales por defecto. Al crear una nota, Diary reutiliza una aparición existente del mismo `recurrence_id`; no sobrescribe notas normales ni otras series.

## Reglas de nombres de archivo

Diary escanea Markdown en todo el vault por defecto y muestra notas cuyos nombres cumplen estas reglas. En ajustes puedes limitar el escaneo a **Planner folder** y subcarpetas. Las notas nuevas se crean por defecto en **Planner folder**.

Fecha única:

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

Rango:

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

Notas de plan:

```text
2026.md
2026-05.md
```

Prioridad del título visible:

1. Sufijo del nombre de archivo
2. Frontmatter `title`
3. Primer encabezado Markdown
4. Nombre base del archivo

Cuando creas o editas títulos de notas del planificador, los espacios visibles se conservan en el sufijo del nombre de archivo. Diary ya no los convierte en guiones.

## Desarrollo

Este repositorio usa npm. La matriz de CI valida Node.js `20.x` y `22.x`; el desarrollo local también funciona con la versión LTS actual.

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Validación del documento de diseño:

```bash
npm run design:lint
```

Test:

```bash
npm test
```

## Release

- Workflow de release: `.github/workflows/release.yml`
- Archivos de release: `main.js`, `manifest.json`, `styles.css`
- Usa `npm version patch|minor|major --no-git-tag-version` para mantener sincronizados `package.json`, `package-lock.json`, `manifest.json` y `versions.json`.
- La etiqueta de GitHub Release debe coincidir exactamente con la versión de `manifest.json` y no debe llevar `v` inicial.
- El repositorio compila `main.js`, `manifest.json` y `styles.css` desde el código etiquetado en GitHub Actions y los publica como archivos individuales de la versión.

## Comentarios y soporte

- [Enviar comentarios](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feedback.yml)
- [Informar de un error](https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml)
- [Sugerir una función](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml)

Estos enlaces abren issues públicos de GitHub y requieren una cuenta de GitHub. No incluyas contenido privado del vault, URL de calendarios, tokens de acceso ni otra información confidencial.

## Privacidad y red

- Las funciones del planificador trabajan con archivos Markdown locales dentro del vault.
- Diary no tiene telemetría ni analíticas ocultas.
- Los cálculos de festivos y calendarios usan datos empaquetados, datos del navegador o perfiles locales, y no envían contenido del vault a servicios externos.
- Los feeds externos son opcionales. Diary solo solicita la URL que añades, guarda caché de eventos en datos del plugin y no crea Markdown salvo que selecciones **Create Markdown note**.
- Los recordatorios locales se procesan dentro de Obsidian y no envían datos por la red.

## Solución de problemas

- Si falta el plugin, comprueba que `main.js`, `manifest.json` y `styles.css` estén directamente en `Vault/.obsidian/plugins/diary/`.
- Si faltan comandos, confirma que **Diary** esté activo en **Settings → Community plugins**.
- Si falta el planificador lateral, ejecuta **Open monthly planner in sidebar** o recarga Obsidian tras activar el plugin.
- Si no aparecen chips, comprueba que los nombres sigan `YYYY-MM-DD` o `YYYY-MM-DD--YYYY-MM-DD`.
- Si deseas más espacio sobre la navegación móvil reservada automáticamente, aumenta **Espacio inferior en móvil**.
- Si no aparece un recordatorio, confirma que Obsidian esté abierto, que la fecha sea hoy y que `notify_minutes` esté entre `0` y `1439`.

## Licencia

Consulta `LICENSE`.
