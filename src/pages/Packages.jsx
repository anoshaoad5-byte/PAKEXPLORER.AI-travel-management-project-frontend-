import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import familyImg from '../assets/family.jpg'
import family2Img from '../assets/family2.jpg'
import honeymoonImg from '../assets/honeymoon.jpg'
import adventureImg from '../assets/adventure.jpg'
import studentImg from '../assets/student.jpg'
import luxuryImg from '../assets/luxury.jpg'
import budgetImg from '../assets/budget.jpg'
import girlsImg from '../assets/girls.jpg'
import hunzaValleyImg from '../assets/hunza-valley.jpg'
import kalashValleyImg from '../assets/kalash-valley.jpg'
import adventure2Img from '../assets/adventure2.jpg'
import honeymoon2Img from '../assets/honeymoon2.jpg'
import luxury2Img from '../assets/luxury2.jpg'
import girls2Img from '../assets/girls2.jpg'
import './NavExtras.css'

const TYPE_IMAGE_POOLS = {
  Family: [familyImg, family2Img],
  Honeymoon: [honeymoonImg, honeymoon2Img],
  Adventure: [adventureImg, adventure2Img, hunzaValleyImg, kalashValleyImg],
  Student: [studentImg],
  Luxury: [luxuryImg, luxury2Img],
  Budget: [budgetImg]
}

const GIRLS_POOL = [girlsImg, girls2Img]

const TYPE_COLORS = {
  Family: { bg: '#e3f2fd', text: '#0d47a1', accent: '#1976d2' },
  Honeymoon: { bg: '#fce4ec', text: '#880e4f', accent: '#d81b60' },
  Adventure: { bg: '#e8f5e9', text: '#1b5e20', accent: '#2e7d32' },
  Student: { bg: '#fff3e0', text: '#e65100', accent: '#f57c00' },
  Luxury: { bg: '#fff8e1', text: '#7a5c00', accent: '#c9a227' },
  Budget: { bg: '#e0f7fa', text: '#006064', accent: '#00838f' }
}

