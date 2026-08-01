import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import '../styles/travel-forms.css'

function Booking() {
  const [destinations, setDestinations] = useState([])
  const [hotels, setHotels] = useState([])
  const [transports, setTransports] = useState([])
  const [packages, setPackages] = useState([])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [packageId, setPackageId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [hotelId, setHotelId] = useState('')
  const [transportId, setTransportId] = useState('')
  const [members, setMembers] = useState(1)
  const [travelDate, setTravelDate] = useState('')
  const [nights, setNights] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')

  const [budget, setBudget] = useState(null)
  const [budgetLoading, setBudgetLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const loadOptions = async () => {
      const results = await Promise.allSettled([
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/destinations'),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/hotels'),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/transports'),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/packages'),
      ])

      const [destRes, hotelRes, transportRes, packageRes] = results

      if (destRes.status === 'fulfilled') setDestinations(destRes.value.data)
      if (hotelRes.status === 'fulfilled') setHotels(hotelRes.value.data)
      if (transportRes.status === 'fulfilled') setTransports(transportRes.value.data)
      if (packageRes.status === 'fulfilled') setPackages(packageRes.value.data)

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        setError(`Some booking options failed to load (${failed.length} of 4). You can still book with what's available.`)
      }
    }
    loadOptions()
  }, [])

  // Pre-select a hotel when arriving via "Book This Hotel" (?hotel_id=X)
  useEffect(() => {
    const hotelParam = searchParams.get('hotel_id')
    if (hotelParam) {
      setHotelId(hotelParam)
    }
  }, [searchParams])

  // Auto-fill email from the logged-in account so it always matches
  // the account used to view "My Bookings" on the dashboard
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  // Auto-calculate budget whenever a selected package, or the
  // destination/hotel/transport/members/nights combination, changes
  useEffect(() => {
    const selectedPackage = packages.find((p) => String(p.id) === String(packageId))

    if (selectedPackage) {
      setBudget({
        total: selectedPackage.price_per_person * Number(members || 1),
        per_person: selectedPackage.price_per_person,
        breakdown: [
          { category: 'Package', label: selectedPackage.title, amount: selectedPackage.price_per_person * Number(members || 1) }
        ]
      })
      return
    }

    if (!destinationId && !hotelId && !transportId) {
      setBudget(null)
      return
    }

    const calculate = async () => {
      setBudgetLoading(true)
      try {
        const res = await axios.post('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/budget/calculate', {
          hotel_id: hotelId || null,
          transport_id: transportId || null,
          destination_id: destinationId || null,
          members: Number(members || 1),
          nights: Number(nights || 1),
          custom_items: [],
        })
        setBudget(res.data)
      } catch (err) {
        setBudget(null)
      } finally {
        setBudgetLoading(false)
      }
    }
    calculate()
  }, [packageId, destinationId, hotelId, transportId, members, nights, packages])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!fullName || !email || !members) {
      setError('Please fill in your name, email, and number of travelers')
      return
    }

    setSubmitting(true)
    try {
      await axios.post('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/bookings', {
        full_name: fullName,
        email,
        phone,
        package_id: packageId || null,
        destination_id: destinationId || null,
        hotel_id: hotelId || null,
        transport_id: transportId || null,
        members: Number(members),
        travel_date: travelDate,
        nights: Number(nights),
        payment_method: paymentMethod || null,
        total_amount: budget ? budget.total : null,
        notes,
      })
      setSuccess(true)
      setFullName('')
      setPhone('')
      setPackageId('')
      setDestinationId('')
      setHotelId('')
      setTransportId('')
      setMembers(1)
      setTravelDate('')
      setNights(1)
      setPaymentMethod('')
      setNotes('')
      setBudget(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit booking')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content booking-page">
        <h1>🧳 Book Your Trip</h1>

        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} readOnly disabled />
            </div>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Package (optional — pick a ready-made package, or leave blank to build your own below)</label>
            <select value={packageId} onChange={(e) => setPackageId(e.target.value)}>
              <option value="">-- None / Custom Trip --</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.type}) - Rs. {p.price_per_person.toLocaleString()}/person
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Destination</label>
            <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
              <option value="">-- None --</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.city || d.province})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hotel</label>
            <select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
              <option value="">-- None --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name} - Rs. {h.price_per_night}/night</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Transportation</label>
            <select value={transportId} onChange={(e) => setTransportId(e.target.value)}>
              <option value="">-- None --</option>
              {transports.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.provider_name} ({t.from_city} → {t.to_city}) - Rs. {t.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Travelers</label>
              <input type="number" min="1" value={members} onChange={(e) => setMembers(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nights</label>
              <input type="number" min="1" value={nights} onChange={(e) => setNights(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Travel Date</label>
            <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" />
          </div>

          {budgetLoading && <p>Calculating budget…</p>}
          {budget && (
            <div className="budget-result">
              <h2>Estimated Total: Rs. {Math.round(budget.total).toLocaleString()}</h2>
              {budget.per_person && (
                <p>Per person: Rs. {Math.round(budget.per_person).toLocaleString()}</p>
              )}
              {budget.breakdown && (
                <div className="budget-breakdown">
                  {budget.breakdown.map((item, i) => (
                    <div className="breakdown-row" key={i}>
                      <span>{item.category}: {item.label}</span>
                      <span>Rs. {Math.round(item.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="view-packages-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
        {success && (
          <p className="success-text">
            Booking request submitted! You'll receive a confirmation email once it's approved.
          </p>
        )}
      </div>
    </div>
  )
}

export default Booking