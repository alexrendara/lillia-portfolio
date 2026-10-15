(() => {
 const loader=document.getElementById('board-loading');
 if(!loader||loader.classList.contains('leaving'))return;
 const started=performance.now();
 document.querySelector('#viewport').inert=true;
 document.querySelector('.view-tools').inert=true;
 const boardReady=new Promise(resolve=>{
  if(window.portfolioBoardReady)resolve();
  else document.addEventListener('portfolio:board-ready',resolve,{once:true});
 });
 function mediaReady(media){
  if(media.tagName==='IMG')return media.decode().catch(()=>{});
  if(media.readyState>=2||media.error)return Promise.resolve();
  return new Promise(resolve=>{
   const done=()=>{media.removeEventListener('loadeddata',done);media.removeEventListener('error',done);resolve();};
   media.addEventListener('loadeddata',done,{once:true});media.addEventListener('error',done,{once:true});
  });
 }
 boardReady.then(async()=>{
  await Promise.allSettled([
   document.fonts.ready,
   ...[...document.querySelectorAll('#board img,#board video')].map(mediaReady)
  ]);
  setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>window.dismissBoardLoading())),Math.max(0,650-(performance.now()-started)));
 });
})();
