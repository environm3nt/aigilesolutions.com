// Sample data for the impediments demo. Every company, person and figure here is invented.
/* ---------- sample data ---------- */
const ATTR = {Internal:'var(--c-internal)',Client:'var(--c-client)',Partner:'var(--c-partner)',External:'var(--c-external)'};
const ATTR_HEX = {Internal:'#9085E9',Client:'#199E70',Partner:'#C98500',External:'#D55181'};
const TEAMS=['Activation','Billing','Provisioning','Platform'];
const REASONS=[
 ['Partner sandbox outage','Partner',false],
 ['Lower environment contention','Internal',true],
 ['Waiting on client sign-off','Client',false],
 ['PR review latency','Internal',true],
 ['Client deadline moved','Client',false],
 ['Downstream vendor outage','External',false],
 ['Unclear requirements','Internal',true],
 ['Production incident','Internal',true],
 ['Partner API contract change','Partner',false],
 ['Test data unavailable','Internal',true],
];
const SPRINTS=[10,11,12,13,14,15,16,17];
// deterministic pseudo-random
let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
const PARTNERS=['Northwind Mobile','Bluepeak Wireless','Solstice Telecom'];
const PEOPLE=['Priya','Marcus','Lena','Tom','Aisha','Dev','Kai','Sofia'];
const TITLES=['eSIM activation retry flow','Prorated invoice on mid-cycle plan change','Port-in status webhook','Number inventory reconciliation','Family plan add-line API','Usage alert thresholds','Device financing eligibility check','Roaming pass purchase','SIM swap fraud check','Dunning schedule config','Bulk provisioning CSV import','Plan catalogue versioning','Address validation for activation','Tax calculation for add-ons','Carrier handoff for MNP','Rate plan migration tool','Payment method vaulting','Activation dashboard filters','Notification preferences service','Order orchestration retries'];
const T=[];
for(let i=0;i<118;i++){
  let r; const x=rnd();
  // weight reasons: partner sandbox highest
  if(x<0.24)r=0;else if(x<0.40)r=1;else if(x<0.51)r=2;else if(x<0.62)r=3;else if(x<0.71)r=4;else if(x<0.79)r=5;else if(x<0.86)r=6;else if(x<0.92)r=7;else if(x<0.96)r=8;else r=9;
  const [reason,attr,prev]=REASONS[r];
  let sprint=SPRINTS[Math.floor(rnd()*8)];
  if(r===0&&rnd()<0.45)sprint=14; // spike
  if(prev&&sprint>=15&&rnd()<0.55)sprint=10+Math.floor(rnd()*3); // internal improves late
  const est=[2,3,3,5,5,8,8,13][Math.floor(rnd()*8)];
  const lost=Math.max(1,Math.round((r===0?3:1.5)+rnd()*(r===0?7:5)));
  const team=TEAMS[Math.floor(rnd()*4)];
  const partner=PARTNERS[Math.floor(rnd()*3)];
  const who=PEOPLE[Math.floor(rnd()*8)];
  const src = r===3?'GitHub PR':(r===4||r===2||r===5?'Slack':(rnd()<0.6?'Jira comment':'Slack'));
  T.push({key:`DLV-${1840+i}`,title:TITLES[i%TITLES.length],team,sprint,est,actual:est+lost,lost,reason,attr,prev,src,partner,who,blocked:rnd()<0.7});
}
const EVID={
 'Partner sandbox outage':t=>[
  {src:'Slack · #delivery-automation',who:'bot',msg:`Blocked: ${t.key} moved to Blocked by ${t.who}. Reason required.`},
  {src:'Jira comment',who:t.who,msg:`Blocked — PARTNER. ${t.partner} sandbox returning 503 on activation endpoints since this morning. QA can't complete end-to-end; nothing we can do on our side. Tracking in their status page.`},
  {src:'Slack · #partner-'+t.partner.split(' ')[0].toLowerCase(),who:'Partner NOC',msg:`Sandbox maintenance extended. ETA moved to tomorrow 14:00 UTC.`}],
 'Lower environment contention':t=>[
  {src:'Jira comment',who:t.who,msg:`Blocked — INTERNAL. Staging-2 is held by the ${t.team==='Billing'?'Provisioning':'Billing'} regression run until Thursday. We need a dedicated env for partner-integration QA; sharing one is costing us every sprint.`},
  {src:'Slack · #delivery-automation',who:'bot',msg:`${t.key} has been Blocked for 3 days.`}],
 'Waiting on client sign-off':t=>[
  {src:'Slack · #client-shared',who:'Client PM',msg:`Can we hold ${t.key} until legal reviews the copy? Should be early next week.`},
  {src:'Jira comment',who:t.who,msg:`Blocked — CLIENT. Awaiting sign-off on final copy. Build is complete and deployed to UAT.`}],
 'PR review latency':t=>[
  {src:'GitHub · PR #'+(3000+parseInt(t.key.slice(4))%900),who:'bot',msg:`Review requested 4 business days ago. No activity.`},
  {src:'Jira comment',who:t.who,msg:`Overrun — INTERNAL. PR sat in review over the long weekend and the one reviewer with context was on call.`}],
 'Client deadline moved':t=>[
  {src:'Slack · #client-shared',who:'Client Director',msg:`We're prioritising the ${t.team} launch — push ${t.key} to the following release.`},
  {src:'Jira comment',who:t.who,msg:`Overrun — CLIENT. Deadline moved at client request; competing priority. Logging so it doesn't read as slippage on our side.`}],
 'Downstream vendor outage':t=>[
  {src:'Slack · #incidents',who:'bot',msg:`Vendor status: tax-calculation API degraded. Impacting UAT.`},
  {src:'Jira comment',who:t.who,msg:`Blocked — EXTERNAL. Vendor outage, outside partner and client. Can't validate totals until restored.`}],
 'Unclear requirements':t=>[
  {src:'Jira comment',who:t.who,msg:`Overrun — INTERNAL. Acceptance criteria didn't cover the mid-cycle case; had to go back to product twice. Needs a requirements checklist at stage gate 2.`}],
 'Production incident':t=>[
  {src:'Slack · #incidents',who:'bot',msg:`SEV2 declared. ${t.team} on-call pulled in.`},
  {src:'Jira comment',who:t.who,msg:`Overrun — INTERNAL. Team pulled onto the incident for two days. Root cause was a config drift in ${t.team.toLowerCase()} — preventable with the config audit.`}],
 'Partner API contract change':t=>[
  {src:'Jira comment',who:t.who,msg:`Blocked — PARTNER. ${t.partner} changed the response schema in sandbox without notice. Adapting the mapper.`}],
 'Test data unavailable':t=>[
  {src:'Jira comment',who:t.who,msg:`Blocked — INTERNAL. No seeded accounts with the roaming entitlement in staging. Building fixtures by hand; a shared seed set would remove this.`}],
};
