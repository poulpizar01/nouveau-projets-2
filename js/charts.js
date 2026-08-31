/* =============================================================
   OIL ROXWOOD — Projet 2 · « Salle de marché »
   charts.js · graphiques en SVG, sans librairie.

   Règles tenues ici :
   — une seule échelle par graphique, jamais deux axes ;
   — les séries prennent --serie-1..4 dans l'ordre, sans boucler ;
   — grille et axes en retrait, la donnée devant ;
   — tous les chiffres en chasse fixe, alignés en colonnes.
   ============================================================= */

'use strict';

const fmt  = (n) => n.toLocaleString('fr-FR');
const fmt1 = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits:1, maximumFractionDigits:1 });
const fmt2 = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits:2, maximumFractionDigits:2 });
const SERIE_COLORS = ['var(--serie-1)','var(--serie-2)','var(--serie-3)','var(--serie-4)'];

/* ------------------------------------------------------------------
   Infobulle partagée
   ------------------------------------------------------------------ */
let tipEl = null;
function tipShow(html, x, y){
  if(!tipEl) tipEl = document.getElementById('tooltip');
  tipEl.innerHTML = html;
  tipEl.style.left = x + 'px';
  tipEl.style.top  = y + 'px';
  tipEl.classList.add('is-on');
}
function tipHide(){ if(tipEl) tipEl.classList.remove('is-on'); }

/* ------------------------------------------------------------------
   Sparkline — aire discrète + trait + point final
   ------------------------------------------------------------------ */
