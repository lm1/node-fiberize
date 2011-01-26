/*
  Copyright 2011 Lukasz Mielicki <mielicki@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to
  deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  sell copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  IN THE SOFTWARE.
*/

require('fibers');

module.exports = fiberize;

module.exports.require = function(path) {
  return fiberize(require(path));
};

function get_current_fiber() {
  var f = Fiber.current;
  if (f === undefined) throw new Error("You need to start a fiber first!");
  return f;
}

function wrapf(fn, type) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var fiber = get_current_fiber();
    var result;
    var cb_args;
    var cb = function(err) {
      cb_args = Array.prototype.slice.call(arguments);
      if (Fiber.current !== fiber) {
        fiber.run();
      }
    };
    args.push(cb);
    var result = fn.apply(this, args);
    if (result === this) {
      result = undefined;
    }
    while (!cb_args) {
      yield();
    }
    if (result !== undefined) {
      result = [result].concat(cb_args);
    } else if (type === 0) {
      result = cb_args;
    } else {
      var err = cb_args.shift();
      if (err) throw err;
      result = cb_args;
    }
    if (result.length <= 1) {
      result = result[0];
    }
    return result;
  }
}

function fiberize(obj) {
  if (obj.__fiberized) return obj;
  for (var f in obj) {
    var fn = obj[f];
    if (typeof fn !== 'function' || /^_.*|.*_$/.test(f)) continue;
    var body = fn.toString(); // stringify function body
    // extract arguments (including the commented ones)
    var args = /function [\w$]*\((.*?)\)\s*{/.exec(body)[1]
        .replace(/\/\*|\*\//g, ', ')
        .replace(/\s*/g, '')
        .replace(/,,/g, ',')
        .replace(/,$/, '')
        .split(',');
    var lastarg = args.slice(-1).toString();
    if (/^cb$|callback/.test(lastarg) || fn.__hasCallback) {
      if (obj[f + 'W'] === undefined) {
        obj[f + 'W'] = wrapf(fn, fn.__callbackType);
      } else {
        console.error('(fiberize) Warning:', f + 'W', 'already defined.');
      }
    }
    if (fn.prototype) fiberize(fn.prototype);
  }
  if (obj.prototype) fiberize(obj.prototype);
  obj.__fiberized = true;
  return obj;
}

fiberize.start = function(f) {
  return Fiber(function(args) {
    return f.apply(this, args);
  }).run(Array.prototype.slice.call(arguments, 1));
};

fiberize.task = function(f) {
  return function() {
    Fiber(function(args) {f.apply(this, args);}).run(arguments);
  };
};

fiberize.sleep = function(ms) {
  var wake = false;
  var fiber = get_current_fiber();
  setTimeout(function() {
    wake = true;
    fiber.run();
  }, ms);
  while (!wake) {
    yield();
  }
};

require('fs').readFile.__hasCallback = true;
require('path').exists.__callbackType = 0;
