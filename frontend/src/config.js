export const API_BASE = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : window.location.hostname.includes('vercel.app')
      ? 'https://13.239.63.88.sslip.io/api'
      : `${window.location.protocol}//${window.location.host}/api`
);
