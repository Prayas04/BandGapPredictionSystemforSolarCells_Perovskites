import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Predicting Perovskite Crystal Band Gaps
            <span className="highlight"> with Machine Learning</span>
          </h1>
          <p className="hero-subtitle">
            Discover optimal materials for solar cell applications by predicting 
            the band gap (E<sub>g</sub>) of perovskite crystals using advanced ML algorithms.
          </p>
          <div className="hero-actions">
            <Link to="/predictions" className="btn btn-primary">
              Make Predictions
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="band-gap-diagram">
            <div className="diagram-container">
              <div className="energy-levels">
                <div className="conduction-band">
                  <span>Conduction Band</span>
                </div>
                <div className="band-gap-indicator">
                  <span className="gap-label">Band Gap (E<sub>g</sub>)</span>
                  <span className="gap-value">1.1 - 1.4 eV (Optimal)</span>
                </div>
                <div className="valence-band">
                  <span>Valence Band</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Band Gap Matters</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Optimal Range</h3>
            <p>
              For efficient solar cells, materials need a "Goldilocks" band gap 
              between <strong>1.1 eV and 1.4 eV</strong>. Too low, and you lose 
              voltage. Too high, and you lose current.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Material Discovery</h3>
            <p>
              Our ML model analyzes chemical compositions to predict band gaps, 
              accelerating the discovery of new perovskite materials for solar applications.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Efficiency Prediction</h3>
            <p>
              By predicting band gaps accurately, we can identify materials that 
              maximize solar cell efficiency before expensive experimental synthesis.
            </p>
          </div>
        </div>
      </section>

      <section className="quick-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value-H">XGBoost</div>
            <div className="stat-label-H">ML Algorithm</div>
          </div>
          <div className="stat-card">
            <div className="stat-value-H">&lt; 0.7 eV</div>
            <div className="stat-label-H">Target RMSE</div>
          </div>
          <div className="stat-card">
            <div className="stat-value-H">1000+</div>
            <div className="stat-label-H">Materials Analyzed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value-H">Magpie</div>
            <div className="stat-label-H">Feature Set</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Predict Band Gaps?</h2>
          <p>Enter a chemical formula and get instant predictions with detailed analysis.</p>
          <Link to="/predictions" className="btn btn-primary btn-large">
            Start Predicting →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

