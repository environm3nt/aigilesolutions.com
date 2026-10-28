// impediments demo — UI logic. Data lives in /data/impediments-data.js (loaded first).
/* ---------- state ---------- */
let range='q', reasonFilter=null, hiddenAttr=new Set(), prevFilter='all';
const $=id=>document.getElementById(id);
function inRange(t){ if(range==='q')return true; const n=parseInt(range); return t.sprint>17-n; }
function filtered(){ const team=$('teamSel').value; return T.filter(t=>inRange(t)&&(team==='all'||t.team===team)); }
function fmt(n){return n.toLocaleString('en-US')}

/* ---------- views ---------- */
function go(v){
  document.querySelectorAll('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
  document.querySelectorAll('.nav-item').forEach(e=>e.classList.toggle('active',e.dataset.view===v));
  $('side').classList.remove('open');
  if(v==='impediments')renderTable(); if(v==='actions')renderActions();
  window.scrollTo({top:0});
}
function setRange(r,btn){range=r;document.querySelectorAll('#range button').forEach(b=>b.classList.toggle('on',b===btn));render();}
function setPrev(p){prevFilter=p;$('fPrevAll').classList.toggle('on',p==='all');$('fPrevYes').classList.toggle('on',p==='yes');renderTable();}

function render(){
  const d=filtered();
  const lost=d.reduce((a,t)=>a+t.lost,0);
  const prevLost=d.filter(t=>t.prev).reduce((a,t)=>a+t.lost,0);
  const byReason={}; d.forEach(t=>byReason[t.reason]=(byReason[t.reason]||0)+1);
  const top=Object.entries(byReason).sort((a,b)=>b[1]-a[1])[0];
  $('kpis').innerHTML=`
    <div class="panel kpi"><div class="lbl">Impediments</div><div class="val">${d.length}</div><div class="delta">${d.filter(t=>t.blocked).length} flagged blocked · ${d.length-d.filter(t=>t.blocked).length} overran silently</div></div>
    <div class="panel kpi"><div class="lbl">Days lost</div><div class="val">${fmt(lost)}<small>days</small></div><div class="delta">${(lost/d.length).toFixed(1)} per impediment</div></div>
    <div class="panel kpi"><div class="lbl">Preventable by us</div><div class="val">${Math.round(prevLost/lost*100)}<small>%</small></div><div class="delta good">${prevLost} days within our control</div></div>
    <div class="panel kpi"><div class="lbl">Top blocker</div><div class="val" style="font-size:19px;line-height:1.25;letter-spacing:-.015em">${top?top[0]:'—'}</div><div class="delta bad">${top?top[1]:0} occurrences · attributed ${top?REASONS.find(r=>r[0]===top[0])[1]:''}</div></div>`;
  renderReasons(d); renderAttrib(d); renderTrend(); renderScatter(d);
}

function renderReasons(d){
  const c={}; d.forEach(t=>c[t.reason]=(c[t.reason]||0)+1);
  const rows=Object.entries(c).sort((a,b)=>b[1]-a[1]); const max=rows[0]?rows[0][1]:1;
  $('reasons').innerHTML=rows.map(([r,n])=>{const attr=REASONS.find(x=>x[0]===r)[1];const on=reasonFilter===r;
    return `<button class="bar-row" style="width:100%;background:${on?'var(--glass-2)':'none'};border:none;border-radius:8px;cursor:pointer;text-align:left;padding:5px 6px" onclick="filterReason('${r}')" title="${r} — ${n}">
      <span class="lbl">${r}</span><span class="bar"><i style="width:${n/max*100}%;background:${ATTR[attr]}"></i></span><span class="v">${n}</span></button>`}).join('');
}
function filterReason(r){ reasonFilter=r; $('fAttr').value='all';$('fSrc').value='all'; go('impediments'); }

function renderAttrib(d){
  const s={Internal:0,Client:0,Partner:0,External:0}; d.forEach(t=>s[t.attr]+=t.lost);
  const tot=Object.values(s).reduce((a,b)=>a+b,0)||1;
  // stacked horizontal bar with 2px gaps + list
  let x=0; const segs=Object.entries(s).map(([k,v])=>{const w=v/tot*100;const seg=`<div style="width:calc(${w}% - 2px);background:${ATTR[k]};height:100%;border-radius:3px" title="${k} ${v} days"></div>`;x+=w;return seg}).join('');
  $('attrib').innerHTML=`<div style="display:flex;gap:2px;height:14px;margin:6px 0 16px">${segs}</div>`+
    Object.entries(s).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:13px">
      <span style="display:flex;align-items:center;gap:8px"><i class="sw" style="background:${ATTR[k]}"></i>${k}<span class="src" style="margin-left:6px">${k==='Internal'?'preventable':k==='Partner'?'escalate':k==='Client'?'contractual':'monitor'}</span></span>
      <span style="font-variant-numeric:tabular-nums"><b style="font-weight:600">${v}</b> <span style="color:var(--ink-3)">d · ${Math.round(v/tot*100)}%</span></span></div>`).join('');
}

function renderTrend(){
  const team=$('teamSel').value; const data=T.filter(t=>team==='all'||t.team===team);
  const keys=['Internal','Client','Partner','External'].filter(k=>!hiddenAttr.has(k));
  const series=keys.map(k=>({k,vals:SPRINTS.map(s=>data.filter(t=>t.sprint===s&&t.attr===k).reduce((a,t)=>a+t.lost,0))}));
  const W=520,H=210,pl=30,pr=12,pt=14,pb=26; const maxV=Math.max(10,...series.flatMap(s=>s.vals));
  const step=[5,10,20,25,50].find(st=>st*4>=maxV)||100; const nice=step*4; const X=i=>pl+i*(W-pl-pr)/(SPRINTS.length-1), Y=v=>pt+(H-pt-pb)*(1-v/nice);
  let g=''; for(let v=0;v<=nice;v+=nice/4){g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.08)"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end" class="mono" style="font-size:10px">${v}</text>`}
  SPRINTS.forEach((s,i)=>g+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle" class="mono" style="font-size:10px">S${s}</text>`);
  series.forEach(s=>{const p=s.vals.map((v,i)=>`${X(i)},${Y(v)}`).join(' ');g+=`<polyline points="${p}" fill="none" stroke="${ATTR_HEX[s.k]}" stroke-width="2" stroke-linejoin="round"/>`;
    const li=s.vals.length-1; g+=`<circle cx="${X(li)}" cy="${Y(s.vals[li])}" r="4" fill="${ATTR_HEX[s.k]}" stroke="#1B1330" stroke-width="2"/>`;
    s.vals.forEach((v,i)=>g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="9" fill="transparent" data-tip="<b>${s.k} · Sprint ${SPRINTS[i]}</b><span class='m'>${v} days lost</span>"/>`)});
  $('trend').innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">${g}</svg>`;
  $('trendLegend').innerHTML=['Internal','Client','Partner','External'].map(k=>`<button class="${hiddenAttr.has(k)?'off':''}" onclick="toggleAttr('${k}')"><i class="sw" style="background:${ATTR[k]}"></i>${k}</button>`).join('');
}
function toggleAttr(k){hiddenAttr.has(k)?hiddenAttr.delete(k):hiddenAttr.add(k);renderTrend();}

function renderScatter(d){
  const W=520,H=210,pl=30,pr=12,pt=12,pb=26; const mx=14, my=26;
  const X=v=>pl+(W-pl-pr)*v/mx, Y=v=>pt+(H-pt-pb)*(1-v/my);
  let g=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(mx)}" y2="${Y(mx)}" stroke="rgba(255,255,255,.25)" stroke-dasharray="4 4"/><text x="${X(10)}" y="${Y(10)+16}" text-anchor="middle" style="font-size:10px;fill:var(--ink-3)">on estimate</text>`;
  [0,5,10,15,20,25].forEach(v=>g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.07)"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end" class="mono" style="font-size:10px">${v}</text>`);
  [2,5,8,13].forEach(v=>g+=`<text x="${X(v)}" y="${H-8}" text-anchor="middle" class="mono" style="font-size:10px">${v}d</text>`);
  g+=`<text x="${W/2}" y="${H+2}" text-anchor="middle" style="font-size:10px;fill:var(--ink-3)"></text>`;
  d.forEach((t,i)=>{const jx=(i%7-3)*0.12, jy=(i%5-2)*0.25; g+=`<circle cx="${X(t.est+jx)}" cy="${Y(Math.min(my,t.actual+jy))}" r="4.5" fill="${ATTR_HEX[t.attr]}" fill-opacity=".85" stroke="#1B1330" stroke-width="1.5" data-tip="<b>${t.key} · ${t.title}</b><span class='m'>est ${t.est}d → actual ${t.actual}d</span><span class='m'>${t.reason} · ${t.attr}</span>" style="cursor:pointer" onclick="openTicket('${t.key}')"/>`});
  $('scatter').innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">${g}</svg><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink-3);font-family:var(--mono);margin-top:2px"><span>← estimate (days)</span><span>actual ↑</span></div>`;
}

function renderTable(){
  const fa=$('fAttr').value, fs=$('fSrc').value;
  let d=filtered().filter(t=>(fa==='all'||t.attr===fa)&&(fs==='all'||t.src===fs)&&(prevFilter==='all'||t.prev)&&(!reasonFilter||t.reason===reasonFilter)).sort((a,b)=>b.sprint-a.sprint||b.lost-a.lost);
  $('tblTitle').innerHTML=`${d.length} impediments${reasonFilter?` · <span style="font-weight:400;color:var(--ink-2)">${reasonFilter}</span> <button onclick="reasonFilter=null;renderTable()" style="background:var(--glass);border:1px solid var(--line);border-radius:6px;font-size:11px;padding:2px 7px;cursor:pointer;margin-left:6px">clear ×</button>`:''}`;
  $('tblSub').textContent=`${d.reduce((a,t)=>a+t.lost,0)} days lost · click a row for the evidence trail`;
  $('tbody').innerHTML=d.length?d.map(t=>`<tr class="row" onclick="openTicket('${t.key}')" id="r-${t.key}">
    <td><span class="key">${t.key}</span><br><span class="ttl">${t.title}</span></td>
    <td>${t.team}<br><span class="src">Sprint ${t.sprint}</span></td>
    <td>${t.reason}${t.prev?'<br><span class="src" style="color:var(--good)">preventable</span>':''}</td>
    <td><span class="pill"><i class="sw" style="background:${ATTR[t.attr]}"></i>${t.attr}</span></td>
    <td><span class="src">${t.src}</span></td>
    <td><span class="num">${t.est}d → ${t.actual}d</span></td>
    <td><span class="num" style="font-weight:600">${t.lost}d</span></td></tr>`).join(''):`<tr><td colspan="7" class="empty">Nothing matches these filters.</td></tr>`;
}

function openTicket(key){
  const t=T.find(x=>x.key===key); if(!t)return;
  document.querySelectorAll('tr.row').forEach(r=>r.classList.toggle('sel',r.id==='r-'+key));
  const ev=EVID[t.reason](t);
  $('drawerBody').innerHTML=`<div class="key">${t.key} · ${t.team} · Sprint ${t.sprint}</div><h2>${t.title}</h2>
    <div class="facts">
      <div class="fact"><div class="l">Estimate</div><div class="v">${t.est} days</div></div>
      <div class="fact"><div class="l">Actual</div><div class="v">${t.actual} days <span style="color:var(--crit);font-size:12px">+${t.lost}</span></div></div>
      <div class="fact"><div class="l">State</div><div class="v">${t.blocked?'Flagged blocked':'Overran, not flagged'}</div></div>
      <div class="fact"><div class="l">Attribution</div><div class="v" style="display:flex;align-items:center;gap:8px"><i class="sw" style="background:${ATTR[t.attr]}"></i>${t.attr}</div></div>
    </div>
    <div class="l" style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)">Evidence trail</div>
    <div class="tl">${ev.map(e=>`<div class="ev"><div class="who"><span class="src">${e.src}</span><span>${e.who}</span></div><div class="msg">${e.msg}</div></div>`).join('')}</div>
    <div class="class"><div class="l">Classification</div><p><b>${t.reason}</b> · attributed to <b>${t.attr}</b>${t.prev?' · <b>preventable</b>: within our control':' · outside our control; '+(t.attr==='Partner'?'raised with partner account team':t.attr==='Client'?'logged against client-side change':'monitored')}</p><div class="conf">confidence 0.${88+parseInt(t.key.slice(-1))} · sources: ${[...new Set(ev.map(e=>e.src.split(' ·')[0]))].join(', ')}</div></div>`;
  $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden','false');
}
function closeDrawer(){$('drawer').classList.remove('open');$('drawer').setAttribute('aria-hidden','true');document.querySelectorAll('tr.row').forEach(r=>r.classList.remove('sel'))}

function renderActions(){
  const d=T.filter(t=>t.prev);
  const groups=[
    {r:'Lower environment contention',h:'Stand up dedicated lower environments for partner-integration QA',p:'Shared staging is held by whichever regression run got there first. A second environment reserved for partner-integration QA removes the queue entirely. Shipped in sprint 14; internal contention has dropped since.',st:'shipped',lbl:'Shipped · S14'},
    {r:'PR review latency',h:'Review SLA with a named backup reviewer per service',p:'Most stalled PRs had a single reviewer with context. A two-business-day SLA plus a rota of backup reviewers, surfaced by the delivery bot, keeps review from depending on one calendar.',st:'progress',lbl:'In progress'},
    {r:'Unclear requirements',h:'Requirements checklist at stage gate 2',p:'Tickets that went back to product mid-build share a pattern: edge cases missing from acceptance criteria. A short checklist at the gate catches them before estimation.',st:'progress',lbl:'In progress'},
    {r:'Test data unavailable',h:'Shared seed dataset for staging',p:'Engineers are building fixtures by hand for the same entitlements every sprint. One maintained seed set, refreshed with each schema change.',st:'proposed',lbl:'Proposed'},
    {r:'Production incident',h:'Config drift audit in the release checklist',p:'Two of the quarter\'s incidents traced to configuration drift between environments. A diff step at release catches it before it pages anyone.',st:'proposed',lbl:'Proposed'},
  ].map(g=>({...g,days:d.filter(t=>t.reason===g.r).reduce((a,t)=>a+t.lost,0),n:d.filter(t=>t.reason===g.r).length})).sort((a,b)=>b.days-a.days);
  $('actSub').textContent=`Grouped from ${d.length} internally-attributed impediments this quarter.`;
  $('actions').innerHTML=groups.map((g,i)=>`<div class="act"><div class="n">0${i+1}</div><div><h4>${g.h}</h4><p>${g.p}</p><span class="st ${g.st}"><i></i>${g.lbl}</span></div><div class="impact"><b>${g.days}<span style="font-size:12px;color:var(--ink-2);margin-left:2px">d</span></b><span>${g.n} impediments</span></div></div>`).join('');
  const max=groups[0].days;
  $('internalBars').innerHTML=groups.map(g=>`<div class="bar-row"><span class="lbl">${g.r}</span><span class="bar"><i style="width:${g.days/max*100}%"></i></span><span class="v">${g.days}d</span></div>`).join('');
  const before=T.filter(t=>t.prev&&t.sprint<=12).reduce((a,t)=>a+t.lost,0), after=T.filter(t=>t.prev&&t.sprint>=15).reduce((a,t)=>a+t.lost,0);
  const bm=Math.max(before,after);
  $('beforeAfter').innerHTML=`<div class="bar-row"><span class="lbl">Sprints 10–12</span><span class="bar"><i style="width:${before/bm*100}%;background:var(--ink-3)"></i></span><span class="v">${before}d</span></div>
    <div class="bar-row"><span class="lbl">Sprints 15–17</span><span class="bar"><i style="width:${after/bm*100}%"></i></span><span class="v">${after}d</span></div>
    <p style="font-size:13px;color:var(--ink-2);margin-top:12px">${Math.round((1-after/before)*100)}% fewer internally-caused days lost after the environment work. Partner and client causes are unchanged, which is the point: the platform separates what we can fix from what we can only escalate.</p>`;
}

/* tooltip */
const tip=$('tip');
document.addEventListener('mousemove',e=>{const el=e.target.closest('[data-tip]'); if(el){tip.innerHTML=el.dataset.tip;tip.style.opacity=1;const x=Math.min(e.clientX+14,window.innerWidth-280);tip.style.left=x+'px';tip.style.top=(e.clientY+14)+'px'}else tip.style.opacity=0});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});

render();
