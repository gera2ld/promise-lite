const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
const timeFunc = getTimeFunc();
let asyncQueue = [];
let asyncTimer;

export default class LitePromise {
  constructor(resolver) {
    let status = PENDING;
    let value;
    const handlers = [];
    let uncaught = true;
    this.then = thenFactory(isStatus, getValue, addHandler);
    asyncCall(resolver, [resolve, reject]);
    function resolve(data) {
      if (!isStatus(PENDING)) return;
      if (isThenable(data)) {
        data.then(resolve, reject);
      } else {
        status = FULFILLED;
        value = data;
        then();
      }
    }
    function reject(reason) {
      if (!isStatus(PENDING)) return;
      status = REJECTED;
      value = reason;
      asyncCall(() => {
        if (uncaught) console.error('Uncaught (in promise)', reason);
      });
      then();
    }
    function then() {
      handlers.splice(0).forEach(func => {
        asyncCall(func);
      });
    }
    function isStatus(checkStatus) {
      return status === checkStatus;
    }
    function getValue() {
      return value;
    }
    function addHandler(handler) {
      uncaught = false;
      if (isStatus(PENDING)) handlers.push(handler);
      else asyncCall(handler);
    }
  }

  catch(errHandler) {
    return this.then(null, errHandler);
  }

  static resolve(data) {
    return new LitePromise(resolve => {
      resolve(data);
    });
  }

  static reject(data) {
    return new LitePromise((resolve, reject) => {
      reject(data);
    });
  }

  static all(promises) {
    return new LitePromise((resolve, reject) => {
      let results = [];
      let pending = promises.length;
      promises.forEach((promise, i) => {
        if (isThenable(promise)) {
          promise.then(data => {
            resolveOne(data, i);
          }, rejectAll);
        } else {
          resolveOne(promise, i);
        }
      });
      check();
      function rejectAll(reason) {
        if (results) {
          results = null;
          reject(reason);
        }
      }
      function resolveOne(data, i) {
        if (results) {
          results[i] = data;
          pending -= 1;
          check();
        }
      }
      function check() {
        if (results && !pending) resolve(results);
      }
    });
  }

  static race(promises) {
    return new LitePromise((resolve, reject) => {
      let pending = true;
      promises.forEach(promise => {
        if (isThenable(promise)) {
          promise.then(resolveAll, rejectAll);
        } else {
          resolveAll(promise);
        }
      });
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
    });
  }
}

function getTimeFunc() {
  return global.setImmediate || global.requestAnimationFrame || global.setTimeout;
}

function asyncApply() {
  asyncTimer = false;
  const currentQueue = asyncQueue;
  asyncQueue = [];
  currentQueue.forEach(([func, args]) => {
    func(...(args || []));
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
  return (okHandler, errHandler) => {
    let pending = true;
    let handle;
    addHandler(() => {
      pending = false;
      if (handle) handle();
    });
    return new LitePromise((resolve, reject) => {
      handle = () => {
        let result;
        const resolved = isStatus(FULFILLED);
        const handler = resolved ? okHandler : errHandler;
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
      if (!pending) handle();
    });
  };
}

function isThenable(data) {
  return data && typeof data.then === 'function';
}
