// kurrent demo — UI logic. Data lives in /data/kurrent-data.js (loaded first).
/* ---------- state ---------- */
const STAGES=['New','Reviewing','Contacted','Meeting','Proposal','Placed'];
let stage='all', selected=null;
const $=id=>document.getElementById(id);
const SIG={hot:'Hot',warm:'Warm',new:'New'};
const CONTACT={verified:'Verified contact',partial:'Partial contact',none:'No contact'};

/* ---------- nav ---------- */
function go(p){
  document.querySelectorAll('.page').forEach(e=>e.classList.toggle('on',e.id==='p-'+p));
  document.querySelectorAll('[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
  closeDrawer(); window.scrollTo({top:0});
  if(p==='pipeline')renderPipeline(); if(p==='roles')renderRoles(); if(p==='briefing')renderBriefing();
}
function tab(btn,t){btn.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===btn));['market','briefs','reports'].forEach(x=>$('t-'+x).style.display=x===t?'block':'none')}
let tt; function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2200)}

/* ---------- briefing ---------- */
function renderBriefing(){
  const d=new Date(); $('briefDate').textContent='Your daily intelligence summary · '+d.toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric'});
  const newToday=leads.filter(l=>l.status==='New').length, contacted=leads.filter(l=>['Contacted','Meeting','Proposal'].includes(l.status)).length, meetings=leads.filter(l=>l.status==='Meeting').length;
  $('briefStats').innerHTML=`
    <div class="card stat"><div class="l">New leads today</div><div class="v num">${newToday}</div><div class="d">${leads.filter(l=>l.status==='New'&&l.contact==='verified').length} with verified contacts</div></div>
    <div class="card stat"><div class="l">Total pipeline</div><div class="v num">${leads.length + 24}</div><div class="d">${leads.length} shown in this demo</div></div>
    <div class="card stat"><div class="l">Contacted</div><div class="v num">${contacted+3}</div><div class="d">this week</div></div>
    <div class="card stat"><div class="l">Meetings</div><div class="v num">${meetings+2}</div><div class="d">booked this week</div></div>`;
  $('navCount').textContent=leads.length;
  const pri=[...leads].sort((a,b)=>(b.contact==='verified')-(a.contact==='verified')||(b.tag==='hot')-(a.tag==='hot')).slice(0,4);
  $('priority').innerHTML=pri.map(l=>`<div class="row" style="cursor:pointer" onclick="openLead(${l.id})"><div><div class="t">${l.company} <span style="font-weight:400;color:var(--ink-2)">— ${l.role.split(' — ')[0]}</span></div><div class="s"><span class="dot c-${l.contact}"></span> ${CONTACT[l.contact]}${l.contactName?': '+l.contactName:''} · ${l.location}</div></div><span class="pill ${l.tag}">${SIG[l.tag]}</span></div>`).join('');
  $('briefPlan').innerHTML=Object.entries(plan).map(([d,rs])=>`<div class="row"><div><div class="t"><span class="mono" style="display:inline-block;width:40px;color:var(--ink-3);font-size:11.5px">${d}</span>${rs.length?rs.join(' · '):'<span style="color:var(--ink-4);font-weight:400">No digest</span>'}</div></div><span class="s num">${rs.length?'~'+rs.reduce((a,r)=>a+(POOL.find(x=>x.name===r)||{n:0}).n,0)+' leads · 07:00':'—'}</span></div>`).join('');
}