let sparkId = 0;
function sparkline(values, color = 'var(--accent)', w = 100, h = 30, cls = 'spark'){
  const id = 'sp' + (++sparkId);
  const min = Math.min(...values), max = Math.max(...values), span = (max - min) || 1;
  const pts = values.map((v,i) => [(i/(values.length-1))*w, h - 2 - ((v-min)/span)*(h-6)]);
  const d = pts.map((p,i) => (i?'L':'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length-1];
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity=".26"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d} L ${w} ${h} L 0 ${h} Z" fill="url(#${id})"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"
          vector-effect="non-scaling-stroke"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2" fill="${color}"
            vector-effect="non-scaling-stroke"/>
  </svg>`;
}

/* ------------------------------------------------------------------
   Aire chronologique — dernier point en pointillé (période en cours)
   Survol : curseur vertical + infobulle.
   ------------------------------------------------------------------ */
function areaChart(data, { height = 210, unit = 'barils', dashLast = true, label = 'Semaine' } = {}){
  const w = 760, h = height, pad = { t:12, r:14, b:22, l:46 };
  const max = Math.max(...data.map(d => d[1])) * 1.08;
  const X = i => pad.l + (i/(data.length-1)) * (w - pad.l - pad.r);
  const Y = v => h - pad.b - (v/max) * (h - pad.t - pad.b);
  const gy = [0,.25,.5,.75,1].map(k => max*k);
  const solid = dashLast ? data.slice(0,-1) : data;
  const line = solid.map((d,i) => (i?'L':'M') + X(i).toFixed(1) + ' ' + Y(d[1]).toFixed(1)).join(' ');
  const area = `${line} L ${X(solid.length-1).toFixed(1)} ${h-pad.b} L ${X(0)} ${h-pad.b} Z`;
  const tail = dashLast
    ? `M ${X(data.length-2).toFixed(1)} ${Y(data[data.length-2][1]).toFixed(1)}
       L ${X(data.length-1).toFixed(1)} ${Y(data[data.length-1][1]).toFixed(1)}` : '';

  return `<svg class="chart-area" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"
      style="display:block;width:100%;height:${h}px;overflow:visible">
    <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--accent)" stop-opacity=".26"/>
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${gy.map(v => `
      <line x1="${pad.l}" x2="${w-pad.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"
            stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <text x="${pad.l-8}" y="${(Y(v)+3.5).toFixed(1)}" text-anchor="end" fill="var(--ink-3)"
            font-size="9.5" font-family="IBM Plex Mono">${v>=1000?Math.round(v/1000)+'k':Math.round(v)}</text>`).join('')}
    <path d="${area}" fill="url(#areaFill)"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round"
          stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${tail ? `<path d="${tail}" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="4 4"
          opacity=".6" vector-effect="non-scaling-stroke"/>` : ''}
    ${data.map((d,i) => {
      const last = i === data.length-1;
      return `<circle cx="${X(i).toFixed(1)}" cy="${Y(d[1]).toFixed(1)}" r="${last?3.4:2.2}"
        fill="${last?'var(--accent-lt)':'var(--accent)'}" stroke="var(--surface)"
        stroke-width="${last?1.6:1.2}" vector-effect="non-scaling-stroke"/>`;
    }).join('')}
    ${data.map((d,i) => (i%2===0 || i>=data.length-2)
      ? `<text x="${X(i).toFixed(1)}" y="${h-6}" text-anchor="middle" fill="var(--ink-3)"
              font-size="9.5" font-family="IBM Plex Mono">${d[0]}</text>` : '').join('')}
    <line class="crosshair" x1="0" x2="0" y1="${pad.t-6}" y2="${h-pad.b}" stroke="var(--line-3)"
          stroke-width="1" vector-effect="non-scaling-stroke" opacity="0"/>
    ${data.map((d,i) => `<rect class="hit" x="${(X(i)-14).toFixed(1)}" y="${pad.t-6}" width="28"
        height="${h-pad.b-pad.t+6}" fill="transparent"
        data-cx="${X(i).toFixed(1)}" data-label="${label} ${d[0]}" data-value="${d[1]}" data-unit="${unit}"></rect>`).join('')}
  </svg>`;
}

/** À rappeler après chaque rendu : active le survol des aires. */
function wireCharts(root = document){
  root.querySelectorAll('svg.chart-area').forEach(svg => {
    const cross = svg.querySelector('.crosshair');
    svg.querySelectorAll('.hit').forEach(hit => {
      hit.addEventListener('mouseenter', () => {
        const cx = hit.dataset.cx;
        cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('opacity','1');
        const box = hit.getBoundingClientRect();
        tipShow(`<div class="h">${hit.dataset.label}</div>
          <div class="v"><i style="background:var(--accent)"></i>${fmt(+hit.dataset.value)} ${hit.dataset.unit}</div>`,
          box.left + box.width/2, box.top + box.height*0.35);
      });
      hit.addEventListener('mouseleave', () => { cross.setAttribute('opacity','0'); tipHide(); });
    });
  });
}

/* ------------------------------------------------------------------
   Histogramme — base à zéro, une barre peut être mise en avant
   rows : [libellé, valeur] ; opts.highlight = index à souligner
   ------------------------------------------------------------------ */
function barChart(rows, { height = 128, highlight = -1, warn = -1, unit = '' } = {}){
  const max = Math.max(...rows.map(r => r[1])) || 1;
  return `<div class="bars" style="height:${height}px">${rows.map((r,i) => {
    const px = r[1] ? Math.max(r[1]/max*(height-26), 3) : 3;
    const cls = !r[1] ? 'stem--none' : i === warn ? 'stem--warn' : i === highlight ? 'stem--hi' : '';
    return `<div>
      <span class="v">${r[1] ? fmt(r[1]) : '—'}</span>
      <div class="stem ${cls}" style="height:${px.toFixed(0)}px" title="${r[0]} · ${fmt(r[1])} ${unit}"></div>
      <span class="k">${r[0]}</span>
    </div>`;
  }).join('')}</div>`;
}

/* ------------------------------------------------------------------
   Répartition — magnitude en barres, teinte par série ou teinte unique
   rows : [libellé, valeur] ; opts.colored = true pour la palette
   ------------------------------------------------------------------ */
function splitBars(rows, total, { colored = false, unit = '' } = {}){
  const max = Math.max(...rows.map(r => r[1]));
  return `<div class="split">${rows.map((r,i) => `
    <div>
      <div class="split__head">
        ${colored ? `<i style="background:${SERIE_COLORS[i]}"></i>` : ''}
        <span>${r[0]}</span><span style="flex:1"></span>
        <b>${fmt(r[1])}${unit ? ' ' + unit : ''}</b>
        <span class="pct">${(r[1]/total*100).toFixed(1)}%</span>
      </div>
      <div class="bar"><i style="width:${(r[1]/max*100).toFixed(1)}%${colored ? `;background:${SERIE_COLORS[i]}` : ''}"></i></div>
    </div>`).join('')}</div>`;
}
