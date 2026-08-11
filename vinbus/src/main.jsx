import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ''

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
 <BrowserRouter>
    <StrictMode>
      {clerkPubKey ? (
        <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      ) : (
        <App />
      )}
    </StrictMode>
 </BrowserRouter>
)
