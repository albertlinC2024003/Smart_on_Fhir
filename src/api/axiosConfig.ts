import axios from 'axios'
import { sessionS } from '../utils/module/ProjectStorage'
import { StorageKey } from '../enum/system'
//因為在Provider中的初始化順序問題(頁面的prepareLogin會先打 但axiosInstance還沒建立攔截器) 所以csrfToken在這裡處理
const api = axios.create({
  baseURL: '/SmartServer',
  headers: {
    accept: 'application/json'
  },
  withCredentials: true,
  withXSRFToken: true,
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    const csrfToken = sessionS.getItem(StorageKey.csrf)
    if (csrfToken !== null) {
      // config.headers['X-CSRF-TOKEN'] = csrfToken
      config.headers['x-csrf-token'] = csrfToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    const headers = response.headers
    const token = headers['x-csrf-token']
    if (token) {
      sessionS.setItem(StorageKey.csrf, token)
    }
    if (response.data.code === 101 || response.data.code === 105) {
      sessionS.removeItem(StorageKey.csrf)
    }
    return response
  },
  (error) => {
    if (error.response.data.code === 101 || error.response.data.code === 105) {
      sessionS.removeItem(StorageKey.csrf)
    }
    return Promise.reject(error)
  }
)

export { api}

