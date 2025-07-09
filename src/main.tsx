import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppWrapper } from './context/app-wrapper'
import { Toaster } from './components/ui/sonner'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper>
        <App />
        <Toaster />
    </AppWrapper>
  </React.StrictMode>
)
