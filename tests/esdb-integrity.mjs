import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('const ESDB = {');
const end=html.indexOf('const Research = {',start);
assert.ok(start>=0&&end>start,'ESDB code missing');
const code=html.slice(start,end);
const entry=(id,config={})=>({
  id, key:'solana:'+id, symbol:id, ess:Number(id.replace(/\D/g,''))*12, txAccel:1.5,
  done:true, expired:false,
  out:{r60:30,max60:75},
  cpStatus:{r60:{status:'VALIDATED'}},
  ...config
});
function evaluate(items){
  const sandbox={
    S:{esdb:items},
    CFG:{esdb:{hitPct:30,sustainPct:20}}
  };
  vm.runInNewContext(code+'\nthis.result=ESDB.analysis();',sandbox,{timeout:1000});
  return sandbox.result;
}
const records=Array.from({length:8},(_,i)=>entry('t'+(i+1)));
let a=evaluate(records);
assert.equal(a.n,8,'verified 60m cohort');
assert.equal(a.base.r60,30);
assert.equal(a.base.sus,100);
assert.equal(a.base.hit,null,'legacy unverified max must NOT become a missed HIT');
assert.equal(a.hitVerified,0,'no verified extrema');
assert.ok(a.buckets.every(b=>b.hit===null&&b.max60===null),'no synthetic max averages');
assert.ok(a.rows.every(r=>r.lift==null),'do not calibrate lift without verified high data');

const genuine=records.map(x=>({...x,cpStatus:{...x.cpStatus}}));
genuine[0].cpStatus.max60={status:'VALIDATED'};
genuine[0].out={r60:25,max60:55};
a=evaluate(genuine);
assert.equal(a.hitVerified,1);
assert.equal(a.base.hit,100,'only independently verified extrema enter denominator');
assert.equal(a.base.sus,100);
genuine[0].out.max60=5;
a=evaluate(genuine);
assert.equal(a.base.hit,0,'validated negative hit allowed');

const missed=records.map(x=>({...x,cpStatus:{r60:{status:'NOT_VERIFIED'}}}));
a=evaluate(missed);
assert.equal(a.n,0,'missed checkpoints excluded from resolved cohort');
assert.equal(a.base.sus,null);
const notNum=entry('x1',{out:{r60:NaN,max60:99}});
assert.equal(evaluate([notNum]).n,0,'invalid r60 excluded');
assert.ok(html.includes('60M VERIFIED · HIT N/A'),'UI never mislabels unverified max as MISS');
assert.equal((html.match(/<\/script>/g)||[]).length,1);
console.log('ESDB integrity regression PASS');
