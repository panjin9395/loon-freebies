# loon-freebies v1.1.0

独立 Loon 插件：**Epic 中国区限时免费游戏 + Steam 官方价格待核实线索 + 自选 App 价格变零关注**。Steam 现为受限线索方案，**未实现可靠的 Free to Keep 自动提醒**，不冒充已接通全量限免。不把永久免费或试玩当优惠。

## 安装一次

Loon → 插件 → 添加链接：

```
https://raw.githubusercontent.com/panjin9395/loon-freebies/main/loon-freebies.plugin
```

只安装本插件，不用修改现有配置或另加 cron，不触碰 loon-weather。公开仓库只含代码、说明及测试，无账户、API 密钥、地点或个人关注名单。私人仓库 Raw 不能被 Loon 无认证直接读取，因此本仓库按“自有纯代码公开”发布。

- 默认每天 **12:10（设备本地时区）** 检查一次。设备应使用中国时区才能对应北京时间12:10；跨时区旅行会跟随设备。截止时间始终明确显示北京时间 UTC+8，不受 DST 影响。
- 新活动每游戏命名空间+ID+起止时间去重；当天成功后不再请求。距截止24小时内可额外提醒一次，可关闭，无每小时轮询。预告分开解析，默认不推。
- 脚本 → **手动预览不写去重** 立即读 Epic 与 Steam 官方搜索，分别显示结果/失败及 Steam 受限状态，不消耗正式通知/基线。快捷预览不带本地关注参数；要预览关注 App/Steam，在本地脚本测试参数填 JSON：`{"preview":true,"steamIds":"264710","trackIds":"你的数字ID,另一个ID","country":"cn"}`。264710仅接口验证例子，不是限免推荐；删除不用的字段，不要粘贴占位文字。
- 点击通知打开官方商店；不自动登录/领取，不保证账户或地区资格、跨区可领。关机/系统后台限制/网络故障可能错过一次检查，不承诺系统推送必达。

## 数据范围

### Epic

只读官方 `freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN`。严格要求 BASE_GAME、ACTIVE、原价>0、当前最终价=0、PERCENTAGE/discountPercentage=0、合法有效促销窗口 `start <= now < end`。排除原价0、demo/trial/试玩/试用、非本体及非免费促销。无可靠商品slug不通知。链接只构造至 `https://store.epicgames.com/zh-CN/p/`，不信任接口给出的任意 URL。保守过滤可能漏报，不扩大到 DLC/捆绑/试玩。

### Steam：受限线索，不是已接通自动永久入库提醒

