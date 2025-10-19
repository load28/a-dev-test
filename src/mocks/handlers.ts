import { http, HttpResponse } from 'msw'

/**
 * MSW Handlers
 * Mock API endpoints for development and testing
 */

export const handlers = [
  /**
   * POST /api/logout
   * Handles user logout
   */
  http.post('/api/logout', async ({ request }) => {
    try {
      // Extract authorization header
      const authHeader = request.headers.get('Authorization')

      if (!authHeader) {
        return HttpResponse.json(
          {
            success: false,
            message: 'No authorization token provided'
          },
          { status: 401 }
        )
      }

      // Validate token format (Bearer token)
      const token = authHeader.replace('Bearer ', '')

      if (!token || token.length === 0) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Invalid token format'
          },
          { status: 401 }
        )
      }

      // Simulate network delay (100-300ms)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 200 + 100)
      )

      // Mock successful logout
      console.log('[MSW] Logout successful for token:', token.substring(0, 20) + '...')

      return HttpResponse.json(
        {
          success: true,
          message: 'Successfully logged out'
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    } catch (error) {
      console.error('[MSW] Logout error:', error)

      return HttpResponse.json(
        {
          success: false,
          message: 'Internal server error during logout'
        },
        { status: 500 }
      )
    }
  }),

  /**
   * GET /api/logout (if GET method is also needed)
   * Some implementations use GET for logout
   */
  http.get('/api/logout', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'No authorization token provided'
        },
        { status: 401 }
      )
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 200 + 100)
    )

    console.log('[MSW] Logout (GET) successful')

    return HttpResponse.json(
      {
        success: true,
        message: 'Successfully logged out'
      },
      { status: 200 }
    )
  }),
]
