// codebase demo — UI logic. Data lives in /data/codebase-data.js (loaded first).
/* ---------- state ---------- */
let role='Sales', busy=false;
const $=id=>document.getElementById(id);

function renderRoles(){
  $('roles').innerHTML=Object.keys(ROLES).map(r=>`<button class="item ${r===role?'on':''}" onclick="setRole('${r}')"><span class="av">${r.slice(0,2).toUpperCase()}</span><span>${r}<small>${ROLES[r].sub}</small></span></button>`).join('');
  $('skills').innerHTML=ROLES[role].skills.map(s=>`<div class="skill"><i></i>${s}<span class="mono">skill</span></div>`).join('');
  $('roleTitle').textContent=`Ask the codebase as ${role}`; $('roleSub').textContent=ROLES[role].sub; $('ctxRole').textContent=role;
  $('sugg').innerHTML=ROLES[role].qs.map((x,i)=>`<button onclick="askCanned(${i})">${x.q}</button>`).join('');
}
function setRole(r){ if(busy)return; role=r; $('side').classList.remove('open'); renderRoles();
  $('thread').innerHTML=''; addAI(`<p>Context switched to <b>${r}</b>. Answers now use the skills and vocabulary for that role, over the same indexed code.</p>`,[],[],true); }

function addUser(t){ const d=document.createElement('div'); d.className='msg user'; d.innerHTML=`<div class="who">YOU</div><div class="bubble">${t}</div>`; $('thread').appendChild(d); scroll(); }
function addAI(html,cites,nodes,instant){
  const d=document.createElement('div'); d.className='msg ai';
  d.innerHTML=`<div class="who"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14102a" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg></div><div style="min-width:0;flex:1"><div class="bubble">${instant?html:'<div class="typing"><i></i><i></i><i></i></div>'}</div></div>`;
  $('thread').appendChild(d); scroll();
  const b=d.querySelector('.bubble');
  const finish=()=>{ b.innerHTML=html+(cites.length?`<div class="cites">${cites.map(c=>`<span class="cite" onclick="citeClick('${c}')"><i></i>${c}</span>`).join('')}</div>`:'');
    if(cites.length){const m=document.createElement('div'); m.className='meta'; m.textContent=`grounded in ${cites.length} source${cites.length===1?'':'s'} · role: ${role.toLowerCase()} · ${(0.6+Math.random()*1.4).toFixed(1)}s`; b.parentNode.appendChild(m);}
    highlight(nodes); busy=false; scroll(); };
  if(instant){finish();} else {busy=true; setTimeout(finish,700+Math.min(1400,html.length/6));}
}
function scroll(){ const t=$('thread'); requestAnimationFrame(()=>t.scrollTop=t.scrollHeight); }
function askCanned(i){ if(busy)return; const x=ROLES[role].qs[i]; addUser(x.q); addAI(x.a,x.c,x.nodes); }
function ask(e){ e.preventDefault(); if(busy)return false; const v=$('q').value.trim(); if(!v)return false; $('q').value='';
  addUser(v.replace(/</g,'&lt;'));
  const all=Object.values(ROLES).flatMap(r=>r.qs); const words=v.toLowerCase().split(/\W+/).filter(w=>w.length>3);
  let best=null,score=0; all.forEach(x=>{const s=words.filter(w=>x.q.toLowerCase().includes(w)||x.a.toLowerCase().includes(w)).length; if(s>score){score=s;best=x}});
  const svc=Object.keys(S).find(k=>v.toLowerCase().includes(S[k].n.toLowerCase().split(' ')[0].toLowerCase()));
  if(score>=2) addAI(best.a,best.c,best.nodes);
  else if(svc){const s=S[svc]; addAI(`<p><b>${s.n}</b> (<code>${s.p}</code>) — ${s.d}</p><p>Owned by ${s.own}. ${s.dep.length?'Depends on '+s.dep.map(k=>'<code>'+S[k].n+'</code>').join(', ')+'.':'No runtime dependencies; it is a leaf.'} ${depOn(svc).length?'Called by '+depOn(svc).map(k=>'<code>'+S[k].n+'</code>').join(', ')+'.':''}</p>`,[s.p+'/service.yaml',s.p+'/README.md'],[svc,...s.dep]);}
  else addAI(FALLBACK.a,FALLBACK.c,FALLBACK.nodes);
  return false; }
