import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Admin from './pages/Admin.jsx'
import './index.css'

function Router(){
  const path = window.location.pathname
  if (path.startsWith('/admin')) return <Admin />
  return <App />
}
ReactDOM.createRoot(document.getElementById('root')).render(<Router />)
