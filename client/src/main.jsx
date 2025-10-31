import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AllWalletsProvider } from './services/wallets/AllWalletsProvider';
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<QueryClientProvider client={queryClient}>
<AllWalletsProvider>
          <App />
      </AllWalletsProvider>
    </QueryClientProvider>  </React.StrictMode>,
)
