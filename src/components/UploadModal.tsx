import { useState, useCallback } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs } from '@shelby-protocol/react'
import { shelbynetClient } from '../lib/shelby'
import CLIGuideModal from './CLIGuideModal'

interface Props {
  onClose: () => void
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadModal({ onClose }: Props) {
  const { account, signAndSubmitTransaction } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [extraFilesNote, setExtraFilesNote] = useState(false)
  const [showCLIGuide, setShowCLIGuide] = useState(false)

  const { mutate: uploadBlobs } = useUploadBlobs({
    client: shelbynetClient,
    onSuccess: () => setUploadState('success'),
    onError: (err: Error) => {
      setUploadState('error')
      setErrorMessage(err.message || 'Upload failed')
    },
  })

  const pickFirstFile = useCallback((fileList: FileList) => {
    setExtraFilesNote(fileList.length > 1)
    setFile(fileList[0] ?? null)
    setUploadState('idle')
    setErrorMessage('')
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      pickFirstFile(e.target.files)
    }
  }, [pickFirstFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      pickFirstFile(e.dataTransfer.files)
    }
  }, [pickFirstFile])

  const handleUpload = useCallback(async () => {
    if (!account || !file) return

    setUploadState('uploading')
    setErrorMessage('')

    try {
      // Without a location hint, the write has neither an account preference
      // nor an explicit location, and the simulation aborts with "The account
      // has no preference set and the write supplied no location input."
      // Resolve one dynamically (same approach as the upload script and
      // `shelby locations`) rather than hardcoding a name.
      const locations = await shelbynetClient.metadata.getLocationNames()
      const locationHint = locations[0]
      if (!locationHint) {
        throw new Error('No Shelby write locations are currently available.')
      }

      const buffer = await file.arrayBuffer()
      const thirtyDaysMicros = 30 * 24 * 60 * 60 * 1_000_000
      const expirationMicros = Date.now() * 1000 + thirtyDaysMicros

      uploadBlobs({
        // wallet-adapter-react bundles its own nested @aptos-labs/ts-sdk, so
        // `account.address` is structurally a different (but functionally
        // identical) AccountAddress class than the one @shelby-protocol/react's
        // types expect from the top-level ts-sdk. Safe to cast across.
        signer: { account: account.address as any, signAndSubmitTransaction },
        blobs: [{ blobName: file.name, blobData: new Uint8Array(buffer) }],
        expirationMicros,
        options: { locationHint },
      })
    } catch (err) {
      setUploadState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resolve an upload location')
    }
  }, [account, file, signAndSubmitTransaction, uploadBlobs])

  const walletConnected = !!account
  const isUploading = uploadState === 'uploading'

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
                {file?.name} uploaded to the Shelby network. It may take a moment to appear in your dashboard.
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
                Select a file to upload directly from your browser. Files are stored on the decentralized Shelby network with a 30-day expiration.
              </div>
            </div>

            <div style={{ fontSize: 13, color: '#60a5fa', background: '#60a5fa14', border: '1px solid #60a5fa30', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const, lineHeight: 1.5 }}>
              Uploading needs 2 approvals in your wallet - one to register the file, one to confirm the upload. That's normal, not an error.
            </div>

            {!walletConnected && (
              <div style={{ fontSize: 13, color: '#f59e0b', background: '#f59e0b14', border: '1px solid #f59e0b30', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const }}>
                Connect your Petra wallet to upload files.
              </div>
            )}

            {walletConnected && (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  width: '100%', border: '2px dashed var(--border)', borderRadius: 12,
                  padding: '24px 16px', textAlign: 'center' as const,
                  cursor: isUploading ? 'default' : 'pointer',
                  background: 'var(--surface2)', transition: 'border-color 0.2s',
                }}
                onClick={() => {
                  if (!isUploading) {
                    document.getElementById('upload-file-input')?.click()
                  }
                }}
              >
                <input
                  id="upload-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {!file ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Drop a file here or click to browse
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            )}

            {extraFilesNote && (
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' as const }}>
                Only one file at a time - the rest were skipped.
              </div>
            )}

            {uploadState === 'uploading' && (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: 'var(--accent)', textAlign: 'center' as const, marginBottom: 8 }}>
                  Check your Petra wallet for approval prompts...
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
              <div style={{ fontSize: 13, color: '#ef4444', background: '#ef444414', border: '1px solid #ef444430', borderRadius: 10, padding: '10px 16px', width: '100%', textAlign: 'center' as const, lineHeight: 1.6 }}>
                {errorMessage}
                <div style={{ marginTop: 6 }}>
                  Browser upload not working?{' '}
                  <a href="#" onClick={e => { e.preventDefault(); setShowCLIGuide(true) }} style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'underline' }}>
                    Try the CLI instead
                  </a>
                </div>
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
                disabled={!walletConnected || !file || isUploading}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: (!walletConnected || !file || isUploading) ? 'var(--surface2)' : 'var(--accent)',
                  color: (!walletConnected || !file || isUploading) ? 'var(--muted)' : 'var(--on-accent)',
                  border: 'none', cursor: (!walletConnected || !file || isUploading) ? 'default' : 'pointer',
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' as const }}>
              Prefer not to deal with wallet popups?{' '}
              <a href="#" onClick={e => { e.preventDefault(); setShowCLIGuide(true) }} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                Use the CLI instead
              </a>
            </div>
          </>
        )}
      </div>

      {showCLIGuide && <CLIGuideModal onClose={() => setShowCLIGuide(false)} />}
    </div>
  )
}
