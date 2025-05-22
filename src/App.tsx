import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { projectId, metadata, networks, wagmiAdapter } from './config'

import "./App.css"
import { ActionButtonList } from './components/ActionButtonList'

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  networks,
  metadata,
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-accent': '#000000',
  },
  socialEnabled: false
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
})

export function App() {

  return (
    <div className={"pages"} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <img src="https://console.icn.global/token.svg" alt="ICN" style={{  height: '150px', padding: '12px' }}/>
      <h1>ICNT Bridge</h1>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <appkit-button />
            <ActionButtonList />
          
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default App
