import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Import authentication provider
import { AuthProvider } from './contexts/AuthContext'
// Import consent provider
import { ConsentProvider } from './contexts/ConsentContext'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!GOOGLE_CLIENT_ID) {
  console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables')
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ConsentProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </GoogleOAuthProvider>
      </ConsentProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
