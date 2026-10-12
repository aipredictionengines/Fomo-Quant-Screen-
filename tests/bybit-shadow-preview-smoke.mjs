import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('bybit-shadow-preview.html','utf8');
assert.ok(html.includes('самостоятелна тестова страница'),'must explain preview isolation');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length,2,'adapter and copy helper only');
for(const s of scripts)new Function(s[1]);
for(const id of ['bybitShadowPanel','bybitShadowSymbol','bybitShadowRefresh','bybitShadowExport','bybitShadowStatus','bybitShadowOutput','copyPreview']) {
  assert.ok(html.includes('id="'+id+'"'),'missing UI control '+id);
}
assert.ok(html.includes("Object.freeze(['BTCUSDT', 'ETHUSDT', 'SOLUSDT'])"),'only allowlisted markets');
assert.ok(html.includes("SHADOW"),'research only scope');
assert.ok(html.includes("mode: 'SHADOW'"),'read-only export contract');
assert.ok(!/localStorage|sessionStorage|indexedDB/i.test(html),'preview must not use FOMO persistence');
assert.ok(!/\/v5\/order|\/v5\/position|api[_-]?key/i.test(html),'no private APIs or credentials');
console.log('Bybit Shadow UI preview static smoke PASS');
