import fs from 'node:fs';
import assert from 'node:assert/strict';

// FOMO-DERIVATIVES-001 gate: the application's original inline JS must remain
// exactly identical to main before the Bybit card. This includes PAPER 50,
// Risk Gate, scoring, persistence and Position Planner. Any change fails closed.
const html = fs.readFileSync('index.html', 'utf8');
const adapter = fs.readFileSync('derivatives-shadow.js', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
assert.equal(scripts.length, 1, 'one original inline FOMO application script');
const hash64 = s => {
  let hash = 14695981039346656037n;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash ^ BigInt(s.charCodeAt(i))) * 1099511628211n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, '0');
};
assert.equal(hash64(scripts[0]), 'a01d249e5c972522',
  'FOMO application JS changed versus verified main; re-review PAPER 50/Risk Gate before merge');
assert.equal((html.match(/src="derivatives-shadow\.js"/g) || []).length, 1,
  'load independent read-only module exactly once');
for (const id of ['bybitShadowPanel','bybitShadowSymbol','bybitShadowRefresh','bybitShadowExport','bybitShadowStatus','bybitShadowOutput']) {
  assert.ok(html.includes('id="' + id + '"'), 'missing isolated UI element: ' + id);
}
assert.ok(adapter.includes('SHADOW ONLY') && adapter.includes("mode: 'SHADOW'"), 'scope must be research-only');
assert.ok(!/\b(?:localStorage|sessionStorage|indexedDB)\b/i.test(adapter), 'derivatives adapter must not write PAPER persistence');
assert.ok(!/\/v5\/(?:order|position)\b/i.test(adapter), 'derivatives adapter must not use private order/position APIs');
new Function(scripts[0]);
new Function(adapter);
console.log('Derivatives isolation guard PASS — original FOMO/PAPER/Risk JS unchanged');
