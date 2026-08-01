import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function Destinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
         const response = await axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/destinations')
        setDestinations(response.data)
      } catch (err) {
        setError('Could not load destinations')
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  const getSlides = (d) => {
    if (d.images && d.images.length > 0) return d.images
    if (d.image) return [d.image]
    return [`https://picsum.photos/seed/${d.id}/800/400`]
  }

  const nextSlide = useCallback(() => {
    if (!selected) return
    const slides = getSlides(selected)
    setSlideIndex((prev) => (prev + 1) % slides.length)
  }, [selected])

  const prevSlide = useCallback(() => {
    if (!selected) return
    const slides = getSlides(selected)
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [selected])

  useEffect(() => {
    if (!selected) return

    const slides = getSlides(selected)
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [selected, slideIndex])

  useEffect(() => {
    if (!selected) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'Escape') setSelected(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, nextSlide, prevSlide])

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX

    if (diff > 50) nextSlide()
    if (diff < -50) prevSlide()

    setTouchStartX(null)
  }

  const openModal = (d) => {
    setSelected(d)
    setSlideIndex(0)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="page-content">
        <h1>Explore Destinations</h1>

        <div className="page-header-actions">
          <button onClick={() => navigate('/packages')} className="view-packages-btn">
            ?? View All Travel Packages
          </button>
        </div>

        {loading && <p>Loading destinations...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="card-grid">
          {destinations.map((d) => (
            <div key={d.id} className="destination-card" onClick={() => openModal(d)}>
              <img
                src={d.image || `https://picsum.photos/seed/${d.id}/400/200`}
                alt={d.name}
                className="destination-image"
              />
              <div className="destination-body">
                <h3>{d.name}</h3>
                <p className="location-text">{d.city}, {d.province}</p>
                <p>{d.description}</p>
                {d.category && <span className="tag">{d.category}</span>}
                {d.budget && <p className="budget-text">Budget: Rs. {d.budget}</p>}
              </div>
            </div>
          ))}
        </div>

        {!loading && destinations.length === 0 && (
          <p>No destinations added yet.</p>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>

            <div
              className="slideshow"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={getSlides(selected)[slideIndex]}
                alt={selected.name}
                className="modal-image"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${selected.id}-${slideIndex}/800/400` }}
              />

              {getSlides(selected).length > 1 && (
                <>
                  <button className="slide-arrow slide-arrow-left" onClick={prevSlide}>‹</button>
                  <button className="slide-arrow slide-arrow-right" onClick={nextSlide}>›</button>

                  <div className="slide-dots">
                    {getSlides(selected).map((_, i) => (
                      <span
                        key={i}
                        className={`dot ${i === slideIndex ? 'active' : ''}`}
                        onClick={() => setSlideIndex(i)}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-info">
              <h2>{selected.name}</h2>
              <p className="location-text">{selected.city}, {selected.province}</p>
              <p className="modal-description">{selected.description}</p>

              <div className="modal-facts">
                {selected.famous_places && (
                  <div className="fact-item">
                    <strong>??? Famous Places:</strong>
                    <p>{selected.famous_places}</p>
                  </div>
                )}
                {selected.festivals && (
                  <div className="fact-item">
                    <strong>?? Festivals:</strong>
                    <p>{selected.festivals}</p>
                  </div>
                )}
                {selected.famous_dish && (
                  <div className="fact-item">
                    <strong>??? Famous Dish:</strong>
                    <p>{selected.famous_dish}</p>
                  </div>
                )}
                {selected.famous_tradition && (
                  <div className="fact-item">
                    <strong>?? Tradition:</strong>
                    <p>{selected.famous_tradition}</p>
                  </div>
                )}
                {selected.fun_fact && (
                  <div className="fact-item">
                    <strong>?? Fun Fact:</strong>
                    <p>{selected.fun_fact}</p>
                  </div>
                )}
                {selected.best_time_to_visit && (
                  <div className="fact-item">
                    <strong>?? Best Time to Visit:</strong>
                    <p>{selected.best_time_to_visit}</p>
                  </div>
                )}
              </div>

               <button
  className="view-packages-btn modal-packages-btn"
  onClick={() => navigate(`/destinations/${selected.id}/plan`)}
>
  ??? View Plan for {selected.name}
</button>
<button
  className="view-packages-btn modal-packages-btn"
  style={{ background: '#1976d2', marginTop: '0.6rem' }}
  onClick={() => navigate(`/itinerary/${selected.id}`)}
>
  ? Generate AI Itinerary
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Destinations