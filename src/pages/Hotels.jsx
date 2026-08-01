import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import ReviewSection from '../components/ReviewSection'
import '../styles/review-section.css'

function Hotels() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [locationFilter, setLocationFilter] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const fetchHotels = async (location = '') => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/hotels', {
        params: location ? { location } : {}
      })
      setHotels(response.data)
    } catch (err) {
      setError('Could not load hotels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchHotels(locationFilter)
  }

  const openModal = (h) => {
    setSelected(h)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
       <nav className="navbar">
       <h2>PakExplorer AI</h2>
      <NavMenu />
    <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content">
        <h1>🏨 Hotels</h1>

        <form onSubmit={handleFilterSubmit} className="page-header-actions">
          <input
            type="text"
             placeholder="Search by hotel name or location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <button type="submit" className="view-packages-btn">Search</button>
        </form>

        {loading && <p>Loading hotels...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="card-grid">
          {hotels.map((h) => (
            <div key={h.id} className="destination-card" onClick={() => openModal(h)}>
              <img
                src={h.image_url || `https://picsum.photos/seed/hotel${h.id}/400/200`}
                alt={h.name}
                className="destination-image"
              />
              <div className="destination-body">
                <h3>{h.name}</h3>
                <p className="location-text">📍 {h.location}</p>
                {h.description && <p>{h.description}</p>}
                {h.rating != null && <span className="tag">⭐ {h.rating}</span>}
                <p className="budget-text">Rs. {h.price_per_night} / night</p>
              </div>
            </div>
          ))}
        </div>

        {!loading && hotels.length === 0 && (
          <p>No hotels found.</p>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>

            <img
              src={selected.image_url || `https://picsum.photos/seed/hotel${selected.id}/800/400`}
              alt={selected.name}
              className="modal-image"
            />

            <div className="modal-info">
              <h2>{selected.name}</h2>
              <p className="location-text">📍 {selected.location}</p>
              {selected.address && <p className="modal-description">{selected.address}</p>}
              {selected.description && <p className="modal-description">{selected.description}</p>}

              <div className="modal-facts">
                <div className="fact-item">
                  <strong>💰 Price:</strong>
                  <p>Rs. {selected.price_per_night} / night</p>
                </div>
                {selected.rating != null && (
                  <div className="fact-item">
                    <strong>⭐ Rating:</strong>
                    <p>{selected.rating}</p>
                  </div>
                )}
                {selected.rooms_available != null && (
                  <div className="fact-item">
                    <strong>🛏️ Rooms Available:</strong>
                    <p>{selected.rooms_available}</p>
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

              <ReviewSection targetType="hotel" targetId={selected.id} />
              <button
             className="view-packages-btn"
             style={{ marginTop: '1rem' }}
            onClick={() => navigate(`/booking?hotel_id=${selected.id}`)}
                                                                        >
                                   🏨 Book This Hotel
                 </button>

             
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hotels