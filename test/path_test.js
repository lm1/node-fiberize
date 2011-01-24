var fiberize = require('fiberize');
var path = fiberize.require('path');
var assert = require('assert').ok;

fiberize.start(function() {

  assert(path.existsW(__filename));
  assert(path.existsW('@#$#^^&') == false);

  process.nextTick(function() { console.log('_END_');});
});
