import { useState, useEffect } from "react";

/* ─── FONTS ─────────────────────────────────────────────────────────────── */
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;900&family=Instrument+Sans:wght@400;500;600&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
    .fu { animation: fadeUp .25s ease forwards; }
    .si { animation: slideIn .3s cubic-bezier(.16,1,.3,1) forwards; }
  `;
  document.head.appendChild(s);
})();

/* ─── CONSTANTS ──────────────────────────────────────────────────────────── */
const STAGES = ["New Lead","Contacted","Requirement Collected","Property Suggested","Visit Scheduled","Visit Completed","Booked","Lost"];
const SMETA = {
  "New Lead":               { c:"#4FC3F7", bg:"rgba(79,195,247,.12)"  },
  "Contacted":              { c:"#FFB74D", bg:"rgba(255,183,77,.12)"  },
  "Requirement Collected":  { c:"#CE93D8", bg:"rgba(206,147,216,.12)" },
  "Property Suggested":     { c:"#80DEEA", bg:"rgba(128,222,234,.12)" },
  "Visit Scheduled":        { c:"#FFF176", bg:"rgba(255,241,118,.12)" },
  "Visit Completed":        { c:"#A5D6A7", bg:"rgba(165,214,167,.12)" },
  "Booked":                 { c:"#69F0AE", bg:"rgba(105,240,174,.12)" },
  "Lost":                   { c:"#EF9A9A", bg:"rgba(239,154,154,.12)" },
};
const AGENTS   = ["Riya Sharma","Aakash Verma","Priya Nair","Rahul Mehta","Sneha Joshi"];
const SOURCES  = ["Website Form","WhatsApp","Social Media","Phone Call","Tally Form","Walk-in","Referral"];
const PROPS    = ["Koramangala PG","Indiranagar House","BTM Layout PG","HSR Layout Villa","Whitefield Studio","JP Nagar Room","Electronic City PG"];
const OUTCOMES = ["Interested","Not Interested","Needs Follow-up","Booked"];

let rrIdx = 0;
const roundRobin = () => { const a = AGENTS[rrIdx % AGENTS.length]; rrIdx++; return a; };
const gid = () => Date.now() + Math.random();
const now = () => new Date().toISOString();
const timeAgo = (iso) => {
  const d = Date.now() - new Date(iso);
  const h = Math.floor(d / 3600000);
  if (h < 1) return `${Math.floor(d/60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};
const isStale = (iso) => (Date.now() - new Date(iso)) > 86400000;

/* ─── SEED DATA ──────────────────────────────────────────────────────────── */
const SEED = [
  { id:1, name:"Aarav Mehta",   phone:"9845001234", email:"aarav@gmail.com",  source:"Website Form",  requirement:"2-sharing near MG Road",  budget:"8000",  stage:"Visit Completed",      agent:"Riya Sharma",  notes:"Prefers AC room",      createdAt:"2024-01-08T10:30:00", lastActivity:"2024-01-14T11:00:00", visits:[{id:11,property:"Koramangala PG",   date:"2024-01-14",time:"11:00",outcome:"Interested"}] },
  { id:2, name:"Sneha Rao",     phone:"9856002345", email:"sneha@outlook.com",source:"WhatsApp",       requirement:"Single room, Indiranagar", budget:"12000", stage:"Booked",               agent:"Aakash Verma", notes:"Booked on Jan 18",     createdAt:"2024-01-05T09:00:00", lastActivity:"2024-01-18T14:00:00", visits:[{id:22,property:"Indiranagar House",date:"2024-01-10",time:"14:00",outcome:"Loved it"}]  },
  { id:3, name:"Kiran Bhat",    phone:"9867003456", email:"kiran@yahoo.com",  source:"Tally Form",    requirement:"Triple sharing, BTM",      budget:"5500",  stage:"Property Suggested",   agent:"Priya Nair",   notes:"Price sensitive",      createdAt:"2024-01-12T16:00:00", lastActivity:"2024-01-13T10:00:00", visits:[] },
  { id:4, name:"Divya Shetty",  phone:"9878004567", email:"divya@gmail.com",  source:"Phone Call",    requirement:"Girls PG, HSR Layout",     budget:"9000",  stage:"New Lead",             agent:"Rahul Mehta",  notes:"",                     createdAt:"2024-01-15T08:00:00", lastActivity:"2024-01-15T08:00:00", visits:[] },
  { id:5, name:"Rohan Kumar",   phone:"9889005678", email:"rohan@gmail.com",  source:"Social Media",  requirement:"Single non-AC, EC",        budget:"6000",  stage:"Contacted",            agent:"Sneha Joshi",  notes:"Works at Infosys",     createdAt:"2024-01-13T11:00:00", lastActivity:"2024-01-13T17:00:00", visits:[] },
  { id:6, name:"Lakshmi Nair",  phone:"9890006789", email:"laks@gmail.com",   source:"Referral",      requirement:"2BHK flat share, Kora",    budget:"15000", stage:"Visit Scheduled",      agent:"Riya Sharma",  notes:"Ref by Sneha Rao",     createdAt:"2024-01-14T13:00:00", lastActivity:"2024-01-15T09:00:00", visits:[{id:33,property:"Koramangala PG",   date:"2024-01-20",time:"16:00",outcome:""}]       },
  { id:7, name:"Aryan Gupta",   phone:"9812007890", email:"aryan@hotmail.com",source:"Website Form",  requirement:"Boys hostel, JP Nagar",    budget:"7000",  stage:"Lost",                 agent:"Aakash Verma", notes:"Found elsewhere",      createdAt:"2024-01-06T14:00:00", lastActivity:"2024-01-11T10:00:00", visits:[] },
  { id:8, name:"Pooja Iyer",    phone:"9823008901", email:"pooja@gmail.com",  source:"Tally Form",    requirement:"Girls PG, Whitefield",     budget:"10000", stage:"Requirement Collected",agent:"Priya Nair",   notes:"TCS employee",         createdAt:"2024-01-15T07:00:00", lastActivity:"2024-01-15T12:00:00", visits:[] },
];

/* ─── THEME ──────────────────────────────────────────────────────────────── */
const T = {
  bg:"#0D0D0D", surf:"#141414", card:"#1A1A1A",
  b1:"#252525", b2:"#2E2E2E", text:"#F0F0F0",
  muted:"#666", accent:"#C8F04A",
};

/* ─── TINY SVG ICON ──────────────────────────────────────────────────────── */
const Ico = ({ d, size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);

/* ─── SHARED STYLES ──────────────────────────────────────────────────────── */
const btn = (v="pri") => ({
  display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px",
  borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
  background: v==="pri"?T.accent: v==="red"?"#EF4444":T.b2,
  color: v==="pri"?"#000":T.text, transition:"opacity .15s",
});
const inp = { width:"100%", background:T.b2, border:`1px solid ${T.b1}`, borderRadius:8, padding:"9px 12px", color:T.text, fontSize:13, outline:"none", fontFamily:"inherit" };
const lbl = { fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, display:"block" };
const card = { background:T.card, border:`1px solid ${T.b1}`, borderRadius:12, padding:20 };

/* ─── BADGE ──────────────────────────────────────────────────────────────── */
const Badge = ({ stage }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:SMETA[stage]?.bg||"#222", color:SMETA[stage]?.c||T.text }}>
    <span style={{ width:5, height:5, borderRadius:"50%", background:SMETA[stage]?.c||T.muted, flexShrink:0 }}/>
    {stage}
  </span>
);