function Packages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [selected, setSelected] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const destinationFilter = searchParams.get('destination')

  const packageTypes = ['All', 'Family', 'Honeymoon', 'Adventure', 'Student', 'Luxury', 'Budget']

  const getTypeImage = (pkg) => {
    if (pkg.title && pkg.title.toLowerCase().includes('girls')) {
      return GIRLS_POOL[pkg.id % GIRLS_POOL.length]
    }
    const pool = TYPE_IMAGE_POOLS[pkg.type] || TYPE_IMAGE_POOLS.Family
    return pool[pkg.id % pool.length]
  }
  const getTypeColors = (type) => TYPE_COLORS[type] || TYPE_COLORS.Family

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeType !== 'All') params.append('type', activeType)
      if (destinationFilter) params.append('destination', destinationFilter)

      // Packages.jsx mein
      const url = `${import.meta.env.VITE_API_URL}/api/packages${params.toString() ? '?' + params.toString() : ''}`
      const response = await axios.get(url)
      setPackages(response.data)
    } catch (err) {
      setError('Could not load packages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [activeType, destinationFilter])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const parseList = (jsonString) => {
    if (!jsonString) return []
    try {
      return JSON.parse(jsonString)
    } catch {
      return []
    }
  }

  const clearDestinationFilter = () => {
    searchParams.delete('destination')
    setSearchParams(searchParams)
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
         <button onClick={() => navigate('/trips')} className="my-trips-btn">My Trips</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content">
        <div className="page-header-actions">
        <h1>Travel Packages</h1>
       </div>
       
        {destinationFilter && (
          <div className="active-filter-banner">
            <span>Showing packages for: <strong>{destinationFilter}</strong></span>
            <button onClick={clearDestinationFilter} className="clear-filter-btn">✕ Clear</button>
          </div>
        )}

        <div className="filter-tabs">
          {packageTypes.map((type) => {
            const colors = type === 'All' ? null : getTypeColors(type)
            return (
              <button
                key={type}
                className={`filter-tab ${activeType === type ? 'active' : ''}`}
                style={
                  activeType === type && colors
                    ? { background: colors.accent, borderColor: colors.accent }
                    : {}
                }
                onClick={() => setActiveType(type)}
              >
                {type}
              </button>
            )
          })}
        </div>

        {loading && <p>Loading packages...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="card-grid">
          {packages.map((p) => {
            const inclusions = parseList(p.inclusions)
            const colors = getTypeColors(p.type)
            const typeImage = getTypeImage(p)

            return (
              <div
                key={p.id}
                className="package-card"
                style={{ borderTop: `4px solid ${colors.accent}` }}
                onClick={() => setSelected(p)}
              >
                <div className="package-image-wrapper">
                  {typeImage ? (
                    <img src={typeImage} alt={p.type} className="destination-image" />
                  ) : (
                    <div
                      className="destination-image type-fallback"
                      style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.text})` }}
                    >
                      <span>{p.type === 'Luxury' ? '💎' : '💰'}</span>
                    </div>
                  )}
                  {p.rating >= 4.7 && <span className="best-seller-badge">🏆 Best Seller</span>}
                  <span className="price-badge" style={{ background: colors.accent }}>
                    Rs. {p.price_per_person.toLocaleString()}
                  </span>
                </div>
                <div className="destination-body">
                  <span className="tag" style={{ background: colors.bg, color: colors.text }}>{p.type}</span>
                  <h3>{p.title}</h3>
                  <p className="location-text">📍 {p.destination} &nbsp;·&nbsp; 🗓️ {p.duration_days} days &nbsp;·&nbsp; 👥 {p.group_size}</p>
                  <p>{p.short_description}</p>

                  {inclusions.length > 0 && (
                    <ul className="inclusions-list">
                      {inclusions.slice(0, 3).map((item, i) => (
                        <li key={i}>✔ {item.replace(/^[✓✔]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}

                  <div className="package-footer">
                    <span className="rating-badge">★ {p.rating}</span>
                    <button
                      className="view-details-btn"
                      style={{ background: colors.accent }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(p)
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && packages.length === 0 && (
          <p>No packages found for this category.</p>
        )}
      </div>

      {selected && (() => {
        const colors = getTypeColors(selected.type)
        const typeImage = getTypeImage(selected)
        return (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>

              {typeImage ? (
                <img src={typeImage} alt={selected.type} className="modal-image" />
              ) : (
                <div
                  className="modal-image type-fallback"
                  style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.text})` }}
                >
                  <span>{selected.type === 'Luxury' ? '💎' : '💰'}</span>
                </div>
              )}

              <div className="modal-info">
                <span className="tag" style={{ background: colors.bg, color: colors.text }}>{selected.type}</span>
                <h2>{selected.title}</h2>
                <p className="location-text">
                  📍 {selected.destination} &nbsp;·&nbsp; 🗓️ {selected.duration_days} days
                  {selected.group_size ? <> &nbsp;·&nbsp; 👥 {selected.group_size}</> : null}
                </p>
                <p className="modal-description">{selected.short_description}</p>

                {parseList(selected.inclusions).length > 0 && (
                  <div className="fact-item">
                    <strong>✔️ Inclusions:</strong>
                    <ul className="inclusions-list">
                      {parseList(selected.inclusions).map((item, i) => (
                        <li key={i}>✔ {item.replace(/^[✓✔]\s*/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.itinerary_summary && (
                  <div className="fact-item">
                    <strong>🗺️ Itinerary:</strong>
                    <p>{selected.itinerary_summary}</p>
                  </div>
                )}

                <div className="package-footer">
                  <p className="budget-text">Rs. {selected.price_per_person.toLocaleString()} / person</p>
                  {selected.rating && <span className="rating-badge">★ {selected.rating}</span>}
                </div>

              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Packages