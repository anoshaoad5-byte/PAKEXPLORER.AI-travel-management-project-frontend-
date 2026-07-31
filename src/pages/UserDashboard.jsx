import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import './UserDashboard.css'

const HELPLINE = {
  phone: '0331-9042709',
  whatsapp: '923319042709',
  hours: 'Everyday, 9:00 AM – 9:00 PM PKT',
  email: 'support@pakexplorer.ai'
}

function calcRefund(travelDate) {
  if (!travelDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const trip = new Date(travelDate)
  trip.setHours(0, 0, 0, 0)

  const daysUntil = Math.ceil((trip - today) / (1000 * 60 * 60 * 24))

  let percentage = 0
  if (daysUntil >= 10) percentage = 100
  else if (daysUntil >= 5) percentage = 50
  else percentage = 0

  return { daysUntil, percentage }
}

function UserDashboard() {
  const [bookings, setBookings] = useState([])
  const [destinations, setDestinations] = useState([])
  const [packages, setPackages] = useState([])
  const [hotels, setHotels] = useState([])
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelingId, setCancelingId] = useState(null)
  const [sendingTicketId, setSendingTicketId] = useState(null)
  const [ticketSentId, setTicketSentId] = useState(null)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [bookingsRes, destRes, packageRes, hotelRes, transportRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/bookings'),
        axios.get('http://127.0.0.1:5000/api/destinations'),
        axios.get('http://127.0.0.1:5000/api/packages'),
        axios.get('http://127.0.0.1:5000/api/hotels'),
        axios.get('http://127.0.0.1:5000/api/transports')
      ])

      const myEmail = (user?.email || '').toLowerCase()
      const mine = bookingsRes.data.filter(
        (b) => (b.email || '').toLowerCase() === myEmail
      )

      setBookings(mine)
      setDestinations(destRes.data)
      setPackages(packageRes.data)
      setHotels(hotelRes.data)
      setTransports(transportRes.data)
    } catch (err) {
      setError('Could not load your bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const findName = (list, id, key = 'name') => {
    if (!id) return null
    const item = list.find((x) => x.id === id)
    return item ? item[key] : null
  }

  const findDestination = (id) => {
    if (!id) return null
    return destinations.find((d) => d.id === id) || null
  }

  const handleSendTicket = async (bookingId) => {
    setSendingTicketId(bookingId)
    setTicketSentId(null)
    try {
      const res = await axios.post(`http://127.0.0.1:5000/api/bookings/${bookingId}/send-ticket`)
      if (res.data.email_sent) {
        setTicketSentId(bookingId)
      } else {
        setError('Ticket email could not be sent. Please try again later.')
      }
    } catch (err) {
      setError('Could not send ticket email.')
    } finally {
      setSendingTicketId(null)
    }
  }

  const statusBadgeClass = (status) => {
    if (status === 'approved') return 'status-badge status-badge--approved'
    if (status === 'rejected') return 'status-badge status-badge--rejected'
    if (status === 'cancelled') return 'status-badge status-badge--cancelled'
    return 'status-badge status-badge--pending'
  }

  const handleCancel = async (booking) => {
    const refundInfo = calcRefund(booking.travel_date)
    const percentage = refundInfo ? refundInfo.percentage : 0

    const confirmed = window.confirm(
      `Cancel this booking?\n\nBased on your travel date, you're eligible for a ${percentage}% refund.\n\nThis cannot be undone.`
    )
    if (!confirmed) return

    setCancelingId(booking.id)
    try {
      await axios.put(`http://127.0.0.1:5000/api/bookings/${booking.id}/cancel`, {
        refund_percentage: percentage
      })
      loadData()
    } catch (err) {
      setError('Could not cancel booking. Please try again.')
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content user-dash-page">
        <h1>👋 Welcome back{user?.full_name ? `, ${user.full_name}` : ''}</h1>

        <div className="user-dash-quicklinks">
          <button onClick={() => navigate('/destinations')} className="quicklink-card">
            🗺️ Explore Destinations
          </button>
          <button onClick={() => navigate('/packages')} className="quicklink-card">
            🎁 Browse Packages
          </button>
          <button onClick={() => navigate('/trips')} className="quicklink-card">
            📸 My Trips & Memories
          </button>
        </div>

        <div className="policy-card">
          <h3>📜 Cancellation & Refund Policy</h3>
          <ul>
            <li><strong>100% refund</strong> — cancel 10 or more days before your trip</li>
            <li><strong>50% refund</strong> — cancel 5–9 days before your trip</li>
            <li><strong>No refund</strong> — cancel less than 5 days before your trip</li>
          </ul>
        </div>

        <div className="helpline-card">
          <h3>📞 Need Help?</h3>
          <div className="helpline-grid">
            <div><strong>Phone:</strong> {HELPLINE.phone}</div>
            <div><strong>WhatsApp:</strong> +{HELPLINE.whatsapp}</div>
            <div><strong>Hours:</strong> {HELPLINE.hours}</div>
            <div><strong>Email:</strong> {HELPLINE.email}</div>
          </div>
        </div>

        <h2 className="user-dash-section-title">📋 My Bookings</h2>

        {loading && <p>Loading your bookings...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && bookings.length === 0 && (
          <p className="user-dash-empty">
            You haven't made any bookings yet. Browse{' '}
            <span className="user-dash-link" onClick={() => navigate('/packages')}>packages</span>{' '}
            to get started.
          </p>
        )}

        <div className="user-dash-bookings-list">
          {bookings.map((b) => {
            const destinationName = findName(destinations, b.destination_id)
            const destinationObj = findDestination(b.destination_id)
            const packageName = findName(packages, b.package_id, 'title')
            const hotelName = findName(hotels, b.hotel_id)
            const transportName = findName(transports, b.transport_id, 'provider_name')
            const refundInfo = calcRefund(b.travel_date)
            const canCancel = b.status === 'pending' || b.status === 'approved'

            return (
              <div key={b.id} className="user-booking-card">
                <div className="user-booking-header">
                  <h3>{packageName || destinationName || 'Trip Booking'}</h3>
                  <span className={statusBadgeClass(b.status)}>{b.status}</span>
                </div>

                {b.status === 'approved' && (
                  <p className="user-booking-id">
                    ✅ Confirmed Booking ID: <strong>#{b.id}</strong>
                  </p>
                )}

                {b.status === 'approved' && (
                  <div className="booking-ticket">
                    <div className="booking-ticket__header">
                      <span>🎫 Your Ticket</span>
                      <span>#{b.id}</span>
                    </div>
                    <div className="booking-ticket__row"><span>Destination</span><span>{destinationName || '—'}</span></div>
                    {packageName && <div className="booking-ticket__row"><span>Package</span><span>{packageName}</span></div>}
                    {hotelName && <div className="booking-ticket__row"><span>Hotel</span><span>{hotelName}</span></div>}
                    {transportName && <div className="booking-ticket__row"><span>Transport</span><span>{transportName}</span></div>}
                    <div className="booking-ticket__row"><span>Travelers</span><span>{b.members}</span></div>
                    {b.travel_date && <div className="booking-ticket__row"><span>Travel Date</span><span>{b.travel_date}</span></div>}
                    {b.nights && <div className="booking-ticket__row"><span>Nights</span><span>{b.nights}</span></div>}
                    {b.payment_method && <div className="booking-ticket__row"><span>Payment</span><span>{b.payment_method}</span></div>}
                    {b.total_amount != null && (
                      <div className="booking-ticket__row"><span>Total</span><span>Rs. {Math.round(b.total_amount).toLocaleString()}</span></div>
                    )}
                  </div>
                )}

                {b.status === 'approved' && destinationObj && (
                  <div className="booking-checklist">
                    <div className="booking-checklist__header">📋 Pre-Trip Checklist</div>
                    {destinationObj.best_time_to_visit && (
                      <div className="booking-checklist__row">
                        <strong>Best time to visit:</strong> <span>{destinationObj.best_time_to_visit}</span>
                      </div>
                    )}
                    {destinationObj.required_documents && (
                      <div className="booking-checklist__row">
                        <strong>Documents needed:</strong>
                        <ul className="booking-checklist__list">
                          {destinationObj.required_documents.split(',').map((doc, i) => (
                            doc.trim() && <li key={i}>{doc.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {destinationObj.included_activities && (
                      <div className="booking-checklist__row">
                        <strong>✅ Included:</strong>
                        <ul className="booking-checklist__list">
                          {destinationObj.included_activities.split(',').map((item, i) => (
                            item.trim() && <li key={i}>{item.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {destinationObj.excluded_activities && (
                      <div className="booking-checklist__row">
                        <strong>❌ Not Included:</strong>
                        <ul className="booking-checklist__list">
                          {destinationObj.excluded_activities.split(',').map((item, i) => (
                            item.trim() && <li key={i}>{item.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {destinationObj.policy_notes && (
                      <div className="booking-checklist__row">
                        <strong>Destination policy:</strong> <span>{destinationObj.policy_notes}</span>
                      </div>
                    )}
                    <div className="booking-checklist__row">
                      <strong>Standard terms:</strong>{' '}
                      <span>Valid CNIC required; Nikah Nama required for couples where applicable. See our full cancellation policy above.</span>
                    </div>
                  </div>
                )}

                {b.status === 'approved' && (
                  <button
                    className="save-ticket-btn"
                    onClick={() => handleSendTicket(b.id)}
                    disabled={sendingTicketId === b.id}
                  >
                    {sendingTicketId === b.id
                      ? 'Sending...'
                      : ticketSentId === b.id
                      ? '✅ Sent to your email'
                      : '📧 Save & Email Ticket'}
                  </button>
                )}

                <div className="user-booking-meta">
                  {b.travel_date && <span>📅 {b.travel_date}</span>}
                  <span>👥 {b.members} traveler{b.members > 1 ? 's' : ''}</span>
                  {b.payment_method && <span>💳 {b.payment_method}</span>}
                </div>

                {b.status === 'pending' && (
                  <p className="user-booking-note">
                    Your request is awaiting admin approval. You'll get an email once it's confirmed.
                  </p>
                )}
                {b.status === 'approved' && (
                  <p className="user-booking-note user-booking-note--approved">
                    🎉 Confirmed! Check your email for details. Contact our helpline above if you have questions.
                  </p>
                )}
                {b.status === 'rejected' && (
                  <p className="user-booking-note user-booking-note--rejected">
                    This request wasn't approved. Feel free to submit a new one.
                  </p>
                )}
                {b.status === 'cancelled' && (
                  <p className="user-booking-note user-booking-note--cancelled">
                    Cancelled{b.refund_percentage != null ? ` — ${b.refund_percentage}% refund applies` : ''}.
                  </p>
                )}

                {canCancel && refundInfo && (
                  <div className="cancel-section">
                    <p className="cancel-refund-hint">
                      Cancel now → <strong>{refundInfo.percentage}% refund</strong>{' '}
                      ({refundInfo.daysUntil >= 0 ? `${refundInfo.daysUntil} days until trip` : 'trip date has passed'})
                    </p>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(b)}
                      disabled={cancelingId === b.id}
                    >
                      {cancelingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard