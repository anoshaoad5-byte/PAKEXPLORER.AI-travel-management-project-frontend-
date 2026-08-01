import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function ReviewSection({ targetType, targetId }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ average_rating: 0, review_count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { token } = useAuth()

  const fetchReviews = async () => {
    setLoading(true)
    setError('')
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/reviews', {
          params: { target_type: targetType, target_id: targetId }
        }),
        axios.get('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/reviews/summary', {
          params: { target_type: targetType, target_id: targetId }
        })
      ])
      setReviews(reviewsRes.data)
      setSummary(summaryRes.data)
    } catch (err) {
      setError('Could not load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (targetType && targetId) {
      fetchReviews()
    }
  }, [targetType, targetId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (rating < 1) {
      setSubmitError('Please select a star rating')
      return
    }

    if (!token) {
      setSubmitError('Please log in to leave a review')
      return
    }

    const formData = new FormData()
    formData.append('target_type', targetType)
    formData.append('target_id', targetId)
    formData.append('rating', rating)
    formData.append('comment', comment)
    if (image) {
      formData.append('image', image)
    }

    setSubmitting(true)
    try {
      await axios.post('https://pakexplorerai-travel-management-project-backend-production.up.railway.app/api/reviews', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setRating(0)
      setComment('')
      setImage(null)
      fetchReviews()
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (value, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={interactive ? () => setRating(star) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          fontSize: interactive ? '1.6rem' : '1rem',
          color: star <= (interactive ? (hoverRating || rating) : value) ? '#E8A33D' : '#D8D4C8'
        }}
      >
        ★
      </span>
    ))
  }

  return (
    <div className="review-section">
      <div className="review-summary">
        <div>
          {renderStars(Math.round(summary.average_rating))}
          <span style={{ marginLeft: '8px', fontWeight: 600 }}>
            {summary.average_rating > 0 ? summary.average_rating : 'No ratings yet'}
          </span>
        </div>
        <span style={{ color: '#5B6478', fontSize: '0.9rem' }}>
          {summary.review_count} review{summary.review_count !== 1 ? 's' : ''}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
          Leave a review
        </label>
        <div style={{ marginBottom: '10px' }}>{renderStars(rating, true)}</div>

        <textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
        />

        <div className="review-form-actions">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0] || null)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </div>

        {submitError && <p className="error-text">{submitError}</p>}
      </form>

      {loading && <p>Loading reviews...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && reviews.length === 0 && (
        <p style={{ color: '#5B6478' }}>No reviews yet. Be the first to share your experience!</p>
      )}

      <div className="review-list">
        {reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {renderStars(r.rating)}
              <span style={{ fontSize: '0.8rem', color: '#5B6478' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            {r.comment && <p style={{ marginTop: '6px' }}>{r.comment}</p>}
            {r.image_url && (
              <img
                src={r.image_url}
                alt="Review"
                style={{ maxWidth: '160px', borderRadius: '8px', marginTop: '8px' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewSection