import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import '../styles/travel-forms.css'
import './PackagePlanner.css'

const TYPE_COLORS = {
  Family: { bg: '#e3f2fd', text: '#0d47a1', accent: '#1976d2' },
  Honeymoon: { bg: '#fce4ec', text: '#880e4f', accent: '#d81b60' },
  Adventure: { bg: '#e8f5e9', text: '#1b5e20', accent: '#2e7d32' },
  Student: { bg: '#fff3e0', text: '#e65100', accent: '#f57c00' },
  Luxury: { bg: '#fff8e1', text: '#7a5c00', accent: '#c9a227' },
  Budget: { bg: '#e0f7fa', text: '#006064', accent: '#00838f' }
}

const PAYMENT_METHODS = [
  { id: 'jazzcash', label: 'JazzCash', icon: '📱' },
  { id: 'easypaisa', label: 'EasyPaisa', icon: '💳' },
  { id: 'cash', label: 'Cash on Arrival', icon: '💵' }
]

function PackagePlanner() {
  const { packageId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [members, setMembers] = useState(2)
  const [travelDate, setTravelDate] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('jazzcash')

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadPackage = async () => {
      try {
        const res = await axios.get(`https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/packages/${packageId}`)
        setPkg(res.data)
      } catch (err) {
        setError('Could not load this package.')
      } finally {
        setLoading(false)
      }
    }
    loadPackage()
  }, [packageId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const parseItinerary = (raw) => {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const colors = pkg ? (TYPE_COLORS[pkg.type] || TYPE_COLORS.Family) : TYPE_COLORS.Family

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess(false)

    if (!fullName || !email || !members || !travelDate) {
      setFormError('Please fill in your name, email, number of travelers, and travel date.')
      return
    }

    setSubmitting(true)
    try {
      await axios.post('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/bookings', {
        full_name: fullName,
        email,
        phone,
        package_id: pkg.id,
        members: Number(members),
        travel_date: travelDate,
        nights: pkg.duration_days,
        notes,
        payment_method: paymentMethod
      })
      setSuccess(true)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not submit your booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="page-content">Loading package...</p>
  if (error) return <p className="page-content error-text">{error}</p>
  if (!pkg) return null

  const itinerary = parseItinerary(pkg.itinerary_days)

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content planner-page">
        <button className="planner-back" onClick={() => navigate(-1)}>← Back to Packages</button>

        <div className="planner-hero" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.text})` }}>
          <span className="tag" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>{pkg.type}</span>
          <h1>{pkg.title}</h1>
          {pkg.vibe_tagline && <p className="planner-vibe">{pkg.vibe_tagline}</p>}
          <p className="planner-meta">
            📍 {pkg.destination} &nbsp;·&nbsp; 🗓️ {pkg.duration_days} days
            {pkg.group_size ? <> &nbsp;·&nbsp; 👥 {pkg.group_size}</> : null}
          </p>
        </div>

        <div className="planner-grid">
          <div className="planner-main">
            <section className="planner-section">
              <h2>🗺️ Day-by-Day Itinerary</h2>
              {itinerary.length > 0 ? (
                <div className="itinerary-list">
                  {itinerary.map((day, i) => (
                    <div key={i} className="itinerary-day" style={{ borderLeft: `4px solid ${colors.accent}` }}>
                      <div className="itinerary-day-number" style={{ background: colors.accent }}>
                        Day {day.day || i + 1}
                      </div>
                      <div className="itinerary-day-content">
                        <h3>{day.title}</h3>
                        <p>{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{pkg.itinerary_summary || 'A detailed itinerary will be shared upon booking confirmation.'}</p>
              )}
            </section>

            <section className="planner-section">
              <h2>ℹ️ Trip Details</h2>
              <div className="planner-facts">
                <div className="fact-item">
                  <strong>📅 Available:</strong>
                  <p>{pkg.available_days || 'Year-round, subject to availability'}</p>
                </div>
                <div className="fact-item">
                  <strong>💰 Price:</strong>
                  <p>Rs. {pkg.price_per_person.toLocaleString()} / person</p>
                </div>
                {pkg.contact_number && (
                  <div className="fact-item">
                    <strong>📞 Contact:</strong>
                    <p>{pkg.contact_number}</p>
                  </div>
                )}
                {pkg.rating && (
                  <div className="fact-item">
                    <strong>⭐ Rating:</strong>
                    <p>{pkg.rating} / 5</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="planner-sidebar">
            <form onSubmit={handleSubmit} className="budget-form planner-form">
              <h2>Plan &amp; Book This Trip</h2>

              {formError && <p className="error-text">{formError}</p>}
              {success && (
                <p className="success-text">
                  Request sent! We'll confirm your {pkg.title} booking by email shortly.
                </p>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Travelers</label>
                  <input type="number" min="1" value={members} onChange={(e) => setMembers(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`payment-option ${paymentMethod === m.id ? 'selected' : ''}`}
                      style={paymentMethod === m.id ? { borderColor: colors.accent, background: colors.bg } : {}}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                      />
                      <span className="payment-icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
                <p className="payment-note">
                  Payment is arranged directly with our team after booking confirmation — no online charge is made here.
                </p>
              </div>

              <button
                type="submit"
                className="view-packages-btn"
                style={{ background: colors.accent }}
                disabled={submitting}
              >
                {submitting ? 'Sending Request...' : `Book This ${pkg.type} Trip`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackagePlanner