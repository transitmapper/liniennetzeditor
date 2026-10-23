import {create} from "zustand";
import {empty,demo,setS} from "./core/engine.js";
const clone=o=>JSON.parse(JSON.stringify(o));
export const useStore=create((set,get)=>({
  S:empty(),wiz:"start",past:[],future:[],sel:null,zoom:1,tab:"start",line:null,dirty:false,selX:null,tool:null,pop:null,dlg:null,bg:null,xsel:[],selMode:false,msel:null,rb:null,dtab:"sym",
  edit(fn,push=true){const S=clone(get().S);setS(S);fn(S);set(s=>({S,dirty:true,past:push?[...s.past.slice(-99),s.S]:s.past,future:push?[]:s.future}))},
  undo(){const {past,S,future}=get();if(past.length)set({S:past[past.length-1],past:past.slice(0,-1),future:[S,...future]})},
  redo(){const {past,S,future}=get();if(future.length)set({S:future[0],future:future.slice(1),past:[...past,S]})},
  load(S){set({S,past:[],future:[],sel:null,selX:null,tool:null,pop:null,msel:null,rb:null,line:null,dirty:false})},
  fresh(){get().load(empty())},
  setSel(sel){set({sel})},setZoom(z){set({zoom:Math.min(2.5,Math.max(.4,z))})},setTab(tab){const {tool,S,dlg}=get();let S2=S;if(tool){const o=(S.objs||[]).find(x=>x.id===tool);if(o&&o.pts.length<2)S2={...S,objs:S.objs.filter(x=>x!==o)}}
    set({tab,S:S2,tool:null,selX:null,sel:null,pop:null,msel:null,rb:null,selMode:false,dlg:dlg==="draw"||dlg==="stop"?null:dlg})},setLine(line){set({line})}
}));
