import { Network } from '@aptos-labs/ts-sdk'
import { getShelbyAccountExplorerUrl } from '@shelby-protocol/sdk/browser'

interface Props {
  blob: any
  onClose: () => void
  onDownload: (blob: any) => void
  isDownloading: boolean
}

const getFileName = (fullName: string) => {
  const parts = fullName.split('/')
  return parts[parts.length - 1] || fullName
}

const colorForType = (name: string) => {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE'
  const map: Record<string, string> = {
    CSV: '#f472b6', PNG: '#4ade80', ZIP: '#60a5fa', PDF: '#f472b6',
    MP4: '#a78bfa', JSON: '#4ade80', TAR: '#60a5fa', BIN: '#a78bfa',
    JPEG: '#4ade80', JPG: '#4ade80', GIF: '#4ade80', WEBP: '#4ade80',
    TXT: '#60a5fa', VCF: '#f472b6', PPTX: '#f472b6', DOCX: '#60a5fa', XLSX: '#4ade80',
    JS: '#a78bfa', JSX: '#a78bfa', TS: '#a78bfa', TSX: '#a78bfa', PY: '#a78bfa',
    GZ: '#60a5fa', RAR: '#60a5fa', '7Z': '#60a5fa',
  }
  return map[ext] || '#8a7a70'
}

type IconKind = 'image' | 'pdf' | 'code' | 'archive' | 'other'

const CODE_EXTS = ['js', 'jsx', 'ts', 'tsx', 'py', 'json']
const ARCHIVE_EXTS = ['zip', 'tar', 'gz', 'rar', '7z']
const PREVIEW_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp']

const iconKindForFile = (name: string): IconKind => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (PREVIEW_IMAGE_EXTS.includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (CODE_EXTS.includes(ext)) return 'code'
  if (ARCHIVE_EXTS.includes(ext)) return 'archive'
  return 'other'
}

function FileIcon({ kind, color, size = 20 }: { kind: IconKind; color: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'image':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )
    case 'pdf':
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="16" y2="17"/>
        </svg>
      )
    case 'code':
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      )
    case 'archive':
      return (
        <svg {...props}>
          <rect x="2" y="3" width="20" height="5" rx="1"/>
          <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
          <path d="M10 12h4"/>
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        </svg>
      )
  }
}

const formatSize = (bytes: number) => {
  if (!bytes) return 'Unknown'
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

const formatDate = (micros: number) => {
  if (!micros) return 'Unknown'
  return new Date(micros / 1000).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const truncateMiddle = (str: string, head = 10, tail = 8) =>
  str.length > head + tail + 3 ? `${str.slice(0, head)}...${str.slice(-tail)}` : str

const hexFromBytes = (bytes: Uint8Array) =>
  '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined, wordBreak: 'break-all' as const }}>
      {value}
    </div>
  </div>
)

export default function FileDetailModal({ blob, onClose, onDownload, isDownloading }: Props) {
  const fileName = getFileName(blob.name)
  const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE'
  const color = colorForType(fileName)
  const kind = iconKindForFile(fileName)
  const ownerAddress = blob.owner?.toString?.() ?? 'Unknown'
  const commitment = blob.blobMerkleRoot ? hexFromBytes(blob.blobMerkleRoot) : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, width: '100%', maxWidth: 480,
        padding: 36, position: 'relative',
        maxHeight: '88vh', overflowY: 'auto' as const,
        display: 'flex', flexDirection: 'column' as const, gap: 20,
      }} onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', border: '1px solid ' + color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileIcon kind={kind} color={color} />
          </div>
          <div style={{ minWidth: 0, paddingTop: 2 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', wordBreak: 'break-word' as const, marginBottom: 4 }}>{fileName}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: '#4ade8018', border: '1px solid #4ade8030', padding: '3px 8px', borderRadius: 20 }}>Free</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <Row label="Type" value={ext} />
          <Row label="Size" value={formatSize(blob.size)} />
          <Row label="Uploaded" value={formatDate(blob.creationMicros)} />
          <Row label="Expires" value={formatDate(blob.expirationMicros)} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Row label="Owner" value={truncateMiddle(ownerAddress)} mono />
          </div>
          {commitment && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Row label="Blob Commitment" value={truncateMiddle(commitment)} mono />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={() => onDownload(blob)} disabled={isDownloading} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: isDownloading ? 'var(--surface2)' : 'var(--accent)',
            color: isDownloading ? 'var(--muted)' : 'var(--on-accent)',
            border: 'none', cursor: isDownloading ? 'not-allowed' : 'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
          <a href={getShelbyAccountExplorerUrl(Network.SHELBYNET, ownerAddress)} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: 'var(--surface2)', color: '#60a5fa',
            border: '1px solid #60a5fa30', cursor: 'pointer', textDecoration: 'none',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  )
}
