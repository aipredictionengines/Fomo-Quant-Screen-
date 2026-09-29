# PumpCall Radar v0.1 — FOMO quant screen

Инструмент за ранно откриване на meme-coin pump-ове и превръщането им в **изпълним план**: entry limit, "do not chase" лимит, TP1–TP3, SL, R:R, paper tracking и база данни с ранни сигнали.

Отделен продукт от FOMO Test Agent. Радарът намира и валидира. Токени с висок Radar Score отиват за дълбоко проучване в агента чрез handoff JSON.

> **Radar Score ≠ Coin Quality.** Pump сигналът и изпълнимостта се мерят отделно. Затова е възможно "PUMP DETECTED · EXECUTION REJECT".

Един файл, `index.html`: HTML + CSS + vanilla JS, без build стъпка и без зависимости. Шрифтовете идват от Google Fonts, с fallback към системен monospace.

---

## Бърз старт

| Какво | Как |
|---|---|
| Тест на логиката без интернет данни | отвори `index.html?mode=sim` |
| По-бърза симулация | `index.html?mode=sim&tick=300` (1 стъпка = 30 сек пазарно време) |
| Реални данни | `index.html` (LIVE е по подразбиране) |
| Директно към таб | `index.html#results`, `#esdb`, `#errors` … |

SIM режимът генерира синтетичен пазар във формата на DEX Screener, с различни типове токени: runner, fader, rug, slow, dud и chop. Той служи само да видиш как работят етапите, плановете, paper engine-ът и статистиките. **Нищо от SIM не се записва** и неговите win rate / R нямат нищо общо с реалната стратегия.

### Деплой в GitHub Pages

1. Създай ново репо, напр. `pumpcall-radar`.
2. Качи `index.html` (и по желание `README.md`). **Не качвай API ключове никъде в репото.**
3. Settings → Pages → Source: *Deploy from a branch* → `main` / root → Save.
4. След около минута: `https://<user>.github.io/pumpcall-radar/`

Локално за LIVE е по-добре да ползваш сървър вместо `file://`:

```
python -m http.server 8080
```

След това отвори `http://localhost:8080`.

---

## Източници на данни

| Източник | Ключ | От браузър | Какво дава |
|---|---|---|---|
| **DEX Screener** | не | да (CORS ok) | latest profiles, boosts, top boosts, community takeovers → discovery; `/tokens/v1` → цена, ликвидност, обеми, buys/sells 5m/1h/6h/24h, промени, възраст на пула |
| **GeckoTerminal** (CoinGecko on-chain) | не | да | new pools, trending pools, **уникални купувачи/продавачи 5m** (breadth) |
| **CoinGecko** | не | да | trending — съвпадение само по символ, затова е слаб сигнал (маркиран с *) |
| **Birdeye** | да | често блокиран (CORS) | new listings (Solana, meme платформи), trending, **token security**: top10 holders %, freeze authority, mutable metadata |
| **FOMO API** (getfomoapi.fun, неофициален) | да | вероятно блокиран | leaderboard, swap история на трейдъри → FOMO buys 5m/15m, брой трейдъри, net flow |

Лимити, които кодът спазва: DEX Screener 60–300 заявки/мин, GeckoTerminal ~30/мин, Birdeye free tier 1 rps / ~30K CU месечно, FOMO API 5 req/s. При `429` има автоматичен backoff, който уважава `Retry-After`. Всеки проблем се записва в таба **ERRORS**.

### API ключове и proxy

Ключовете се въвеждат в **CONFIG** и се пазят само в `localStorage` на браузъра. Те **не влизат в експортите** и не са в кода.

Ако Birdeye или FOMO светят червено с "Мрежова грешка или CORS блокиране", ползвай `proxy-worker.js`, безплатен Cloudflare Worker:

1. Cloudflare → Workers → Create → постави кода.
2. Добави secrets `BIRDEYE_KEY` и `FOMO_KEY`.
3. Смени `ALLOW_ORIGIN` с твоя GitHub Pages адрес.
4. В CONFIG:
   - `Birdeye base URL` = `https://<worker>.workers.dev/birdeye`
   - `FOMO API base URL` = `https://<worker>.workers.dev/fomo`
   - Полетата за ключ попълни с каквото и да е (напр. `proxy`). Истинските ключове са в worker-а.

Бутонът **TEST APIs** в таба ERRORS проверява всички източници наведнъж.

---

## Как работи

```
discovery → normalize → features → scores → stage → locked plan → decision → paper → outcome tracking
```

### Етапи на pump-а

`runup = max(Δ1h, 0.6·Δ6h)`

