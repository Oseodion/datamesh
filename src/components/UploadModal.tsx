import { useState, useCallback } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs } from '@shelby-protocol/react'
import { shelbyClient } from '../lib/shelby'

interface Props {
  onClose: () => void
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadModal({ onClose }: Props) {
  const { account, network, signAndSubmitTransaction } = useWallet()
  const [files, setFiles] = useState<File[]>([])
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { mutate: uploadBlobs } = useUploadBlobs({
    client: shelbyClient,
    onSuccess: () => setUploadState('success'),
    onError: (err: Error) => {
      setUploadState('error')
      setErrorMessage(err.message || 'Upload failed')
    },
  })

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setUploadState('idle')
      setErrorMessage('')
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!account || files.length === 0 || !isTestnet) return

    setUploadState('uploading')
    setErrorMessage('')

    const blobs = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer()
        return { blobName: file.name, blobData: new Uint8Array(buffer) }
      })
    )

    const thirtyDaysMicros = 30 * 24 * 60 * 60 * 1_000_000
    const expirationMicros = Date.now() * 1000 + thirtyDaysMicros

    uploadBlobs({
      signer: { account: account.address, signAndSubmitTransaction },
      blobs,
      expirationMicros,
    })
  }, [account, files, signAndSubmitTransaction, uploadBlobs])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
      setUploadState('idle')
      setErrorMessage('')
    }
  }, [])

  const walletConnected = !!account
  const isTestnet = network?.name?.toLowerCase() === 'testnet'

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
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16,
      }} onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {uploadState === 'success' ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#4ade8018', border: '1px solid #4ade8030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                Upload Complete
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 360 }}>
                {files.length} {files.length === 1 ? 'file' : 'files'} uploaded to the Shelby network. Files may take a moment to appear in your dashboard.
              </div>
            </div>
            <button onClick={onClose} style={{
              padding: '11px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--on-accent)',
              border: 'none', cursor: 'pointer', marginTop: 4,
            }}>
              Done
            </button>
          </>
        ) : (
          <>
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

            {!walletConnected && (
              <div style={{ fontSize: 13, color: '#f59e0b', background: '#f59e0b14', border: '1px solid #f59e0b30', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const }}>
                Connect your Petra wallet to upload files.
              </div>
            )}

            {walletConnected && !isTestnet && (
              <div style={{ fontSize: 13, color: '#f59e0b', background: '#f59e0b14', border: '1px solid #f59e0b30', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const }}>
                Please switch your Petra wallet to testnet before uploading.
              </div>
            )}

            {walletConnected && (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  width: '100%', border: '2px dashed var(--border)', borderRadius: 12,
                  padding: '24px 16px', textAlign: 'center' as const,
                  cursor: uploadState === 'uploading' ? 'default' : 'pointer',
                  background: 'var(--surface2)', transition: 'border-color 0.2s',
                }}
                onClick={() => {
                  if (uploadState !== 'uploading') {
                    document.getElementById('upload-file-input')?.click()
                  }
                }}
              >
                <input
                  id="upload-file-input"
                  type="file"
                  multiple
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

            {uploadState === 'uploading' && (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: 'var(--accent)', textAlign: 'center' as const, marginBottom: 8 }}>
                  Uploading to Shelby network...
                </div>
                <div style={{ width: '100%', height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: 'var(--accent)', borderRadius: 2,
                    animation: 'uploadProgress 2s ease-in-out infinite',
                    width: '60%',
                  }} />
                </div>
                <style>{`@keyframes uploadProgress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
              </div>
            )}

            {uploadState === 'error' && (
              <div style={{ fontSize: 13, color: '#ef4444', background: '#ef444414', border: '1px solid #ef444430', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const }}>
                {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: 'var(--surface2)', color: 'var(--muted)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!walletConnected || !isTestnet || files.length === 0 || uploadState === 'uploading'}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: (!walletConnected || !isTestnet || files.length === 0 || uploadState === 'uploading') ? 'var(--surface2)' : 'var(--accent)',
                  color: (!walletConnected || !isTestnet || files.length === 0 || uploadState === 'uploading') ? 'var(--muted)' : 'var(--on-accent)',
                  border: 'none', cursor: (!walletConnected || !isTestnet || files.length === 0 || uploadState === 'uploading') ? 'default' : 'pointer',
                }}
              >
                {uploadState === 'uploading' ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
