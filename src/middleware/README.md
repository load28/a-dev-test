# Authentication Middleware

Enterprise-grade authentication middleware for TanStack Router with automatic redirects and route guards.

## Features

- **Route-level authentication guards**: Protect routes using `beforeLoad` hooks
- **Automatic redirects**: Redirect unauthenticated users to login
- **Guest-only routes**: Prevent authenticated users from accessing login pages
- **Token validation**: Automatic token expiration checking
- **Flexible configuration**: Customizable route patterns and redirect paths
- **Type-safe**: Full TypeScript support

## Quick Start

### Protect a Route

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../middleware/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})
```

### Guest-Only Route (Login)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { guestOnly } from '../middleware/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: guestOnly,
  component: LoginPage,
})
```

## Available Guards

### `requireAuth`

Requires user authentication. Redirects to login if not authenticated.

```typescript
export const Route = createFileRoute('/protected')({
  beforeLoad: requireAuth,
  component: ProtectedPage,
})
```

When redirected to login, the original path is preserved:
- User tries to access `/dashboard`
- Redirected to `/login?redirect=/dashboard`
- After successful login, user is redirected back to `/dashboard`

### `guestOnly`

Only allows unauthenticated users. Redirects to dashboard if authenticated.

```typescript
export const Route = createFileRoute('/login')({
  beforeLoad: guestOnly,
  component: LoginPage,
})
```

### `isAuthenticated`

Check if user is currently authenticated.

```typescript
import { isAuthenticated } from '../middleware/auth'

if (isAuthenticated()) {
  // User is logged in
}
```

### `checkRouteAccess`

Programmatically check if a user can access a route.

```typescript
import { checkRouteAccess } from '../middleware/auth'

const result = checkRouteAccess('/dashboard')

if (!result.canAccess) {
  console.log('Redirect to:', result.redirectTo)
  console.log('Reason:', result.reason)
}
```

## Advanced Usage

### Custom Auth Guard

Create a custom guard with specific validation logic:

```typescript
import { createAuthGuard } from '../middleware/auth'
import { redirect } from '@tanstack/react-router'
import { tokenStorage } from '../utils/tokenStorage'

const requireAdmin = createAuthGuard({
  validate: () => {
    const tokens = tokenStorage.getTokens()
    return tokens?.user?.role === 'admin'
  },
  onUnauthorized: ({ location }) => {
    throw redirect({
      to: '/unauthorized',
      search: { from: location.pathname }
    })
  }
})

export const Route = createFileRoute('/admin')({
  beforeLoad: requireAdmin,
  component: AdminPage,
})
```

### Combine Multiple Guards

Chain multiple guards together:

```typescript
import { combineGuards, requireAuth } from '../middleware/auth'
import { requireAdmin } from './customGuards'

export const Route = createFileRoute('/admin/settings')({
  beforeLoad: combineGuards([requireAuth, requireAdmin]),
  component: AdminSettingsPage,
})
```

### Custom Route Configuration

Override default route patterns:

```typescript
import { isProtectedRoute } from '../middleware/auth'

const customConfig = {
  protectedRoutes: ['/dashboard', '/profile', '/settings'],
  guestOnlyRoutes: ['/login', '/register'],
  loginPath: '/auth/login',
  defaultAuthenticatedPath: '/home',
}

const needsAuth = isProtectedRoute('/dashboard', customConfig)
```

### Get Redirect Path After Login

```typescript
import { getRedirectPath } from '../middleware/auth'
import { useSearch } from '@tanstack/react-router'

function LoginPage() {
  const search = useSearch({ from: '/login' })
  const redirectPath = getRedirectPath(search)

  const handleLogin = async () => {
    await login()
    navigate({ to: redirectPath })
  }
}
```

## Configuration

### Default Configuration

```typescript
{
  protectedRoutes: ['/dashboard'],
  guestOnlyRoutes: ['/login'],
  loginPath: '/login',
  defaultAuthenticatedPath: '/dashboard',
}
```

### Modify Configuration

```typescript
import { authMiddleware } from '../middleware/auth'

// Update configuration
authMiddleware.config.protectedRoutes.push('/profile')
authMiddleware.config.loginPath = '/auth/login'
```

## How It Works

### Token Validation

The middleware checks for valid authentication tokens:

1. Checks if tokens exist in storage
2. Validates token expiration time
3. Clears expired tokens automatically
4. Returns authentication status

### Redirect Flow

**Protected Route (requireAuth)**:
```
User → /dashboard
         ↓ (not authenticated)
      /login?redirect=/dashboard
         ↓ (after login)
      /dashboard
```

**Guest-Only Route (guestOnly)**:
```
Authenticated User → /login
                      ↓
                   /dashboard
```

## Integration with Components

The middleware works alongside component-based protection:

```typescript
// Route-level (recommended)
export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})

// Component-level (additional protection)
function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

## Error Handling

The middleware throws redirects using TanStack Router's `redirect` function:

```typescript
throw redirect({
  to: '/login',
  search: { redirect: currentPath }
})
```

This is the recommended way to handle navigation in TanStack Router and ensures proper history management.

## Best Practices

1. **Use route-level guards** for primary protection
2. **Combine with component guards** for defense in depth
3. **Always preserve redirect paths** for better UX
4. **Clear expired tokens** to prevent stale sessions
5. **Use TypeScript** for type-safe route definitions

## Example: Full Route Setup

```typescript
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../middleware/auth'
import { DashboardLayout } from '../components/layouts/DashboardLayout'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <DashboardLayout>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </DashboardLayout>
  )
}
```

```typescript
// src/routes/login.tsx
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { guestOnly, getRedirectPath } from '../middleware/auth'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/login')({
  beforeLoad: guestOnly,
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
  const redirectPath = getRedirectPath(search)

  const handleLogin = async (credentials: Credentials) => {
    await login(credentials)
    navigate({ to: redirectPath })
  }

  return (
    <div>
      {/* Login form */}
    </div>
  )
}
```

## Testing

```typescript
import { isAuthenticated, checkRouteAccess } from '../middleware/auth'
import { tokenStorage } from '../utils/tokenStorage'

describe('Auth Middleware', () => {
  it('should detect authenticated user', () => {
    tokenStorage.saveTokens({
      accessToken: 'valid-token',
      expiresAt: Date.now() + 3600000,
    })
    expect(isAuthenticated()).toBe(true)
  })

  it('should redirect unauthenticated users', () => {
    tokenStorage.clearTokens()
    const result = checkRouteAccess('/dashboard')
    expect(result.canAccess).toBe(false)
    expect(result.redirectTo).toBe('/login')
  })
})
```

## Troubleshooting

### Redirect Loop

If you experience redirect loops:
1. Check that login and dashboard routes are configured correctly
2. Ensure tokens are being saved after successful login
3. Verify token expiration times are set correctly

### Types Not Found

Make sure to import types from the correct location:

```typescript
import type { AuthRouteConfig } from '../middleware/auth'
```

### Route Not Protected

Verify that:
1. `beforeLoad: requireAuth` is added to route config
2. Route path matches protected routes pattern
3. TanStack Router is properly configured
