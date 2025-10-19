/**
 * Logout Route
 * Route for logout page with confirmation
 */

import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { LogoutPage } from '../pages/LogoutPage'

export const Route = createFileRoute('/logout')({
  component: LogoutRouteComponent,
})

function LogoutRouteComponent() {
  return (
    <ProtectedRoute>
      <LogoutPage />
    </ProtectedRoute>
  )
}
