# OAuth Google Login Authentication System

## Overview

This is an enterprise-grade OAuth authentication system with Google Login integration. The system provides a complete authentication infrastructure that can be accessed from any component in the application.

## Features

- **Google OAuth 2.0 Integration**: Secure authentication using Google accounts
- **Global Authentication State**: Access auth info from any component using React Context
- **Automatic Token Management**: Tokens are securely stored and automatically refreshed
- **Protected Routes**: Route-level authentication guards
- **Session Persistence**: Authentication state persists across browser sessions
- **Enterprise Security**: Includes CSRF protection, XSS prevention, and secure token storage
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with user-friendly messages

## Architecture

### Directory Structure

```
src/
├── types/
│   └── auth.ts                 # Type definitions for authentication
├── utils/
│   └── tokenStorage.ts         # Secure token storage utility
├── services/
│   └── authService.ts          # API client for authentication
├── contexts/
│   └── AuthContext.tsx         # Global authentication context
├── hooks/
│   └── useAuth.ts              # Custom hooks for auth access
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # Route protection components
└── routes/
    ├── login.tsx               # Login page with Google OAuth
    └── dashboard.tsx           # Protected dashboard example
```

### Key Components

#### 1. AuthContext (src/contexts/AuthContext.tsx)

The central authentication provider that manages global auth state:

```typescript
import { useAuth } from './hooks/useAuth'

const { user, isAuthenticated, login, logout } = useAuth()
```

#### 2. Token Storage (src/utils/tokenStorage.ts)

Secure singleton service for managing tokens:
- Automatic expiration checking
- Refresh token management
- Session persistence

#### 3. Auth Service (src/services/authService.ts)

API client handling all authentication endpoints:
- Google OAuth login
- Token refresh
- Token verification
- Logout

#### 4. Protected Routes (src/components/auth/ProtectedRoute.tsx)

Route guards for authenticated access:

```typescript
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - Your production domain
8. Copy the Client ID

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Backend API Requirements

Your backend needs to implement these endpoints:

#### POST /api/auth/google
```typescript
// Request
{
  "credential": "google_jwt_token"
}

// Response
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "emailVerified": true
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresAt": 1234567890
  }
}
```

#### POST /api/auth/refresh
```typescript
// Request
{
  "refreshToken": "jwt_refresh_token"
}

// Response
{
  "accessToken": "new_jwt_access_token",
  "expiresAt": 1234567890
}
```

#### GET /api/auth/verify
```typescript
// Headers
Authorization: Bearer jwt_access_token

// Response
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    // ... other user fields
  }
}
```

#### POST /api/auth/logout
```typescript
// Headers
Authorization: Bearer jwt_access_token

// Response: 200 OK
```

## Usage Examples

### Using Authentication in Any Component

```typescript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please login</div>
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Creating Protected Routes

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

export const Route = createFileRoute('/protected')({
  component: () => (
    <ProtectedRoute>
      <YourProtectedComponent />
    </ProtectedRoute>
  ),
})
```

### Guest Routes (Login/Register)

```typescript
import { GuestRoute } from '../components/auth/ProtectedRoute'

export const Route = createFileRoute('/login')({
  component: () => (
    <GuestRoute>
      <LoginComponent />
    </GuestRoute>
  ),
})
```

### Making Authenticated API Calls

```typescript
import { authService } from './services/authService'
import { tokenStorage } from './utils/tokenStorage'

// Create authenticated fetch function
const authenticatedFetch = authService.createAuthenticatedFetch(
  () => tokenStorage.getAccessToken()
)

// Use in your API calls
const response = await authenticatedFetch('/api/protected-endpoint')
```

### Custom Hook Utilities

```typescript
import {
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useRequireAuth
} from './hooks/useAuth'

// Get full auth context
const auth = useAuth()

// Just check if authenticated
const isAuthenticated = useIsAuthenticated()

// Get current user
const user = useCurrentUser()

// Require authentication with loading state
const { canAccess, isLoading } = useRequireAuth()
```

## Security Features

### 1. Secure Token Storage
- Tokens stored in localStorage with singleton pattern
- Automatic expiration checking (5-minute buffer)
- Secure token refresh mechanism

### 2. CSRF Protection
- SameSite cookie attributes (if using cookies)
- Token-based authentication
- Origin validation

### 3. XSS Prevention
- React's built-in XSS protection
- Content Security Policy headers (configure in backend)
- No inline scripts

### 4. Session Management
- Automatic token refresh before expiration
- Persistent sessions across page reloads
- Secure logout with token revocation

## Error Handling

The system includes comprehensive error handling:

```typescript
import { AuthError, AuthErrorCode } from './types/auth'

try {
  await login(credential)
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        // Handle invalid credentials
        break
      case AuthErrorCode.NETWORK_ERROR:
        // Handle network error
        break
      // ... other cases
    }
  }
}
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`

3. Start the development server:
```bash
npm run dev
```

4. Navigate to `http://localhost:3000/login`

## Testing

The authentication system can be tested without a backend by:

1. Temporarily modifying `authService.ts` to return mock data
2. Using a mock backend server
3. Implementing backend endpoints as specified above

## Production Considerations

1. **Environment Variables**: Use proper environment variable management
2. **HTTPS**: Always use HTTPS in production
3. **Token Security**: Consider using httpOnly cookies for tokens
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Monitoring**: Add logging and monitoring for auth events
6. **Session Timeout**: Configure appropriate session timeouts
7. **Multi-factor Authentication**: Consider adding MFA for enhanced security

## Troubleshooting

### Common Issues

1. **"VITE_GOOGLE_CLIENT_ID is not set"**
   - Check your `.env` file exists
   - Ensure variable name is correct
   - Restart dev server after adding env vars

2. **"useAuth must be used within an AuthProvider"**
   - Ensure AuthProvider wraps your app in `main.tsx`
   - Check component hierarchy

3. **Token refresh fails**
   - Verify backend `/api/auth/refresh` endpoint
   - Check refresh token is being stored correctly
   - Verify token expiration times

4. **Google login popup blocked**
   - Check browser popup settings
   - Verify OAuth redirect URIs in Google Console
   - Ensure Google Client ID is correct

## License

This authentication system is part of the application and follows the same license.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
