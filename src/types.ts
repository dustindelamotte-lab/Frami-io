export interface KalturaSettings {
  serviceUrl: string   // e.g. "https://www.kaltura.com"
  partnerId: string    // numeric as string, e.g. "12345"
  adminSecret: string  // KMC admin secret
  uiConfId: string     // player UI conf ID
}

export interface UploadResult {
  partnerId: string
  entryId: string
  uiConfId: string
  serviceUrl: string
}

export type UploadStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; step: string }
  | { kind: 'success'; result: UploadResult }
  | { kind: 'error'; message: string }
