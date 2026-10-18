/* Read-only live checks; extraction files must be retrieved this run, not fixtures. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('freebies.js','utf8'),ctx={FREEBIES_TEST:true};vm.createContext(ctx);vm.runInContext(source,ctx);
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(22000),redirect:'error'});assert.equal(r.status,200);return r.json();}
(async()=>{
 const now=Date.now(),payloads=new Map(),report={verifiedAt:new Date(now).toISOString(),directFailures:[]};
 async function read(name,url){try{const d=await get(url);payloads.set(url,d);return d;}catch(e){report.directFailures.push(name+': '+e.name);return null;}}
 const [e,a,s,t]=await Promise.all([
 read('Epic','https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN'),
 read('Apple','https://itunes.apple.com/lookup?entity=software&country=cn&id=414478124,444934666'),
 read('Steam search',ctx.Freebies.steamSearch),
 read('Steam app','https://store.steampowered.com/api/appdetails?appids=264710&cc=cn&l=english')]);
 if(e)report.epic=ctx.Freebies.epic(e,now);
 if(a){report.apple=ctx.Freebies.apple(a,['414478124','444934666'],'cn',{});assert.equal(report.apple.alerts.length,0);}
 if(s)report.steamCandidates=ctx.Freebies.steamCandidates(s,'');
 if(t)report.steam=ctx.Freebies.steam(t,'264710',now);
 if(process.env.STEAM_EXTRACTED_APP){
  // Explicit alternative retrieval transport, NOT a successful direct Loon connection.
  const data=JSON.parse(fs.readFileSync(process.env.STEAM_EXTRACTED_APP,'utf8'));
  report.steamViaWebExtraction=ctx.Freebies.steam(data,'264710',now);
  assert.equal(report.steamViaWebExtraction.notify,false);
  report.transportNote='Official Steam data retrieved through web_extract in this verification run; direct host Steam connectivity failed. No current free-to-keep offer verified.';
 }
 let writes=0,done=0;const notices=[];
 await new Promise((resolve,reject)=>{
 const timer=setTimeout(()=>reject(new Error('VM timeout')),5000);
 const c={console,$argument:'preview',$persistentStore:{read:()=>null,write:()=>{writes++;return false;}},$notification:{post:(...args)=>notices.push(args)},$httpClient:{get:(req,cb)=>{const d=payloads.get(req.url);cb(d?null:'network failure',{status:d?200:0},d?JSON.stringify(d):'');}},$done:()=>{done++;clearTimeout(timer);resolve();}};
 vm.createContext(c);vm.runInContext(source,c);
 });
 assert.equal(writes,0);assert.equal(done,1);assert.ok(notices.some(n=>n[0].includes('Steam')));
 report.liveVM={writes,done,notices};console.log(JSON.stringify(report,null,2));
 if(report.directFailures.length)process.exitCode=2; // Never greenwash a connectivity failure.
})().catch(e=>{console.error('LIVE FAILED:',e.message);process.exitCode=1;});
