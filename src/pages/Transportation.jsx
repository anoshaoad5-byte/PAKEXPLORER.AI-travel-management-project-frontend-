import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'

function Transportation() {
  const [transports, setTransports] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const fetchCities = async () => {
    try {
      const response = await axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/transports/cities')
      setCities(response.data)
    } catch (err) {
      // Non-fatal: search still works without suggestions
    }
  }

  const fetchTransports = async (from = '', to = '') => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (from) params.from_city = from
      if (to) params.to_city = to
      const response = await axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/transports', { params })
      setTransports(response.data)
    } catch (err) {
      setError('Could not load transportation options')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransports()
    fetchCities()
  }, [])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchTransports(fromCity, toCity)
  }

  const openModal = (t) => setSelected(t)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const typeIcon = (type) => {
    if (!type) return '🚗'
    const t = type.toLowerCase()
    if (t.includes('bus')) return '🚌'
    if (t.includes('flight')) return '✈️'
    if (t.includes('train')) return '🚆'
    if (t.includes('car')) return '🚗'
    return '🚗'
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content">
        <h1>🚌 Transportation</h1>

        <form onSubmit={handleFilterSubmit} className="page-header-actions">
          <input
            type="text"
            placeholder="From city"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            list="city-suggestions"
          />
          <input
            type="text"
            placeholder="To city"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            list="city-suggestions"
          />
          <datalist id="city-suggestions">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <button type="submit" className="view-packages-btn">Search</button>
        </form>

        {loading && <p>Loading transportation options...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="card-grid">
          {transports.map((t) => (
            <div key={t.id} className="destination-card" onClick={() => openModal(t)}>
              <img
                src={t.image_url || `https://picsum.photos/seed/transport${t.id}/400/200`}
                alt={t.provider_name}
                className="destination-image"
              />
              <div className="destination-body">
                <h3>{typeIcon(t.type)} {t.provider_name}</h3>
                <p className="location-text">{t.from_city} → {t.to_city}</p>
                {t.departure_time && <p>Departs: {t.departure_time}</p>}
                {t.rating != null && <span className="tag">⭐ {t.rating}</span>}
                <p className="budget-text">Rs. {t.price}</p>
              </div>
            </div>
          ))}
        </div>

        {!loading && transports.length === 0 && (
          <p>No transportation options found.</p>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>

            <img
              src={selected.image_url || `https://picsum.photos/seed/transport${selected.id}/800/400`}
              alt={selected.provider_name}
              className="modal-image"
            />

            <div className="modal-info">
              <h2>{typeIcon(selected.type)} {selected.provider_name}</h2>
              <p className="location-text">{selected.from_city} → {selected.to_city}</p>

              <div className="modal-facts">
                <div className="fact-item">
                  <strong>💰 Price:</strong>
                  <p>Rs. {selected.price}</p>
                </div>
                {selected.departure_time && (
                  <div className="fact-item">
                    <strong>🕐 Departure:</strong>
                    <p>{selected.departure_time}</p>
                  </div>
                )}
                {selected.arrival_time && (
                  <div className="fact-item">
                    <strong>🕐 Arrival:</strong>
                    <p>{selected.arrival_time}</p>
                  </div>
                )}
                {selected.rating != null && (
                  <div className="fact-item">
                    <strong>⭐ Rating:</strong>
                    <p>{selected.rating}</p>
                  </div>
                )}
                {selected.seats_available != null && (
                  <div className="fact-item">
                    <strong>💺 Seats Available:</strong>
                    <p>{selected.seats_available}</p>
                  </div>
                )}
                {selected.amenities && selected.amenities.length > 0 && (
                  <div className="fact-item">
                    <strong>✨ Amenities:</strong>
                    <p>{selected.amenities.join(', ')}</p>
                  </div>
                )}
                {selected.contact_number && (
                  <div className="fact-item">
                    <strong>📞 Contact:</strong>
                    <p>{selected.contact_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transportation