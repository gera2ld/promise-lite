import test from 'tape';
import LitePromise from '#/index';

const MyPromise = LitePromise.SyncLitePromise;

test('Promise-sync', t => {
  t.test('#resolve', q => {
    q.test('should resolve a value', p => {
      const end = r => p.end(r);
      MyPromise.resolve('beauty')
      .then(data => {
        p.equal(data, 'beauty');
      })
      .then(end, end);
    });

    q.test('should resolve synchronously', p => {
      const end = r => p.end(r);
      const queue = [];
      new MyPromise(resolve => {
        resolve();
        queue.push(1);
      })
      .then(() => {
        p.deepEqual(queue, [1]);
      })
      .then(end, end);
      queue.push(2);
    });

    q.test('should reject errors in executor', p => {
      const end = r => p.end(r);
      const err = new Error();
      new MyPromise(() => {
        throw err;
      })
      .catch(e => {
        p.equal(e, err);
      })
      .then(end, end);
    });

    q.test('should resolve a promise and passes its value', p => {
      const end = r => p.end(r);
      MyPromise.resolve(MyPromise.resolve('beauty'))
      .then(data => {
        p.equal(data, 'beauty');
      })
      .then(end, end);
    });

    q.test('should pass to the next handler if null is met', p => {
      const end = r => p.end(r);
      MyPromise.resolve('beauty')
      .then(null, null)
      .then(data => {
        p.equal(data, 'beauty');
      })
      .then(end, end);
    });

    q.test('should invoke synchronously', p => {
      const end = r => p.end(r);
      let data = '';
      MyPromise.resolve(1)
      .then(res => {
        data += res;
        p.equal(data, '1');
      })
      .then(end, end);
      data += 2;
      p.equal(data, '12');
    });

    q.test('should resolve Promise-like object', p => {
      const end = r => p.end(r);
      MyPromise.resolve(1)
      .then(data => Promise.resolve(data))
      .then(data => {
        p.equal(data, 1);
      })
      .then(end, end);
    });
  });

  t.test('#reject', q => {
    q.test('should catch an exception', p => {
      const end = r => p.end(r);
      MyPromise.resolve()
      .then(() => {
        throw 'exception';
      })
      .catch(err => {
        p.equal(err, 'exception');
      })
      .then(end, end);
    });

    q.test('should reject a value', p => {
      const end = r => p.end(r);
      MyPromise.reject('beauty')
      .then(null, data => {
        p.equal(data, 'beauty');
      })
      .then(end, end);
    });

    q.test('should reject whatever is passed even if a promise', p => {
      const end = r => p.end(r);
      const toBeRejected = Promise.reject('rejected');
      toBeRejected.catch(() => {});
      MyPromise.reject(toBeRejected)
      .then(null, data => {
        p.equal(data, toBeRejected);
      })
      .then(end, end);
    });

    q.test('should pass to the next handler if null is met', p => {
      const end = r => p.end(r);
      MyPromise.reject('beauty')
      .then(null, null)
      .then(null, data => {
        p.equal(data, 'beauty');
      })
      .then(end, end);
    });
  });

  t.test('#all', q => {
    q.test('should resolve promises', p => {
      const end = r => p.end(r);
      MyPromise.all([
        new MyPromise(resolve => setTimeout(() => resolve(1), 500)),
        MyPromise.resolve(2),
        3,
      ])
      .then(data => {
        p.deepEqual(data, [1, 2, 3]);
      })
      .then(end, end);
    });

    q.test('should resolve non-promise values', p => {
      const end = r => p.end(r);
      MyPromise.all([1, 2, 3])
      .then(data => {
        p.deepEqual(data, [1, 2, 3]);
      })
      .then(end, end);
    });

    q.test('should reject immediately when got a rejection', p => {
      const end = r => p.end(r);
      MyPromise.all([
        new MyPromise(resolve => setTimeout(() => resolve(1), 500)),
        MyPromise.reject(2),
        3,
      ])
      .then(() => {
        throw 'should not execute here';
      }, data => {
        p.equal(data, 2);
      })
      .then(end, end);
    });
  });

  t.test('#race', q => {
    q.test('should resolve the first value', p => {
      const end = r => p.end(r);
      MyPromise.race([1, 2])
      .then(data => {
        p.equal(data, 1);
      })
      .then(end, end);
    });

    q.test('should resolve the first resolve', p => {
      const end = r => p.end(r);
      MyPromise.race([
        new MyPromise((resolve, reject) => setTimeout(() => reject(1), 500)),
        new MyPromise(resolve => setTimeout(() => resolve(2), 100)),
      ])
      .then(data => {
        p.equal(data, 2);
      }, () => {
        throw 'should not execute here';
      })
      .then(end, end);
    });

    q.test('should reject the first reject', p => {
      const end = r => p.end(r);
      MyPromise.race([
        new MyPromise(resolve => setTimeout(() => resolve(1), 500)),
        new MyPromise((resolve, reject) => setTimeout(() => reject(2), 100)),
      ])
      .then(() => {
        throw 'should not execute here';
      }, data => {
        p.equal(data, 2);
      })
      .then(end, end);
    });
  });
});
