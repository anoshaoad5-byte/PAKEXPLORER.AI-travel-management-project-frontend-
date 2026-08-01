import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import '../styles/travel-forms.css'
import './ItineraryGenerator.css'

function ItineraryGenerator() {
  const { destinationId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [days, setDays] = useState(5)
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const generateItinerary = async () => {
    setLoading(true)
    setError('')
    setItinerary(null)
    try {
      const res = await axios.get(
        `https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/itinerary/generate?destination_id=${destinationId}&days=${days}`
      )
      setItinerary(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content itinerary-gen-page">
        <button className="planner-back" onClick={() => navigate(-1)}>← Back</button>

        <div className="itinerary-gen-hero">
          <span className="itinerary-gen-eyebrow">✨ Powered by Vedhi AI</span>
          <h1>Build Your Custom Itinerary</h1>
          <p>Tell us how many days you have, and Vedhi will plan out a day-by-day trip for you.</p>

          <div className="itinerary-gen-controls">
            <label>
              Number of days
              <input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </label>
            <button
              className="view-packages-btn"
              onClick={generateItinerary}
              disabled={loading}
            >
              {loading ? 'Generating...' : '✨ Generate Itinerary'}
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading && (
          <div className="itinerary-gen-loading">
            <p>Vedhi is planning your trip... this can take a few seconds.</p>
          </div>
        )}

        {itinerary && (
          <div className="itinerary-gen-results">
            <h2>🗺️ {itinerary.destination} — {itinerary.days.length}-Day Plan</h2>
            <div className="itinerary-list">
              {itinerary.days.map((day) => (
                <div key={day.day} className="itinerary-day itinerary-day--detailed">
                  <div className="itinerary-day-number">Day {day.day}</div>
                  <div className="itinerary-day-content">
                    <h3>{day.title}</h3>
                    <div className="itinerary-day-slots">
                      <div className="itinerary-slot">
                        <strong>🌅 Morning</strong>
                        <p>{day.morning}</p>
                      </div>
                      <div className="itinerary-slot">
                        <strong>☀️ Afternoon</strong>
                        <p>{day.afternoon}</p>
                      </div>
                      <div className="itinerary-slot">
                        <strong>🌙 Evening</strong>
                        <p>{day.evening}</p>
                      </div>
                    </div>
                    {day.tip && (
                      <p className="itinerary-day-tip">💡 <strong>Tip:</strong> {day.tip}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItineraryGenerator