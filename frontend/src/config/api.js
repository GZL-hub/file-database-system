export const API_CONFIG = {
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}
