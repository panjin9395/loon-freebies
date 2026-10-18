/* loon-freebies v1.1.0 | Public official APIs only | MIT */
var Freebies = (function () {
  'use strict';
  function beijing(ms) { return new Date(ms + 8 * 3600000).toISOString().slice(0,16).replace('T',' '); }
  function epic(data, now) {
    if (!Number.isFinite(now)) throw new Error('无效时间');
    var elements = data && data.data && data.data.Catalog && data.data.Catalog.searchStore && data.data.Catalog.searchStore.elements;
    if (!Array.isArray(elements)) throw new Error('Epic 数据结构异常');
    var result = {active:[], upcoming:[]};
    elements.forEach(function(e) {
      if (!e || e.offerType !== 'BASE_GAME' || e.status !== 'ACTIVE' || typeof e.id !== 'string' || typeof e.namespace !== 'string' || typeof e.title !== 'string') return;
      if (/demo|trial|试玩|试用|体验版/i.test(e.title) || !Array.isArray(e.categories) || e.categories.some(function(c){return /demo|trial|free.?to.?play/i.test(c.path);})) return;
      var p=e.price && e.price.totalPrice;
      if (!p || !Number.isSafeInteger(p.originalPrice) || p.originalPrice <= 0 || !Number.isSafeInteger(p.discountPrice) || p.discountPrice < 0 || p.currencyCode !== 'CNY') return;
      var mappings=e.offerMappings || [], m=mappings.filter(function(x){return x.pageType==='productHome' && /^[a-zA-Z0-9_-]+$/.test(x.pageSlug);})[0];
      if (!m) return;
      ['promotionalOffers','upcomingPromotionalOffers'].forEach(function(field) {
        var groups=e.promotions && e.promotions[field];
        if (!Array.isArray(groups)) return;
        groups.forEach(function(g){if (!Array.isArray(g.promotionalOffers)) return;g.promotionalOffers.forEach(function(o){
          var ds=o.discountSetting;
          if (!ds || ds.discountType!=='PERCENTAGE' || ds.discountPercentage!==0) return;
          function stamp(s) { if (typeof s!=='string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)) return NaN; var t=Date.parse(s);return Number.isFinite(t) && new Date(t).toISOString()===s?t:NaN; }
          var start=stamp(o.startDate), end=stamp(o.endDate);
          if (!Number.isFinite(start) || !Number.isFinite(end) || start>=end) return;
          var item={id:e.namespace+':'+e.id,title:e.title,start:start,end:end,url:'https://store.epicgames.com/zh-CN/p/'+m.pageSlug};
          if (field==='promotionalOffers' && start<=now && now<end && p.discountPrice===0) result.active.push(item);
          if (field==='upcomingPromotionalOffers' && start>now) result.upcoming.push(item);
        });});
      });
    });
    return result;
  }
  function apple(data, ids, country, old) {
    var currencies={cn:'CNY',us:'USD',hk:'HKD',tw:'TWD',jp:'JPY',gb:'GBP'};
    if (!currencies[country] || !data || !Array.isArray(data.results) || data.resultCount!==data.results.length) throw new Error('Apple 数据/商店区域无效');
    var prices=JSON.parse(JSON.stringify(old)),alerts=[],seen={};
    data.results.forEach(function(a){
      var id=String(a.trackId),key=country+':'+id;
      if(ids.indexOf(id)<0 || seen[id] || a.wrapperType!=='software' || a.kind!=='software' || typeof a.trackName!=='string' || !Number.isFinite(a.price) || a.price<0 || a.currency!==currencies[country]) throw new Error('Apple App/价格/币种无效');
      seen[id]=true;
      var prev=old[key];
      if(prev && prev.currency===a.currency && Number.isFinite(prev.price) && prev.price>0 && a.price===0) alerts.push({title:a.trackName,url:'https://apps.apple.com/'+country+'/app/id'+id,was:prev.price,currency:a.currency});
      prices[key]={price:a.price,currency:a.currency};
    });
    return {prices:prices,alerts:alerts};
  }
  // No public official global Free-to-Keep feed exists. Search/price are leads only.
  var steamSearch='https://store.steampowered.com/search/results/?start=0&count=20&specials=1&maxprice=free&category1=998&cc=cn&l=english&json=1';
  function steamCandidates(data, watch) {
    if (!data || !Array.isArray(data.items)) throw new Error('Steam 搜索结构异常');
    var ids=String(watch||'').trim()?String(watch).trim().split(/[\s,;]+/):[];
    if(ids.length>3 || ids.some(function(id){return !/^[1-9][0-9]{0,9}$/.test(id);})) throw new Error('Steam 关注ID无效（最多3个）');
    data.items.slice(0,20).forEach(function(item){
      if (!item || typeof item.id!=='number' || !Number.isSafeInteger(item.id) || item.id<=0 || item.type!=='app') return;
      var id=String(item.id);if(ids.indexOf(id)<0 && ids.length<3)ids.push(id);
    });
    return ids.filter(function(id,i,a){return a.indexOf(id)===i;});
  }
  function steam(data,id,now) {
    if(!/^[1-9][0-9]{0,9}$/.test(id) || !Number.isFinite(now) || !data || !data[id] || typeof data[id].success!=='boolean') throw new Error('Steam 商品结构异常');
    var out={id:'steam:'+id,status:'unavailable',notify:false,start:null,end:null,url:'https://store.steampowered.com/app/'+id+'/?cc=cn&l=english'};
    if(!data[id].success)return out;
    var a=data[id].data;
    if(!a || a.steam_appid!==Number(id) || typeof a.name!=='string' || typeof a.type!=='string' || typeof a.is_free!=='boolean')throw new Error('Steam 商品结构异常');
    out.title=a.name;out.status='excluded';
    if(a.type!=='game' || a.is_free || /demo|trial|free weekend|play for free|试玩|试用|体验版/i.test(a.name))return out;
    var p=a.price_overview;
    if(!p)return out;
    if(p.currency!=='CNY' || !Number.isSafeInteger(p.initial) || !Number.isSafeInteger(p.final) || p.initial<0 || p.final<0 || !Number.isInteger(p.discount_percent) || p.discount_percent<0 || p.discount_percent>100)throw new Error('Steam 价格/币种无效');
    if(p.initial>0 && p.final===0 && p.discount_percent===100)out.status='unverified';
    return out;
  }
  return {epic:epic,beijing:beijing,apple:apple,steam:steam,steamCandidates:steamCandidates,steamSearch:steamSearch};
}());

if (typeof FREEBIES_TEST === 'undefined') {
  (async function () {
    'use strict';
    var KEY='loon.freebies.v1', state, preview=false;
    function notify(title,body,url) { $notification.post(title,'独立限免插件 v1.1.0',body,url?{openUrl:url}:{}); }
    function save(s) { var raw=JSON.stringify(s);if (!$persistentStore.write(raw,KEY) || $persistentStore.read(KEY)!==raw) throw new Error('持久缓存写入/回读失败；未完成去重'); }
    function get(url) { return new Promise(function(resolve,reject){$httpClient.get({url:url,timeout:20000,'auto-cookie':false,'auto-redirect':false,headers:{Accept:'application/json'}},function(err,res,body){try{if(err || !res || Number(res.status)!==200) throw new Error('官方接口请求失败（网络/HTTP状态）');if(typeof body!=='string' || body.length>3000000) throw new Error('响应无效');try{resolve(JSON.parse(body));}catch(ignore){throw new Error('官方接口 JSON 结构异常');}}catch(e){reject(e);}});}); }
    try {
      var arg=typeof $argument==='undefined'?{}:$argument;
      if (arg==='preview') arg={preview:true};
      if (typeof arg==='string') arg=JSON.parse(arg);
      if (!arg || typeof arg!=='object' || Array.isArray(arg)) throw new Error('参数无效');
      preview=arg.preview===true || arg.preview==='true';
      var now=Date.now(), day=Freebies.beijing(now).slice(0,10), raw=$persistentStore.read(KEY);
      state=raw?JSON.parse(raw):{version:1,sent:{},apple:{},lastDay:'',lease:0};
      if (!state || state.version!==1 || !state.sent || typeof state.sent!=='object' || Array.isArray(state.sent) || !state.apple || typeof state.apple!=='object' || Array.isArray(state.apple) || typeof state.lastDay!=='string' || !Number.isFinite(state.lease)) throw new Error('持久缓存损坏；停止请求，请保留缓存排查');
      if (!preview) {
        if (state.lastDay===day || state.lease>now) return;
        state.lease=now+180000;save(state);
      }
      var failed=false, count=0;
      // Parallel platform workers: a slow/broken Steam request never gates Epic.
      function worker(name,fn) { return Promise.resolve().then(fn).catch(function(e){
        if(/持久/.test(e.message)) throw e;
        failed=true;notify((preview?'【预览】':'')+name+' 检查失败',e.message+'；该平台状态未知，保留已有记录。');
      }); }
      await Promise.all([worker('Epic',async function(){
      var data=await get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN');
      var offers=Freebies.epic(data,now);
      offers.active.forEach(function(g){
        var id=g.id+'|'+g.start+'|'+g.end, prev=state.sent[id];
        var exp=g.end-now<=24*3600000 && arg.expiry!==false && arg.expiry!=='false';
        if (preview || !prev || (exp && !prev.expiry)) {
          notify(preview?'【预览】Epic 当前可领':prev?'Epic 即将截止（仅一次）':'Epic 新限时免费',g.title+'\n截止北京时间 '+Freebies.beijing(g.end)+'\nCN 商店；实际地区/账户资格以商店为准，不自动领取。',g.url);
          count++;
          if(!preview) {state.sent[id]={end:g.end,expiry:exp};save(state);}
        }
      });
      if(preview && offers.active.length===0)notify('【预览】Epic 检查完成','Epic：0 个符合条件的当前限免；下期预告 '+offers.upcoming.length+' 个（默认不推）；不是领取结果。');
      }),worker('Steam',async function(){
        var search, searchFailed=false;
        try { search=await get(Freebies.steamSearch);Freebies.steamCandidates(search,''); }
        catch(e){searchFailed=true;search={items:[]};}
        var candidates=Freebies.steamCandidates(search,arg.steamIds), leads=[],checked=0;
        // One bounded batch, at most 3 parallel app requests; no full-store scan.
        await Promise.all(candidates.map(async function(id){
          var data=await get('https://store.steampowered.com/api/appdetails?appids='+id+'&cc=cn&l=english');
          var item=Freebies.steam(data,id,now);checked++;
          if(item.status==='unverified')leads.push(item);
        }));
        if(preview) {
          leads.forEach(function(g){notify('【预览】Steam 待核实线索（非限免确认）',g.title+'\nCN/CNY 官方价100%折扣；尚无可验证永久入库及促销起止证据。\n截止北京时间：未知；请打开官方页面人工核实。非自动领取、非正式推送。',g.url);});
          notify('【预览】Steam 受限线索检查','官方搜索'+(searchFailed?'失败':'结构有效')+'；已检查 '+checked+' 个候选，待核实 '+leads.length+' 个。\n未接通可靠自动永久入库提醒；不保证全量。免费周末试玩/F2P/demo不推，未确认窗口不生成截止或去重。');
        }
        if(searchFailed)throw new Error('官方搜索请求/结构失败；Steam 非全量且状态未知');
      }),worker('App',async function(){
      var watch=String(arg.trackIds||'').trim(), country=String(arg.country||'cn');
      var ids=watch?watch.split(/[\s,;]+/):[];
      if(ids.length>100 || ids.some(function(id){return !/^[1-9][0-9]{0,14}$/.test(id);}) || ['cn','us','hk','tw','jp','gb'].indexOf(country)<0) throw new Error('App 关注 ID/区域无效（最多100个）');
      ids=ids.filter(function(id,i,a){return a.indexOf(id)===i;});
      if(ids.length) {
        var lookup=await get('https://itunes.apple.com/lookup?entity=software&country='+country+'&id='+ids.join(','));
        var apps=Freebies.apple(lookup,ids,country,state.apple);
        apps.alerts.forEach(function(a){notify(preview?'【预览】App 价格变零':'关注 App 价格变零',a.title+'\n'+country.toUpperCase()+' 商店：此前观察 '+a.was+' '+a.currency+' → 0\n官方未提供优惠截止时间；不保证限时或永久。',a.url);count++;});
        if(!preview){state.apple=apps.prices;save(state);}
        if(preview && apps.alerts.length===0) notify('【预览】App 关注检查完成','指定 '+ids.length+' 个，返回 '+lookup.resultCount+' 个；无已观察付费→0变化。首次0价仅建基线；本预览不写入基线。');
      }
      })]);
      if(!preview) {Object.keys(state.sent).forEach(function(k){if(state.sent[k].end<now-30*86400000)delete state.sent[k];});if(!failed)state.lastDay=day;state.lease=0;save(state);}
    } catch(e) {
      console.log('loon-freebies: '+e.message);
      try { if(state && !preview) {state.lease=0;save(state);} } catch(ignore) {}
      notify(preview?'【预览】检查失败':'限免检查失败',e.message+'；保留已有记录，促销状态未知。');
    } finally { $done(); }
  }());
}
