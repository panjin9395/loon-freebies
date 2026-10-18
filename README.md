# loon-freebies v1.0.0

独立 Loon 插件：**Epic 中国区限时免费游戏 + 自选 App 价格变零关注**。不是 App Store 全量限免大全。不包含 Steam，没有把永久免费或试玩当优惠。

## 安装一次

Loon → 插件 → 添加链接：

```
https://raw.githubusercontent.com/panjin9395/loon-freebies/main/loon-freebies.plugin
```

只安装本插件，不用修改现有配置或另加 cron，不触碰 loon-weather。公开仓库只含代码、说明及测试，无账户、API 密钥、地点或个人关注名单。私人仓库 Raw 不能被 Loon 无认证直接读取，因此本仓库按“自有纯代码公开”发布。

- 默认每天 **12:10（设备本地时区）** 检查一次。设备应使用中国时区才能对应北京时间12:10；跨时区旅行会跟随设备。截止时间始终明确显示北京时间 UTC+8，不受 DST 影响。
- 新活动每游戏命名空间+ID+起止时间去重；当天成功后不再请求。距截止24小时内可额外提醒一次，可关闭，无每小时轮询。预告分开解析，默认不推。
- 脚本 → **手动预览不写去重** 可立即读 Epic 官方接口并显示结果，不消耗正式通知/基线。该快捷预览仅 Epic；需预览 App 时在本地脚本测试参数填 JSON：`{"preview":true,"trackIds":"你的数字ID,另一个ID","country":"cn"}`。不要把示例占位文字直接粘贴当ID。
- 点击通知打开官方商店；不自动登录/领取，不保证账户或地区资格、跨区可领。关机/系统后台限制/网络故障可能错过一次检查，不承诺系统推送必达。

## 数据范围

### Epic

只读官方 `freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN`。严格要求 BASE_GAME、ACTIVE、原价>0、当前最终价=0、PERCENTAGE/discountPercentage=0、合法有效促销窗口 `start <= now < end`。排除原价0、demo/trial/试玩/试用、非本体及非免费促销。无可靠商品slug不通知。链接只构造至 `https://store.epicgames.com/zh-CN/p/`，不信任接口给出的任意 URL。保守过滤可能漏报，不扩大到 DLC/捆绑/试玩。

### App Store：默认空，仅本机关注

插件设置 `trackIds` 填数字 App ID，英文逗号分隔，最多100；`country` 可选 cn/us/hk/tw/jp/gb。只调用 Apple 官方 `https://itunes.apple.com/lookup?entity=software&country=cn&id=...` 多ID批量接口。名单及历史价格仅在本机，发给Apple查询，不上传GitHub或第三方服务。

- 首次免费只记录基线，不推；必须同区同币种先实际观察到付费价格、随后变0才推。
- 区域独立缓存，不把中国价与美国价比较；换区需重新建该区基线。查不到的 App 不清空原价格，不视作免费或下架；接口异常保持旧记录。
- Apple lookup 不提供降价截止日期，也无法证明开发者是否将其永久改成免费，通知称“价格变零”，不会捏造“限时免费”窗口。
- 没有可靠官方全站限免接口，**不抓所谓限免大全，也不把微信/QQ等F2P当限免**。live检查中用公开免费App仅验证接口结构和首次0价不报，绝非推荐名单。

## 可靠性与隐私

纯 JS，Loon `$httpClient/$persistentStore/$notification/$done`，不依赖 Node 浏览器扩展。无 MITM、Cookie、彩云调用、云盘或 Emby 访问。不消耗彩云额度。HTTP显式20秒超时、禁用自动Cookie和重定向；未知重定向视为失败，不跟到第三方。

请求前必须持久化并精确回读租约探针；缓存损坏/写失败则停止请求并明确报错。活动仅在通知调用后记录，写失败不会预先吞通知；系统通知+存储不是原子事务，极端崩溃或磁盘失败可能重复，无法承诺系统级exactly-once。成功时每日门控，失败后允许手动重试；不误报促销已结束。单脚本租约减轻重入但非跨进程原子锁。

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

- 1.0.0：首版，Epic 当前可领/不推预告；App 本地关注价格变零；12:10日检、独立去重、只读预览。

MIT license.
