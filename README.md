# FOMO Quant Screen v0.2.1 — Gemini Resilience Fix

Patch over v0.2. No redesign.

## Fixes
- Gemini transient failures (429/500/502/503/504) retry automatically with backoff: immediate → 2s → 5s → 10s.
- A persistent Gemini outage no longer marks the whole Quant Screen as failed.
- Status becomes `TEMPORARILY UNAVAILABLE (...) · RULES-ONLY MODE`.
- DEX Screener, CoinGecko, Paper Watch, Prediction Ledger and Calibration continue without Gemini.
- Added `RETRY GEMINI` button.
- Investigation falls back cleanly to rules-only evidence when Gemini is unavailable.
- API key remains session-memory only.

## Unchanged
Active Paper Watch, frozen T0 snapshots, Prediction Ledger, Calibration Lab, LONG/SHORT/NO TRADE rules and PAPER 50 persistence remain as in v0.2.

LIVE CAPITAL = LOCKED.