| # | Етап | Правило (първото, което е вярно, отгоре надолу) |
|---|---|---|
| 5 | EXHAUSTED | runup > 60% и (Δ5m < −5% или −30% от 1h връх) и flow < 50; или −45% от 1h връх |
| 4 | EXTENDED | runup > 150%, или > 80% при забавящ се обем |
| 3 | BREAKOUT | Δ5m > 10%, или runup ≥ 60% при ускоряващ се обем |
| 2 | DEVELOPING | runup ≥ 25%, или Δ5m > 4% при buy flow > 55 |
| 1 | EARLY ACTIVITY | tx или обем ускорение > 1.3x, ≥ 2 източника за 30 мин, или FOMO трейдър |
| 0 | DISCOVERED | всичко останало |

Радарът предпочита етапи **1–2**. Етапи 4–5 са **NO CHASE** и за тях не се строи план.

### Скорове (0–100)

- **Early Signal Score** = 22% tx ускорение + 18% обем ускорение + 18% buy/sell flow + 14% младост на пула + 14% брой свежи източници (+FOMO трейдъри) + 14% ликвидност − наказание при runup > 60%
- **Pump Quality** = 28% flow + 20% tx активност + 20% обем + 14% breadth (уникални купувачи/продавачи) + 18% качество на етапа
- **Copyability** = 100 минус наказанията за: slippage, волатилност, движение след заключване на плана (×2), CHASED (−25), възраст на плана, ликвидност под минимума (−20)
- **Token Risk** се сумира от флагове:

  | Флаг | Точки |
  |---|---|
  | liq < $50K | +28 |
  | liq < $150K | +12 |
  | liq/MC < 5% | +12 |
  | възраст < 10 мин | +12 |
  | без socials | +8 |
  | top10 > 40% | +18 |
  | top10 > 25% | +8 |
  | freeze authority | +25 |
  | mutable metadata | +5 |
  | turnover > 40x | +10 |
  | 0 продажби при ≥ 25 покупки | +25 |
  | изтеглена ликвидност −25% | +25 |
  | изтеглена ликвидност −10% | +10 |

- **Slippage Risk** — модел `size / (liq/2 + size)` + fee, при референтен размер $1000
- **Radar Score** = 30% ESS + 20% Pump Quality + 20% Copyability + 15% (100 − Risk) + 15% stage fit (етап 0…5 → 45 / 100 / 90 / 55 / 10 / 0)

### Решения

| Решение | Кога |
|---|---|
| **REJECT** | liq < $40K, Token Risk ≥ 70, Slippage Risk ≥ 70, възраст < 3 мин, или няма продажби (honeypot?) |
| **TOO LATE** | етап 4–5; Early Edge LOST без fill; цена над chase лимита (**SIGNAL VALID / ENTRY INVALID → DO NOT CHASE → WAIT FOR RETEST**) |
| **ALLOW PAPER** | има заключен план, Radar ≥ 70, Copyability ≥ 50, етап 1–2 (3 по избор) |
| **WATCH** | всичко останало (причината се показва) |
| **INVESTIGATE** | флаг при Radar ≥ 80 и не REJECT → за FOMO Test Agent |

Всички прагове се настройват в CONFIG.

### Изпълним план (заключва се при квалификация)

`vol unit v = clamp(0.8·|Δ5m| + |Δ1h|/6, 2%, 15%)`

| Ниво | Формула |
|---|---|
| ENTRY LIMIT | p0·(1 − 1.0v) … p0·(1 − 0.3v) |
| DO NOT CHASE ABOVE | p0·(1 + 0.4v) |
| SL | mid·(1 − clamp(2v, 6%, 25%)) |
| TP1 / TP2 / TP3 | mid + 1.5R / 3R / 5R |
| Валидност | 45 мин |
| Invalidation | ликвидност < 65% от тази при заключване, или цена ≤ SL преди вход |

Планът получава **LOCK hash**. Нивата никога не се местят, за да не се "разкрасява" backtest-ът.

### Paper engine — FOMO PAPER 50

- **AUTO** влиза с $5, когато решението е ALLOW PAPER и цената е в entry зоната. Влизането е с модел на slippage + fee.
- TP/SL и правилата се заключват в snapshot на позицията (втори hash). ✗ в колоната LOCK означава, че нещо е пипано.
- **4 защити:**
  - **Hard SL**
  - **Time Stop** — 20 мин без TP1 и под 0.3R
  - **Liquidity Stop** — −15% ликвидност от входа
  - **Trailing след TP1** — 40% на TP1 и SL → break-even; 30% на TP2 и SL → TP1; остатъкът на TP3

  Плюс Max Hold 240 мин.
- Честната извадка е само **AUTO** сделките. Ръчните (бутон PAPER $5) се мерят отделно.

### Early Information System

