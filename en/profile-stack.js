(() => {
 const scriptRoot=new URL('.',document.currentScript.src),host=document.querySelector('.profile-photo-stack');
 if(!host)return;
 fetch(new URL('profile-stack.json',scriptRoot),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Photos unavailable');return r.json();}).then(({photos})=>{
  for(const p of photos){if(!p.enabled)continue;const print=document.createElement('figure'),img=document.createElement('img');print.className='profile-back-photo';
   Object.assign(print.style,{left:p.x+'px',top:p.y+'px',width:p.width+'px',height:p.height+'px',transform:`rotate(${p.rotation}deg)`});
   img.src=new URL('assets/'+p.image,scriptRoot);img.alt='';img.draggable=false;img.decoding='async';print.append(img);host.append(print);
  }
 }).catch(error=>console.warn('Profile photos:',error.message));
})();
