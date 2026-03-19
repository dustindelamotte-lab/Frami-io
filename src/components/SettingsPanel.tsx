import React, { useState, useEffect } from 'react'
import type { KalturaSettings } from '../types'

interface Props {
  isOpen: boolean
  initialSettings: KalturaSettings
  onSave: (settings: KalturaSettings) => void
  onClose: () => void
}

export default function SettingsPanel({ isOpen, initialSettings, onSave, onClose }: Props) {
  const [form, setForm] = useState<KalturaSettings>(initialSettings)
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')

  // Sync form whenever the panel re-opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialSettings)
      setError('')
      setShowSecret(false)
    }
  }, [isOpen, initialSettings])

  if (!isOpen) return null

  function handleChange(field: keyof KalturaSettings) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setError('')
    }
  }

  function handleSave() {
    const { serviceUrl, partnerId, adminSecret, uiConfId } = form
    if (!serviceUrl.trim() || !partnerId.trim() || !adminSecret.trim() || !uiConfId.trim()) {
      setError('All fields are required.')
      return
    }
    try {
      new URL(serviceUrl.trim())
    } catch {
      setError('Service URL must be a valid URL (e.g. https://www.kaltura.com).')
      return
    }
    onSave({
      serviceUrl: serviceUrl.trim(),
      partnerId: partnerId.trim(),
      adminSecret: adminSecret.trim(),
      uiConfId: uiConfId.trim(),
    })
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Kaltura Settings">
        <h2>Kaltura Settings</h2>
        <p className="modal-subtitle">
          These credentials are stored locally in your browser and never sent anywhere except
          directly to your Kaltura instance.
        </p>

        <label htmlFor="serviceUrl">Service URL</label>
        <input
          id="serviceUrl"
          type="url"
          placeholder="https://www.kaltura.com"
          value={form.serviceUrl}
          onChange={handleChange('serviceUrl')}
          autoComplete="off"
        />

        <label htmlFor="partnerId">Partner ID</label>
        <input
          id="partnerId"
          type="text"
          placeholder="123456"
          value={form.partnerId}
          onChange={handleChange('partnerId')}
          autoComplete="off"
        />

        <label htmlFor="adminSecret">Admin Secret</label>
        <div className="password-field">
          <input
            id="adminSecret"
            type={showSecret ? 'text' : 'password'}
            placeholder="Your KMC admin secret"
            value={form.adminSecret}
            onChange={handleChange('adminSecret')}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setShowSecret(s => !s)}
            aria-label={showSecret ? 'Hide secret' : 'Show secret'}
          >
            {showSecret ? 'Hide' : 'Show'}
          </button>
        </div>

        <label htmlFor="uiConfId">UI Conf ID</label>
        <input
          id="uiConfId"
          type="text"
          placeholder="23448234"
          value={form.uiConfId}
          onChange={handleChange('uiConfId')}
          autoComplete="off"
        />

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
