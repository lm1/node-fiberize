var fiberize = require('fiberize');
var dns = fiberize.require('dns');
var assert = require('assert');

fiberize.start(function() {

  assert.deepEqual(dns.lookupW('localhost'), ['127.0.0.1', 4]);

  assert.deepEqual(dns.resolveW('localhost'), ['127.0.0.1']);

  //assert.equal(dns.reverseW('66.102.13.147'), 'ez-in-f147.1e100.net');

  process.nextTick(function() { console.log('_END_');});
});
