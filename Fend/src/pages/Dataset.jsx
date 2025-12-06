import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Dataset.css'

const API_BASE = 'http://localhost:8000'

function Dataset() {
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(50)

  useEffect(() => {
    fetchDataset()
  }, [currentPage])

  const fetchDataset = async () => {
    try {
      setLoading(true)
      const offset = currentPage * pageSize
      const response = await axios.get(`${API_BASE}/dataset`, {
        params: { limit: pageSize, offset }
      })
      setDataset(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dataset')
      console.error('Error fetching dataset:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !dataset) {
    return (
      <div className="dataset-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dataset...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dataset-page">
        <div className="error-container">
          <h2>Error Loading Dataset</h2>
          <p>{error}</p>
          <button onClick={fetchDataset} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalPages = dataset ? Math.ceil(dataset.total_records / pageSize) : 0

  return (
    <div className="dataset-page">
      <div className="page-header">
        <h1>Dataset Overview</h1>
        <p>Explore the materials dataset used for training the band gap prediction model</p>
      </div>

      {dataset?.statistics && (
        <div className="statistics-section">
          <h2>Dataset Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{dataset.statistics.total_materials.toLocaleString()}</div>
              <div className="stat-label">Total Materials</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{dataset.statistics.mean_band_gap.toFixed(3)} eV</div>
              <div className="stat-label">Mean Band Gap</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{dataset.statistics.min_band_gap.toFixed(3)} eV</div>
              <div className="stat-label">Minimum Band Gap</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{dataset.statistics.max_band_gap.toFixed(3)} eV</div>
              <div className="stat-label">Maximum Band Gap</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{dataset.statistics.optimal_count}</div>
              <div className="stat-label">Optimal Materials (1.1-1.4 eV)</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{dataset.statistics.std_band_gap.toFixed(3)} eV</div>
              <div className="stat-label">Standard Deviation</div>
            </div>
          </div>
        </div>
      )}

      <div className="dataset-table-section">
        <h2>Material Samples</h2>
        <div className="table-container">
          <table className="dataset-table">
            <thead>
              <tr>
                <th>Material ID</th>
                <th>Formula</th>
                <th>Band Gap (eV)</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {dataset?.sample_data?.map((material, index) => {
                const bg = material.band_gap
                let category = ''
                let categoryClass = ''
                
                if (bg < 0.1) {
                  category = 'Metal'
                  categoryClass = 'metal'
                } else if (bg < 1.0) {
                  category = 'Low Gap'
                  categoryClass = 'low'
                } else if (bg <= 1.4) {
                  category = 'Optimal ⭐'
                  categoryClass = 'optimal'
                } else if (bg <= 2.0) {
                  category = 'Moderate'
                  categoryClass = 'moderate'
                } else {
                  category = 'High Gap'
                  categoryClass = 'high'
                }

                return (
                  <tr key={index}>
                    <td>{material.material_id}</td>
                    <td className="formula-cell">
                      <code>{material.formula}</code>
                    </td>
                    <td className="bandgap-cell">
                      <span className="bandgap-value">{bg.toFixed(4)}</span>
                    </td>
                    <td>
                      <span className={`category-badge ${categoryClass}`}>
                        {category}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="dataset-info">
        <h3>Dataset Information</h3>
        <p>
          This dataset contains semiconductor materials with band gaps greater than 0.1 eV. 
          Metals (band gap ≈ 0) have been filtered out as they are not suitable for solar cell applications.
          The dataset includes various perovskite and other semiconductor crystal structures.
        </p>
        <p>
          <strong>Note:</strong> Only materials with band gaps above 0.1 eV are shown, 
          as these are the materials relevant for semiconductor applications.
        </p>
      </div>
    </div>
  )
}

export default Dataset

