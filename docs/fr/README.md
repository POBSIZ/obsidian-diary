# Diary (Français)

Diary affiche vos notes Markdown sous forme de calendriers et de chronologies dans Obsidian. Passez de l’année au mois, à la journée ou aux 3 jours sans déplacer vos notes vers une base de données ni un format propriétaire.

Documentation complète : [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## En bref

| Élément | Valeur |
| --- | --- |
| ID du plugin | `diary` |
| Version actuelle | `1.15.1` |
| Version minimale d’Obsidian | `1.7.2` |
| Plateformes | Bureau / mobile (`isDesktopOnly: false`) |
| Langue par défaut | `en` |
| Dossier de planning par défaut | `Planner` |

## Nouveautés de la version 1.15.1

- `1.15.1` : révise et allège la documentation dans toutes les langues prises en charge, avec des termes plus clairs et des notes de version plus courtes.

Les changements antérieurs sont disponibles sur la page [Releases](https://github.com/POBSIZ/obsidian-diary/releases).

## Captures d’écran

Les captures utilisent un dossier temporaire contenant des notes de journée, des horaires, des périodes, des tâches et des plans. Les exemples étroits montrent les mêmes vues avec moins d’espace horizontal ; le dossier a ensuite été supprimé.

### Bureau

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| Chronologie quotidienne | Chronologie sur 3 jours |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### Mise en page étroite

| Grille mensuelle | Liste mensuelle |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Fonctionnalités principales

- **Planning annuel** : affiche les notes datées et les périodes dans une table `12 mois × 31 jours`. La largeur choisie pour chaque mois est conservée après rechargement.
- **Interface localisée** : basculez Diary entre anglais, allemand, espagnol, français, japonais, chinois simplifié, chinois traditionnel et coréen.
- **Grille mensuelle** : consultez un mois dans une grande grille avec pastilles, barres de période, jours fériés, étiquettes de calendrier et calendriers externes.
- **Liste mensuelle** : parcourez le mois jour par jour, puis filtrez-le avec `All`, `With notes` ou `Upcoming`.
- **Planning quotidien** : planifiez une journée sur une chronologie de 24 heures. Les plages de plusieurs jours s’affichent comme des barres continues sur la journée entière ou des intervalles date-heure, dont les limites peuvent être ajustées entre les dates.
- **Planning sur 3 jours** : comparez trois jours consécutifs en colonnes parallèles. Les petits écrans conservent des colonnes lisibles grâce au défilement horizontal.
- **Sélecteur direct de vue** : passez directement entre année, grille mensuelle, liste mensuelle, jour et 3 jours.
- **Planificateur latéral droit** : gardez un planning mensuel compact dans la barre latérale droite pendant que les notes s’ouvrent dans l’espace principal.
- **Panneau de notes de plan** : crée et prévisualise les notes annuelles (`YYYY.md`) et mensuelles (`YYYY-MM.md`) au-dessus du planning. L’état ouvert ou fermé est enregistré, avec un état mobile séparé qui commence fermé.
- **Notes datées et notes de période** : les fichiers correspondant aux noms de date ou de période apparaissent sous forme de pastilles. Diary scanne tout le coffre par défaut, ou seulement le dossier de planning si vous le configurez.
- **Événements récurrents** : répétez tous les N jours, semaines, mois ou années sur base grégorienne ou calendrier alternatif. Les occurrences restent virtuelles jusqu’à leur conversion.
- **Couleur, tâche et état terminé** : `color`, `todo` et `completed` dans le frontmatter influencent le style et le libellé de la pastille.
- **Jours fériés** : affiche les jours fériés des régions couvertes par les langues de l’interface. Sélectionnez un badge pour voir son nom.
- **Étiquette de calendrier alternatif** : affichez une étiquette compacte, par exemple calendrier lunaire coréen, lunaire chinois, Dangi, hébraïque, islamique, persan, national indien, bouddhique, ères japonaises, Minguo, copte ou éthiopien. Les options sont localisées dans toutes les langues prises en charge.
- **Calendrier personnalisé** : créez des profils locaux pour univers de fiction ou campagnes, avec mois, jours de semaine et règles simples de bissextile. Diary affiche la date personnalisée comme étiquette tout en conservant les fichiers `YYYY-MM-DD`.
- **Calendriers externes** : ajoutez des flux `.ics` en `webcal://` ou `https://`, actualisez-les manuellement ou à intervalle, et affichez les événements comme pastilles ou barres en lecture seule. Créez une note Markdown seulement lorsque vous choisissez un événement externe.
- **Styles limités** : le CSS de Diary se limite aux vues de planning, panneaux de réglages et modales du plugin.
- **Rappels locaux** : les notes avec `notify_minutes` affichent une Notice Obsidian le jour concerné tant qu’Obsidian est ouvert.
- **Presse-papiers de planning** : sur ordinateur, copiez, collez, supprimez et annulez le collage de dates ou de pastilles sélectionnées.
- **Clavier et accessibilité** : cellules de date, pastilles, barres de période, badges fériés, étiquettes et lignes de liste mensuelle sont activables au clavier et exposent des libellés accessibles.
- **Optimisation mobile** : la grille mensuelle prend en charge le zoom par pincement, la réinitialisation du zoom et le résumé du jour.

## Installation

1. Téléchargez la dernière release depuis [Releases](https://github.com/POBSIZ/obsidian-diary/releases).
2. Copiez `main.js`, `manifest.json` et `styles.css` dans `Vault/.obsidian/plugins/diary/`.
3. Dans Obsidian, ouvrez **Settings → Community plugins**.
4. Si Restricted mode est activé, désactivez-le seulement dans les coffres de confiance, puis activez **Diary**.
5. Ouvrez un planning depuis les icônes du ruban ou la palette de commandes. L’icône mensuelle ouvre le planificateur de droite.

## Démarrage rapide

1. Lancez **Open monthly planner in sidebar** pour le planificateur latéral, ou **Open monthly planner** pour un onglet complet.
2. Sélectionnez le bouton d’ajout de fichier dans l’en-tête ou une cellule de date.
3. Choisissez **Single date** ou **Période**.
4. Saisissez le dossier, les dates, le nom de fichier, la couleur, l’état de tâche, l’heure de rappel et l’éventuelle répétition.
5. Sélectionnez **Créer**. Diary crée une note Markdown et l’affiche comme pastille ou barre de période.

Les notes créées sont de simples fichiers Markdown. Elles restent dans votre coffre même si le plugin est désactivé.

## Ouvrir et changer de vue

Icônes du ruban :

- `calendar-range` : ouvrir le planificateur annuel dans l’espace principal
- `calendar-days` : ouvrir ou révéler le planificateur mensuel dans la barre latérale droite
- `list-ordered` : ouvrir la liste mensuelle dans l’espace principal

Palette de commandes :

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

Sélectionnez l’icône de répétition dans l’en-tête d’un planificateur pour faire tourner la même feuille dans cet ordre.

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

Utilisez précédent/suivant pour changer d’année ou de mois, et l’icône de calendrier pour revenir à l’année ou au mois actuel. Sélectionnez le libellé d’année ou de mois pour saisir une valeur précise.

## Planificateur latéral droit

Diary crée un planificateur mensuel compact dans la barre latérale droite lorsque l’espace de travail est prêt. Utilisez **Open monthly planner in sidebar** ou l’icône mensuelle pour le faire réapparaître.

Cette vue sert d’accompagnement :

- Elle utilise le mise en page mensuel compact et le résumé du jour.
- Lorsqu’une note est choisie depuis la barre latérale, elle s’ouvre dans l’espace principal.
- Le bouton de changement de vue alterne entre annuel, grille mensuelle et liste mensuelle.
- Diary garde une seule feuille latérale et nettoie les anciennes feuilles de versions précédentes.

## Filtres de liste mensuelle

La liste mensuelle propose trois filtres :

- **All** : affiche tous les jours du mois sélectionné.
- **With notes** : affiche seulement les jours contenant des notes datées ou de période.
- **Upcoming** : affiche aujourd’hui et les jours futurs du mois sélectionné.

Quand la liste s’ouvre sur le mois actuel, Diary fait défiler jusqu’à la ligne du jour. Le bouton du mois actuel revient aussi à aujourd’hui.

## Flux de calendriers externes

Utilisez **Settings → Diary → Calendriers externes** pour ajouter une URL `webcal://` publiée ou une URL `.ics` en `https://`.

- Les URL de flux sont stockées dans les données locales du plugin et peuvent se synchroniser avec votre coffre. Traitez les URL iCal secrètes comme des jetons d’accès.
- Diary refuse les URL de réseau local ou privé.
- Vous pouvez choisir le nom du flux, la couleur, l’inclusion des descriptions, l’intervalle de mise à jour et les vues où il s’affiche.
- Les nouveaux flux se mettent à jour toutes les 60 minutes par défaut et sont visibles en annuel, grille mensuelle, liste mensuelle et barre latérale.
- Les événements externes sont des superpositions en lecture seule avec style séparé. Ils ne prennent pas en charge le glisser, le presse-papiers, les actions de tâche ou l’édition de couleur.
- Sélectionner un événement externe ouvre une modale avec **Create Markdown note**, **Refresh calendar** et **Copy details**, avec libellés localisés et retours d’état.
- Quand une note Markdown est créée depuis un événement externe, Diary enregistre le frontmatter de liaison et masque le doublon de cet événement.

## Créer des notes

### Notes d’un jour

Sélectionnez une cellule de date ou le bouton d’ajout de fichier, puis utilisez **Single date**.

- Le nom par défaut est `YYYY-MM-DD.md`.
- Ajoutez un suffixe pour l’utiliser comme titre de pastille. Exemple : `2026-05-19-mobile-qa.md` -> `mobile-qa`
- Une couleur affiche une bordure de pastille ou un point mobile.
- Activez **Todo file** pour afficher l’état de tâche.
- Définissez **Reminder time** pour enregistrer `notify_minutes`.
- Activez **Repeat**, choisissez une fréquence quotidienne, hebdomadaire, mensuelle ou annuelle et un intervalle de 1 à 999. Vous pouvez ainsi répéter tous les N jours, semaines, mois ou années.

### Notes de période

Sur ordinateur, faites glisser sur les cellules de date pour préremplir une modale **Période**. Sur mobile, sélectionnez le bouton d’ajout de fichier, choisissez **Période**, puis saisissez début et fin.

- Format : `YYYY-MM-DD--YYYY-MM-DD.md`
- Ajoutez un suffixe pour le titre. Exemple : `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- `date_start` et `date_end` sont enregistrés automatiquement à la création.
- Le planificateur annuel affiche les périodes avec des barres verticales et une pastille au début. La grille et la liste mensuelles affichent des barres de période.
- Sélectionnez **Toute la journée** pour laisser les deux heures vides, ou renseignez-les toutes les deux pour définir un intervalle continu de `date_start` + `start_time` à `date_end` + `end_time`.
- Les plannings quotidien et sur 3 jours affichent les plages sur toute la journée comme des barres continues. Faites-en glisser une sur la chronologie pour lui attribuer des heures, puis ajustez sa première ou sa dernière limite avec la date et l’heure correspondantes.

### Notes de plan

Utilisez le panneau de plan au-dessus de chaque planificateur pour créer des plans annuels ou mensuels.

- Plan annuel : `{plannerFolder}/{year}.md`
- Plan mensuel : `{plannerFolder}/{year}-{month}.md`
- Le panneau peut être replié ou déplié, et cet état est conservé.
- Bureau et mobile ont des états séparés : bureau déplié par défaut, mobile replié.
- Si la note existe déjà, Diary affiche un aperçu et un bouton d’ouverture.

## Modifier des notes

Sélectionnez une pastille ou une barre de période pour ouvrir la fenêtre d’options du fichier.

- Passer de **Single date** à **Range**, ou inversement
- Choisir un dossier existant ou saisir un chemin personnalisé
- Modifier le nom complet, avec la date ou la période et le suffixe utilisé comme titre
- Modifier les dates de début et de fin ; le nom reste synchronisé
- Modifier la couleur de la pastille
- Modifier l’état tâche / terminé
- Modifier l’heure de rappel
- Prévisualiser le fichier
- Ouvrir le fichier
- Supprimer le fichier

L’application des changements déplace ou renomme le fichier Markdown. La conversion en période écrit `date_start` et `date_end` ; le retour à une date unique supprime ces champs. Si un fichier du même nom existe déjà dans le dossier cible, Diary bloque l’opération.

Sur ordinateur, faites glisser une pastille ou une barre vers une autre date pour la déplacer. Les notes de période se déplacent par date de début et gardent la même durée. Si le chemin cible existe déjà, Diary ne déplace pas le fichier.

## Clavier et accessibilité

- Appuyez sur `Enter` ou `Space` sur une cellule de date, une pastille, une barre de période, un badge férié, une ligne de liste mensuelle, une étiquette d’année ou de mois avec le focus.
- Les contrôles de planning utilisent rôles de bouton, libellés d’état et textes `aria-label`.
- Les boutons de couleur dans les modales exposent `aria-label` et `title` localisés.
- Les filtres de liste mensuelle exposent l’état sélectionné avec `aria-selected`.
- Les messages de validation sont annoncés avec des live regions polies.

## Presse-papiers du planning (bureau)

Dans une vue de planning, maintenez `Cmd` sur macOS ou `Ctrl` sur Windows/Linux pendant la sélection de dates ou pastilles.

Diary conserve les notes copiées dans un presse-papiers interne en mémoire pour la session Obsidian en cours. Il ne lit ni n’écrit dans le presse-papiers système.

- `Cmd/Ctrl + click` : remplacer la sélection
- `Cmd/Ctrl + Shift + click` : ajouter ou retirer de la sélection
- `Cmd/Ctrl + C` : copier les notes sélectionnées dans le presse-papiers interne
- `Cmd/Ctrl + V` : coller sur les dates cibles
- `Cmd/Ctrl + Delete` ou `Cmd/Ctrl + Backspace` : déplacer les notes sélectionnées dans la corbeille
- `Cmd/Ctrl + Z` : annuler le dernier collage en déplaçant les fichiers collés vers la corbeille

Règles de collage :

- Une note copiée peut être collée sur plusieurs dates.
- Plusieurs notes copiées peuvent être collées sur une seule date.
- Diary bloque le collage plusieurs-notes-vers-plusieurs-dates pour éviter les conflits ambigus.
- Si un fichier existe déjà, Diary crée un chemin unique comme `-copy` ou `-copy2`.

## Utilisation mobile

- Touchez un jour dans la grille mensuelle pour ouvrir le résumé du jour en bas.
- Utilisez ce résumé pour consulter notes du jour, périodes et jours fériés.
- Sélectionnez **Create note** pour créer une note à cette date.
- Utilisez le pincement pour zoomer dans la grille.
- Utilisez le bouton de réinitialisation du zoom pour revenir à la taille initiale.
- Diary maintient automatiquement le contenu et les menus au-dessus de la navigation inférieure normale ou flottante d’Obsidian. Utilisez **Marge inférieure mobile** comme marge minimale supplémentaire et **Largeur des cellules mobile** pour les cellules annuelles.

## Réglages

| Réglage | Description |
| --- | --- |
| Langue | Langue de l’interface du plugin. Par défaut : `en`. Prend en charge `en`, `de`, `es`, `fr`, `ja`, `zh-CN`, `zh-TW` et `ko`. |
| Planner folder | Dossier par défaut des nouvelles notes de planning et de plan. Sert aussi lorsque le scan est limité au dossier de planning. Par défaut : `Planner`. |
| Planner note scan scope | Détermine si Diary cherche dans tout le coffre ou seulement dans **Planner folder** et ses sous-dossiers. Par défaut : `Entire vault`. |
| Date format | Réglage de format enregistré. Les noms de fichiers de planning utilisent actuellement `YYYY-MM-DD`. |
| Show holidays | Active ou désactive l’affichage des jours fériés. |
| Pays des jours fériés | Pays utilisé pour les jours fériés. Prend en charge `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW` et `None`. |
| Calendrier affiché | Sélectionne un calendrier alternatif intégré ou un profil personnalisé pour les vues annuelle, grille mensuelle, liste mensuelle, résumé du jour et barre latérale. Par défaut : `None`. |
| Calendriers personnalisés | Profils locaux de fiction ou campagne avec longueurs de mois, jours de semaine, époque, format d’étiquette et règle de bissextile simple. |
| Calendriers externes | Flux `.ics` optionnels en `webcal://` ou `https://` affichés en lecture seule. Chaque flux a état, couleur, intervalle, descriptions et visibilité par vue. |
| Marge inférieure mobile | Marge minimale pour tous les planificateurs mobiles. Le dégagement automatique de la navbar et de la safe area reste actif avec une valeur plus petite. |
| Largeur des cellules mobile | Largeur des cellules de mois dans le planificateur annuel mobile. `0` utilise la valeur par défaut. |
| Retours et assistance | Ouvre des formulaires GitHub publics pour les retours, bugs et suggestions de fonctionnalités. |

Diary enregistre aussi des états uniquement UI : expansion du panneau de plan, expansion mobile et largeurs des mois étendus dans le planificateur annuel.

## Référence frontmatter

| Clé | Description |
| --- | --- |
| `color` | Couleur de la pastille. Toute couleur CSS valide est acceptée, par exemple `#22c55e`, `red`, `rgb(34, 197, 94)`. |
| `todo` | Affiche la note comme tâche lorsque `true`. |
| `completed` | Affiche l’état terminé si `todo: true`. |
| `start_time` | Heure de début facultative au format `HH:mm`. Pour une note de plage, c’est la limite à `date_start` ; les deux heures doivent être renseignées ou vides. |
| `end_time` | Heure de fin facultative au format `HH:mm`. Pour une note de plage, c’est la limite à `date_end` ; elle ne déclenche pas de rappel. |
| `notify_minutes` | Minutes depuis minuit local le jour de l’événement. Accepte `0` à `1439`; 9 h vaut `540`. |
| `date_start` | Date de début enregistrée pour les notes de période. |
| `date_end` | Date de fin enregistrée pour les notes de période. |
| `title` | Titre de secours lorsque le titre ne peut pas venir du nom de fichier. |
| `recurrence_id` | ID stable partagé par la source et les occurrences. |
| `recurrence_role` | `source` pour la définition, `occurrence` pour les notes générées. |
| `recurrence_calendar` | Base de calendrier : `gregorian` ou ID de calendrier alternatif pris en charge. |
| `recurrence_rule` | Fréquence avec intervalle facultatif, par exemple `FREQ=WEEKLY;INTERVAL=2`. Sans `INTERVAL`, la valeur est 1. |
| `recurrence_anchor_date` | Date source grégorienne utilisée comme début de série. |
| `recurrence_until_date` | Date de fin grégorienne inclusive facultative. |
| `recurrence_anchor_year/month/day` | Champs d’ancrage utilisés pour les calendriers alternatifs. |
| `recurrence_exdates` | Dates grégoriennes ignorées dans la série. |
| `recurrence_source_path` | Chemin de la note source sur les occurrences générées. |
| `recurrence_occurrence_date` | Date grégorienne représentée par une occurrence générée. |
| `diary_external_calendar` | ID du flux externe sur une note créée depuis un événement externe. |
| `diary_external_event_uid` | UID de l’événement externe. |
| `diary_external_event_instance` | Clé d’instance, souvent date/heure de début. |
| `diary_external_event_source` | Clé stable pour masquer les doublons de superposition. |
| `diary_external_event_linked_at` | Horodatage ISO de création de la note Markdown. |

Les rappels ne sont pas des notifications système. Tant qu’Obsidian est ouvert, Diary vérifie environ toutes les 15 secondes et affiche une Notice pendant la minute correspondante le jour de l’événement.

Les occurrences sont virtuelles par défaut. Lors de la création d’une note, Diary réutilise une occurrence existante du même `recurrence_id` et n’écrase pas les notes ordinaires ni les autres séries.

## Règles de nom de fichier

Diary scanne par défaut les fichiers Markdown du coffre entier et affiche ceux dont le nom suit ces règles. Dans les réglages, vous pouvez limiter le scan à **Planner folder** et ses sous-dossiers. Les nouvelles notes sont créées par défaut dans **Planner folder**.

Date unique :

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

Période :

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

Notes de plan :

```text
2026.md
2026-05.md
```

Priorité du titre affiché :

1. Suffixe du nom de fichier
2. Frontmatter `title`
3. Premier titre Markdown
4. Nom de fichier sans extension

Lorsque vous créez ou modifiez des titres de notes de planning, les espaces visibles sont conservés dans le suffixe du nom. Diary ne les remplace plus par des tirets.

## Développement

Ce dépôt utilise npm. La matrice CI valide actuellement Node.js `20.x` et `22.x`; le développement local fonctionne aussi avec la version LTS actuelle.

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
```

Lint :

```bash
npm run lint
```

Validation du document de design :

```bash
npm run design:lint
```

Test :

```bash
npm test
```

## Release

- Workflow de release : `.github/workflows/release.yml`
- Fichiers publiés : `main.js`, `manifest.json`, `styles.css`
- Utilisez `npm version patch|minor|major --no-git-tag-version` pour garder `package.json`, `package-lock.json`, `manifest.json` et `versions.json` synchronisés.
- Le tag GitHub Release doit correspondre exactement à la version de `manifest.json` et ne doit pas commencer par `v`.
- Le dépôt compile `main.js`, `manifest.json` et `styles.css` depuis la source taguée dans GitHub Actions, puis les publie comme assets individuels.

## Retours et assistance

- [Donner votre avis](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feedback.yml)
- [Signaler un bug](https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml)
- [Suggérer une fonctionnalité](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml)

Ces liens ouvrent des issues GitHub publiques et nécessitent un compte GitHub. N’incluez aucun contenu privé du coffre, URL de calendrier, jeton d’accès ou autre information sensible.

## Confidentialité et réseau

- Les fonctions de planning travaillent sur des fichiers Markdown locaux dans le coffre.
- Diary n’a aucune télémétrie ni analyse cachée.
- Les calculs de jours fériés et de superpositions utilisent des données intégrées, des données du navigateur ou des profils locaux, sans envoyer le contenu du coffre à des services externes.
- Les flux externes sont optionnels. Diary récupère seulement l’URL ajoutée, stocke le cache d’événements dans les données du plugin et ne crée de Markdown qu’après sélection de **Create Markdown note**.
- Les rappels locaux sont traités dans Obsidian et n’envoient aucune donnée sur le réseau.

## Dépannage

- Si le plugin n’apparaît pas, vérifiez que `main.js`, `manifest.json` et `styles.css` sont directement dans `Vault/.obsidian/plugins/diary/`.
- Si les commandes manquent, confirmez que **Diary** est activé dans **Settings → Community plugins**.
- Si le planificateur latéral manque, exécutez **Open monthly planner in sidebar** ou rechargez Obsidian après activation.
- Si les pastilles n’apparaissent pas, vérifiez que les noms suivent `YYYY-MM-DD` ou `YYYY-MM-DD--YYYY-MM-DD`.
- Pour obtenir plus d’espace au-dessus de la navigation mobile automatiquement dégagée, augmentez **Marge inférieure mobile**.
- Si un rappel ne s’affiche pas, vérifiez qu’Obsidian est ouvert, que l’événement est aujourd’hui et que `notify_minutes` est entre `0` et `1439`.

## Licence

Voir `LICENSE`.