- Timestamps: First detected → Radar qualified → Entry available → User observed → Paper fill.
- **Early Edge:**
  - **GOOD** — Δ1h при откриване < 25% и движение до fill < 8%
  - **LOST** — ≥ 60% или ≥ 25%
- **MISSED / CHASED** проследява 60 мин всеки отказ "do not chase / too late". **RULE SAVED** означава, че цената първо е ударила −SL; **MISSED WIN** — че първо е ударила +TP1. Така мерим дали правилото помага.
- **EARLY SIGNAL DB** записва всеки нов токен с ранните му признаци и резултата след +5 / +15 / +60 мин:
  - HIT = максимум ≥ +30%
  - SUSTAIN = ≥ +20% на 60-ата минута
  - Таблица **LIFT** показва кои признаци наистина предхождат устойчив pump.

  Смислени изводи има след **50–100** завършени сигнала.

---

## Табове

**LIVE SIGNALS** · **ENTRY LIMITS** · **TP / SL** · **MISSED / CHASED** · **PAPER RESULTS** · **EARLY SIGNAL DB** · **RESEARCH** · **ERRORS** · **CONFIG**

- **RESEARCH** — проучвания, теза, тагове, бележки със дата, статус (WATCH / INVESTIGATING / CONFIRMED / REJECTED / ARCHIVED) и TRACK. Тракнатите монети се следят, дори да паднат от радара. Можеш да добавиш произволен адрес.
- **INVESTIGATE → FOMO AGENT** сваля и копира `pumpcall.handoff.v1` JSON с пазара, скоровете, плана, timestamps, източниците и чеклист за проучване.
- **ERRORS** — здраве на всяко API (calls / ok / err / латентност / backoff), автоматичен лог на всички софтуерни и API грешки, и форма **BUG REPORT**. Тя прикача версия, среда и snapshot на избрания токен.

Клавиш `/` — търсене.

---

## Данни и архив

- Всичко се пази в `localStorage` на **този браузър**, под ключове `pcr:v1:live:*`. Настройките са в `pcr:v1:cfg`, ключовете в `pcr:v1:secrets`.
- **EXPORT BACKUP** (CONFIG или PAPER RESULTS) сваля пълен JSON. **IMPORT BACKUP** го връща, включително на друг компютър.
- CSV експорт има за paper сделки, missed/chased и ESDB. Отделно може да се изнесат research и error log.
- Изчистване на данните на браузъра трие историята. **Прави backup редовно.**

## Ограничения (честно)

- **Работи само докато страницата е отворена.** Браузърите забавят таймерите в неактивни табове. За 24/7 проследяване трябва бекенд (виж roadmap).
- TP/SL се проверяват на всеки цикъл (20 сек по подразбиране), не tick-by-tick. Бърз фитил може да се "пропусне" или да се отчете на по-лоша цена.
- Slippage е приблизителен AMM модел, а не реален quote.
- Без Birdeye няма данни за holders / freeze authority. Holder risk тогава е N/A и Token Risk е по-оптимистичен.
- FOMO API е неофициален и форматът на swap-овете не е документиран. Парсерът е толерантен, а при неразпознат формат в ERRORS се появява SCHEMA предупреждение.
- CoinGecko trending се сравнява само по символ.
- Това е инструмент за проучване и paper тестове. **Не изпълнява реални сделки и не е финансов съвет.**

## Roadmap

1. Бекенд за 24/7 (VPS или Cloudflare Worker + cron), същата логика, данни в SQLite/KV.
2. Telegram известия за ALLOW PAPER / INVESTIGATE / изходи.
3. Автоматичен прием на handoff JSON във FOMO Test Agent.
4. Калибрация на теглата от ESDB и paper резултатите след 100+ сигнала (walk-forward, без да се пипат вече заключени сделки).
5. Реални quote-ове (Jupiter / 0x) вместо модела за slippage.

---

## Лиценз

**PumpCall Radar — Source-Available Noncommercial License 1.0** (виж `LICENSE`). Накратко:

- ✅ **Свободно за некомерсиална употреба:** личен трейдинг със собствени средства, проучване, обучение, тестове. Кодът може да се разглежда, копира и модифицира.
- ✅ Модифицирани версии могат да се споделят некомерсиално, но под същия лиценз, с отбелязани промени и с друго име или ясна маркировка "unofficial".
- ❌ **Комерсиална употреба само с писмено разрешение.** Такава е продажба, SaaS/хостнат сървис, платени сигнали или платени групи (Telegram/Discord), вграждане в платен продукт или работа за клиенти.
- ⚠️ Без гаранции и без отговорност за загуби. **Не е финансов съвет.** Потребителят сам отговаря за API ключовете си и за условията на всеки доставчик на данни.
