import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW Server
 * Sets up Mock Service Worker for Node.js environment (tests)
 */

export const server = setupServer(...handlers)

/**
 * Setup MSW for testing
 * Use this in your test setup file
 */
export function setupMSWForTests() {
  // Start server before all tests
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'bypass',
    })
  })

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers()
  })

  // Clean up after all tests
  afterAll(() => {
    server.close()
  })
}
