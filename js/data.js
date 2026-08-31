/* =============================================================
   OIL ROXWOOD — Projet 2 · « Salle de marché »
   data.js · jeu de démonstration.

   C'EST LE SEUL FICHIER À REMPLACER quand les vraies données
   arrivent : mêmes noms, mêmes formes, et tout le reste suit.
   ============================================================= */

'use strict';

/* --- Semaine affichée ------------------------------------------------ */
const WEEK = { no:36, from:'lundi 31 août', to:'dimanche 6 septembre', day:4, days:7 };

/* --- Cotations produits : [produit, $/baril, variation %, volume semaine] --- */
const COTATIONS = [
  ['Brut léger', 5.00, +1.2, 69056],
  ['Diesel',     6.40, +0.4, 45476],
  ['Kérosène',   7.10, -0.9, 32002],
  ['Bitume',     4.20, +2.6, 21896],
];

/* --- Consolidé de la semaine ---------------------------------------- */
const D = {
  effectif: 34,
  effectifDelta: 3,
  barils: 168430,
  barilsPrev: 370374,
  objectif: 275000,
  quotasOk: 19,
  primes: 47850,
  coutBaril: 3.85,        // coût de revient $/baril
  tresorerie: 412800,
  tresorerieDelta: 48200,
  encoursAttente: 258800,
  encoursRetard: 120100,
  debit: 1842,            // barils / heure
  runsJour: 26,

  /* 12 semaines ; la dernière est la semaine en cours */
  histo: [
    ['S25',218400],['S26',241900],['S27',233100],['S28',262500],
    ['S29',249800],['S30',286300],['S31',271400],['S32',304600],
    ['S33',318900],['S34',341200],['S35',370374],['S36',168430],
  ],

  /* [grade, effectif, barils] — total = D.barils */
  grades: [
    ['Technicien', 9, 41700],
    ['Chef de quart', 6, 38900],
    ['Ingénieur procédé', 4, 31200],
    ['Opérateur', 10, 29230],
    ['Superviseur', 5, 27400],
  ],

  /* [jour, barils] — 0 = jour non encore couru */
  jours: [['Lun',52180],['Mar',44960],['Mer',41310],['Jeu',29980],['Ven',0],['Sam',0],['Dim',0]],

  /* trésorerie sur 12 mois, en milliers de $ */
  treso: [['S',214],['O',238],['N',252],['D',221],['J',196],['F',178],
          ['M',203],['A',241],['M',276],['J',318],['J',364],['A',413]],
};

/* --- Positions : [nom, initiales, grade, niveau, produit, quota, état, ancienneté, delta %] --- */
const EXPERTS = [
  ['Diego Herrera',  'DH', 'Direction',         6, 14820, 12000, 'ok',   '2 ans 4 mois',  +8.4],
  ['Amara Okonkwo',  'AO', 'Ingénieur procédé', 5, 12640, 10000, 'ok',   '1 an 8 mois',  +11.2],
  ['Lucas Ferreira', 'LF', 'Chef de quart',     4, 11980, 10000, 'ok',   '1 an 1 mois',   +4.6],
  ['Nadia Belkacem', 'NB', 'Ingénieur procédé', 5, 11430, 10000, 'ok',   '11 mois',       +6.9],
  ['Sven Halvorsen', 'SH', 'Chef de quart',     4,  9870, 10000, 'warn', '2 ans 0 mois',  -3.2],
  ['Mia Tanaka',     'MT', 'Superviseur',       3,  9240,  8000, 'ok',   '7 mois',        +7.1],
  ['Rui Almeida',    'RA', 'Technicien',        2,  8110,  6000, 'ok',   '1 an 5 mois',  +12.4],
  ['Clara Vogt',     'CV', 'Superviseur',       3,  7620,  8000, 'warn', '4 mois',        -1.8],
  ['Oumar Diallo',   'OD', 'Technicien',        2,  7180,  6000, 'ok',   '9 mois',        +5.3],
  ['Ivy Novak',      'IN', 'Technicien',        2,  5940,  6000, 'warn', '3 mois',        -0.9],
  ['Tomas Reyes',    'TR', 'Opérateur',         1,  4830,  4000, 'ok',   '1 an 2 mois',   +3.8],
  ['Hana Kovac',     'HK', 'Opérateur',         1,  3110,  4000, 'crit', '2 mois',       -14.6],
];

/* Série de production des 8 dernières semaines, par expert (index aligné sur EXPERTS) */
const SERIES = [
  [12.9,13.4,13.1,13.8,14.0,14.2,14.4,14.8], [10.9,11.2,11.6,11.4,12.0,12.2,12.4,12.6],
  [11.2,11.0,11.4,11.6,11.5,11.8,11.9,12.0], [10.4,10.6,10.9,11.0,11.1,11.2,11.3,11.4],
  [10.6,10.4,10.5,10.2,10.1, 9.9, 9.9, 9.9], [ 8.4, 8.6, 8.8, 8.9, 9.0, 9.1, 9.2, 9.2],
  [ 6.9, 7.1, 7.4, 7.6, 7.7, 7.9, 8.0, 8.1], [ 7.9, 7.8, 7.8, 7.7, 7.7, 7.6, 7.6, 7.6],
  [ 6.5, 6.6, 6.8, 6.9, 7.0, 7.1, 7.1, 7.2], [ 6.1, 6.0, 6.0, 5.9, 6.0, 5.9, 5.9, 5.9],
  [ 4.4, 4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.8], [ 4.1, 3.9, 3.7, 3.6, 3.4, 3.3, 3.2, 3.1],
];

