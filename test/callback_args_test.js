var fiberize = require('fiberize');
var assert = require('assert');

var mod = {};
//
// Direct callback, no result
//
mod.f0 = function(callback) {
  callback();
};

mod.f1 = function(a, callback) {
  callback(false, a);
};
mod.f1.args = [1];
mod.f1.result = 1;

mod.f2 = function(a, b, callback) {
  callback(false, a, b);
};
mod.f2.args = [1, 2];
mod.f2.result = [1, 2];

mod.ferr = function(callback) {
  callback(true);
};
mod.ferr.throws = true;

//
// Delayed callback, no result
//
mod.f0d = function(callback) {
  process.nextTick(function() {callback();});
};

mod.f1d = function(a, callback) {
  process.nextTick(function() {callback(false, a);});
};
mod.f1d.args = [1];
mod.f1d.result = 1;

mod.f2d = function(a, b, callback) {
  process.nextTick(function() {callback(false, a, b);});
};
mod.f2d.args = [1, 2];
mod.f2d.result = [1, 2];

mod.ferrd = function(callback) {
  process.nextTick(function() {callback(true);});
};
mod.ferrd.throws = true;

//
// Direct callback with result
//
mod.fr0 = function(callback) {
  callback();
  return 1;
};
mod.fr0.result = 1;

mod.fr1 = function(a, callback) {
  callback(a);
  return 1;
};
mod.fr1.args = [2];
mod.fr1.result = [1, 2];

mod.fr2 = function(a, b, callback) {
  callback(a, b);
  return 1;
};
mod.fr2.args = [2, 3];
mod.fr2.result = [1, 2, 3];

mod.frerr = function(callback) {
  callback(true);
  return 1;
};
mod.frerr.result = [1, true];

//
// Delayed callback with result
//
mod.fr0d = function(callback) {
  process.nextTick(function() {callback();});
  return 1;
};
mod.fr0d.result = 1;

mod.fr1d = function(a, callback) {
  process.nextTick(function() {callback(a);});
  return 1;
};
mod.fr1d.args = [2];
mod.fr1d.result = [1, 2];

mod.fr2d = function(a, b, callback) {
  process.nextTick(function() {callback(a, b);});
  return 1;
};
mod.fr2d.args = [2, 3];
mod.fr2d.result = [1, 2, 3];

fiberize(mod);

fiberize.start(function() {
  for (fn in mod) {
    var f = mod[fn];
    var fw = mod[fn + 'W'];
    if (!fw) continue;

    console.log(fn, f.args, f.result, f.throws ? 'throws' : '');

    var args = f.args; // || undefined
    var result;
    if (f.throws) {
      assert.throws(function() {
        result = fw.apply(null, args);
      });
    } else {
      result = fw.apply(null, args);
    }
    if (f.result) {
      assert.deepEqual(result, f.result);
    }
  }

  process.nextTick(function() { console.log('_END_');});
});
