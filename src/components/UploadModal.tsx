import { useState, useCallback } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

interface Props {
  onClose: () => void
}

// Browser wallet-adapter uploads are disabled upstream: @shelby-protocol/react's
// useUploadBlobs rejects wallet-adapter signers (the v1 upload endpoint was
// removed and no v2 chunkset flow exists yet for wallet-adapter signers).
// Only raw Account signers work, which isn't usable from a connected Petra
// wallet. Re-enable once Shelby ships the v2 wallet-adapter upload flow.
const UPLOADS_DISABLED = true

export default function UploadModal({ onClose }: Props) {
  const { account } = useWallet()
  const [files, setFiles] = useState<File[]>([])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const walletConnected = !!account

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div className="upload-modal-card" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, width: '100%', maxWidth: 480,
        padding: 36, position: 'relative',
        maxHeight: '88vh', overflowY: 'auto' as const,
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16,
      }} onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent)18', border: '1px solid var(--accent)30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            Upload to Shelby Network
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 360 }}>
            Select files to upload directly from your browser. Files are stored on the decentralized Shelby network with a 30-day expiration.
          </div>
        </div>

        {UPLOADS_DISABLED && (
          <div style={{ fontSize: 13, color: '#f59e0b', background: '#f59e0b14', border: '1px solid #f59e0b30', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const, lineHeight: 1.5 }}>
            Browser uploads are temporarily unavailable while Shelby updates their wallet upload flow. Use the CLI to upload files in the meantime — see the "How to Upload via CLI" guide on the Drive page.
          </div>
        )}

        {!walletConnected && (
          <div style={{ fontSize: 13, color: '#f59e0b', background: '#f59e0b14', border: '1px solid #f59e0b30', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const }}>
            Connect your Petra wallet to upload files.
          </div>
        )}

        {walletConnected && (
          <div
            onDrop={UPLOADS_DISABLED ? undefined : handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              width: '100%', border: '2px dashed var(--border)', borderRadius: 12,
              padding: '24px 16px', textAlign: 'center' as const,
              cursor: UPLOADS_DISABLED ? 'not-allowed' : 'pointer',
              background: 'var(--surface2)', transition: 'border-color 0.2s',
              opacity: UPLOADS_DISABLED ? 0.5 : 1,
            }}
            onClick={() => {
              if (!UPLOADS_DISABLED) {
                document.getElementById('upload-file-input')?.click()
              }
            }}
          >
            <input
              id="upload-file-input"
              type="file"
              multiple
              disabled={UPLOADS_DISABLED}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {files.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Drop files here or click to browse
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {f.name} ({(f.size / 1024).toFixed(1)} KB)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: 'var(--surface2)', color: 'var(--muted)',
            border: '1px solid var(--border)', cursor: 'pointer',
          }}>
            Close
          </button>
          <button
            disabled
            title="Browser uploads are temporarily unavailable"
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--surface2)', color: 'var(--muted)',
              border: 'none', cursor: 'not-allowed',
            }}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}
