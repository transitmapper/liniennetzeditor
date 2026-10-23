// @ts-nocheck
/* Aus der Einzeldatei übernommene Berechnungs- und Zeichenlogik (unverändert). */

const G=32, RAD=18, KEY="liniennetz-v2";
const DIRS={N:[0,-1],NE:[1,-1],E:[1,0],SE:[1,1],S:[0,1],SW:[-1,1],W:[-1,0],NW:[-1,-1]};
const TN={stop:"Station normal",end:"Endstation",h1:"Überschrift 1",h2:"Überschrift 2",sub:"Untertitel",text:"Normaler Text und Legende",en:"Übersetzung der Legendenüberschriften",water:"Gewässerbeschriftung",area:"Gebietsbeschriftung (Ländernamen)",badge:"Text im Linienbadge",leg:"Legendentext"};
const T=(size,b=0,color="#111111")=>({font:"Segoe UI",size,color,b,i:0,u:0});
const defDesign=()=>({cats:[{id:"c1",name:"Häufig bedient",w:8,dash:""},{id:"c2",name:"Selten bedient",w:5,dash:"dash"}],tpl:{stop:T(14),end:T(14,1),h1:T(30,1),h2:T(22,1),sub:T(16,0,"#555555"),text:T(13),en:{...T(15,0,"#777777"),i:1},water:{...T(14,0,"#4a86b8"),i:1},area:{...T(15,1,"#8a8a8a")},badge:T(10,1),leg:T(13)},ostyles:[{id:"o1",name:"Fluss",color:"#7ab8e8",w:6,dash:"",smooth:0,area:0},{id:"o2",name:"Ländergrenze",color:"#9a9a9a",w:3,dash:"dash",smooth:0,area:0},{id:"o3",name:"Bahnstrecke (nicht bedient)",color:"#6b6b6b",w:5,dash:"",smooth:0,area:0}]});
const DT=defDesign().tpl;
const empty=d=>({design:d||defDesign(),title:{on:1,text:"Liniennetz",sub:"Regionalverkehr",x:1,y:1},legend:{on:1,x:44,y:2},stops:[],lines:[]});
function load(){try{const s=JSON.parse(localStorage[KEY]);return s&&s.design?s:empty()}catch(e){return empty()}}
let S=empty(), sel=null, drag=null, zoom=1, uid=Date.now()%100000, info={}, open={plan:1,design:1,draw:1,check:1};
let cur=null, ustack=[], rstack=[], lastCh=0, sq="", dirty=false, fh=null;
const $=q=>document.querySelector(q), id=()=>"i"+(uid++);
const stop=i=>S.stops.find(s=>s.id===i), line=i=>S.lines.find(l=>l.id===i);
const TP=k=>S.design.tpl[k]||DT[k], TR=()=>({legend:"Key",list:"List of lines",notes:"Notes",...(S.design.tr||{})});
const CW=()=>S.cols||56, CH=()=>S.rows||36;
const SP=()=>({size:"m",tc:"#9a9a9a",bw:3,color:"#222222",fill:"#ffffff",cw:2,cc:"#222222",...(S.design.stop||{})});
const LT=k=>({legend:"Legende",list:"Linienübersicht",notes:"Anmerkungen",plain:"Haltestelle von allen Linien bedient",part:"Haltestelle nur von den markierten Linien bedient",dirAll:"Haltestelle von allen Linien nur in Pfeilrichtung bedient",dirSome:"Haltestelle von den markierten Linien nur in Pfeilrichtung bedient",temp:"Zeitweise Bedienung",zig:"Kopplung (Züge fahren zusammen, Flügelung)",...(S.design.legtxt||{})})[k];
const nodes=s=>[{id:s.id,sid:s.id,x:s.x,y:s.y,wp:s.wp},...(s.alt||[]).map((a,i)=>({id:s.id+"#"+(i+1),sid:s.id,x:a.x,y:a.y}))];
const posOf=n=>{const [sid,k]=n.split("#"),s=stop(sid);return s&&(k?(s.alt||[])[k-1]:s)};
const PAL=["#8e1b1b","#d62828","#e53935","#e8590c","#f08a00","#f2a900","#f2c300","#c0ca33","#7cb518","#2a9d4a","#1b7a3a","#00a676","#00a6a6","#00bcd4","#3fa7e0","#1d6fb8","#0b3d91","#3949ab","#7b3fb3","#9c27b0","#c2185b","#e0457b","#f48fb1","#a1887f","#8c5a2b","#5d4037","#4a5d6b","#9e9e9e","#616161","#1a1a1a"];
const recent=()=>{try{return JSON.parse(localStorage["liniennetz-colors"])||[]}catch(e){return[]}};
const remember=c=>{try{localStorage["liniennetz-colors"]=JSON.stringify([c,...recent().filter(x=>x!==c)].slice(0,16))}catch(e){}};
const FI={
undo:'<path d="M7.5 4 3.5 8l4 4"/><path d="M3.5 8H12a4.5 4.5 0 0 1 0 9H8"/>',redo:'<path d="M12.5 4l4 4-4 4"/><path d="M16.5 8H8a4.5 4.5 0 0 0 0 9h4"/>',
new:'<path d="M5 2.5h6l4 4v11H5z"/><path d="M11 2.5v4h4M10 9v5M7.5 11.5h5"/>',open:'<path d="M2.5 5.5v10h15v-8h-8l-1.5-2h-5.5z"/>',
save:'<path d="M3.5 3.5h11l2 2v11h-13z"/><path d="M6.5 3.5v4h6v-4M6.5 16.5v-5h7v5"/>',
palette:'<path d="M10 2.5a7.5 7.5 0 1 0 0 15c1 0 1.5-.8 1.5-1.5 0-1.5-1-1.5-1-2.5 0-.8.7-1.5 1.5-1.5H15a2.5 2.5 0 0 0 2.5-2.5C17.5 5.5 14.2 2.5 10 2.5z"/><circle cx="6.5" cy="9" r=".8"/><circle cx="10" cy="6" r=".8"/><circle cx="13.5" cy="9" r=".8"/>',
export:'<path d="M10 3v9M6.5 8.5 10 12l3.5-3.5M4 14v2.5h12V14"/>',import:'<path d="M10 12V3M6.5 6.5 10 3l3.5 3.5M4 14v2.5h12V14"/>',
trash:'<path d="M4 5.5h12M8 5.5V3.5h4v2M5.5 5.5l.7 11h7.6l.7-11M8.5 9v5M11.5 9v5"/>',plus:'<path d="M10 4v12M4 10h12"/>',minus:'<path d="M4 10h12"/>',close:'<path d="M5 5l10 10M15 5 5 15"/>',
chevl:'<path d="M12 4.5 6.5 10l5.5 5.5"/>',chevr:'<path d="M8 4.5l5.5 5.5L8 15.5"/>',chevu:'<path d="M4.5 12 10 6.5l5.5 5.5"/>',chevd:'<path d="M4.5 8 10 13.5 15.5 8"/>',
dotf:'<circle cx="10" cy="10" r="4.5" fill="currentColor"/>',doto:'<circle cx="10" cy="10" r="4.5"/>',dotg:'<circle cx="10" cy="10" r="4.5"/><path d="M10 5.5a4.5 4.5 0 0 1 0 9z" fill="currentColor"/>',eye:'<path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10z"/><circle cx="10" cy="10" r="2.2"/>',eyeoff:'<path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10z"/><path d="M3.5 3.5l13 13"/>',funnel:'<path d="M3 4.5h14l-5.5 6.5v4.5l-3 1.5V11z"/>',locate:'<circle cx="10" cy="10" r="2"/><circle cx="10" cy="10" r="6"/><path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3"/>',flag:'<path d="M5 3v14M5 4h9l-2 3 2 3H5"/>',magic:'<path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/>',
fwd:'<path d="M6.5 4.5v11L15 10z" fill="currentColor"/>',bwd:'<path d="M13.5 4.5v11L5 10z" fill="currentColor"/>',nodir:'<path d="M6.5 4.5v11L15 10z"/>',
split:'<circle cx="5" cy="5" r="1.8"/><circle cx="15" cy="5" r="1.8"/><circle cx="10" cy="15.5" r="1.8"/><path d="M5 6.8c0 4 5 3 5 7M15 6.8c0 4-5 3-5 7"/>',diamond:'<path d="M10 3.5 16.5 10 10 16.5 3.5 10z"/>',select:'<path d="M3.5 3.5h4M12.5 3.5h4M3.5 16.5h4M12.5 16.5h4M3.5 3.5v4M3.5 12.5v4M16.5 3.5v4M16.5 12.5v4"/>'};
const fi=n=>`<svg class="fi" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${FI[n]}</svg>`;
const inflate=()=>document.querySelectorAll("i[data-fi]").forEach(i=>i.outerHTML=fi(i.dataset.fi));
const sortLines=a=>{ // alphabetisch, optional zuerst nach Wichtigkeit (Strichstärke der Kategorie)
  const imp=l=>Math.max(...l.sections.map((_,i)=>catOf(l,i).w)), byImp=S.sortImp&&new Set(S.design.cats.map(c=>c.w)).size>1;
  return [...a].sort((x,y)=>(byImp?imp(y)-imp(x):0)||x.name.localeCompare(y.name,"de",{numeric:true}));
};
let pan=null, spaceDown=false, hl=null, sql="", BGU="", moved=false, FN={}, tool=null, selX=null, drag2=null, selMode=false, msel=null, rb=null, gd=null;
const ff=f=>esc(f)+", Arial, sans-serif";
const snap=()=>JSON.stringify(S,(k,v)=>k==="url"?undefined:v);
const OSt=()=>S.design.ostyles||(S.design.ostyles=defDesign().ostyles), obj=i=>(S.objs||[]).find(o=>o.id===i);
const fnMap=()=>{const m={};S.stops.filter(s=>s.fn&&s.fn.trim()).sort((a,b)=>a.name.localeCompare(b.name,"de")).forEach((s,i)=>m[s.id]=i+1);return m};
const axisOf=u=>((Math.round(Math.atan2(u.y,u.x)/(Math.PI/4))%4)+4)%4;
let LB={hits:{},lanes:{}}, popPos={x:200,y:200};
const catOf=(l,si)=>S.design.cats.find(c=>c.id===(l.cats||[])[si])||S.design.cats[0];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- Geometrie ---------- */
/* Verlauf zwischen zwei Rasterpunkten. Standard: gerader Anteil auf beide Enden verteilt, dazwischen die Schräge (45°).
   f: bei ungerader Aufteilung wandert der größere Teil an das andere Ende (bei m="rect": Richtung des Knicks).
   m="rect": stattdessen eine rechtwinklige Verbindung (90°). */
