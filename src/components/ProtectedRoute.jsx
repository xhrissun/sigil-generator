import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader, Crown, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requirePremium = false,
  requireEmailVerification = false,
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, isPremium, loading, initialized } = useAuth()
  const location = useLocation()

  // Show loading spinner while auth is initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Loader className="h-8 w-8 text-primary-400 mx-auto" />
          </motion.div>
          <p className="text-gray-300">Loading...</p>
        </motion.div>
      </div>
    )
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Redirect to upgrade page if premium is required but user is not premium
  if (requirePremium && isAuthenticated && !isPremium) {
    return (
      <div className="min-h-screen pt-16 py-20 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center"
          >
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-mystical font-bold text-gradient mb-4">
              Premium Required
            </h1>
            <p className="text-gray-300 mb-6">
              This feature requires a premium account to access.
            </p>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/upgrade'}
                className="btn-primary w-full"
              >
                Upgrade to Premium
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="btn-secondary w-full"
              >
                Go Back
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show email verification required message
  if (requireEmailVerification && isAuthenticated && !user?.isEmailVerified) {
    return (
      <div className="min-h-screen pt-16 py-20 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center"
          >
            <Shield className="h-16 w-16 text-primary-400 mx-auto mb-6" />
            <h1 className="text-2xl font-mystical font-bold text-gradient mb-4">
              Email Verification Required
            </h1>
            <p className="text-gray-300 mb-6">
              Please verify your email address to access this feature. Check your inbox for a verification link.
            </p>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // In a real app, this would call the resend verification API
                  alert('Verification email sent!')
                }}
                className="btn-primary w-full"
              >
                Resend Verification Email
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="btn-secondary w-full"
              >
                Go Back
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Redirect unauthenticated users away from auth-only pages
  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />
  }

  // Render the protected component
  return children
}

// Higher-order component for easier usage
export const withAuth = (Component, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

// Specific route protectors for common use cases
export const AuthRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
)

export const PremiumRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true} requirePremium={true}>
    {children}
  </ProtectedRoute>
)

export const VerifiedRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true} requireEmailVerification={true}>
    {children}
  </ProtectedRoute>
)

export const GuestRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute