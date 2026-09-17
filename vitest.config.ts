import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

// solid-js の開発用ビルドを読ませる必要があるため、本番ビルド設定とは分けている
export default defineConfig({
  // hot: false … HMR (solid-refresh) が有効だとテストで読み込みに失敗する
  plugins: [solid({ hot: false })],
  resolve: {
    conditions: ['development', 'browser'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
