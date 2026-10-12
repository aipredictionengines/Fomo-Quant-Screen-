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
console.log('Bybit one-click diagnostic smoke PASS');
