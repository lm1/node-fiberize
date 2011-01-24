var fiberize = require('fiberize');
var fs = fiberize.require('fs');

fiberize.start(function() {

  var files = fs.readdirW(process.cwd());

  var total_bytes = 0;
  var total_lines = 0;

  for (var i = 0; i < files.length; ++i) {
    var info = fs.statW(files[i]);
    if (info.isFile()) {
      var lines = fs.readFileW(files[i], 'utf8').split('\n').length;
      console.log(files[i], 'is', info.size, 'bytes', lines, 'lines');
      total_bytes += info.size;
      total_lines += lines;
    }
    console.log('Total:', total_bytes, 'bytes', total_lines, 'lines');
  }

});
