promise-lite
---

[![NPM](https://img.shields.io/npm/v/@gera2ld/promise-lite.svg)](https://www.npmjs.com/package/@gera2ld/promise-lite)

A lite promise polyfill.

Installation
---
```sh
$ yarn add @gera2ld/promise-lite
```

Usage
---
```js
import LitePromise from '@gera2ld/promise-lite';

window.Promise = window.Promise || LitePromise;

// If you need a synchronous Promise in some special cases
window.Promise = LitePromise.SyncLitePromise;
```
