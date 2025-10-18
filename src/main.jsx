import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import './index.css'

const today = new Date().toLocaleDateString(undefined, { day:'2-digit', month:'long', year:'numeric' })

function App(){
  return (
    <HashRouter>
      <header className="mast">
        <div className="mwrap">
          <div className="brand">The Gargantuan</div>
          <div className="dateline">{today} · Edited by The Gargantuan</div>
          <div className="redbar"></div>
        </div>
        <nav className="nav">
          <div className="container" style={{display:'flex',gap:22}}>
            <a>NEWS</a><a>CULTURE</a><a>SOUND</a><a>IDEAS</a><a>DISPATCHES</a>
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="footer">
        <div className="fwrap">
          © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" style={{color:'#fff'}}>hellogargantuan69@gmail.com</a>
        </div>
      </footer>
    </HashRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