function route(a,b,f,m){
  const dx=b.x-a.x, dy=b.y-a.y, ax=Math.abs(dx), ay=Math.abs(dy);
  if(!ax||!ay) return [a,b];
  if(m==="rect") return [a,f?{x:a.x,y:b.y}:{x:b.x,y:a.y},b];
  if(ax===ay) return [a,b];
  const d=Math.min(ax,ay), sx=Math.sign(dx), sy=Math.sign(dy), n=Math.abs(ax-ay), n1=f?Math.floor(n/2):Math.ceil(n/2);
  const hz=ax>ay, p1={x:a.x+(hz?sx*n1:0),y:a.y+(hz?0:sy*n1)}, p2={x:p1.x+sx*d,y:p1.y+sy*d};
  return n1===0?[a,p2,b]:(p2.x===b.x&&p2.y===b.y?[a,p1,b]:[a,p1,p2,b]);
}
const ek=(a,b)=>a.id<b.id?a.id+"|"+b.id:b.id+"|"+a.id;
const edge=(a,b)=>{const k=ek(a,b),f=(S.flip||{})[k],m=(S.mode||{})[k];return a.id<=b.id?route(a,b,f,m):route(b,a,f,m).reverse()};
function fillet(a,v,b){
  const l1=Math.hypot(v.x-a.x,v.y-a.y), l2=Math.hypot(b.x-v.x,b.y-v.y);
  if(!v.r||l1<.5||l2<.5) return `L${v.x} ${v.y}`;
  const u1={x:(v.x-a.x)/l1,y:(v.y-a.y)/l1}, u2={x:(b.x-v.x)/l2,y:(b.y-v.y)/l2};
  const th=Math.acos(Math.max(-1,Math.min(1,u1.x*u2.x+u1.y*u2.y)));
  if(th<.01||th>3.1) return `L${v.x} ${v.y}`;
  const k=Math.tan(th/2), t=Math.min(v.r*k,l1/2,l2/2), r=t/k, sw=(u1.x*u2.y-u1.y*u2.x)>0?1:0;
  return `L${v.x-u1.x*t} ${v.y-u1.y*t}A${r} ${r} 0 0 ${sw} ${v.x+u2.x*t} ${v.y+u2.y*t}`;
}
function pathD(V,closed){
  const n=V.length;
  if(!closed){let d=`M${V[0].x} ${V[0].y}`;for(let i=1;i<n-1;i++)d+=fillet(V[i-1],V[i],V[i+1]);return d+`L${V[n-1].x} ${V[n-1].y}`}
  let d=`M${(V[0].x+V[1].x)/2} ${(V[0].y+V[1].y)/2}`;
  for(let k=1;k<=n;k++) d+=fillet(V[k-1],V[k%n],V[(k+1)%n]);
  return d+"Z";
}

