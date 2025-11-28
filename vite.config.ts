import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react()
    ],
    base: '/',

    server: {
        host: '0.0.0.0',
        port: 8087,
        open: true,
        proxy: {
            '/SmartServer': {
                // target: 'http://172.16.42.153:8081', // backend cloud
                target: 'http://127.0.0.1:8085/', // backend localhost
                changeOrigin: true
            },
        },
    }
})
