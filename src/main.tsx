import { createRoot } from 'react-dom/client'
import App from './App'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

// 方案 A：讀 meta
const nonceMeta = document.querySelector('meta[name="csp-nonce"]')
const nonce = nonceMeta?.getAttribute('content')
console.log('Using nonce:', nonce)
// 創建 Emotion Cache，所有 style 都帶 nonce
const emotionCache = createCache({
    key: 'mui',
    nonce: nonce,
    container: document.head
})

createRoot(document.getElementById('root')!).render(
    <CacheProvider value={emotionCache}>
        <App />
    </CacheProvider>
)
