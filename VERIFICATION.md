# v1.1.0 verification evidence

Scope: **limited Steam official price leads/watchlist, NOT working automatic Free-to-Keep reminders**. No current Steam giveaway has been verified. No fixture represents a current offer.

## Actual execution, 2026-10-18

- Checked clean main and origin/main both `975ea15b412a97f1d5431dc6f26b6115609b71a4` before edits.
- `npm test`: 24 reported tests pass, 0 fail (18 unique tests; 3 shared Epic tests run in each of 3 suites). Includes all previous 9 regression tests with mocks extended to serve Steam, and assertions scoped for additional Steam preview/status notices. Steam core/runtime missing functions/integration were observed RED before implementation.
- Tests cover empty/malformed search, bounds, 100%-off as unverified only, supposed current/future/expired keep wording without official windows, missing proof, F2P/demo/trial/free-weekend exclusions, currency/type damage, cross-platform failure isolation, unknown deadlines, no Steam formal sent records, preview read-only, HTTP302 fail-closed, max3 app requests, search failure still checking watchlist. No positive verified-keep parser exists; this is the intentional safe fallback, not a claimed untested capability.
- `git diff --check` and `node --check freebies.js`: exit 0.
- Live check at `2026-10-18T12:53:12.171Z`: Epic and Apple official direct requests succeeded. Epic accepted 2 current paid-to-zero games: Bad Cheese, Agent A - 伪装游戏. Both end 2026-10-22 23:00 Beijing. Upcoming 2 parsed separately, not pushed. Apple CN software IDs 414478124/444934666 gave CNY 0, alerts=[], merely baseline probes, not watch recommendations.
- **Steam direct Node/curl/urllib failed** (TCP/TLS timeout); do not report Steam Loon connectivity as verified. `npm run live` exits **2**, explicitly retaining the failed direct platforms.
- Alternative read-only `web_extract` reached official Steam `appdetails` and price_overview for 264710 (Subnautica), obtained real typed fields and CNY initial=14900/final=14900/discount_percent=0; the actual production core parsed it as excluded, notify=false, start/end=null. Extractor introduced literal line wrapping in descriptions; JSON was decoded with strict=False then serialized, not replaced with invented data. This validates schema/filter on retrieved official data, **not direct Loon networking**.
- Independent official search probe (count=50/json=1) returned `{"desc":"","items":[]}` once through web_extract. Repeat/count20 retrieval was inconsistent/empty, so it is not proof of reliable discovery or of no current offers. Store app HTML reached through extraction; no current Free-to-Keep package/clear promotion deadline identified. Packagedetails probes did not return usable data. GamerPower returned a third-party Dwarven Realms key/points giveaway; excluded from implementation, not official direct free-to-keep evidence.
- Real distributed script executed in Node VM with live Epic payload and actual Steam network failure status: writes=0, done=1, two Epic previews retained plus explicit Steam limited/failure status. No fixture fallback was used in live checks.

## Official source boundaries

Valve docs: https://partner.steamgames.com/doc/marketing/discounts/freetokeep

Valve defines limited-time permanent licenses vs F2P and temporary Free Weekends; also states there is no dedicated store browsing destination for Free-to-Keep. This is why specials/zero price is only a bounded lead source, never a permanence assertion.

Plugin remains same URL, one 12:10 schedule, independent v1 cache, no weather changes, no Cookie/MITM/account/claim action. Real iOS Loon installation, notification permission and background scheduling remain unverified.

Re-run `npm run live`; nonzero on any direct platform failure is expected and must not be relabeled success. Optional `STEAM_EXTRACTED_APP=/absolute/path/to/fresh-official-extract.json npm run live` validates an explicitly separate extraction transport; do not supply fixtures or stale content and call it live.
