import type { KalturaSettings } from '../types'

const STORAGE_KEY = 'kaltura_settings'

const DEFAULT_SETTINGS: KalturaSettings = {
  serviceUrl: '',
  partnerId: '',
  subPartnerId: '',
  adminSecret: '',
  userSecret: '',
}

export function loadSettings(): KalturaSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<KalturaSettings>
    return {
      serviceUrl: parsed.serviceUrl ?? '',
      partnerId: parsed.partnerId ?? '',
      subPartnerId: parsed.subPartnerId ?? '',
      adminSecret: parsed.adminSecret ?? '',
      userSecret: parsed.userSecret ?? '',
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: KalturaSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage can be blocked in sandboxed iframe / private-browsing contexts.
    console.warn('Could not persist settings to localStorage.')
  }
}
