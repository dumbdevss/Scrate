import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CampProvider } from "@campnetwork/origin/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@campnetwork/origin/react";



const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<QueryClientProvider client={queryClient}>
      <CampProvider clientId="fce77d7a-8085-47ca-adff-306a933e76aa">
          <App />
      </CampProvider>
    </QueryClientProvider>  </React.StrictMode>,
)