[Valve 官方文档](https://partner.steamgames.com/doc/marketing/discounts/freetokeep)明确：Free to Keep 是限时领取永久许可；Free Weekend 只是临时许可；F2P 一直免费；Demo 是体验版。官方同时说明 Free to Keep 默认没有专门浏览入口，不保证出现在 Specials 或触发愿望单通知。

- 同一12:10任务读取官方商店搜索 `search/results`（specials=1/maxprice=free/category1=998/cc=cn/l=english/json=1），只读首20项，不翻页。此搜索不是官方全量赠送清单，可能完全漏掉限免。最多再读取3个官方 `api/appdetails`，并发不超过3；`steamIds` 本地关注优先、最多3个。搜索失败仍尝试关注项，最终明确报告失败，不把失败算空活动。
- 只在类型game、非F2P/demo/trial、CN/CNY、原价>0、final=0且100%折扣时生成**手动预览“待核实线索”**。价格不证明永久保留；通用商品描述也不是促销证据。本版没有通过官方包/促销起止验证的活动，所以**Steam 正式推送始终关闭**，不生成伪截止、预告、去重或临期提醒；不能说“Steam当前无活动”，只能说没有验证到。
- 商品HTML、price_overview、packagedetails已做有界研究：官方商品/价格通过独立web提取通道取得真实数据；本机直连Steam超时、package请求未取得可用数据，尚无可重复验证的当前Free to Keep及明确截止包样本。免费周末不推；未知截至时间写“截止北京时间：未知”。不能从100%折扣或“Add to Account”字样单独推断保留。
- 没有把 GamerPower/SteamDB 接入插件；第三方键码抽奖/站外任务不算官方直领，不能冒充官方或全量。没有绕过WAF、验证码或年龄门，没有账户Cookie、MITM、自动领取。
- 后续实现正式提醒的门槛：真实官方促销/包证据，商品/包关联、保留类型、可靠起止时间与CN资格均可校验；届时才使用`steam:appid|start|end`独立去重及一次临期提醒。目前这些能力明确未开放。

### App Store：默认空，仅本机关注

插件设置 `trackIds` 填数字 App ID，英文逗号分隔，最多100；`country` 可选 cn/us/hk/tw/jp/gb。只调用 Apple 官方 `https://itunes.apple.com/lookup?entity=software&country=cn&id=...` 多ID批量接口。名单及历史价格仅在本机，发给Apple查询，不上传GitHub或第三方服务。

- 首次免费只记录基线，不推；必须同区同币种先实际观察到付费价格、随后变0才推。
- 区域独立缓存，不把中国价与美国价比较；换区需重新建该区基线。查不到的 App 不清空原价格，不视作免费或下架；接口异常保持旧记录。
- Apple lookup 不提供降价截止日期，也无法证明开发者是否将其永久改成免费，通知称“价格变零”，不会捏造“限时免费”窗口。
- 没有可靠官方全站限免接口，**不抓所谓限免大全，也不把微信/QQ等F2P当限免**。live检查中用公开免费App仅验证接口结构和首次0价不报，绝非推荐名单。

## 可靠性与隐私

纯 JS，Loon `$httpClient/$persistentStore/$notification/$done`，不依赖 Node 浏览器扩展。无 MITM、Cookie、彩云调用、云盘或 Emby 访问。不消耗彩云额度。HTTP显式20秒超时、禁用自动Cookie和重定向；未知重定向视为失败，不跟到第三方。

请求前必须持久化并精确回读租约探针；缓存损坏/写失败则停止请求并明确报错。三个平台独立并行，Steam失败不阻止Epic或App；任一失败不标记全批日成功，允许手动重试，已成功Epic活动去重不丢。通知不记录请求URL、关注名单或原始网络错误。活动仅在通知调用后记录，写失败不会预先吞通知；系统通知+存储不是原子事务，极端崩溃或磁盘失败可能重复，无法承诺系统级exactly-once。成功时每日门控，失败后允许手动重试；不误报促销已结束。单脚本租约减轻重入但非跨进程原子锁。

手动预览只读且不写租约/去重/价格基线。缓存键 `loon.freebies.v1` 独立于其他插件。不要清理缓存，否则旧活动会当新活动、App需重新建基线。格式损坏请先保留日志诊断，不自动重置吞掉历史。

## 测试

Node >=18，无依赖：

```
npm test
npm run live
```

测试用合成 fixture（清楚标记，不冒充 live），在 Node VM 实际执行分发脚本。覆盖起止边界、严格ISO/无效时间、UTC+8/DST、原价0、假免费、未来预告、恶意slug、日去重、预览、截止提醒、缓存失败、网络异常、App首次0基线/付费变0/跨区币种/批量调用。`tools/live.cjs` 仅下载官方JSON，运行本仓库已知脚本，不下载执行未知脚本；非0退出明确标记失败。

设备上尚未实际验证 Loon 安装/通知权限/后台调度；仓库通过 VM 验证的是 JS逻辑及官方JSON，不声称替代真机测试。网络可能变化，预览失败就是失败，不使用伪造数据回退。

## 版本

- 1.1.0：Steam 受限官方价格线索/最多3项本地关注，手动显示待核实（非正式限免提醒）；跨平台独立失败；同一12:10任务，无新cron；保留原URL及v1缓存。Steam直连live失败保留非0退出，不拿fixture冒充接通。
- 1.0.0：首版，Epic 当前可领/不推预告；App 本地关注价格变零；12:10日检、独立去重、只读预览。

MIT license.
