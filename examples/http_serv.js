var fiberize = require('fiberize');
var fs = fiberize.require('fs');
var path = fiberize.require('path');
var http = require('http');
var url = require('url');

var cwd = process.cwd() + '/';

http.createServer(fiberize.task(function(req, res) {
  var p = url.parse(req.url).pathname.slice(1);
  var rp = path.resolve(cwd, p);
  console.log('Request /' + p);
  try {
    var info = fs.statW(rp);
    if (info.isFile()) {
      res.writeHead(200);
      res.end(fs.readFileW(rp, 'utf8'));
    } else if (info.isDirectory()) {
      var list = fs.readdirW(rp);
      res.writeHead(200);
      list.forEach(function(f) {
        res.write(f.link(p + '/' + f) + '<br>\n');
      });
      res.end();
    }
  } catch (e) {
    console.error(e.message || e);
    res.writeHead(404);
    res.end('File not found');
  }
})).listen(8000);
console.log('Listening on port 8000...');
