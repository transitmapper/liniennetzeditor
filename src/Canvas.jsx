import React,{useMemo,useRef,useEffect} from "react";
import {useStore} from "./store.js";
import {svgMarkup,setS,setUi,posOf,G,CW,CH,s45c,obj} from "./core/engine.js";
export default function Canvas(){
  const {S,sel,selX,zoom,bg,edit,msel,rb}=useStore(), d=useRef(null), ref=useRef(), set=useStore.setState;
  const html=useMemo(()=>{setS(S);setUi({sel,zoom,selX,msel,rb});return svgMarkup(true)},[S,sel,zoom,selX,msel,rb]);
  const cell=e=>{const r=ref.current.querySelector("svg").getBoundingClientRect(),k=r.width/(CW()*G);return{x:Math.min(CW(),Math.max(0,Math.round((e.clientX-r.left)/k/G))),y:Math.min(CH(),Math.max(0,Math.round((e.clientY-r.top)/k/G)))}};
  const finish=()=>{const t=useStore.getState().tool;if(!t)return;edit(D=>{const o=obj(t);if(o&&o.pts.length<2)D.objs=D.objs.filter(x=>x!==o)},false);set({tool:null})};
  useEffect(()=>{const k=e=>{if(e.key==="Escape"){finish();set({pop:null,selX:null,sel:null,msel:null})}};addEventListener("keydown",k);return()=>removeEventListener("keydown",k)});
  const g2=useRef(null),xy=e=>{const r=ref.current.querySelector("svg").getBoundingClientRect(),k=r.width/(CW()*G);return{x:(e.clientX-r.left)/k,y:(e.clientY-r.top)/k}};
  const selDown=(e,c)=>{const T=e.target,g=T.closest("[data-s]"),h=T.closest("[data-h]"),o=T.closest("[data-o]"),hv=h&&h.dataset.h.split(":"),key=g?["s",g.dataset.s]:hv&&(hv[0]==="t"||hv[0]==="a")?[hv[0],hv[1]]:o?["o",o.dataset.o]:null;
    if(!key){const q=xy(e);set({msel:null,rb:{x0:q.x,y0:q.y,x1:q.x,y1:q.y}});return}
    let m=useStore.getState().msel;if(!m||!m[key[0]].includes(key[1])){m={s:[],o:[],t:[],a:[]};m[key[0]].push(key[1]);set({msel:m})}
    const f=(a,i)=>(S[a]||[]).find(x=>x.id===i);
    g2.current={c0:c,first:true,b:{s:m.s.map(i=>({i,...posOf(i)})),o:m.o.map(i=>({i,pts:obj(i).pts.map(p=>({...p}))})),t:m.t.map(i=>({i,...f("texts",i)})),a:m.a.map(i=>({i,...f("anns",i)}))}}};
  const selMove=e=>{const q=useStore.getState(),x=g2.current;
    if(x){const c=cell(e),dx=c.x-x.c0.x,dy=c.y-x.c0.y;if(x.first){edit(()=>{});x.first=false}
      edit(D=>{x.b.s.forEach(b=>{const p=posOf(b.i);p.x=b.x+dx;p.y=b.y+dy});x.b.o.forEach(b=>{obj(b.i).pts=b.pts.map(p=>({x:p.x+dx,y:p.y+dy}))});x.b.t.forEach(b=>{const t=D.texts.find(z=>z.id===b.i);t.x=b.x+dx;t.y=b.y+dy});x.b.a.forEach(b=>{const a=D.anns.find(z=>z.id===b.i);a.x=b.x+dx;a.y=b.y+dy;a.tx=b.tx+dx;a.ty=b.ty+dy})},false);return true}
    if(q.rb){const p=xy(e);set({rb:{...q.rb,x1:p.x,y1:p.y}});return true}return false};
  const selUp=()=>{g2.current=null;const q=useStore.getState(),r=q.rb;if(!r)return;
    const x0=Math.min(r.x0,r.x1),x1=Math.max(r.x0,r.x1),y0=Math.min(r.y0,r.y1),y1=Math.max(r.y0,r.y1),inn=(x,y)=>x*G>=x0&&x*G<=x1&&y*G>=y0&&y*G<=y1,m={s:[],o:[],t:[],a:[]},A=q.S;
    A.stops.forEach(s=>[{id:s.id,x:s.x,y:s.y},...(s.alt||[]).map((a,i)=>({id:s.id+"#"+(i+1),x:a.x,y:a.y}))].forEach(n=>{if(n.x!=null&&inn(n.x,n.y))m.s.push(n.id)}));
    (A.objs||[]).forEach(b=>{if(!A.lockObj&&b.pts.length&&b.pts.every(p=>inn(p.x,p.y)))m.o.push(b.id)});(A.texts||[]).forEach(t=>{if(inn(t.x,t.y))m.t.push(t.id)});(A.anns||[]).forEach(a=>{if(inn(a.x,a.y)||inn(a.tx,a.ty))m.a.push(a.id)});
    set({rb:null,msel:m.s.length+m.o.length+m.t.length+m.a.length?m:null})};
  const down=e=>{const T=e.target,st=useStore.getState(),c=cell(e);if(st.selMode){selDown(e,c);return}
    if(st.tool){edit(D=>{const o=obj(st.tool);o.pts.push(s45c(o,c))});return}
    const eg=T.closest("[data-e]");
    if(eg&&!(eg.dataset.m&&sel&&posOf(sel))){set({pop:{k:eg.dataset.e,x:e.clientX,y:e.clientY}});return}
    set({pop:null});
    const h=T.closest("[data-h]");
    if(h){const [k,i,j]=h.dataset.h.split(":");
      if(k==="p"&&e.altKey){edit(D=>{obj(i).pts.splice(+j,1)});return}
      set({tab:"draw",selX:{t:k==="p"?"o":k,id:i},sel:null});d.current={h:{k,i,j},first:true};return}
    const o=T.closest("[data-o]");if(o){set({tab:"draw",selX:{t:"o",id:o.dataset.o},sel:null});return}
    const g=T.closest("[data-s]");
    if(g){set({sel:g.dataset.s,selX:null,tab:"net"});d.current={id:g.dataset.s,first:true};return}
    if(sel){edit(D=>{const p=posOf(sel);if(p){p.x=c.x;p.y=c.y}});set({sel:null})}};
  const move=e=>{if(selMove(e))return;const x=d.current;if(!x)return;const c=cell(e);
    if(x.h){const {k,i,j}=x.h;if(x.first){edit(()=>{});x.first=false}
      edit(D=>{if(k==="p"){const b=obj(i);b.pts[+j]=s45c(b,c,+j)}else if(k==="t"){const t=D.texts.find(q=>q.id===i);t.x=c.x;t.y=c.y}else{const a=D.anns.find(q=>q.id===i);if(j==="1"){a.tx=c.x;a.ty=c.y}else{a.x=c.x;a.y=c.y}}},false);return}
    const p=posOf(x.id);if(p&&(p.x!==c.x||p.y!==c.y)){if(x.first){edit(()=>{});x.first=false}edit(D=>{const q=posOf(x.id);q.x=c.x;q.y=c.y},false)}};
  return <div style={{overflow:"auto",height:"100%",background:"#e8e8e8",userSelect:"none",WebkitUserSelect:"none"}}><div ref={ref} style={{position:"relative",width:"max-content"}} onPointerDown={down} onPointerMove={move} onPointerUp={()=>{selUp();d.current=null}} onDoubleClick={finish}>
    <div dangerouslySetInnerHTML={{__html:html}}/>
    {bg&&<img alt="" src={bg.url} style={{position:"absolute",left:bg.x*zoom,top:bg.y*zoom,width:CW()*G*zoom*bg.s/100,opacity:bg.o/100,pointerEvents:"none"}}/>}</div></div>;
}
