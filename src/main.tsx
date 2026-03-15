import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AptosWalletAdapterProvider autoConnect={false}>
        <App />
      </AptosWalletAdapterProvider>
    </BrowserRouter>
  </StrictMode>
)
