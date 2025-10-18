/**
 * Profile Route
 * Protected route for user profile management
 */

import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { ProfilePage } from '../pages/ProfilePage'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
})

function ProfileRoute() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
