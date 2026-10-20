(() => {
 const loader=document.getElementById('board-loading');if(!loader)return;
 const viewport=document.querySelector('#viewport'),tools=document.querySelector('.view-tools');
 let finished=false;
 function reveal(){if(finished)return;finished=true;viewport?.removeAttribute('inert');tools?.removeAttribute('inert');loader.remove();}
 document.getElementById('loading-continue').onclick=reveal;
 const settleImage=image=>image.decode().catch(()=>{});
 async function prepare(){
  await window.portfolioTextReady;
  // Only the initial viewport blocks presentation; hidden project details load on demand.
  const pending=[];
  for(const media of viewport.querySelectorAll('img,video')){
   const r=media.getBoundingClientRect();
   if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)continue;
   if(media.tagName==='IMG'){media.loading='eager';media.fetchPriority='high';pending.push(settleImage(media));}
   else if(media.readyState<2){pending.push(new Promise(resolve=>{media.addEventListener('loadeddata',resolve,{once:true});media.addEventListener('error',resolve,{once:true});}));}
  }
  for(const source of ['profile-paper-fine.webp','year-pins.webp']){const image=new Image();image.src='assets/'+source;pending.push(settleImage(image));}
  pending.push(document.fonts.ready);
  // Broken or exceptionally slow media cannot trap visitors behind the loading screen.
  await Promise.race([Promise.allSettled(pending),new Promise(resolve=>setTimeout(resolve,6000))]);
  requestAnimationFrame(()=>requestAnimationFrame(reveal));
 }
 if(window.portfolioBoardReady)prepare();else document.addEventListener('portfolio:board-ready',prepare,{once:true});
})();
