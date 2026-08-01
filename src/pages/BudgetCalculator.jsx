import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import '../styles/travel-forms.css'
import './BudgetCalculatorFix.css'

function BudgetCalculator() {
  const [hotels, setHotels] = useState([])
  const [transports, setTransports] = useState([])
  const [destinations, setDestinations] = useState([])

  const [hotelId, setHotelId] = useState('')
  const [transportId, setTransportId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [members, setMembers] = useState(1)
  const [nights, setNights] = useState(1)
  const [customItems, setCustomItems] = useState([{ name: '', amount: '' }])

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [hotelsRes, transportsRes, destinationsRes] = await Promise.all([
          axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/hotels'),
          axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/transports'),
          axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/destinations'),
        ])
        setHotels(hotelsRes.data)
        setTransports(transportsRes.data)
        setDestinations(destinationsRes.data)
      } catch (err) {
        setError('Could not load hotel/transport/destination options')
      }
    }
    loadOptions()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const addCustomItem = () => {
    setCustomItems([...customItems, { name: '', amount: '' }])
  }

  const removeCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index))
  }

  const updateCustomItem = (index, field, value) => {
    const updated = [...customItems]
    updated[index][field] = value
    setCustomItems(updated)
  }

  const handleCalculate = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!members || members < 1) {
      setError('Enter a valid number of members')
      return
    }

    const cleanedItems = customItems
      .filter((item) => item.name.trim() && item.amount !== '')
      .map((item) => ({ name: item.name.trim(), amount: item.amount }))

    setLoading(true)
    try {
      const response = await axios.post('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/budget/calculate', {
        hotel_id: hotelId || null,
        transport_id: transportId || null,
        destination_id: destinationId || null,
        members: Number(members),
        nights: Number(nights),
        custom_items: cleanedItems,
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not calculate budget')
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

      <div className="page-content budget-page">
        <h1>💰 Budget Calculator</h1>

        <form onSubmit={handleCalculate} className="budget-form">
          <div className="form-group">
            <label>Place / Destination</label>
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
              <label>Number of Members</label>
              <input
                type="number"
                min="1"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Nights (for hotel)</label>
              <input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Extra Expenses (shopping, dinner, breakfast, lunch, etc.)</label>
             {customItems.map((item, index) => (
              <div className="custom-item-row" key={index}>
                <select
                  value={item.name}
                  onChange={(e) => updateCustomItem(index, 'name', e.target.value)}
                >
                  <option value="">-- Select expense --</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Local Transport">Local Transport</option>
                  <option value="Entry Tickets">Entry Tickets</option>
                  <option value="Guide Fee">Guide Fee</option>
                  <option value="Souvenirs">Souvenirs</option>
                  <option value="Emergency Fund">Emergency Fund</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount (Rs.)"
                  value={item.amount}
                  onChange={(e) => updateCustomItem(index, 'amount', e.target.value)}
                />
                {customItems.length > 1 && (
                  <button type="button" onClick={() => removeCustomItem(index)}>×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addCustomItem} className="add-item-btn">+ Add Expense</button>
          </div>

          <button type="submit" className="view-packages-btn" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Budget'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {result && (
          <div className="budget-result">
            <h2>Estimated Total: Rs. {result.total}</h2>
            <p>Per person: Rs. {result.per_person} ({result.members} members, {result.nights} night(s))</p>

            <div className="budget-breakdown">
              {result.breakdown.map((item, i) => (
                <div className="breakdown-row" key={i}>
                  <span>{item.category}: {item.label}</span>
                  <span>Rs. {item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetCalculator