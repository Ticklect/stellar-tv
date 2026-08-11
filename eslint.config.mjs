import { defineConfig } from 'eslint/config';

const browserGlobals = {
  Blob: 'readonly',
  Date: 'readonly',
  Int32Array: 'readonly',
  MouseEvent: 'readonly',
  MutationObserver: 'readonly',
  Promise: 'readonly',
  Response: 'readonly',
  URL: 'readonly',
  WeakMap: 'readonly',
  Worker: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  document: 'readonly',
  isFinite: 'readonly',
  location: 'readonly',
  navigator: 'readonly',
  self: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  tizen: 'readonly',
  window: 'readonly'
};

export default defineConfig([
  {
    ignores: ['node_modules/**', 'coverage/**', 'android-tv/**/build/**']
  },
  {
    files: ['main.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: browserGlobals
    },
    rules: {
      'no-constant-condition': 'error',
      'no-debugger': 'error',
      'no-dupe-keys': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }]
    }
  },
  {
    files: ['eslint.config.mjs', 'test/**/*.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        Blob: 'readonly',
        URL: 'readonly',
        process: 'readonly',
        console: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly'
      }
    },
    rules: {
      'no-debugger': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'after-used' }]
    }
  },
  {
    files: ['android-tv/app/src/main/assets/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        KeyboardEvent: 'readonly',
        document: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      'no-debugger': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }]
    }
  }
]);
