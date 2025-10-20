import React, { useState } from 'react';
import Home from './components/Home.jsx';
import AdminPage from './components/AdminPage.jsx';

/**
 * Top‑level application component.  Renders a simple navigation bar and
 * conditionally displays either the public feed or the admin page.  The
 * navigation does not rely on react‑router to keep the footprint small.
 */
export default function App() {
  const [page, setPage] = useState('home');
  return (
    <>
      <nav>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage('home');
          }}
        >
          Home
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage('admin');
          }}
        >
          Admin
        </a>
      </nav>
      {page === 'home' && <Home />}
      {page === 'admin' && <AdminPage />}
    </>
  );
}