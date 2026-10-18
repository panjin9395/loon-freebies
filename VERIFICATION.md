# v1.0.0 verification evidence

Observed 2026-10-18T12:19:13.778Z, host read-only official API requests:

- Epic HTTP 200; 13 elements; strict parser accepted 2 active paid-to-zero base games: Bad Cheese, Agent A - 伪装游戏. Both end 2026-10-22 15:00 UTC / 23:00 Beijing. 2 separate upcoming free promotions: Sker Ritual, Home - A Unique Horror Adventure; not pushed automatically.
- Apple lookup country=cn, batch IDs 414478124,444934666: HTTP 200, two software records, CNY 0; baseline alerts=[] (these permanently-free examples are connectivity probes, not recommendations and not configured watch IDs).
- `npm run live` exit 0; actual repository JS executed in Node VM against live Epic response, 2 preview notices with official store openUrl, persistent writes=0, done=1.
- `npm test` exit 0; 9 tests, 9 pass, 0 fail. Red outputs observed before Epic parser, strict timestamps, runtime, Apple parser, batch integration and HTTP options implementations.

Re-run `npm run live` for current facts; promotions and network availability change. This is not a real iOS/Loon installation test; device scheduling/notifications remain to be checked after installation.
