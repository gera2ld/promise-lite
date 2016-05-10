/**
 * @desc A lite Promise implementation.
 * @author Gerald <i@gerald.top>
 *
 * https://github.com/gera2ld/promise-lite
 */
!function (root, factory) {
  if (typeof module === 'object' && module.exports)
    module.exports = factory(root);
  else
    root.Promise = root.Promise || factory(root);
}(typeof global !== 'undefined' ? global : this, function (root) {

  var PENDING = 'pending';
  var FULFILLED = 'fulfilled';
  var REJECTED = 'rejected';
  var asyncQueue = [];
  var asyncTimer;
  var timeFunc = getTimeFunc();

  function getTimeFunc() {
    return root.setImmediate || root.requestAnimationFrame || root.setTimeout;
  }

  function asyncApply() {
    asyncTimer = false;
    var currentQueue = asyncQueue;
    asyncQueue = [];
    currentQueue.forEach(function (data) {
      data[0].apply(null, data[1]);
    });
  }

  function asyncCall(func, args) {
    asyncQueue.push([func, args]);
    if (!asyncTimer) {
      timeFunc(asyncApply);
      asyncTimer = true;
    }
  }

  function thenFactory(isStatus, getValue, addHandler) {
    return function (okHandler, errHandler) {
      var pending = true;
      var handle;
      addHandler(function () {
        pending = false;
        handle && handle();
      });
      return new Promise(function (resolve, reject) {
        handle = function () {
          var result;
          var resolved = isStatus(FULFILLED);
          var handler = resolved ? okHandler : errHandler;
          if (handler) {
            try {
              result = handler(getValue());
            } catch (e) {
              return reject(e);
            }
          } else {
            result = getValue();
            if (!resolved) return reject(result);
          }
          resolve(result);
        };
        pending || handle();
      });
    };
  }

  function Promise(resolver) {
    var status = PENDING;
    var value;
    var handlers = [];
    var uncaught = true;
    var resolve = function (data) {
      if (!isStatus(PENDING)) return;
      if (data && typeof data.then === 'function') {
        data.then(resolve, reject);
      } else {
        status = FULFILLED;
        value = data;
        then();
      }
    };
    var reject = function (reason) {
      if (!isStatus(PENDING)) return;
      status = REJECTED;
      value = reason;
      asyncCall(function () {
        uncaught && console.error('Uncaught (in promise)', reason);
      });
      then();
    };
    var then = function () {
      handlers.splice(0).forEach(function (func) {
        asyncCall(func);
      });
    };
    var isStatus = function (_status) {
      return status === _status;
    };
    var getValue = function () {
      return value;
    };
    var addHandler = function (handler) {
      uncaught = false;
      if (isStatus(PENDING)) handlers.push(handler);
      else asyncCall(handler);
    };
    this.then = thenFactory(isStatus, getValue, addHandler);
    asyncCall(resolver, [resolve, reject]);
  }

  Promise.prototype.catch = function (errHandler) {
    return this.then(null, errHandler);
  };

  Promise.resolve = function (data) {
    return new Promise(function (resolve) {
      resolve(data);
    });
  };

  Promise.reject = function (data) {
    return new Promise(function (resolve, reject) {
      reject(data);
    });
  };

  Promise.all = function (promises) {
    return new Promise(function (resolve, reject) {
      function rejectAll(reason) {
        if (results) {
          results = null;
          reject(reason);
        }
      }
      function resolveOne(data, i) {
        if (results) {
          results[i] = data;
          pending --;
          check();
        }
      }
      function check() {
        results && !pending && resolve(results);
      }
      var results = [];
      var pending = promises.length;
      promises.forEach(function (promise, i) {
        if (promise instanceof Promise) {
          promise.then(function (data) {
            resolveOne(data, i);
          }, rejectAll);
        } else {
          resolveOne(promise, i);
        }
      });
      check();
    });
  };

  Promise.race = function (promises) {
    return new Promise(function (resolve, reject) {
      function resolveAll(data) {
        if (pending) {
          pending = false;
          resolve(data);
        }
      }
      function rejectAll(reason) {
        if (pending) {
          pending = false;
          reject(reason);
        }
      }
      var pending = true;
      promises.forEach(function (promise) {
        if (promise instanceof Promise) {
          promise.then(resolveAll, rejectAll);
        } else {
          resolveAll(promise);
        }
      });
    });
  };

  return Promise;

});