/* ---------- pipeline ---------- */
function renderPipeline(){
  const q=($('q').value||'').toLowerCase(), fc=$('fContact').value;
  const counts={all:leads.length}; STAGES.forEach(s=>counts[s]=leads.filter(l=>l.status===s).length);
  $('stageSeg').innerHTML=['all',...STAGES].map(s=>`<button class="${stage===s?'on':''}" onclick="stage='${s}';renderPipeline()">${s==='all'?'All':s}${counts[s]?` <span class="mono" style="font-size:10.5px;opacity:.7">${counts[s]}</span>`:''}</button>`).join('');
  const d=leads.filter(l=>(stage==='all'||l.status===stage)&&(fc==='all'||l.contact===fc)&&(!q||(l.company+' '+l.role).toLowerCase().includes(q)));
  const fee=d.reduce((a,l)=>a+parseInt(l.fee.replace(/\D/g,'')),0);
  $('pipeSub').textContent=`${d.length} leads · $${fee.toLocaleString()} projected fees`;
  const stageSel=l=>`<select class="select" style="padding:5px 26px 5px 8px;font-size:12px;width:auto" onclick="event.stopPropagation()" onchange="setStage(${l.id},this.value)">${STAGES.map(s=>`<option ${s===l.status?'selected':''}>${s}</option>`).join('')}</select>`;
  $('tbody').innerHTML=d.length?d.map(l=>`<tr class="lead ${selected===l.id?'sel':''}" onclick="openLead(${l.id})">
    <td><div class="co">${l.company}</div><div class="ro">${l.role}</div></td>
    <td><span class="pill ${l.tag}">${SIG[l.tag]}</span></td>
    <td><span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px"><span class="dot c-${l.contact}"></span>${l.contactName||CONTACT[l.contact]}</span></td>
    <td>${stageSel(l)}</td>
    <td style="font-size:12.5px;color:var(--ink-2)">${l.location}</td>
    <td class="num" style="text-align:right;font-weight:600">${l.fee}</td>
    <td class="num" style="text-align:right;color:var(--ink-3);font-size:12.5px">${l.openWeeks||'new'}</td></tr>`).join(''):`<tr><td colspan="7" style="text-align:center;color:var(--ink-3);padding:28px">No leads match.</td></tr>`;
  $('leadcards').innerHTML=d.length?d.map(l=>`<div class="leadcard" onclick="openLead(${l.id})">
    <div class="top"><div><div class="co">${l.company}</div><div class="ro">${l.role}</div></div><span class="pill ${l.tag}">${SIG[l.tag]}</span></div>
    <div class="meta"><span><span class="dot c-${l.contact}"></span> ${l.contactName||CONTACT[l.contact]}</span><span>${l.location}</span><span class="fee num">${l.fee}</span><span class="pill grey" style="margin-left:auto">${l.status}</span></div></div>`).join(''):`<div class="card" style="padding:28px;text-align:center;color:var(--ink-3)">No leads match.</div>`;
}
function setStage(id,s){const l=leads.find(x=>x.id===id);l.status=s;renderPipeline();toast(`${l.company} moved to ${s}`)}

