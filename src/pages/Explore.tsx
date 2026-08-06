import { useState, useEffect } from 'react'
import { Order_By } from '@shelby-protocol/sdk/browser'
import { shelbynetClient } from '../lib/shelby'
import FileDetailModal from '../components/FileDetailModal'

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

const getFileName = (fullName: string) => {
  const parts = fullName.split('/')
  return parts[parts.length - 1] || fullName
}

type IconKind = 'image' | 'pdf' | 'code' | 'archive' | 'other'

const PREVIEW_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp']
const CODE_EXTS = ['js', 'jsx', 'ts', 'tsx', 'py', 'json']
const ARCHIVE_EXTS = ['zip', 'tar', 'gz', 'rar', '7z']

const iconKindForFile = (name: string): IconKind => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (PREVIEW_IMAGE_EXTS.includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (CODE_EXTS.includes(ext)) return 'code'
  if (ARCHIVE_EXTS.includes(ext)) return 'archive'
  return 'other'
}

function FileIcon({ kind, color, size = 18 }: { kind: IconKind; color: string; size?: number }) {
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

type TypeFilter = 'all' | 'images' | 'documents' | 'video' | 'other'

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'images', label: 'Images' },
  { key: 'documents', label: 'Documents' },
  { key: 'video', label: 'Video' },
  { key: 'other', label: 'Other' },
]

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
const DOC_EXTS = ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'pptx', 'ppt', 'json', 'md', 'vcf']
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm']

const categoryForFile = (name: string): TypeFilter => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (IMAGE_EXTS.includes(ext)) return 'images'
  if (DOC_EXTS.includes(ext)) return 'documents'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  return 'other'
}

const PAGE_SIZE = 50

export default function Explore() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [blobs, setBlobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [priceFilter, setPriceFilter] = useState<'free' | 'paid'>('free')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [selectedBlob, setSelectedBlob] = useState<any | null>(null)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Debounce the search box, and reset back to page 0 whenever the search
  // term actually changes — batched into the same tick so this doesn't
  // trigger the fetch effect below twice.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setIsLoading(true)
    setError(false)
    const trimmedSearch = debouncedSearch.trim()
    shelbynetClient.coordination.getBlobs({
      where: trimmedSearch ? { object_name: { _ilike: `%${trimmedSearch}%` } } : undefined,
      orderBy: { created_at: Order_By.Desc },
      pagination: { limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE },
    })
      .then(data => {
        const all = (data || []).filter((b: any) => b.isWritten && !b.isDeleted)
        setHasMore(all.length > PAGE_SIZE)
        setBlobs(all.slice(0, PAGE_SIZE))
        setIsLoading(false)
      })
      .catch(err => { console.error('Load error:', err); setError(true); setIsLoading(false) })
  }, [page, debouncedSearch])

  const filtered = blobs.filter(blob => {
    const fileName = getFileName(blob.name)
    if (typeFilter !== 'all' && categoryForFile(fileName) !== typeFilter) return false
    return true
  })

  const handleDownload = async (blob: any) => {
    const key = blob.name
    setDownloading(key)
    try {
      const ownerBytes = blob.owner?.data || {}
      const account = "0x" + Object.values(ownerBytes).map((b: any) => b.toString(16).padStart(2, "0")).join("")
      const result = await shelbynetClient.download({ account, blobName: blob.blobNameSuffix })
      const reader = result.readable.getReader()
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      const uint8 = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
      let offset = 0
      for (const chunk of chunks) { uint8.set(chunk, offset); offset += chunk.length }
      const url = URL.createObjectURL(new Blob([uint8]))
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
      if (isMobile) {
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = getFileName(blob.name)
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (err) {
      console.error('Download failed:', err)
    }
    setDownloading(null)
  }

  const goToPage = (p: number) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>Marketplace</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Browse files stored on the Shelby decentralized network</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' as const }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
          style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['free', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setPriceFilter(f)} style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: priceFilter === f ? 'var(--accent)' : 'var(--surface)',
            color: priceFilter === f ? 'var(--on-accent)' : 'var(--muted)',
            border: '1px solid var(--border)', cursor: 'pointer',
          }}>{f === 'free' ? 'Free' : 'Paid'}</button>
        ))}
      </div>

      {priceFilter === 'paid' && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Paid Files Coming Soon</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            Token-gated and paid file access is part of the Shelby payment channel system, coming in a future update.
          </div>
        </div>
      )}

      {priceFilter === 'free' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const }}>
            {TYPE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setTypeFilter(f.key)} style={{
                padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: typeFilter === f.key ? 'var(--accent)' : 'var(--surface)',
                color: typeFilter === f.key ? 'var(--on-accent)' : 'var(--muted)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}>{f.label}</button>
            ))}
          </div>

          {isLoading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>Loading files from Shelby network...</div>}
          {error && <div style={{ textAlign: 'center', color: '#f87171', padding: '64px 0', fontSize: 14 }}>Could not load files. Check your connection.</div>}
          {!isLoading && !error && filtered.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>No files found.</div>}

          <div className="file-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(blob => {
              const fileName = getFileName(blob.name)
              const color = colorForType(fileName)
              const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE'
              const kind = iconKindForFile(fileName)
              const sizeKB = blob.size ? blob.size > 1024 * 1024
                ? (blob.size / 1024 / 1024).toFixed(1) + ' MB'
                : (blob.size / 1024).toFixed(1) + ' KB'
                : 'Unknown'
              const isDownloading = downloading === blob.name

              return (
                <div key={blob.name} onClick={() => setSelectedBlob(blob)} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '20px',
                  display: 'flex', flexDirection: 'column' as const, gap: 12,
                  transition: 'border-color .15s', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '18', border: '1px solid ' + color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileIcon kind={kind} color={color} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: '#4ade8018', border: '1px solid #4ade8030', padding: '3px 8px', borderRadius: 20 }}>Free</span>
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{fileName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ext} · {sizeKB}</div>
                  </div>

                  <button onClick={e => { e.stopPropagation(); handleDownload(blob) }} disabled={isDownloading} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: isDownloading ? 'var(--surface2)' : 'var(--accent)',
                    color: isDownloading ? 'var(--muted)' : 'var(--on-accent)',
                    border: 'none', cursor: isDownloading ? 'not-allowed' : 'pointer',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              )
            })}
          </div>

          {!isLoading && !error && (page > 0 || hasMore) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 40 }}>
              <button onClick={() => goToPage(page - 1)} disabled={page === 0} style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--surface)', color: page === 0 ? 'var(--muted)' : 'var(--text)',
                border: '1px solid var(--border)', cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}>← Prev</button>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Page {page + 1}</span>
              <button onClick={() => goToPage(page + 1)} disabled={!hasMore} style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--surface)', color: !hasMore ? 'var(--muted)' : 'var(--text)',
                border: '1px solid var(--border)', cursor: !hasMore ? 'not-allowed' : 'pointer',
              }}>Next →</button>
            </div>
          )}
        </>
      )}

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--accent)', color: 'var(--on-accent)',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}

      {downloadError && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 101,
          maxWidth: 420, width: 'calc(100% - 48px)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'var(--surface)', border: '1px solid #f8717140', borderRadius: 12,
          padding: '14px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, flex: 1 }}>{downloadError}</div>
          <button onClick={() => setDownloadError(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {selectedBlob && (
        <FileDetailModal
          blob={selectedBlob}
          onClose={() => setSelectedBlob(null)}
          onDownload={handleDownload}
          isDownloading={downloading === selectedBlob.name}
        />
      )}
    </div>
  )
}
