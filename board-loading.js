(() => {
 const loader=document.getElementById('board-loading');if(!loader)return;
 const viewport=document.querySelector('#viewport'),tools=document.querySelector('.view-tools');
 const status=document.getElementById('loading-status'),prints=[...loader.querySelectorAll('.loading-print')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const returning=Boolean(window.portfolioReturning);
 const started=performance.now();let frame=0,angle=0,finished=false;
 const markReady=()=>{try{sessionStorage.setItem('portfolio-home-ready','1');}catch{}document.documentElement.classList.remove('portfolio-returning');};
 if(returning){
  const resume=()=>{viewport.inert=false;tools.inert=false;loader.remove();markReady();};
  if(window.portfolioBoardReady)resume();else document.addEventListener('portfolio:board-ready',resume,{once:true});
  return;
 }
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
  loader.querySelector('.loading-actions').hidden=true;status.textContent=document.documentElement.lang==='en'?'Ready to explore':'作品已就绪';
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
  viewport.inert=false;tools.inert=false;loader.remove();markReady();
 }
 document.getElementById('loading-continue').onclick=()=>{finished=true;cancelAnimationFrame(frame);viewport.inert=false;tools.inert=false;loader.remove();markReady();};

 async function prepare(){
  const pending=[window.portfolioTextReady,document.fonts.ready];
  for(const image of viewport.querySelectorAll('img')){
   const r=image.getBoundingClientRect();
   if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)continue;
   image.loading='eager';image.fetchPriority='high';pending.push(image.decode().catch(()=>{}));
  }
  // Video decoding and off-screen media must not hold the homepage behind the loader.
  for(const source of ['profile-paper-fine.webp','year-pins.webp']){const image=new Image();image.src='assets/'+source;pending.push(image.decode().catch(()=>{}));}
  await Promise.race([Promise.allSettled(pending),new Promise(resolve=>setTimeout(resolve,3500))]);
  await paint();await reveal();
 }
 if(window.portfolioBoardReady)prepare();else document.addEventListener('portfolio:board-ready',prepare,{once:true});
})();
