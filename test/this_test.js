var fiberize = require('fiberize');
var assert = require('assert');

var obj = {
  f: function(callback) {
    callback();
    assert.ok(this === obj);
  }
};

fiberize(obj);

fiberize.start(function() {
  obj.fW();
  process.nextTick(function() { console.log('_END_');});
});
