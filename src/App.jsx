import React,{useRef,useEffect} from "react";
import {FluentProvider,webLightTheme,webDarkTheme,TabList,Tab,Button,Select,Label,Tooltip,Menu,MenuTrigger,MenuPopover,MenuList,MenuItem} from "@fluentui/react-components";
import {ArrowUndo24Regular,ArrowRedo24Regular,ZoomIn24Regular,ZoomOut24Regular} from "@fluentui/react-icons";
import {useStore} from "./store.js";
import Canvas from "./Canvas.jsx";
import Wizard from "./Wizard.jsx";import {Pop} from "./Pop.jsx";
import {LinesDialog,CheckDialog} from "./Dialogs.jsx";
import {PlanDialog,StopDialog,DesignDialog} from "./Dialogs2.jsx";
import {DrawPanel,DrawDialog} from "./DrawPanel.jsx";
import {Shell,R,Tx,Ck} from "./ui.jsx";
import {autoLabels,csvStops,csvLines,csvIn,exportSel,importSel,exportMsel,dl,addRecent,fname} from "./tools.js";
import {svgMarkup,setS,demo,CW,CH} from "./core/engine.js";
const Gp=({t,children})=><div style={{display:"flex",flexDirection:"column",padding:"0 12px",borderRight:"1px solid var(--colorNeutralStroke2)"}}><div style={{display:"flex",gap:6,alignItems:"flex-end",flex:1}}>{children}</div><div style={{fontSize:11,textAlign:"center",opacity:.7,marginTop:4}}>{t}</div></div>;
const set=useStore.setState, dlg=n=>()=>set({dlg:n}), dsg=(n,t)=>()=>set({dlg:"design",dtab:t});
export default function App(){
  const st=useStore(),{S,sel,tab,selMode,msel,bg,edit,setTab,setSel}=st,fileRef=useRef(),bgRef=useRef(),xRef=useRef(),cRef=useRef(),dRef=useRef(),dark=matchMedia("(prefers-color-scheme: dark)").matches;
  useEffect(()=>{const k=e=>{if(!(e.ctrlKey||e.metaKey)||/INPUT|SELECT/.test(e.target.tagName))return;const c=e.key.toLowerCase();
    if(c==="z"){e.preventDefault();e.shiftKey?st.redo():st.undo()}else if(c==="y"){e.preventDefault();st.redo()}else if(c==="s"){e.preventDefault();save()}};
    addEventListener("keydown",k);return()=>removeEventListener("keydown",k)});
  const save=()=>{const j=JSON.stringify(S,null,1);dl(fname(S,"json"),"application/json",j);addRecent(fname(S,"json"),j);set({dirty:false})};
  const rd=(ref,fn)=>e=>{const f=e.target.files[0];e.target.value="";f&&f.text().then(t=>{try{fn(t)}catch{alert("Datei konnte nicht gelesen werden.")}})};
  const svg=()=>{setS(S);dl(fname(S,"svg"),"image/svg+xml",svgMarkup(false))};
  const png=()=>{setS(S);const u=URL.createObjectURL(new Blob([svgMarkup(false)],{type:"image/svg+xml"})),im=new Image();im.onload=()=>{const c=document.createElement("canvas"),k=Math.min(+S.pngk||2,16000/(32*Math.max(CW(),CH())));c.width=CW()*32*k;c.height=CH()*32*k;const x=c.getContext("2d");x.scale(k,k);x.drawImage(im,0,0);c.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=fname(S,"png");a.click()})};im.src=u};
  const pdf=()=>{const w=window.open("");if(!w)return alert("Pop-ups erlauben.");setS(S);const pg=S.page&&S.page.fmt!=="free"?";size:"+S.page.fmt+" "+(S.page.orient==="port"?"portrait":"landscape"):"";w.document.write("<title>"+fname(S).replace(/[<&]/g,"")+"</title><style>@page{margin:0"+pg+"}body{margin:0}svg{width:100%;height:auto}</style>"+svgMarkup(false));w.document.close();setTimeout(()=>w.print(),400)};
  const sorted=[...S.stops].sort((a,b)=>a.name.localeCompare(b.name,"de"));
  const delSel=()=>{edit(D=>{const m=msel;D.stops=D.stops.filter(s=>!m.s.includes(s.id));D.lines.forEach(l=>{l.sections=l.sections.map(c=>c.filter(i=>!m.s.includes(i)))});D.objs=(D.objs||[]).filter(o=>!m.o.includes(o.id));D.texts=(D.texts||[]).filter(o=>!m.t.includes(o.id));D.anns=(D.anns||[]).filter(o=>!m.a.includes(o.id))});set({msel:null})};
  const panels={
   start:<>
    <Gp t="Datei"><Button onClick={()=>{if(!st.dirty||confirm("Ungespeicherte Änderungen gehen verloren. Trotzdem zum Startbildschirm?"))set({wiz:"start"})}}>Neu</Button><Button onClick={()=>fileRef.current.click()}>Öffnen</Button><Button onClick={save}>Speichern</Button><Button onClick={()=>st.load(demo())}>Beispielnetz</Button></Gp>
    <Gp t="Export"><Button appearance="primary" onClick={svg}>SVG</Button><Button appearance="primary" onClick={png}>PNG</Button><Button appearance="primary" onClick={pdf}>PDF</Button></Gp>
    <Gp t="Auswahl"><Button appearance={selMode?"primary":"secondary"} onClick={()=>set({selMode:!selMode,msel:null,rb:null,sel:null,selX:null})}>Auswahlmodus</Button><Button disabled={!msel||!msel.s.length} onClick={()=>exportMsel(S,msel)}>Exportieren</Button><Button disabled={!msel} onClick={delSel}>Löschen</Button><Button onClick={()=>xRef.current.click()}>Importieren</Button></Gp>
    <Gp t="Hintergrund"><Button onClick={dlg("bg")}>Hintergrundbild…</Button></Gp></>,
   plan:<Gp t="Plan"><Button onClick={dlg("plan")}>Plan-Einstellungen…</Button></Gp>,
   net:<>
    <Gp t="Netz"><Button onClick={dlg("stop")}>Haltestellen…</Button><Button onClick={dlg("lines")}>Linien bearbeiten…</Button>
      <div style={{display:"flex",flexDirection:"column"}}><Label size="small">Zum Platzieren wählen</Label><Select style={{width:190}} value={sel?sel.split("#")[0]:""} onChange={(_,d)=>setSel(d.value||null)}><option value="">–</option>{sorted.map(x=><option key={x.id} value={x.id}>{x.name}{x.x==null?" (nicht gesetzt)":""}</option>)}</Select></div></Gp>
    <Gp t="Werkzeuge"><Button onClick={dlg("check")}>Prüfung…</Button><Button onClick={()=>edit(D=>autoLabels(D))}>Labels automatisch</Button>
      <Menu><MenuTrigger disableButtonEnhancement><Button>CSV…</Button></MenuTrigger><MenuPopover><MenuList><MenuItem onClick={()=>cRef.current.click()}>Importieren</MenuItem><MenuItem onClick={()=>csvStops(S)}>Haltestellen exportieren</MenuItem><MenuItem onClick={()=>csvLines(S)}>Linien exportieren</MenuItem></MenuList></MenuPopover></Menu></Gp></>,
   draw:<DrawPanel/>,
   design:<>
    <Gp t="Entwurf bearbeiten"><Button onClick={dsg(0,"sym")}>Haltestellensymbol…</Button><Button onClick={dsg(0,"cats")}>Kategorien…</Button><Button onClick={dsg(0,"tpl")}>Textvorlagen…</Button><Button onClick={dsg(0,"ost")}>Zeichenstile…</Button><Button onClick={dsg(0,"leg")}>Legendentexte…</Button><Button onClick={dsg(0,"ann")}>Astanmerkung…</Button></Gp>
    <Gp t="Datei"><Button onClick={()=>dl("entwurf.json","application/json",JSON.stringify(S.design,null,1))}>Entwurf speichern</Button><Button onClick={()=>dRef.current.click()}>Entwurf laden</Button></Gp></>
  };
  return <FluentProvider theme={dark?webDarkTheme:webLightTheme} style={{height:"100%",display:"grid",gridTemplateRows:"auto auto 1fr"}}>
    <div style={{display:"flex",alignItems:"center",padding:"4px 12px 0"}}>
      <TabList selectedValue={tab} onTabSelect={(_,d)=>setTab(d.value)}>{[["start","Start"],["plan","Plan"],["net","Netz"],["draw","Zeichnen"],["design","Entwurf"]].map(([k,n])=><Tab key={k} value={k}>{n}</Tab>)}</TabList><span style={{flex:1}}/>
      <Tooltip content="Rückgängig (Strg+Z)" relationship="label"><Button appearance="subtle" icon={<ArrowUndo24Regular/>} disabled={!st.past.length} onClick={st.undo}/></Tooltip>
      <Tooltip content="Wiederholen (Strg+Y)" relationship="label"><Button appearance="subtle" icon={<ArrowRedo24Regular/>} disabled={!st.future.length} onClick={st.redo}/></Tooltip>
      <Button appearance="subtle" icon={<ZoomOut24Regular/>} onClick={()=>st.setZoom(st.zoom-.2)}/><span>{Math.round(st.zoom*100)} %</span><Button appearance="subtle" icon={<ZoomIn24Regular/>} onClick={()=>st.setZoom(st.zoom+.2)}/></div>
    <div style={{display:"flex",padding:"8px 0",overflowX:"auto",borderTop:"1px solid var(--colorNeutralStroke2)",borderBottom:"1px solid var(--colorNeutralStroke2)",minHeight:72}}>{panels[tab]}</div>
    <Canvas/><LinesDialog/><CheckDialog/><PlanDialog/><StopDialog/><DesignDialog/><DrawDialog/><Pop/><Wizard/>
    <Shell side open={st.dlg==="bg"} title="Hintergrundbild (Pause, nicht im Export)"><R><Button onClick={()=>bgRef.current.click()}>{bg?"Ersetzen":"Bild laden"}…</Button>{bg&&<Button onClick={()=>set({bg:null})}>Entfernen</Button>}</R>
      {bg&&<R>{[["o","Deckkraft %",0],["s","Größe %",5],["x","X (px)",-9999],["y","Y (px)",-9999]].map(([f,l])=><Tx key={f} l={l} t="number" w={90} v={bg[f]} on={v=>set({bg:{...bg,[f]:v}})}/>)}</R>}<p style={{opacity:.7,fontSize:12}}>Das Bild wird nicht in der Projektdatei gespeichert.</p></Shell>
    <input ref={bgRef} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files[0];if(f)set({bg:{url:URL.createObjectURL(f),o:35,s:100,x:0,y:0}});e.target.value=""}}/>
    <input ref={cRef} type="file" accept=".csv,.txt" hidden onChange={rd(0,t=>{let n;edit(D=>{n=csvIn(D,t)});n<0?alert("Unbekanntes Format. Kopfzeile „Name;Spalte;Zeile“ oder „Linie;Farbe;Verlauf“ erwartet."):alert(n+" Zeilen importiert.")})}/>
    <input ref={xRef} type="file" accept=".json" hidden onChange={rd(0,t=>{const j=JSON.parse(t);if(!j.fragment)throw 0;const dx=+prompt("Verschiebung in Spalten (0 = keine):","0")||0,dy=+prompt("Verschiebung in Zeilen:","0")||0;edit(D=>importSel(D,j,dx,dy))})}/>
    <input ref={dRef} type="file" accept=".json" hidden onChange={rd(0,t=>{const d=JSON.parse(t);if(!d.cats||!d.tpl)throw 0;edit(D=>{D.design=d})})}/>
    <input ref={fileRef} type="file" accept=".json" hidden onChange={e=>{const f=e.target.files[0];e.target.value="";f&&f.text().then(t=>{try{const d=JSON.parse(t);if(!d.design||!d.stops)throw 0;st.load(d);addRecent(f.name,t)}catch{alert("Datei konnte nicht gelesen werden.")}})}}/>
  </FluentProvider>;
}
