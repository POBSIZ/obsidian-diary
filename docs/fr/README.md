# Diary (Français)

Diary est un plugin communautaire Obsidian qui transforme les fichiers Markdown de votre coffre en vues de planning par date. Il aide à naviguer entre une vue annuelle, une grille mensuelle et une liste mensuelle, tout en gérant les notes d’un jour, les notes de période, les plans mensuels et annuels, les jours fériés, une étiquette de calendrier, des calendriers externes optionnels, l’état des tâches et les rappels locaux.

Documentation complète : [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## Informations actuelles

| Élément | Valeur |
| --- | --- |
| ID du plugin | `diary` |
| Version actuelle | `1.5.0` |
| Version minimale d’Obsidian | `1.7.2` |
| Plateformes | Bureau / mobile (`isDesktopOnly: false`) |
| Langue par défaut | `en` |
| Dossier de planning par défaut | `Planner` |

## Dernière version

- `1.5.0` : ajoute la prise en charge de l’allemand, l’espagnol, le français, le japonais, le chinois simplifié, le chinois traditionnel et le coréen, en plus de l’anglais.
- `1.4.2` : limite les styles de Diary aux vues de planning, réglages et modales, et ajoute des libellés localisés aux boutons de couleur prédéfinie.
- `1.4.1` : affine les actions des événements de calendrier externe, le retour visuel au clic et les avis de succès ou d’erreur.
- `1.4.0` : ajoute les calendriers personnalisés et les flux externes optionnels. Les événements externes `webcal://` ou `https://` `.ics` restent des superpositions en lecture seule jusqu’à la création volontaire d’une note Markdown.
- `1.3.6` : version de maintenance pour stabiliser les audits typés de plugin communautaire.
- `1.3.5` : version de maintenance alignant le lint et la validation de release des plugins Obsidian.
- `1.3.4` : version de maintenance avec câblage explicite du projet TypeScript pour ESLint typé et outils de lint épinglés.
- `1.3.3` : version de maintenance avec des vérifications ESLint typées plus strictes.
- `1.3.2` : version de maintenance couvrant documentation, consignes d’agent, types de configuration ESLint et cible TypeScript.
- `1.3.1` : release avec types Obsidian épinglés, maintenance du lockfile, compatibilité ESLint et nettoyage du style des occurrences.
- `1.3.0` : ajoute les événements récurrents et les étiquettes de calendrier alternatif aux vues annuelle, grille mensuelle, liste mensuelle et barre latérale.
- `1.2.1` : version de maintenance pour compatibilité avec le lint des plugins communautaires et dépendance de jours fériés intégrée.
- `1.2.0` : introduit le planificateur de barre latérale droite, sa mise en place automatique, la commande **Open monthly planner in sidebar** et le changement de vue dans la même feuille latérale.

## Captures d’écran

Les images proviennent d’un coffre de démonstration neuf avec des notes de planning. Les captures mobiles ont été prises avec le rendu mobile du plugin activé. Le planificateur latéral droit utilise la même grille mensuelle en mode compact ; la capture de la grande grille mensuelle reste donc la référence visuelle principale.

### Bureau

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

### Mobile

| Grille mensuelle et résumé du jour | Liste mensuelle |
| --- | --- |
| ![Mobile monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Mobile monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Fonctionnalités principales

- **Planning annuel** : affiche les notes datées et les notes de période dans une table `12 mois x 31 jours`. Les largeurs de mois étendues sont conservées après rechargement.
- **Interface localisée** : basculez Diary entre anglais, allemand, espagnol, français, japonais, chinois simplifié, chinois traditionnel et coréen.
- **Grille mensuelle** : consultez un mois dans une grande grille avec chips, barres de période, jours fériés, étiquettes de calendrier et calendriers externes.
- **Liste mensuelle** : parcourez un mois chargé jour par jour, avec les filtres `All`, `With notes` et `Upcoming`.
- **Planificateur latéral droit** : gardez un planning mensuel compact dans la barre latérale droite pendant que les notes s’ouvrent dans l’espace principal.
- **Panneau de notes de plan** : crée et prévisualise les notes annuelles (`YYYY.md`) et mensuelles (`YYYY-MM.md`) au-dessus du planning. L’état ouvert ou fermé est enregistré, avec un état mobile séparé qui commence fermé.
- **Notes datées et notes de période** : les fichiers correspondant aux noms de date ou de période apparaissent sous forme de chips. Diary scanne tout le coffre par défaut, ou seulement le dossier de planning si vous le configurez.
- **Événements récurrents** : répétez une note chaque jour, mois ou année, sur base grégorienne ou calendrier alternatif. Diary ne crée que les occurrences dans la plage visible.
- **Couleur, tâche et état terminé** : `color`, `todo` et `completed` dans le frontmatter influencent le style et le libellé du chip.
- **Jours fériés** : affiche les jours fériés des régions couvertes par les langues de l’interface. Sélectionnez un badge pour voir son nom.
- **Étiquette de calendrier alternatif** : affichez une étiquette compacte, par exemple calendrier lunaire coréen, lunaire chinois, Dangi, hébraïque, islamique, persan, national indien, bouddhique, ères japonaises, Minguo, copte ou éthiopien. Les options sont localisées dans toutes les langues prises en charge.
- **Calendrier personnalisé** : créez des profils locaux pour univers de fiction ou campagnes, avec mois, jours de semaine et règles simples de bissextile. Diary affiche la date personnalisée comme étiquette tout en conservant les fichiers `YYYY-MM-DD`.
- **Calendriers externes** : ajoutez des flux `.ics` en `webcal://` ou `https://`, actualisez-les manuellement ou à intervalle, et affichez les événements comme chips ou barres en lecture seule. Créez une note Markdown seulement lorsque vous choisissez un événement externe.
- **Styles limités** : le CSS de Diary se limite aux vues de planning, panneaux de réglages et modales du plugin.
- **Rappels locaux** : les notes avec `notify_minutes` affichent une Notice Obsidian le jour concerné tant qu’Obsidian est ouvert.
- **Presse-papiers de planning** : sur ordinateur, copiez, collez, supprimez et annulez le collage de dates ou chips sélectionnés.
- **Clavier et accessibilité** : cellules de date, chips, barres de période, badges fériés, étiquettes et lignes de liste mensuelle sont activables au clavier et exposent des libellés accessibles.
- **Optimisation mobile** : la grille mensuelle prend en charge le zoom par pincement, la réinitialisation du zoom et le résumé du jour.

## Installation

1. Téléchargez la dernière release depuis [Releases](https://github.com/POBSIZ/obsidian-diary/releases).
2. Copiez `main.js`, `manifest.json` et `styles.css` dans `Vault/.obsidian/plugins/diary/`.
3. Dans Obsidian, ouvrez **Settings -> Community plugins**.
4. Si Restricted mode est activé, désactivez-le seulement dans les coffres de confiance, puis activez **Diary**.
5. Ouvrez un planning depuis les icônes du ruban ou la palette de commandes. L’icône mensuelle ouvre le planificateur de droite.

## Démarrage rapide

1. Lancez **Open monthly planner in sidebar** pour le planificateur latéral, ou **Open monthly planner** pour un onglet complet.
2. Sélectionnez le bouton d’ajout de fichier dans l’en-tête ou une cellule de date.
3. Choisissez **Single date** ou **Période**.
4. Saisissez le dossier, les dates, le nom de fichier, la couleur, l’état de tâche, l’heure de rappel et l’éventuelle répétition.
5. Sélectionnez **Créer**. Diary crée une note Markdown et l’affiche comme chip ou barre de période.

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

Sélectionnez l’icône de répétition dans l’en-tête d’un planificateur pour faire tourner la même feuille dans cet ordre.

```text
Yearly -> Monthly Grid -> Monthly List -> Yearly
```

Utilisez précédent/suivant pour changer d’année ou de mois, et l’icône de calendrier pour revenir à l’année ou au mois actuel. Sélectionnez le libellé d’année ou de mois pour saisir une valeur précise.

## Planificateur latéral droit

Diary crée un planificateur mensuel compact dans la barre latérale droite lorsque l’espace de travail est prêt. Utilisez **Open monthly planner in sidebar** ou l’icône mensuelle pour le faire réapparaître.

Cette vue sert d’accompagnement :

- Elle utilise le layout mensuel compact et le résumé du jour.
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

Utilisez **Settings -> Diary -> Calendriers externes** pour ajouter une URL `webcal://` publiée ou une URL `.ics` en `https://`.

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
- Ajoutez un suffixe pour l’utiliser comme titre de chip. Exemple : `2026-05-19-mobile-qa.md` -> `mobile-qa`
- Une couleur affiche une bordure de chip ou un point mobile.
- Activez **Todo file** pour afficher l’état de tâche.
- Définissez **Reminder time** pour enregistrer `notify_minutes`.
- Activez **Repeat**, puis choisissez une répétition quotidienne, mensuelle ou annuelle et une base de calendrier. Les occurrences sont créées paresseusement pour la plage visible ; Diary met à jour les fichiers de la même série `recurrence_id` et ignore les notes sans rapport.

### Notes de période

Sur ordinateur, faites glisser sur les cellules de date pour préremplir une modale **Période**. Sur mobile, sélectionnez le bouton d’ajout de fichier, choisissez **Période**, puis saisissez début et fin.

- Format : `YYYY-MM-DD--YYYY-MM-DD.md`
- Ajoutez un suffixe pour le titre. Exemple : `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- `date_start` et `date_end` sont enregistrés automatiquement à la création.
- Le planificateur annuel affiche les périodes avec des barres verticales et un chip au début. La grille et la liste mensuelles affichent des barres de période.

### Notes de plan

Utilisez le panneau de plan au-dessus de chaque planificateur pour créer des plans annuels ou mensuels.

- Plan annuel : `{plannerFolder}/{year}.md`
- Plan mensuel : `{plannerFolder}/{year}-{month}.md`
- Le panneau peut être replié ou déplié, et cet état est conservé.
- Bureau et mobile ont des états séparés : bureau déplié par défaut, mobile replié.
- Si la note existe déjà, Diary affiche un aperçu et un bouton d’ouverture.

## Modifier des notes

Sélectionnez un chip ou une barre de période pour ouvrir la modale d’options du fichier.

- Vérifier le chemin du fichier
- Modifier le titre affiché
- Modifier une date ou une période
- Modifier la couleur du chip
- Modifier l’état tâche / terminé
- Modifier l’heure de rappel
- Prévisualiser le fichier
- Ouvrir le fichier
- Supprimer le fichier

Sur ordinateur, faites glisser un chip ou une barre vers une autre date pour le déplacer. Les notes de période se déplacent par date de début et gardent la même durée. Si le chemin cible existe déjà, Diary ne déplace pas le fichier.

## Clavier et accessibilité

- Appuyez sur `Enter` ou `Space` sur une cellule de date, un chip, une barre de période, un badge férié, une ligne de liste mensuelle, une étiquette d’année ou de mois avec le focus.
- Les contrôles de planning utilisent rôles de bouton, libellés d’état et textes `aria-label`.
- Les boutons de couleur dans les modales exposent `aria-label` et `title` localisés.
- Les filtres de liste mensuelle exposent l’état sélectionné avec `aria-selected`.
- Les messages de validation sont annoncés avec des live regions polies.

## Presse-papiers du planning (bureau)

Dans une vue de planning, maintenez `Cmd` sur macOS ou `Ctrl` sur Windows/Linux pendant la sélection de dates ou chips.

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
- Ajustez **Marge inférieure mobile** et **Largeur des cellules mobile** pour adapter l’espace et la largeur.

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
| Marge inférieure mobile | Marge basse des planificateurs mobiles pour éviter que le contenu soit masqué par les contrôles Obsidian. |
| Largeur des cellules mobile | Largeur des cellules de mois dans le planificateur annuel mobile. `0` utilise la valeur par défaut. |

Diary enregistre aussi des états uniquement UI : expansion du panneau de plan, expansion mobile et largeurs des mois étendus dans le planificateur annuel.

## Référence frontmatter

| Clé | Description |
| --- | --- |
| `color` | Couleur du chip. Toute couleur CSS valide est acceptée, par exemple `#22c55e`, `red`, `rgb(34, 197, 94)`. |
| `todo` | Affiche la note comme tâche lorsque `true`. |
| `completed` | Affiche l’état terminé si `todo: true`. |
| `notify_minutes` | Minutes depuis minuit local le jour de l’événement. Accepte `0` à `1439`; 9 h vaut `540`. |
| `date_start` | Date de début enregistrée pour les notes de période. |
| `date_end` | Date de fin enregistrée pour les notes de période. |
| `title` | Titre de secours lorsque le titre ne peut pas venir du nom de fichier. |
| `recurrence_id` | ID stable partagé par la source et les occurrences. |
| `recurrence_role` | `source` pour la définition, `occurrence` pour les notes générées. |
| `recurrence_calendar` | Base de calendrier : `gregorian` ou ID de calendrier alternatif pris en charge. |
| `recurrence_rule` | Règle simple : `FREQ=DAILY`, `FREQ=MONTHLY` ou `FREQ=YEARLY`. |
| `recurrence_anchor_date` | Date source grégorienne utilisée comme début de série. |
| `recurrence_anchor_year/month/day` | Champs d’ancrage utilisés pour les calendriers alternatifs. |
| `recurrence_exdates` | Dates grégoriennes ignorées dans la série. |
| `recurrence_source_path` | Chemin de la note source sur les occurrences générées. |
| `recurrence_occurrence_date` | Date grégorienne représentée par une occurrence générée. |
| `diary_external_calendar` | ID du flux externe sur une note créée depuis un événement externe. |
| `diary_external_event_uid` | UID de l’événement externe. |
| `diary_external_event_instance` | Clé d’instance, souvent date/heure de début. |
| `diary_external_event_source` | Clé stable pour masquer les doublons d’overlay. |
| `diary_external_event_linked_at` | Horodatage ISO de création de la note Markdown. |

Les rappels ne sont pas des notifications système. Tant qu’Obsidian est ouvert, Diary vérifie environ toutes les 15 secondes et affiche une Notice pendant la minute correspondante le jour de l’événement.

La génération d’occurrences est idempotente. Si le fichier cible appartient déjà au même `recurrence_id`, Diary met à jour les métadonnées de série ; si c’est une note ordinaire ou une autre série, il la laisse intacte.

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

Test :

```bash
npm test
```

## Release

- Workflow de release : `.github/workflows/release.yml`
- Fichiers publiés : `main.js`, `manifest.json`, `styles.css`
- Utilisez `npm version patch|minor|major --no-git-tag-version` pour garder `package.json`, `package-lock.json`, `manifest.json` et `versions.json` synchronisés.
- Le tag GitHub Release doit correspondre exactement à la version de `manifest.json` et ne doit pas commencer par `v`.
- Le dépôt publie les assets comme fichiers individuels, et le workflow génère une attestation de provenance pour `main.js`, `manifest.json` et `styles.css`.

## Confidentialité et réseau

- Les fonctions de planning travaillent sur des fichiers Markdown locaux dans le coffre.
- Diary n’a aucune télémétrie ni analyse cachée.
- Les calculs de jours fériés et d’overlays utilisent des données intégrées, des données du navigateur ou des profils locaux, sans envoyer le contenu du coffre à des services externes.
- Les flux externes sont optionnels. Diary récupère seulement l’URL ajoutée, stocke le cache d’événements dans les données du plugin et ne crée de Markdown qu’après sélection de **Create Markdown note**.
- `obsidian-reminder-endpoint-spec.md` est une note de conception future. Le plugin publié n’envoie actuellement aucune donnée de rappel sur le réseau.

## Dépannage

- Si le plugin n’apparaît pas, vérifiez que `main.js`, `manifest.json` et `styles.css` sont directement dans `Vault/.obsidian/plugins/diary/`.
- Si les commandes manquent, confirmez que **Diary** est activé dans **Settings -> Community plugins**.
- Si le planificateur latéral manque, exécutez **Open monthly planner in sidebar** ou rechargez Obsidian après activation.
- Si les chips n’apparaissent pas, vérifiez que les noms suivent `YYYY-MM-DD` ou `YYYY-MM-DD--YYYY-MM-DD`.
- Si le contenu mobile est masqué en bas, augmentez **Marge inférieure mobile**.
- Si un rappel ne s’affiche pas, vérifiez qu’Obsidian est ouvert, que l’événement est aujourd’hui et que `notify_minutes` est entre `0` et `1439`.

## Licence

Voir `LICENSE`.
