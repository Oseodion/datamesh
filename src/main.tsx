import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShelbyClientProvider } from '@shelby-protocol/react'
import { shelbynetClient } from './lib/shelby'
import './index.css'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ShelbyClientProvider client={shelbynetClient}>
        <BrowserRouter>
          <AptosWalletAdapterProvider autoConnect={false}>
            <App />
          </AptosWalletAdapterProvider>
        </BrowserRouter>
      </ShelbyClientProvider>
    </QueryClientProvider>
  </StrictMode>
)
