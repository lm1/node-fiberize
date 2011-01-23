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

module.exports.wrapf = wrapf;

module.exports.require = function(path) {
  return fiberize(require(path));
};

function build_result(result, cb_args) {
  var ret = {};
  if (result !== undefined) {
    ret.value = [result].concat(cb_args);
  } else {
    if (cb_args[0]) {
      ret.error = cb_args[0];
    } else {
      ret.value = cb_args.slice(1);
      if (ret.value.length == 1) ret.value = ret.value[0];
    }
  }
  return ret;
}

function wrapf(fn) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var fiber = Fiber.current;
    var returned = false;
    var result;
    var cb_args;
    var cb = function(err) {
      cb_args = Array.prototype.slice.call(arguments);
      if (!returned) return true;
      var ret = build_result(result, cb_args);
      if (ret.error) {
        fiber.throwInto(ret.error);
        return false;
      } else {
        fiber.run(ret.value);
        return true;
      }
    };
    var len = fn.__length || fn.length;
    if (args.length >= len) args.push(cb);
    else args[len - 1] = cb;
    var value = fn.apply(self, args);
    returned = true;
    if (value !== self) result = value;
    if (cb_args) {
      var ret = build_result(result, cb_args);
      if (ret.error) throw (ret.error);
      else return ret.value;
    }
    return yield();
  }
}

function fiberizeObject(obj) {
  if (obj.__fiberized) return obj;
  for (var f in obj) {
    var fn = obj[f];
    console.log('Found:', f, typeof fn);
    if (typeof fn !== 'function' || /^_.*|.*_$/.test(f)) continue;

    var body = obj[f].toString(); // stringify function body
    // extract arguments, also the commented ones
    var args = /function [\w$]*\((.*)\)\s*{/.exec(body)[1]
        .replace(/\/\*|\*\//g, ', ')
        .replace(/\s*/g, '')
        .replace(/,,/g, ',')
        .replace(/,$/, '')
        .split(',');
    var lastarg = args.slice(-1).toString();
    if (lastarg == 'callback' || obj[f].__hasCallback) {
      console.log('Wrapping', f, '(', args, ')');
      fn.__length = args.length;
      if (obj[f + 'W'] === undefined) {
        obj[f + 'W'] = wrapf(fn);
      } else {
        console.error('(fiberize) Warning:', f + 'W', 'already defined.');
      }
    }
    if (fn.prototype) fiberizeObject(fn.prototype);
  }
  obj.__fiberized = true;
  return obj;
}

function fiberize(mod, proto) {
  return fiberizeObject(mod, proto);
}

module.exports.start = function(f) {
  return Fiber(f).run();
};

module.exports.sleep = function(ms) {
  var fiber = Fiber.current;
  setTimeout(function() { fiber.run(); }, ms);
  yield();
};

require('fs').readFile.__hasCallback = true;
