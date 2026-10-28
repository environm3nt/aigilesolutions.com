// Home page behaviour: scroll reveals, hero pipeline cycle, contact form, nav state, hash scroll.
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:0.05});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));


const PF=[['Discover postings','142'],['Deduplicate & verify','118'],['Enrich company','done'],['Detect signal','HOT'],['Find decision-makers','3 found'],['Verify contact','verified'],['Match talent','3 ranked'],['Benchmark market','done'],['Write the insight','1 insight'],['Deliver','delivered']];
const PFL=['142 postings across 4 boards · 6 career pages','118 unique · 24 reposts dropped · 3 ghost postings','Northgate Engineering · 10,000+ · +38% postings QoQ','23 competing postings, open 5 wks → HOT','Maria R. — Director of Talent Acquisition','m.r***@northgate-eng.com · deliverable','James K. 94% · Nina T. 82% · David L. 77%','$120K–$155K · +8% YoY · 45–60 days','"Multi-hire campaign … repeat potential."','Lead written · PDF rendered · digest queued 07:00'];
const st=document.getElementById('pfStages'), lg=document.getElementById('pfLog'), ck=document.getElementById('pfClock');
if(st){ st.innerHTML=PF.map((p,i)=>`<li><span class="n">${i+1}</span>${p[0]}<span class="o">${p[1]}</span></li>`).join('');
  let i=0,t0=Date.now(); const items=[...st.children];
  const step=()=>{ if(i>0){items[i-1].classList.remove('run');items[i-1].classList.add('done')}
    if(i>=PF.length){lg.innerHTML=`<span class="ok">✓ cycle complete in ${((Date.now()-t0)/1000).toFixed(1)}s</span>`;setTimeout(()=>{items.forEach(x=>x.classList.remove('done','run'));i=0;t0=Date.now();lg.innerHTML='';step()},2600);return}
    items[i].classList.add('run'); ck.textContent=((Date.now()-t0)/1000).toFixed(1)+'s';
    lg.innerHTML=`<span class="k">${String(i+1).padStart(2,'0')} ${PF[i][0].toLowerCase()}</span>\n${PFL[i]}`; i++; setTimeout(step,520+Math.random()*380)};
  step(); }



/* impediment mini */
const IMPB=[['Partner sandbox outage',32,'#C98500'],['Waiting on client sign-off',19,'#199E70'],['Lower environment contention',13,'#9085E9'],['PR review latency',12,'#9085E9']];
const ib=document.getElementById('impBars'); if(ib){ib.innerHTML=IMPB.map(([l,n,c])=>`<div class="r"><span>${l}</span><span class="b"><i data-w="${n/32*100}" style="background:${c}"></i></span><span class="v">${n}</span></div>`).join('')}
function runImp(){ if(!ib)return; ib.querySelectorAll('i').forEach(i=>i.style.width='0'); document.querySelectorAll('.p-imp .cnt').forEach(c=>c.textContent='0'); const sb=document.querySelector('.stack-bar'); sb.classList.remove('go'); document.querySelectorAll('.imp-kpis div').forEach(d=>d.classList.remove('hi'));
  setTimeout(()=>{document.querySelectorAll('.p-imp .cnt').forEach((c,k)=>setTimeout(()=>{const to=+c.dataset.to,t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/1800);c.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)},k*350))},300);
  setTimeout(()=>{ib.querySelectorAll('i').forEach((i,k)=>setTimeout(()=>i.style.width=i.dataset.w+'%',k*450))},1600);
  setTimeout(()=>sb.classList.add('go'),3900); setTimeout(()=>document.querySelectorAll('.imp-kpis div')[2].classList.add('hi'),5400)}
