# Oil Roxwood — Projet 2 · « Salle de marché »

Tableau de bord de l'espace membre, en mise en page **salle de marché** : bandeau de
cotations, positions par expert, tableau des risques, journal de séance. Cinq écrans
complets avec un jeu de données de démonstration, sans librairie ni build.

## Lancer

Double-cliquer sur `index.html`. Les polices viennent de Google Fonts ; hors ligne,
le navigateur retombe sur des polices système sans casser la mise en page.

## Le parti pris

L'exploitation vue comme un portefeuille de positions. Chaque expert est une ligne
avec son volume, son quota, son avancement, sa prime, son écart à la semaine
précédente et sa tendance. Le risque n'est pas caché dans une page « alertes » : il est
en permanence à droite de l'écran, trié par gravité. Tout tient au-dessus du pli sur un
écran de 1 600 px.

Conséquence assumée : c'est **dense**. Illisible sur téléphone, et exigeant pour qui ne
lit pas des chiffres toute la journée. C'est un écran de bureau, pas un écran d'atelier.

## Arborescence

```
index.html        coquille : rail d'icônes, bandeau de cotations, barre d'état
css/theme.css     tous les jetons de design (couleurs, typo, géométrie)
css/app.css       squelette et composants (panneaux, tableaux, drapeaux, blotter)
js/data.js        LE jeu de données — le seul fichier à remplacer
js/charts.js      sparkline, aire chronologique, histogramme, répartition
js/app.js         icônes, navigation, écrans, chiffres dérivés, routage
```

## Les cinq écrans

| Écran | Contenu |
|---|---|
| Salle de marché | 4 tuiles chiffrées, positions par expert, tableau des risques, historique 12 semaines, CA par produit, rythme quotidien, production par grade, journal de séance |
| Positions | l'effectif complet, une ligne par expert, avec rang, avancement, prime et tendance |
| Runs | 4 tuiles, carnet des runs du jour avec valeur monétaire par run |
| Feuilles | saisies de la semaine, volume et valeur bloqués, fiche de litige |
| Facturation | encaissé / en attente / en retard, factures clients, encours par ancienneté, rapprochement production ↔ facturation |

Journal et Paramètres affichent un état vide propre.

## Brancher les vraies données

Tout part de `js/data.js`. Les chiffres consolidés ne sont **pas** recopiés à la main :
`js/app.js` les recalcule à partir des cotations et des volumes.

```js
const CA        = COTATIONS.reduce((a,c) => a + c[1]*c[3], 0);
const PRIX_MOY  = CA / D.barils;
const MARGE     = CA - D.barils * D.coutBaril;
```

Changer un prix dans `COTATIONS` met donc à jour le chiffre d'affaires, la marge, le prix
moyen pondéré, la valeur des runs, celle des feuilles et le rapprochement de facturation.

## Règles à tenir

- **Aucune couleur codée en dur hors de `theme.css`.** Si une teinte manque, on l'ajoute
  comme variable.
- **Séries de données : `--serie-1` à `--serie-4`, dans cet ordre.** Palette validée
  (bande de luminosité, écart daltonien, contraste sur ce fond). Une 5ᵉ teinte
  improvisée casserait la lisibilité — préférer un regroupement « Autres ».
- **Les couleurs d'état** (`--up`, `--down`, `--warn`, `--info`) sont réservées à l'état.
  Elles ne servent jamais de « couleur de série n° 5 », et s'accompagnent toujours d'un
  mot : « Conforme », « Sous surveillance », « Action requise » — jamais d'une pastille seule.
- **Une seule échelle par graphique.** Jamais deux axes Y.
- **Tous les chiffres** en `var(--font-num)` avec `font-variant-numeric: tabular-nums` :
  c'est ce qui fait tenir les colonnes d'un tableau de 9 colonnes.
- Après chaque rendu contenant une aire, rappeler `wireCharts()` pour réactiver le survol.

## Raccourcis

- L'URL retient l'écran courant (`index.html#billing`)

## État

`v1.0` — cinq écrans complets sur données de démonstration.