/* ---------- drawer ---------- */
function openLead(id){
  const l=leads.find(x=>x.id===id); if(!l)return; selected=id; renderPipeline();
  $('drawerBody').innerHTML=`<div class="dh"><div><div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><span class="pill ${l.tag}">${SIG[l.tag]}</span><span class="pill grey">${l.status}</span></div><h2>${l.company}</h2><p>${l.role} · ${l.location}</p></div><button class="x" onclick="closeDrawer()" aria-label="Close"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div class="db">
    <div class="facts">
      <div class="fact"><div class="l">Salary</div><div class="v">${l.salary}</div></div>
      <div class="fact"><div class="l">Est. fee</div><div class="v num">${l.fee}</div></div>
      <div class="fact"><div class="l">Time to fill</div><div class="v">${l.ttf}</div></div>
      <div class="fact"><div class="l">Company size</div><div class="v">${l.size}</div></div>
      <div class="fact"><div class="l">Competing postings</div><div class="v num">${l.competing}</div></div>
      <div class="fact"><div class="l">Talent pool</div><div class="v num">${l.talent} profiles</div></div>
    </div>
    <div class="sec"><h4>Hiring contact</h4>
      <div class="row" style="border:none;padding:0"><div><div class="t" style="display:flex;align-items:center;gap:8px"><span class="dot c-${l.contact}"></span>${l.contactName||CONTACT[l.contact]}</div><div class="s">${l.contactTitle||(l.contact==='none'?'Not yet identified; research their TA team':'Department-level contact only')}${l.contactEmail?' · <span class="mono">'+l.contactEmail+'</span>':''}</div></div>${l.contact==='verified'?'<button class="btn sm" onclick="toast(\'Contact copied\')">Copy</button>':'<button class="btn sm ghost" onclick="toast(\'Enrichment queued\')">Find contact</button>'}</div></div>
    <div class="sec"><div class="insight"><div class="l"><svg class="i" style="width:12px;height:12px" viewBox="0 0 24 24"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>Kurrent insight</div>${l.insight}</div></div>
    <div class="sec"><h4>Matched candidates <span class="num" style="letter-spacing:0;text-transform:none">${l.candidates.length} of ${l.talent}</span></h4>
      ${l.candidates.map(c=>`<div class="cand"><span class="rk">${c.rank}</span><div><div class="n">${c.name}</div><div class="h">${c.headline}</div></div><div class="sc"><b>${c.score}</b><span>${c.signal}</span></div></div>`).join('')}</div>
    <div class="sec"><h4>Notes</h4><div id="notes-${l.id}">${l.notes.length?l.notes.map(n=>noteHtml(n)).join(''):'<div style="font-size:13px;color:var(--ink-3)">No notes yet.</div>'}</div>
      <form class="noteform" onsubmit="return addNote(event,${l.id})"><input class="input" id="nf-${l.id}" placeholder="Add a note…"><button class="btn primary" type="submit">Add</button></form></div>
    <div class="actions"><button class="btn primary" onclick="toast('Lead report queued for ${l.company.replace(/'/g,'')}')">Generate report</button><button class="btn" onclick="toast('Opens the original posting')">View posting</button><button class="btn ghost wide" onclick="archive(${l.id})">Archive lead</button></div>
  </div>`;
  $('drawer').classList.add('on');$('drawer').setAttribute('aria-hidden','false');$('scrim').classList.add('on');
}
function noteHtml(n){return `<div class="note"><span class="av">${n.user}</span><div><div class="w">${n.name} · ${n.time}</div><div class="m">${n.text}</div></div></div>`}
function addNote(e,id){e.preventDefault();const i=$('nf-'+id);const v=i.value.trim();if(!v)return false;const l=leads.find(x=>x.id===id);const n={user:'DU',name:'Demo User',time:'just now',text:v};l.notes.push(n);const box=$('notes-'+id);if(l.notes.length===1)box.innerHTML='';box.insertAdjacentHTML('beforeend',noteHtml(n));i.value='';return false}
function archive(id){const i=leads.findIndex(x=>x.id===id);const l=leads[i];leads.splice(i,1);closeDrawer();renderPipeline();renderBriefing();toast(`${l.company} archived`)}
function closeDrawer(){$('drawer').classList.remove('on');$('drawer').setAttribute('aria-hidden','true');$('scrim').classList.remove('on');selected=null;document.querySelectorAll('tr.lead').forEach(r=>r.classList.remove('sel'))}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});

