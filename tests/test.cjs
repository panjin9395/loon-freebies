const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=()=>fs.readFileSync(path.join(__dirname,'../freebies.js'),'utf8');
function core(){const c={FREEBIES_TEST:true};vm.createContext(c);vm.runInContext(source(),c);return c.Freebies;}
const now=Date.parse('2026-10-18T12:00:00Z');
function game(){return {id:'game1',namespace:'ns1',title:'Paid Game',offerType:'BASE_GAME',status:'ACTIVE',categories:[{path:'games/edition/base'},{path:'freegames'}],offerMappings:[{pageType:'productHome',pageSlug:'paid-game'}],price:{totalPrice:{originalPrice:4000,discountPrice:0,currencyCode:'CNY'}},promotions:{promotionalOffers:[{promotionalOffers:[{startDate:'2026-10-15T15:00:00.000Z',endDate:'2026-10-22T15:00:00.000Z',discountSetting:{discountType:'PERCENTAGE',discountPercentage:0}}]}],upcomingPromotionalOffers:[]}};}
function payload(g=game()){return {data:{Catalog:{searchStore:{elements:[g]}}}};}
test('Epic only real active paid-to-zero and Beijing deadline',()=>{const f=core();const r=f.epic(payload(),now);assert.equal(r.active.length,1);assert.equal(r.upcoming.length,0);assert.equal(f.beijing(r.active[0].end),'2026-10-22 23:00');assert.equal(r.active[0].url,'https://store.epicgames.com/zh-CN/p/paid-game');});
test('strict ISO windows, half-open bounds, fake free, original zero, trials, bad links',()=>{const f=core();for(const mutate of [g=>g.price.totalPrice.originalPrice=0,g=>g.price.totalPrice.discountPrice=1,g=>g.title='Game Trial',g=>g.offerMappings[0].pageSlug='https://evil.test',g=>g.promotions.promotionalOffers[0].promotionalOffers[0].startDate='2026-10-15',g=>g.promotions.promotionalOffers[0].promotionalOffers[0].endDate='2026-02-30T00:00:00.000Z']){const g=game();mutate(g);assert.equal(f.epic(payload(g),now).active.length,0);}const g=game(),o=g.promotions.promotionalOffers[0].promotionalOffers[0];assert.equal(f.epic(payload(g),Date.parse(o.startDate)).active.length,1);assert.equal(f.epic(payload(g),Date.parse(o.endDate)).active.length,0);assert.throws(()=>f.epic({},now));assert.throws(()=>f.epic(payload(),NaN));});
test('future zero offers are separate, not active; DST remains Beijing UTC+8',()=>{const f=core(),g=game();g.promotions.upcomingPromotionalOffers=g.promotions.promotionalOffers;g.promotions.promotionalOffers=[];const r=f.epic(payload(g),Date.parse('2026-10-14T00:00:00Z'));assert.equal(r.active.length,0);assert.equal(r.upcoming.length,1);assert.equal(f.beijing(Date.parse('2026-03-08T07:00:00Z')),'2026-03-08 15:00');assert.equal(f.beijing(Date.parse('2026-11-01T06:00:00Z')),'2026-11-01 14:00');});
module.exports={core,game,payload,now,source};
