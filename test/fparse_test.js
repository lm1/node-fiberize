var fiberize = require('fiberize');
var assert = require('assert');

var obj = {
  f1: function(callback) { if (true, true) { }}
};

fiberize(obj);
assert.ok(typeof obj.f1W === 'function');

process.nextTick(function() { console.log('_END_');});
