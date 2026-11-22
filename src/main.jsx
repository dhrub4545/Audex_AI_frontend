import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Automatically reload on Vite preload / dynamic chunk fetch errors (e.g. after a new deployment)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Audex] Vite preload error caught, auto-reloading to fetch newest chunks...', event);
  event.preventDefault();
  const reloadKey = 'audex_vite_preload_reload';
  if (!sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, 'true');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