/* atlas mini */
const AT_NODES_P={gw:[85,16,'Gateway'],act:[85,64,'Activation'],prov:[42,116,'Provisioning'],inv:[130,116,'Inventory'],part:[42,170,'Partner adapter'],bill:[130,170,'Billing'],notif:[85,216,'Notifications']};
const AT_NODES_L={gw:[38,59,'Gateway'],act:[108,59,'Activation'],prov:[186,22,'Provisioning'],inv:[186,96,'Inventory'],part:[272,22,'Partner adapter'],bill:[272,96,'Billing'],notif:[272,59,'Notifications']};
let AT_NODES=AT_NODES_P;
const AT_EDGES=[['gw','act'],['act','prov'],['act','inv'],['prov','part'],['act','bill'],['inv','part'],['act','notif'],['bill','notif']];
const am=document.getElementById('atMap'); function buildMap(){ const L=matchMedia('(max-width:760px)').matches; AT_NODES=L?AT_NODES_L:AT_NODES_P; am.setAttribute('viewBox',L?'0 0 320 118':'0 0 170 230'); am.innerHTML=AT_EDGES.map(([a,b])=>`<line class="e" data-e="${a}-${b}" x1="${AT_NODES[a][0]}" y1="${AT_NODES[a][1]}" x2="${AT_NODES[b][0]}" y2="${AT_NODES[b][1]}"/>`).join('')+Object.entries(AT_NODES).map(([k,[x,y,l]])=>{const w=l.length*4.6+14;return `<g class="n" data-n="${k}"><rect x="${x-w/2}" y="${y-9}" width="${w}" height="18"/><text x="${x}" y="${y+3}" text-anchor="middle">${l}</text></g>`}).join('')} if(am){buildMap(); let rt; addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(buildMap,200)})}
const AT_Q="Why did activations fail between 09:10 and 09:40 on Tuesday?";
const AT_A=[`Root cause is in <code>partner-adapter</code>: the sandbox returned 503 from 09:08.`,`<code>provisioning</code> treats that as terminal, not retryable, so the saga failed. Two-line fix.`];
function runAtlas(){ const q=document.getElementById('atQ'),a=document.getElementById('atA'); if(!q)return; q.textContent='';a.innerHTML='';document.querySelectorAll('.at-map .n,.at-map .e').forEach(e=>e.classList.remove('hi'));
  let i=0; const type=()=>{if(i<AT_Q.length){q.textContent+=AT_Q[i++];setTimeout(type,28)}else{setTimeout(()=>{a.innerHTML=AT_A.map(t=>`<p>${t}</p>`).join('')+`<div class="cites"><span>partner-adapter/src/retry.ts</span><span>provisioning/src/errors.ts#L41</span></div>`;[...a.querySelectorAll('p')].forEach((p,k)=>setTimeout(()=>p.classList.add('in'),300+k*500));setTimeout(()=>a.querySelector('.cites').classList.add('in'),1900);['act','prov','part'].forEach((n,k)=>setTimeout(()=>document.querySelector(`.at-map .n[data-n="${n}"]`).classList.add('hi'),600+k*400));['act-prov','prov-part'].forEach((e,k)=>setTimeout(()=>document.querySelector(`.at-map .e[data-e="${e}"]`).classList.add('hi'),800+k*400))},500)}}; type(); }

const CAPS=['Three things I built · KURRENT, shipped for a staffing agency in two weeks','Three things I built · Impediment Intelligence, award-winning internal platform','Three things I built · codebase intelligence, generic rebuild of an internal tool'];
let cur=0; const panels=[...document.querySelectorAll('.panel')], dots=[...document.querySelectorAll('#dots i')];
let heroPaused=false; const hp=document.querySelector('.hero-product'); if(hp){hp.addEventListener('mouseenter',()=>heroPaused=true);hp.addEventListener('mouseleave',()=>heroPaused=false)}
if(panels.length && !matchMedia('(prefers-reduced-motion: reduce)').matches){ setInterval(()=>{if(heroPaused||document.hidden)return;cur=(cur+1)%panels.length;panels.forEach((p,i)=>p.classList.toggle('on',i===cur)); if(cur===1)runImp(); if(cur===2)runAtlas();dots.forEach((d,i)=>d.classList.toggle('on',i===cur));const c=document.getElementById('capText');c.style.opacity=0;setTimeout(()=>{c.textContent=CAPS[cur];c.style.opacity=1},400)},9000); }

function toggleNav(force){
  const nav=document.getElementById('nav');
  const open = typeof force==='boolean' ? force : !nav.classList.contains('open');
  nav.classList.toggle('open',open);
  nav.querySelector('.nav-toggle').setAttribute('aria-expanded',open?'true':'false');
}

async function sendNote(ev){
  ev.preventDefault();
  if(document.getElementById('f-bot').checked) return false;
  const n=document.getElementById('f-name').value.trim();
  const em=document.getElementById('f-email').value.trim();
  const w=document.getElementById('f-what').value.trim();
  const s=document.getElementById('f-stand').value.trim();
  const btn=document.getElementById('f-submit');
  const note=document.getElementById('form-note');
  btn.disabled=true; btn.textContent='Sending…'; note.textContent='';
  try{
    const r=await fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        access_key:'ff402504-543b-4663-ba4a-ad3cd1cf27b7',
        subject:'Inquiry via aigilesolutions.com — '+n,
        name:n,
        email:em,
        'What are you building or hiring for':w,
        'Where does it stand':s
      })
    });
    const d=await r.json();
    if(!d.success) throw new Error(d.message||'send failed');
    document.getElementById('contact-form').innerHTML='<div class="sent" role="status"><div class="sent-head"><span class="sent-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="mono">Sent</span></div><p class="sent-msg">Got it, '+n.split(' ')[0].replace(/[<>]/g,'')+'. Your note is in my inbox.</p><p class="sent-sub">I read every one and reply within two business days. If it\'s urgent, the email address below reaches me faster.</p></div>';
  }catch(e){
    btn.disabled=false; btn.textContent='Send the note';
    note.textContent='Something went wrong on the network, nothing lost. Email me directly: sarah@aigilebuilds.com';
  }
  return false;
}

(function(){const nav=document.getElementById('nav'),hero=document.getElementById('top');if(!nav||!hero||!('IntersectionObserver' in window))return;
new IntersectionObserver(e=>{nav.classList.toggle('on-dark',e[0].isIntersecting)},{rootMargin:'-64px 0px 0px 0px',threshold:0}).observe(hero);
const top=()=>nav.classList.toggle('at-top',window.scrollY<40&&!nav.classList.contains('open'));top();addEventListener('scroll',top,{passive:true});})();

(function(){if(!location.hash)return;var go=function(){var t=document.querySelector(location.hash);if(t){t.scrollIntoView({block:'start'})}};addEventListener('load',function(){setTimeout(go,150);setTimeout(go,700)})})();
