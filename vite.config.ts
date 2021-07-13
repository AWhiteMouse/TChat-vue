import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

const resolve = (url: string) => path.resolve(__dirname, url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve('src'),
      '@assets': resolve('src/assets'),
      '@components': resolve('src/components'),
      '@layouts': resolve('src/layouts'),
      '@router': resolve('src/router'),
      '@styles': resolve('src/styles'),
      '@utils': resolve('src/utils'),
      '@views': resolve('src/views'),
    }
  },
})
