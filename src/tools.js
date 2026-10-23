import {DIRS,newId,PAL} from "./core/engine.js";
export const dl=(n,t,d)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([d],{type:t}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
const wOf=(S,s)=>s.name.length*S.design.tpl.stop.size*.58/32+.3;
const box=(S,s,k)=>{const d=DIRS[k],L=Math.hypot(d[0],d[1]),w=wOf(S,s),cx=s.x+d[0]/L*(.6+(d[0]?w/2:0)),cy=s.y+d[1]/L*(.6+(d[1]?.35:0));return{x0:cx-w/2,x1:cx+w/2,y0:cy-.35,y1:cy+.35}};
const hit=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0, pt=t=>({x0:t.x-.4,x1:t.x+.4,y0:t.y-.4,y1:t.y+.4});
const placed=S=>S.stops.filter(s=>!s.wp&&s.x!=null);
export function overlaps(S){const st=placed(S),bx=st.map(s=>box(S,s,s.label||"E")),r=[];
  st.forEach((s,i)=>st.forEach((t,j)=>{if(j>i&&hit(bx[i],bx[j]))r.push([s.id,s.name+" und "+t.name+": Beschriftungen überlappen"]);if(i!==j&&hit(bx[i],pt(t)))r.push([s.id,s.name+": Beschriftung liegt auf "+t.name])}));return r}
export function autoLabels(S){
  const st=placed(S),nb={},get=i=>S.stops.find(s=>s.id===i),done=[];
  S.lines.forEach(l=>l.sections.forEach(c=>c.forEach((id,k)=>[c[k-1],c[k+1]].forEach(o=>{const a=get(id),b=o&&get(o);if(a&&b&&b.x!=null&&a.x!=null)(nb[id]=nb[id]||[]).push([Math.sign(b.x-a.x),Math.sign(b.y-a.y)])}))));
  [...st].sort((a,b)=>(nb[b.id]||[]).length-(nb[a.id]||[]).length).forEach(s=>{let best=null;
    Object.keys(DIRS).forEach(k=>{const b=box(S,s,k),d=DIRS[k];let c=k.length>1?1.5:k==="N"||k==="S"?.5:0;
      (nb[s.id]||[]).forEach(n=>{if(n[0]===Math.sign(d[0])&&n[1]===Math.sign(d[1]))c+=4;else if(!n[0]&&d[0]===0&&n[1]===Math.sign(d[1]))c+=4});
      st.forEach(t=>{if(t!==s&&hit(b,pt(t)))c+=10});done.forEach(p=>{if(hit(b,p))c+=8});if(!best||c<best.c)best={c,k,b}});
    s.label=best.k;done.push(best.b)})}
export const csvOut=(n,rows)=>dl(n,"text/csv;charset=utf-8","\ufeff"+rows.map(r=>r.join(";")).join("\r\n"));
export const csvStops=S=>csvOut("haltestellen.csv",[["Name","Spalte","Zeile","Beschriftung","Wegpunkt"],...S.stops.map(s=>[s.name,s.x??"",s.y??"",s.label||"E",s.wp?1:0])]);
export const csvLines=S=>csvOut("linien.csv",[["Linie","Farbe","Verlauf"],...S.lines.map(l=>[l.name,l.color,l.sections[0].map(i=>(S.stops.find(s=>s.id===i)||{}).name).join("|")])]);
export function csvIn(S,t){
  const rows=t.replace(/^\ufeff/,"").split(/\r?\n/).filter(r=>r.trim()).map(r=>r.split(r.includes(";")?";":",").map(c=>c.trim()));if(!rows.length)return 0;
  const h=rows.shift().map(c=>c.toLowerCase()),col=n=>h.indexOf(n),ok=v=>v!==""&&v!=null&&isFinite(v);
  const get=nm=>{let s=S.stops.find(x=>x.name===nm);if(!s){s={id:newId(),name:nm,x:null,y:null,label:"E"};S.stops.push(s)}return s};
  if(h[0]==="name")rows.forEach(r=>{const s=get(r[0]),x=r[col("spalte")],y=r[col("zeile")],lb=r[col("beschriftung")];if(ok(x)&&ok(y)){s.x=+x;s.y=+y}if(lb&&DIRS[lb])s.label=lb;if(r[col("wegpunkt")]==="1")s.wp=1});
  else if(h[0]==="linie")rows.forEach(r=>{const ids=(r[col("verlauf")]||"").split("|").map(x=>x.trim()).filter(Boolean).map(n=>get(n).id),c=r[col("farbe")];S.lines.push({id:newId(),name:r[0],color:/^#[0-9a-f]{6}$/i.test(c)?c:PAL[S.lines.length%PAL.length],shape:"pill",closed:false,cats:[S.design.cats[0].id],dir:{},sections:[ids]})});
  else return -1;return rows.length}
/* Auswahl: markierte Linien samt Haltestellen als Fragment */
export function exportSel(S,ids){const ls=S.lines.filter(l=>ids.includes(l.id)),u=new Set(ls.flatMap(l=>l.sections.flat()));
  dl("auswahl.json","application/json",JSON.stringify({fragment:1,cats:S.design.cats,lines:ls,stops:S.stops.filter(s=>u.has(s.id))},null,1))}
export function importSel(S,f,dx=0,dy=0){const m={};
  f.stops.forEach(s=>{const n=newId();m[s.id]=n;const c=JSON.parse(JSON.stringify(s));c.id=n;if(c.x!=null){c.x+=dx;c.y+=dy}(c.alt||[]).forEach(a=>{if(a.x!=null){a.x+=dx;a.y+=dy}});S.stops.push(c)});
  const mapK=o=>o&&Object.fromEntries(Object.entries(o).map(([k,v])=>[m[k]||k,v]));
  f.cats.forEach(c=>{if(!S.design.cats.some(x=>x.id===c.id))S.design.cats.push(c)});
  f.lines.forEach(l=>{const c=JSON.parse(JSON.stringify(l));c.id=newId();c.sections=c.sections.map(s=>s.map(i=>m[i]||i));["dir","pass","temp","via","loc"].forEach(k=>{if(c[k])c[k]=mapK(c[k])});delete c.follow;S.lines.push(c)})}

export function exportMsel(S,m){const set=new Set(m.s.map(i=>i.split("#")[0])),ls=[];
  S.lines.forEach(l=>{const c=JSON.parse(JSON.stringify(l)),keep=[];c.sections.forEach((s,i)=>{const f=s.filter(x=>set.has(x));if(f.length>1)keep.push([f,(l.cats||[])[i]||S.design.cats[0].id])});
    if(!keep.length)return;c.sections=keep.map(k=>k[0]);c.cats=keep.map(k=>k[1]);delete c.follow;ls.push(c)});
  dl("auswahl.json","application/json",JSON.stringify({fragment:1,cats:S.design.cats,lines:ls,stops:S.stops.filter(s=>set.has(s.id))},null,1))}
const RK="liniennetz-recent";
export const recents=()=>{try{return JSON.parse(localStorage[RK])||[]}catch{return[]}};
export function addRecent(name,data){let r=recents().filter(x=>x.name!==name);r.unshift({name,time:Date.now(),data});r=r.slice(0,4);while(r.length){try{localStorage[RK]=JSON.stringify(r);return}catch{r.pop()}}}

export const fname=(S,ext)=>(((S.title&&S.title.text)||"").replace(/[\\/:*?"<>|]+/g,"").replace(/\s+/g," ").trim()||"Liniennetz")+(ext?"."+ext:"");
