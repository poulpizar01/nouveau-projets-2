/* =============================================================
   OIL ROXWOOD — Projet 2 · « Salle de marché »
   app.js · icônes, navigation, écrans, routage.
   Dépend de data.js (les données) et charts.js (les graphiques).
   ============================================================= */

'use strict';

/* ------------------------------------------------------------------
   1. Icônes
   ------------------------------------------------------------------ */
const svgIcon = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  desk:    svgIcon('<path d="M4 20V6M4 20h16"/><path d="m8 15 4-5 3 3 4-6"/>'),
  users:   svgIcon('<path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="8" r="3.2"/><path d="M17 11.5a3 3 0 0 0 0-6"/>'),
  truck:   svgIcon('<path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
  sheet:   svgIcon('<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8 12h8M8 16h5"/>'),
  invoice: svgIcon('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
  log:     svgIcon('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  cog:     svgIcon('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'),
  flame:   svgIcon('<path d="M12 3c1 3.2 3.6 4.4 3.6 7.4A3.6 3.6 0 0 1 8.4 11c0-1 .4-2 1.1-2.8"/><path d="M12 21a5 5 0 0 0 5-5c0-2-1-3-1-3"/>'),
  bolt:    svgIcon('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
};

/* ------------------------------------------------------------------
   2. Navigation — rail d'icônes, une entrée par écran
   ------------------------------------------------------------------ */
const NAV = [
  { id:'desk',    label:'Salle de marché', icon:'desk' },
  { id:'staff',   label:'Positions',       icon:'users' },
  { id:'runs',    label:'Runs',            icon:'truck',   badge:'2' },
  { id:'sheets',  label:'Feuilles',        icon:'sheet',   badge:'4' },
  { id:'billing', label:'Facturation',     icon:'invoice', badge:'2' },
  { id:'journal', label:'Journal',         icon:'log' },
  { id:'params',  label:'Paramètres',      icon:'cog' },
];

/* ------------------------------------------------------------------
   3. Chiffres dérivés — calculés, jamais recopiés à la main
   ------------------------------------------------------------------ */
const CA        = COTATIONS.reduce((a,c) => a + c[1]*c[3], 0);
const PRIX_MOY  = CA / D.barils;
const COUT      = D.barils * D.coutBaril;
const MARGE     = CA - COUT;
const MARGE_PCT = MARGE / CA * 100;
const PCT_OBJ   = D.barils / D.objectif * 100;
const PCT_PACE  = WEEK.day / WEEK.days * 100;
const AVANCE    = Math.round(D.barils - D.objectif * PCT_PACE / 100);

const SUBTITLES = {
  desk:    `Semaine ${WEEK.no} · jour ${WEEK.day}/${WEEK.days} · ${D.effectif} experts · objectif ${fmt(D.objectif)} b`,
  staff:   `${D.effectif} positions · ${D.quotasOk} au quota · primes projetées ${fmt(D.primes)} $`,
  runs:    `${D.runsJour} runs aujourd'hui · 2 en cours · 1 bloqué`,
  sheets:  `4 feuilles en attente · 1 litige ouvert`,
  billing: `${fmt(D.encoursAttente)} $ en attente · ${fmt(D.encoursRetard)} $ en retard`,
};

/* ------------------------------------------------------------------
   4. Petits composants
   ------------------------------------------------------------------ */
const $ = (sel, root = document) => root.querySelector(sel);

function tile({ label, value, unit = '', foot = '', spark = null, color, span = 3 }){
  return `<section class="panel c${span}">
    <div class="tile__label">${label}</div>
    <div class="tile__value">${value}${unit ? `<em>${unit}</em>` : ''}</div>
    <div class="tile__foot">${foot}</div>
    ${spark ? sparkline(spark, color || 'var(--accent)') : ''}
  </section>`;
}

function head(title, hint = '', extra = ''){
  return `<div class="panel__head">
    <h2 class="panel__title">${title}</h2><span class="spacer"></span>
    ${hint ? `<span class="panel__hint">${hint}</span>` : ''}${extra}
  </div>`;
}

const delta = (v, suffix = ' %') =>
  `<span class="delta delta--${v > 0 ? 'up' : v < 0 ? 'down' : 'flat'}">${v > 0 ? '▲' : v < 0 ? '▼' : '='} ${fmt1(Math.abs(v))}${suffix}</span>`;

const FLAG = { ok:'flag--ok', warn:'flag--warn', crit:'flag--crit', info:'flag--info', neut:'' };

function emptyState(title, text){
  return `<div class="empty"><span class="empty__icon">${ICONS.bolt}</span>
    <h4>${title}</h4><p>${text}</p></div>`;
}

function risksPanel(){
  return `<ul class="risks">${RISQUES.map(r => `<li>
    <span class="sev sev--${r[0]}"></span>
    <span class="tx"><b>${r[1]}</b><span>${r[2]}</span></span>
    <span class="val">${r[3]}</span></li>`).join('')}</ul>`;
}

function blotterPanel(){
  const TAG = { ok:'OK', warn:'ALERTE', crit:'CRITIQUE', info:'INFO' };
  return `<ul class="blotter">${BLOTTER.map(b => `<li>
    <time>${b[0]}</time><span class="tag tag--${b[1]}">${TAG[b[1]]}</span>
    <span class="tx">${b[2]}</span></li>`).join('')}</ul>`;
}

/* ------------------------------------------------------------------
   5. Écrans
   ------------------------------------------------------------------ */
const SCREENS = {};

/* ---- Salle de marché (accueil) ---- */
SCREENS.desk = () => `
  <div class="grid">
    ${tile({ label:`Barils · semaine ${WEEK.no}`, value:fmt(D.barils),
      foot:`${delta(7.2)} au rythme de S${WEEK.no-1} · ${PCT_OBJ.toFixed(1)} % de l'objectif`,
      spark:D.jours.slice(0,4).map(j => j[1]), color:'var(--accent)' })}
    ${tile({ label:"Chiffre d'affaires", value:fmt(Math.round(CA)), unit:'$',
      foot:`prix moyen pondéré ${fmt2(PRIX_MOY)} $/b`,
      spark:D.histo.slice(-9,-1).map(h => h[1]), color:'var(--serie-1)' })}
    ${tile({ label:'Marge brute', value:fmt(Math.round(MARGE)), unit:'$',
      foot:`${fmt1(MARGE_PCT)} % · coût de revient ${fmt2(D.coutBaril)} $/b`,
      spark:[268,274,281,288,292,299,303,307], color:'var(--serie-2)' })}
    ${tile({ label:'Trésorerie', value:fmt(D.tresorerie), unit:'$',
      foot:`${delta(13.2)} sur 30 jours · ${fmt(D.encoursRetard)} $ en retard`,
      spark:D.treso.map(t => t[1]), color:'var(--serie-3)' })}
  </div>

  <div class="grid">
    <section class="panel c8">
      ${head('Positions par expert', `production de la semaine ${WEEK.no}, ordonnée par volume`,
        `<div class="seg" style="margin-left:10px"><button aria-pressed="true">Tous</button><button>Au quota</button><button>En alerte</button></div>`)}
      <div class="tablewrap"><table class="table" style="min-width:820px">
        <thead><tr><th>Expert</th><th>Grade</th><th class="num">Produit</th><th class="num">Quota</th>
          <th style="width:120px">Avancement</th><th class="num">Prime</th><th class="num">Δ S${WEEK.no-1}</th>
          <th>Tendance</th><th>État</th></tr></thead>
        <tbody>${EXPERTS.slice(0,8).map((e,i) => positionRow(e,i)).join('')}</tbody>
      </table></div>
      <div style="margin-top:9px;font-family:var(--font-num);font-size:11px;color:var(--ink-3)">
        8 des ${D.effectif} positions affichées — voir l'écran Positions pour le détail complet.</div>
    </section>

    <section class="panel c4">
      ${head('Tableau des risques', `${RISQUES.length} lignes ouvertes`)}
      ${risksPanel()}
    </section>
  </div>

  <div class="grid">
    <section class="panel c7">
      ${head('Historique des semaines', `barils livrés · S${WEEK.no} en cours (pointillé)`)}
      ${areaChart(D.histo, { height:210 })}
    </section>
    <section class="panel c5">
      ${head('Chiffre d\'affaires par produit', `${fmt(Math.round(CA))} $ sur la semaine`)}
      ${splitBars(COTATIONS.map(c => [`${c[0]} · ${fmt2(c[1])} $/b`, Math.round(c[1]*c[3])]),
                  CA, { colored:true, unit:'$' })}
    </section>
  </div>

  <div class="grid">
    <section class="panel c4">
      ${head('Rythme quotidien', `objectif ${fmt(Math.round(D.objectif/WEEK.days))} b/jour`)}
      ${barChart(D.jours, { height:150, highlight:0, unit:'barils' })}
    </section>
    <section class="panel c4">
      ${head('Production par grade', `semaine ${WEEK.no}`)}
      ${splitBars(D.grades.map(g => [`${g[0]} · ${g[1]} exp.`, g[2]]), D.barils, { unit:'b' })}
    </section>
    <section class="panel c4">
      ${head('Journal de la séance', 'aujourd\'hui')}
      ${blotterPanel()}
    </section>
  </div>`;

function positionRow(e, i){
  const pc = e[4]/e[5]*100;
  const prime = Math.round(e[4]*0.35);
  const barCls = e[6] === 'ok' ? '' : e[6] === 'warn' ? 'bar--warn' : 'bar--crit';
  const etat = { ok:'Conforme', warn:'Sous surveillance', crit:'Action requise' }[e[6]];
  return `<tr>
    <td><div class="name">${e[0]}</div><div class="sub">Niv. ${e[3]} · ${e[7]}</div></td>
    <td style="color:var(--ink-2)">${e[2]}</td>
    <td class="num">${fmt(e[4])}</td>
    <td class="num" style="color:var(--ink-3)">${fmt(e[5])}</td>
    <td><div style="display:flex;align-items:center;gap:8px">
      <div class="bar ${barCls}" style="flex:1"><i style="width:${Math.min(pc,100).toFixed(0)}%"></i></div>
      <span style="font-family:var(--font-num);font-size:11.5px;width:34px;text-align:right;color:${e[6]==='crit'?'var(--down-lt)':'var(--ink-2)'}">${pc.toFixed(0)}%</span>
    </div></td>
    <td class="num">${fmt(prime)} $</td>
    <td class="num" style="color:${e[8]>=0?'var(--up-lt)':'var(--down-lt)'}">${e[8]>=0?'+':''}${fmt1(e[8])} %</td>
    <td>${sparkline(SERIES[i], e[8] >= 0 ? 'var(--up)' : 'var(--down)', 76, 24, 'mini')}</td>
    <td><span class="flag ${FLAG[e[6]]}">${etat}</span></td>
  </tr>`;
}

/* ---- Positions (effectif complet) ---- */
SCREENS.staff = () => `
  <div class="grid">
    ${tile({ label:'Positions ouvertes', value:D.effectif, unit:'experts',
      foot:`${delta(D.effectifDelta,'')} vs semaine ${WEEK.no-1}`, spark:[28,29,29,30,31,31,32,34] })}
    ${tile({ label:'Au quota', value:D.quotasOk, unit:`/ ${D.effectif}`,
      foot:'14 sous quota · 1 en alerte', spark:[12,14,13,16,15,18,17,19], color:'var(--serie-1)' })}
    ${tile({ label:'Primes projetées', value:fmt(D.primes), unit:'$',
      foot:'35 % du volume produit', spark:[32,35,34,39,41,44,46,48], color:'var(--serie-2)' })}
    ${tile({ label:'Production moyenne', value:fmt(Math.round(D.barils/D.effectif)), unit:'b / expert',
      foot:`${delta(4.1)} vs S${WEEK.no-1}`, spark:[4.2,4.4,4.3,4.6,4.7,4.8,4.9,5.0], color:'var(--serie-3)' })}
  </div>

  <div class="grid"><section class="panel c12">
    ${head(`Toutes les positions · semaine ${WEEK.no}`, `12 des ${D.effectif} experts · ordonnées par volume`,
      `<button class="btn btn--sm" style="margin-left:10px">Exporter</button>`)}
    <div class="tablewrap"><table class="table" style="min-width:860px">
      <thead><tr><th class="num" style="width:34px">#</th><th>Expert</th><th>Grade</th><th class="num">Produit</th>
        <th class="num">Quota</th><th style="width:130px">Avancement</th><th class="num">Prime</th>
        <th class="num">Δ S${WEEK.no-1}</th><th>Tendance</th><th>État</th></tr></thead>
      <tbody>${EXPERTS.map((e,i) => {
        const row = positionRow(e,i);
        return row.replace('<tr>', `<tr><td class="num" style="color:var(--ink-3)">${String(i+1).padStart(2,'0')}</td>`);
      }).join('')}</tbody>
    </table></div>
  </section></div>`;

/* ---- Runs ---- */
SCREENS.runs = () => {
  const ETAT = { done:['ok','Terminé'], live:['info','En cours'], plan:['neut','Planifié'], block:['crit','Bloqué'] };
  const volume = RUNS.filter(r => r[6] === 'done').reduce((a,r) => a + r[5], 0);
  const planifie = RUNS.filter(r => r[6] !== 'done').reduce((a,r) => a + r[5], 0);
  return `
  <div class="grid">
    ${tile({ label:'Runs du jour', value:D.runsJour, foot:`${delta(23.8)} vs lundi dernier`,
      spark:[18,21,19,24,22,25,21,26] })}
    ${tile({ label:'Volume livré', value:fmt(volume), unit:'barils',
      foot:'3 runs terminés · 2 en cours', spark:[9,14,21,26,31,37,37,37], color:'var(--serie-1)' })}
    ${tile({ label:'Volume engagé', value:fmt(planifie), unit:'barils',
      foot:'6 runs à venir dont 1 bloqué', spark:[42,48,51,55,59,62,66,69], color:'var(--serie-3)' })}
    ${tile({ label:'Durée moyenne', value:'2 h 12',
      foot:`${delta(-5.7)} vs moyenne S${WEEK.no-1}`, spark:[148,151,146,142,139,140,134,132], color:'var(--serie-2)' })}
  </div>

  <div class="grid"><section class="panel c12">
    ${head(`Carnet des runs · ${WEEK.from}`, '',
      `<div class="seg" style="margin-left:10px"><button aria-pressed="true">Jour</button><button>Semaine</button></div>`)}
    <div class="tablewrap"><table class="table" style="min-width:840px">
      <thead><tr><th>Réf.</th><th>Trajet</th><th>Conducteur</th><th class="num">Départ</th><th class="num">Arrivée</th>
        <th class="num">Barils</th><th class="num">Valeur</th><th>État</th><th></th></tr></thead>
      <tbody>${RUNS.map(r => `<tr>
        <td class="ref">${r[0]}</td>
        <td>${r[1]}</td>
        <td style="color:var(--ink-2)">${r[2]}</td>
        <td class="num">${r[3]}</td>
        <td class="num" style="color:var(--ink-3)">${r[4]}</td>
        <td class="num">${fmt(r[5])}</td>
        <td class="num">${fmt(Math.round(r[5]*PRIX_MOY))} $</td>
        <td><span class="flag ${FLAG[ETAT[r[6]][0]]}">${ETAT[r[6]][1]}</span></td>
        <td style="text-align:right"><button class="btn btn--sm">Détail</button></td>
      </tr>`).join('')}</tbody>
    </table></div>
  </section></div>`;
};

/* ---- Feuilles de production ---- */
SCREENS.sheets = () => {
  const ETAT = { ok:['ok','Validée'], wait:['warn','En attente'], dispute:['crit','Litige'] };
  const enAttente = FEUILLES.filter(f => f[5] !== 'ok').reduce((a,f) => a + f[4], 0);
  return `
  <div class="grid">
    ${tile({ label:'Feuilles saisies', value:FEUILLES.length, foot:`semaine ${WEEK.no}, jour ${WEEK.day}`,
      spark:[3,4,4,5,5,6,6,6] })}
    ${tile({ label:'Volume en attente', value:fmt(enAttente), unit:'barils',
      foot:'4 feuilles à valider', spark:[9,12,15,18,21,24,26,28], color:'var(--serie-2)' })}
    ${tile({ label:'Valeur bloquée', value:fmt(Math.round(enAttente*PRIX_MOY)), unit:'$',
      foot:'non facturable tant que non validé', spark:[52,64,79,92,108,121,138,158], color:'var(--serie-3)' })}
    ${tile({ label:'Litiges', value:'1', foot:'FP-2036-122 · écart de 620 b',
      spark:[0,0,1,0,0,0,1,1], color:'var(--down)' })}
  </div>

  <div class="grid">
    <section class="panel c8">
      ${head(`Feuilles de la semaine ${WEEK.no}`, 'saisies par les chefs de quart')}
      <div class="tablewrap"><table class="table" style="min-width:760px">
        <thead><tr><th>Référence</th><th>Expert</th><th>Poste</th><th>Créneau</th>
          <th class="num">Barils</th><th class="num">Valeur</th><th>État</th></tr></thead>
        <tbody>${FEUILLES.map(f => `<tr>
          <td class="ref">${f[0]}</td><td>${f[1]}</td>
          <td style="color:var(--ink-2)">${f[2]}</td>
          <td style="font-family:var(--font-num);font-size:11.5px;color:var(--ink-3)">${f[3]}</td>
          <td class="num">${fmt(f[4])}</td>
          <td class="num">${fmt(Math.round(f[4]*PRIX_MOY))} $</td>
          <td><span class="flag ${FLAG[ETAT[f[5]][0]]}">${ETAT[f[5]][1]}</span></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </section>

    <section class="panel c4">
      ${head('Litige FP-2036-122', 'ouvert depuis 2 h')}
      <p style="margin:0 0 12px;font-size:13px;color:var(--ink-2)">Ivy Novak a déclaré
        <b style="font-family:var(--font-num);color:var(--ink)">5 940</b> barils.
        Le compteur du conditionnement en relève
        <b style="font-family:var(--font-num);color:var(--ink)">5 320</b>.</p>
      <table class="table" style="margin-bottom:12px">
        <tbody>
          <tr><td>Écart</td><td class="num" style="color:var(--down-lt)">620 b</td></tr>
          <tr><td>Valeur de l'écart</td><td class="num">${fmt(Math.round(620*PRIX_MOY))} $</td></tr>
          <tr><td>Impact prime</td><td class="num">217 $</td></tr>
        </tbody>
      </table>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn--sm">Retenir la saisie</button>
        <button class="btn btn--sm">Retenir le compteur</button>
        <button class="btn btn--go btn--sm">Valider les 4 feuilles</button>
      </div>
    </section>
  </div>`;
};

/* ---- Facturation ---- */
SCREENS.billing = () => {
  const ETAT = { paid:['ok','Payée'], sent:['info','Envoyée'], late:['crit','En retard'], draft:['neut','Brouillon'] };
  const somme = (e) => FACTURES.filter(f => f[4] === e).reduce((a,f) => a + f[3], 0);
  const aging = [['0-7 jours',108300],['8-15 jours',134500],['16-30 jours',120100]];
  const totalAging = aging.reduce((a,r) => a + r[1], 0);
  const facture = 102340;   // barils déjà facturés
  return `
  <div class="grid">
    ${tile({ label:'Encaissé ce mois', value:fmt(somme('paid')), unit:'$', foot:'2 factures soldées',
      spark:[41,52,49,63,78,96,132,149], color:'var(--serie-1)' })}
    ${tile({ label:'En attente', value:fmt(somme('sent')), unit:'$', foot:'2 factures envoyées, non échues',
      spark:[96,120,108,142,133,178,212,243], color:'var(--serie-3)' })}
    ${tile({ label:'En retard', value:fmt(somme('late')), unit:'$',
      foot:'<span class="delta delta--down">▲ 2 factures</span> · relance à envoyer', spark:[0,0,42,42,42,78,120,120], color:'var(--down)' })}
    ${tile({ label:'Délai moyen', value:'14', unit:'jours', foot:'objectif interne : 10 jours',
      spark:[11,12,11,13,12,14,15,14], color:'var(--serie-2)' })}
  </div>

  <div class="grid">
    <section class="panel c8">
      ${head('Factures clients', '', `<button class="btn btn--go btn--sm" style="margin-left:10px">Relancer les retards</button>`)}
      <div class="tablewrap"><table class="table" style="min-width:720px">
        <thead><tr><th>N°</th><th>Client</th><th>Émise</th><th class="num">Montant</th>
          <th class="num">Âge</th><th class="num">Barils</th><th>État</th></tr></thead>
        <tbody>${FACTURES.map(f => `<tr>
          <td class="ref">${f[0]}</td><td>${f[1]}</td>
          <td style="font-family:var(--font-num);font-size:11.5px;color:var(--ink-3)">${f[2]}</td>
          <td class="num">${fmt(f[3])} $</td>
          <td class="num" style="color:${f[4]==='late'?'var(--down-lt)':'var(--ink-3)'}">${f[5] ? f[5]+' j' : '—'}</td>
          <td class="num" style="color:var(--ink-3)">${fmt(Math.round(f[3]/PRIX_MOY))}</td>
          <td><span class="flag ${FLAG[ETAT[f[4]][0]]}">${ETAT[f[4]][1]}</span></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </section>

    <div class="c4" style="display:flex;flex-direction:column;gap:var(--gap)">
      <section class="panel">
        ${head('Encours par ancienneté', `${fmt(totalAging)} $ au total`)}
        ${splitBars(aging, totalAging, { unit:'$' })}
        <p style="margin:11px 0 0;font-size:12.5px;color:var(--ink-3)">Aucune créance de plus de 30 jours.
          La relance automatique part à J+15.</p>
      </section>
      <section class="panel">
        ${head('Rapprochement', 'production ↔ facturation')}
        <table class="table">
          <tbody>
            <tr><td>Barils produits</td><td class="num">${fmt(D.barils)}</td></tr>
            <tr><td>Barils facturés</td><td class="num">${fmt(facture)}</td></tr>
            <tr><td>Non facturé</td><td class="num" style="color:var(--warn-lt)">${fmt(D.barils-facture)}</td></tr>
            <tr><td>Reste à émettre</td><td class="num">${fmt(Math.round((D.barils-facture)*PRIX_MOY))} $</td></tr>
          </tbody>
        </table>
        <div style="margin-top:11px">
          <div class="bar bar--warn"><i style="width:${(facture/D.barils*100).toFixed(1)}%"></i></div>
          <p style="margin:8px 0 0;font-size:12.5px;color:var(--ink-3)">
            ${fmt1(facture/D.barils*100)} % de la production de la semaine est déjà facturée.</p>
        </div>
      </section>
    </div>
  </div>`;
};

/* ---- Écrans non construits ---- */
function stub(label){
  return `<div class="grid"><section class="panel c12">
    ${emptyState(label, 'Écran prévu au périmètre, pas encore construit. Cinq écrans sont complets : Salle de marché, Positions, Runs, Feuilles et Facturation.')}
  </section></div>`;
}

/* ------------------------------------------------------------------
   6. Bandeau de cotations et barre d'état
   ------------------------------------------------------------------ */
function renderTicker(){
  $('#ticker').innerHTML =
    COTATIONS.map(c => `<div class="quote">
      <span class="quote__k">${c[0]}</span>
      <span class="quote__p">${fmt2(c[1])} $/b</span>
      <span class="quote__d ${c[2] >= 0 ? 'up' : 'down'}">${c[2] >= 0 ? '▲' : '▼'} ${fmt1(Math.abs(c[2]))} %</span>
    </div>`).join('') +
    `<div class="quote">
      <span class="quote__k">Moyenne pondérée</span>
      <span class="quote__p">${fmt2(PRIX_MOY)} $/b</span>
      <span class="quote__d up">▲ 0,6 %</span>
    </div>
    <div class="quote ticker__fill"></div>
    <div class="ticker__stamp"><span class="pulse"></span>séance · 11:42</div>`;
}

function renderStatus(){
  $('#status').innerHTML = `
    <span><i class="led"></i> <b>Dépôt Roxwood</b> — en service</span>
    <span>Débit <b>${fmt(D.debit)} b/h</b></span>
    <span>Objectif <b>${PCT_OBJ.toFixed(1)} %</b> · avance <b>+${fmt(AVANCE)} b</b></span>
    <span><i class="led led--warn"></i> Torchère · maintenance 02/09</span>
    <span><i class="led led--crit"></i> 2 alertes critiques</span>
    <span>Dernière synchro <b>il y a 12 s</b></span>
    <span style="margin-left:auto">Projet 2 · v1.0</span>`;
}

/* ------------------------------------------------------------------
   7. Routage
   ------------------------------------------------------------------ */
function labelOf(id){ const it = NAV.find(n => n.id === id); return it ? it.label : id; }

function renderNav(activeId){
  $('#nav').innerHTML = NAV.map(it => `
    <button class="rail__btn" type="button" data-screen="${it.id}" title="${it.label}"
            aria-label="${it.label}" ${it.id === activeId ? 'aria-current="page"' : ''}>
      ${ICONS[it.icon] || ICONS.bolt}${it.badge ? `<span class="badge">${it.badge}</span>` : ''}
    </button>`).join('');
}

function goTo(id){
  const render = SCREENS[id];
  $('#view').innerHTML = render ? render() : stub(labelOf(id));
  $('#pageTitle').textContent = labelOf(id);
  $('#pageSub').textContent = SUBTITLES[id] || '';
  renderNav(id);
  wireCharts($('#view'));
  window.scrollTo({ top:0 });
  location.hash = id;
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-screen]');
  if(nav){ goTo(nav.dataset.screen); return; }
  const seg = e.target.closest('.seg button');
  if(seg){
    seg.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed','false'));
    seg.setAttribute('aria-pressed','true');
  }
});

/* ------------------------------------------------------------------
   8. Démarrage
   ------------------------------------------------------------------ */
renderTicker();
renderStatus();
const startId = location.hash.slice(1);
goTo(NAV.some(n => n.id === startId) ? startId : 'desk');
