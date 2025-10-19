import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW Browser Worker
 * Sets up Mock Service Worker for browser environment
 */

export const worker = setupWorker(...handlers)

/**
 * Start MSW in development mode
 * Call this function in your app's entry point (main.tsx)
 */
export async function startMSW() {
  if (import.meta.env.DEV) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
        serviceWorker: {
          // Customize service worker URL if needed
          url: '/mockServiceWorker.js',
        },
      })
      console.log('[MSW] Mocking enabled')
    } catch (error) {
      console.error('[MSW] Failed to start:', error)
    }
  }
}
