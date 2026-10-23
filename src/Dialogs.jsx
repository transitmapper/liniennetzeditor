import React from "react";
import {Dialog,DialogSurface,DialogBody,DialogTitle,DialogContent,DialogActions,Button,Input,Select,Accordion,AccordionItem,AccordionHeader,AccordionPanel,Label} from "@fluentui/react-components";
import {useStore} from "./store.js";import {R,Tx,Sl,Ck} from "./ui.jsx";import {newId,PAL,ink} from "./core/engine.js";
import {overlaps} from "./tools.js";
import {Shell} from "./ui.jsx";
const mini={size:"small",appearance:"subtle",style:{minWidth:24,padding:"0 4px"}};
function Chip({l,si,k,sid}){
  const {S,edit}=useStore(),s=S.stops.find(x=>x.id===sid); if(!s)return null;
  const ed=fn=>edit(D=>fn(D.lines.find(x=>x.id===l.id)));
  const pass=(l.pass||{})[sid],temp=(l.temp||{})[sid],dv=(l.dir||{})[sid];
  return <span draggable onDragStart={e=>e.dataTransfer.setData("t",JSON.stringify({l:l.id,si,k}))} onDragOver={e=>e.preventDefault()}
    onDrop={e=>{e.preventDefault();const f=JSON.parse(e.dataTransfer.getData("t")||"{}");if(f.l!==l.id||f.si!==si||f.k===k)return;ed(L=>{const a=L.sections[si],[m]=a.splice(f.k,1);a.splice(k,0,m)})}}
    style={{display:"inline-flex",alignItems:"center",border:"1px solid var(--colorNeutralStroke1)",borderRadius:12,padding:"0 4px 0 9px",margin:2,fontSize:12,cursor:"grab"}}>
    {pass?<s>{s.name}</s>:s.name}
    {!s.wp&&<><Button {...mini} title="Halt / zeitweise / Durchfahrt" onClick={()=>ed(L=>{const m=L.pass=L.pass||{},t=L.temp=L.temp||{};if(m[sid])delete m[sid];else if(t[sid]){delete t[sid];m[sid]=1}else t[sid]=1})}>{pass?"○":temp?"◐":"●"}</Button>
      <Button {...mini} title="Richtungshalt" onClick={()=>ed(L=>{const d=L.dir=L.dir||{};if(!d[sid])d[sid]=1;else if(d[sid]===1)d[sid]=-1;else delete d[sid]})}>{dv===1?"→":dv===-1?"←":"·"}</Button>
      <Button {...mini} title="Zwischenhalt in Linienübersicht" onClick={()=>ed(L=>{const m=L.via=L.via||{};if(m[sid])delete m[sid];else m[sid]=1})}>{(l.via||{})[sid]?"⚑":"⚐"}</Button>
      {(s.alt||[]).length>0&&<Button {...mini} title="Standort" onClick={()=>ed(L=>{const m=L.loc=L.loc||{};let q=(m[sid]||0)+1;if(q>s.alt.length)q=0;m[sid]=q})}>#{((l.loc||{})[sid]||0)+1}</Button>}</>}
    <Button {...mini} onClick={()=>ed(L=>{L.sections[si].splice(k,1)})}>×</Button></span>;
}
export function LinesDialog(){
  const {S,dlg,edit,xsel}=useStore(),cats=S.design.cats,srt=[...S.stops].sort((a,b)=>a.name.localeCompare(b.name,"de"));
  return <Shell open={dlg==="lines"} title="Linien bearbeiten"><R><Button onClick={()=>{const o={id:newId(),name:"Linie "+(S.lines.length+1),color:PAL[(S.lines.length*7)%PAL.length],shape:"pill",closed:false,sections:[[]],cats:[cats[0].id],dir:{}};edit(D=>D.lines.push(o))}}>Linie hinzufügen</Button><Button onClick={()=>edit(D=>D.lines.forEach(l=>{l.hidden=false}))}>Alle einblenden</Button></R><Accordion collapsible>{S.lines.map(l=>{const ed=(fn,p)=>edit(D=>fn(D.lines.find(x=>x.id===l.id)),p);
    return <AccordionItem key={l.id} value={l.id}><AccordionHeader><span style={{background:l.color,color:"#fff",borderRadius:l.shape==="rect"?3:99,padding:"1px 12px"}}>{l.name}</span></AccordionHeader><AccordionPanel>
      <R><Tx l="Name" v={l.name} on={v=>ed(L=>{L.name=v},false)} w={110}/><div><Label size="small">Farbe</Label><br/><input type="color" value={l.color} onChange={e=>ed(L=>{L.color=e.target.value},false)}/></div><Sl l="Icon" v={l.shape} on={v=>ed(L=>{L.shape=v})} o={[["pill","Pille"],["rect","Rechteck"]]}/><Ck v={l.closed} on={v=>ed(L=>{L.closed=!!v})} t="Ringlinie"/><Button onClick={()=>edit(D=>D.lines.forEach(x=>{x.hidden=x.id!==l.id}))}>Nur diese zeigen</Button><Button onClick={()=>edit(D=>{D.lines=D.lines.filter(x=>x.id!==l.id)})}>Linie löschen</Button></R><div>{PAL.map(c=><span key={c} onClick={()=>ed(L=>{L.color=c})} style={{display:"inline-block",width:18,height:18,borderRadius:"50%",margin:2,cursor:"pointer",background:c,border:"1px solid #888"}}/>)}</div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><label><input type="checkbox" checked={xsel.includes(l.id)} onChange={e=>useStore.setState({xsel:e.target.checked?[...xsel,l.id]:xsel.filter(i=>i!==l.id)})}/> für Export markieren</label>
        <label><input type="checkbox" checked={!l.hidden} onChange={e=>ed(L=>{L.hidden=!e.target.checked})}/> im Editor sichtbar</label>
        <Input placeholder="Streckentext (leer = automatisch)" style={{flex:1}} value={l.route||""} onChange={(_,d)=>ed(L=>{L.route=d.value},false)}/></div>
      {l.sections.map((sc,si)=><div key={si} style={{borderTop:"1px solid var(--colorNeutralStroke2)",marginTop:8,paddingTop:6}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}><Label>{si?"Ast "+si:"Stamm"}</Label>
          <Select value={(l.cats||[])[si]||cats[0].id} onChange={(_,d)=>ed(L=>{(L.cats=L.cats||[])[si]=d.value})}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select value={(l.follow||{})[si]||""} onChange={(_,d)=>ed(L=>{L.follow=L.follow||{};if(d.value)L.follow[si]=d.value;else delete L.follow[si]})}><option value="">folgt keiner Linie</option>{S.lines.filter(o=>o!==l).map(o=><option key={o.id} value={o.id}>folgt {o.name}</option>)}</Select>
          {si>0&&<Button size="small" onClick={()=>ed(L=>{L.sections.splice(si,1);(L.cats||[]).splice(si,1);const f={};Object.entries(L.follow||{}).forEach(([q,v])=>{q=+q;if(q<si)f[q]=v;else if(q>si)f[q-1]=v});L.follow=f})}>Ast löschen</Button>}</div>
        <div>{sc.map((sid,k)=><Chip key={sid+k} l={l} si={si} k={k} sid={sid}/>)}</div>
        <Select value="" onChange={(_,d)=>d.value&&ed(L=>{L.sections[si].push(d.value)})}><option value="">Halt anhängen…</option>{srt.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</Select></div>)}
      <Button style={{marginTop:8}} onClick={()=>ed(L=>{L.sections.push([]);(L.cats=L.cats||[]).push((cats[1]||cats[0]).id)})}>Ast / Teilstück hinzufügen</Button></AccordionPanel></AccordionItem>})}</Accordion>
    <p style={{opacity:.7,fontSize:12}}>● Halt · ◐ zeitweise · ○ Durchfahrt · → ← Richtungshalt · ⚑ Zwischenhalt der Übersicht · Halte per Ziehen umsortieren.</p></Shell>;
}
export function CheckDialog(){
  const {S,dlg}=useStore(),used=new Set(S.lines.flatMap(l=>l.sections.flat())),W=[],pm={};
  S.stops.forEach(s=>{if(s.wp)return;if(!used.has(s.id))W.push([s.id,s.name+": keiner Linie zugeordnet"]);else if(s.x==null)W.push([s.id,s.name+": nicht platziert"]);
    if((s.alt||[]).some(a=>a.x==null))W.push([s.id,s.name+": ein Standort ist nicht gesetzt"]);if(s.x!=null)(pm[s.x+","+s.y]=pm[s.x+","+s.y]||[]).push(s)});
  Object.values(pm).filter(a=>a.length>1).forEach(a=>W.push([a[0].id,a.map(s=>s.name).join(" und ")+": gleiche Position"]));
  S.lines.forEach(l=>{if(l.sections.every(c=>c.filter(i=>{const t=S.stops.find(x=>x.id===i);return t&&t.x!=null}).length<2))W.push([null,l.name+": weniger als 2 platzierte Halte"])});
  const all=dlg==="check"?[...W,...overlaps(S)]:[];
  return <Shell open={dlg==="check"} title={`Prüfung (${all.length})`}>{all.length?all.map((w,i)=><div key={i}><Button appearance="subtle" onClick={()=>{if(w[0])useStore.setState({sel:w[0],tab:"net",dlg:null})}}>{w[1]}</Button></div>):"Keine Auffälligkeiten."}</Shell>;
}
