import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import solid from 'eslint-plugin-solid/configs/typescript';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage']),

  // アプリ本体 (ブラウザで動く Solid のコード)
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // 意図的に使わない値は _ 始まりで表す
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 設定ファイル (Node で動く)
  {
    files: ['*.config.{js,ts}'],
  },
]);
