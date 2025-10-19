import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UserDetail } from './UserDetail'
import { User } from '@/types/auth'

describe('UserDetail', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    givenName: 'Test',
    familyName: 'User',
    locale: 'en',
    emailVerified: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading skeleton when userId is provided but no initial data', () => {
      render(<UserDetail userId="user-123" />)

      // Check for loading skeleton elements
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should not show loading when initial data is provided', () => {
      render(<UserDetail userId="user-123" initialData={mockUser} />)

      // Should show user name immediately
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('should display user details correctly with initial data', () => {
      render(<UserDetail initialData={mockUser} />)

      // User name
      expect(screen.getByText('Test User')).toBeInTheDocument()

      // Email
      expect(screen.getByText('test@example.com')).toBeInTheDocument()

      // User ID
      expect(screen.getByText('user-123')).toBeInTheDocument()

      // First and last name
      expect(screen.getByText('Test User')).toBeInTheDocument()

      // Locale
      expect(screen.getByText('EN')).toBeInTheDocument()

      // Verification status
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('should display profile image when picture URL is provided', () => {
      render(<UserDetail initialData={mockUser} />)

      const img = screen.getByAlt("Test User's profile")
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('should display initials when no picture URL is provided', () => {
      const userWithoutPicture = { ...mockUser, picture: undefined }
      render(<UserDetail initialData={userWithoutPicture} />)

      // Should show first letter of name
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('should show verified badge when email is verified', () => {
      render(<UserDetail initialData={mockUser} />)

      expect(screen.getByTitle('Verified User')).toBeInTheDocument()
    })

    it('should not show verified badge when email is not verified', () => {
      const unverifiedUser = { ...mockUser, emailVerified: false }
      render(<UserDetail initialData={unverifiedUser} />)

      expect(screen.queryByTitle('Verified User')).not.toBeInTheDocument()
      expect(screen.getByText('Not Verified')).toBeInTheDocument()
    })

    it('should handle optional fields gracefully', () => {
      const minimalUser: User = {
        id: 'minimal-user',
        email: 'minimal@example.com',
        name: 'Minimal User',
        emailVerified: false
      }

      render(<UserDetail initialData={minimalUser} />)

      expect(screen.getByText('Minimal User')).toBeInTheDocument()
      expect(screen.getByText('minimal@example.com')).toBeInTheDocument()

      // Should show N/A for missing optional fields
      const naElements = screen.getAllByText('N/A')
      expect(naElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error State', () => {
    it('should display error message when onError is called', async () => {
      const onError = vi.fn()

      // Mock fetch to fail
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch as any

      render(<UserDetail userId="error-user" onError={onError} />)

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Failed to Load User Details')).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      render(<UserDetail userId="error-user" />)

      await waitFor(() => {
        expect(screen.getByText('Failed to Load User Details')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Try Again')
      expect(retryButton).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no userId and no initial data', () => {
      render(<UserDetail />)

      expect(screen.getByText('No user selected')).toBeInTheDocument()
      expect(screen.getByText('Please select a user to view details')).toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('should call onUserLoad when user data is loaded with initial data', () => {
      const onUserLoad = vi.fn()

      render(<UserDetail initialData={mockUser} onUserLoad={onUserLoad} />)

      expect(onUserLoad).toHaveBeenCalledWith(mockUser)
    })

    it('should call onError when error occurs', async () => {
      const onError = vi.fn()

      render(<UserDetail userId="error-user" onError={onError} />)

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should render with proper responsive classes', () => {
      const { container } = render(<UserDetail initialData={mockUser} />)

      // Check for responsive grid classes
      const gridElement = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
      expect(gridElement).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text for profile image', () => {
      render(<UserDetail initialData={mockUser} />)

      const img = screen.getByAlt("Test User's profile")
      expect(img).toBeInTheDocument()
    })

    it('should have proper titles for icons', () => {
      render(<UserDetail initialData={mockUser} />)

      expect(screen.getByTitle('Verified User')).toBeInTheDocument()
    })
  })

  describe('Image Error Handling', () => {
    it('should fallback to avatar service when image fails to load', () => {
      render(<UserDetail initialData={mockUser} />)

      const img = screen.getByAlt("Test User's profile") as HTMLImageElement

      // Simulate image load error
      const errorEvent = new Event('error')
      img.dispatchEvent(errorEvent)

      // Should update src to fallback URL
      expect(img.src).toContain('ui-avatars.com')
    })
  })

  describe('Mock API Integration', () => {
    it('should fetch user data when userId changes', async () => {
      const { rerender } = render(<UserDetail userId="user-1" />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument()
      })

      // Change userId
      rerender(<UserDetail userId="user-2" />)

      // Should show loading again
      await waitFor(() => {
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
      })
    })

    it('should display mock data correctly after API call', async () => {
      render(<UserDetail userId="123" />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/user123@example.com/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Visual States', () => {
    it('should apply correct styling for verified users', () => {
      const { container } = render(<UserDetail initialData={mockUser} />)

      // Check for emerald/green color classes for verified status
      const verifiedElement = container.querySelector('.text-emerald-700')
      expect(verifiedElement).toBeInTheDocument()
    })

    it('should apply correct styling for unverified users', () => {
      const unverifiedUser = { ...mockUser, emailVerified: false }
      const { container } = render(<UserDetail initialData={unverifiedUser} />)

      // Check for amber/yellow color classes for unverified status
      const unverifiedElement = container.querySelector('.text-amber-700')
      expect(unverifiedElement).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should truncate long email addresses properly', () => {
      const longEmailUser = {
        ...mockUser,
        email: 'verylongemailaddress123456789@example.com'
      }

      const { container } = render(<UserDetail initialData={longEmailUser} />)

      // Check for truncate class
      const emailElement = container.querySelector('.truncate')
      expect(emailElement).toBeInTheDocument()
    })

    it('should display locale in uppercase', () => {
      render(<UserDetail initialData={mockUser} />)

      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('should show additional information section', () => {
      render(<UserDetail initialData={mockUser} />)

      expect(screen.getByText('Additional Information')).toBeInTheDocument()
      expect(screen.getByText('Account Status:')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })
})
