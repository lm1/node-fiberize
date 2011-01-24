var fiberize = require('fiberize');

fiberize.start(function() {

  for (var i = 0; i < 10; ++i) {
    console.log(i);
    fiberize.sleep(500);
  }

});
