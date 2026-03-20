import { useState, useCallback } from 'react'
import type { UploadResult, UploadStatus } from '../types'

interface Props {
  status: UploadStatus
  onReset: () => void
}

function buildIframeEmbed(r: UploadResult): string {
  const base = `${r.serviceUrl.replace(/\/$/, '')}/p/${r.partnerId}/sp/${r.subPartnerId}/embedIframeJs/partner_id/${r.partnerId}`
  return `<iframe src="${base}?iframeembed=true&playerId=kaltura_player&entry_id=${r.entryId}&flashvars[streamerType]=auto" width="560" height="395" allowfullscreen></iframe>`
}

function buildJsEmbed(r: UploadResult): string {
  const base = `${r.serviceUrl.replace(/\/$/, '')}/p/${r.partnerId}/sp/${r.subPartnerId}/embedIframeJs/partner_id/${r.partnerId}`
  return (
    `<script src="${base}"></script>` +
    `<div id="kaltura_player_${r.entryId}"></div>` +
    `<script>kWidget.embed({targetId:"kaltura_player_${r.entryId}",wid:"_${r.partnerId}",entry_id:"${r.entryId}",flashvars:{streamerType:"auto"}});</script>`
  )
}

// ── CopyButton ───────────────────────────────────────────────────────

interface CopyButtonProps {
  text: string
  label?: string
}

function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for non-secure contexts or when clipboard permission is denied
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      type="button"
      className={`btn-copy${copied ? ' btn-copy--copied' : ''}`}
      onClick={handleCopy}
      aria-label={label}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ── FieldRow ─────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string
  value: string
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <code className="field-value">{value}</code>
      <CopyButton text={value} label={`Copy ${label}`} />
    </div>
  )
}

// ── CodeBlock ────────────────────────────────────────────────────────

interface CodeBlockProps {
  label: string
  code: string
}

function CodeBlock({ label, code }: CodeBlockProps) {
  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-label">{label}</span>
        <CopyButton text={code} label={`Copy ${label}`} />
      </div>
      <pre className="code-block"><code>{code}</code></pre>
    </div>
  )
}

// ── EmbedOutput ──────────────────────────────────────────────────────

export default function EmbedOutput({ status, onReset }: Props) {
  if (status.kind === 'idle' || status.kind === 'loading') return null

  if (status.kind === 'error') {
    return (
      <section className="embed-output embed-output--error">
        <h2>Upload Failed</h2>
        <div className="banner-error">
          <strong>Error:</strong> {status.message}
        </div>
        <button type="button" className="btn-secondary" onClick={onReset}>
          Try Again
        </button>
      </section>
    )
  }

  // status.kind === 'success'
  const r = status.result
  const iframeEmbed = buildIframeEmbed(r)
  const jsEmbed = buildJsEmbed(r)

  return (
    <section className="embed-output embed-output--success">
      <h2>&#x2713; Upload Successful</h2>

      <h3>IDs</h3>
      <div className="result-fields">
        <FieldRow label="Partner ID" value={r.partnerId} />
        <FieldRow label="Sub Partner ID" value={r.subPartnerId} />
        <FieldRow label="Entry ID" value={r.entryId} />
      </div>

      <h3>Embed Codes</h3>
      <CodeBlock label="iFrame Embed" code={iframeEmbed} />
      <CodeBlock label="JavaScript kWidget Embed" code={jsEmbed} />

      <button type="button" className="btn-secondary" onClick={onReset}>
        Upload Another
      </button>
    </section>
  )
}
