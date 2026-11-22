import React from "react";
import {Card,Button,Text} from "@fluentui/react-components";
import {useStore} from "./store.js";
import {getLB,astKeyOf} from "./core/engine.js";
export function Pop(){
  const {pop,S,edit}=useStore(); if(!pop)return null;
  const LB=getLB(),[k,astRaw]=pop.k.split("~"),h=LB.hits[k],L=LB.lanes[k]||[],nm=i=>(S.stops.find(s=>s.id===i.split("#")[0])||{}).name,close=()=>useStore.setState({pop:null});
  const mv=(i,d)=>{const ids=L.map(l=>l.id),a=ids.indexOf(i),b=a+d;if(b<0||b>=ids.length)return;[ids[a],ids[b]]=[ids[b],ids[a]];edit(D=>{(D.order=D.order||{})[k]=ids})};
  const [a,b]=k.split("|");
  /* Abzweigung: mindestens ein Ende der Verbindung hat drei oder mehr Verbindungen */
  const deg={};Object.keys(LB.hits).forEach(q=>q.split("|").forEach(n=>{deg[n]=(deg[n]||0)+1}));
  /* Ast: zusammenhängende Strecke mit gleichbleibender Linienmenge (unabhängig von dazwischenliegenden Halten); Badges gehören zum Ast */
  const astId=astRaw&&LB.asts&&LB.asts[astRaw]?astRaw:null, bk=astId?Object.keys(S.ebadge||{}).filter(q=>astKeyOf(LB,q)===astId):[], bon=bk.length>0,
    astL=astId?LB.use[LB.asts[astId].steps[0].k].map(e=>e.l):[], astLines=astL.map(l=>l.name).join(", "), hide=bon?((S.ebadge[bk[0]]||{}).hide||[]):[], nG=bon?Math.max(1,(S.ebadge[bk[0]]||{}).n||1):1, gC=bon?Math.max(0,(S.ebadge[bk[0]]||{}).gap||0):0;
  const branch=(deg[a]||0)>=3||(deg[b]||0)>=3, straightOn=!!(S.str||{})[k];
  return <Card style={{position:"fixed",left:Math.max(0,Math.min(pop.x,innerWidth-300)),top:Math.max(0,Math.min(pop.y,innerHeight-360)),width:280,zIndex:10}}>
    <Text weight="semibold">{nm(a)} – {nm(b)}</Text>
    {h&&h.diag&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Button size="small" onClick={()=>edit(D=>{D.mode=D.mode||{};if(D.mode[k])delete D.mode[k];else D.mode[k]="rect";if(D.flip)delete D.flip[k]})}>Verlauf: {h.rect?"rechtwinklig":"schräg"}</Button>
      {h.flipOk&&<Button size="small" onClick={()=>edit(D=>{D.flip=D.flip||{};if(D.flip[k])delete D.flip[k];else D.flip[k]=1})}>Knick umlegen</Button>}</div>}
    {branch&&S.lanes==="straight"&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
      <Button size="small" appearance={straightOn?"primary":"secondary"} onClick={()=>edit(D=>{D.str=D.str||{};if(D.str[k])delete D.str[k];else D.str[k]=1})}>Gerade weiterführen: {straightOn?"an":"aus"}</Button>
      <Text size={200}>Abzweigung: Die Linien dieses Astes laufen ab hier ohne Knick geradeaus weiter, auch wenn das Bündel dadurch nicht mehr mittig liegt. Bei mehreren Ästen kann jeder einzeln markiert werden.</Text></div>}
    {astId&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
      <Text size={200}>Ast mit: {astLines}</Text>
      <Button size="small" onClick={()=>edit(D=>{D.ebadge=D.ebadge||{};if(bon)bk.forEach(q=>delete D.ebadge[q]);else D.ebadge[astId]={o:0}})}>{bon?"Linienbadges dieses Astes entfernen":"Linienbadges auf diesen Ast setzen"}</Button></div>}
    {bon&&<div><Button size="small" onClick={()=>edit(D=>{D.ebadge[bk[0]].o=(D.ebadge[bk[0]].o||0)-1})}>◀</Button><Button size="small" onClick={()=>edit(D=>{D.ebadge[bk[0]].o=(D.ebadge[bk[0]].o||0)+1})}>▶</Button></div>}
    {bon&&<div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}><Text size={200}>Badge-Gruppen auf diesem Ast:</Text>
      <Button size="small" disabled={nG<=1} onClick={()=>edit(D=>{const e=D.ebadge[bk[0]];e.n=Math.max(1,nG-1);if(e.n===1)delete e.n})}>−</Button><span>{nG}</span>
      <Button size="small" disabled={nG>=8} onClick={()=>edit(D=>{D.ebadge[bk[0]].n=Math.min(8,nG+1)})}>+</Button>
      {nG===1&&<Text size={200} style={{opacity:.7,width:"100%"}}>Bei langen Ästen mit vielen Halten: mehrere Gruppen werden gleichmäßig verteilt.</Text>}</div>}
    {bon&&nG>1&&<div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}><Text size={200}>Abstand der Gruppen:</Text>
      <Button size="small" disabled={gC<1} onClick={()=>edit(D=>{const e=D.ebadge[bk[0]];if(gC<=1)delete e.gap;else e.gap=gC-1})}>−</Button><span>{gC?gC+" Kästchen":"automatisch"}</span>
      <Button size="small" disabled={gC>=60} onClick={()=>edit(D=>{D.ebadge[bk[0]].gap=gC?gC+1:6})}>+</Button>
      <Button size="small" disabled={!gC} onClick={()=>edit(D=>{delete D.ebadge[bk[0]].gap})}>Automatisch</Button></div>}
    {bon&&astL.length>1&&<><Text size={200}>Einzelne Badges entfernen (×) oder wieder anzeigen (+)</Text>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{astL.map(l=>{const off=hide.includes(l.id);return <span key={l.id} style={{display:"inline-flex",alignItems:"center",gap:2,opacity:off?.5:1}}><span style={{background:l.color,color:"#fff",borderRadius:l.shape==="rect"?3:99,padding:"1px 10px",textDecoration:off?"line-through":"none"}}>{l.name}</span><Button size="small" appearance="subtle" title={off?"Badge wieder anzeigen":"Badge entfernen"} onClick={()=>edit(D=>{const e=D.ebadge[bk[0]],h=e.hide=e.hide||[],i=h.indexOf(l.id);if(i>=0)h.splice(i,1);else h.push(l.id);if(!h.length)delete e.hide})}>{off?"+":"×"}</Button></span>})}</div></>}
    {L.length>1&&<><Text size={200}>Reihenfolge (Richtung {nm(a)} → {nm(b)})</Text>{L.map((l,i)=><div key={l.id} style={{display:"flex",gap:4,alignItems:"center"}}><span style={{background:l.color,color:"#fff",borderRadius:l.shape==="rect"?3:99,padding:"1px 10px",minWidth:40,textAlign:"center"}}>{l.name}</span><Button size="small" disabled={!i} onClick={()=>mv(l.id,-1)}>▲</Button><Button size="small" disabled={i===L.length-1} onClick={()=>mv(l.id,1)}>▼</Button></div>)}
      <Button size="small" onClick={()=>edit(D=>{if(D.order)delete D.order[k]})}>Automatisch</Button></>}
    {L.length>1&&<><Text size={200}>Kopplung (Züge fahren zusammen)</Text>{L.slice(1).map((l,i)=>{const q=k+"#"+i,z=(S.zig||{})[q],adj=(f,dv)=>edit(D=>{D.zig[q][f]=Math.max(f==="len"?.5:-99,(D.zig[q][f]||0)+dv)});return <div key={q} style={{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:12}}>{L[i].name}+{l.name}</span><Button size="small" onClick={()=>edit(D=>{D.zig=D.zig||{};if(D.zig[q])delete D.zig[q];else D.zig[q]={len:2,o:0}})}>{z?"entfernen":"markieren"}</Button>{z&&<><Button size="small" onClick={()=>adj("len",-.5)}>−</Button><Button size="small" onClick={()=>adj("len",.5)}>+</Button><Button size="small" onClick={()=>adj("o",-1)}>◀</Button><Button size="small" onClick={()=>adj("o",1)}>▶</Button></>}</div>})}</>}
    <Button onClick={close}>Schließen</Button></Card>;
}