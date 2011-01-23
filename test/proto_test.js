var fiberize = require('fiberize');
var assert = require('assert');

var mod = { };
mod.MyClass = function() {
  this.a = 1;
};
mod.MyClass.prototype.get_a = function(callback) {
  callback(null, this.a);
  //return this;
};

fiberize(mod);

fiberize.start(function() {

  var obj = new mod.MyClass();
  var val = obj.get_aW();
  assert.equal(val, 1);

  process.nextTick(function() { console.log('_END_');});
});
