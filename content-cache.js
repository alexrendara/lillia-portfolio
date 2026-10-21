(() => {
 // A return within this tab reuses the same data snapshot. A fresh visit revalidates it.
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 window.portfolioReadJSON=async url=>{
  const key='portfolio-data-v21:'+url.href;
  if(window.portfolioReturning&&!local){try{const saved=sessionStorage.getItem(key);if(saved)return JSON.parse(saved);}catch{}}
  try{
   const response=await fetch(url,{cache:local?'no-store':'no-cache'});
   if(!response.ok)return {};
   const data=await response.json();try{sessionStorage.setItem(key,JSON.stringify(data));}catch{}
   return data;
  }catch{return {};}
 };
})();
