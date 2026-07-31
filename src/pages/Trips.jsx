import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import memoryPhoto3 from '../assets/memories/chitral-kalash-valley.jpg'
import memoryPhotoHunza from '../assets/memories/hunza-valley-family.jpg'
import memoryPhotoNaran from '../assets/memories/naran-weekend-family.jpg'
import memoryPhotoSwat from '../assets/memories/swat-trekkers-family.jpg'
import memoryVideoLahore from '../assets/memories/lahore-food-trail.mp4'
import NavMenu from '../components/NavMenu'
import ReviewSection from '../components/ReviewSection'
import '../styles/review-section.css'

const STATUS_COLORS = {
  Planned: { bg: '#e3f2fd', text: '#0d47a1', accent: '#1976d2' },
  Ongoing: { bg: '#fff3e0', text: '#e65100', accent: '#f57c00' },
  Completed: { bg: '#e8f5e9', text: '#1b5e20', accent: '#2e7d32' },
  Cancelled: { bg: '#fdecea', text: '#7f1d1d', accent: '#c62828' }
}

const API_BASE = 'http://127.0.0.1:5000/api'

function Trips() {
  const [trips, setTrips] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [playingVideo, setPlayingVideo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const { logout, token } = useAuth()
  const navigate = useNavigate()

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const statusOptions = ['All', 'Planned', 'Ongoing', 'Completed', 'Cancelled']
  const formStatuses = statusOptions.filter((s) => s !== 'All')

  const emptyForm = {
    destination_id: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    status: 'Planned'
  }

  const [formData, setFormData] = useState(emptyForm)

  const getStatusColors = (status) => STATUS_COLORS[status] || STATUS_COLORS.Planned

  const getDestination = (destinationId) =>
    destinations.find((d) => d.id === destinationId)

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/destinations`)
      setDestinations(response.data)
    } catch (err) {
      // Non-fatal: trips can still render with a fallback label if this fails
    }
  }

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/trips`, authHeaders)
      const all = response.data
      const filtered = activeStatus === 'All' ? all : all.filter((t) => t.status === activeStatus)
      setTrips(filtered)
      setError('')
    } catch (err) {
      setError('Could not load trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  useEffect(() => {
    if (token) fetchTrips()
  }, [activeStatus, token])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddForm = () => {
    setFormError('')
    setFormData(emptyForm)
    setEditingId(null)
    setShowAddForm(true)
  }

  const openEditForm = (trip) => {
    setFormError('')
    setFormData({
      destination_id: trip.destination_id || '',
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      total_budget: trip.total_budget ?? '',
      status: trip.status || 'Planned'
    })
    setEditingId(trip.id)
    setSelected(null)
    setShowAddForm(true)
  }

  const handleSaveTrip = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.destination_id || !formData.start_date || !formData.end_date) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (formData.end_date < formData.start_date) {
      setFormError('End date cannot be before start date.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        destination_id: parseInt(formData.destination_id, 10),
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null,
        status: formData.status
      }

      if (editingId) {
        await axios.put(`${API_BASE}/trips/${editingId}`, payload, authHeaders)
      } else {
        await axios.post(`${API_BASE}/trips`, payload, authHeaders)
      }

      setShowAddForm(false)
      setFormData(emptyForm)
      setEditingId(null)
      fetchTrips()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not save trip. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return
    try {
      await axios.delete(`${API_BASE}/trips/${id}`, authHeaders)
      setSelected(null)
      fetchTrips()
    } catch (err) {
      setError('Could not delete trip')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d)) return dateStr
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const tripDuration = (start, end) => {
    if (!start || !end) return null
    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s) || isNaN(e)) return null
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
    return days > 0 ? days : null
  }

  return (
    <div>
        <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>
     <div className="page-content">
      
        <div className="page-header-actions">
          <h1 className="trips-heading">My Trips</h1>
          <button className="add-package-btn" onClick={openAddForm}>
            + Plan New Trip
          </button>
        </div>

        <div className="trip-status-tabs">
          {statusOptions.map((status) => {
            const colors = status === 'All' ? null : getStatusColors(status)
            return (
              <button
                key={status}
                className={`trip-status-tab ${activeStatus === status ? 'active' : ''}`}
                style={activeStatus === status && colors ? { color: colors.accent } : {}}
                onClick={() => setActiveStatus(status)}
              >
                {colors && (
                  <span className="status-dot" style={{ background: colors.accent }}></span>
                )}
                {status}
              </button>
            )
          })}
        </div>

        {loading && <p>Loading trips...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && trips.length > 0 && (
          <div className="trip-grid">
            {trips.map((t) => {
              const colors = getStatusColors(t.status)
              const days = tripDuration(t.start_date, t.end_date)
              const dest = getDestination(t.destination_id)

              return (
                <div key={t.id} className="trip-ticket" onClick={() => setSelected(t)}>
                  <div className="trip-ticket-image">
                    <img
                      src={dest?.image || `https://picsum.photos/seed/${t.destination_id}/400/200`}
                      alt={dest ? dest.name : 'Destination'}
                    />
                    <span className="trip-stamp" style={{ color: colors.accent }}>
                      {t.status}
                    </span>
                  </div>

                  <div className="trip-ticket-perforation"></div>

                  <div className="trip-ticket-body">
                    <h3>{dest ? dest.name : `Destination #${t.destination_id}`}</h3>
                    <p className="trip-route">
                      {dest ? `${dest.city}, ${dest.province}` : 'Location TBD'}
                    </p>

                    <div className="trip-stub">
                      <div className="trip-stub-item">
                        <span>Depart</span>
                        <strong>{formatDate(t.start_date)}</strong>
                      </div>
                      <div className="trip-stub-item">
                        <span>Return</span>
                        <strong>{formatDate(t.end_date)}</strong>
                      </div>
                      {days && (
                        <div className="trip-stub-item">
                          <span>Duration</span>
                          <strong>{days}d</strong>
                        </div>
                      )}
                    </div>

                    {t.total_budget != null && t.total_budget !== '' && (
                      <p className="trip-budget">Rs. {Number(t.total_budget).toLocaleString()}</p>
                    )}

                    <button
                      className="trip-view-btn"
                      style={{ background: colors.accent }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(t)
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="trip-empty">
            <div className="trip-empty-icon">🧭</div>
            <h3>Your passport's still empty</h3>
            <p>Plan your first trip across Pakistan and it'll show up here as a ticket, ready to go.</p>
            <button className="add-package-btn" onClick={openAddForm}>
              + Plan New Trip
            </button>
          </div>
        )}

        <div className="memories-section">
          <div className="memories-header">
            <h2>Travel Memories</h2>
            <p>Moments from families who explored with us</p>
          </div>

          <div className="memories-strip">
            <div className="memory-card">
              <img className="memory-media" src={memoryPhotoHunza} alt="Family at Hunza Valley" />
              <div className="memory-caption">The Khans in Hunza Valley 🏔️</div>
            </div>

            <div className="memory-card">
              <img className="memory-media" src={memoryPhoto3} alt="Chitral and Kalash Valley honeymoon tour" />
              <div className="memory-caption">Honeymoon in Chitral & Kalash Valley 💚</div>
            </div>

            <div className="memory-card">
              <img className="memory-media" src={memoryPhotoNaran} alt="Family at Naran" />
              <div className="memory-caption">A weekend in Naran with the kids</div>
            </div>

            <div
              className="memory-card memory-play-badge"
              onClick={() => setPlayingVideo({
                src: memoryVideoLahore,
                caption: 'Lahore food trail'
              })}
            >
              <video className="memory-media" src={memoryVideoLahore} muted preload="metadata" />
              <div className="memory-caption">Watch: Lahore food trail 🎥</div>
            </div>

            <div className="memory-card">
              <img className="memory-media" src={memoryPhotoSwat} alt="Family at Swat" />
              <div className="memory-caption">First-time trekkers in Swat</div>
            </div>
          </div>
        </div>
      </div>

      {playingVideo && (
        <div className="modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPlayingVideo(null)}>×</button>
            <video
              className="video-modal-player"
              src={playingVideo.src}
              controls
              autoPlay
            />
            <div className="video-modal-caption">{playingVideo.caption}</div>
          </div>
        </div>
      )}

      {selected && (() => {
        const colors = getStatusColors(selected.status)
        const days = tripDuration(selected.start_date, selected.end_date)
        const dest = getDestination(selected.destination_id)
        return (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>

              {dest?.image && (
                <img src={dest.image} alt={dest.name} className="modal-image" />
              )}

              <div className="modal-info">
                <span className="tag" style={{ background: colors.bg, color: colors.text }}>{selected.status}</span>
                <h2>{dest ? dest.name : `Destination #${selected.destination_id}`}</h2>
                <p className="location-text">
                  {days ? <>🗓️ {days} days</> : null}
                </p>
                <p className="location-text">
                  {formatDate(selected.start_date)} → {formatDate(selected.end_date)}
                </p>

                <div className="package-footer">
                  {selected.total_budget != null && selected.total_budget !== '' && (
                    <p className="budget-text">Rs. {Number(selected.total_budget).toLocaleString()} budget</p>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => handleDeleteTrip(selected.id)}>
                    Delete Trip
                  </button>
                  <button type="button" className="btn-submit" onClick={() => openEditForm(selected)}>
                    Edit Trip
                  </button>
                </div>

                <ReviewSection targetType="trip" targetId={selected.id} />
              </div>
            </div>
          </div>
        )
      })()}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>

            <div className="modal-info">
              <h2>{editingId ? 'Edit Trip' : 'Plan New Trip'}</h2>

              {formError && <p className="error-text">{formError}</p>}

              <form onSubmit={handleSaveTrip} className="package-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Destination *</label>
                    <select name="destination_id" value={formData.destination_id} onChange={handleFormChange} required>
                      <option value="">Select a destination</option>
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Start date *</label>
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>End date *</label>
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Total budget (Rs.)</label>
                    <input type="number" name="total_budget" value={formData.total_budget} onChange={handleFormChange} />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleFormChange}>
                      {formStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Saving...' : editingId ? 'Update Trip' : 'Save Trip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trips