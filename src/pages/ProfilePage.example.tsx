/**
 * ProfilePage Usage Example
 * Demonstrates how to integrate ProfilePage into your application
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { ProfilePage } from './ProfilePage'
import '../styles.css'

/**
 * Example 1: Basic Usage
 * Simply render the ProfilePage component
 */
function BasicExample() {
  return (
    <div>
      <ProfilePage />
    </div>
  )
}

/**
 * Example 2: With React Router
 * Integrate ProfilePage with routing
 *
 * Note: Requires 'react-router-dom' package
 * Install with: npm install react-router-dom
 * Then uncomment the code below
 */
/*
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function AppWithRouter() {
  return (
    <BrowserRouter>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                홈
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                프로필
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">환영합니다!</h1>
        <Link
          to="/profile"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          프로필 설정으로 이동
        </Link>
      </div>
    </div>
  )
}
*/

/**
 * Example 3: With Authentication Guard
 * Protect the profile page with authentication
 */
function ProtectedProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)

  React.useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      // Replace with your actual auth check
      const token = localStorage.getItem('authToken')
      setIsAuthenticated(!!token)
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">프로필 페이지에 접근하려면 로그인해주세요.</p>
          <button
            onClick={() => {
              // Simulate login
              localStorage.setItem('authToken', 'dummy-token')
              setIsAuthenticated(true)
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  return <ProfilePage />
}

/**
 * Example 4: Custom Layout Wrapper
 * Wrap ProfilePage with custom layout components
 */
function ProfilePageWithLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">내 계정</h1>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            <a
              href="#profile"
              className="block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
            >
              프로필 설정
            </a>
            <a
              href="#security"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              보안 설정
            </a>
            <a
              href="#notifications"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              알림 설정
            </a>
            <a
              href="#privacy"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              개인정보 설정
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <ProfilePage />
        </main>
      </div>
    </div>
  )
}

/**
 * Example 5: Render in a Modal
 * Show ProfilePage in a modal dialog
 */
function ProfileModal() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        프로필 설정 열기
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">프로필 설정</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                  <ProfilePage />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Mount the example
 */
if (typeof window !== 'undefined') {
  const container = document.getElementById('root')
  if (container) {
    const root = createRoot(container)

    // Choose which example to run
    // root.render(<BasicExample />)
    // root.render(<AppWithRouter />)
    // root.render(<ProtectedProfilePage />)
    // root.render(<ProfilePageWithLayout />)
    // root.render(<ProfileModal />)

    // Default example
    root.render(
      <React.StrictMode>
        <BasicExample />
      </React.StrictMode>
    )
  }
}

export {
  BasicExample,
  // AppWithRouter, // Uncomment if using react-router-dom
  ProtectedProfilePage,
  ProfilePageWithLayout,
  ProfileModal,
}