/* Berechnet alle Linienpfade mit Spurversatz und sammelt die Daten für die Haltestellensymbole */
let BC={k:"",B:null};
function build(ui){ // Ergebnis zwischenspeichern, solange sich Haltestellen, Linien und Kantenwahl nicht ändern
  const k=(ui?1:0)+JSON.stringify([S.stops,S.lines,S.design.cats,S.flip,S.mode,S.order]);
  if(BC.k===k) return BC.B;
  const B=build0(ui); BC={k,B}; return B;
}
function build0(ui){
  const gap=Math.max(...S.design.cats.map(c=>c.w))+3, paths=[], used=new Set(), I={}, hits={}, lanes={}, ends={}, passN=new Set(), secs=[];
  const eff=(l,si)=>{ // eigene Halte; bei „folgt Linie“ werden Zwischenhalte der Referenzlinie als Durchfahrt ergänzt
    const own=l.sections[si], R=(l.follow||{})[si]&&line(l.follow[si]), out=[];
    own.forEach((id,k)=>{
      out.push({id,loc:(l.loc||{})[id]||0});
      const nx=own[k+1]; if(!R||nx==null) return;
      for(const sc of R.sections){const a=sc.indexOf(id),b=sc.indexOf(nx);
        if(a>=0&&b>=0&&Math.abs(a-b)>1){(a<b?sc.slice(a+1,b):sc.slice(b+1,a).reverse()).forEach(x=>out.push({id:x,auto:1,loc:(R.loc||{})[x]||0}));break}}
    });
    return out;
  };
  const sts=(l,si)=>eff(l,si).map(e=>{const s=stop(e.id);if(!s)return;const ns=nodes(s),nd=ns[e.loc]||ns[0];return (e.auto||nd.wp)?{...nd,auto:1}:nd}).filter(n=>n&&n.x!=null);
  const cyc=(l,si,st)=>l.closed&&si===0&&st.length>2, sgn=Math.sign, cr=(a,b)=>a.x*b.y-a.y*b.x;
  /* 1. Jede Strecke in Rasterschritte zerlegen */
  S.lines.forEach((l,li)=>l.sections.forEach((_,si)=>{
    if(ui&&l.hidden) return; // ausgeblendete Linien (nur im Editor)
    const st=sts(l,si); if(st.length<2) return; st.forEach(n=>used.add(n.sid));
    const cy=cyc(l,si,st), n=cy?st.length:st.length-1, gp=[], at=[], ekeys=[], efws=[];
    for(let i=0;i<n;i++){
      const a=st[i], b=st[(i+1)%st.length], r=edge(a,b);
      const hk=ek(a,b), rc=(S.mode||{})[hk]==="rect", hx=Math.abs(a.x-b.x), hy=Math.abs(a.y-b.y);
      hits[hk]={p:r.map(p=>p.x*G+","+p.y*G).join(" "),cp:(a.id<b.id?r:[...r].reverse()).map(q=>({x:q.x*G,y:q.y*G})),diag:!!(hx&&hy),rect:rc,flipOk:!!(hx&&hy)&&(rc||(hx!==hy&&Math.abs(hx-hy)%2===1))};
      const stp=[r[0]];
      for(let k=1;k<r.length;k++){const p=r[k-1],q=r[k],m=Math.max(Math.abs(q.x-p.x),Math.abs(q.y-p.y));for(let t=1;t<=m;t++)stp.push({x:p.x+(q.x-p.x)*t/m,y:p.y+(q.y-p.y)*t/m})}
      stp.forEach((pt,k)=>{const L=gp[gp.length-1];if(!(L&&L.x===pt.x&&L.y===pt.y)){gp.push(pt);at.push(null);if(gp.length>1){ekeys.push(ek(a,b));efws.push(a.id<b.id?1:-1)}}if(k===0)at[gp.length-1]=a;if(k===stp.length-1)at[gp.length-1]=b});
    }
    if(cy){gp.pop();at.pop()}
    if(gp.length<2) return;
    const N=gp.length, M=cy?N:N-1, dirs=[];
    for(let j=0;j<M;j++){const p=gp[j],q=gp[(j+1)%N];dirs.push({x:sgn(q.x-p.x),y:sgn(q.y-p.y)})}
    const cat=catOf(l,si); secs.push({l,li,si,cy,gp,at,dirs,N,M,w:cat.w,cat,ekeys,efws});
    const cnt=id=>l.sections.reduce((t,c)=>t+c.filter(x=>x===id).length,0);
    if(!cy){const q=secs[secs.length-1];[st[0],st[st.length-1]].forEach((nd,k)=>{if(cnt(nd.sid)===1&&!nd.wp&&!(l.pass||{})[nd.sid]&&!nd.auto)q["e"+k]=1})}
    if(!cy)[st[0],st[st.length-1]].forEach(nd=>{if(cnt(nd.sid)===1&&!nd.wp&&!(l.pass||{})[nd.sid]){const e=ends[nd.sid]=ends[nd.sid]||[];if(!e.includes(l))e.push(l)}});
  }));
  /* 2. Spuren je Rasterschritt: alle Linien, die denselben Schritt nutzen, laufen nebeneinander */
  const use={};
  const look=(sec,j,dr)=>{const d=sec.dirs[j];for(let t=1;t<sec.M;t++){let k=j+dr*t;if(sec.cy)k=(k%sec.M+sec.M)%sec.M;else if(k<0||k>=sec.M)return null;const e=sec.dirs[k];if(e.x!==d.x||e.y!==d.y)return e}return null};
  secs.forEach(sec=>{sec.keys=[];
    for(let j=0;j<sec.M;j++){
      const P=sec.gp[j],Q=sec.gp[(j+1)%sec.N],a=P.x+","+P.y,b=Q.x+","+Q.y,lt=P.x<Q.x||(P.x===Q.x&&P.y<Q.y),fw=lt?1:-1,k=lt?a+"|"+b:b+"|"+a;
      const d=sec.dirs[j],f=look(sec,j,1),pv=look(sec,j,-1),sc=(f?sgn(cr(d,f)):0)+(pv?sgn(cr(pv,d)):0);
      sec.keys.push([k,fw]);
      const arr=use[k]=use[k]||[]; if(!arr.some(e=>e.l===sec.l)) arr.push({l:sec.l,sc:fw*sc,o:sec.li*100+sec.si});
    }});
  /* Sicherheit gegen Linienkreuzungen: Für zwei Linien gilt auf einem zusammenhängenden gemeinsamen Stück immer dieselbe Reihenfolge */
  const dec={}, scOf=(k,l)=>use[k].find(e=>e.l===l).sc;
  /* Vom Nutzer festgelegte Reihenfolge (Klick auf eine Verbindung) hat Vorrang */
  secs.forEach(sec=>{for(let j=0;j<sec.M;j++){
    const o=(S.order||{})[sec.ekeys[j]]; if(!o) continue;
    const [k,fw]=sec.keys[j], v=fw*sec.efws[j]>0?1:-1, lst=o.filter(i=>use[k].some(e=>e.l.id===i));
    for(let x=0;x<lst.length;x++)for(let y=x+1;y<lst.length;y++){dec[k+"|"+lst[x]+"|"+lst[y]]=v;dec[k+"|"+lst[y]+"|"+lst[x]]=-v}
  }});
  secs.forEach(sec=>{
    const others=new Set(); sec.keys.forEach(([k])=>use[k].forEach(e=>{if(e.l!==sec.l)others.add(e.l)}));
    others.forEach(B=>{
      let run=[],tot=0;
      const flush=()=>{if(!run.length)return;let v0;run.forEach(([k,fw])=>{const e=dec[k+"|"+sec.l.id+"|"+B.id];if(v0===undefined&&e!==undefined)v0=e*fw});
        const v=v0!==undefined?v0:tot>0?1:tot<0?-1:(sec.l.id<B.id?1:-1);
        run.forEach(([k,fw])=>{const a=k+"|"+sec.l.id+"|"+B.id;if(dec[a]===undefined){dec[a]=v*fw;dec[k+"|"+B.id+"|"+sec.l.id]=-v*fw}});run=[];tot=0};
      sec.keys.forEach(([k,fw])=>{if(use[k].some(e=>e.l===B)){run.push([k,fw]);tot+=fw*(scOf(k,B)-scOf(k,sec.l))}else flush()});
      flush();
    });
  });
  Object.entries(use).forEach(([k,a])=>a.sort((x,y)=>{const v=dec[k+"|"+x.l.id+"|"+y.l.id];return v!==undefined?-v:x.sc-y.sc||x.o-y.o}));
  /* 3. Versetzte Pfade mit Ecken an den Schnittpunkten der Spuren */
  secs.forEach(sec=>{
    const {l,gp,at,dirs,N,M,cy}=sec, so=[], V=[];
    for(let j=0;j<M;j++){const [k,fw]=sec.keys[j],arr=use[k],i=arr.findIndex(e=>e.l===l);so.push(fw*(i-(arr.length-1)/2)*gap);if(!lanes[sec.ekeys[j]]){const ls=arr.map(e=>e.l);lanes[sec.ekeys[j]]=fw*sec.efws[j]<0?ls.reverse():ls}}
    const sg=j=>{const d=dirs[j],L=Math.hypot(d.x,d.y),u={x:d.x/L,y:d.y/L};return{u,n:{x:-u.y,y:u.x}}};
    for(let j=0;j<N;j++){
      const ii=cy?(j-1+M)%M:j-1, oi=j<M?j:-1, A=ii>=0?sg(ii):null, B=oi>=0?sg(oi):null, v={x:gp[j].x*G,y:gp[j].y*G}, nd=at[j];
      const P=(X,o)=>({x:v.x+X.n.x*o,y:v.y+X.n.y*o});
      let pp;
      if(A&&B){
        const oa=so[ii], ob=so[oi], c=cr(A.u,B.u), dt=A.u.x*B.u.x+A.u.y*B.u.y;
        if(Math.abs(c)>.05){
          const wx=B.n.x*ob-A.n.x*oa, wy=B.n.y*ob-A.n.y*oa, t=(wx*B.u.y-wy*B.u.x)/c;
          const st=nd&&!nd.wp, kk=Math.tan(Math.acos(Math.max(-1,Math.min(1,dt)))/2);
          const ck=gp[j].x+","+gp[j].y+"|"+[{x:-dirs[ii].x,y:-dirs[ii].y},dirs[oi]].map(d=>d.x+","+d.y).sort().join("|");
          pp=[{x:v.x+A.n.x*oa+A.u.x*t,y:v.y+A.n.y*oa+A.u.y*t,r:0,ck:st?null:ck,inn:(oa+ob)/2*Math.sign(c),rin:Math.min(60,RAD/kk)}];
        } else if(dt>0){
          if(Math.abs(oa-ob)<.01) pp=[];
          else{ // Spurwechsel: 45°-Versatz, gestaffelt damit der Abstand erhalten bleibt, mit gerundeten Ecken
            const D=ob-oa, sd=Math.sign(D), h=Math.abs(D)/2, m=(oa+ob)/2, sc=-.4142*sd*m, k0=gp[j].x+","+gp[j].y+"|j"+dirs[ii].x+","+dirs[ii].y+"|"+sd;
            pp=[{x:v.x+A.n.x*oa+A.u.x*(sc-h),y:v.y+A.n.y*oa+A.u.y*(sc-h),r:0,ck:nd?null:k0+"a",inn:m*sd,rin:RAD*1.5},
                {x:v.x+A.n.x*ob+A.u.x*(sc+h),y:v.y+A.n.y*ob+A.u.y*(sc+h),r:0,ck:nd?null:k0+"b",inn:-m*sd,rin:RAD*1.5}];}
        } else pp=[{...P(A,oa),r:0},{...P(B,ob),r:0}];
      } else {const X=A||B, o=A?so[ii]:so[oi]; pp=[{...P(X,o),r:0}]}
      if(nd){
        const X=B||A, u=X.u, pv=pp.length?pp:[P(X,so[B?oi:ii])];
        if(!((l.pass||{})[nd.sid]||nd.auto)){
          const q=I[nd.id]=I[nd.id]||{pts:[],u:null,mw:0,ls:[],axes:new Set()};
          pv.forEach(p=>q.pts.push(p)); q.mw=Math.max(q.mw,sec.w); q.u=q.u||u; [A,B].forEach(X=>X&&q.axes.add(axisOf(X.u)));
          if(!q.ls.some(x=>x.id===l.id)) q.ls.push({id:l.id,x:pv[0].x,y:pv[0].y,u});
        } else passN.add(nd.id);
      }
      V.push(...pp);
    }
    const sp0=SP(), Z1=(({s:[5,0],m:[7,2],l:[10,5]})[sp0.size]||[7,2])[1], dE=sec.w+Z1+sp0.bw/2, sh=(a,b)=>{const L=Math.hypot(b.x-a.x,b.y-a.y);return L>dE+2?{...a,x:a.x+(b.x-a.x)/L*dE,y:a.y+(b.y-a.y)/L*dE}:a};
    
    sec.V=V;
  });
  /* Gemeinsame Radien: An jeder Ecke bekommt die innerste Linie den Grundradius, die äußeren liegen konzentrisch darum */
  const mx={};
  secs.forEach(sec=>sec.V.forEach(p=>{if(p.ck)mx[p.ck]=Math.max(mx[p.ck]===undefined?-1e9:mx[p.ck],p.inn)}));
  secs.forEach(sec=>{
    sec.V.forEach(p=>{if(p.ck)p.r=Math.max(3,p.rin+mx[p.ck]-p.inn)});
    if(sec.V.length>1) paths.push({d:pathD(sec.V,sec.cy&&sec.V.length>2),color:sec.l.color,w:sec.w,dash:sec.cat.dash,lid:sec.l.id});
  });
  return{paths,I,ends,lanes,hits:Object.fromEntries(Object.entries(hits).map(([k,h])=>[k,{...h,m:h.diag||(lanes[k]||[]).length>1?0:1}])),used,hid:S.lines.some(l=>l.hidden),pass:passN,thru:new Set([...passN].filter(i=>!I[i]))};
}

