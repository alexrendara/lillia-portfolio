const rail=document.querySelector('.pdf-sidebar');
if(rail){
 const links=[...rail.querySelectorAll('a')];
 const pages=links.map(link=>document.querySelector(link.getAttribute('href')));
 const reader=document.querySelector('main');
 const en=document.documentElement.lang==='en';
 const title=document.createElement('span');title.className='reader-title';
 title.textContent=({nomo:'Nomo Fintech',play:'Play@',tbi:'The Big Impact'})[document.body.dataset.pageTabs];
 const previous=document.createElement('button'),next=document.createElement('button'),select=document.createElement('select');
 for(const [button,label,symbol] of [[previous,en?'Previous page':'上一页','←'],[next,en?'Next page':'下一页','→']]){
  button.type='button';button.className='reader-button';button.setAttribute('aria-label',label);button.textContent=symbol;
 }
 select.className='reader-select';select.setAttribute('aria-label',en?'Choose a page':'选择页码');
 links.forEach((link,i)=>{
  const option=document.createElement('option');option.value=String(i);
  option.textContent=`${String(i+1).padStart(2,'0')} / ${String(links.length).padStart(2,'0')}`;select.append(option);
 });
 rail.append(title,previous,select,next);
 let current=0,observer;
 function active(index){
  current=index;select.value=String(index);previous.disabled=index===0;next.disabled=index===pages.length-1;
  links.forEach((link,i)=>{link.classList.toggle('is-active',i===index);if(i===index)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 }
 function go(index){
  index=Math.max(0,Math.min(index,pages.length-1));
  const r=reader.getBoundingClientRect(),p=pages[index].getBoundingClientRect();
  reader.scrollTo({top:reader.scrollTop+p.top-r.top,behavior:'instant'});
  history.replaceState(null,'',links[index].getAttribute('href'));active(index);
 }
 select.addEventListener('change',()=>go(Number(select.value)));
 previous.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
 function observe(){
  observer?.disconnect();
  observer=new IntersectionObserver(()=>{
   if(reader.scrollTop+reader.clientHeight>=reader.scrollHeight-2){active(pages.length-1);return;}
   const line=reader.getBoundingClientRect().top+Math.min(96,reader.clientHeight/4);
   const index=pages.findIndex(page=>{const r=page.getBoundingClientRect();return r.top<=line&&r.bottom>line;});
   if(index>=0)active(index);
  },{root:reader,rootMargin:`-95px 0px -${Math.max(0,reader.clientHeight-97)}px 0px`,threshold:0});
  pages.forEach(page=>observer.observe(page));
 }
 active(0);observe();window.addEventListener('resize',observe);
 const initial=links.findIndex(link=>link.hash===location.hash);if(initial>=0)go(initial);
}
