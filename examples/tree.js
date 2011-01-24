var fiberize = require('fiberize');
var fs = fiberize.require('fs');

function tree(p) {
  var files = fs.readdirW(p);
  for (var i = 0; i < files.length; ++i) {
    var info = fs.statW(p + files[i]);
    console.log(p + files[i]);
    if (info.isDirectory()) {
      tree(p + files[i] + '/');
    }
  }
}

fiberize.start(tree, process.cwd() + '/');

