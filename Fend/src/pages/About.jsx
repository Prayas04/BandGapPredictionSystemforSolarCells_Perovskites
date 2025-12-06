import React from 'react'
import './About.css'

function About() {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>Theoretical Concepts</h1>
        <p>Understanding Band Gaps and Their Role in Solar Cell Efficiency</p>
      </div>

      <section className="concept-section">
        <div className="concept-card">
          <h2>What is a Band Gap?</h2>
          <div className="concept-content">
            <p>
              The <strong>band gap (E<sub>g</sub>)</strong> is the energy difference between 
              the valence band (highest occupied energy level) and the conduction band 
              (lowest unoccupied energy level) in a material.
            </p>
            <div className="concept-visual">
              <div className="band-diagram-large">
                <div className="band-conduction">Conduction Band</div>
                <div className="band-gap-large">
                  <div className="gap-arrow">E<sub>g</sub></div>
                </div>
                <div className="band-valence">Valence Band</div>
              </div>
            </div>
            <p>
              This energy gap determines whether a material is a <strong>conductor</strong> 
              (E<sub>g</sub> ≈ 0), <strong>semiconductor</strong> (E<sub>g</sub> = 0.1-3 eV), 
              or <strong>insulator</strong> (E<sub>g</sub> &gt; 3 eV).
            </p>
          </div>
        </div>
      </section>

      <section className="concept-section">
        <div className="concept-card">
          <h2>Why Band Gap Matters for Solar Cells</h2>
          <div className="concept-content">
            <h3>The Photovoltaic Effect</h3>
            <p>
              When sunlight (photons) strikes a solar cell, electrons are excited from the 
              valence band to the conduction band if the photon energy exceeds the band gap. 
              This creates electron-hole pairs that generate electric current.
            </p>
            
            <h3>The "Goldilocks" Problem</h3>
            <div className="goldilocks-explanation">
              <div className="problem-item">
                <div className="problem-icon">❌</div>
                <div>
                  <strong>Too Low (&lt; 1.0 eV):</strong> Material absorbs too much infrared 
                  light, generating high current but low voltage. Efficiency is limited.
                </div>
              </div>
              <div className="problem-item optimal-item">
                <div className="problem-icon">✅</div>
                <div>
                  <strong>Optimal (1.1 - 1.4 eV):</strong> Perfect balance! Maximizes the 
                  product of voltage and current, leading to highest efficiency (~33% theoretical limit).
                </div>
              </div>
              <div className="problem-item">
                <div className="problem-icon">❌</div>
                <div>
                  <strong>Too High (&gt; 2.0 eV):</strong> Material only absorbs high-energy 
                  photons (blue/UV), missing most of the solar spectrum. High voltage but low current.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="concept-section">
        <div className="concept-card">
          <h2>Perovskite Crystals</h2>
          <div className="concept-content">
            <p>
              <strong>Perovskites</strong> are a class of materials with the general formula 
              ABX<sub>3</sub>, where:
            </p>
            <ul className="concept-list">
              <li><strong>A</strong> = Large cation (e.g., Cs<sup>+</sup>, CH<sub>3</sub>NH<sub>3</sub><sup>+</sup>)</li>
              <li><strong>B</strong> = Metal cation (e.g., Pb<sup>2+</sup>, Sn<sup>2+</sup>)</li>
              <li><strong>X</strong> = Halide anion (e.g., I<sup>-</sup>, Br<sup>-</sup>, Cl<sup>-</sup>)</li>
            </ul>
            <p>
              Perovskites are particularly promising for solar cells because:
            </p>
            <ul className="concept-list">
              <li>They can be tuned to have optimal band gaps (1.1-1.4 eV)</li>
              <li>They have excellent light absorption properties</li>
              <li>They can be synthesized relatively cheaply</li>
              <li>They show rapid efficiency improvements (from 3% to over 25% in a decade)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="concept-section">
        <div className="concept-card">
          <h2>Machine Learning Approach</h2>
          <div className="concept-content">
            <h3>Feature Engineering</h3>
            <p>
              Our model uses the <strong>Magpie</strong> feature set, which extracts chemical 
              properties from material compositions:
            </p>
            <div className="features-grid">
              <div className="feature-item">Atomic Mass</div>
              <div className="feature-item">Electronegativity</div>
              <div className="feature-item">Ionic Radius</div>
              <div className="feature-item">Valence Electrons</div>
              <div className="feature-item">Crystal Structure</div>
              <div className="feature-item">Coordination Number</div>
            </div>

            <h3>Model Architecture</h3>
            <p>
              We use <strong>XGBoost</strong> (Extreme Gradient Boosting), an ensemble learning 
              algorithm that combines multiple decision trees. Key advantages:
            </p>
            <ul className="concept-list">
              <li>Handles non-linear relationships between chemical properties and band gaps</li>
              <li>Robust to outliers and missing data</li>
              <li>Provides feature importance rankings</li>
              <li>Optimized through grid search with cross-validation</li>
            </ul>

            <h3>Target Transformation</h3>
            <p>
              We predict <strong>log(band_gap + 1)</strong> instead of raw band gap values. 
              This transformation:
            </p>
            <ul className="concept-list">
              <li>Prevents high band gaps (e.g., 8 eV) from dominating the model</li>
              <li>Focuses attention on the critical 1.0-2.0 eV range</li>
              <li>Improves prediction accuracy for solar-relevant materials</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="concept-section">
        <div className="concept-card">
          <h2>Solar Cell Efficiency Limits</h2>
          <div className="concept-content">
            <p>
              The theoretical maximum efficiency of a single-junction solar cell is governed 
              by the <strong>Shockley-Queisser limit</strong>:
            </p>
            <div className="efficiency-chart">
              <div className="efficiency-bar">
                <div className="efficiency-fill" style={{width: '33%'}}>
                  <span>33% (Theoretical Maximum)</span>
                </div>
              </div>
            </div>
            <p>
              This limit occurs at a band gap of approximately <strong>1.34 eV</strong> under 
              standard solar illumination (AM1.5G spectrum). Our model helps identify materials 
              close to this optimal value.
            </p>
          </div>
        </div>
      </section>

      <section className="concept-section">
        <div className="concept-card">
          <h2>Applications & Impact</h2>
          <div className="concept-content">
            <p>
              Accurate band gap prediction enables:
            </p>
            <ul className="concept-list">
              <li><strong>Virtual Screening:</strong> Test thousands of materials computationally before expensive synthesis</li>
              <li><strong>Material Design:</strong> Guide experimentalists toward promising compositions</li>
              <li><strong>Cost Reduction:</strong> Reduce trial-and-error in the lab</li>
              <li><strong>Accelerated Discovery:</strong> Find new perovskite materials faster</li>
            </ul>
            <p>
              This accelerates the development of next-generation solar cells that are more 
              efficient, cheaper, and environmentally friendly.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

