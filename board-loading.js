(() => {
 const loader=document.getElementById('board-loading');
 if(!loader?.isConnected)return;
 const viewport=document.querySelector('#viewport'),tools=document.querySelector('.view-tools');
 const status=document.getElementById('loading-status'),prints=[...loader.querySelectorAll('.loading-print')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const started=performance.now();let frame=0,angle=0,finished=false;
 viewport.inert=true;tools.inert=true;loader.dataset.state='loading';
 function spin(now){
  if(finished||!loader.isConnected)return;
  angle=(now-started)*.0016;
  prints.forEach((card,i)=>{
   const turn=angle+i*Math.PI*2/5,depth=Math.sin(turn),x=Math.cos(turn)*70,y=depth*24-x*.28;
   card.style.zIndex=String(Math.round((depth+1)*10));
   card.style.transform=`translate(${x}px,${y}px) rotate(${Math.cos(turn)*12}deg) scale(${.85+(depth+1)*.12})`;
  });
  frame=requestAnimationFrame(spin);
 }
 if(!reduced)frame=requestAnimationFrame(spin);
 const paint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 async function reveal(){
  if(finished||!loader.isConnected)return;
  finished=true;cancelAnimationFrame(frame);loader.dataset.state='revealing';
  loader.querySelector('.loading-actions').hidden=true;status.textContent='作品已就绪';
  if(!reduced){
   // Unfurl from the current rotation instead of snapping back to a starting angle.
   const animations=prints.map((card,i)=>{
    const start=card.style.transform||getComputedStyle(card).transform;
    const theta=(-150+i*75)*Math.PI/180,x=Math.cos(theta)*112,y=Math.sin(theta)*82;
    return card.animate([
     {transform:start,opacity:1},
     {transform:`translate(${x}px,${y}px) rotate(${(i-2)*12}deg)`,opacity:1,offset:.72},
     {transform:`translate(${x*1.18}px,${y*1.18}px) rotate(${(i-2)*12}deg) scale(1.06)`,opacity:0}
    ],{duration:800,delay:i*22,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}).finished;
   });
   await Promise.allSettled(animations);
   await loader.animate([{opacity:1},{opacity:0}],{duration:300,fill:'forwards'}).finished.catch(()=>{});
  }
  viewport.inert=false;tools.inert=false;loader.remove();
 }
 document.getElementById('loading-continue').onclick=()=>{finished=true;cancelAnimationFrame(frame);viewport.inert=false;tools.inert=false;loader.remove();};
 function mediaReady(media){
  if(media.tagName==='IMG')return media.decode();
  if(media.error)return Promise.reject(new Error('Video unavailable'));
  if(media.readyState>=2)return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const cleanup=()=>{media.removeEventListener('loadeddata',ready);media.removeEventListener('error',fail);};
   const ready=()=>{cleanup();resolve();},fail=()=>{cleanup();reject(new Error('Video unavailable'));};
   media.addEventListener('loadeddata',ready,{once:true});media.addEventListener('error',fail,{once:true});
  });
 }
 async function waitForBoard(){
  if(!window.portfolioBoardReady)await new Promise(resolve=>document.addEventListener('portfolio:board-ready',resolve,{once:true}));
  await paint();
  const board=document.getElementById('board'),backgrounds=new Set();
  for(const el of [board,...board.querySelectorAll('*')]){
   for(const match of getComputedStyle(el).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))backgrounds.add(match[1]);
  }
  const textures=[...backgrounds].map(src=>{const img=new Image();img.src=src;return img.decode();});
  const results=await Promise.allSettled([
   ...textures,...[...board.querySelectorAll('img,video')].map(mediaReady),
   document.fonts.load('400 20px ProfileHand'),document.fonts.load('400 14px PuHui'),document.fonts.ready
  ]);
  if(!loader.isConnected)return;
  if(results.some(result=>result.status==='rejected')){
   loader.dataset.state='error';status.textContent='部分资源加载失败，请重试';loader.querySelector('.loading-actions').hidden=false;return;
  }
  await paint();
  // Readiness, never a timeout, triggers the reveal.
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,1100-(performance.now()-started))));
  await reveal();
 }
 waitForBoard().catch(()=>{if(loader.isConnected){loader.dataset.state='error';status.textContent='加载遇到问题，请重试';loader.querySelector('.loading-actions').hidden=false;}});
})();
