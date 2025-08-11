import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vue()],
  optimizeDeps: {
    include: ['html-to-docx'], // 强制 Vite 预构建这个依赖
  },
})
