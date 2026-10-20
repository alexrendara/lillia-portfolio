(() => {
 const loader=document.getElementById('board-loading');if(!loader)return;
 const viewport=document.querySelector('#viewport'),tools=document.querySelector('.view-tools');
 let finished=false;function reveal(){if(finished)return;finished=true;viewport?.removeAttribute('inert');tools?.removeAttribute('inert');loader.remove();}
 document.getElementById('loading-continue').onclick=reveal;
 if(window.portfolioBoardReady)reveal();else document.addEventListener('portfolio:board-ready',reveal,{once:true});
 // A slow manifest or failed media must never block access to the page.
 setTimeout(reveal,1200);
})();
