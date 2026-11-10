(() => {
 const profile=document.getElementById('profile'),board=document.getElementById('board');
 if(!profile||!board)return;
 const jobs=[
  {company:'Tongcheng Travel',role:'UX Product Designer',date:'2025.07 Present · Suzhou',keywords:'AI products / Information architecture / Complex workflows',x:810,y:1190,color:'#dce9d6'},
  {company:'Asian Noodle Company',role:'Service Designer',date:'2023.12 - 2025.06 · Guangzhou',keywords:'User journeys / Brand strategy / Service experience',x:1230,y:1190,color:'#eee0ed'},
  {company:'Nomo Fintech',role:'UX & UI Designer',date:'2022.07 - 2022.12 · London',keywords:'Product systems / Interaction patterns / Localisation research',x:810,y:1480,color:'#dce9ef'},
  {company:'NetEase Games',role:'UX Researcher',date:'2019.07 - 2021.07 · Guangzhou',keywords:'User research / UX evaluation / Operations strategy',x:1230,y:1480,color:'#f3e7b8'}
 ];
 let opened=false,busy=false,elements=[],revision=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 profile.setAttribute('role','button');profile.tabIndex=0;
 profile.setAttribute('aria-label','Profile: show or hide four work experiences');profile.setAttribute('aria-expanded','false');
 async function toggle(){
  if(busy||board.classList.contains('rearranging'))return;
  const turn=++revision;
  busy=true;opened=!opened;profile.setAttribute('aria-expanded',String(opened));
  if(opened){
   elements=jobs.map((job,index)=>{
    const note=document.createElement('article');note.className='career-note item';note.setAttribute('aria-label',job.company+'Work experience');
    note.style.cssText=`left:${job.x}px;top:${job.y}px;--note-color:${job.color};--note-angle:${index%2?3:-3}deg`;
    for(const [tag,className,text] of [['p','career-date',job.date],['h2','career-company',job.company],['p','career-role',job.role],['p','career-keywords',job.keywords]]){
     const el=document.createElement(tag);el.className=className;el.textContent=text;note.append(el);
    }
    board.append(note);
    const pin=document.createElement('img');pin.src='assets/board-pin.png';pin.alt='';pin.className='pushpin career-pin';pin.style.cssText=`left:${job.x+125}px;top:${job.y-40}px`;
    document.getElementById('pins').append(pin);
    const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.classList.add('career-thread');
    const endX=job.x+151,endY=job.y+3;
    line.setAttribute('d',`M1365,1070 L${endX},${endY}`);
    document.getElementById('threads').append(line);line.style.opacity=0;pin.style.opacity=0;
    return {note,pin,line,job,index};
   });
  }
  let bounds;
  if(opened){
   // Leave room for the rotated paper backing, signature and note pins.
   const firstRow=profile.offsetTop+profile.offsetHeight+130;
   const rowStep=Math.max(...elements.slice(0,2).map(({note})=>note.offsetHeight))+85;
   elements.forEach(({note,pin,line,job,index})=>{
    job.y=firstRow+Math.floor(index/2)*rowStep;
    note.style.top=job.y+'px';
    pin.style.left=(job.x+note.offsetWidth/2-26)+'px';
    pin.style.top=(job.y-40)+'px';
    line.setAttribute('d',`M1365,1070 L${job.x+note.offsetWidth/2},${job.y+3}`);
   });
   bounds={
    left:Math.min(profile.offsetLeft-60,...elements.map(({note})=>note.offsetLeft-45)),
    right:Math.max(profile.offsetLeft+profile.offsetWidth+90,...elements.map(({note})=>note.offsetLeft+note.offsetWidth+45)),
    top:profile.offsetTop-90,
    bottom:Math.max(...elements.map(({note})=>note.offsetTop+note.offsetHeight+50))
   };
  }
  document.dispatchEvent(new CustomEvent('portfolio:career-toggle',{detail:{opened,bounds}}));
  await Promise.all(elements.map(async({note,pin,line,job,index})=>{
   line.style.opacity=0;pin.style.opacity=0;
   const compact={transform:`translate(${1010-job.x}px,${650-job.y}px) scale(.3) rotate(0deg)`,opacity:0};
   const spread={transform:`translate(0,0) scale(1) rotate(${index%2?3:-3}deg)`,opacity:1};
   if(!reduced.matches)await note.animate(opened?[compact,spread]:[spread,compact],{duration:opened?420:300,delay:opened?index*35:0,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}).finished.catch(()=>{});
   if(turn!==revision)return;
   if(opened){pin.style.opacity=1;line.style.opacity=1;}else{note.remove();pin.remove();line.remove();}
  }));
  if(turn!==revision)return;
  if(!opened)elements=[];
  busy=false;
 }
 profile.addEventListener('click',toggle);
 profile.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
 function reset(){
  revision++;
  elements.forEach(({note,pin,line})=>{
   note.getAnimations().forEach(animation=>animation.cancel());
   note.remove();pin.remove();line.remove();
  });
  elements=[];opened=false;busy=false;profile.setAttribute('aria-expanded','false');
 }
 document.addEventListener('portfolio:layout-change',reset);
 document.addEventListener('portfolio:projects-opening',reset);
})();
