(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'portfolio-project-entry';
  let navigating = false;
  let layer;
  let cameraAnimation;
  const homeURL=location.href;
  const homeTitle=document.title;
  let activeScene;
  window.portfolioCloseProject=()=>{if(activeScene){history.back();return true;}return false;};
  window.addEventListener('popstate',()=>{
    if(activeScene&&location.href===homeURL){
      cameraAnimation?.cancel();
      activeScene.style.pointerEvents='';
      activeScene.style.transformOrigin='';
      activeScene.inert=false;
      document.querySelector('.view-tools')?.removeAttribute('inert');
      layer?.remove();layer=null;
      activeScene=null;navigating=false;
      document.title=homeTitle;
    }else if(location.href!==homeURL){location.reload();}
  });
  try {
    const pending = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
    if (pending && !pending.seamless && pending.path === location.pathname && Date.now() - pending.time < 10000 && !reduced.matches) {
      const reveal = document.createElement('div');
      reveal.className = 'project-entry-reveal';
      reveal.setAttribute('aria-hidden', 'true');
      if (pending.hero && pending.src) {
        const image = document.createElement(pending.video ? 'video' : 'img');
        image.src = pending.src;
        if (pending.video) {image.muted=true;image.playsInline=true;}
        reveal.append(image);
      }
      document.documentElement.append(reveal);
      reveal.addEventListener('animationend', () => reveal.remove(), {once:true});
      const showProject = async () => {
        if (pending.hero) await window.coverMediaReady;
        if (pending.hero && window.createCoverMedia) {
          const hero = document.querySelector('.guide-cover');
          if (hero) {
            const media = window.createCoverMedia('year-2026-cover.png','景区智能导览封面');
            media.src = pending.src;
            hero.replaceChildren(media);
          }
        }
        const heroImage = document.querySelector('main img');
        if (heroImage) await Promise.race([
          heroImage.decode().catch(() => {}),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
        requestAnimationFrame(() => requestAnimationFrame(() => reveal.classList.add('is-revealing')));
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showProject, {once:true});
      else showProject();
    }
  } catch {}

  document.addEventListener('click', async event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (document.body.classList.contains('project-detail') && link.matches('.project-sticker-header > a') && url.origin === location.origin) {
      event.preventDefault();
      if(navigating)return;
      navigating=true;
      if(window.parent!==window&&window.parent.portfolioCloseProject?.())return;
      try{sessionStorage.setItem('portfolio-board-return','1');}catch{}
      url.searchParams.set('preview','anchored-14');
      window.top.location.assign(url.href);return;
    }
    if (url.origin !== location.origin || !/\/projects\/[^/]+\.html$/.test(url.pathname) || reduced.matches) return;
    const media = link.querySelector('.print-0 img,.print-0 video') || link.querySelector('img,video') || link.closest('.project')?.querySelector('img,video');
    if (!media) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const rect = media.getBoundingClientRect();
    document.dispatchEvent(new Event('portfolio:depart'));
    try{sessionStorage.setItem('portfolio-camera-origin',JSON.stringify({rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height}}));}catch{}
    url.searchParams.set('view','preserve-15');
    layer = document.createElement('div');
    layer.className = 'project-entry-layer';
    layer.setAttribute('aria-hidden', 'true');
    const destination = document.createElement('iframe');
    destination.title = '项目进入过渡';
    destination.tabIndex = -1;
    destination.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;pointer-events:none';
    const ready = new Promise(resolve => {
      destination.addEventListener('load',resolve,{once:true});
      setTimeout(resolve,2500);
    });
    destination.src = url.href;
    layer.append(destination);document.body.append(layer);
    await ready;
    const targetDocument = destination.contentDocument;
    if (!targetDocument?.querySelector('main')) {location.assign(url.href);return;}
    const targetImage = targetDocument?.querySelector('main img');
    if(targetImage?.decode)await Promise.race([targetImage.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1000))]);
    const scene = document.querySelector('#viewport') || document.querySelector('main');
    const targetCopy = targetDocument?.querySelector('.case-hero-copy');
    const stages = targetCopy ? [
      ...targetCopy.children,
      ...targetDocument.querySelectorAll('main > section:not(.case-hero)')
    ] : [];
    stages.forEach(element=>{element.style.animation='none';element.style.opacity='0';});
    const nativeWidth = media.naturalWidth || media.videoWidth || rect.width;
    const nativeHeight = media.naturalHeight || media.videoHeight || rect.height;
    const frame = media.closest('.polaroid,.project-card,.project-media');
    const matrix = new DOMMatrix(frame ? getComputedStyle(frame).transform : undefined);
    const angle = Math.atan2(matrix.b,matrix.a);
    const projectedWidth = rect.width / (Math.abs(Math.cos(angle)) + nativeHeight/nativeWidth*Math.abs(Math.sin(angle)));
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const scale=Math.max(1,2*Math.max(cx,innerWidth-cx)/projectedWidth,
      2*Math.max(cy,innerHeight-cy)/(projectedWidth*nativeHeight/nativeWidth));
    const sceneRect=scene.getBoundingClientRect();
    const targetTransform=`scale(${scale}) rotate(${-angle}rad)`;
    // Keep the clicked image's screen-space center stationary throughout the zoom.
    scene.style.transformOrigin=`${cx-sceneRect.left}px ${cy-sceneRect.top}px`;
    scene.style.pointerEvents='none';
    try {
      cameraAnimation = scene.animate([{transform:'none'},{transform:targetTransform}],
        {duration:1000,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      destination.animate([{opacity:0},{opacity:0,offset:.64},{opacity:1}],{duration:1000,easing:'linear',fill:'forwards'});
      await cameraAnimation.finished;
    } catch {}
    // Keep the already rendered document: a second navigation causes a visible flash.
    layer.removeAttribute('aria-hidden');
    layer.style.pointerEvents='auto';
    destination.style.pointerEvents='auto';
    destination.tabIndex=0;
    destination.title=targetDocument.title || '项目详情';
    scene.inert=true;
    activeScene=scene;
    document.querySelector('.view-tools')?.setAttribute('inert','');
    history.pushState({portfolioProject:true},'',url.href);
    document.title=targetDocument.title;
    stages.forEach((element,index)=>{
      element.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:440,delay:Math.min(index,5)*110,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
    });
    destination.focus({preventScroll:true});
  });
  window.addEventListener('pageshow', () => {layer?.remove();cameraAnimation?.cancel();const scene=document.querySelector('#viewport')||document.querySelector('main');if(scene){scene.style.pointerEvents='';scene.style.transformOrigin='';}navigating = false;});
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('[data-project-copy]')?.addEventListener('click', async () => {
      const status = document.querySelector('.project-copy-status');
      try {await navigator.clipboard.writeText('13416549819@163.com');status.textContent = '邮箱已复制';}
      catch {status.textContent = '未能复制，请手动复制上方邮箱';}
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const details = document.querySelector('.project-contact[open]');
        if (details) {details.open = false;details.querySelector('summary').focus();}
      }
    });
    document.addEventListener('click', event => {
      const details = document.querySelector('.project-contact[open]');
      if (details && !details.contains(event.target)) details.open = false;
    });
  });
})();
