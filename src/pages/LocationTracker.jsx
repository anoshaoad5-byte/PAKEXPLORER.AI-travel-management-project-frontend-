import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import '../styles/travel-forms.css'

function LocationTracker() {
  const [status, setStatus] = useState('idle') // idle | locating | updating | loaded | error
  const [error, setError] = useState('')
  const [coords, setCoords] = useState(null)
  const [nearby, setNearby] = useState([])

  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const findNearby = () => {
    setError('')
    setStatus('locating')

    if (!navigator.geolocation) {
      setError('Your browser does not support location services')
      setStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        setStatus('updating')

        try {
          await axios.post(
            'http://127.0.0.1:5000/location/update',
            { latitude, longitude },
            authHeaders
          )

          const response = await axios.get(
            'http://127.0.0.1:5000/location/nearby',
            authHeaders
          )
          setNearby(response.data)
          setStatus('loaded')
        } catch (err) {
          setError(err.response?.data?.error || 'Could not fetch nearby destinations')
          setStatus('error')
        }
      },
      (geoErr) => {
        setError('Location permission denied. Please allow location access and try again.')
        setStatus('error')
      }
    )
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content location-page">
        <h1>📍 Nearby Destinations</h1>

        {status === 'idle' && (
          <button onClick={findNearby} className="view-packages-btn" style={{ maxWidth: '280px' }}>
            Use My Location
          </button>
        )}

        {(status === 'locating' || status === 'updating') && (
          <p>{status === 'locating' ? 'Getting your location...' : 'Finding nearby destinations...'}</p>
        )}

        {error && (
          <div>
            <p className="error-text">{error}</p>
            <button onClick={findNearby} className="view-packages-btn" style={{ maxWidth: '280px' }}>
              Try Again
            </button>
          </div>
        )}

        {status === 'loaded' && (
          <>
            {coords && (
              <p style={{ color: '#5B6478', marginBottom: '20px' }}>
                Showing destinations near your current location.
              </p>
            )}

            {nearby.length === 0 ? (
              <p>No destinations found nearby.</p>
            ) : (
              <div className="card-grid">
                {nearby.map((d) => (
                  <div key={d.id} className="destination-card">
                    <div className="destination-body">
                      <h3>{d.name}</h3>
                      <p className="location-text">{d.city || d.province}</p>
                      <span className="tag">📍 {d.distance_km} km away</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={findNearby} className="view-packages-btn" style={{ maxWidth: '280px', marginTop: '20px' }}>
              Refresh Location
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default LocationTracker