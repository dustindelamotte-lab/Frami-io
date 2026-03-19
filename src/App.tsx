import { useState } from 'react'
import type { KalturaSettings, UploadStatus, UploadResult } from './types'
import { loadSettings, saveSettings } from './lib/storage'
import SettingsPanel from './components/SettingsPanel'
import UploadPanel from './components/UploadPanel'
import EmbedOutput from './components/EmbedOutput'

export default function App() {
  // loadSettings passed as initializer function — runs only on first render
  const [settings, setSettings] = useState<KalturaSettings>(loadSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ kind: 'idle' })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

  const settingsConfigured = !!(
    settings.serviceUrl &&
    settings.partnerId &&
    settings.adminSecret &&
    settings.uiConfId
  )

  function handleSaveSettings(newSettings: KalturaSettings) {
    saveSettings(newSettings)
    setSettings(newSettings)
    setIsSettingsOpen(false)
  }

  function handleUploadComplete(result: UploadResult) {
    setUploadStatus({ kind: 'success', result })
  }

  function handleUploadError(message: string) {
    setUploadStatus({ kind: 'error', message })
  }

  function handleLoadingChange(loading: boolean, step: string) {
    setIsLoading(loading)
    setLoadingStep(step)
    if (loading) {
      setUploadStatus({ kind: 'loading', step })
    }
  }

  function handleReset() {
    setUploadStatus({ kind: 'idle' })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-title">
          <span className="app-logo" aria-hidden="true">&#127916;</span>
          <h1>Frame.io &rarr; Kaltura</h1>
        </div>
        <div className="app-header-actions">
          {!settingsConfigured && (
            <span className="header-hint">Configure settings to get started</span>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsSettingsOpen(true)}
            disabled={isLoading}
            aria-label="Open Kaltura settings"
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="app-main">
        <UploadPanel
          settings={settings}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          isLoading={isLoading}
          loadingStep={loadingStep}
          onLoadingChange={handleLoadingChange}
        />

        <EmbedOutput status={uploadStatus} onReset={handleReset} />
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        initialSettings={settings}
        onSave={handleSaveSettings}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
