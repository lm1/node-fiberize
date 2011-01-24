var fiberize = require('fiberize');
var dns = fiberize.require('dns');
var http = require('http');
var url = require('url');

http.createServer(fiberize.task(function(req, res) {
  var addr = url.parse(req.url, true).query.addr;
  res.writeHead(200);
  if (!addr) {
    res.end('<form method=get>Address to resolve:' +
        '<input type=text name=addr><input type=submit></form>');
  } else {
    try {
      res.end(addr + ' resolves to ' + dns.resolveW(addr));
    } catch (e) {
      res.end(e.message || 'Error');
    }
  }
})).listen(8000);
console.log('Listening on port 8000...');