/* --- Runs : [ref, trajet, conducteur, départ, arrivée, barils, état] --- */
const RUNS = [
  ['RUN-4471','Dépôt Nord → Raffinerie A',      'Lucas Ferreira', '06:00','08:40',12400,'done'],
  ['RUN-4472','Puits 7 → Dépôt Nord',           'Amara Okonkwo',  '07:15','09:05', 9800,'done'],
  ['RUN-4473','Raffinerie A → Terminal Est',    'Mia Tanaka',     '09:20','11:50',15200,'done'],
  ['RUN-4474','Puits 3 → Dépôt Sud',            'Rui Almeida',    '10:05','—',     8600,'live'],
  ['RUN-4475','Dépôt Sud → Raffinerie B',       'Sven Halvorsen', '11:30','—',    11000,'live'],
  ['RUN-4476','Terminal Est → Client Vespucci', 'Nadia Belkacem', '13:00','—',    18400,'plan'],
  ['RUN-4477','Puits 7 → Dépôt Nord',           'Oumar Diallo',   '14:15','—',     9800,'plan'],
  ['RUN-4478','Raffinerie B → Terminal Ouest',  'Clara Vogt',     '15:40','—',    13600,'plan'],
  ['RUN-4479','Dépôt Nord → Client Bayview',    'Tomas Reyes',    '17:00','—',     7400,'block'],
];

/* --- Factures : [n°, client, émise, montant $, état, âge en jours] --- */
const FACTURES = [
  ['F-2026-0841','Vespucci Petro',      '04/08', 96400,'paid',  0],
  ['F-2026-0842','Bayview Logistics',   '07/08', 52800,'paid',  0],
  ['F-2026-0843','Del Perro Marine',    '12/08', 78200,'late', 19],
  ['F-2026-0844','Sandy Shores Energy', '18/08',134500,'sent', 13],
  ['F-2026-0845','Paleto Transit',      '21/08', 41900,'late', 10],
  ['F-2026-0846','Vespucci Petro',      '25/08',108300,'sent',  6],
  ['F-2026-0847','Grapeseed Agri',      '28/08', 36700,'draft', 3],
];

/* --- Feuilles : [ref, expert, poste, créneau, barils, état] --- */
const FEUILLES = [
  ['FP-2036-118','Amara Okonkwo', 'Colonne C-201',    '31/08 · 06:00-14:00',12640,'ok'],
  ['FP-2036-119','Lucas Ferreira','Unité de craquage','31/08 · 06:00-14:00',11980,'ok'],
  ['FP-2036-120','Mia Tanaka',    'Stockage B',       '31/08 · 14:00-22:00', 9240,'wait'],
  ['FP-2036-121','Sven Halvorsen','Colonne C-202',    '31/08 · 14:00-22:00', 9870,'wait'],
  ['FP-2036-122','Ivy Novak',     'Conditionnement',  '31/08 · 14:00-22:00', 5940,'dispute'],
  ['FP-2036-123','Hana Kovac',    'Chargement quai 4','31/08 · 22:00-06:00', 3110,'wait'],
];

/* --- Tableau des risques : [gravité, titre, détail, valeur] --- */
const RISQUES = [
  ['crit','Écart compteur · FP-2036-122','Ivy Novak — déclaré 5 940 b, compteur 5 320 b','620 b'],
  ['crit','Facture F-2026-0843','Del Perro Marine — relance non envoyée','19 j'],
  ['warn','RUN-4479 bloqué','quai 4 indisponible depuis 11:20','7 400 b'],
  ['warn','Hana Kovac sous quota','78 % à J+4, 2 mois d\'ancienneté','−890 b'],
  ['warn','Torchère','maintenance programmée le 02/09, arrêt 6 h','−9 200 b'],
  ['ok','Objectif de la semaine','avance de 11 287 b sur le rythme attendu','+4,1 pts'],
];

/* --- Blotter : [heure, catégorie, texte] --- */
const BLOTTER = [
  ['11:42','crit','Écart compteur signalé sur FP-2036-122 — 620 b'],
  ['11:18','warn','RUN-4479 immobilisé au quai 4'],
  ['10:56','ok',  'FP-2036-118 et FP-2036-119 validées par Diego Herrera'],
  ['10:34','info','RUN-4475 parti vers Raffinerie B — 11 000 b'],
  ['09:47','warn','Facture F-2026-0843 : 19 jours de retard'],
  ['09:05','ok',  'RUN-4472 arrivé au Dépôt Nord — 9 800 b'],
  ['08:40','ok',  'RUN-4471 arrivé à la Raffinerie A — 12 400 b'],
  ['06:12','info','Ivy Novak passée Technicien niveau 2'],
];

/* --- Utilisateur connecté --- */
const ME = { nom:'Diego Herrera', initiales:'DH', role:'Direction' };
