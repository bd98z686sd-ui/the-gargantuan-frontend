import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import './index.css'

const AppShell = () => (
  <HashRouter>
    <header className="header">
      <div className="container">
        <div className="brand">The Gargantuan</div>
        <div className="tagline">daily audio + video · latest first</div>
      </div>
    </header>

    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/admin" element={<Admin/>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <div className="footer-space" />
  </HashRouter>
)

createRoot(document.getElementById('root')).render(<AppShell />)
