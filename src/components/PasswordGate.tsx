import { useState } from 'react'

interface Props {
  onUnlock: () => void
}

const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD as string

export default function PasswordGate({ onUnlock }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem('frami_auth', '1')
      onUnlock()
    } else {
      setError('Incorrect password. Please try again.')
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="gate-backdrop">
      <div className={`gate-panel${shake ? ' gate-panel--shake' : ''}`}>
        <div className="gate-logo" aria-hidden="true">&#127916;</div>
        <h1 className="gate-title">Frame.io → Kaltura</h1>
        <p className="gate-subtitle">Enter the access password to continue</p>

        <form onSubmit={handleSubmit} className="gate-form">
          <input
            type="password"
            className="gate-input"
            placeholder="Password"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setError('')
            }}
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="gate-error">{error}</p>}
          <button type="submit" className="btn-primary gate-btn" disabled={!input}>
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
