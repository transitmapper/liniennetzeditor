import React from "react";
import {Card,Button,Text} from "@fluentui/react-components";
import {useStore} from "./store.js";
import {getLB} from "./core/engine.js";
export function Pop(){
  const {pop,S,edit}=useStore(); if(!pop)return null;
  const LB=getLB(),k=pop.k,h=LB.hits[k],L=LB.lanes[k]||[],nm=i=>(S.stops.find(s=>s.id===i.split("#")[0])||{}).name,close=()=>useStore.setState({pop:null});
  const mv=(i,d)=>{const ids=L.map(l=>l.id),a=ids.indexOf(i),b=a+d;if(b<0||b>=ids.length)return;[ids[a],ids[b]]=[ids[b],ids[a]];edit(D=>{(D.order=D.order||{})[k]=ids})};
  const [a,b]=k.split("|");
  return <Card style={{position:"fixed",left:Math.max(0,Math.min(pop.x,innerWidth-300)),top:Math.max(0,Math.min(pop.y,innerHeight-360)),width:280,zIndex:10}}>
    <Text weight="semibold">{nm(a)} – {nm(b)}</Text>
    {h&&h.diag&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Button size="small" onClick={()=>edit(D=>{D.mode=D.mode||{};if(D.mode[k])delete D.mode[k];else D.mode[k]="rect";if(D.flip)delete D.flip[k]})}>Verlauf: {h.rect?"rechtwinklig":"schräg"}</Button>
      {h.flipOk&&<Button size="small" onClick={()=>edit(D=>{D.flip=D.flip||{};if(D.flip[k])delete D.flip[k];else D.flip[k]=1})}>Knick umlegen</Button>}</div>}
    {L.length>0&&<Button size="small" onClick={()=>edit(D=>{D.ebadge=D.ebadge||{};if(D.ebadge[k])delete D.ebadge[k];else D.ebadge[k]={o:0}})}>{(S.ebadge||{})[k]?"Linienbadges entfernen":"Linienbadges auf Verbindung"}</Button>}
    {(S.ebadge||{})[k]&&<div><Button size="small" onClick={()=>edit(D=>{D.ebadge[k].o--})}>◀</Button><Button size="small" onClick={()=>edit(D=>{D.ebadge[k].o++})}>▶</Button></div>}
    {L.length>1&&<><Text size={200}>Reihenfolge (Richtung {nm(a)} → {nm(b)})</Text>{L.map((l,i)=><div key={l.id} style={{display:"flex",gap:4,alignItems:"center"}}><span style={{background:l.color,color:"#fff",borderRadius:l.shape==="rect"?3:99,padding:"1px 10px",minWidth:40,textAlign:"center"}}>{l.name}</span><Button size="small" disabled={!i} onClick={()=>mv(l.id,-1)}>▲</Button><Button size="small" disabled={i===L.length-1} onClick={()=>mv(l.id,1)}>▼</Button></div>)}
      <Button size="small" onClick={()=>edit(D=>{if(D.order)delete D.order[k]})}>Automatisch</Button></>}
    {L.length>1&&<><Text size={200}>Kopplung (Züge fahren zusammen)</Text>{L.slice(1).map((l,i)=>{const q=k+"#"+i,z=(S.zig||{})[q],adj=(f,dv)=>edit(D=>{D.zig[q][f]=Math.max(f==="len"?.5:-99,(D.zig[q][f]||0)+dv)});return <div key={q} style={{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:12}}>{L[i].name}+{l.name}</span><Button size="small" onClick={()=>edit(D=>{D.zig=D.zig||{};if(D.zig[q])delete D.zig[q];else D.zig[q]={len:2,o:0}})}>{z?"entfernen":"markieren"}</Button>{z&&<><Button size="small" onClick={()=>adj("len",-.5)}>−</Button><Button size="small" onClick={()=>adj("len",.5)}>+</Button><Button size="small" onClick={()=>adj("o",-1)}>◀</Button><Button size="small" onClick={()=>adj("o",1)}>▶</Button></>}</div>})}</>}
    <Button onClick={close}>Schließen</Button></Card>;
}
