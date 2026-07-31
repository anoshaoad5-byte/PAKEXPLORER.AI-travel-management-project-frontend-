import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import NavMenu from '../components/NavMenu'
import '../styles/translator.css'

const LANGUAGES = [
  { code: 'en', label: 'English', speechLang: 'en-US', rtl: false },
  { code: 'ur', label: 'Urdu', speechLang: 'ur-PK', rtl: true },
  { code: 'pa', label: 'Punjabi', speechLang: 'pa-IN', rtl: false },
  { code: 'ps', label: 'Pashto', speechLang: 'ps-AF', rtl: true },
  { code: 'sd', label: 'Sindhi', speechLang: 'sd-PK', rtl: true },
  { code: 'bal', label: 'Balochi (may not be supported)', speechLang: 'bal', rtl: true },
]

function BabyGirlMascot() {
  return (
    <svg viewBox="0 0 100 100" className="mascot-svg">
      <circle cx="50" cy="55" r="32" fill="#FBD8B8" />
      <path d="M20 45 Q50 5 80 45 Q80 20 50 15 Q20 20 20 45 Z" fill="#5A3A22" />
      <circle cx="18" cy="42" r="9" fill="#5A3A22" />
      <circle cx="82" cy="42" r="9" fill="#5A3A22" />
      <circle cx="38" cy="55" r="4" fill="#2B2B2B" />
      <circle cx="62" cy="55" r="4" fill="#2B2B2B" />
      <circle cx="30" cy="65" r="6" fill="#F5A6A6" opacity="0.7" />
      <circle cx="70" cy="65" r="6" fill="#F5A6A6" opacity="0.7" />
      <path d="M38 72 Q50 80 62 72" stroke="#2B2B2B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50 15 L44 4 L56 4 Z" fill="#E85D75" />
    </svg>
  )
}

function BabyBoyMascot() {
  return (
    <svg viewBox="0 0 100 100" className="mascot-svg">
      <circle cx="50" cy="55" r="32" fill="#F4C6A0" />
      <path d="M18 48 Q18 15 50 15 Q82 15 82 48 Q70 30 50 30 Q30 30 18 48 Z" fill="#2B2B2B" />
      <circle cx="38" cy="55" r="4" fill="#2B2B2B" />
      <circle cx="62" cy="55" r="4" fill="#2B2B2B" />
      <circle cx="30" cy="65" r="6" fill="#8FC6E8" opacity="0.6" />
      <circle cx="70" cy="65" r="6" fill="#8FC6E8" opacity="0.6" />
      <path d="M38 72 Q50 80 62 72" stroke="#2B2B2B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="30" y="8" width="40" height="12" rx="6" fill="#3E6FA8" />
    </svg>
  )
}

function Translator() {
  const [text, setText] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('ur')
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [speechWarning, setSpeechWarning] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const [showVoiceList, setShowVoiceList] = useState(false)

  const resultRef = useRef(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!('speechSynthesis' in window)) return

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      if (available.length > 0) {
        setVoices(available)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  useEffect(() => {
    if ((translated || error) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [translated, error])

  const currentLangInfo = LANGUAGES.find((l) => l.code === targetLanguage)

  const handleTranslate = async (e) => {
    e.preventDefault()
    setError('')
    setTranslated('')
    setSpeechWarning('')

    if (!text.trim()) {
      setError('Please enter some text to translate')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://127.0.0.1:5000/translate', {
        text,
        target_language: targetLanguage,
      })
      setTranslated(response.data.translated_text)
    } catch (err) {
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        'Could not translate this text'
      )
    } finally {
      setLoading(false)
    }
  }

  const findBestVoice = (speechLang, langLabel) => {
    if (!voices.length) return null
    const langPrefix = speechLang.split('-')[0].toLowerCase()
    const labelWord = (langLabel || '').split(' ')[0].toLowerCase()

    let match = voices.find((v) => v.lang.toLowerCase() === speechLang.toLowerCase())
    if (match) return match

    match = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix))
    if (match) return match

    match = voices.find((v) => v.name.toLowerCase().includes(labelWord))
    if (match) return match

    return null
  }

  const handleSpeak = () => {
    setSpeechWarning('')

    if (!translated) return

    if (!('speechSynthesis' in window)) {
      setSpeechWarning('Your browser does not support text-to-speech.')
      return
    }

    const speechLang = currentLangInfo?.speechLang || 'en-US'
    const matchingVoice = findBestVoice(speechLang, currentLangInfo?.label)

    const utterance = new SpeechSynthesisUtterance(translated)
    utterance.lang = speechLang

    if (matchingVoice) {
      utterance.voice = matchingVoice
    } else {
      setSpeechWarning(
        `No ${currentLangInfo?.label || speechLang} voice is installed on this device. ` +
        `It will try a default voice, which may sound wrong or stay silent.`
      )
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div>
      <nav className="navbar">
        <h2>PakExplorer AI</h2>
        <NavMenu />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="translator-page">
        <h1 className="translator-heading">🌐 Translator</h1>

        <form onSubmit={handleTranslate} className="translator-form">
          <div className="translator-field">
            <label>Text to Translate</label>
            <textarea
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here..."
            />
          </div>

          <div className="translator-field">
            <label>Translate To</label>
            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="translator-submit-btn" disabled={loading}>
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </form>

        {error && (
          <p ref={resultRef} className="translator-error">{error}</p>
        )}

        {translated && (
          <div ref={resultRef} className="translation-result">
            <div className="mascot-row">
              <div className="mascot-bubble mascot-left">
                <BabyGirlMascot />
              </div>
              <div className="translation-result-header">
                <h2>✅ Translation</h2>
                <button
                  type="button"
                  onClick={handleSpeak}
                  title="Listen to translation"
                  className={`speak-btn ${speaking ? 'speaking' : ''}`}
                >
                  🔊
                </button>
              </div>
              <div className="mascot-bubble mascot-right">
                <BabyBoyMascot />
              </div>
            </div>

            <p
              className="translation-text"
              dir={currentLangInfo?.rtl ? 'rtl' : 'ltr'}
              style={{ textAlign: currentLangInfo?.rtl ? 'right' : 'left' }}
            >
              {translated}
            </p>

            {speechWarning && (
              <p className="translation-warning">⚠️ {speechWarning}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowVoiceList((prev) => !prev)}
          className="voice-debug-toggle"
        >
          {showVoiceList ? 'Hide' : 'Show'} installed voices ({voices.length})
        </button>

        {showVoiceList && (
          <div className="voice-debug-list">
            {voices.length === 0 && <p>No voices detected yet.</p>}
            {voices.map((v, i) => (
              <p key={i}>
                <strong>{v.lang}</strong> — {v.name}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Translator