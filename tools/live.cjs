/* Read-only live verification: never executes downloaded scripts. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={FREEBIES_TEST:true};vm.createContext(ctx);vm.runInContext(fs.readFileSync('freebies.js','utf8'),ctx);
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(40000),redirect:'error'});assert.equal(r.status,200);return r.json();}
(async()=>{
 const now=Date.now();
 const e=await get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN');
 const result=ctx.Freebies.epic(e,now);
 console.log(JSON.stringify({verifiedAt:new Date(now).toISOString(),epicElements:e.data.Catalog.searchStore.elements.length,...result},null,2));
 const a=await get('https://itunes.apple.com/lookup?entity=software&country=cn&id=414478124,444934666');
 const apps=ctx.Freebies.apple(a,['414478124','444934666'],'cn',{});
 assert.equal(apps.alerts.length,0);
 console.log('Apple read-only baseline (NOT recommendations):',JSON.stringify(apps));
 // Real script VM with live official payload: no real persistence/notification side effects.
 let writes=0,done=0;const notices=[];
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('VM timeout')),5000);
  const c={console,$argument:'preview',$persistentStore:{read:()=>null,write:()=>{writes++;return false;}},$notification:{post:(...args)=>notices.push(args)},$httpClient:{get:(req,cb)=>cb(null,{status:200},JSON.stringify(e))},$done:()=>{done++;clearTimeout(timer);resolve();}};
  vm.createContext(c);vm.runInContext(fs.readFileSync('freebies.js','utf8'),c);
 });
 assert.equal(writes,0);assert.equal(done,1);assert.ok(notices.length);assert.ok(notices.every(n=>!n[0].includes('失败')));
 console.log('Live VM preview:',JSON.stringify({writes,done,notices},null,2));
})().catch(e=>{console.error('LIVE FAILED:',e.message);process.exitCode=1;});