function citeClick(c){ const k=Object.keys(S).find(k=>c.startsWith(S[k].p.split('/')[1])); if(k)selectNode(k); if(window.innerWidth<=1180)$('right').classList.add('open'); }
function depOn(k){ return Object.keys(S).filter(x=>S[x].dep.includes(k)); }

/* ---------- map ---------- */
function renderMap(){
  const W=340,H=312; let edges='',nodes='';
  Object.keys(S).forEach(a=>S[a].dep.forEach(b=>{const [x1,y1]=POS[a],[x2,y2]=POS[b];edges+=`<path class="edge" data-e="${a}-${b}" d="M${x1},${y1} C${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2}"/>`}));
  Object.keys(S).forEach(k=>{const [x,y]=POS[k]; const w=Math.max(58,S[k].n.length*5.6+16); nodes+=`<g class="node" data-n="${k}" onclick="selectNode('${k}')" transform="translate(${x-w/2},${y-11})"><rect width="${w}" height="22"/><text x="${w/2}" y="14.5" text-anchor="middle">${S[k].n}</text>${S[k].h!=='ok'?`<circle cx="${w-5}" cy="5" r="3" fill="${S[k].h==='bad'?'var(--rose)':'var(--amber)'}"/>`:''}</g>`});
  $('map').innerHTML=`<svg viewBox="0 0 ${W} ${H}">${edges}${nodes}</svg>`;
}
function highlight(nodes){ document.querySelectorAll('.node').forEach(n=>n.classList.toggle('hi',nodes.includes(n.dataset.n)));
  document.querySelectorAll('.edge').forEach(e=>{const [a,b]=e.dataset.e.split('-');e.classList.toggle('hi',nodes.includes(a)&&nodes.includes(b))}); }
function selectNode(k){ const s=S[k]; document.querySelectorAll('.node').forEach(n=>n.classList.toggle('sel',n.dataset.n===k));
  const hl={ok:['h-ok','healthy'],warn:['h-warn','elevated retries · 24h'],bad:['h-bad','partner sandbox degraded']}[s.h];
  $('detail').innerHTML=`<h4>${s.n} <span class="health ${hl[0]}"><i></i>${hl[1]}</span></h4><div class="path">${s.p} · owner: ${s.own}</div><p>${s.d}</p>
    <div class="kv"><div class="k">Depends on</div><div class="v">${s.dep.length?s.dep.map(d=>`<span onclick="selectNode('${d}')">${S[d].n}</span>`).join(''):'<span style="cursor:default;color:var(--ink-3)">none · leaf service</span>'}</div>
    <div class="k">Called by</div><div class="v">${depOn(k).length?depOn(k).map(d=>`<span onclick="selectNode('${d}')">${S[d].n}</span>`).join(''):'<span style="cursor:default;color:var(--ink-3)">external only</span>'}</div>
    <div class="k">Ask</div><div class="v"><span onclick="askAbout('${k}')">Explain this service →</span></div></div>`; }
function askAbout(k){ if(busy)return; $('q').value=`What does ${S[k].n} do?`; $('q').form.requestSubmit(); if(window.innerWidth<=1180)$('right').classList.remove('open'); }

renderRoles(); renderMap(); selectNode('activation');
addAI(`<p>I'm Atlas. I've indexed the platform's eleven services, their architecture decision records and runbooks. Ask me what something does, how two systems connect, or why something broke, and I'll answer from the code and cite what I read.</p><p>Pick a role on the left to change the vocabulary and the skills I use. Try one of the questions below to start.</p>`,[],['activation'],true);
