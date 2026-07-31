import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet'
 import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './DestinationPlan.css'

// Fix default marker icons not showing with Vite's bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const destinationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [32, 48],
  iconAnchor: [16, 48]
})

const newPinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  className: 'dp-new-pin-icon'
})

const PIN_CATEGORIES = ['Local Market', 'Famous Place', 'Best Season Spot', 'Viewpoint', 'Food Street', 'Other']

// Suggested names per category — user checks the ones that apply, no typing needed
const PIN_SUGGESTIONS = {
  'Local Market': ['Main Bazaar', 'Sunday Market', 'Fruit & Vegetable Market', 'Handicraft Market', 'Local Food Street'],
  'Famous Place': ['Historical Fort', 'Waterfall', 'Lake', 'Museum', 'Religious Site', 'Old Town Center'],
  'Best Season Spot': ['Spring Bloom Spot', 'Summer Picnic Point', 'Autumn Foliage Point', 'Winter Snow Point'],
  'Viewpoint': ['Sunset Point', 'Sunrise Point', 'Panoramic View', 'Valley View'],
  'Food Street': ['Local Food Street', 'BBQ Street', 'Dessert Corner', 'Tea Stall Row'],
  'Other': ['Parking Area', 'Rest Stop', 'Camping Ground', 'Public Washroom']
}

// Recenters/pans the map when a pin is picked from the sidebar list
function FlyToPin({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 })
    }
  }, [position, map])
  return null
}

// Listens for map clicks and reports the clicked lat/lng up to the parent
function MapClickCatcher({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    }
  })
  return null
}

