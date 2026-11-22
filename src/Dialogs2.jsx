import React,{useState} from "react";
import {Button,TabList,Tab,Label,Slider} from "@fluentui/react-components";
import {useStore} from "./store.js";
import {Shell,R,Tx,Sl,Ck,Co,Ta} from "./ui.jsx";
import {setS,SP,TP,TN,LT,TR,OSt,defDesign,newId,pageSync,DIRS,getLB,TNs} from "./core/engine.js";
function BadgeEditor({id}){
  const {S,edit}=useStore(),s=S.stops.find(x=>x.id===id),ends=((getLB().ends||{})[id]||[]).map(l=>l.id),ids=[...ends,...(s.badges||[]).filter(i=>!ends.includes(i))],ln=i=>S.lines.find(l=>l.id===i);
  const bo=i=>edit(D=>{const L=D.lines.find(x=>x.id===i),m=L.bo=L.bo||{};if(m[id])delete m[id];else m[id]=1});
  return <><Label size="small">Linienbadges an dieser Haltestelle (an Endhaltestellen automatisch)</Label>
    {ids.map(i=>{const l=ln(i);return l?<R key={i}><span style={{background:l.color,color:"#fff",borderRadius:l.shape==="rect"?3:99,padding:"2px 12px"}}>{l.name}</span><Ck v={(l.bo||{})[id]} on={()=>bo(i)} t="umrandet (Linienfarbe, weiß gefüllt)"/>{!ends.includes(i)&&<Button size="small" onClick={()=>edit(D=>{const q=D.stops.find(x=>x.id===id);q.badges=(q.badges||[]).filter(z=>z!==i)})}>Entfernen</Button>}</R>:null})}
    <Sl l="Linienbadge hinzufügen" v="" on={v=>v&&edit(D=>{const q=D.stops.find(x=>x.id===id);q.badges=[...(q.badges||[]),v]})} o={[["","wählen…"],...S.lines.filter(l=>!ids.includes(l.id)).map(l=>[l.id,l.name])]}/></>;
}
/* Layout-Bausteine für die Plan-Einstellungen: Abschnitt mit Überschrift und CSS-Grid */
const Sec=({t,hint,children})=><section style={{margin:"0 0 20px"}}>
  <div style={{fontWeight:600,fontSize:14,paddingBottom:4,marginBottom:hint?4:10,borderBottom:"1px solid var(--colorNeutralStroke2)"}}>{t}</div>
  {hint&&<div style={{fontSize:12,opacity:.7,marginBottom:10}}>{hint}</div>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"10px 14px",alignItems:"end"}}>{children}</div></section>;
