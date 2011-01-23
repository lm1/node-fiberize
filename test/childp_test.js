var fiberize = require('fiberize');
var child_process = fiberize.require('child_process');
var assert = require('assert');

fiberize.start(function() {
  // Run command and wait for result
  var result = child_process.execW('cat ' + __filename + ' |wc -l');

  assert.equal(result.length, 4);

  // result[0] is a returned child object
  assert.equal(typeof result[0].kill, 'function');

  // result[1] is 1st callabck argument (error code)
  assert.equal(result[1], null);

  // result[2] is 2ns callback argument (stdout)
  assert.equal(result[2], '24\n'); // :)

  // result[3] is 3rd callback argument (stderr)
  assert.equal(result[3], '');

  process.nextTick(function() { console.log('_END_');});
});
