import { useState } from 'react'
import type { KalturaSettings, UploadResult } from '../types'
import { uploadToKaltura } from '../lib/kaltura'

interface Props {
  settings: KalturaSettings
  onUploadComplete: (result: UploadResult) => void
  onUploadError: (message: string) => void
  isLoading: boolean
  loadingStep: string
  onLoadingChange: (loading: boolean, step: string) => void
}

export default function UploadPanel({
  settings,
  onUploadComplete,
  onUploadError,
  isLoading,
  loadingStep,
  onLoadingChange,
}: Props) {
  const [frameIoUrl, setFrameIoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [validationError, setValidationError] = useState('')

  const settingsComplete = !!(
    settings.serviceUrl &&
    settings.partnerId &&
    settings.adminSecret &&
    settings.uiConfId
  )

  function validate(): boolean {
    if (!settingsComplete) {
      setValidationError('Please configure Kaltura settings first (click the gear icon).')
      return false
    }
    if (!frameIoUrl.trim()) {
      setValidationError('Frame.io download URL is required.')
      return false
    }
    try {
      new URL(frameIoUrl.trim())
    } catch {
      setValidationError('Please enter a valid URL.')
      return false
    }
    setValidationError('')
    return true
  }

  async function handleUpload() {
    if (!validate()) return

    onLoadingChange(true, 'Starting...')
    try {
      const result = await uploadToKaltura(
        settings,
        frameIoUrl.trim(),
        title.trim(),
        description.trim(),
        (step: string) => onLoadingChange(true, step),
      )
      onLoadingChange(false, '')
      onUploadComplete(result)
    } catch (err: unknown) {
      onLoadingChange(false, '')
      const message = err instanceof Error ? err.message : 'An unknown error occurred.'
      onUploadError(message)
    }
  }

  return (
    <section className="upload-panel">
      <h2>Upload Video to Kaltura</h2>
      <p className="panel-subtitle">
        Paste a Frame.io download link — Kaltura will fetch the video directly from the URL.
      </p>

      {!settingsComplete && (
        <div className="banner-warning">
          Kaltura settings are not configured. Click the ⚙ gear icon in the header to set them up.
        </div>
      )}

      <label htmlFor="frameIoUrl">Frame.io Download URL *</label>
      <input
        id="frameIoUrl"
        type="url"
        placeholder="https://assets.frame.io/..."
        value={frameIoUrl}
        onChange={e => {
          setFrameIoUrl(e.target.value)
          setValidationError('')
        }}
        disabled={isLoading}
        autoComplete="off"
      />

      <label htmlFor="videoTitle">Title (optional)</label>
      <input
        id="videoTitle"
        type="text"
        placeholder="My Video"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={isLoading}
      />

      <label htmlFor="videoDescription">Description (optional)</label>
      <textarea
        id="videoDescription"
        placeholder="A short description..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={isLoading}
        rows={3}
      />

      {validationError && <p className="error-text">{validationError}</p>}

      <button
        type="button"
        className="btn-primary btn-upload"
        onClick={handleUpload}
        disabled={isLoading || !settingsComplete}
      >
        {isLoading ? 'Uploading...' : 'Upload to Kaltura'}
      </button>

      {isLoading && (
        <div className="loading-indicator">
          <span className="spinner" aria-hidden="true" />
          <span>{loadingStep}</span>
        </div>
      )}
    </section>
  )
}
