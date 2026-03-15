import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { shelbyClient } from '../lib/shelby'
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'

export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

export function useUpload() {
  const { account, signTransaction } = useWallet()
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, blobName: string) => {
    if (!account) return
    setError(null)
    setStatus('uploading')
    try {
      const buffer = await file.arrayBuffer()
      const data = new Uint8Array(buffer)

      // Create a custom signer that wraps the Petra wallet
      const aptosAccount = {
        accountAddress: account.address,
        publicKey: account.publicKey,
        signTransaction: async (tx: any) => {
          const signed = await signTransaction(tx)
          return signed
        },
      }

      await shelbyClient.upload({
        blobData: data,
        signer: aptosAccount as any,
        blobName,
        expirationMicros: Date.now() * 1000 + 86400000000 * 30,
      })
      setStatus('done')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload failed')
      console.error('Upload error:', err)
    }
  }

  return { upload, status, error }
}
