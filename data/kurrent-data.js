// Sample data for the kurrent demo. Every company, person and figure here is invented.
const leads = [
  { id:1, company:"Northgate Engineering", role:"Senior Structural Engineer — Bridges & Highways", location:"Toronto, ON", salary:"$120K – $155K", ttf:"45-60 days", size:"10,000+ employees", contact:"verified", contactName:"Maria R.", contactTitle:"Director of Talent Acquisition", contactEmail:"m.r***@northgate-eng.com", tag:"hot", status:"New", date:"Mar 14", openWeeks:"5 wks", fee:"$27,500", competing:23, talent:142,
    insight:"Strong demand for structural engineers specializing in bridges and highway infrastructure across the GTA. Northgate's expansion of their Toronto transportation division signals a multi-hire campaign. This is a high-value placement opportunity with repeat potential.",
    candidates:[{name:"James K.",headline:"Senior Structural Engineer, P.Eng · 12 yrs bridge design",score:"94%",signal:"Warm",rank:1},{name:"Nina T.",headline:"Structural EIT · 7 yrs · provincial highway projects",score:"82%",signal:"Possible",rank:2},{name:"David L.",headline:"Bridge Design Lead · 15 yrs · P.Eng · Independent",score:"77%",signal:"Passive",rank:3}],
    notes:[{user:"D",name:"Demo User",time:"2 hours ago",text:"Called Maria's office, left a voicemail. She's apparently OOO until next week. Will follow up Tuesday."},{user:"J",name:"Jane",time:"Yesterday at 3:42 PM",text:"James K. is a strong candidate — I know him from the engineering network. He might respond to a LinkedIn InMail faster than email."}]
  },
  { id:2, company:"Halcyon Build Corp.", role:"Project Manager — Commercial Construction", location:"Mississauga, ON", salary:"$95K – $130K", ttf:"30-45 days", size:"5,000+", contact:"none", tag:"new", status:"New", date:"Apr 7", fee:"$22,500", competing:15, talent:89,
    insight:"Halcyon Build is ramping up commercial construction projects across the GTA. Their PM hiring signals new project wins. Strong opportunity but no verified contact yet — consider researching their TA team on LinkedIn.",
    candidates:[{name:"Michael P.",headline:"Construction PM · 8 yrs · LEED AP · Residential/Commercial",score:"88%",signal:"Possible",rank:1},{name:"Rachel W.",headline:"Sr. Project Coordinator · 5 yrs · Transit projects",score:"74%",signal:"Passive",rank:2}], notes:[]
  },
  { id:3, company:"Meridian Infrastructure", role:"Civil Engineer — Infrastructure Division", location:"Toronto, ON", salary:"$90K – $115K", ttf:"35-50 days", size:"8,000+", contact:"partial", contactName:"HR Team", tag:"warm", status:"Contacted", date:"Mar 21", openWeeks:"4 wks", fee:"$20,500", competing:18, talent:106,
    insight:"Meridian is actively expanding their infrastructure division with several highway and transit projects in the pipeline. Civil engineers with P.Eng designation are in high demand. Partial contact only — worth pursuing through professional networks.",
    candidates:[{name:"Ahmed N.",headline:"Civil Engineer, P.Eng · 6 yrs · Municipal infra",score:"85%",signal:"Warm",rank:1},{name:"Lisa C.",headline:"Infrastructure Engineer · 10 yrs · Transit/bridges",score:"79%",signal:"Possible",rank:2}], notes:[]
  },
  { id:4, company:"Cascadia Steelworks", role:"Structural Detailer — Steel Fabrication", location:"Vancouver, BC", salary:"$75K – $95K", ttf:"25-35 days", size:"6,000+", contact:"verified", contactName:"Tom B.", contactTitle:"Hiring Manager", contactEmail:"t.b***@cascadiasteel.com", tag:"warm", status:"Reviewing", date:"Apr 9", fee:"$17,000", competing:8, talent:45,
    insight:"Vancouver's steel fabrication sector has limited structural detailers. Cascadia's ongoing large-scale projects create consistent demand. With a verified contact, this is a strong outreach candidate.",
    candidates:[{name:"Kevin Y.",headline:"Structural Steel Detailer · 9 yrs · Tekla certified",score:"91%",signal:"Warm",rank:1}], notes:[]
  },
  { id:5, company:"Prairie Civil Group", role:"Senior Estimator — Heavy Civil", location:"Calgary, AB", salary:"$110K – $140K", ttf:"40-55 days", size:"5,500+", contact:"verified", contactName:"Sandra M.", contactTitle:"VP Talent", contactEmail:"s.m***@prairiecivil.com", tag:"hot", status:"Meeting", date:"Mar 28", fee:"$25,000", competing:11, talent:67,
    insight:"Prairie Civil is one of the region's largest civil contractors with a growing heavy civil division in Alberta. Senior estimators are scarce in this market. Meeting already scheduled — strong pipeline momentum.",
    candidates:[{name:"Robert H.",headline:"Sr. Estimator · 14 yrs · Heavy civil/mining",score:"92%",signal:"Warm",rank:1},{name:"Dana P.",headline:"Estimator · 7 yrs · Highway/bridge projects",score:"81%",signal:"Possible",rank:2}], notes:[]
  },
  { id:6, company:"Kestrel Construction", role:"Safety Coordinator", location:"Toronto, ON", salary:"$70K – $85K", ttf:"20-30 days", size:"3,000+", contact:"partial", tag:"new", status:"Reviewing", date:"Apr 10", fee:"$16,000", competing:6, talent:98,
    insight:"Kestrel Construction is expanding safety operations across Ontario projects. Safety coordinators with construction-specific certifications are in steady demand.",
    candidates:[], notes:[]
  },
  { id:7, company:"Ashford & Vale LLP", role:"Paralegal", location:"Toronto, ON", salary:"$55K – $72K", ttf:"25-35 days", size:"6,000+", contact:"verified", contactName:"HR Dept.", tag:"hot", status:"Reviewing", date:"Sep 27", fee:"$13,000", competing:14, talent:156,
    insight:"Downtown law firms continue active paralegal hiring. Ashford & Vale's litigation group is expanding. High candidate availability but competition from multiple firms means speed matters.",
    candidates:[{name:"Emily R.",headline:"Paralegal · 4 yrs · Commercial litigation",score:"87%",signal:"Possible",rank:1}], notes:[]
  },
  { id:8, company:"Bellamy Rowe LLP", role:"Legal Assistant", location:"Toronto, ON", salary:"$48K – $62K", ttf:"15-25 days", size:"1,200+", contact:"verified", contactName:"Hiring Team", tag:"hot", status:"New", date:"Sep 27", fee:"$11,000", competing:12, talent:210,
    insight:"Bellamy Rowe is hiring across multiple practice groups. Legal assistants with large-firm experience are preferred. Quick time-to-fill — act fast on verified contacts.",
    candidates:[], notes:[]
  },
  { id:9, company:"Calder Whitmore LLP", role:"Paralegal", location:"Toronto, ON", salary:"$58K – $75K", ttf:"25-35 days", size:"2,000+", contact:"partial", tag:"warm", status:"Contacted", date:"Sep 26", fee:"$14,000", competing:14, talent:156,
    insight:"Calder Whitmore LLP's regulatory practice is expanding. Paralegals with regulatory or compliance experience are particularly sought after.",
    candidates:[], notes:[]
  },
  { id:10, company:"Lumen Commerce", role:"Senior Product Manager", location:"Toronto, ON", salary:"$160K – $200K", ttf:"50-70 days", size:"10,000+", contact:"partial", tag:"hot", status:"New", date:"Sep 26", fee:"$36,000", competing:31, talent:89,
    insight:"Lumen Commerce's return-to-office push in Toronto is driving PM hiring. Director-level product talent with e-commerce experience is extremely scarce. High fee potential but competitive search.",
    candidates:[{name:"Priya S.",headline:"Sr. PM · 8 yrs · Commerce/payments platforms",score:"89%",signal:"Possible",rank:1}], notes:[]
  },
];
