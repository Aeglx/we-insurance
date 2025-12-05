import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      buffer: 'buffer'
    }
  },
  server: {
    host: '0.0.0.0', // 对外暴露配置
    port: 8000, // 强制设置前端端口为8000
    allowedHosts: [
      'raoke.cn',    // 放行域名
      '.raoke.cn',   // 放行所有子域名
      '127.0.0.1',   // 保留本地访问
      'localhost'    // 保留本地访问
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env': JSON.stringify({})
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['mysql2', 'sequelize'],
      plugins: [
        {
          name: 'buffer-polyfill',
          transform(code, id) {
            if (id.includes('sequelize')) {
              return {
                code: code.replace(/Buffer\./g, 'globalThis.Buffer.'),
                map: null
              }
            }
            return null
          }
        }
      ]
    }
  }
})