const Full=({children})=><div style={{gridColumn:"1 / -1"}}>{children}</div>;
const Cb=({children})=><div style={{paddingBottom:6}}>{children}</div>;
export function PlanDialog(){
  const {S,dlg,edit}=useStore(),pg=S.page||{},u=(f,v)=>edit(D=>{D[f]=v},false),e=(fn,p)=>edit(fn,p);
  if(dlg!=="plan")return <Shell open={false}/>;
  const pa=(f,v)=>edit(D=>{D.page={fmt:(D.page||{}).fmt||"free",orient:(D.page||{}).orient||"land"};D.page[f]=v;setS(D);pageSync("cols")});
  return <Shell open title="Plan-Einstellungen">
    <Sec t="Texte">
      <Tx l="Titel" v={S.title.text} on={v=>e(D=>{D.title.text=v},false)}/>
      <Tx l="Untertitel" v={S.title.sub} on={v=>e(D=>{D.title.sub=v},false)}/>
      <Tx l="Fußzeile / Quelle" v={S.foot||""} on={v=>u("foot",v)}/>
    </Sec>
    <Sec t="Seite und Raster" hint="Bei A4/A3 ergeben sich die Zeilen aus den Spalten.">
      <Sl l="Seitenformat" v={pg.fmt||"free"} on={v=>pa("fmt",v)} o={[["free","Frei"],["A4","A4"],["A3","A3"]]}/>
      <Sl l="Ausrichtung" v={pg.orient||"land"} on={v=>pa("orient",v)} o={[["land","Querformat"],["port","Hochformat"]]}/>
      <Tx l="Spalten" t="number" v={S.cols||56} on={v=>e(D=>{D.cols=Math.max(5,v);setS(D);pageSync("cols")},false)}/>
      <Tx l="Zeilen" t="number" v={S.rows||36} on={v=>u("rows",Math.max(5,v))}/>
      <Sl l="PNG-Auflösung" v={String(+S.pngk||2)} on={v=>u("pngk",+v)} o={[["1","1×"],["2","2×"],["4","4×"]]}/>
      <Cb><Ck v={S.frame} on={v=>u("frame",v)} t="Rahmen um den Plan"/></Cb>
    </Sec>
    <Sec t="Titel auf dem Plan" hint="Position in Rasterkästchen.">
      <Cb><Ck v={S.title.on} on={v=>e(D=>{D.title.on=v})} t="Titel anzeigen"/></Cb>
      <Tx l="Spalte" t="number" v={S.title.x} on={v=>e(D=>{D.title.x=v},false)}/>
      <Tx l="Zeile" t="number" v={S.title.y} on={v=>e(D=>{D.title.y=v},false)}/>
    </Sec>
    <Sec t="Legende und Linienübersicht" hint="Position in Rasterkästchen.">
      <Cb><Ck v={S.legend.on} on={v=>e(D=>{D.legend.on=v})} t="Legende anzeigen"/></Cb>
      <Tx l="Spalte" t="number" v={S.legend.x} on={v=>e(D=>{D.legend.x=v},false)}/>
      <Tx l="Zeile" t="number" v={S.legend.y} on={v=>e(D=>{D.legend.y=v},false)}/>
      <Cb><Ck v={S.legend.ov!==0} on={v=>e(D=>{D.legend.ov=v})} t="Linienübersicht anzeigen"/></Cb>
      <Cb><Ck v={S.legend.en} on={v=>e(D=>{D.legend.en=v})} t="Englische Überschriften"/></Cb>
      <Full><Ck v={S.legend.sep} on={v=>e(D=>{D.legend.sep=v})} t="Linienübersicht unabhängig von der Legende platzieren"/></Full>
      {!!S.legend.sep&&<>
        <Tx l="Übersicht: Spalte" t="number" v={S.legend.lx==null?S.legend.x:S.legend.lx} on={v=>e(D=>{D.legend.lx=v},false)}/>
        <Tx l="Übersicht: Zeile" t="number" v={S.legend.ly==null?12:S.legend.ly} on={v=>e(D=>{D.legend.ly=v},false)}/></>}
    </Sec>
    <Sec t="Linien und Linienbündel">
      <Sl l="Linienbündel" v={S.lanes||"center"} on={v=>e(D=>{D.lanes=v})} o={[["center","zentriert (wie bisher)"],["straight","geradlinig bevorzugen"]]}/>
      {S.lanes==="straight"&&<Sl l="Max. Abweichung von der Rasterlinie" v={String(S.laneMax==null?1.5:S.laneMax)} on={v=>e(D=>{D.laneMax=+v})} o={[["0.5","0,5 Spuren"],["1","1 Spur"],["1.5","1,5 Spuren"],["2","2 Spuren"],["3","3 Spuren"],["99","unbegrenzt"]]}/>}
      <Full><Ck v={S.lineOutline} on={v=>u("lineOutline",v)} t="Überlagerte Linien mit weißem Rahmen abgrenzen (die oben liegende Linie trennt sich sichtbar von der unteren; Ebene je Linie unter „Linien bearbeiten“)"/></Full>
      <Full><Ck v={S.sortImp} on={v=>u("sortImp",v)} t="Linien in Legende und Übersicht nach Wichtigkeit sortieren"/></Full>
    </Sec>
    <Sec t="Haltestellenbeschriftung und Linienbadges">
      <Full><Label size="small">Hinterlegung der Haltestellennamen (weiß, Deckkraft): {S.nameBg||0} %</Label>
        <Slider min={0} max={100} step={10} value={S.nameBg||0} onChange={(_,d)=>u("nameBg",d.value)} style={{width:"100%"}}/>
        <div style={{fontSize:12,opacity:.7}}>Stärke für den ganzen Plan; 0 % = keine Hinterlegung. Ob ein Name hinterlegt wird, lässt sich je Haltestelle festlegen.</div></Full>
      <Full><Ck v={S.nameBgAll!==0} on={v=>u("nameBgAll",v)} t="Standardmäßig alle Haltestellennamen hinterlegen (je Haltestelle änderbar)"/></Full>
      <Tx l="Badges pro Zeile (Endstationen)" t="number" v={S.bpr||6} on={v=>u("bpr",Math.max(1,Math.min(20,v)))}/>
      <Full><Ck v={S.bUnder} on={v=>u("bUnder",v)} t="Linienbadges unter dem Haltestellennamen (global, alle Ausrichtungen)"/></Full>
      <Full><Ck v={S.bCenter} on={v=>u("bCenter",v)} t="Name und Badges zur Haltestelle zentrieren (links/rechts)"/></Full>
    </Sec>
    <Sec t="Zeichenobjekte">
      <Full><Ck v={S.areasBack} on={v=>u("areasBack",v)} t="Alle Flächen in den Hintergrund (hinter alle anderen Zeichenobjekte)"/></Full>
    </Sec></Shell>;
}
export function StopDialog(){
  const {S,sel,dlg,edit}=useStore(),set=useStore.setState,[nn,setNn]=useState("");
  const id=sel&&sel.split("#")[0],s=S.stops.find(x=>x.id===id),srt=[...S.stops].sort((a,b)=>a.name.localeCompare(b.name,"de")),up=(f,v)=>edit(D=>{D.stops.find(x=>x.id===id)[f]=v},false);
  const add=wp=>{const o={id:newId(),name:nn.trim()||(wp?"Wegpunkt":"Neue Haltestelle"),x:null,y:null,label:"E",...(wp?{wp:1}:{})};edit(D=>D.stops.push(o));set({sel:o.id});setNn("")};
  return <Shell side open={dlg==="stop"} title="Haltestellen und Wegpunkte">
    <R><Tx l="Neuer Name" v={nn} on={setNn}/><Button onClick={()=>add()}>Haltestelle</Button><Button onClick={()=>add(1)}>Wegpunkt</Button></R>
    <Sl l="Haltestelle wählen (danach auf den Plan klicken zum Setzen)" v={id||""} on={v=>set({sel:v||null})} o={[["","–"],...srt.map(x=>[x.id,(x.wp?"Wegpunkt: ":"")+x.name+(x.x==null?" (nicht gesetzt)":"")])]}/>
    {s&&<><R><Ta l="Name (Enter = Zeilenumbruch, mitten im Wort mit automatischem Bindestrich)" v={s.name} on={v=>up("name",v)}/></R>
      {!s.wp&&<><R><Sl l="Beschriftung" v={s.label||"E"} on={v=>up("label",v)} o={Object.keys(DIRS).map(k=>[k,k])}/><Tx l="Textabstand (Linien)" t="number" w={90} v={s.ld||0} on={v=>up("ld",v)}/><Ck v={s.bold} on={v=>up("bold",v)} t="Fett"/><Sl l="Linienbadges" v={s.bu==null?"":String(s.bu)} on={v=>up("bu",v===""?undefined:+v)} o={[["","wie global"],["1","unter dem Namen"],["0","über dem Namen"]]}/><Sl l="Namenshinterlegung" v={s.nb==null?"":String(s.nb)} on={v=>up("nb",v===""?undefined:+v)} o={[["","wie Plan-Standard"],["1","an"],["0","aus"]]}/></R>
        <R><Tx l="Anmerkung (Fußnote)" v={s.fn||""} on={v=>up("fn",v)}/></R>
        <BadgeEditor id={id}/>
        <R><Button onClick={()=>{edit(D=>{const q=D.stops.find(x=>x.id===id);(q.alt=q.alt||[]).push({x:null,y:null});set({sel:id+"#"+q.alt.length})})}}>Standort aufsplitten</Button></R>
        {(s.alt||[]).map((a,k)=><R key={k}><span>Standort {k+2}{a.x==null?" (nicht gesetzt)":""}</span><Button onClick={()=>set({sel:id+"#"+(k+1)})}>Setzen</Button><Button onClick={()=>{edit(D=>{const q=D.stops.find(x=>x.id===id);q.alt.splice(k,1);D.lines.forEach(l=>{const m=l.loc;if(m&&m[id]!=null){if(m[id]===k+1)m[id]=0;else if(m[id]>k+1)m[id]--}})});set({sel:id})}}>Löschen</Button></R>)}</>}
      <R><Button onClick={()=>{edit(D=>{D.stops=D.stops.filter(x=>x.id!==id);D.lines.forEach(l=>{l.sections=l.sections.map(c=>c.filter(i=>i!==id))})});set({sel:null})}}>Haltestelle löschen</Button></R></>}</Shell>;
}
export function DesignDialog(){
  const {S,dlg,dtab,edit}=useStore(),set=useStore.setState;
  if(dlg!=="design")return <Shell open={false}/>;
  setS(S);const sp=SP(),D0=S.design,os=D0.ostyles||defDesign().ostyles;
  const sf=(f,v)=>edit(X=>{(X.design.stop=X.design.stop||{})[f]=v},false),ct=(i,f,v,p)=>edit(X=>{X.design.cats.find(c=>c.id===i)[f]=v},p),
   tp=(k,f,v)=>edit(X=>{(X.design.tpl[k]=X.design.tpl[k]||{...TP(k)})[f]=v},false),oss=(i,f,v,p)=>edit(X=>{OSt().find(o=>o.id===i)[f]=v},p),lt=(k,v)=>edit(X=>{(X.design.legtxt=X.design.legtxt||{})[k]=v},false),tr=(k,v)=>edit(X=>{(X.design.tr=X.design.tr||{})[k]=v},false);
  const AN={w:2,head:12,gap:10,color:"",...(D0.ann||{})},sa=(f,v)=>edit(X=>{(X.design.ann=X.design.ann||{})[f]=v},false);
  const newTpl=()=>{const nm=prompt("Name der neuen Textvorlage (z. B. Landesname groß):");if(!nm)return;const k="c_"+newId();edit(X=>{X.design.tpl[k]={...TP("text")};(X.design.tplNames=X.design.tplNames||{})[k]=nm})};
  const dash=[["","durchgezogen"],["dash","gestrichelt"],["dot","gepunktet"]];
  const body={
   sym:<><R><Sl l="Größe" v={sp.size} on={v=>sf("size",v)} o={[["s","Klein"],["m","Mittel"],["l","Groß"]]}/><Tx l="Kontur" t="number" w={70} v={sp.bw} on={v=>sf("bw",v)}/><Co l="Konturfarbe" v={sp.color} on={v=>sf("color",v)}/><Co l="Füllung" v={sp.fill} on={v=>sf("fill",v)}/></R>
     <R><Tx l="Verbindung aufgesplittet" t="number" w={90} v={sp.cw} on={v=>sf("cw",v)}/><Co l="Farbe" v={sp.cc} on={v=>sf("cc",v)}/><Co l="Umrandung zeitweise" v={sp.tc} on={v=>sf("tc",v)}/></R></>,
   cats:<>{D0.cats.map(c=><R key={c.id}><Tx l="Name" v={c.name} on={v=>ct(c.id,"name",v,false)}/><Tx l="Stärke" t="number" w={70} v={c.w} on={v=>ct(c.id,"w",Math.max(1,v),false)}/><Sl l="Strichart" v={c.dash} on={v=>ct(c.id,"dash",v)} o={dash}/><Button disabled={D0.cats.length<2} onClick={()=>edit(X=>{X.design.cats=X.design.cats.filter(q=>q.id!==c.id)})}>Löschen</Button></R>)}<Button onClick={()=>edit(X=>{X.design.cats.push({id:newId(),name:"Neue Kategorie",w:6,dash:""})})}>Kategorie hinzufügen</Button></>,
   tpl:<>{Object.entries(TNs()).map(([k,n])=>{const t=TP(k);return <R key={k}><b style={{width:200}}>{n}</b><Tx l="Schrift" v={t.font} on={v=>tp(k,"font",v)} w={120}/><Tx l="Größe" t="number" w={64} v={t.size} on={v=>tp(k,"size",Math.max(6,v))}/><Co l="Farbe" v={t.color} on={v=>tp(k,"color",v)}/><Ck v={t.b} on={v=>tp(k,"b",v)} t="Fett"/><Ck v={t.i} on={v=>tp(k,"i",v)} t="Kursiv"/><Ck v={t.u} on={v=>tp(k,"u",v)} t="Unterstrichen"/>{!!(D0.tplNames&&D0.tplNames[k])&&<Button size="small" onClick={()=>edit(X=>{delete X.design.tpl[k];delete X.design.tplNames[k]})}>Löschen</Button>}</R>})}<Button onClick={newTpl}>Neue Textvorlage…</Button></>,
   ost:<>{os.map(o=><R key={o.id}><Tx l="Name" v={o.name} on={v=>oss(o.id,"name",v,false)}/><Co l="Farbe" v={o.color} on={v=>oss(o.id,"color",v,false)}/><Tx l="Breite" t="number" w={64} v={o.w} on={v=>oss(o.id,"w",v,false)}/><Sl l="Strichart" v={o.dash||""} on={v=>oss(o.id,"dash",v)} o={dash}/><Ck v={o.area} on={v=>oss(o.id,"area",v)} t="Fläche"/><Button disabled={os.length<2} onClick={()=>edit(X=>{X.design.ostyles=OSt().filter(q=>q.id!==o.id)})}>Löschen</Button></R>)}<Button onClick={()=>edit(X=>{OSt().push({id:newId(),name:"Neuer Stil",color:"#888888",w:4,dash:"",smooth:0,area:0})})}>Zeichenstil hinzufügen</Button></>,
   leg:<>{["legend","list","notes","plain","part","dirAll","dirSome","temp","zig"].map(k=><R key={k}><Tx l={k} v={LT(k)} on={v=>lt(k,v)} w={460}/></R>)}<R>{["legend","list","notes"].map(k=><Tx key={k} l={"Englisch: "+k} v={TR()[k]} on={v=>tr(k,v)}/>)}</R></>,
   ann:<R><Tx l="Strichstärke" t="number" w={90} v={AN.w} on={v=>sa("w",Math.max(.5,v))}/><Tx l="Pfeilspitze (Größe)" t="number" w={100} v={AN.head} on={v=>sa("head",Math.max(2,v))}/><Tx l="Abstand zur Linie (px)" t="number" w={120} v={AN.gap} on={v=>sa("gap",Math.max(0,v))}/><Ck v={!AN.color} on={v=>sa("color",v?"":"#222222")} t="Farbe der ersten Linie übernehmen"/>{!!AN.color&&<Co l="Farbe" v={AN.color} on={v=>sa("color",v)}/>}</R>
  }[dtab||"sym"];
  return <Shell open title="Entwurf"><TabList selectedValue={dtab||"sym"} onTabSelect={(_,d)=>set({dtab:d.value})}>{[["sym","Haltestellensymbol"],["cats","Kategorien"],["tpl","Textvorlagen"],["ost","Zeichenstile"],["leg","Legendentexte"],["ann","Astanmerkung"]].map(([k,n])=><Tab key={k} value={k}>{n}</Tab>)}</TabList><div style={{marginTop:10}}>{body}</div></Shell>;
}