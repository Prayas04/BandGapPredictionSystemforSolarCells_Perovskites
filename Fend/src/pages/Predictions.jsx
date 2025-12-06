import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './Predictions.css'

// Use environment variable or default to relative path for production
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')

function Predictions() {
  const [formula, setFormula] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [modelInfo, setModelInfo] = useState(null)

  useEffect(() => {
    loadModelInfo()
    loadHistory()
  }, [])

  const loadModelInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/model_info`)
      setModelInfo(response.data)
    } catch (err) {
      console.error('Error loading model info:', err)
    }
  }

  const loadHistory = () => {
    const saved = localStorage.getItem('predictionHistory')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }

  const saveToHistory = (pred) => {
    const newHistory = [pred, ...history].slice(0, 20) // Keep last 20
    setHistory(newHistory)
    localStorage.setItem('predictionHistory', JSON.stringify(newHistory))
  }

  const handlePredict = async (e) => {
    e.preventDefault()
    if (!formula.trim()) {
      setError('Please enter a chemical formula')
      return
    }

    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await axios.post(`${API_BASE}/predict`, {
        formula: formula.trim()
      })
      const pred = response.data
      setPrediction(pred)
      saveToHistory(pred)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to make prediction')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExample = (exampleFormula) => {
    setFormula(exampleFormula)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('predictionHistory')
  }

  // Prepare chart data
  const historyChartData = history.map((h, idx) => ({
    index: idx + 1,
    formula: h.formula.length > 10 ? h.formula.substring(0, 10) + '...' : h.formula,
    bandGap: h.predicted_band_gap
  }))

  const categoryData = [
    { category: 'Optimal (1.1-1.4 eV)', count: history.filter(h => h.is_optimal).length },
    { category: 'Low Gap (<1.0 eV)', count: history.filter(h => h.predicted_band_gap < 1.0).length },
    { category: 'Moderate (1.4-2.0 eV)', count: history.filter(h => h.predicted_band_gap >= 1.4 && h.predicted_band_gap <= 2.0).length },
    { category: 'High Gap (>2.0 eV)', count: history.filter(h => h.predicted_band_gap > 2.0).length }
  ]

  return (
    <div className="predictions-page">
      <div className="page-header">
        <h1>Band Gap Prediction</h1>
        <p>Enter a chemical formula to predict its band gap and solar cell efficiency potential</p>
      </div>

      <div className="prediction-section">
        <div className="prediction-card">
          <h2>Make a Prediction</h2>
          <form onSubmit={handlePredict} className="prediction-form">
            <div className="form-group">
              <label htmlFor="formula">Chemical Formula</label>
              <input
                id="formula"
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., CsPbI3, CH3NH3PbBr3, MAPbCl3"
                className="formula-input"
                disabled={loading}
              />
              <div className="example-formulas">
                <span className="example-label">Examples:</span>
                <button
                  type="button"
                  onClick={() => handleExample('CsPbI3')}
                  className="example-btn"
                >
                  CsPbI3
                </button>
                <button
                  type="button"
                  onClick={() => handleExample('CH3NH3PbBr3')}
                  className="example-btn"
                >
                  CH3NH3PbBr3
                </button>
                <button
                  type="button"
                  onClick={() => handleExample('MAPbCl3')}
                  className="example-btn"
                >
                  MAPbCl3
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Predicting...' : 'Predict Band Gap'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <div className="result-header">
                <h3>Prediction Results</h3>
                <span className={`status-badge ${prediction.is_optimal ? 'optimal' : 'not-optimal'}`}>
                  {prediction.is_optimal ? '⭐ Optimal' : 'Not Optimal'}
                </span>
              </div>

              <div className="result-grid">
                <div className="result-card main-result">
                  <div className="result-label">Predicted Band Gap</div>
                  <div className="result-value">{prediction.predicted_band_gap} eV</div>
                  <div className="confidence-range">
                    Confidence: {prediction.confidence_range.lower.toFixed(3)} - {prediction.confidence_range.upper.toFixed(3)} eV
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-label">Efficiency Category</div>
                  <div className="result-category">{prediction.efficiency_category}</div>
                </div>

                <div className="result-card">
                  <div className="result-label">Formula</div>
                  <div className="result-formula">
                    <code>{prediction.formula}</code>
                  </div>
                </div>
              </div>

              <div className="band-gap-analysis">
                <h4>Band Gap Analysis</h4>
                <div className="analysis-visual">
                  <div className="band-gap-scale">
                    <div className="scale-markers">
                      <span>0</span>
                      <span>1.0</span>
                      <span className="optimal-range">1.1-1.4</span>
                      <span>2.0</span>
                      <span>3.0+</span>
                    </div>
                    <div className="scale-bar">
                      <div className="scale-optimal"></div>
                      <div
                        className="scale-marker"
                        style={{
                          left: `${Math.min(100, (prediction.predicted_band_gap / 3) * 100)}%`
                        }}
                      >
                        <div className="marker-dot"></div>
                        <div className="marker-label">{prediction.predicted_band_gap.toFixed(3)} eV</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-text">
                  {prediction.is_optimal ? (
                    <p className="success-text">
                      ✅ This material falls within the optimal range for solar cell applications! 
                      It should exhibit excellent efficiency potential.
                    </p>
                  ) : prediction.predicted_band_gap < 1.1 ? (
                    <p className="warning-text">
                      ⚠️ This material has a low band gap. While it may absorb more light, 
                      it will produce lower voltage, limiting overall efficiency.
                    </p>
                  ) : (
                    <p className="info-text">
                      ℹ️ This material has a higher band gap. It will produce higher voltage 
                      but may miss portions of the solar spectrum, reducing current output.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h2>Prediction History</h2>
            <button onClick={clearHistory} className="btn btn-secondary">
              Clear History
            </button>
          </div>

          <div className="history-grid">
            <div className="history-chart">
              <h3>Band Gap Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formula" />
                  <YAxis label={{ value: 'Band Gap (eV)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bandGap"
                    stroke={prediction?.is_optimal ? '#10b981' : '#2563eb'}
                    strokeWidth={2}
                    name="Band Gap (eV)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="history-categories">
              <h3>Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="history-table">
            <h3>Recent Predictions</h3>
            <div className="table-container">
              <table className="predictions-table">
                <thead>
                  <tr>
                    <th>Formula</th>
                    <th>Band Gap (eV)</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((h, idx) => (
                    <tr key={idx}>
                      <td><code>{h.formula}</code></td>
                      <td className="bandgap-cell">{h.predicted_band_gap.toFixed(4)}</td>
                      <td>{h.efficiency_category}</td>
                      <td>
                        <span className={`status-badge-small ${h.is_optimal ? 'optimal' : 'not-optimal'}`}>
                          {h.is_optimal ? '⭐ Optimal' : 'Not Optimal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {modelInfo && (
        <div className="model-info-section">
          <h2>Model Information</h2>
          <div className="model-info-grid">
            <div className="info-card">
              <div className="info-label">Algorithm</div>
              <div className="info-value">{modelInfo.training_info.algorithm}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Features Used</div>
              <div className="info-value">{modelInfo.features_used}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Target Metric</div>
              <div className="info-value">{modelInfo.training_info.target_metric}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Optimization</div>
              <div className="info-value">{modelInfo.training_info.optimization}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Predictions