/* ─── STALE BANNER ───────────────────────────────────────────────────────── */
const StaleBanner = ({ leads }) => {
  const stale = leads.filter(l=>!["Booked","Lost"].includes(l.stage)&&isStale(l.lastActivity));
  if (!stale.length) return null;
  return (
    <div style={{ background:"rgba(255,183,77,.09)", border:"1px solid rgba(255,183,77,.25)", borderRadius:10, padding:"11px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:"#FFB74D" }}>⚠</span>
      <span style={{ fontSize:13, color:"#FFB74D", fontWeight:500 }}>
        {stale.length} lead{stale.length>1?"s":""} inactive 24h+: {stale.slice(0,3).map(l=>l.name).join(", ")}{stale.length>3?` +${stale.length-3} more`:""}
      </span>
    </div>
  );
};

/* ─── LEAD FORM MODAL ────────────────────────────────────────────────────── */
const LeadModal = ({ init, onSave, onClose }) => {
  const blank = { name:"", phone:"", email:"", source:SOURCES[0], requirement:"", budget:"", stage:"New Lead", agent:"", notes:"" };
  const [f, setF] = useState(init || blank);
  const up = (k,v) => setF(p=>({...p,[k]:v}));
  const save = () => {
    if (!f.name.trim() || !f.phone.trim()) return alert("Name and phone are required");
    const agent = f.agent || roundRobin();
    const ts = now();
    onSave({ ...f, agent, id:init?.id||gid(), createdAt:init?.createdAt||ts, lastActivity:ts, visits:init?.visits||[] });
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div style={{ ...card, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()} className="fu">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontFamily:"'Fraunces', serif", fontSize:20, fontWeight:700 }}>{init?"Edit Lead":"Capture New Lead"}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[["name","Name *"],["phone","Phone *"],["email","Email"],["budget","Budget ₹/mo"]].map(([k,lb])=>(
            <div key={k}><label style={lbl}>{lb}</label><input style={inp} value={f[k]} onChange={e=>up(k,e.target.value)} placeholder={lb.replace(" *","")}/></div>
          ))}
          <div><label style={lbl}>Source</label>
            <select style={{ ...inp, appearance:"none" }} value={f.source} onChange={e=>up("source",e.target.value)}>
              {SOURCES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Stage</label>
            <select style={{ ...inp, appearance:"none" }} value={f.stage} onChange={e=>up("stage",e.target.value)}>
              {STAGES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Assign Agent <span style={{ color:T.muted }}>(blank = auto round-robin)</span></label>
            <select style={{ ...inp, appearance:"none" }} value={f.agent} onChange={e=>up("agent",e.target.value)}>
              <option value="">Auto Assign</option>{AGENTS.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Requirement</label><input style={inp} value={f.requirement} onChange={e=>up("requirement",e.target.value)} placeholder="e.g. 2-sharing near MG Road"/></div>
          <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Notes</label><textarea style={{ ...inp, resize:"vertical", minHeight:64 }} value={f.notes} onChange={e=>up("notes",e.target.value)}/></div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button style={btn("pri")} onClick={save}>✓ {init?"Save Changes":"Capture Lead"}</button>
          <button style={btn()} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ─── VISIT MODAL ────────────────────────────────────────────────────────── */
const VisitModal = ({ lead, onSave, onClose }) => {
  const [v, setV] = useState({ property:PROPS[0], date:"", time:"", outcome:"" });
  const save = () => {
    if (!v.date||!v.time) return alert("Date and time required");
    onSave({ ...v, id:gid() });
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1010, backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div style={{ ...card, width:"100%", maxWidth:440 }} onClick={e=>e.stopPropagation()} className="fu">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontFamily:"'Fraunces', serif", fontSize:18, fontWeight:700 }}>Schedule Visit — {lead.name}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"grid", gap:14 }}>
          <div><label style={lbl}>Property</label>
            <select style={{ ...inp, appearance:"none" }} value={v.property} onChange={e=>setV(p=>({...p,property:e.target.value}))}>
              {PROPS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><label style={lbl}>Date</label><input type="date" style={inp} value={v.date} onChange={e=>setV(p=>({...p,date:e.target.value}))}/></div>
            <div><label style={lbl}>Time</label><input type="time" style={inp} value={v.time} onChange={e=>setV(p=>({...p,time:e.target.value}))}/></div>
          </div>
          <div><label style={lbl}>Outcome (optional)</label><input style={inp} value={v.outcome} onChange={e=>setV(p=>({...p,outcome:e.target.value}))} placeholder="Leave blank if not done yet"/></div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button style={btn("pri")} onClick={save}>✓ Schedule</button>
          <button style={btn()} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ─── LEAD DETAIL DRAWER ─────────────────────────────────────────────────── */
const Drawer = ({ lead, onUpdate, onClose }) => {
  const [showVisit, setShowVisit] = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);

  const addVisit = (v) => {
    const updated = { ...lead, visits:[...lead.visits,v], stage:"Visit Scheduled", lastActivity:now() };
    onUpdate(updated); setShowVisit(false);
  };
  const setStage = (stage) => onUpdate({ ...lead, stage, lastActivity:now() });

  const row = (label, value) => value ? (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.b1}`, fontSize:13 }}>
      <span style={{ color:T.muted }}>{label}</span>
      <span style={{ fontWeight:500, maxWidth:"60%", textAlign:"right" }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:900 }} onClick={onClose}>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:460, background:T.surf, borderLeft:`1px solid ${T.b1}`, overflowY:"auto", padding:28 }} className="si" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:24, fontWeight:700 }}>{lead.name}</div>
            <div style={{ color:T.muted, fontSize:12, marginTop:3 }}>Added {timeAgo(lead.createdAt)}</div>
          </div>
          <button onClick={onClose} style={{ background:T.b2, border:"none", borderRadius:8, padding:"7px 10px", cursor:"pointer", color:T.text }}>✕</button>
        </div>

        {/* Stage pills */}
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Move to Stage</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {STAGES.map(s=>(
              <button key={s} onClick={()=>setStage(s)} style={{
                padding:"4px 11px", borderRadius:20, cursor:"pointer", fontSize:11, fontWeight:600, transition:"all .15s",
                border:`1px solid ${lead.stage===s?SMETA[s].c:T.b2}`,
                background:lead.stage===s?SMETA[s].bg:"transparent",
                color:lead.stage===s?SMETA[s].c:T.muted,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ ...card, marginBottom:14 }}>
          {row("Phone",lead.phone)}{row("Email",lead.email)}
          {row("Source",lead.source)}{row("Budget","₹"+lead.budget+"/mo")}
          {row("Agent",lead.agent)}{row("Last Active",timeAgo(lead.lastActivity))}
          {row("Requirement",lead.requirement)}
        </div>

        {/* Notes */}
        {lead.notes && <div style={{ ...card, marginBottom:14 }}><label style={lbl}>Notes</label><div style={{ fontSize:13 }}>{lead.notes}</div></div>}

        {/* Visits */}
        <div style={{ ...card, marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <label style={{ ...lbl, marginBottom:0 }}>Visit History ({lead.visits.length})</label>
            <button style={{ ...btn(), padding:"4px 10px", fontSize:11 }} onClick={()=>setShowVisit(true)}>+ Schedule</button>
          </div>
          {!lead.visits.length ? <div style={{ fontSize:13, color:T.muted }}>No visits yet</div> :
            lead.visits.map(v=>(
              <div key={v.id} style={{ padding:"10px 0", borderBottom:`1px solid ${T.b1}` }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{v.property}</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{v.date} · {v.time}</div>
                {v.outcome && <div style={{ fontSize:12, color:T.accent, marginTop:3 }}>↳ {v.outcome}</div>}
              </div>
            ))
          }
        </div>

        <button style={btn("pri")} onClick={()=>setShowEdit(true)}>✎ Edit Lead</button>

        {showVisit && <VisitModal lead={lead} onSave={addVisit} onClose={()=>setShowVisit(false)}/>}
        {showEdit  && <LeadModal init={lead} onSave={l=>{onUpdate(l);setShowEdit(false);}} onClose={()=>setShowEdit(false)}/>}
      </div>
    </div>
  );
};

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
const Dashboard = ({ leads }) => {
  const booked  = leads.filter(l=>l.stage==="Booked").length;
  const visits  = leads.reduce((a,l)=>a+l.visits.length,0);
  const stale   = leads.filter(l=>!["Booked","Lost"].includes(l.stage)&&isStale(l.lastActivity));
  const conv    = leads.length ? Math.round(booked/leads.length*100) : 0;
  const stageCnt= STAGES.reduce((a,s)=>({...a,[s]:leads.filter(l=>l.stage===s).length}),{});
  const agentLB = AGENTS.map(a=>({ name:a, total:leads.filter(l=>l.agent===a).length, booked:leads.filter(l=>l.agent===a&&l.stage==="Booked").length })).sort((a,b)=>b.booked-a.booked);

  const Stat = ({ label, val, sub, col=T.accent }) => (
    <div style={{ ...card, flex:1, minWidth:130 }} className="fu">
      <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'Fraunces', serif", fontSize:38, fontWeight:900, color:col, lineHeight:1 }}>{val}</div>
      {sub && <div style={{ fontSize:12, color:T.muted, marginTop:5 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <StaleBanner leads={leads}/>
      <div style={{ display:"flex", gap:14, marginBottom:22, flexWrap:"wrap" }}>
        <Stat label="Total Leads"      val={leads.length} sub={`${leads.filter(l=>!["Booked","Lost"].includes(l.stage)).length} active`}/>
        <Stat label="Booked"           val={booked}       sub={`${conv}% conversion`} col="#69F0AE"/>
        <Stat label="Visits"           val={visits}       sub="all time"              col="#80DEEA"/>
        <Stat label="Need Follow-up"   val={stale.length} sub="inactive 24h+"         col="#FFB74D"/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:20 }}>
        {/* Pipeline */}
        <div style={card}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:16, fontWeight:700, marginBottom:16 }}>Pipeline Breakdown</div>
          {STAGES.map(s=>{
            const cnt = stageCnt[s]||0;
            const pct = leads.length ? cnt/leads.length*100 : 0;
            return (
              <div key={s} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:12 }}>
                  <span style={{ color:T.text }}>{s}</span>
                  <span style={{ color:SMETA[s].c, fontWeight:600 }}>{cnt}</span>
                </div>
                <div style={{ height:4, background:T.b2, borderRadius:4 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:SMETA[s].c, borderRadius:4, transition:"width .5s" }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div style={card}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:16, fontWeight:700, marginBottom:16 }}>Agent Leaderboard</div>
          {agentLB.map((a,i)=>(
            <div key={a.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:i<agentLB.length-1?`1px solid ${T.b1}`:"none" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:i===0?T.accent:T.b2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:i===0?"#000":T.muted, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{a.name}</div>
                <div style={{ fontSize:11, color:T.muted }}>{a.total} leads</div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:T.accent }}>{a.booked} 🏠</div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up reminders */}
      {stale.length > 0 && (
        <div style={card}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:16, fontWeight:700, color:"#FFB74D", marginBottom:14 }}>⚠ Follow-up Reminders</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:10 }}>
            {stale.map(l=>(
              <div key={l.id} style={{ background:"rgba(255,183,77,.07)", border:"1px solid rgba(255,183,77,.2)", borderRadius:8, padding:12 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{l.name}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{l.agent}</div>
                <div style={{ marginTop:6 }}><Badge stage={l.stage}/></div>
                <div style={{ fontSize:11, color:"#FFB74D", marginTop:6 }}>Last active {timeAgo(l.lastActivity)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── LEADS TABLE ────────────────────────────────────────────────────────── */
const LeadsTable = ({ leads, onSelect, onAdd, onDelete }) => {
  const [q,   setQ]   = useState("");
  const [fStage, setFS] = useState("All");
  const [fAgent, setFA] = useState("All");

  const rows = leads.filter(l => {
    const mQ = !q || [l.name,l.phone,l.email||""].some(v=>v.toLowerCase().includes(q.toLowerCase()));
    return mQ && (fStage==="All"||l.stage===fStage) && (fAgent==="All"||l.agent===fAgent);
  });

  const TH = ({ ch }) => <th style={{ padding:"11px 14px", textAlign:"left", fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:.8, fontWeight:600, whiteSpace:"nowrap" }}>{ch}</th>;

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <input style={{ ...inp, flex:1, minWidth:180 }} placeholder="🔍  Search name / phone / email…" value={q} onChange={e=>setQ(e.target.value)}/>
        <select style={{ ...inp, width:"auto", minWidth:150, appearance:"none" }} value={fStage} onChange={e=>setFS(e.target.value)}>
          <option>All</option>{STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={{ ...inp, width:"auto", minWidth:140, appearance:"none" }} value={fAgent} onChange={e=>setFA(e.target.value)}>
          <option>All</option>{AGENTS.map(a=><option key={a}>{a}</option>)}
        </select>
        <button style={btn("pri")} onClick={onAdd}>+ Add Lead</button>
      </div>

      <div style={{ ...card, padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:`1px solid ${T.b1}` }}>
            {["Name","Phone","Source","Requirement","Stage","Agent","Active",""].map(h=><TH key={h} ch={h}/>)}
          </tr></thead>
          <tbody>
            {rows.map(l=>(
              <tr key={l.id} onClick={()=>onSelect(l)} style={{ borderBottom:`1px solid ${T.b1}`, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.b1}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{l.name}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{l.email}</div>
                  {isStale(l.lastActivity)&&!["Booked","Lost"].includes(l.stage)&&<div style={{ fontSize:10, color:"#FFB74D" }}>⚠ Follow-up</div>}
                </td>
                <td style={{ padding:"11px 14px", fontSize:13, color:T.muted }}>{l.phone}</td>
                <td style={{ padding:"11px 14px", fontSize:12, color:T.muted }}>{l.source}</td>
                <td style={{ padding:"11px 14px", fontSize:12, color:T.muted, maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.requirement||"—"}</td>
                <td style={{ padding:"11px 14px" }}><Badge stage={l.stage}/></td>
                <td style={{ padding:"11px 14px", fontSize:12, color:T.muted }}>{l.agent}</td>
                <td style={{ padding:"11px 14px", fontSize:12, color:T.muted, whiteSpace:"nowrap" }}>{timeAgo(l.lastActivity)}</td>
                <td style={{ padding:"11px 14px" }}>
                  <button onClick={e=>{e.stopPropagation();if(confirm("Delete this lead?"))onDelete(l.id);}} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:14 }}>🗑</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:T.muted }}>No leads found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── KANBAN PIPELINE ────────────────────────────────────────────────────── */
const Pipeline = ({ leads, onUpdate, onSelect }) => {
  const [drag, setDrag] = useState(null);
  const drop = (stage) => { if(drag){ onUpdate({...drag,stage,lastActivity:now()}); setDrag(null); } };

  return (
    <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:10, alignItems:"flex-start" }}>
      {STAGES.map(stage=>{
        const col = leads.filter(l=>l.stage===stage);
        const m   = SMETA[stage];
        return (
          <div key={stage} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(stage)}
            style={{ minWidth:185, flex:"0 0 185px", background:T.surf, border:`1px solid ${T.b1}`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"11px 14px", background:m.bg, borderBottom:`1px solid ${T.b1}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:m.c, textTransform:"uppercase", letterSpacing:.8 }}>{stage}</div>
              <div style={{ fontFamily:"'Fraunces', serif", fontSize:22, fontWeight:900, color:m.c }}>{col.length}</div>
            </div>
            <div style={{ padding:8, minHeight:160 }}>
              {col.map(l=>(
                <div key={l.id} draggable onDragStart={()=>setDrag(l)} onClick={()=>onSelect(l)}
                  style={{ background:T.card, border:`1px solid ${T.b2}`, borderRadius:8, padding:10, marginBottom:7, cursor:"grab", transition:"transform .1s, box-shadow .1s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.4)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{l.name}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{l.agent}</div>
                  {l.budget && <div style={{ fontSize:11, color:T.accent, marginTop:4 }}>₹{l.budget}/mo</div>}
                  {l.visits.length>0 && <div style={{ fontSize:10, color:"#80DEEA", marginTop:3 }}>📍 {l.visits.length} visit{l.visits.length>1?"s":""}</div>}
                  {isStale(l.lastActivity)&&!["Booked","Lost"].includes(l.stage)&&<div style={{ fontSize:10, color:"#FFB74D", marginTop:3 }}>⚠ Inactive</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── VISITS VIEW ────────────────────────────────────────────────────────── */
const Visits = ({ leads, onUpdate }) => {
  const today = new Date().toISOString().split("T")[0];
  const all   = leads.flatMap(l=>l.visits.map(v=>({...v,lead:l}))).sort((a,b)=>a.date<b.date?-1:1);
  const upcoming = all.filter(v=>v.date>=today);
  const past     = all.filter(v=>v.date<today);

  const markOutcome = (leadId, visId, outcome) => {
    const lead = leads.find(l=>l.id===leadId);
    if (!lead) return;
    const visits = lead.visits.map(v=>v.id===visId?{...v,outcome}:v);
    onUpdate({ ...lead, visits, stage:"Visit Completed", lastActivity:now() });
  };

  const VC = ({ v }) => (
    <div style={{ ...card, display:"flex", gap:14, alignItems:"flex-start", marginBottom:10 }}>
      <div style={{ background:T.b2, borderRadius:8, padding:"8px 12px", textAlign:"center", flexShrink:0, minWidth:52 }}>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:20, fontWeight:900, color:T.accent }}>{v.date.split("-")[2]}</div>
        <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase" }}>{new Date(v.date+"T12:00").toLocaleString("en",{month:"short"})}</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>{v.lead.name}</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{v.property} · {v.time} · {v.lead.agent}</div>
        {v.outcome
          ? <div style={{ fontSize:12, color:T.accent, marginTop:6 }}>✓ {v.outcome}</div>
          : <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
              {OUTCOMES.map(o=>(
                <button key={o} style={{ ...btn(), padding:"3px 9px", fontSize:11 }} onClick={()=>markOutcome(v.lead.id,v.id,o)}>{o}</button>
              ))}
            </div>
        }
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:17, fontWeight:700, marginBottom:12 }}>Upcoming ({upcoming.length})</div>
        {upcoming.length ? upcoming.map(v=><VC key={v.id} v={v}/>) : <div style={{ color:T.muted, fontSize:13 }}>No upcoming visits</div>}
      </div>
      <div>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:17, fontWeight:700, marginBottom:12, color:T.muted }}>Past ({past.length})</div>
        {past.map(v=><VC key={v.id} v={v}/>)}
      </div>
    </div>
  );
};

/* ─── INTAKE FORM (SIMULATES LEAD CAPTURE) ───────────────────────────────── */
const Intake = ({ onCapture }) => {
  const blank = { name:"", phone:"", email:"", source:SOURCES[0], requirement:"", budget:"" };
  const [f, setF] = useState(blank);
  const [done, setDone] = useState(null);
  const up = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = () => {
    if (!f.name.trim()||!f.phone.trim()) return alert("Name and phone required");
    const agent = roundRobin();
    const ts = now();
    const lead = { ...f, id:gid(), agent, stage:"New Lead", notes:"", createdAt:ts, lastActivity:ts, visits:[] };
    onCapture(lead);
    setDone({ lead, agent });
    setF(blank);
  };

  if (done) return (
    <div style={{ maxWidth:460, margin:"50px auto", textAlign:"center" }} className="fu">
      <div style={{ fontSize:52, marginBottom:14 }}>✅</div>
      <div style={{ fontFamily:"'Fraunces', serif", fontSize:26, fontWeight:900, color:T.accent, marginBottom:8 }}>Lead Captured!</div>
      <div style={{ color:T.muted, fontSize:14, marginBottom:6 }}><strong style={{ color:T.text }}>{done.lead.name}</strong> has been added to the pipeline.</div>
      <div style={{ color:T.muted, fontSize:13 }}>Auto-assigned to <strong style={{ color:T.accent }}>{done.agent}</strong> via round-robin.</div>
      <button style={{ ...btn("pri"), marginTop:22 }} onClick={()=>setDone(null)}>+ Submit Another Lead</button>
    </div>
  );

  return (
    <div style={{ maxWidth:500, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:22, fontWeight:700 }}>Lead Intake Form</div>
        <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>Simulates a lead arriving from Website / WhatsApp / Tally. Agent is auto-assigned via round-robin.</div>
      </div>
      <div style={card}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[["name","Full Name *"],["phone","Phone *"],["email","Email"],["budget","Budget ₹/mo"]].map(([k,lb])=>(
            <div key={k}><label style={lbl}>{lb}</label><input style={inp} value={f[k]} onChange={e=>up(k,e.target.value)} placeholder={lb.replace(" *","")}/></div>
          ))}
          <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Lead Source</label>
            <select style={{ ...inp, appearance:"none" }} value={f.source} onChange={e=>up("source",e.target.value)}>
              {SOURCES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Accommodation Requirement</label>
            <input style={inp} value={f.requirement} onChange={e=>up("requirement",e.target.value)} placeholder="e.g. Girls PG near Koramangala Metro"/></div>
        </div>
        <div style={{ marginTop:16, padding:"11px 14px", background:"rgba(200,240,74,.07)", border:"1px solid rgba(200,240,74,.2)", borderRadius:8, fontSize:12, color:T.accent }}>
          ⚡ Next auto-assign: <strong>{AGENTS[rrIdx % AGENTS.length]}</strong>
        </div>
        <button style={{ ...btn("pri"), marginTop:14, width:"100%", justifyContent:"center" }} onClick={submit}>
          ✓ Submit & Auto-Assign Lead
        </button>
      </div>
    </div>
  );
};

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
export default function App() {
  const [leads,    setLeads]    = useState(SEED);
  const [view,     setView]     = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const upsert = (lead) => {
    setLeads(ls => ls.some(l=>l.id===lead.id) ? ls.map(l=>l.id===lead.id?lead:l) : [lead,...ls]);
    if (selected?.id===lead.id) setSelected(lead);
  };
  const remove = (id) => { setLeads(ls=>ls.filter(l=>l.id!==id)); if(selected?.id===id) setSelected(null); };

  const staleCount = leads.filter(l=>!["Booked","Lost"].includes(l.stage)&&isStale(l.lastActivity)).length;

  const NAV = [
    { id:"dashboard", icon:"🏠", label:"Dashboard"   },
    { id:"leads",     icon:"👥", label:"All Leads"   },
    { id:"pipeline",  icon:"📋", label:"Pipeline"    },
    { id:"visits",    icon:"📅", label:"Visits"      },
    { id:"intake",    icon:"➕", label:"Lead Intake" },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Instrument Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:210, background:T.surf, borderRight:`1px solid ${T.b1}`, display:"flex", flexDirection:"column", padding:"20px 0", flexShrink:0 }}>
        <div style={{ padding:"0 18px 22px", borderBottom:`1px solid ${T.b1}` }}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>Gharpayy</div>
          <div style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginTop:2 }}>CRM · Lead Manager</div>
        </div>
        <div style={{ padding:"14px 10px", flex:1 }}>
          {NAV.map(n=>(
            <div key={n.id} onClick={()=>setView(n.id)} style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8,
              cursor:"pointer", fontSize:13, fontWeight:500, marginBottom:2,
              background:view===n.id?T.accent:"transparent",
              color:view===n.id?"#000":T.muted, transition:"all .15s",
            }}>
              <span>{n.icon}</span>{n.label}
              {n.id==="dashboard"&&staleCount>0&&(
                <span style={{ marginLeft:"auto", background:"#FFB74D", color:"#000", fontSize:10, fontWeight:700, borderRadius:20, padding:"1px 7px" }}>{staleCount}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding:"14px 18px", borderTop:`1px solid ${T.b1}` }}>
          <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Total Leads</div>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:32, fontWeight:900, color:T.accent }}>{leads.length}</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{leads.filter(l=>l.stage==="Booked").length} booked · {leads.filter(l=>l.stage==="Lost").length} lost</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"14px 26px", borderBottom:`1px solid ${T.b1}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.surf }}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:20, fontWeight:700 }}>
            {{ dashboard:"Dashboard", leads:"All Leads", pipeline:"Pipeline", visits:"Visits", intake:"Lead Intake" }[view]}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {view==="leads"&&<button style={btn("pri")} onClick={()=>setAddModal(true)}>+ Add Lead</button>}
            <div style={{ padding:"6px 12px", background:T.b2, borderRadius:8, fontSize:12, color:T.muted }}>
              {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:26 }}>
          {view==="dashboard" && <Dashboard leads={leads}/>}
          {view==="leads"     && <LeadsTable leads={leads} onSelect={setSelected} onAdd={()=>setAddModal(true)} onDelete={remove}/>}
          {view==="pipeline"  && <Pipeline leads={leads} onUpdate={upsert} onSelect={setSelected}/>}
          {view==="visits"    && <Visits leads={leads} onUpdate={upsert}/>}
          {view==="intake"    && <Intake onCapture={l=>{upsert(l);setTimeout(()=>setView("leads"),1800);}}/>}
        </div>
      </div>

      {/* Modals */}
      {addModal  && <LeadModal onSave={l=>{upsert(l);setAddModal(false);}} onClose={()=>setAddModal(false)}/>}
      {selected  && <Drawer lead={selected} onUpdate={upsert} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