function DestinationPlan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [destination, setDestination] = useState(null)
  const [pins, setPins] = useState([])
  const [selectedPin, setSelectedPin] = useState(null)
  const [flyToPosition, setFlyToPosition] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // --- click-to-add-pin state (checkbox based, no typing) ---
  const [newPinPosition, setNewPinPosition] = useState(null)
  const [newPinCategory, setNewPinCategory] = useState(PIN_CATEGORIES[0])
  const [checkedNames, setCheckedNames] = useState([])
  const [addingPin, setAddingPin] = useState(false)
  const [addPinError, setAddPinError] = useState('')

  const fetchMapData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/destinations/${id}/pins`)
      setDestination(res.data.destination)
      setPins(res.data.pins || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load the map for this destination.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMapData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const center =
    destination && destination.latitude && destination.longitude
      ? [destination.latitude, destination.longitude]
      : [30.3753, 69.3451] // fallback: center of Pakistan

  const filteredPins = pins.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePickFromList = (pin) => {
    setFlyToPosition([pin.latitude, pin.longitude])
    setSelectedPin(pin)
  }

  const handleMapClick = (latlng) => {
    setNewPinPosition(latlng)
    setNewPinCategory(PIN_CATEGORIES[0])
    setCheckedNames([])
    setAddPinError('')
  }

  const toggleCheckedName = (name) => {
    setCheckedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const handleCategoryChange = (category) => {
    setNewPinCategory(category)
    setCheckedNames([]) // reset selections when switching category
  }

  const handleSaveNewPin = async (e) => {
    e.preventDefault()
    setAddPinError('')

    if (checkedNames.length === 0) {
      setAddPinError('Please check at least one spot to add.')
      return
    }

    setAddingPin(true)
    try {
      await Promise.all(
        checkedNames.map((name) =>
          axios.post(`http://127.0.0.1:5000/api/destinations/${id}/pins`, {
            name,
            category: newPinCategory,
            latitude: newPinPosition.lat,
            longitude: newPinPosition.lng
          })
        )
      )
      setNewPinPosition(null)
      await fetchMapData()
    } catch (err) {
      setAddPinError(err.response?.data?.error || 'Could not save these spots. Please try again.')
    } finally {
      setAddingPin(false)
    }
  }

  return (
    <div className="dest-plan-page">
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <button onClick={() => navigate('/destinations')} className="logout-btn">
          ← Back to Destinations
        </button>
      </nav>

      <div className="page-content dp-map-page">
        {loading && <p>Loading map…</p>}
        {error && <p className="error-text">{error}</p>}

        {destination && (
          <div className="dp-layout">
            {/* ---------- MAP PANEL ---------- */}
            <div className="dp-map-card">
              <div className="dp-map-card__header">
                <span className="dp-map-card__icon">📖</span>
                <h1>{destination.name}</h1>
              </div>

              <p className="dp-map-hint">📍 Click anywhere on the map to add local spots.</p>

              <div className="dp-map-wrapper">
                <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="dp-map">
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <FlyToPin position={flyToPosition} />
                  <MapClickCatcher onMapClick={handleMapClick} />

                  <Marker position={center} icon={destinationIcon}>
                    <Popup>{destination.name}</Popup>
                  </Marker>

                   {pins.map((pin) => (
                    <Marker
                      key={pin.id}
                      position={[pin.latitude, pin.longitude]}
                      eventHandlers={{
                        click: () => setSelectedPin(pin)
                      }}
                    >
                      <Tooltip permanent direction="top" offset={[0, -40]} className="dp-map-label">
                        {pin.name}
                      </Tooltip>
                      <Popup>{pin.name}</Popup>
                    </Marker>
                  ))}

                  {newPinPosition && (
                    <Marker position={[newPinPosition.lat, newPinPosition.lng]} icon={newPinIcon}>
                      <Popup>New spot — select below</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* ---------- SIDEBAR: SEARCHABLE PIN LIST ---------- */}
            <div className="dp-sidebar-card">
              <h2 className="dp-sidebar-card__title">Local Spots</h2>
              <p className="dp-sidebar-card__count">{filteredPins.length} places</p>

              <input
                type="text"
                className="dp-sidebar-search"
                placeholder="Search a place…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="dp-sidebar-list">
                {filteredPins.length === 0 && (
                  <p className="dp-no-pins">
                    {pins.length === 0
                      ? 'No local spots added yet for this destination.'
                      : 'No matches for that search.'}
                  </p>
                )}
                {filteredPins.map((pin) => (
                  <button
                    key={pin.id}
                    className={`dp-sidebar-list__item ${selectedPin?.id === pin.id ? 'active' : ''}`}
                    onClick={() => handlePickFromList(pin)}
                  >
                    <span>{pin.name}</span>
                    {pin.category && <span className="dp-sidebar-list__tag">{pin.category}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------- ADD NEW PIN FORM (checkbox based, shown after clicking the map) ---------- */}
      {newPinPosition && (
        <div className="modal-overlay" onClick={() => setNewPinPosition(null)}>
          <div className="modal-content dp-pin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setNewPinPosition(null)}>×</button>

            <div className="modal-info">
              <h2>Add Local Spots</h2>

              {addPinError && <p className="error-text">{addPinError}</p>}

              <form onSubmit={handleSaveNewPin} className="dp-add-pin-form">
                <div className="form-group">
                  <label>Category</label>
                  <select value={newPinCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
                    {PIN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select the spots that apply here</label>
                  <div className="dp-checkbox-list">
                    {PIN_SUGGESTIONS[newPinCategory].map((name) => (
                      <label key={name} className="dp-checkbox-item">
                        <input
                          type="checkbox"
                          checked={checkedNames.includes(name)}
                          onChange={() => toggleCheckedName(name)}
                        />
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="view-packages-btn" disabled={addingPin}>
                  {addingPin
                    ? 'Saving...'
                    : `📍 Save ${checkedNames.length > 0 ? `(${checkedNames.length}) ` : ''}Spot${checkedNames.length !== 1 ? 's' : ''}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PIN DETAIL / GALLERY MODAL ---------- */}
      {selectedPin && (
        <div className="modal-overlay" onClick={() => setSelectedPin(null)}>
          <div className="modal-content dp-pin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPin(null)}>×</button>

            <div className="modal-info">
              <h2>{selectedPin.name}</h2>
              {selectedPin.category && <span className="tag">{selectedPin.category}</span>}
              {selectedPin.description && (
                <p className="modal-description">{selectedPin.description}</p>
              )}

              {selectedPin.images && selectedPin.images.length > 0 && (
                <div className="dp-pin-gallery">
                  {selectedPin.images.map((img, i) => (
                    <img key={i} src={img} alt={`${selectedPin.name} ${i + 1}`} className="dp-pin-gallery__img" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DestinationPlan