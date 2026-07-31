import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import ReviewSection from '../components/ReviewSection'
import '../styles/travel-forms.css'
import '../styles/review-section.css'

const CATEGORIES = [
  { type: 'destination', label: 'Destinations', endpoint: '/api/destinations' },
  { type: 'hotel', label: 'Hotels', endpoint: '/api/hotels' },
  { type: 'transport', label: 'Transportation', endpoint: '/api/transports' },
  { type: 'trip', label: 'Trips', endpoint: '/api/trips' },
]

function Reviews() {
  const [category, setCategory] = useState('destination')
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { logout } = useAuth()
  const navigate = useNavigate()

   const handleLogout = () => {
    logout()
    navigate('/')
  }
  

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      setError('')
      setSelectedId('')
      const cat = CATEGORIES.find((c) => c.type === category)
      try {
        const response = await axios.get(`http://127.0.0.1:5000${cat.endpoint}`)
        setItems(response.data)
      } catch (err) {
        setError(`Could not load ${cat.label.toLowerCase()}`)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [category])

   const getItemLabel = (item) => {
    if (item.name) return item.name
    if (item.provider_name) return item.provider_name
    if (item.start_date && item.end_date) return `Trip: ${item.start_date} → ${item.end_date}`
    return `Item #${item.id}`
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content">
        <h1>⭐ Reviews & Ratings</h1>

        <div className="budget-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.type} value={c.type}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Item</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                <option value="">-- Choose --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{getItemLabel(item)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {selectedId && (
          <div className="budget-form" style={{ marginTop: '20px' }}>
            <h2 style={{ marginTop: 0 }}>
              {getItemLabel(items.find((i) => String(i.id) === String(selectedId)))}
            </h2>
            <ReviewSection targetType={category} targetId={Number(selectedId)} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Reviews