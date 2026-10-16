(() => {
 const profile=document.getElementById('profile'),board=document.getElementById('board');
 if(!profile||!board)return;
 const jobs=[
  {company:'同程旅行',role:'UX产品设计师',date:'2025.07 至今 · 苏州',keywords:'AI产品 / 信息架构 / 复杂交互',x:830,y:1190,color:'#dce9d6'},
  {company:'亚洲吃面公司',role:'服务设计师',date:'2023.12 - 2025.06 · 广州',keywords:'用户旅程 / 品牌策略 / 服务体验',x:1200,y:1190,color:'#eee0ed'},
  {company:'Nomo 金融科技有限公司',role:'UX & UI设计师',date:'2022.07 - 2022.12 · 伦敦',keywords:'产品系统 / 交互规范 / 本地化研究',x:830,y:1480,color:'#dce9ef'},
  {company:'网易游戏',role:'用户体验研究员',date:'2019.07 - 2021.07 · 广州',keywords:'用户研究 / 体验评估 / 运营策略',x:1200,y:1480,color:'#f3e7b8'}
 ];
 let opened=false,busy=false,elements=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 profile.setAttribute('role','button');profile.tabIndex=0;
 profile.setAttribute('aria-label','个人简介，展开或收起四段工作经历');profile.setAttribute('aria-expanded','false');
 async function toggle(){
  if(busy||board.classList.contains('rearranging'))return;
  busy=true;opened=!opened;profile.setAttribute('aria-expanded',String(opened));
  if(opened){
   elements=jobs.map((job,index)=>{
    const note=document.createElement('article');note.className='career-note item';note.setAttribute('aria-label',job.company+'工作经历');
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
  document.dispatchEvent(new CustomEvent('portfolio:career-toggle',{detail:{opened}}));
  await Promise.all(elements.map(async({note,pin,line,job,index})=>{
   line.style.opacity=0;pin.style.opacity=0;
   const compact={transform:`translate(${1010-job.x}px,${650-job.y}px) scale(.3) rotate(0deg)`,opacity:0};
   const spread={transform:`translate(0,0) scale(1) rotate(${index%2?3:-3}deg)`,opacity:1};
   if(!reduced.matches)await note.animate(opened?[compact,spread]:[spread,compact],{duration:opened?420:300,delay:opened?index*35:0,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}).finished.catch(()=>{});
   if(opened){pin.style.opacity=1;line.style.opacity=1;}else{note.remove();pin.remove();line.remove();}
  }));
  if(!opened)elements=[];
  busy=false;
 }
 profile.addEventListener('click',toggle);
 profile.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
 document.addEventListener('portfolio:layout-change',()=>{
  elements.forEach(({note,pin,line})=>{note.remove();pin.remove();line.remove();});elements=[];opened=false;profile.setAttribute('aria-expanded','false');
 });
})();
