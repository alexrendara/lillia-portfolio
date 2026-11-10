// Use native buttons for screen groups and native dialog focus/escape behavior.
document.querySelectorAll('.case-explorer').forEach(explorer=>{
  explorer.querySelectorAll('[data-panel]').forEach(button=>button.addEventListener('click',()=>{
    explorer.querySelectorAll('[data-panel]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    explorer.querySelectorAll('.case-panel').forEach(panel=>{
      panel.hidden=panel.id!==button.dataset.panel;
      if(panel.hidden)panel.querySelectorAll('video').forEach(video=>video.pause());
    });
  }));
});
const dialog=document.querySelector('#lightbox');let opener;
document.addEventListener('click',event=>{
  const button=event.target.closest('.image-button');
  if(!button)return;
  const source=button.querySelector('img');if(!source)return;
  opener=button;
  const image=document.querySelector('#lightbox-img');image.src=source.currentSrc||source.src;image.alt=source.alt;
  document.querySelector('#lightbox-caption').textContent=source.alt;
  dialog.showModal();document.body.classList.add('modal-open');
  document.querySelector('.lightbox-scroll').scrollTop=0;
});
document.querySelector('#close-lightbox').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});
