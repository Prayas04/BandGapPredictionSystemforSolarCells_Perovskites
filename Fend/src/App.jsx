import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Dataset from './pages/Dataset'
import About from './pages/About'
import Predictions from './pages/Predictions'
import './App.css'
import MPerosyz_1 from './assets/MPerosyz_1.png'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text"><img src={MPerosyz_1} alt="M-Perosyz"/></span>
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/dataset" 
            className={`nav-link ${isActive('/dataset') ? 'active' : ''}`}
          >
            Dataset
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            About
          </Link>
          <Link 
            to="/predictions" 
            className={`nav-link ${isActive('/predictions') ? 'active' : ''}`}
          >
            Predictions
          </Link>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/about" element={<About />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2024 Solar Band Gap Prediction System. Built with FastAPI & React.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App

