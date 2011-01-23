var fiberize = require('fiberize');
var assert = require('assert');

fiberize.start(function() {

  var timeout = 50;
  var before = new Date();
  fiberize.sleep(timeout);
  var after = new Date();
  assert.ok((after - before) >= timeout);

  process.nextTick(function() { console.log('_END_');});
});
