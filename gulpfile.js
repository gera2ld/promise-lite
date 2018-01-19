const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const eslint = require('gulp-eslint');
const rollup = require('rollup');
const pkg = require('./package.json');

const DIST = 'dist';
const IS_PROD = process.env.NODE_ENV === 'production';
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};


const rollupOptions = {
  plugins: [
    require('rollup-plugin-babel')({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
    }),
    require('rollup-plugin-replace')({ values }),
  ],
};

function buildJs() {
  return rollup.rollup(Object.assign({
    input: 'src/index.js',
  }, rollupOptions))
  .then(bundle => bundle.write({
    name: 'Promise',
    file: `${DIST}/index.js`,
    format: 'umd',
  }))
  .catch(err => {
    log(err.toString());
  });
}

function lint() {
  return gulp.src('src/**/*.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
}

function watch() {
  gulp.watch('src/**', buildJs);
}

exports.lint = lint;
exports.build = buildJs;
exports.dev = gulp.series(buildJs, watch);
