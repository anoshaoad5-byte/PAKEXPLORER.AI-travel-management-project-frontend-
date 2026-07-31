import { useState } from 'react'
import './GenderWelcomeModal.css'

function speakWelcome(gender, fullName) {
  if (!('speechSynthesis' in window)) return

  const name = fullName ? `, ${fullName}` : ''
  const message =
    gender === 'female'
      ? `Welcome beautiful${name}! I'm Vedhi, your travel guide. Let's explore Pakistan together.`
      : `Welcome handsome${name}! I'm Vedhi, your travel guide. Let's explore Pakistan together.`

  const utterance = new SpeechSynthesisUtterance(message)
  utterance.pitch = 1.3
  utterance.rate = 1
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()
  const femaleVoice = voices.find(
    (v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')
  )
  if (femaleVoice) utterance.voice = femaleVoice

  window.speechSynthesis.speak(utterance)
}

function GenderWelcomeModal({ fullName, onComplete }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (gender) => {
    setSelected(gender)
    speakWelcome(gender, fullName)
    setTimeout(() => {
      onComplete(gender)
    }, 2600)
  }

  return (
    <div className="gwm-overlay">
      <div className="gwm-card">
        <div className="gwm-avatar">🪆</div>
        <h2 className="gwm-title">Hi! I'm Vedhi ✨</h2>

        {!selected && (
          <>
            <p className="gwm-sub">Before we start, tell me a little about you</p>
            <div className="gwm-options">
              <button className="gwm-option" onClick={() => handleSelect('female')}>
                <span className="gwm-option-icon">👩</span>
                <span>Female</span>
              </button>
              <button className="gwm-option" onClick={() => handleSelect('male')}>
                <span className="gwm-option-icon">👨</span>
                <span>Male</span>
              </button>
            </div>
          </>
        )}

        {selected && (
          <p className="gwm-speaking">
            {selected === 'female' ? '💬 "Welcome beautiful! Let\'s explore Pakistan together."' : '💬 "Welcome handsome! Let\'s explore Pakistan together."'}
          </p>
        )}
      </div>
    </div>
  )
}

export default GenderWelcomeModal