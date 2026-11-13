(function(){
  var strecke=document.querySelector('.strecke');
  if(!strecke)return;
  var haelte=[].slice.call(document.querySelectorAll('.halt'));
  function fortschritt(){
    var r=strecke.getBoundingClientRect(),vh=window.innerHeight,y=vh*0.55;
    var p=Math.max(0,Math.min(1,(y-r.top)/r.height));
    strecke.style.setProperty('--p',p);
    haelte.forEach(function(h){h.classList.toggle('da',h.getBoundingClientRect().top<y)});
  }
  addEventListener('scroll',fortschritt,{passive:true});
  addEventListener('resize',fortschritt);
  fortschritt();
  // fehlende Beispielpläne sichtbar markieren, statt ein kaputtes Bild zu zeigen
  [].forEach.call(document.querySelectorAll('.plan img'),function(img){
    function fehlt(){var f=img.closest('.plan');f.classList.add('fehlt');img.replaceWith(document.createTextNode(img.alt))}
    img.addEventListener('error',fehlt);
    if(img.complete&&img.naturalWidth===0)fehlt();
  });
})();