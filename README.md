# FOMO Quant Screen

**Quant intelligence for FOMO trader research, copyability analysis and paper testing.**

> **DON'T COPY PROFITS. TEST COPYABILITY.**

FOMO Quant Screen is an independent research system designed to answer a simple question:

**If a trader is profitable, can that performance actually be copied after latency, price movement, liquidity, slippage, fees and risk?**

A trader's reported PNL is not assumed to be achievable by a follower.

The project measures the difference between:

Trader Performance  
→ Observed Opportunity  
→ Realistic Execution  
→ Net Copy Performance

---

## Project Status

**Current Phase:** Research + Paper Testing  
**Milestone:** FOMO PAPER 50  
**Live Capital:** 🔒 LOCKED

No live-capital validation is considered until at least 50 properly documented paper-copy simulations have been completed and reviewed.

If the evidence remains inconclusive, testing continues toward 100–250 observations.

---

## Core Architecture

FOMO DATA / SIGNAL
        ↓
TRADER DISCOVERY
        ↓
TRADER PROFILER
        ↓
COPYABILITY ENGINE
        ↓
TOKEN RISK
        ↓
EXECUTION MODEL
        ↓
RISK MANAGER
        ↓
PAPER COPY
        ↓
PERFORMANCE ENGINE
        ↓
DECISION

The Risk Manager cannot be bypassed.

---

## What the Quant Screen Does

The interface is designed as a research and decision-support terminal rather than a simple token scanner.

### Market Intelligence

Uses external market-data sources to examine available metrics such as:

- price
- liquidity
- 24h volume
- market cap / FDV
- price change
- transaction activity
- chain
- DEX
- trading pair

### Trader Intelligence

Where sufficient data is available, the system can evaluate:

- trading history
- consistency
- win/loss characteristics
- holding time
- trading frequency
- token concentration
- strategy characteristics
- recent deterioration

High historical PNL alone is not considered evidence of a copyable edge.

### Copyability

The Copyability Engine is intended to measure:

- signal delay
- observation delay
- price movement after trader entry
- execution delay
- liquidity
- spread
- estimated slippage
- volatility
- exit latency
- potential crowding effects

The central comparison is:

Trader Price
→ Observed Price
→ Simulated Fill
→ Exit
→ Fees
→ Net Copy Result

---

## FOMO PAPER 50

Every qualifying paper test should preserve:

- Test ID
- Trader
- Token
- Side
- Trader timestamp
- Observation timestamp
- Trader price
- Observed price
- Simulated fill
- Delay
- Liquidity
- Slippage
- Fees
- Position size
- Exit price
- Gross PNL
- Net PNL
- Risk state

Entry snapshots must not be rewritten after the outcome becomes known.

The system separates:

**WHAT WE KNEW THEN**

from

**WHAT WE KNOW NOW**

This helps prevent hindsight contamination.

---

## Risk Manager

Possible decisions:

🟢 ALLOW PAPER  
🟡 WATCH  
🔴 REJECT  
⚫ INSUFFICIENT DATA

The Risk Manager considers factors such as:

- data quality
- sample size
- trader reliability
- liquidity
- execution delay
- slippage
- token risk
- concentration
- drawdown
- abnormal market conditions
- missing evidence

A profitable trader does not override poor execution or extreme token risk.

---

## Data Sources

The current prototype supports integration with external market and analysis services including:

### DEX Screener

Used for available DEX market information such as liquidity, volume, price, pairs and transaction activity.

### CoinGecko

Used as an additional market-data and validation source where supported.

### Google Gemini

Optional AI analysis layer using the user's own API key.

Gemini is used for research and interpretation.

It must not invent missing market, trader or execution data.

---

## API Key Security

Never commit API keys to this repository.

Do not place production secrets directly inside public JavaScript files.

For local testing, API credentials should remain temporary.

For production deployment the intended architecture is:

Public Frontend
        ↓
Private API
        ↓
Private Risk / Intelligence Engine
        ↓
External Data Providers

Sensitive scoring logic, execution models, private datasets and production API credentials should remain server-side.

---

## Data Integrity

Missing data must remain missing.

The application should display:

`N/A`

or

`INSUFFICIENT DATA`

rather than generating or estimating unsupported facts.

AI-generated analysis must remain separate from verified market observations.

---

## Performance Evaluation

The project ultimately measures:

- paper tests
- wins / losses
- win rate
- gross PNL
- net PNL
- average win
- average loss
- median result
- profit factor
- expectancy
- maximum drawdown
- latency cost
- slippage cost
- fees
- trader-level performance
- strategy-level performance

**Expectancy and realistic net execution matter more than headline win rate.**

---

## Bias Controls

Research should explicitly consider:

- survivorship bias
- luck vs skill
- performance concentration
- regime dependence
- cherry-picking
- hindsight bias

Every qualifying signal should either be tested or rejected with a documented reason.

Losing tests are never deleted simply because they hurt performance statistics.

---

## Development Roadmap

Research
→ Data Validation
→ Paper Testing
→ Execution Model
→ Risk Engine
→ Performance Analysis
→ Backtesting
→ Automation
→ Small Live Validation
→ Scaling

Current priority:

## FOMO PAPER 50

Live capital remains locked until the paper-testing milestone and subsequent review are complete.

---

## Important Notice

FOMO Quant Screen is an independent research project.

It is not financial advice, investment advice or a guarantee of future results.

Cryptocurrency and digital-asset trading involve substantial risk.

Historical trader performance does not imply that another participant can reproduce the same results.

External API data may be incomplete, delayed or inaccurate.

Users are responsible for complying with the terms, API policies and applicable rules of any third-party service they access.

---

## Independence

This project is not affiliated with, endorsed by, sponsored by or officially associated with FOMO, DEX Screener, CoinGecko, Google or their respective owners unless explicitly stated otherwise.

All third-party names and trademarks belong to their respective owners.

---

## License

**Proprietary — All Rights Reserved**

This repository is provided for viewing and authorized testing only.

See [LICENSE](LICENSE) for details.

---

## FOMO Agents

**Research first.  
Execution before profit claims.  
Risk before capital.  
Evidence before confidence.**

**DON'T COPY PROFITS. TEST COPYABILITY.**
