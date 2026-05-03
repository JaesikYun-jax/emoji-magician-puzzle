import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5175
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html"
      }
    }
  },
  test: {
    environment: 'jsdom',
    // Playwright E2E 테스트 파일 제외 (vitest 전용 범위)
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/systems/**', 'src/router/**', 'src/game-data/**'],
      exclude: ['src/scenes/**', 'src/components/**', 'src/**/__tests__/**'],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
      },
      reporter: ['text', 'html'],
    },
  },
});
