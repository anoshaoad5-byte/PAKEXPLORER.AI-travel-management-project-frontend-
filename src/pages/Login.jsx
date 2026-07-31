import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import GenderWelcomeModal from '../components/GenderWelcomeModal'
import './Auth.css'
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

const [showGenderModal, setShowGenderModal] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        email,
        password
      })
      login(response.data.token, response.data.user)
      setShowGenderModal(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to PakExplorer AI</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>

        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
      {showGenderModal && (
        <GenderWelcomeModal
          fullName={null}
          onComplete={() => navigate('/destinations')}
        />
      )}
    </div>
  )
}

export default Login