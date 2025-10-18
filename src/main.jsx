import React from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import './index.css'

function Router(){
  const path = window.location.pathname
  if(path.startsWith('/admin')) return <Admin/>
  return <Home/>
}
createRoot(document.getElementById('root')).render(<Router/>)
