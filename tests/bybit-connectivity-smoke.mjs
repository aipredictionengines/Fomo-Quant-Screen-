import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('bybit-connectivity.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length,1,'must have one inline browser diagnostic script');
new Function(scripts[0][1]);
for(const marker of ['id="start"','id="copy"','id="state"','id="checks"','id="log"','TEST BYBIT','mode:\x27cors\x27','credentials:\x27omit\x27','retCode','response.ok']) {
  assert.ok(html.includes(marker),'Missing diagnostic behavior '+marker);
}
assert.equal((html.match(/https:\/\/api\.bybit\.com\/v5\/market\//g)||[]).length,6,'5 API endpoints plus user-visible direct control');
assert.ok(!/localStorage|sessionStorage|fetch\s*\([^)]*method:\s*['"]POST/i.test(html),'diagnostic must not persist or mutate data');
assert.ok(!/api[_-]?key|bearer\s+[^\s]+/i.test(html),'no secrets in static test');

// Regression from actual 2026-10-12 user browser result: Bybit OI rows do not contain symbol.
const source=scripts[0][1];
const begin=source.indexOf('function validatePayload(');
const end=source.indexOf('async function check(',begin);
assert.ok(begin>=0 && end>begin,'Open Interest validator must be present');
const validatePayload=new Function(source.slice(begin,end)+'; return validatePayload;')();
const fixture=(name, list, extra={})=>({
  retCode:0,
  result:{list, ...extra}
});
const history=fixture('Open Interest',[
 {openInterest:'58777.92',timestamp:'1791763200000'},
 {openInterest:'58210.34',timestamp:'1791759600000'}
],{symbol:'BTCUSDT',category:'linear'});
assert.equal(validatePayload('Open Interest',history),true,'official OI shape: symbol is result-level');
assert.equal(validatePayload('Open Interest',{...history,result:{...history.result,symbol:'ETHUSDT'}}),false,'wrong OI market rejected');
assert.equal(validatePayload('Open Interest',{...history,result:{...history.result,category:'inverse'}}),false,'wrong OI category rejected');
assert.equal(validatePayload('Open Interest',{...history,result:{...history.result,list:[]}}),false,'empty OI rejected');
assert.equal(validatePayload('Open Interest',{...history,result:{...history.result,list:[{openInterest:'N/A',timestamp:'1791763200000'}]}}),false,'invalid OI numeric data rejected');
assert.equal(validatePayload('Open Interest',{...history,result:{...history.result,list:[{openInterest:'22',timestamp:'nope'}]}}),false,'invalid OI timestamp rejected');
assert.equal(validatePayload('Open Interest',{...history,retCode:10001}),false,'Bybit error rejected');
for (const endpoint of ['Instruments','Tickers','Funding','Long/Short']) {
  assert.equal(validatePayload(endpoint,fixture(endpoint,[{symbol:'BTCUSDT'}])),true,endpoint+' original envelope supported');
  assert.equal(validatePayload(endpoint,fixture(endpoint,[{symbol:'ETHUSDT'}])),false,endpoint+' wrong symbol rejected');
}

console.log('Bybit one-click diagnostic smoke PASS');
