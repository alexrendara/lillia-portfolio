(() => {
 let covers={};
 const root=new URL('.',document.currentScript.src);
 const videos=new Set();
 function bindPlayback(video){
  if(videos.has(video))return;
  const host=video.closest('.polaroid,.project-card,.project-media')||video;
  let hovered=false;
  const play=()=>{video.play().catch(()=>{});};
  host.addEventListener('pointerenter',event=>{
   if(event.pointerType==='touch')return;
   hovered=true;
   if(video.paused){if(video.ended)video.currentTime=0;play();}
  });
  // Leaving does not interrupt the current pass; the decision is made at its end.
  host.addEventListener('pointerleave',()=>{hovered=false;});
  video.addEventListener('ended',()=>{
   video.currentTime=0;
   if(hovered&&video.isConnected)play();else video.pause();
  });
  videos.add(video);
 }
 window.createCoverMedia=(key,alt='')=>{
  const source=covers[key]||key,video=/\.mp4$/i.test(source),el=document.createElement(video?'video':'img');
  el.dataset.coverKey=key;el.src=new URL('assets/'+source,root).href;
  if(video){el.muted=true;el.autoplay=false;el.loop=false;el.playsInline=true;el.preload='auto';el.setAttribute('aria-label',alt||'封面视频');}
  else el.alt=alt;
  el.draggable=false;return el;
 };
 window.coverMediaReady=fetch(new URL('cover-media.json',root),{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(data=>{covers=data;}).catch(()=>{});
 window.coverMediaReady.then(()=>{
  const update=()=>{document.querySelectorAll('img:not([data-cover-key])').forEach(img=>{
   const url=new URL(img.src),prefix=new URL('assets/',root).pathname;
   if(!url.pathname.startsWith(prefix))return;const key=decodeURIComponent(url.pathname.slice(prefix.length));
   if(!covers[key])return;const media=window.createCoverMedia(key,img.alt);media.className=img.className;media.style.cssText=img.style.cssText;img.replaceWith(media);
  });
   for(const video of videos)if(!video.isConnected){video.pause();videos.delete(video);}
   document.querySelectorAll('video[data-cover-key]').forEach(bindPlayback);
  };
  update();new MutationObserver(update).observe(document.body,{childList:true,subtree:true});
 });
})();
