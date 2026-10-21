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
    const homeTarget=new URL('../index.html',location.href);
    if (!document.querySelector('#board') && url.origin===location.origin && url.pathname===homeTarget.pathname && !url.hash) {
      event.preventDefault();if(navigating)return;navigating=true;
      try{
        sessionStorage.setItem('portfolio-board-return','1');
        const previous=JSON.parse(sessionStorage.getItem('portfolio-home-departure')||'null');
        if(previous&&previous.project===location.href&&previous.home===document.referrer&&history.length>1){history.back();return;}
      }catch{}
      location.assign(url.href);return;
    }
    if (url.origin !== location.origin || !/\/projects\/[^/]+\.html$/.test(url.pathname)) return;
    // Native navigation starts immediately and does not wait for an entire hidden iframe.
    if(document.querySelector('#board'))try{sessionStorage.setItem('portfolio-home-departure',JSON.stringify({home:location.href,project:url.href}));}catch{}
    document.dispatchEvent(new Event('portfolio:depart'));

  });
  window.addEventListener('pageshow', event => {if(event.persisted&&document.querySelector('#board'))try{sessionStorage.removeItem('portfolio-board-return');}catch{}layer?.remove();cameraAnimation?.cancel();const scene=document.querySelector('#viewport')||document.querySelector('main');if(scene){scene.style.pointerEvents='';scene.style.transformOrigin='';}navigating = false;});
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
