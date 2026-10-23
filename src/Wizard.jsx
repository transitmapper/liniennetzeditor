import React,{useRef} from "react";
import {Button,Text} from "@fluentui/react-components";
import {useStore} from "./store.js";
import {Tx,Sl} from "./ui.jsx";
import {setS,SP,TP,pageSync,CW,CH} from "./core/engine.js";
import {recents,addRecent} from "./tools.js";
const ff=f=>f+", Arial, sans-serif", WP="M20 190H90L140 140H210L260 90H300", dsh=d=>d==="dash"?"14 9":d==="dot"?"1 10":undefined;
const Intro=()=><svg viewBox="0 0 320 240" style={{width:"100%"}}><style>{`.dr{stroke-dasharray:1;stroke-dashoffset:1;animation:dr 1.6s var(--d) ease forwards}.pp{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:pp .4s var(--d) ease forwards}@keyframes dr{to{stroke-dashoffset:0}}@keyframes pp{to{transform:scale(1)}}`}</style>
  <g fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"><path className="dr" pathLength="1" style={{"--d":"0s"}} stroke="#d62828" d={WP}/><path className="dr" pathLength="1" style={{"--d":".5s"}} stroke="#1d6fb8" d="M20 60H100L150 110H210L260 160H300"/><path className="dr" pathLength="1" style={{"--d":"1s"}} stroke="#2a9d4a" d="M60 220V150L100 110L140 70V20"/></g>
  <g fill="#fff" stroke="#222" strokeWidth="3">{[[90,190,1.3],[140,140,1.5],[210,140,1.7],[150,110,1.9],[100,110,2.1],[260,90,2.3]].map((q,i)=><circle key={i} className="pp" style={{"--d":q[2]+"s"}} cx={q[0]} cy={q[1]} r="8"/>)}</g>
  <circle r="6" fill="#222"><animateMotion dur="6s" repeatCount="indefinite" path={WP}/></circle></svg>;