/* ---------- Zeichnen ---------- */
const ts=(t,col)=>`font-family="${ff(t.font)}" font-size="${t.size}" fill="${col||t.color}" font-weight="${t.b?700:400}" font-style="${t.i?"italic":"normal"}" text-decoration="${t.u?"underline":"none"}"`;
const ink=c=>{const n=parseInt(c.slice(1),16);return ((n>>16)*299+(n>>8&255)*587+(n&255)*114)/1000>150?"#111":"#fff"};
function tri(p,u,dir,k,col){
  const a=Math.atan2(u.y,u.x)*180/Math.PI+(dir<0?180:0);
  return `<path d="M${k} 0L${-k*.7} ${-k*.85}L${-k*.7} ${k*.85}Z" transform="translate(${p.x} ${p.y}) rotate(${a})" fill="${col}"/>`;
}
function stopSvg(n,ui,ends,lab){
  const q=info[n.id], c={x:n.x*G,y:n.y*G}, sp=SP(), s=stop(n.sid), gl=Math.max(...S.design.cats.map(c=>c.w))+3;
  const SZ=({s:[5,0],m:[7,2],l:[10,5]})[sp.size]||[7,2];
  let R=SZ[0]+sp.bw, half=0, mid=c, a={x:0,y:1}, pos=[], box=null;
  if(q){
    R=q.mw/2+SZ[1]+sp.bw; a={x:-q.u.y,y:q.u.x};
    if(q.axes.size>1){ // Linien in verschiedenen Richtungen: abgerundetes Rechteck
      const xs=q.pts.map(p=>p.x), ys=q.pts.map(p=>p.y);
      box={x0:Math.min(...xs)-R,x1:Math.max(...xs)+R,y0:Math.min(...ys)-R,y1:Math.max(...ys)+R};
      mid={x:(box.x0+box.x1)/2,y:(box.y0+box.y1)/2};
      pos=q.ls.map(x=>({x,t:0}));
    } else { // alle Linien parallel: Pille
      const t=q.pts.map(p=>(p.x-c.x)*a.x+(p.y-c.y)*a.y);
      pos=q.ls.map(x=>({x,t:(x.x-c.x)*a.x+(x.y-c.y)*a.y})).sort((u,v)=>u.t-v.t);
      pos.forEach((e,i)=>{if(i&&e.t<pos[i-1].t+gl)e.t=pos[i-1].t+gl});
      const all=t.concat(pos.map(e=>e.t)), t0=Math.min(...all), t1=Math.max(...all);
      half=(t1-t0)/2; mid={x:c.x+a.x*(t0+t1)/2,y:c.y+a.y*(t0+t1)/2};
    }
  }
  const hi=ui&&sel===n.id; let o=""; const tm=e=>!!(e.x&&(line(e.x.id).temp||{})[n.sid]);
  if(box){
    const rr=(i,col,r)=>`<rect x="${box.x0+i}" y="${box.y0+i}" width="${box.x1-box.x0-2*i}" height="${box.y1-box.y0-2*i}" rx="${Math.max(0,r)}" fill="${col}"/>`;
    if(ui) o+=`<rect x="${box.x0-4}" y="${box.y0-4}" width="${box.x1-box.x0+8}" height="${box.y1-box.y0+8}" fill="transparent"/>`;
    o+=(sp.bw>0?rr(0,hi?"#0f6cbd":(pos.length&&pos.every(tm))?sp.tc:sp.color,R):"")+rr(sp.bw,sp.fill,R-sp.bw);
  } else {
    // Nur haltende Linien markieren: Lücken (durchfahrende Linie dazwischen) trennen die Pille, getrennte Teile werden verbunden
    const grp=[]; pos.forEach(e=>{const g=grp[grp.length-1];if(g&&e.t-g[g.length-1].t<=gl*1.5&&tm(e)===tm(g[g.length-1]))g.push(e);else grp.push([e])});
    const gr=grp.length?grp:[[{t:0}]], P=t=>({x:c.x+a.x*t,y:c.y+a.y*t});
    const cap=(g,w,col)=>{const p0=P(g[0].t),p1=P(g[g.length-1].t);return `<path d="M${p0.x} ${p0.y}L${p1.x+.01} ${p1.y}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`};
    for(let i=1;i<gr.length;i++){const p0=P(gr[i-1][gr[i-1].length-1].t),p1=P(gr[i][0].t);o+=`<path d="M${p0.x} ${p0.y}L${p1.x} ${p1.y}" stroke="${sp.cc}" stroke-width="${sp.cw}" fill="none"/>`}
    gr.forEach(g=>{if(ui)o+=cap(g,2*R+8,"transparent");o+=(sp.bw>0?cap(g,2*R,hi?"#0f6cbd":tm(g[0])?sp.tc:sp.color):"")+cap(g,2*R-2*sp.bw,sp.fill)});
  }
  if(q){
    const dr=e=>(line(e.x.id).dir||{})[n.sid], ev=e=>({x:e.x.u.x*dr(e),y:e.x.u.y*dr(e)}), fl=pos.filter(dr), k=Math.max(3.5,R-sp.bw-2.5);
    const same=fl.length===pos.length&&fl.every(e=>ev(e).x*ev(fl[0]).x+ev(e).y*ev(fl[0]).y>.9);
    const at=e=>box?{x:e.x.x,y:e.x.y}:{x:c.x+a.x*e.t,y:c.y+a.y*e.t};
    if(fl.length&&same) o+=tri(mid,fl[0].x.u,dr(fl[0]),k,sp.color);
    else fl.forEach(e=>o+=tri(at(e),e.x.u,dr(e),k,line(e.x.id).color));
  }
  if(lab){
    const t0=S.design.tpl[ends[n.sid]?"end":"stop"], tp={...t0,b:(t0.b||s.bold)?1:0};
    const d=DIRS[s.label||"E"], L=Math.hypot(d[0],d[1]), dd={x:d[0]/L,y:d[1]/L}, ew=d[1]===0&&d[0]!==0, ax=d[0]>0?"start":d[0]<0?"end":"middle";
    const el=sortLines(ends[n.sid]||[]), fs=TP("badge").size, bh=fs+7, bw=l=>Math.max(bh*1.4,l.name.length*fs*.62+10), per=S.bpr||6, rows=[];
    for(let i=0;i<el.length;i+=per) rows.push(el.slice(i,i+per));
    const bB=rows.length?rows.length*(bh+3)-3:0, nh=tp.size*1.2;
    const base=box?Math.min((box.x1-box.x0)/2/(Math.abs(dd.x)||1e-6),(box.y1-box.y0)/2/(Math.abs(dd.y)||1e-6)):R+Math.abs(dd.x*a.x+dd.y*a.y)*half;
    let dist=base+(d[0]===0?14:7)+(s.ld||0)*gl;
    const under=s.bu!=null?!!s.bu:!!S.bUnder; if(bB){if(d[1]>0&&!under)dist+=(bB+2)/dd.y;else if(d[1]<0&&under)dist+=(bB+2)/(-dd.y)}
    const tx=mid.x+dd.x*dist; let ty=mid.y+dd.y*dist, by=under?ty+nh/2+2:ty-nh/2-2-bB;
    if(bB&&ew){ // Beschriftung links/rechts: Badges optional unter dem Namen, Block optional zur Haltestelle zentriert
      const H=nh+2+bB;
      if(under){if(S.bCenter)ty=mid.y-H/2+nh/2;by=ty+nh/2+2}
      else if(S.bCenter){ty=mid.y+H/2-nh/2;by=ty-nh/2-2-bB}
    }
    o+=`<text x="${tx}" y="${ty}" text-anchor="${ax}" dominant-baseline="middle" ${ts(tp)}>${esc(s.name)}${FN[s.id]?`<tspan dy="-0.5em" font-size="${Math.round(tp.size*.7)}">${FN[s.id]}</tspan>`:""}</text>`;
    rows.forEach((rw,ri)=>{
      const tot=rw.reduce((t,l)=>t+bw(l)+3,-3), y=by+ri*(bh+3);
      let bx=ax==="start"?tx:ax==="end"?tx-tot:tx-tot/2;
      rw.forEach(l=>{const w=bw(l);o+=`<rect x="${bx}" y="${y}" width="${w}" height="${bh}" rx="${l.shape==="rect"?2:bh/2}" fill="${l.color}"/><text x="${bx+w/2}" y="${y+bh/2}" text-anchor="middle" dominant-baseline="central" font-family="${ff(TP("badge").font)}" font-size="${fs}" font-weight="${TP("badge").b?700:400}" fill="${ink(l.color)}">${esc(l.name)}</text>`;bx+=w+3});
    });
  }
  return `<g data-s="${n.id}" style="${ui?"cursor:move":""}">${o}</g>`;
}
function routeTxt(l){
  if(l.route) return l.route;
  const nm=id=>(stop(id)||{}).name||"";
  return l.sections.filter(c=>c.length>1).map((c,i)=>{const v=c.slice(1,-1).filter(x=>(l.via||{})[x]).map(nm),rg=i===0&&l.closed;return [nm(c[0]),...v,...(rg?[]:[nm(c[c.length-1])])].join(" – ")+(rg?" (Ringlinie)":"")}).join("; ");
}
const dashOf=d=>d==="dash"?"14 9":d==="dot"?"1 10":"";
/* Rundungen an den Knicken wie bei den Linien */
const rnd=(P,cl)=>P.map((v,i)=>{
  const a=P[(i-1+P.length)%P.length], b=P[(i+1)%P.length];
  if(!cl&&(i===0||i===P.length-1)) return {x:v.x,y:v.y,r:0};
  const l1=Math.hypot(v.x-a.x,v.y-a.y)||1, l2=Math.hypot(b.x-v.x,b.y-v.y)||1, c=((v.x-a.x)*(b.x-v.x)+(v.y-a.y)*(b.y-v.y))/(l1*l2), th=Math.acos(Math.max(-1,Math.min(1,c)));
  return {x:v.x,y:v.y,r:th<.01?0:Math.min(60,RAD/Math.tan(th/2))};
});
function objSvg(ui){ // Zeichenobjekte (Flüsse, Grenzen, freie Strecken)
  let o="";
  (S.objs||[]).forEach(b=>{
    const st=OSt().find(x=>x.id===b.style)||OSt()[0], P=b.pts.map(p=>({x:p.x*G,y:p.y*G})); if(P.length<2) return;
    const dsh=b.dash==="none"?"":b.dash||st.dash, w=st.w, d=pathD(rnd(P,!!st.area),!!st.area);
    o+=`<path d="${d}" fill="${st.area?st.color:"none"}" fill-opacity="${st.area?.5:1}" stroke="${st.color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="${dsh==="dash"?"butt":"round"}"${dashOf(dsh)?` stroke-dasharray="${dashOf(dsh)}"`:""}/>`;
    if(b.arrow&&!st.area){
      const q=P[P.length-1], p=P[P.length-2], k=Math.max(8,w*1.8), ang=Math.atan2(q.y-p.y,q.x-p.x), off=w+2, tx=q.x+Math.cos(ang)*off, ty=q.y+Math.sin(ang)*off;
      o+=`<path d="M0 0L${-2*k} ${-k}L${-2*k} ${k}Z" transform="translate(${tx} ${ty}) rotate(${ang*180/Math.PI})" fill="${st.color}"/>`;
      if(b.alabel){ // Beschriftung der Spitze, Ausrichtung wie bei einer Haltestelle
        const dr=DIRS[b.apos||"E"], Lh=Math.hypot(dr[0],dr[1]), tp=TP("stop");
        o+=`<text x="${tx+dr[0]/Lh*10}" y="${ty+dr[1]/Lh*(10+tp.size*.4)}" text-anchor="${dr[0]>0?"start":dr[0]<0?"end":"middle"}" dominant-baseline="middle" ${ts(tp)}>${esc(b.alabel)}</text>`;
      }
    }
    o+=objLabSvg(b,P,st);
    if(ui&&!S.lockObj) o+=`<path data-o="${b.id}" d="${d}" fill="none" stroke="transparent" stroke-width="${Math.max(w,12)}" style="cursor:pointer"/>`;
  });
  return o;
}
function freeSvg(ui){ // freie Texte, Astanmerkungen und Bearbeitungsgriffe
  let o=""; const sx=selX;
  (S.texts||[]).forEach(t=>{
    o+=`<text x="${t.x*G}" y="${t.y*G}" ${ts({...(TP(t.tpl)||TP("text")),b:((TP(t.tpl)||TP("text")).b||t.bold)?1:0})} text-anchor="${t.right?"end":"start"}" dominant-baseline="middle"${t.rot?` transform="rotate(${t.rot} ${t.x*G} ${t.y*G})"`:""}${ui?` data-h="t:${t.id}" style="cursor:move"`:""}>${esc(t.text)}</text>`;
    if(ui&&sx&&sx.t==="t"&&sx.id===t.id) o+=`<circle cx="${t.x*G}" cy="${t.y*G}" r="4" fill="#0f6cbd"/>`;
  });
  (S.anns||[]).forEach(a=>{
    const ls=(a.lines||(a.line?[a.line]:[])).map(line).filter(Boolean); if(!ls.length) return;
    const AN={w:2,head:12,gap:10,color:"",...(S.design.ann||{})}, TT=TP("text"), bf=TP("badge"), fs=bf.size, bh=fs+6, bwf=l=>Math.max(bh*1.5,l.name.length*fs*.62+10);
    const ax=a.x*G, ay=a.y*G, dx0=a.tx*G-ax, dy0=a.ty*G-ay, Ln=Math.hypot(dx0,dy0)||1, ux=dx0/Ln, uy=dy0/Ln, tx=a.tx*G-ux*AN.gap, ty=a.ty*G-uy*AN.gap, col=AN.color||ls[0].color;
    o+=`<path d="M${ax} ${ay}L${tx} ${ty}" stroke="${col}" stroke-width="${AN.w}" fill="none"/><path d="M0 0L${-AN.head} ${-AN.head*.42}L${-AN.head} ${AN.head*.42}Z" transform="translate(${tx} ${ty}) rotate(${Math.atan2(uy,ux)*180/Math.PI})" fill="${col}"/>`;
    let bx=ax+8; ls.forEach(l=>{const w=bwf(l);o+=`<rect x="${bx}" y="${ay-bh/2}" width="${w}" height="${bh}" rx="${l.shape==="rect"?2:bh/2}" fill="${l.color}"/><text x="${bx+w/2}" y="${ay}" text-anchor="middle" dominant-baseline="central" font-family="${ff(bf.font)}" font-size="${fs}" font-weight="${bf.b?700:400}" fill="${ink(l.color)}">${esc(l.name)}</text>`;bx+=w+4});
    o+=`<text x="${bx+4}" y="${ay}" dominant-baseline="middle" ${ts(TT)}>${esc(a.text)}</text>`;
    const tw=bx+8+a.text.length*TT.size*.55-ax;
    if(ui) o+=`<rect data-h="a:${a.id}:0" x="${ax-4}" y="${ay-bh/2-4}" width="${tw+8}" height="${bh+8}" fill="transparent" style="cursor:move"/>`;
    if(ui&&sx&&sx.t==="a"&&sx.id===a.id) o+=`<circle data-h="a:${a.id}:0" cx="${ax}" cy="${ay}" r="5" fill="#0f6cbd" style="cursor:move"/><circle data-h="a:${a.id}:1" cx="${a.tx*G}" cy="${a.ty*G}" r="6" fill="#fff" stroke="#0f6cbd" stroke-width="2.5" style="cursor:move"/>`;
  });
  if(ui&&!S.lockObj&&sx&&sx.t==="o"){const b=obj(sx.id);if(b)b.pts.forEach((p,i)=>o+=`<circle data-h="p:${b.id}:${i}" cx="${p.x*G}" cy="${p.y*G}" r="6" fill="#fff" stroke="#0f6cbd" stroke-width="2.5" style="cursor:move"/>`)}
  return o;
}
function symIcon(x,y,kind){ // kleines Beispiel eines Haltestellensymbols für die Legende
  const sp=SP(), SZ=({s:[5,0],m:[7,2],l:[10,5]})[sp.size]||[7,2], w=5, g=9, R=w/2+SZ[1]+sp.bw, k=Math.max(3.5,R-sp.bw-2.5);
  const lc=[0,1,2].map(i=>(S.lines[i]||{}).color||["#8a8a8a","#b5b5b5","#8a8a8a"][i]);
  const n=kind==="part"?3:2, last=kind==="part"?1:n-1, cx=x+20, y0=y+R+2; let o="";
  for(let i=0;i<n;i++) o+=`<path d="M${x} ${y0+i*g}h40" stroke="${lc[i]}" stroke-width="${w}" fill="none"/>`;
  const cap=(w2,col)=>`<path d="M${cx} ${y0}L${cx+.01} ${y0+last*g}" stroke="${col}" stroke-width="${w2}" stroke-linecap="round" fill="none"/>`;
  o+=(sp.bw>0?cap(2*R,kind==="temp"?sp.tc:sp.color):"")+cap(2*R-2*sp.bw,sp.fill);
  if(kind==="dirAll") o+=tri({x:cx,y:y0+last*g/2},{x:1,y:0},1,k,sp.color);
  if(kind==="dirSome") o+=tri({x:cx,y:y0},{x:1,y:0},1,k,lc[0]);
  return [o,(n-1)*g+2*R+4];
}
function extras(){
  const T1=TP("h1"),T2=TP("h2"),TS=TP("sub"),TT=TP("leg"),TE=TP("en"),tr=TR(); let o="";
  const tx=(t,x,y,txt,col)=>`<text x="${x}" y="${y}" ${ts(t,col)} dominant-baseline="hanging">${esc(txt)}</text>`;
  const head=(x,y,txt,en)=>`<text x="${x}" y="${y+T2.size*.85}" ${ts(T2)}>${esc(txt)}${S.legend.en?`<tspan dx="10" ${ts(TE)}>${esc(en)}</tspan>`:""}</text>`;
  if(S.frame) o+=`<rect x="8" y="8" width="${CW()*G-16}" height="${CH()*G-16}" fill="none" stroke="#222" stroke-width="3" rx="6"/>`;
  if(S.foot) o+=tx(TT,G,CH()*G-G-TT.size,S.foot);
  if(S.title.on){const x=S.title.x*G,y=S.title.y*G;o+=tx(T1,x,y,S.title.text)+tx(TS,x,y+T1.size*1.35,S.title.sub)}
  if(S.legend.on){
    const x=S.legend.x*G; let y=S.legend.y*G;
    o+=head(x,y,LT("legend"),tr.legend); y+=T2.size*1.8;
    [...S.design.cats].sort((a,b)=>b.w-a.w).forEach(c=>{
      o+=`<path d="M${x} ${y+9}h40" stroke="#444" stroke-width="${c.w}" fill="none"${c.dash?` stroke-dasharray="${c.dash==="dot"?"1 9":"12 8"}"`:""}${c.dash==="dot"?' stroke-linecap="round"':""}/>`+tx(TT,x+54,y,c.name);
      y+=Math.max(26,c.w+14);
    });
    /* Haltestellensymbole und Zeichnungen: nur, wenn sie im Plan vorkommen; sortiert nach Wichtigkeit (Netz, Haltestellen, Zeichnungen) */
    const kinds={};
    Object.entries(info).forEach(([nid,q])=>{
      const sid=nid.split("#")[0], nd=q.ls.filter(e=>(line(e.id).dir||{})[sid]).length, np=LB.pass&&LB.pass.has(nid);
      if(np) kinds.part=1; if(nd&&nd===q.ls.length) kinds.dirAll=1; else if(nd) kinds.dirSome=1; if(!np&&!nd) kinds.plain=1; if(q.ls.some(e=>(line(e.id).temp||{})[sid])) kinds.temp=1;
    });
    ["plain","part","dirAll","dirSome","temp"].forEach(k=>{const t=LT(k);
      if(!kinds[k]) return;
      const [ic,h]=symIcon(x,y,k), hh=Math.max(26,h);
      o+=ic+`<text x="${x+54}" y="${y+hh/2}" ${ts(TT)} dominant-baseline="central">${esc(t)}</text>`; y+=hh+6;
    });
    if(Object.keys(S.zig||{}).length){ // Kopplung nur, wenn im Plan vorhanden
      const gp=Math.max(...S.design.cats.map(c=>c.w))+3, h=gp+14, y1=y+6, y2=y1+gp, c0=(S.lines[0]||{}).color||"#8a8a8a", c1=(S.lines[1]||{}).color||"#b5b5b5", pz=[0,1,2,3,4,5,6,7].map(i=>`${x+6+i*4} ${i%2?y2:y1}`).join(" ");
      o+=`<path d="M${x} ${y1}h40" stroke="${c0}" stroke-width="5" fill="none"/><path d="M${x} ${y2}h40" stroke="${c1}" stroke-width="5" fill="none"/><polyline points="${pz}" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/><polyline points="${pz}" fill="none" stroke="#222" stroke-width="1.8" stroke-linejoin="round"/><text x="${x+54}" y="${y+h/2}" ${ts(TT)} dominant-baseline="central">${esc(LT("zig"))}</text>`;
      y+=h+6;
    }
    const usedO=new Set((S.objs||[]).map(b=>b.style));
    OSt().filter(st=>usedO.has(st.id)).sort((a,b)=>b.w-a.w).forEach(st=>{
      const h=Math.max(26,st.w+14);
      o+=(st.area?`<rect x="${x}" y="${y+h/2-8}" width="40" height="16" fill="${st.color}" fill-opacity=".5"/>`:`<path d="M${x} ${y+h/2}h40" stroke="${st.color}" stroke-width="${st.w}" fill="none" stroke-linecap="${st.dash==="dash"?"butt":"round"}"${dashOf(st.dash)?` stroke-dasharray="${dashOf(st.dash)}"`:""}/>`)+`<text x="${x+54}" y="${y+h/2}" ${ts(TT)} dominant-baseline="central">${esc(st.name)}</text>`;
      y+=h;
    });
    if(S.legend.ov!==0&&S.lines.length){
      y+=T2.size*.7; o+=head(x,y,LT("list"),tr.list); y+=T2.size*1.8;
      const fs=TP("badge").size, bh=fs+6, bw=l=>Math.max(bh*1.5,l.name.length*fs*.62+10), cw=Math.max(...S.lines.map(bw));
      sortLines(S.lines).forEach(l=>{
        const w=bw(l), h=Math.max(bh,TT.size);
        o+=`<rect x="${x}" y="${y+(h-bh)/2}" width="${w}" height="${bh}" rx="${l.shape==="rect"?2:bh/2}" fill="${l.color}"/><text x="${x+w/2}" y="${y+h/2}" text-anchor="middle" dominant-baseline="central" font-family="${ff(TP("badge").font)}" font-size="${fs}" font-weight="${TP("badge").b?700:400}" fill="${ink(l.color)}">${esc(l.name)}</text>`;
        o+=`<text x="${x+cw+10}" y="${y+h/2}" dominant-baseline="central" ${ts(TT)}>${esc(routeTxt(l))}</text>`;
        y+=h+8;
      });
    }
    const fl=Object.entries(FN).sort((a,b)=>a[1]-b[1]);
    if(fl.length){y+=T2.size*.7;o+=head(x,y,LT("notes"),tr.notes);y+=T2.size*1.8;fl.forEach(([i,n])=>{o+=tx(TT,x,y,n+"  "+stop(i).fn);y+=TT.size+10})}
  }
  return o;
}
function svgMarkup(ui){
  const W=CW()*G, H=CH()*G, B=build(ui); info=B.I; LB=B; FN=fnMap();
  let out="";
  if(ui) out+=`<defs><pattern id="gd" x="-16" y="-16" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="1.2" fill="#ccc"/></pattern></defs><rect x="-16" y="-16" width="${W+32}" height="${H+32}" fill="url(#gd)"/>`;
  out+=objSvg(ui);
  if(ui&&hl&&hl.l)B.paths.filter(p=>p.lid===hl.l).forEach(p=>out+=`<path d="${p.d}" fill="none" stroke="#ffc400" stroke-opacity=".55" stroke-width="${p.w+14}" stroke-linecap="round" stroke-linejoin="round"/>`);
  [1,0].forEach(ol=>B.paths.forEach(p=>{ // erst alle weißen Umrandungen (1 px je Seite), dann die Linien
    const dd=p.dash==="dash"?"14 9":p.dash==="dot"?"1 10":"";
    out+=`<path d="${p.d}" fill="none" stroke="${ol?"#fff":p.color}" stroke-width="${p.w+(ol?2:0)}" stroke-linejoin="round" stroke-linecap="${p.dash==="dash"?"butt":"round"}"${dd?` stroke-dasharray="${dd}"`:""}/>`;
  }));
  out+=eZig(B);out+=eBadges(B);const gw=Math.max(...S.design.cats.map(c=>c.w))+3;
  if(ui) Object.entries(B.hits).forEach(([k,h])=>out+=`<polyline data-e="${k}"${h.m?' data-m="1"':''} points="${h.p}" fill="none" stroke="transparent" stroke-width="${14+((B.lanes[k]||[]).length)*gw}" style="cursor:pointer"/>`);
  const sp=SP();
  S.stops.forEach(s=>{const ns=nodes(s).filter(n=>n.x!=null);
    for(let i=1;i<ns.length;i++){const r=route(ns[i-1],ns[i]).map((p,j,ar)=>({x:p.x*G,y:p.y*G,r:j&&j<ar.length-1?RAD:0}));out+=`<path d="${pathD(r,false)}" fill="none" stroke="${sp.cc}" stroke-width="${sp.cw}" stroke-linejoin="round"/>`}});
  S.stops.forEach(s=>nodes(s).filter(n=>n.x!=null&&!(ui&&B.hid&&!s.wp&&!B.used.has(s.id))&&(s.wp||!(B.thru.has(n.id)&&!B.I[n.id]))).forEach((n,i)=>{
    if(s.wp){if(ui){const x=n.x*G,y=n.y*G;out+=`<g data-s="${n.id}" style="cursor:move"><path d="M${x-7} ${y}L${x} ${y-7}L${x+7} ${y}L${x} ${y+7}Z" fill="#fff" stroke="${sel===n.id?"#0f6cbd":"#999"}" stroke-width="2"/></g>`}return}
    out+=stopSvg(n,ui,B.ends,i===0)}));
  out+=freeSvg(ui);
  if(ui&&hl&&hl.s){const p=posOf(hl.s);if(p&&p.x!=null)out+=`<circle cx="${p.x*G}" cy="${p.y*G}" r="30" fill="none" stroke="#ffc400" stroke-width="5"><animate attributeName="r" values="14;34;14" dur="1s" repeatCount="2"/></circle>`}
  if(ui) out+=selSvg();
  out+=extras();
  const z=ui?zoom:1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W*z}" height="${H*z}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`;
}
function demo(){
  const P=[["Nordhausen",6,4],["Sondershausen",12,8],["Erfurt",20,12],["Weimar",26,12],["Jena",32,8],["Gera",40,8],["Gotha",12,16],["Eisenach",6,20],["Arnstadt",20,18],["Ilmenau",26,18]];
  const st=P.map(p=>({id:id(),name:p[0],x:p[1],y:p[2],label:"N"})), i=n=>st.find(s=>s.name===n).id, d=empty();
  d.stops=st;
  d.lines=[
    {id:id(),name:"RE 1",color:"#d62828",shape:"pill",closed:false,cats:["c1","c2"],dir:{[i("Gera")]:1},sections:[["Nordhausen","Sondershausen","Erfurt","Weimar","Jena"].map(i),["Jena","Gera"].map(i)]},
    {id:id(),name:"RE 2",color:"#1d6fb8",shape:"rect",closed:false,cats:["c1"],dir:{[i("Weimar")]:1},sections:[["Eisenach","Gotha","Erfurt","Weimar","Jena"].map(i)]},
    {id:id(),name:"S 1",color:"#2a9d4a",shape:"pill",closed:true,cats:["c1"],dir:{},sections:[["Erfurt","Weimar","Ilmenau","Arnstadt"].map(i)]}];
  return d;
}
function eGeo(B,k){
  const h=B.hits[k],L=B.lanes[k]; if(!h||!L||!L.length)return;
  const P=h.cp; let bi=0,bl=-1;
  for(let i=0;i<P.length-1;i++){const l=Math.hypot(P[i+1].x-P[i].x,P[i+1].y-P[i].y);if(l>bl){bl=l;bi=i}}
  if(bl<=0)return;
  const p=P[bi],q=P[bi+1],u={x:(q.x-p.x)/bl,y:(q.y-p.y)/bl};
  return{L,u,n:{x:-u.y,y:u.x},sg:(u.x>1e-6||(Math.abs(u.x)<1e-6&&u.y>0))?1:-1,c:{x:(p.x+q.x)/2,y:(p.y+q.y)/2}}; // sg: Pfeil nach rechts/unten = positiv
}
function eBadges(B){
  let o=""; const gap=Math.max(...S.design.cats.map(c=>c.w))+3, bf=TP("badge"), fs=bf.size, bh=fs+7;
  Object.entries(S.ebadge||{}).forEach(([k,v])=>{const g=eGeo(B,k); if(!g)return;
    const {L,u,n,sg,c}=g, bw=l=>Math.max(bh*1.4,l.name.length*fs*.62+10), mw=Math.max(...L.map(bw))+4;
    let a=Math.atan2(u.y,u.x)*180/Math.PI; if(a>90)a-=180; if(a<=-90)a+=180;
    L.forEach((l,i)=>{ // abwechselnd in zwei Spalten, benachbarte Spuren liegen so nie nebeneinander
      const m=i-(L.length-1)/2, t=(L.length>1?(i%2?.5:-.5)*mw:0)+g.sg*(v.o||0)*16, w=bw(l), x=c.x+u.x*t+n.x*m*gap, y=c.y+u.y*t+n.y*m*gap;
      o+=`<g transform="translate(${x} ${y}) rotate(${a})"><rect x="${-w/2}" y="${-bh/2}" width="${w}" height="${bh}" rx="${l.shape==="rect"?2:bh/2}" fill="${l.color}" stroke="#fff" stroke-width="1.5"/><text text-anchor="middle" dominant-baseline="central" font-family="${ff(bf.font)}" font-size="${fs}" font-weight="${bf.b?700:400}" fill="${ink(l.color)}">${esc(l.name)}</text></g>`;
    });
  });
  return o;
}
function eZig(B){ // Kopplung: Zickzack zwischen zwei benachbarten Spuren
  let o=""; const gap=Math.max(...S.design.cats.map(c=>c.w))+3;
  Object.entries(S.zig||{}).forEach(([key,v])=>{const [k,i]=key.split("#"),g=eGeo(B,k); if(!g||+i+1>=g.L.length)return;
    const {u,n,c}=g, m0=+i-(g.L.length-1)/2, h=v.len*G, N=Math.max(2,Math.round(h/6)), pts=[];
    for(let t=0;t<=N;t++){const d=-h/2+h*t/N+g.sg*(v.o||0)*16, m=m0+(t%2);pts.push(`${c.x+u.x*d+n.x*m*gap} ${c.y+u.y*d+n.y*m*gap}`)}
    o+=`<polyline points="${pts.join(" ")}" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/><polyline points="${pts.join(" ")}" fill="none" stroke="#222" stroke-width="1.8" stroke-linejoin="round"/>`;
  });
  return o;
}
const labelsOf=b=>b.labels||(b.label?[{text:b.label,tpl:b.ltpl||"water",side:b.lside||"on",gap:b.lgap||0,pos:50}]:[]);
function objLabSvg(b,P,st){
  const labs=labelsOf(b).filter(q=>q.text); if(!labs.length)return"";
  const same=P.length>2&&P[0].x===P[P.length-1].x&&P[0].y===P[P.length-1].y, cl=!!st.area||same, Q=st.area&&!same?[...P,P[0]]:P, seg=[]; let L=0,A=0;
  for(let i=0;i<Q.length-1;i++){const l=Math.hypot(Q[i+1].x-Q[i].x,Q[i+1].y-Q[i].y);seg.push(l);L+=l;A+=Q[i].x*Q[i+1].y-Q[i+1].x*Q[i].y}
  if(!L)return"";
  let o="";
  labs.forEach(lb=>{
    const tp=TP(lb.tpl||"water"), sd=lb.side||"on", sg=sd==="on"?0:(sd==="in"?1:-1)*(cl&&A<0?-1:1), off=sg*(st.w/2+tp.size*.7+2), ds=[], p0=(lb.pos==null?50:lb.pos)/100*L;
    if(lb.gap>0){const step=lb.gap*G;for(let d=p0%step;d<=L&&ds.length<300;d+=step)ds.push(d)}else ds.push(p0);
    ds.forEach(d0=>{
      let d=d0,i=0; while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++}
      if(!seg[i])return;
      const p=Q[i],q=Q[i+1],u={x:(q.x-p.x)/seg[i],y:(q.y-p.y)/seg[i]}, x=p.x+u.x*d-u.y*off, y=p.y+u.y*d+u.x*off;
      let a=Math.atan2(u.y,u.x)*180/Math.PI; if(a>90)a-=180; if(a<=-90)a+=180;
      o+=`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${a} ${x} ${y})" ${ts(tp)} paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">${esc(lb.text)}</text>`;
    });
  });
  return o;
}
function selSvg(){
  let o=""; const m=msel, ring=(x,y)=>`<circle cx="${x*G}" cy="${y*G}" r="18" fill="#0f6cbd" fill-opacity=".12" stroke="#0f6cbd" stroke-dasharray="4 3" pointer-events="none"/>`;
  if(m){
    m.s.forEach(i=>{const p=posOf(i);if(p&&p.x!=null)o+=ring(p.x,p.y)});
    m.t.forEach(i=>{const t=(S.texts||[]).find(x=>x.id===i);if(t)o+=ring(t.x,t.y)});
    m.a.forEach(i=>{const a=(S.anns||[]).find(x=>x.id===i);if(a)o+=ring(a.x,a.y)+ring(a.tx,a.ty)});
    m.o.forEach(i=>{const b=obj(i);if(b)o+=`<polyline points="${b.pts.map(p=>p.x*G+","+p.y*G).join(" ")}" fill="none" stroke="#0f6cbd" stroke-opacity=".35" stroke-width="14" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`});
  }
  if(rb) o+=`<rect x="${Math.min(rb.x0,rb.x1)}" y="${Math.min(rb.y0,rb.y1)}" width="${Math.abs(rb.x1-rb.x0)}" height="${Math.abs(rb.y1-rb.y0)}" fill="#0f6cbd" fill-opacity=".12" stroke="#0f6cbd" stroke-dasharray="4 3" pointer-events="none"/>`;
  return o;
}
function pageSync(f){ // festes Seitenformat: Seitenverhältnis des Rasters
  const pg=S.page; if(!pg||pg.fmt==="free") return;
  const r=pg.orient==="port"?297/210:210/297;
  if(f==="rows") S.cols=Math.min(300,Math.max(5,Math.round(S.rows/r))); else S.rows=Math.min(300,Math.max(5,Math.round(CW()*r)));
  const c=document.querySelector('[data-f="cols"]'), w=document.querySelector('[data-f="rows"]'); if(c)c.value=S.cols; if(w)w.value=S.rows;
}
const emptySel=()=>({s:[],o:[],t:[],a:[]});
const pageCss=()=>S.page&&S.page.fmt!=="free"?";size:"+S.page.fmt+" "+(S.page.orient==="port"?"portrait":"landscape"):"";

export const setS=v=>{S=v};export const getS=()=>S;
export const setUi=o=>{if("sel" in o)sel=o.sel;if("zoom" in o)zoom=o.zoom;if("selX" in o)selX=o.selX;if("msel" in o)msel=o.msel;if("rb" in o)rb=o.rb;};
export{svgMarkup,demo,empty,defDesign,stop as stopOf,line as lineOf,posOf,PAL,DIRS,G,ink,CW,CH,pageSync,SP,esc,id as newId};

const s45c=(o,c,j)=>{const p=o.s45&&o.pts[j==null?o.pts.length-1:j-1];if(!p)return c;const dx=c.x-p.x,dy=c.y-p.y,ax=Math.abs(dx),ay=Math.abs(dy);if(ay<=ax*.4142)return{x:c.x,y:p.y};if(ax<=ay*.4142)return{x:p.x,y:c.y};const m=Math.round((ax+ay)/2);return{x:p.x+Math.sign(dx)*m,y:p.y+Math.sign(dy)*m}};
export{s45c,catOf,OSt,obj};export const getLB=()=>LB;

export{TN,LT,TR,TP};

export{labelsOf};
