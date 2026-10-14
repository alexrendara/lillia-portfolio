(() => {
 const root=new URL('.',document.currentScript.src),page=decodeURIComponent(location.pathname.slice(root.pathname.length))||'index.html';
 const editor=new URLSearchParams(location.search).has('textedit');
 const slots=new Map();let edits={},timer,selecting=false;
 const excluded='script,style,noscript,svg,canvas,iframe,textarea,option,[data-copy-slot],.project-entry-layer';
 function selector(el){if(el.id)return '#'+CSS.escape(el.id);if(el.matches('a.project-card'))return 'a.project-card[href='+JSON.stringify(el.getAttribute('href'))+']';if(el===document.body)return 'body';const siblings=[...el.parentElement.children].filter(e=>e.tagName===el.tagName);return selector(el.parentElement)+' > '+el.tagName.toLowerCase()+':nth-of-type('+(siblings.indexOf(el)+1)+')';}
 function scan(){
  observer.disconnect();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode()){const n=walker.currentNode;if(n.textContent.trim()&&!n.parentElement.closest(excluded))nodes.push(n);}
  for(const node of nodes){
   const parent=node.parentElement,key=selector(parent)+'::'+[...parent.childNodes].indexOf(node);
   const span=document.createElement('portfolio-copy');span.dataset.copySlot=key;span.textContent=node.textContent;
   const item={key,original:node.textContent,tag:parent.tagName.toLowerCase(),section:parent.closest('section,article')?.getAttribute('aria-label')||parent.closest('section,article')?.id||'',size:parseFloat(getComputedStyle(parent).fontSize),span};
   node.replaceWith(span);slots.set(key,item);
  }
  for(const [key,item] of slots){if(!item.span.isConnected){slots.delete(key);continue;}apply(item,edits[key]);}
  observer.observe(document.body,{childList:true,subtree:true});
  if(editor)window.parent.postMessage({type:'portfolio-text-inventory',page,items:[...slots.values()].map(({span,...item})=>item)},location.origin);
 }
 function apply(item,value){
  const span=item.span;span.replaceChildren(document.createTextNode(value?.text??item.original));
  span.style.display=value?.hidden?'none':'';
  span.style.fontSize=value?.fontSize?value.fontSize+'px':'';
  span.style.lineHeight=value?.fontSize?'1.55':'';
  span.style.whiteSpace=value?'pre-line':'';
  for(const added of value?.after||[]){const p=document.createElement('portfolio-paragraph');p.textContent=added.text;p.style.display='block';p.style.marginTop='.65em';if(added.fontSize)p.style.fontSize=added.fontSize+'px';span.append(p);}
 }
 const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(scan,120);});
 async function start(){try{const response=await fetch(new URL('text-content.json',root),{cache:'no-store'});if(response.ok)edits=(await response.json())[page]||{};}catch{}scan();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 if(editor){
  document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(selecting||!link||event.metaKey||event.ctrlKey||link.target==='_blank')return;const target=new URL(link.href);if(target.origin===location.origin&&target.pathname.startsWith(root.pathname)&&target.pathname.endsWith('.html')&&target.pathname!==location.pathname){event.preventDefault();event.stopImmediatePropagation();window.parent.postMessage({type:'portfolio-text-navigate',page:decodeURIComponent(target.pathname.slice(root.pathname.length))},location.origin);}},true);
  document.addEventListener('click',event=>{if(!selecting)return;const span=event.target.closest('[data-copy-slot]');if(!span)return;event.preventDefault();event.stopImmediatePropagation();window.parent.postMessage({type:'portfolio-text-select',key:span.dataset.copySlot,page},location.origin);},true);
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===window.parent&&event.data.type==='portfolio-text-selection')selecting=!!event.data.enabled;});
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent)return;const data=event.data;if(data.type==='portfolio-text-draft'){edits=data.edits||{};scan();}if(data.type==='portfolio-text-focus'){const item=slots.get(data.key);if(item){item.span.scrollIntoView({block:'center',behavior:'smooth'});item.span.animate([{outline:'2px solid #7860c4'},{outline:'2px solid transparent'}],{duration:1500});}}});
 }
})();