/* ---------- intelligence ---------- */
const BENCH=[['Senior Structural Engineer','Toronto, ON · Director level',120,155,'+8% YoY'],['Civil Engineer','Toronto & Ottawa · Manager level',90,115,'+5% YoY'],['Legal Assistant','Toronto, ON · IC level',48,68,'+3% YoY'],['Senior Product Manager','Toronto, ON · Director level',160,200,'+12% YoY']];
$('bench').innerHTML=BENCH.map(([r,s,lo,hi,y])=>`<div class="bench"><div class="t"><b>${r}</b><span class="yoy">${y}</span></div><div class="s">${s}</div><div class="bar"><i style="left:${lo/220*100}%;width:${(hi-lo)/220*100}%"></i></div><div class="rng"><span>$${lo}K</span><span>$${hi}K</span></div></div>`).join('');
const COMP=[['Engineering & construction',[['Northgate Engineering',5],['Meridian Infrastructure',4],['Prairie Civil Group',3]]],['Legal',[['Calder Whitmore LLP',4],['Ashford & Vale LLP',3],['Bellamy Rowe LLP',2]]],['Technology',[['Lumen Commerce',6],['Northlight Financial',2]]]];
$('comp').innerHTML=COMP.map(([g,rows])=>`<div style="margin-bottom:12px"><div class="mono" style="font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:4px">${g}</div>${rows.map(([c,n])=>`<div class="row" style="padding:7px 0"><span class="t" style="font-weight:500">${c}</span><span class="num" style="font-size:12.5px;color:var(--ink-2)">${n} active posting${n>1?'s':''}</span></div>`).join('')}</div>`).join('');
function genBrief(){
  const co=$('bCo').value.trim(); if(!co){$('bCo').focus();toast('Name the target company first');return}
  const b=$('bGen'),p=$('bProg'),st=$('bStatus'); b.disabled=true;b.textContent='Generating…';p.style.display='block';const bar=p.querySelector('i');
  const steps=[['Pulling competitor postings…',25],['Benchmarking salaries…',50],['Scoring talent scarcity…',75],['Rendering branded PDF…',95]]; let i=0;
  const tick=()=>{if(i<steps.length){st.textContent=steps[i][0];bar.style.width=steps[i][1]+'%';i++;setTimeout(tick,700)}else{bar.style.width='100%';st.textContent='Ready. Added to recent briefs.';b.disabled=false;b.textContent='Generate brief';
    $('briefRows').insertAdjacentHTML('afterbegin',`<tr><td>${$('bInd').value}</td><td>${co}</td><td>${$('bLoc').value}</td><td>Just now</td><td><span class="pill new">Ready</span></td><td><button class="btn sm">View PDF</button></td></tr>`);
    setTimeout(()=>{p.style.display='none';bar.style.width='0';st.textContent='Typically generates in 30–60 seconds'},2500)}};
  tick();
}

/* ---------- roles & digest ---------- */
const POOL=[{name:'Structural Engineer',sen:['IC','Manager','Director'],on:'IC',loc:['Toronto, ON','Ottawa, ON'],n:9},{name:'Civil Engineer',sen:['IC','Manager','Director'],on:'Manager',loc:['Toronto, ON'],n:6},{name:'Legal Assistant',sen:['IC','Manager'],on:'IC',loc:['Toronto, ON'],n:7},{name:'Paralegal',sen:['IC','Manager'],on:'IC',loc:['Toronto, ON','Mississauga, ON'],n:4}];
const PLAN_DEFAULT={Mon:['Structural Engineer','Civil Engineer'],Tue:['Legal Assistant','Paralegal'],Wed:['Structural Engineer'],Thu:['Legal Assistant'],Fri:['Civil Engineer','Paralegal']};
let plan=JSON.parse(JSON.stringify(PLAN_DEFAULT));
function renderRoles(){
  const locs=new Set(POOL.flatMap(r=>r.loc)); $('poolTxt').textContent=`${POOL.length} / 12 roles · ${locs.size} / 3 locations`; $('poolBar').style.width=(POOL.length/12*100)+'%';
  $('roleCards').innerHTML=POOL.map((r,i)=>`<div class="role"><div class="rh"><b>${r.name}</b><button class="btn sm ghost" onclick="removeRole(${i})">Remove</button></div>
    <div class="rr"><span>Seniority</span><div class="chips">${r.sen.map(s=>`<button class="chip ${s===r.on?'on':''}" onclick="POOL[${i}].on='${s}';renderRoles()">${s}</button>`).join('')}</div></div>
    <div class="rr"><span>Locations</span><div class="chips">${r.loc.map(l=>`<span class="chip loc">${l}<i>×</i></span>`).join('')}<button class="chip" style="border-style:dashed" onclick="toast('Location picker (demo)')">+ Add</button></div></div></div>`).join('');
  const days=Object.keys(plan);
  $('planGrid').innerHTML=days.map(d=>{const rest=POOL.map(r=>r.name).filter(r=>!plan[d].includes(r));
    return `<div class="day"><div class="dn">${d}</div>${plan[d].map(r=>`<button class="r" onclick="plan['${d}']=plan['${d}'].filter(x=>x!=='${r}');renderRoles()"><span style="color:var(--ink)">${r}</span><span>×</span></button>`).join('')}${plan[d].length?'':'<div style="font-size:12px;color:var(--ink-4);padding:4px 2px">No digest</div>'}${rest.length?`<select onchange="if(this.value){plan['${d}'].push(this.value);renderRoles()}"><option value="">+ Add role</option>${rest.map(r=>`<option>${r}</option>`).join('')}</select>`:''}</div>`}).join('');
}
function removeRole(i){const r=POOL.splice(i,1)[0];Object.keys(plan).forEach(d=>plan[d]=plan[d].filter(x=>x!==r.name));renderRoles();toast(`${r.name} removed`)}
function addRole(){const opts=['Project Manager','Product Designer','Safety Coordinator','Estimator'].filter(n=>!POOL.find(r=>r.name===n));if(!opts.length||POOL.length>=12){toast('Role pool full');return}POOL.push({name:opts[0],sen:['IC','Manager'],on:'IC',loc:['Toronto, ON'],n:5});renderRoles();toast(`${opts[0]} added`)}
function resetPlan(){plan=JSON.parse(JSON.stringify(PLAN_DEFAULT));renderRoles();toast('Changes discarded')}

