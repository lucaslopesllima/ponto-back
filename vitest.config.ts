import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/pontome_test',
      JWT_SECRET: 'test-secret-key-minimum-32-characters!!',
      JWT_REFRESH_SECRET: 'refresh-secret-key-minimum-32-chars!!',
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES: '7d',
      CORS_ORIGIN: 'http://localhost:3000',
      API_PREFIX: '/api/v1',
    },
  },
});
