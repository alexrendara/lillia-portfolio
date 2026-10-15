await window.coverMediaReady;
const viewport=document.querySelector('#viewport'), board=document.querySelector('#board');
// Use native media dimensions so replacement covers retain their aspect ratio.
function sizeCover(media){
 const host=media.closest('.project-card,.print-0');
 if(!host)return;
 const width=media.naturalWidth||media.videoWidth,height=media.naturalHeight||media.videoHeight;
 if(!width||!height)return;
 (host.closest('.year')||host).classList.toggle('is-landscape',width>height);
}
board.addEventListener('load',event=>sizeCover(event.target),true);
board.addEventListener('loadedmetadata',event=>sizeCover(event.target),true);
new MutationObserver(()=>board.querySelectorAll('.print-0 img,.print-0 video,.project-card img,.project-card video').forEach(sizeCover)).observe(board,{childList:true,subtree:true});
const years=[
 {year:2026,x:510,y:220,color:'#b4d0ac',tilt:-5,images:['year-2026-cover.png','tongcheng-ai/footprint-album.png','tongcheng-ai/route-detail.png'],label:'景区智能导览系统'},
 {year:2025,x:530,y:850,color:'#bca4da',tilt:4,images:['year-2025-cover.png','project-linghui-ai-cover.png','project-ai-ticket-cover.png'],label:'人工智能创作与生成'},
 {year:2024,x:1480,y:200,color:'#91bdcf',tilt:5,images:['year-2024-cover.png','ace-exam/test-dashboard.png','ace-exam/test-create-timed.png'],label:'医学考试学习平台'},
 {year:2023,x:1470,y:690,color:'#df8a76',tilt:-4,images:['year-2023-cover.png','year-2023-cover.png'],label:'服务设计项目探索，暂未开放',locked:true},
 {year:2022,x:130,y:580,color:'#ffdb5e',tilt:-7,images:['year-2022-cover.png','project-play-cover.png'],label:'数字银行与儿童活动体验'},
];
const regions=[
 {year:'伦敦',x:250,y:200,color:'#a9bcd6',tilt:4,images:['regions/london.jpg','project-nomo-cover.png','project-play-cover.png'],label:'伦敦，数字银行与儿童活动体验'},
 {year:'新西兰',x:1660,y:60,color:'#b4d0ac',tilt:-6,images:['regions/new-zealand.jpg','project-ace-exam-cover.png'],label:'新西兰，医学考试学习平台'},
 {year:'苏州',x:450,y:1250,color:'#d6b5d9',tilt:-5,images:['regions/suzhou.jpg','project-ai-ticket-cover.png','project-ai-travel-photo-cover.png'],label:'苏州，智能导览与人工智能创作'},
 {year:'广州',x:2350,y:620,color:'#ecc784',tilt:6,images:['regions/guangzhou.jpg'],label:'广州，正在更新中',locked:true},
];
let mode='years';
const projects={
 2026:[{title:'同程旅行景区AI导览',image:'project-tongcheng-ai-cover.png',page:'tongcheng-ai-guide',x:155,y:110}],
 2025:[{title:'灵绘AI',image:'project-linghui-ai-cover.png',page:'linghui-ai',x:60,y:1210},{title:'年会电子纪念票',image:'project-ai-ticket-cover.png',page:'ai-ticket',x:-390,y:1080},{title:'AI旅拍',image:'project-ai-travel-photo-cover.png',page:'ai-travel-photo',x:475,y:1450}],
 2024:[{title:'Ace the Exam',image:'project-ace-exam-cover.png',page:'ace-the-exam',x:1940,y:240}],
 2022:[{title:'Nomo Fintech',image:'project-nomo-cover.png',page:'nomo-fintech',x:-390,y:65},{title:'Play@',image:'project-play-cover.png',page:'play-at',x:-430,y:455}],
};
const expandedYears=new Map();
// Leave room for landscape prints, their pins, and their rotated corners.
Object.assign(years[0],{x:340,y:130});
Object.assign(years[1],{x:320,y:1040});
Object.assign(years[2],{x:1670,y:140});
Object.assign(years[3],{x:2450,y:650});
Object.assign(years[4],{x:-130,y:520});
Object.assign(projects[2025][0],{x:-100,y:1770});
Object.assign(projects[2025][1],{x:-790,y:1270});
Object.assign(projects[2025][2],{x:610,y:1950});
Object.assign(projects[2022][0],{x:-1470,y:50});
Object.assign(projects[2022][1],{x:-810,y:250});
const regionProjects={
 '伦敦':projects[2022].map((project,i)=>({...project,x:-700,y:80+i*620})),
 '新西兰':projects[2024].map(project=>({...project,x:2350,y:-100})),
 '苏州':[...projects[2026],...projects[2025]].map((project,i)=>({...project,x:-450+i*680,y:i%2?2300:1770})),
 '广州':[]
};
const groupProjects=item=>(mode==='years'?projects:regionProjects)[item.year]||[];
function toggleUpdate(item,trigger){
 if(switching||projectMotion)return;
 const existing=trigger.querySelector('.update-note');
 if(existing){existing.remove();trigger.setAttribute('aria-expanded','false');return;}
 const note=document.createElement('span');note.className='update-note';note.setAttribute('role','status');note.textContent='正在更新中';
 trigger.append(note);trigger.setAttribute('aria-expanded','true');
 if(!reducedMotion.matches)note.animate([{opacity:0,transform:'translateX(-18px) rotate(-8deg)'},{opacity:1,transform:'translateX(0) rotate(4deg)'}],{duration:260,easing:'ease-out'});
}
let projectMotion=0;
function clearProjects(){
 cancelAnimationFrame(projectMotion);projectMotion=0;
 board.querySelectorAll('.project-card,.project-pin,.project-thread').forEach(el=>el.remove());
 expandedYears.clear();
 board.querySelectorAll('.year[aria-expanded]').forEach(el=>{el.setAttribute('aria-expanded','false');el.classList.remove('projects-open');});
}
async function toggleYear(item,trigger){
 if(switching||projectMotion)return;
 projectMotion=-1;
 const closing=expandedYears.has(item.year),index=(mode==='years'?years:regions).indexOf(item);
 const entries=closing?expandedYears.get(item.year):groupProjects(item).map((project,i)=>{
  const card=document.createElement('a');card.className='project-card item';card.href=`projects/${project.page}.html`;card.style.visibility='hidden';
  card.style.setProperty('--paper',i%2?'#e4e3dc':'#fcfcf7');card.style.setProperty('--angle',`${i%2?5:-4}deg`);
  const img=window.createCoverMedia(project.image);
  const title=document.createElement('span');title.textContent=project.title;card.append(img,title);board.append(card);
  const pin=document.createElement('span');pin.className='pushpin year-pin project-pin';pin.style.backgroundPosition=`${index*25}% 0`;pin.style.opacity=0;pin.setAttribute('aria-hidden','true');board.append(pin);
  const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.classList.add('project-thread');line.dataset.year=item.year;line.style.opacity=0;
  const sx=item.x+149,sy=item.y+9,tx=project.x+170,ty=project.y+8;
  line.setAttribute('d',ty>sy+290?`M${sx},${sy} C${sx},${ty} ${tx},${ty-20} ${tx},${ty}`:`M${sx},${sy} Q${(sx+tx)/2},${(sy+ty)/2-12} ${tx},${ty}`);
  document.querySelector('#threads').append(line);
  return {project,card,pin,line};
 });
 await Promise.all(entries.map(({card})=>{const media=card.querySelector('img,video');return media.tagName==='IMG'?media.decode().catch(()=>{}):new Promise(resolve=>{if(media.readyState>=1||media.error)return resolve();media.addEventListener('loadedmetadata',resolve,{once:true});media.addEventListener('error',resolve,{once:true});setTimeout(resolve,4000);});}));
 entries.forEach(({card,line,project})=>{
  sizeCover(card.querySelector('img,video'));
  const sx=item.x+149,sy=item.y+9,tx=project.x+card.offsetWidth/2,ty=project.y+8;
  line.setAttribute('d',ty>sy+290?`M${sx},${sy} C${sx},${ty} ${tx},${ty-20} ${tx},${ty}`:`M${sx},${sy} Q${(sx+tx)/2},${(sy+ty)/2-12} ${tx},${ty}`);
 });
 trigger.setAttribute('aria-expanded',String(!closing));
 if(!closing){expandedYears.set(item.year,entries);trigger.classList.add('projects-open');}
 entries.forEach(({card,pin,line})=>{card.inert=true;line.style.opacity=0;pin.style.opacity=0;board.append(pin);});
 const start=performance.now(),duration=closing?340:440,stagger=28,total=duration+(entries.length-1)*stagger+90;
 function tick(now){
  const elapsed=reducedMotion.matches?total:now-start;
  entries.forEach(({project,card,pin,line},i)=>{
   const t=Math.max(0,Math.min(1,(elapsed-i*stagger)/duration)),eased=(1-Math.cos(Math.PI*t))/2;
   const compact=Math.min(.68,(trigger.offsetHeight-40)/card.offsetHeight);
   const amount=closing?1-eased:eased,scale=compact+(1-compact)*amount;
   const x=item.x+28+(project.x-item.x-28)*amount,y=item.y+20+(project.y-item.y-20)*amount;
   card.style.left=`${x}px`;card.style.top=`${y}px`;card.style.transform=`scale(${scale}) rotate(${(i%2?5:-4)*amount}deg)`;card.style.visibility='visible';
   pin.style.left=`${x+(card.offsetWidth/2-4)*scale}px`;pin.style.top=`${y-72*scale}px`;pin.style.transform=`scale(${scale})`;pin.style.opacity=String(Math.min(1,amount*5));
   if(!closing&&t===1)line.style.opacity=String(Math.min(1,(elapsed-i*stagger-duration)/90));
  });
  if(elapsed<total)projectMotion=requestAnimationFrame(tick);
  else{
   projectMotion=0;
   if(closing){entries.forEach(({card,pin,line})=>{card.remove();pin.remove();line.remove();});expandedYears.delete(item.year);trigger.classList.remove('projects-open');}
   else entries.forEach(({card,pin,line})=>{card.inert=false;document.querySelector('#pins').append(pin);line.style.opacity=1;});
  }
 }
 projectMotion=requestAnimationFrame(tick);
 if(!closing){
  const left=Math.min(item.x-35,...entries.map(e=>e.project.x-35)),top=Math.min(item.y-85,...entries.map(e=>e.project.y-85));
  const right=Math.max(item.x+trigger.offsetWidth+110,...entries.map(e=>e.project.x+e.card.offsetWidth+50)),bottom=Math.max(item.y+trigger.offsetHeight+80,...entries.map(e=>e.project.y+e.card.offsetHeight+45));
  const scale=Math.max(MIN,Math.min(DEFAULT_SCALE,(viewport.clientWidth-60)/(right-left),(viewport.clientHeight-130)/(bottom-top)));
  moveCamera({scale,x:viewport.clientWidth/2-(left+right)/2*scale,y:(viewport.clientHeight-80)/2-(top+bottom)/2*scale});
 }
}
function drawLayout(){
board.querySelectorAll('.year').forEach(el=>el.remove());
document.querySelector('#threads').replaceChildren();document.querySelector('#pins').replaceChildren();
const items=mode==='years'?years:regions;
for(const item of items){
 const single=!item.locked&&mode==='years'&&projects[item.year]?.length===1;
 const el=document.createElement(single?'a':'button');
 el.className=`year item${item.locked?' locked':''}`;
 el.style.cssText=`left:${item.x}px;top:${item.y}px;--color:${item.color};--tilt:${item.tilt}deg`;
 el.id=`year-${item.year}`;
 if(single){
  el.href=`projects/${projects[item.year][0].page}.html`;
  el.onclick=event=>{if(switching||projectMotion)event.preventDefault();};
 }else{
  el.type='button';el.setAttribute('aria-expanded','false');el.onclick=()=>item.locked?toggleUpdate(item,el):toggleYear(item,el);
 }
 el.setAttribute('aria-label',mode==='years'?`${item.year}，${item.label}`:item.label);
 el.innerHTML=`<span class="photo-stack">${item.images.map((src,i)=>`<span class="polaroid print-${i}"><img src="assets/${src}" alt="${i?'':item.label}" draggable="false"></span>`).reverse().join('')}</span><span class="year-tag">${item.year}</span>`;
 board.append(el);
}
// All pins and threads share the board's world coordinates and sit above every paper.
board.querySelectorAll('.year .polaroid img').forEach(img=>{const key=img.getAttribute('src').slice(7);img.replaceWith(window.createCoverMedia(key,img.alt));});
const anchors={profile:[965,470],profileSide:[1365,820],contact:[1960,1037]};
items.forEach(y=>anchors[y.year]=[y.x+149,y.y+9]);
const connections=mode==='years'?[['profile',2026],['profile',2025],['profile',2024],['profileSide',2023],[2022,2025],[2022,'profile'],[2024,2023],[2023,'contact'],['profileSide','contact']]:[['profile','伦敦'],['profile','新西兰'],['profile','苏州'],['profileSide','广州'],['伦敦','苏州'],['新西兰','广州'],['广州','contact'],['profileSide','contact']];
for(const [i,[a,b]] of connections.entries()){const [x,y]=anchors[a],[u,v]=anchors[b];const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.dataset.from=a;path.dataset.to=b;path.setAttribute('d',`M${x},${y} Q${(x+u)/2},${(y+v)/2+20} ${u},${v}`);if(i>3)path.classList.add('secondary');document.querySelector('#threads').append(path);}
for(const [key,[x,y]] of Object.entries(anchors)){
 const colorIndex=items.findIndex(item=>String(item.year)===key);
 const pin=document.createElement(colorIndex<0?'img':'span');
 const offsetX=colorIndex<0?-26:-4,offsetY=colorIndex<0?-43:-80;
 if(colorIndex<0){pin.src='assets/board-pin.png';pin.alt='';}
 pin.dataset.anchor=key;pin.dataset.offsetX=offsetX;pin.dataset.offsetY=offsetY;
 pin.className=`pushpin${colorIndex<0?'':' year-pin'}`;
 pin.style.cssText=`left:${x+offsetX}px;top:${y+offsetY}px`;
 if(colorIndex>=0)pin.style.backgroundPosition=`${colorIndex*25}% 0`;
 document.querySelector('#pins').append(pin);
}
}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let switching=false;
function switchLayout(){
 if(switching||projectMotion)return;
 clearProjects();
 const outgoing=mode==='years'?years:regions;
 mode=mode==='years'?'regions':'years';
 const incoming=mode==='years'?years:regions;
 const button=document.querySelector('#layout-toggle');
 button.textContent=mode==='years'?'按地区':'按年份';
 const label=mode==='years'?'切换为地区陈列':'切换为年份陈列';
 button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(mode==='regions'));
 if(reducedMotion.matches){drawLayout();return;}
 switching=true;button.disabled=true;board.classList.add('rearranging');
 const threads=document.querySelector('#threads');threads.style.opacity='0';
 const collect=items=>items.map((item,index)=>({item,index,el:document.getElementById(`year-${item.year}`),pin:document.querySelector(`[data-anchor="${item.year}"]`)}));
 let moving=collect(outgoing),swapped=false;
 moving.forEach(({el})=>el.inert=true);
 // The compact stack fits fully behind the opaque profile paper, including its pin and tag.
 const center={x:1020,y:590},compact=.65;
 const inDuration=300,outDuration=420,stagger=12;
 const start=performance.now(),gather=inDuration+(outgoing.length-1)*stagger,release=gather;
 const settled=release+outDuration+(incoming.length-1)*stagger,total=settled+80;
 const ease=t=>(1-Math.cos(Math.PI*t))/2;
 function tick(now){
   const elapsed=now-start;
   if(elapsed>=gather&&!swapped){drawLayout();moving=collect(incoming);moving.forEach(({el})=>el.inert=true);swapped=true;}
   for(const {item,index,el,pin} of moving){
     const progress=Math.max(0,Math.min(1,(elapsed-(swapped?release:0)-index*stagger)/(swapped?outDuration:inDuration)));
     const amount=swapped?ease(progress):1-ease(progress),scale=compact+(1-compact)*amount;
     // Keep the path straight; only the speed is eased.
     const x=center.x+(item.x-center.x)*amount,y=center.y+(item.y-center.y)*amount;
     el.style.transformOrigin='0 0';el.style.transform=`translate(${x-item.x}px,${y-item.y}px) scale(${scale})`;
     pin.style.left=`${x+(149+Number(pin.dataset.offsetX))*scale}px`;pin.style.top=`${y+(9+Number(pin.dataset.offsetY))*scale}px`;
     pin.style.transformOrigin='0 0';pin.style.transform=`scale(${scale})`;
   }
   threads.style.opacity=String(ease(Math.max(0,Math.min(1,(elapsed-settled)/(total-settled)))));
   if(elapsed<total&&!reducedMotion.matches)requestAnimationFrame(tick);
   else{drawLayout();threads.style.removeProperty('opacity');board.classList.remove('rearranging');button.disabled=false;switching=false;}
 }
 tick(start);
}
drawLayout();
const DEFAULT_SCALE=.85;
const state={x:0,y:0,scale:DEFAULT_SCALE};const MIN=.1,MAX=DEFAULT_SCALE;let initialized=false;
function render(){board.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;}
let cameraFrame=0;
function stopCamera(){cancelAnimationFrame(cameraFrame);cameraFrame=0;}
function moveCamera(target,animate=true){
 stopCamera();
 if(!animate||reducedMotion.matches){Object.assign(state,target);render();return;}
 const from={...state},start=performance.now(),duration=620;
 function tick(now){
   const t=Math.min(1,(now-start)/duration),ease=t*t*t*(t*(t*6-15)+10);
   for(const key of ['x','y','scale'])state[key]=from[key]+(target[key]-from[key])*ease;
   render();
   if(t<1&&!reducedMotion.matches)cameraFrame=requestAnimationFrame(tick);
   else{cameraFrame=0;Object.assign(state,target);render();}
 }
 cameraFrame=requestAnimationFrame(tick);
}
function zoom(value,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){stopCamera();const next=Math.min(MAX,Math.max(MIN,value)),ratio=next/state.scale;state.x=cx-(cx-state.x)*ratio;state.y=cy-(cy-state.y)*ratio;state.scale=next;render();}
function frame(all=false,animate=false){
 const w=viewport.clientWidth,h=viewport.clientHeight;
 let left=-25,top=-25,right=2325,bottom=1525;
 for(const el of board.querySelectorAll('.year')){left=Math.min(left,el.offsetLeft-120);top=Math.min(top,el.offsetTop-100);right=Math.max(right,el.offsetLeft+el.offsetWidth+130);bottom=Math.max(bottom,el.offsetTop+el.offsetHeight+110);}
 for(const entries of expandedYears.values())for(const {project,card} of entries){left=Math.min(left,project.x-45);top=Math.min(top,project.y-90);right=Math.max(right,project.x+card.offsetWidth+50);bottom=Math.max(bottom,project.y+card.offsetHeight+45);}
 const scale=all?Math.max(MIN,Math.min(MAX,w/(right-left),(h-70)/(bottom-top))):Math.max(MIN,Math.min(DEFAULT_SCALE,(w-32)/480));
 moveCamera({scale,x:w/2-(all?(left+right)/2:1165)*scale,y:(h-65)/2-(all?(top+bottom)/2:775)*scale},animate);
}
document.querySelector('#fit').onclick=()=>frame(true,true);
document.querySelector('#layout-toggle').onclick=switchLayout;
document.querySelector('#focus-contact').onclick=()=>moveCamera({scale:DEFAULT_SCALE,x:viewport.clientWidth/2-2025*DEFAULT_SCALE,y:(viewport.clientHeight-65)/2-1180*DEFAULT_SCALE});
viewport.addEventListener('pointerdown',stopCamera);
viewport.addEventListener('keydown',stopCamera);
viewport.addEventListener('wheel',e=>{e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:1);zoom(state.scale*Math.exp(-Math.max(-120,Math.min(120,delta))*.002),e.clientX,e.clientY);},{passive:false});
const pointers=new Map();let last=null,dragged=false,origin=null;
function gesture(){const p=[...pointers.values()];return p.length===1?{x:p[0].x,y:p[0].y,d:0}:{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};}
viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(!pointers.size){dragged=false;origin={x:e.clientX,y:e.clientY};}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});last=gesture();if(pointers.size>1){dragged=true;for(const id of pointers.keys())viewport.setPointerCapture(id);}});
viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const now=gesture();if(Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>5)dragged=true;if(dragged){viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');if(last.d&&now.d)zoom(state.scale*now.d/last.d,last.x,last.y);state.x+=now.x-last.x;state.y+=now.y-last.y;render();}last=now;});
function end(e){pointers.delete(e.pointerId);last=pointers.size?gesture():null;if(!pointers.size)viewport.classList.remove('dragging');}
viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false;}},true);viewport.addEventListener('dragstart',e=>e.preventDefault());
viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;const moves={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]};if(moves[e.key]){e.preventDefault();state.x+=moves[e.key][0];state.y+=moves[e.key][1];render();}else if(['+','=','-','0','Home'].includes(e.key)){e.preventDefault();if(e.key==='0')frame(true);else if(e.key==='Home')frame();else zoom(state.scale*(e.key==='-'?1/1.22:1.22));}});
// Reveal keyboard-focused board links without interfering with pointer navigation.
board.addEventListener('focusin',e=>{if(!e.target.matches(':focus-visible'))return;const r=e.target.getBoundingClientRect();if(r.left<15||r.top<15||r.right>viewport.clientWidth-15||r.bottom>viewport.clientHeight-90){moveCamera({...state,x:state.x+viewport.clientWidth/2-(r.left+r.width/2),y:state.y+(viewport.clientHeight-80)/2-(r.top+r.height/2)});}});
new ResizeObserver(()=>{if(!initialized){frame();initialized=true;}else frame(true);}).observe(viewport);
document.querySelector('#copy-email').onclick=async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText('13416549819@163.com');status.textContent='邮箱已复制';}catch{status.textContent='请复制上方邮箱地址';}};
document.addEventListener('portfolio:depart',()=>{
 stopCamera();
 try{sessionStorage.setItem('portfolio-board-camera',JSON.stringify({state,mode,years:[...expandedYears.keys()]}));}catch{}
});
try{
 if(sessionStorage.getItem('portfolio-board-return')){
  sessionStorage.removeItem('portfolio-board-return');
  const saved=JSON.parse(sessionStorage.getItem('portfolio-board-camera')||'null');
  if(saved){
   if(saved.mode==='regions'){
    mode='regions';drawLayout();const button=document.querySelector('#layout-toggle');button.textContent='按年份';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','切换为年份陈列');button.title='切换为年份陈列';
   }
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   for(const year of saved.years){
    const item=(mode==='years'?years:regions).find(y=>y.year===year),trigger=document.getElementById(`year-${year}`);
    if(item&&trigger&&groupProjects(item).length){await toggleYear(item,trigger);await new Promise(resolve=>{function wait(){if(projectMotion)requestAnimationFrame(wait);else resolve();}wait();});}
   }
   moveCamera(saved.state,false);
   if(!reducedMotion.matches)board.animate([{opacity:0},{opacity:1}],{duration:250,fill:'both'});
  }
 }
}catch{}
window.portfolioBoardReady=true;
document.dispatchEvent(new Event('portfolio:board-ready'));
