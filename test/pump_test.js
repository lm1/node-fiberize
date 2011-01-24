var fiberize = require('fiberize');
var child_process = require('child_process');
var util = fiberize.require('util');
var assert = require('assert');

fiberize.start(function() {

  var child = child_process.spawn('ls');

  // pump ends output stream, need to prevent that
  // to be able to use it later
  process.stdout.end = function() {};

  util.pumpW(child.stdout, process.stdout);

  process.nextTick(function() { console.log('_END_');});
});
