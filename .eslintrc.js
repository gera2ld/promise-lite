module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  plugins: [
    'import',
  ],
  rules: {
    'no-use-before-define': ['error', 'nofunc'],
    'no-mixed-operators': 0,
    'arrow-parens': 0,
    'no-plusplus': 0,
    'no-param-reassign': 0,
    'consistent-return': 0,
    'no-console': ['warn', {
      allow: ['error', 'warn', 'info'],
    }],
    'no-bitwise': ['error', { int32Hint: true }],
    indent: ['error', 2, { MemberExpression: 0 }],
    'no-throw-literal': 0,
    'prefer-promise-reject-errors': 0,
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
};
