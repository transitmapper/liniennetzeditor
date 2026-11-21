import {useStore} from "./store.js";
import {addRecent} from "./tools.js";
/* Speichern und Öffnen über die File System Access API (Chrome, Edge, Opera). Sonst: Download bzw. Datei-Dialog. */
export const canFS=typeof window!=="undefined"&&"showSaveFilePicker" in window&&"showOpenFilePicker" in window;
const TYPES=[{description:"Liniennetz-Projekt (JSON)",accept:{"application/json":[".json"]}}];
export const autoPref=()=>{try{return localStorage["liniennetz-auto"]!=="0"}catch{return true}};
export async function writeTo(h,text){const w=await h.createWritable();try{await w.write(text);await w.close()}catch(e){try{await w.abort()}catch{}throw e}}
/* Schreibrechte prüfen; ask=true fragt (nur in Klick-Handlern erlaubt) nach */
export async function perm(h,ask){
  if(!h.queryPermission)return true;
  const o={mode:"readwrite"};
  if(await h.queryPermission(o)==="granted")return true;
  return !!ask&&(await h.requestPermission(o))==="granted";
}
export async function savePick(name){
  try{return await window.showSaveFilePicker({suggestedName:name,types:TYPES})}
  catch(e){if(e&&e.name==="AbortError")return null;throw e}
}
/* Öffnet eine Projektdatei und merkt sich das Datei-Handle, damit Speichern in dieselbe Datei schreibt */
export async function openProject(){
  let h;
  try{[h]=await window.showOpenFilePicker({types:TYPES})}
  catch(e){if(e&&e.name==="AbortError")return false;alert("Datei konnte nicht geöffnet werden.");return false}
  try{
    const f=await h.getFile(),t=await f.text(),d=JSON.parse(t);
    if(!d.design||!d.stops)throw 0;
    useStore.getState().load(d);useStore.setState({fh:h});addRecent(f.name,t);return true;
  }catch{alert("Datei konnte nicht gelesen werden.");return false}
}