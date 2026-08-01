import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import './AdminDashboard.css'

const STATUS_FILTERS = ['All', 'pending', 'approved', 'rejected', 'cancelled']

function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [destinations, setDestinations] = useState([])
  const [hotels, setHotels] = useState([])
  const [transports, setTransports] = useState([])
  const [packages, setPackages] = useState([])
  const [activeStatus, setActiveStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [showAddPackage, setShowAddPackage] = useState(false)
  const [packageSubmitting, setPackageSubmitting] = useState(false)
  const [packageFormError, setPackageFormError] = useState('')

  const packageFormTypes = ['Family', 'Honeymoon', 'Adventure', 'Student', 'Luxury', 'Budget']

  const emptyPackageForm = {
    title: '',
    type: 'Family',
    destination: '',
    duration_days: '',
    price_per_person: '',
    group_size: '',
    short_description: '',
    inclusions: '',
    itinerary_summary: '',
    rating: ''
  }

  const [packageFormData, setPackageFormData] = useState(emptyPackageForm)

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const bookingsUrl =
        activeStatus === 'All'
          ? 'https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/bookings'
          : `https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/bookings?status=${activeStatus}`

      const [bookingsRes, destRes, hotelRes, transportRes, packageRes] = await Promise.all([
        axios.get(bookingsUrl),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/destinations'),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/hotels'),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/transports'),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/packages')
      ])

      setBookings(bookingsRes.data)
      setDestinations(destRes.data)
      setHotels(hotelRes.data)
      setTransports(transportRes.data)
      setPackages(packageRes.data)
    } catch (err) {
      setError('Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const findName = (list, id, key = 'name') => {
    if (!id) return null
    const item = list.find((x) => x.id === id)
    return item ? item[key] : null
  }

  const handleApprove = async (id) => {
    setActionId(id)
    try {
      await axios.put(`https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/bookings/${id}/approve`)
      loadAll()
    } catch (err) {
      setError('Could not approve booking.')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    setActionId(id)
    try {
      await axios.put(`https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/bookings/${id}/reject`)
      loadAll()
    } catch (err) {
      setError('Could not reject booking.')
    } finally {
      setActionId(null)
    }
  }
 const statusBadgeClass = (status) => {
  if (status === 'approved') return 'status-badge status-badge--approved'
  if (status === 'rejected') return 'status-badge status-badge--rejected'
  if (status === 'cancelled') return 'status-badge status-badge--cancelled'
  return 'status-badge status-badge--pending'
}

  const handlePackageFormChange = (e) => {
    const { name, value } = e.target
    setPackageFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddPackage = async (e) => {
    e.preventDefault()
    setPackageFormError('')

    if (!packageFormData.title || !packageFormData.destination || !packageFormData.duration_days || !packageFormData.price_per_person || !packageFormData.short_description) {
      setPackageFormError('Please fill in all required fields.')
      return
    }

    setPackageSubmitting(true)
    try {
      const inclusionsArray = packageFormData.inclusions
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      const payload = {
        title: packageFormData.title,
        type: packageFormData.type,
        destination: packageFormData.destination,
        duration_days: parseInt(packageFormData.duration_days, 10),
        price_per_person: parseFloat(packageFormData.price_per_person),
        group_size: packageFormData.group_size,
        short_description: packageFormData.short_description,
        inclusions: JSON.stringify(inclusionsArray),
        itinerary_summary: packageFormData.itinerary_summary,
        rating: packageFormData.rating ? parseFloat(packageFormData.rating) : null
      }

      await axios.post('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/packages', payload)

      setShowAddPackage(false)
      setPackageFormData(emptyPackageForm)
    } catch (err) {
      setPackageFormError(err.response?.data?.error || 'Could not add package. Please try again.')
    } finally {
      setPackageSubmitting(false)
    }
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content admin-page">
        <h1>📋 Booking Requests</h1>

        <div className="admin-page-actions">
          <button className="add-package-btn" onClick={() => {
            setPackageFormError('')
            setPackageFormData(emptyPackageForm)
            setShowAddPackage(true)
          }}>
            + Add Package
          </button>
        </div>

        <div className="filter-tabs">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              className={`filter-tab ${activeStatus === status ? 'active' : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p>Loading bookings...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && bookings.length === 0 && (
          <p>No bookings found for this filter.</p>
        )}

        <div className="admin-bookings-list">
          {bookings.map((b) => {
            const destinationName = findName(destinations, b.destination_id)
            const hotelName = findName(hotels, b.hotel_id)
            const transportName = findName(transports, b.transport_id, 'provider_name')
            const packageName = findName(packages, b.package_id, 'title')

            return (
              <div key={b.id} className="admin-booking-card">
                <div className="admin-booking-header">
                  <div>
                    <h3>{b.full_name}</h3>
                    <p className="admin-booking-contact">{b.email} {b.phone ? `· ${b.phone}` : ''}</p>
                  </div>
                  <span className={statusBadgeClass(b.status)}>{b.status}</span>
                </div>

                <div className="admin-booking-details">
                  {packageName && (
                    <div className="admin-detail-item">
                      <strong>📦 Package:</strong> <span>{packageName}</span>
                    </div>
                  )}
                  {destinationName && (
                    <div className="admin-detail-item">
                      <strong>📍 Destination:</strong> <span>{destinationName}</span>
                    </div>
                  )}
                  {hotelName && (
                    <div className="admin-detail-item">
                      <strong>🏨 Hotel:</strong> <span>{hotelName}</span>
                    </div>
                  )}
                  {transportName && (
                    <div className="admin-detail-item">
                      <strong>🚐 Transport:</strong> <span>{transportName}</span>
                    </div>
                  )}
                  <div className="admin-detail-item">
                    <strong>👥 Travelers:</strong> <span>{b.members}</span>
                  </div>
                  {b.travel_date && (
                    <div className="admin-detail-item">
                      <strong>📅 Travel Date:</strong> <span>{b.travel_date}</span>
                    </div>
                  )}
                  {b.nights && (
                    <div className="admin-detail-item">
                      <strong>🌙 Nights/Days:</strong> <span>{b.nights}</span>
                    </div>
                  )}
                  {b.payment_method && (
                    <div className="admin-detail-item">
                      <strong>💳 Payment:</strong> <span>{b.payment_method}</span>
                    </div>
                  )}
                  {b.notes && (
                    <div className="admin-detail-item admin-detail-item--full">
                      <strong>📝 Notes:</strong> <span>{b.notes}</span>
                    </div>
                  )}
                   <div className="admin-detail-item">
                    <strong>🕒 Submitted:</strong>{' '}
                    <span>{b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</span>
                  </div>
                </div>

                {b.status === 'cancelled' && (
                  <div className="admin-cancel-note">
                    ⚠️ Cancelled by user
                    {b.refund_percentage != null && (
                      <> — <strong>{b.refund_percentage}% refund</strong> applies based on cancellation policy.</>
                    )}
                  </div>
                )}

                {b.status === 'pending' && (
                  <div className="admin-booking-actions">
                    <button
                      className="admin-approve-btn"
                      onClick={() => handleApprove(b.id)}
                      disabled={actionId === b.id}
                    >
                      {actionId === b.id ? 'Working...' : '✔ Approve'}
                    </button>
                    <button
                      className="admin-reject-btn"
                      onClick={() => handleReject(b.id)}
                      disabled={actionId === b.id}
                    >
                      {actionId === b.id ? 'Working...' : '✕ Reject'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showAddPackage && (
        <div className="modal-overlay" onClick={() => setShowAddPackage(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddPackage(false)}>×</button>

            <div className="modal-info">
              <h2>Add New Package</h2>

              {packageFormError && <p className="error-text">{packageFormError}</p>}

              <form onSubmit={handleAddPackage} className="package-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input name="title" value={packageFormData.title} onChange={handlePackageFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Type *</label>
                    <select name="type" value={packageFormData.type} onChange={handlePackageFormChange}>
                      {packageFormTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Destination *</label>
                    <input name="destination" value={packageFormData.destination} onChange={handlePackageFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Duration (days) *</label>
                    <input type="number" name="duration_days" value={packageFormData.duration_days} onChange={handlePackageFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Price per person (Rs.) *</label>
                    <input type="number" name="price_per_person" value={packageFormData.price_per_person} onChange={handlePackageFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Group size</label>
                    <input name="group_size" placeholder="e.g. 2-6 people" value={packageFormData.group_size} onChange={handlePackageFormChange} />
                  </div>

                  <div className="form-group">
                    <label>Rating</label>
                    <input type="number" step="0.1" min="0" max="5" name="rating" value={packageFormData.rating} onChange={handlePackageFormChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Short description *</label>
                  <textarea name="short_description" rows="3" value={packageFormData.short_description} onChange={handlePackageFormChange} required />
                </div>

                <div className="form-group">
                  <label>Inclusions (comma separated)</label>
                  <textarea name="inclusions" rows="2" placeholder="4-star hotel stay, Private transport, Daily breakfast" value={packageFormData.inclusions} onChange={handlePackageFormChange} />
                </div>

                <div className="form-group">
                  <label>Itinerary summary</label>
                  <textarea name="itinerary_summary" rows="3" value={packageFormData.itinerary_summary} onChange={handlePackageFormChange} />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddPackage(false)}>Cancel</button>
                  <button type="submit" className="btn-submit" disabled={packageSubmitting}>
                    {packageSubmitting ? 'Saving...' : 'Save Package'}
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

export default AdminDashboard