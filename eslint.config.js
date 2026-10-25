const js = require('@eslint/js');
const n = require('eslint-plugin-n');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    // Generated parsers and upstream fixture inputs are outside authored JS.
    ignores: ['src/**', 'build/**', 'examples/**', 'test/corpus/**'],
  },
  js.configs.recommended,
  n.configs['flat/recommended-script'],
  {
    settings: { n: { version: '>=24.0.0' } },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['grammar.js'],
    languageOptions: {
      globals: {
        alias: 'readonly',
        choice: 'readonly',
        field: 'readonly',
        grammar: 'readonly',
        optional: 'readonly',
        prec: 'readonly',
        repeat: 'readonly',
        repeat1: 'readonly',
        seq: 'readonly',
      },
    },
    rules: {
      // Every grammar rule receives the DSL's conventional symbol parameter.
      'no-unused-vars': ['error', { argsIgnorePattern: '^\\$$' }],
      // Tree-sitter serializes these expressions for its Rust regex parser;
      // retain the inherited escapes instead of applying JS-only rewrites.
      'no-useless-escape': 'off',
    },
  },
  {
    files: ['bindings/node/index.js'],
    rules: {
      // The inherited binding can load without optional node-type metadata.
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['eslint.config.js', 'test/**/*.cjs'],
    rules: { 'n/no-unpublished-require': 'off' },
  },
  prettier,
];
