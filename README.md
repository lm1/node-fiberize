
# Introduction

No more callbacks clutter! Fiberize converts Node.js asynchronous API to easy to use and read, straightforward sequential form.

      for (var i = 0; i < 10; ++i) {
        console.log(i);
        sleep(500);
      }

It's possible thanks to fiber based cooperative multithreading added to V8 by [node-fibers](https://github.com/laverdet/node-fibers).
Fiber is just a thread of execution, but with no preemption, thus safe and simple to use. And of course you may have multiple fibers running in parallel.

You may also like [fibers-promise](https://github.com/lm1/node-fibers-promise) library.

# Getting started

    npm install fiberize

This will install node-fibers as well. Working g++ and node headers are required.

Then run your code with:

    node-fibers your_file.js

# Examples

Fully featured example from introduction:

    var fiberize = require('fiberize');

    fiberize.start(function() {
      console.log('Hello');
      fiberize.sleep(1000);
      console.log('World');
    });

This following examples shows how the original API is extended by fiberize (notice `W` suffix): 

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

Although Node provides fs.readdirSync and fs.statSync calls, the above will not block the entire process, thus all other Fibers can execute while this one is waiting for the data. 

You can serve each HTTP request with separate fiber. You can also use exceptions unlike with callbacks.

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


# Interface

    var fiberize = require('fiberize');

- `fiberize(obj)`

fiberize itself is a function which extends given object `obj` so for all functions which explicitly declare last argument named callback, a new function with suffix 'W' is added.

The new function does take same parameters with exception of callback, and behaves the same, but does not return immediately. Instead it suspends current fiber until the underlying callback is triggered and returns the value passed as second argument to callback. If the first argument (usuall `err`) was given to the callback exception is thrown (see below for more details), e.g.:

    var obj = {
        method1: function(a, callback) {}
    };

*fiberize(obj)* will extend obj as follows:

    {
        method1: function(a, callback) {},
        method1W: function(a) {}
    }

*You cannot use transformed functions directly from main thread, you need to create a fiber first!*

- `fiberize.require(path)`

For convenience `fiberize.require` function has been provided, does the same as `require`, but extends the required module by the way.  

- `fiberize.start(f /* , args... */ )`

`start` runs `f` in a new fiber and passes `args` to `f`.
Returns the value returned by `f`.

- `fiberize.task(f)`

Returns a function which will execute `f` in new fiber upon invocation. All the arguments of the returned function are passed directly to `f`. Useful to postpone start of a fiber, or wrap a callback in a fiber.

- `fiberize.sleep(ms)`

Suspends current fiber for `ms` miliseconds. Doesn't block the event loop, thus other fibers may execute. 

# Conventions

Fiberaze bases strongly on consistent conventions used in Node API. If you're using third party libraries following similar conventions you may be able to transform them as well.

Basically all functions receiving callback as the very last arguments get additional form suffixed with `W`. The callback must be specified explicitly in the arguments list (also comments are parsed).

The return value of new functions depends on behavior of original function, that is for functions which:

- do not return a value and pass 1 argument to the callback
> if callback 1st argument evaluates to true it's thrown as exception
- do not return a value and pass 2 arguments to the callback
> if callback 1st argument evaluates to true it's thrown as exception,
> otherwise 2nd callback argument is returned
- do not return a value and pass 3 or more arguments to the callback
> if callback 1st argument evaluates to true it's thrown as exception,
> otherwise array containing 2nd and the following callback arguments is returned
- do return a value (other than this)
> returns an array containing original result followed by all callback arguments

*Some special cases are handled differently!*

# Warning

Though large part of the Node core API is covered (with tests), not all modules can be fiberized automatically;
namely: events, net, stream, and HTTP are inherently asynchronous and cannot be reasonably fiberized.
