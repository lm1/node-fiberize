var fiberize = require('fiberize');
var fs = fiberize.require('fs');
var assert = require('assert');

fiberize.start(function() {
  var file = __filename;
  var fd = fs.openW(file, 'r');
  var info = fs.fstatW(fd);
  var buf = new Buffer(info.size);
  var read = fs.readW(fd, buf, 0, info.size, null);
  fs.closeW(fd);
  assert.ok(read == info.size);
  //console.log(buf.toString('utf8'));

  var txt = fs.readFileW(file, 'utf8');
  assert.ok(txt.length == info.size);

  var data = fs.readFileW(file);
  assert.ok(data.length == info.size);

  assert.throws(function() {
    fs.unlinkW('^$%#$%$#@^%');
  });

  var cwd = process.cwd();
  var rel = __filename.slice(cwd.length + 1);
  var dir = __filename.split('/').slice(0, -1).join('/');
  var fn = __filename.split('/').pop();

  var p = fs.realpathW(rel);
  assert.equal(__filename, p);

  var res = fs.readdirW(dir);
  assert.ok(res.some(function(f) { return f === fn; }));

  assert.throws(function() {
    fs.writeFileW('.', 'ABC', 'utf8');
  });

  process.nextTick(function() { console.log('_END_');});
});
