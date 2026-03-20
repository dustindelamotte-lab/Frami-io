export interface KalturaSettings {
  serviceUrl: string    // e.g. "https://www.kaltura.com"
  partnerId: string     // numeric as string, e.g. "12345"
  subPartnerId: string  // sub-partner / sub-account ID
  adminSecret: string   // KMC admin secret
  userSecret: string    // KMC user secret
}

export interface UploadResult {
  partnerId: string
  subPartnerId: string
  entryId: string
  serviceUrl: string
}

export type UploadStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; step: string }
  | { kind: 'success'; result: UploadResult }
  | { kind: 'error'; message: string }
