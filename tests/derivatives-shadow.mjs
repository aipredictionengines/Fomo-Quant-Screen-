import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const adapter = require('../derivatives-shadow.js');
const NOW = Date.UTC(2026, 9, 11, 8, 0, 0);
const wrap = (result, time=NOW) => ({ retCode: 0, retMsg: 'OK', result, time });
const valid = () => ({
  instruments: wrap({ category: 'linear', list: [{symbol: 'BTCUSDT', contractType: 'LinearPerpetual', status: 'Trading', baseCoin: 'BTC', quoteCoin: 'USDT', settleCoin: 'USDT'}] }),
  tickers: wrap({ category: 'linear', list: [{symbol: 'BTCUSDT', markPrice: '90000.5', fundingRate: '-0.00005', openInterestValue: '200000000'}] }),
  oi: wrap({ category: 'linear', symbol: 'BTCUSDT', list: [
    {openInterest: '110', timestamp: String(NOW - 3600000)},
    {openInterest: '100', timestamp: String(NOW - 7200000)}
  ] }),
  funding: wrap({ category: 'linear', list: [{symbol: 'BTCUSDT', fundingRate: '0.0001', fundingRateTimestamp: String(NOW - 4 * 3600000)}] }),
  ratio: wrap({ list: [{symbol: 'BTCUSDT', buyRatio: '0.54', sellRatio: '0.46', timestamp: String(NOW - 3600000)}] })
});
const base = adapter.normalize('BTCUSDT', valid(), NOW);
assert.equal(base.status, 'VERIFIED');
assert.equal(base.markPrice, 90000.5);
assert.equal(base.currentFundingPct, -0.005);
assert.equal(base.latestSettledFundingPct, 0.01);
assert.ok(Math.abs(base.openInterestChange1hPct - 10) < 1e-9);
assert.equal(base.longAccountPct, 54);
assert.equal(base.shortAccountPct, 46);
assert.equal(base.openInterestUsd, 200000000);
const noOI = valid(); noOI.oi = null;
assert.equal(adapter.normalize('BTCUSDT', noOI, NOW).status, 'PARTIAL');
const badTicker = valid(); badTicker.tickers.result.list[0].symbol = 'BTCDUPUSDT';
assert.equal(adapter.normalize('BTCUSDT', badTicker, NOW).status, 'UNAVAILABLE');
const expired = valid(); expired.tickers.time = NOW - 600000;
assert.equal(adapter.normalize('BTCUSDT', expired, NOW).status, 'UNAVAILABLE');
const badRatio = valid(); badRatio.ratio.result.list[0].sellRatio = '0.9';
assert.equal(adapter.normalize('BTCUSDT', badRatio, NOW).status, 'PARTIAL');
const badContract = valid(); badContract.instruments.result.list[0].contractType = 'LinearFutures';
assert.equal(adapter.normalize('BTCUSDT', badContract, NOW).status, 'UNAVAILABLE');
const wrongSettle = valid(); wrongSettle.instruments.result.list[0].settleCoin = 'USDC';
assert.equal(adapter.normalize('BTCUSDT', wrongSettle, NOW).status, 'UNAVAILABLE');
const malformedOI = valid(); malformedOI.oi.result = null;
assert.equal(adapter.normalize('BTCUSDT', malformedOI, NOW).status, 'PARTIAL');
const oldBucket = valid(); oldBucket.oi.result.list[0].timestamp = String(NOW - 9 * 3600000);
assert.equal(adapter.normalize('BTCUSDT', oldBucket, NOW).status, 'PARTIAL');
const zeroFunding = valid(); zeroFunding.tickers.result.list[0].fundingRate = '0';
assert.equal(adapter.normalize('BTCUSDT', zeroFunding, NOW).currentFundingPct, 0);
assert.throws(() => adapter.normalize('FAKETOKEN', valid(), NOW), /allowlisted/);
assert.equal(adapter.query('oi', 'BTCUSDT'), 'https://api.bybit.com/v5/market/open-interest?category=linear&symbol=BTCUSDT&intervalTime=1h&limit=2');
assert.equal(adapter.query('ratio', 'BTCUSDT'), 'https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=1h&limit=1');
console.log('Bybit derivatives shadow contract tests PASS');
