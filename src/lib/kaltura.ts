import type { KalturaSettings, UploadResult } from '../types'

// Kaltura returns HTTP 200 even on logical errors.
// Error responses look like: { code: "INVALID_KS", message: "..." }
interface KalturaErrorResponse {
  code: string
  message: string
  objectType?: string
}

function isKalturaError(obj: unknown): obj is KalturaErrorResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as KalturaErrorResponse).code === 'string' &&
    typeof (obj as KalturaErrorResponse).message === 'string'
  )
}

async function kalturaPost(
  serviceUrl: string,
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  const url = `${serviceUrl.replace(/\/$/, '')}/api_v3/service/${path}`
  const body = new URLSearchParams({ ...params, format: '1' }).toString()

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data: unknown = await response.json()

  if (isKalturaError(data)) {
    throw new Error(`Kaltura error [${data.code}]: ${data.message}`)
  }

  return data
}

/**
 * Step 1: Generate an admin Kaltura Session (KS).
 * type=2 means admin session.
 */
export async function startSession(settings: KalturaSettings): Promise<string> {
  const data = await kalturaPost(settings.serviceUrl, 'session/action/start', {
    secret: settings.adminSecret,
    type: '2',
    partnerId: settings.partnerId,
  })

  if (typeof data !== 'string') {
    throw new Error('Unexpected response from session/start: expected a KS string.')
  }
  return data
}

/**
 * Step 2: Create a media entry.
 * mediaType=1 means Video.
 */
export async function createMediaEntry(
  settings: KalturaSettings,
  ks: string,
  name: string,
  description: string,
): Promise<string> {
  const params: Record<string, string> = {
    ks,
    'entry[objectType]': 'KalturaMediaEntry',
    'entry[name]': name || 'Untitled',
    'entry[mediaType]': '1',
  }
  if (description) {
    params['entry[description]'] = description
  }

  const data = await kalturaPost(settings.serviceUrl, 'media/action/add', params)

  if (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { id: string }).id === 'string'
  ) {
    return (data as { id: string }).id
  }
  throw new Error('Unexpected response from media/add: missing entry id.')
}

/**
 * Step 3: Set content via KalturaUrlResource.
 * Kaltura pulls the video from the Frame.io URL server-side — no browser CORS issue.
 */
export async function addContent(
  settings: KalturaSettings,
  ks: string,
  entryId: string,
  frameIoUrl: string,
): Promise<void> {
  await kalturaPost(settings.serviceUrl, 'media/action/addContent', {
    ks,
    entryId,
    'resource[objectType]': 'KalturaUrlResource',
    'resource[url]': frameIoUrl,
  })
}

/**
 * Orchestrates all three steps and returns the final UploadResult.
 */
export async function uploadToKaltura(
  settings: KalturaSettings,
  frameIoUrl: string,
  title: string,
  description: string,
  onStep: (step: string) => void,
): Promise<UploadResult> {
  onStep('Generating Kaltura session...')
  const ks = await startSession(settings)

  onStep('Creating media entry...')
  const entryId = await createMediaEntry(settings, ks, title, description)

  onStep('Linking Frame.io content to entry...')
  await addContent(settings, ks, entryId, frameIoUrl)

  return {
    partnerId: settings.partnerId,
    entryId,
    uiConfId: settings.uiConfId,
    serviceUrl: settings.serviceUrl,
  }
}
