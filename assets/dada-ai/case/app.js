const assetBase=new URL('./assets/',document.currentScript.src).href;
const dialog=document.querySelector('#lightbox');
let lastTrigger;
document.addEventListener('click',event=>{const button=event.target.closest('.image-button');if(!button)return;lastTrigger=button;const image=button.querySelector('img');const big=document.querySelector('#lightbox-img');big.src=image.src;big.alt=image.alt;document.querySelector('#lightbox-caption').textContent=image.alt;dialog.showModal();document.body.classList.add('modal-open');document.querySelector('.lightbox-scroll').scrollTop=0;});
document.querySelector('#close-lightbox').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastTrigger?.focus({preventScroll:true});});
const screens={mobile:['mobile-select','mobile-move','mobile-folder'],pc:['pc-select','pc-move','pc-folder']};
const labels=['选择文件','选择知识库','确定目标目录'];
const descriptions=['通过多选进入批量整理。','从个人／共享知识库列表选择目标。','进入目标目录，在当前选择的位置执行操作。'];
let platform='mobile',step=0;
function renderFlow(){document.querySelectorAll('[data-platform]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platform===platform)));document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===step)));const label=`${platform==='pc'?'PC':'App'} · ${labels[step]}`;const stage=document.querySelector('#flow-stage');stage.className=`flow-stage ${platform}`;stage.innerHTML=`<figure class="${platform==='pc'?'desktop':'phone'}"><button class="image-button" aria-label="放大：${label}"><img src="${assetBase}${screens[platform][step]}.png" alt="${label}" width="${platform==='pc'?1440:750}" height="${platform==='pc'?900:1624}"></button><figcaption>${label}</figcaption></figure>`;document.querySelector('#flow-status').textContent=`${label}：${descriptions[step]}`;}
document.querySelectorAll('[data-platform]').forEach(b=>b.addEventListener('click',()=>{platform=b.dataset.platform;renderFlow();}));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=Number(b.dataset.step);renderFlow();}));
const pet=document.querySelector('#loading-pet'),motionButton=document.querySelector('#motion-toggle');let playing=false;
function setMotion(value){playing=value;pet.src=`${assetBase}loading${playing?'':'-still'}.${playing?'gif':'png'}`;motionButton.textContent=playing?'暂停动画':'播放动画';motionButton.setAttribute('aria-pressed',String(playing));}
motionButton.addEventListener('click',()=>setMotion(!playing));
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const motionObserver=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting&&playing)setMotion(false);}}, {threshold:0});motionObserver.observe(pet);
motionPreference.addEventListener('change',e=>{if(e.matches)setMotion(false);});
const links=[...document.querySelectorAll('nav a')];const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){links.forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-15% 0px -55% 0px'});links.forEach(a=>{const section=document.querySelector(a.hash);if(section)observer.observe(section);});

const heroCat=document.querySelector('#hero-cat');
// Static fallback uses the same artwork for visitors who prefer reduced motion.
if(heroCat){const still=new URL('../../../project-dada-ai-cover.png',assetBase).href;const setHero=()=>heroCat.src=motionPreference.matches?still:new URL('../../../project-dada-ai-cover-clear.webp?v=clear-1',assetBase).href;setHero();motionPreference.addEventListener('change',setHero);}