function PlanPv({S}){
  const W=CW(),H=CH(),k=Math.min(280/W,200/H),w=W*k,h=H*k,x0=(320-w)/2,y0=(240-h)/2,f=k/32,t1=TP("h1"),t2=TP("sub"),q=(a,b)=>`${x0+a*k} ${y0+b*k}`,pg=S.page||{};
  return <svg viewBox="0 0 320 240" style={{width:"100%"}}><defs><pattern id="wp" width={k} height={k} patternUnits="userSpaceOnUse" x={x0-k/2} y={y0-k/2}><circle cx={k/2} cy={k/2} r=".8" fill="#bbb"/></pattern></defs>
    <rect x={x0} y={y0} width={w} height={h} fill="#fff" stroke="#999" strokeWidth="1.5"/>{k>=3&&<rect x={x0} y={y0} width={w} height={h} fill="url(#wp)"/>}
    <path d={`M${q(3,.8*H)}L${q(.4*W,.8*H)}L${q(.4*W+.2*H,.6*H)}L${q(W-3,.6*H)}`} fill="none" stroke="#d62828" strokeWidth={Math.max(1,S.design.cats[0].w*f)} strokeLinecap="round" strokeLinejoin="round"/>
    <text x={x0+S.title.x*k} y={y0+S.title.y*k} dominantBaseline="hanging" fontFamily={ff(t1.font)} fontSize={t1.size*f} fontWeight={t1.b?700:400} fill={t1.color}>{S.title.text}</text>
    <text x={x0+S.title.x*k} y={y0+S.title.y*k+t1.size*1.35*f} dominantBaseline="hanging" fontFamily={ff(t2.font)} fontSize={t2.size*f} fill={t2.color}>{S.title.sub}</text>
    <text x="160" y="232" textAnchor="middle" fontSize="11" fill="#777">{pg.fmt&&pg.fmt!=="free"?pg.fmt+" · "+(pg.orient==="port"?"Hochformat":"Querformat")+" · ":""}{W} × {H} Kästchen</text></svg>;
}
function DesignPv({S}){
  const c=S.design.cats,c2=c[1]||c[0],sp=SP(),SZ=({s:[5,0],m:[7,2],l:[10,5]})[sp.size]||[7,2],R=c[0].w/2+SZ[1]+sp.bw,tp=S.design.tpl.stop;
  const stp=(x,y,n)=><g key={n}><circle cx={x} cy={y} r={R-sp.bw/2} fill={sp.fill} stroke={sp.color} strokeWidth={sp.bw}/><text x={x} y={y-R-8} textAnchor="middle" fontFamily={ff(tp.font)} fontSize={tp.size} fontWeight={tp.b?700:400} fill={tp.color}>{n}</text></g>;
  return <svg viewBox="0 0 320 240" style={{width:"100%"}}><g fill="none" strokeLinejoin="round"><path d="M20 70H110L170 130" stroke="#1d6fb8" strokeWidth={c2.w} strokeLinecap={c2.dash==="dash"?"butt":"round"} strokeDasharray={dsh(c2.dash)}/><path d="M20 190H110L170 130H300" stroke="#d62828" strokeWidth={c[0].w} strokeLinecap={c[0].dash==="dash"?"butt":"round"} strokeDasharray={dsh(c[0].dash)}/></g>
    {stp(60,190,"Erfurt")}{stp(170,130,"Weimar")}{stp(260,130,"Jena")}<text x="20" y="226" fontSize="11" fill="#777">Vorschau: Haltestellen, Linienstärken, Schrift</text></svg>;
}
export default function Wizard(){
  const st=useStore(),{S,wiz,edit}=st,set=useStore.setState,fRef=useRef(),dRef=useRef();
  if(!wiz)return null;
  setS(S);
  const pg=S.page||{},e=(fn,p=false)=>edit(fn,p),fin=()=>set({wiz:null,past:[],future:[],dirty:false});
  const pa=(f,v)=>e(D=>{D.page={fmt:(D.page||{}).fmt||"free",orient:(D.page||{}).orient||"land"};D.page[f]=v;setS(D);pageSync("cols")});
  const openF=ev=>{const f=ev.target.files[0];ev.target.value="";f&&f.text().then(t=>{try{const d=JSON.parse(t);if(!d.design||!d.stops)throw 0;st.load(d);addRecent(f.name,t);set({wiz:null})}catch{alert("Datei konnte nicht gelesen werden.")}})};
  const sp=SP(),cats=S.design.cats;
  const right={
   start:<><Text size={800} weight="bold" block>Liniennetz-Editor</Text><p style={{opacity:.75}}>Haltestellen setzen, Linien zuordnen – den Rest zeichnet das Programm.</p>
     <div style={{display:"flex",gap:8,margin:"12px 0"}}><Button appearance="primary" onClick={()=>{st.fresh();set({wiz:"plan"})}}>Neues Projekt</Button><Button onClick={()=>fRef.current.click()}>Datei öffnen…</Button></div>
     <Text weight="semibold" block style={{marginTop:16}}>Zuletzt verwendet</Text>
     {recents().length?recents().map((x,i)=><div key={i}><Button appearance="subtle" onClick={()=>{try{st.load(JSON.parse(x.data));set({wiz:null})}catch{alert("Datei konnte nicht gelesen werden.")}}}>{x.name} <span style={{opacity:.6,marginLeft:8,fontSize:12}}>{new Date(x.time).toLocaleString("de")}</span></Button></div>):<p style={{opacity:.7}}>Noch keine Dateien.</p>}
     <div style={{marginTop:20}}><Button onClick={fin}>Assistent schließen</Button></div></>,
   plan:<><Text size={200} block style={{opacity:.7}}>Schritt 1 von 2 · Planeinstellungen</Text><Text size={700} weight="bold" block>Plan</Text>
     <div style={{display:"grid",gap:10,margin:"14px 0"}}><Tx l="Titel" v={S.title.text} on={v=>e(D=>{D.title.text=v})}/><Tx l="Untertitel" v={S.title.sub} on={v=>e(D=>{D.title.sub=v})}/>
     <div style={{display:"flex",gap:10}}><Sl l="Seitenformat" v={pg.fmt||"free"} on={v=>pa("fmt",v)} o={[["A4","A4"],["A3","A3"],["free","Frei"]]}/><Sl l="Ausrichtung" v={pg.orient||"land"} on={v=>pa("orient",v)} o={[["land","Querformat"],["port","Hochformat"]]}/></div>
     <div style={{display:"flex",gap:10}}><Tx l="Spalten (Kästchen)" t="number" w={120} v={S.cols||56} on={v=>e(D=>{D.cols=Math.max(5,v);setS(D);pageSync("cols")})}/><Tx l="Zeilen" t="number" w={120} v={S.rows||36} on={v=>e(D=>{D.rows=Math.max(5,v)})}/></div>
     <Text size={200} style={{opacity:.7}}>Bei A4/A3 ergeben sich die Zeilen aus den Spalten.</Text></div>
     <div style={{display:"flex",gap:8}}><Button onClick={()=>set({wiz:"start"})}>Zurück</Button><Button appearance="primary" onClick={()=>set({wiz:"design"})}>Weiter</Button></div></>,
   design:<><Text size={200} block style={{opacity:.7}}>Schritt 2 von 2 · Entwurf</Text><Text size={700} weight="bold" block>Entwurf</Text>
     <div style={{display:"grid",gap:10,margin:"14px 0"}}><Sl l="Haltestellensymbol" v={sp.size} on={v=>e(D=>{(D.design.stop=D.design.stop||{}).size=v})} o={[["s","Klein"],["m","Mittel"],["l","Groß"]]}/>
     <div style={{display:"flex",gap:10}}><Tx l={"Stärke „"+cats[0].name+"“"} t="number" w={120} v={cats[0].w} on={v=>e(D=>{D.design.cats[0].w=Math.max(1,v)})}/>{cats[1]&&<Tx l={"Stärke „"+cats[1].name+"“"} t="number" w={120} v={cats[1].w} on={v=>e(D=>{D.design.cats[1].w=Math.max(1,v)})}/>}</div>
     <Tx l="Schriftart (alle Textvorlagen)" v={TP("stop").font} on={v=>e(D=>Object.values(D.design.tpl).forEach(t=>{t.font=v}))}/>
     <div><Button onClick={()=>dRef.current.click()}>Entwurf aus Datei laden…</Button></div></div>
     <div style={{display:"flex",gap:8}}><Button onClick={()=>set({wiz:"plan"})}>Zurück</Button><Button appearance="primary" onClick={fin}>Fertig</Button></div></>
  }[wiz];
  return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"auto",background:"var(--colorNeutralBackground3)"}}>
    <div style={{display:"grid",gridTemplateColumns:"minmax(300px,1.3fr) minmax(320px,1fr)",width:"100%",maxWidth:1100,minHeight:560,background:"var(--colorNeutralBackground1)",borderRadius:12,boxShadow:"0 12px 40px #0003",overflow:"hidden"}}>
      <div style={{background:"#fff",display:"flex",alignItems:"center",padding:28}}>{wiz==="start"?<Intro/>:wiz==="plan"?<PlanPv S={S}/>:<DesignPv S={S}/>}</div>
      <div style={{padding:40}}>{right}</div></div>
    <input ref={fRef} type="file" accept=".json" hidden onChange={openF}/>
    <input ref={dRef} type="file" accept=".json" hidden onChange={ev=>{const f=ev.target.files[0];ev.target.value="";f&&f.text().then(t=>{try{const d=JSON.parse(t);if(!d.cats||!d.tpl)throw 0;e(D=>{D.design=d})}catch{alert("Datei konnte nicht gelesen werden.")}})}}/></div>;
}
