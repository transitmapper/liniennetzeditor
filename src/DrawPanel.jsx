import React,{useState,useRef} from "react";
import {Button,Select} from "@fluentui/react-components";
import {useStore} from "./store.js";
import {Shell,R,Tx,Sl,Ck,Ta} from "./ui.jsx";
import {newId,defDesign,CW,CH,DIRS,labelsOf,TNs,setS} from "./core/engine.js";
const Gp=({t,children})=><div style={{display:"flex",flexDirection:"column",padding:"0 12px",borderRight:"1px solid var(--colorNeutralStroke2)"}}><div style={{display:"flex",gap:6,alignItems:"flex-end",flex:1}}>{children}</div><div style={{fontSize:11,textAlign:"center",opacity:.7,marginTop:4}}>{t}</div></div>;
export function DrawPanel(){
  const {S,selX:x,tool,edit}=useStore(),set=useStore.setState,os=S.design.ostyles||defDesign().ostyles,[st,setSt]=useState(os[0].id);
  const iRef=useRef(),addImg=f=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const ar=im.naturalHeight/im.naturalWidth||1,w=10,b={id:newId(),name:f.name,src:r.result,x:Math.max(0,(CW()>>1)-5),y:Math.max(0,(CH()>>1)-3),w,h:Math.max(1,Math.round(w*ar)),ar,op:100,front:0,free:0};edit(D=>(D.imgs=D.imgs||[]).push(b));set({selX:{t:"i",id:b.id},sel:null,dlg:"draw"})};im.src=r.result};r.readAsDataURL(f)};
  return <>
    <input ref={iRef} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files[0];e.target.value="";f&&addImg(f)}}/>
    <Gp t="Zeichnen"><Select value={st} onChange={(_,d)=>setSt(d.value)}>{os.map(q=><option key={q.id} value={q.id}>{q.name}</option>)}</Select>
      {tool?<Button appearance="primary" onClick={()=>{edit(D=>{const b=D.objs.find(q=>q.id===tool);if(b&&b.pts.length<2)D.objs=D.objs.filter(q=>q!==b)},false);set({tool:null})}}>Fertig</Button>:<Button onClick={()=>{const b={id:newId(),style:st,pts:[],dash:"",arrow:0};edit(D=>{D.lockObj=0;(D.objs=D.objs||[]).push(b)});set({tool:b.id,selX:{t:"o",id:b.id},sel:null})}}>Zeichnen</Button>}
      <label><input type="checkbox" checked={!!S.lockObj} onChange={e=>edit(D=>{D.lockObj=+e.target.checked})}/> sperren</label></Gp>
    <Gp t="Einfügen"><Button onClick={()=>{const b={id:newId(),text:"Text",x:CW()>>1,y:CH()>>1,tpl:"text",rot:0};edit(D=>(D.texts=D.texts||[]).push(b));set({selX:{t:"t",id:b.id},sel:null,dlg:"draw"})}}>Freier Text</Button>
      <Button disabled={!S.lines.length} onClick={()=>{const X=CW()>>1,Y=CH()>>1,b={id:newId(),lines:[S.lines[0].id],text:"Erklärung",x:X,y:Y,tx:X-4,ty:Y+3};edit(D=>(D.anns=D.anns||[]).push(b));set({selX:{t:"a",id:b.id},sel:null,dlg:"draw"})}}>Astanmerkung</Button><Button onClick={()=>iRef.current.click()}>Bild einfügen…</Button></Gp>
    <Gp t="Bearbeiten"><Select value={x?x.t+"|"+x.id:""} onChange={(_,d)=>{const [tt,id]=d.value.split("|");set({selX:id?{t:tt,id}:null,sel:null})}}><option value="">– Objekt wählen –</option>{(S.objs||[]).map(b=><option key={b.id} value={"o|"+b.id}>Objekt ({b.pts.length} Punkte)</option>)}{(S.texts||[]).map(b=><option key={b.id} value={"t|"+b.id}>Text: {b.text}</option>)}{(S.anns||[]).map(b=><option key={b.id} value={"a|"+b.id}>Anm.: {b.text}</option>)}{(S.imgs||[]).map(b=><option key={b.id} value={"i|"+b.id}>Bild: {b.name}</option>)}</Select>
      <Button disabled={!x} onClick={()=>set({dlg:"draw"})}>Eigenschaften…</Button></Gp></>;
}
export function DrawDialog(){
  const {S,selX:x,dlg,edit}=useStore(),set=useStore.setState,os=S.design.ostyles||defDesign().ostyles;
  setS(S);const im=x&&x.t==="i"&&(S.imgs||[]).find(b=>b.id===x.id);
  const o=x&&x.t==="o"&&(S.objs||[]).find(b=>b.id===x.id),t=x&&x.t==="t"&&(S.texts||[]).find(b=>b.id===x.id),a=x&&x.t==="a"&&(S.anns||[]).find(b=>b.id===x.id);
  const annIds=a=>a.lines||(a.line?[a.line]:[]),AL=(a,fn)=>edit(D=>{const q=D.anns.find(z=>z.id===a.id);q.lines=fn(annIds(q));delete q.line}),LB=(b,fn,p)=>edit(D=>{const x=D.objs.find(q=>q.id===b.id);x.labels=labelsOf(x).map(q=>({...q}));delete x.label;fn(x.labels)},p);
  const up=(arr,id,f,v,p)=>edit(D=>{D[arr].find(q=>q.id===id)[f]=v},p);
  return <Shell side open={dlg==="draw"} title="Eigenschaften">
    {!x&&<p>Nichts gewählt. Klicke ein Objekt im Plan an oder wähle es in der Liste.</p>}
    {o&&<><R><Sl l="Stil" v={o.style} on={v=>up("objs",o.id,"style",v)} o={os.map(q=>[q.id,q.name])}/><Sl l="Strichart" v={o.dash||""} on={v=>up("objs",o.id,"dash",v)} o={[["","laut Stil"],["none","durchgezogen"],["dash","gestrichelt"],["dot","gepunktet"]]}/></R>
      <R><Ck v={o.arrow} on={v=>up("objs",o.id,"arrow",v)} t="Pfeil am Ende"/><Ck v={o.s45} on={v=>up("objs",o.id,"s45",v)} t="nur 0°/45°/90°"/></R>
      <R><Ck v={o.back} on={v=>up("objs",o.id,"back",v)} t="In den Hintergrund (hinter alle anderen Zeichenobjekte)"/><Ck v={o.noLeg} on={v=>up("objs",o.id,"noLeg",v)} t="Nicht in der Legende"/></R>
      {!!o.arrow&&<R><Ta l="Beschriftung der Pfeilspitze (Enter = Zeilenumbruch)" v={o.alabel||""} on={v=>up("objs",o.id,"alabel",v,false)}/><Sl l="Position" v={o.apos||"E"} on={v=>up("objs",o.id,"apos",v)} o={Object.keys(DIRS).map(k=>[k,k])}/></R>}
      {labelsOf(o).map((q,k)=><div key={k} style={{border:"1px solid var(--colorNeutralStroke2)",borderRadius:6,padding:6,margin:"6px 0"}}><R><Tx l={"Beschriftung "+(k+1)} v={q.text||""} on={v=>LB(o,a=>{a[k].text=v},false)}/><Button size="small" onClick={()=>LB(o,a=>{a.splice(k,1)})}>Entfernen</Button></R>
        <R><Sl l="Vorlage" v={q.tpl||"water"} on={v=>LB(o,a=>{a[k].tpl=v})} o={Object.entries(TNs())}/><Sl l="Lage" v={q.side||"on"} on={v=>LB(o,a=>{a[k].side=v})} o={[["on","auf der Linie"],["in","rechts (in Zeichenrichtung)"],["out","links (in Zeichenrichtung)"],["mid","Mitte der Fläche"]]}/></R>
        <R><Tx l="Startposition (% der Länge)" t="number" w={110} v={q.pos==null?50:q.pos} on={v=>LB(o,a=>{a[k].pos=Math.max(0,Math.min(100,v))},false)}/><Tx l="Wiederholen alle … Kästchen (0 = nicht)" t="number" w={140} v={q.gap||0} on={v=>LB(o,a=>{a[k].gap=Math.max(0,v)},false)}/>{q.side==="mid"&&<Tx l="Drehung (°)" t="number" w={90} v={q.rot||0} on={v=>LB(o,a=>{a[k].rot=v},false)}/>}</R></div>)}
      <R><Button onClick={()=>LB(o,a=>{a.push({text:"Name",tpl:"area",side:"on",gap:0,pos:50})})}>Beschriftung hinzufügen</Button></R>
      <R><Button onClick={()=>set({tool:o.id})}>Weiterzeichnen</Button><Button onClick={()=>edit(D=>{D.objs.find(q=>q.id===o.id).pts.pop()})}>Letzten Punkt löschen</Button></R></>}
    {t&&<><R><Tx l="Text" v={t.text} on={v=>up("texts",t.id,"text",v,false)}/><Tx l="Drehung (°)" t="number" w={80} v={t.rot||0} on={v=>up("texts",t.id,"rot",v,false)}/></R><R><Sl l="Vorlage" v={t.tpl} on={v=>up("texts",t.id,"tpl",v)} o={Object.entries(TNs())}/><Ck v={t.bold} on={v=>up("texts",t.id,"bold",v)} t="Fett"/><Ck v={t.right} on={v=>up("texts",t.id,"right",v)} t="Rechtsbündig"/></R></>}
    {a&&<><R><Tx l="Text" v={a.text} on={v=>up("anns",a.id,"text",v,false)}/></R><R>{annIds(a).map((id,k)=>{const l=S.lines.find(q=>q.id===id);return l?<span key={id+k} style={{background:l.color,color:"#fff",borderRadius:l.shape==="rect"?3:99,padding:"2px 4px 2px 12px"}}>{l.name} <Button size="small" appearance="subtle" onClick={()=>AL(a,ids=>ids.filter((_,j)=>j!==k))}>×</Button></span>:null})}</R><Sl l="Linienbadge hinzufügen" v="" on={v=>v&&AL(a,ids=>[...ids,v])} o={[["","wählen…"],...S.lines.map(l=>[l.id,l.name])]}/></>}
    {im&&<><R><Tx l="X (Kästchen)" t="number" w={80} v={im.x} on={v=>up("imgs",im.id,"x",v,false)}/><Tx l="Y (Kästchen)" t="number" w={80} v={im.y} on={v=>up("imgs",im.id,"y",v,false)}/>
      <Tx l="Breite" t="number" w={80} v={im.w} on={v=>edit(D=>{const m=D.imgs.find(q=>q.id===im.id);m.w=Math.max(1,v);if(!m.free)m.h=Math.max(1,Math.round(m.w*(m.ar||1)))},false)}/><Tx l="Höhe" t="number" w={80} v={im.h} on={v=>edit(D=>{const m=D.imgs.find(q=>q.id===im.id);m.h=Math.max(1,v);if(!m.free)m.w=Math.max(1,Math.round(m.h/(m.ar||1)))},false)}/></R>
      <R><Ck v={im.free} on={v=>up("imgs",im.id,"free",v)} t="Seitenverhältnis frei"/><Tx l="Deckkraft %" t="number" w={90} v={im.op==null?100:im.op} on={v=>up("imgs",im.id,"op",Math.max(0,Math.min(100,v)),false)}/><Sl l="Ebene" v={String(im.front?1:0)} on={v=>up("imgs",im.id,"front",+v)} o={[["0","Hintergrund (hinter dem Netz)"],["1","Vordergrund (vor dem Netz)"]]}/></R>
      <p style={{opacity:.7,fontSize:12}}>Im Plan: blauer Punkt oben links verschiebt, weißer Punkt unten rechts ändert die Größe.</p></>}
    {x&&<R><Button onClick={()=>{edit(D=>{const f=k=>(D[k]||[]).filter(q=>q.id!==x.id);if(x.t==="o")D.objs=f("objs");else if(x.t==="t")D.texts=f("texts");else if(x.t==="i")D.imgs=f("imgs");else D.anns=f("anns")});set({selX:null,tool:null})}}>Löschen</Button></R>}</Shell>;
}