/* ---------- analytics ---------- */
const FUN=[['New leads',47],['Reviewing',34],['Contacted',25],['Meeting',12],['Proposal',6],['Placed',3]];
$('funnel').innerHTML=FUN.map(([l,n],i)=>`<div class="fr"><span class="lbl">${l}</span><div class="bar"><i style="width:${n/47*100}%">${n}</i></div><span class="pc">${i?Math.round(n/47*100)+'%':''}</span></div>`).join('');


/* ---------- engine ---------- */
const STG=[
 ['Discover postings','Query job boards and career pages for every role–location pair in the role pool.','boards','postings'],
 ['Deduplicate & verify','Collapse reposts and aggregator copies; drop ghost postings and staffing-agency listings.','rules','unique roles'],
 ['Enrich company','Firmographics: size, sector, HQ, funding signals, hiring velocity.','enrichment','profile'],
 ['Detect signal','Score urgency and repeat potential from posting age, volume and language.','model','HOT / WARM / NEW'],
 ['Find decision-makers','Identify the talent-acquisition owner and hiring manager for the role.','people data','contacts'],
 ['Verify contact','Validate email pattern and deliverability; mark verified / partial / none.','verification','status'],
 ['Match talent','Score candidates in the agency\'s own pool and public profiles against the role.','matching','ranked shortlist'],
 ['Benchmark market','Salary range, competing postings, time to fill for the role and city.','market data','benchmarks'],
 ['Write the insight','Synthesise everything into the two-sentence take a recruiter reads first.','LLM','insight'],
 ['Deliver','Write to the pipeline, render the lead report PDF, queue the morning digest.','portal · pdf · email','digest'],
];
const ENG_RUNS={
 'Northgate Engineering':[['142 postings across 4 boards · 6 career pages','142'],['118 unique · 24 reposts dropped · 3 ghost postings flagged','118'],['Northgate Engineering · 10,000+ · engineering services · Toronto HQ · +38% postings QoQ','done'],['Senior Structural Engineer: 23 competing postings, open 5 wks, multi-hire language → HOT','HOT'],['Maria R. — Director of Talent Acquisition · 2 secondary contacts','3 found'],['m.r***@northgate-eng.com · pattern match 2/2 · deliverable','verified'],['James K. 94% · Nina T. 82% · David L. 77% (from 142 profiles)','3 ranked'],['$120K–$155K · +8% YoY · 45–60 days to fill','done'],['"Strong demand for structural engineers … multi-hire campaign … repeat potential."','1 insight'],['Lead DLV-1 written · report PDF rendered (2 pages) · digest queued 07:00','delivered']],
 'Bellamy Rowe LLP':[['61 postings across 4 boards · 2 career pages','61'],['54 unique · 7 reposts dropped','54'],['Bellamy Rowe LLP · 1,200+ · legal · Toronto · 4 practice groups hiring','done'],['Legal Assistant: 3 practice groups, verified contact, fast fill history → HOT','HOT'],['Hiring Team inbox · 1 named recruiter','2 found'],['hiring@ pattern verified · deliverable','verified'],['4 legal assistants matched from agency pool (best 88%)','4 ranked'],['$48K–$68K · +3% YoY · 25–35 days','done'],['"Hiring across multiple practice groups … act fast on verified contacts."','1 insight'],['Lead DLV-8 written · report rendered · digest queued','delivered']],
 'Lumen Commerce':[['210 postings across 4 boards · 1 career page','210'],['96 unique · 114 aggregator copies dropped','96'],['Lumen Commerce · 8,000+ · e-commerce · Toronto expansion · director-level PM hiring','done'],['Senior Product Manager: 31 competing postings, $36K fee, scarce talent → HOT','HOT'],['TA lead identified · title only, no email yet','1 partial'],['No verified address · pattern candidates queued for enrichment','partial'],['Priya S. 89% (commerce/payments) · 1 further possible','2 ranked'],['$160K–$200K · +12% YoY · 40–55 days','done'],['"Director-level product talent with e-commerce experience is extremely scarce … competitive search."','1 insight'],['Lead DLV-10 written · report rendered · digest queued','delivered']],
 'Halcyon Build Corp.':[['88 postings across 4 boards · 3 career pages','88'],['70 unique · 18 reposts dropped','70'],['Halcyon Build Corp. · 5,000+ · commercial construction · Mississauga · new project wins','done'],['Project Manager: new postings, no history with agency → NEW','NEW'],['No TA contact surfaced · HR generic only','0 found'],['No address to verify · flagged for LinkedIn research','none'],['Michael P. 88% · Rachel W. 74%','2 ranked'],['$95K–$130K · +4% YoY · 30–45 days','done'],['"PM hiring signals new project wins … no verified contact yet."','1 insight'],['Lead DLV-2 written · report rendered · digest queued','delivered']],
};
let engTimer=null, engStart=0;
function renderStages(){$('stages').innerHTML=STG.map((s,i)=>`<div class="stg" id="stg${i}"><span class="n">${i+1}</span><div><div class="t">${s[0]}<span class="src">${s[2]}</span></div><div class="d">${s[1]}</div></div><span class="out" id="out${i}">${s[3]}</span></div>`).join('')}
function resetEngine(){clearTimeout(engTimer);renderStages();$('log').innerHTML='<span class="g">— press Run a cycle —</span>';$('logSub').textContent='Nothing running';$('engClock').textContent='idle';$('engRun').disabled=false;$('engRun').textContent='Run a cycle'}
function runEngine(){
  resetEngine(); const co=$('engCo').value, run=ENG_RUNS[co]; const log=$('log'); log.innerHTML=''; $('engRun').disabled=true;$('engRun').textContent='Running…';$('logSub').textContent='Cycle for '+co; engStart=Date.now();
  const clock=()=>{$('engClock').textContent=((Date.now()-engStart)/1000).toFixed(1)+'s'};
  let i=0; const step=()=>{ clock();
    if(i>0){const p=$('stg'+(i-1));p.classList.remove('run');p.classList.add('done');$('out'+(i-1)).textContent=run[i-1][1];}
    if(i>=STG.length){log.insertAdjacentHTML('beforeend',`<span class="ok">✓ cycle complete in ${((Date.now()-engStart)/1000).toFixed(1)}s · ${co} is in the pipeline</span>\n`);log.scrollTop=log.scrollHeight;$('engRun').disabled=false;$('engRun').textContent='Run again';$('logSub').textContent='Finished · '+co;return;}
    $('stg'+i).classList.add('run'); $('stg'+i).scrollIntoView({block:'nearest',behavior:'smooth'});
    log.insertAdjacentHTML('beforeend',`<span class="g">${String(i+1).padStart(2,'0')}</span> <span class="k">${STG[i][0].toLowerCase()}</span>  ${run[i][0]}\n`); log.scrollTop=log.scrollHeight;
    i++; engTimer=setTimeout(step, 550+Math.random()*450);
  }; step();
}
renderStages();

renderBriefing(); renderPipeline(); renderRoles();
