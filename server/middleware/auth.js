import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'sigil-generator',
      audience: 'sigil-generator-users'
    }
  )
}

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'sigil-generator',
      audience: 'sigil-generator-users'
    }
  )
}

// Verify JWT token
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret)
}

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No valid token provided'
      })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    try {
      const decoded = verifyToken(token)
      
      // Find user and exclude password
      const user = await User.findById(decoded.userId).select('-password')
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'Access Denied',
          message: 'Invalid token or user not found'
        })
      }

      // Add user to request object
      req.user = user
      req.userId = user._id
      
      next()
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token Expired',
          message: 'Your session has expired. Please log in again.'
        })
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid Token',
          message: 'The provided token is invalid'
        })
      }
      
      throw tokenError
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({
      error: 'Authentication Error',
      message: 'An error occurred during authentication'
    })
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null
      req.userId = null
      return next()
    }

    const token = authHeader.substring(7)

    try {
      const decoded = verifyToken(token)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
        req.userId = user._id
      } else {
        req.user = null
        req.userId = null
      }
    } catch (tokenError) {
      // Invalid token, continue without authentication
      req.user = null
      req.userId = null
    }
    
    next()
  } catch (error) {
    console.error('Optional authentication error:', error)
    req.user = null
    req.userId = null
    next()
  }
}

// Premium user middleware
export const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please log in to access this feature'
    })
  }

  if (!req.user.isPremium) {
    return res.status(403).json({
      error: 'Premium Required',
      message: 'This feature requires a premium account',
      upgradeUrl: '/upgrade'
    })
  }

  next()
}

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please log in to access this feature'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Required',
      message: 'This endpoint requires admin privileges'
    })
  }

  next()
}

// Helper function to check if user can generate
const canUserGenerate = (user) => {
  if (!user) {
    return {
      allowed: false,
      reason: 'not_authenticated',
      message: 'Please log in to generate sigils'
    }
  }

  if (user.isPremium) {
    return {
      allowed: true,
      reason: 'premium'
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastGenDate = user.usageStats.lastGenerationDate ? new Date(user.usageStats.lastGenerationDate) : null
  const lastGenToday = lastGenDate && new Date(lastGenDate.getFullYear(), lastGenDate.getMonth(), lastGenDate.getDate())

  // Reset daily count if it's a new day
  if (!lastGenDate || lastGenToday < today) {
    user.usageStats.dailyGenerations = 0
  }

  // Reset monthly count if it's a new month
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastGenMonth = lastGenDate ? lastGenDate.getMonth() : null
  const lastGenYear = lastGenDate ? lastGenDate.getFullYear() : null

  if (!lastGenDate || lastGenYear < currentYear || (lastGenYear === currentYear && lastGenMonth < currentMonth)) {
    user.usageStats.monthlyGenerations = 0
  }

  // Check daily limit
  if (user.usageStats.dailyGenerations >= user.usageStats.dailyLimit) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      reason: 'daily_limit_reached',
      message: `Daily generation limit reached (${user.usageStats.dailyLimit}). Upgrade to premium for unlimited generations.`,
      resetTime: tomorrow.toISOString()
    }
  }

  // Check monthly limit
  if (user.usageStats.monthlyGenerations >= user.usageStats.monthlyLimit) {
    const nextMonth = new Date(currentYear, currentMonth + 1, 1)
    
    return {
      allowed: false,
      reason: 'monthly_limit_reached',
      message: `Monthly generation limit reached (${user.usageStats.monthlyLimit}). Upgrade to premium for unlimited generations.`,
      resetTime: nextMonth.toISOString()
    }
  }

  return {
    allowed: true,
    reason: 'within_limits'
  }
}

// Rate limiting middleware for sigil generation
export const checkGenerationLimits = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'Please log in to generate sigils'
      })
    }

    const canGenerate = canUserGenerate(req.user)
    
    if (!canGenerate.allowed) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: canGenerate.message,
        reason: canGenerate.reason,
        resetTime: canGenerate.resetTime,
        upgradeUrl: '/upgrade',
        currentUsage: {
          daily: req.user.usageStats.dailyGenerations,
          monthly: req.user.usageStats.monthlyGenerations,
          dailyLimit: req.user.usageStats.dailyLimit,
          monthlyLimit: req.user.usageStats.monthlyLimit
        }
      })
    }

    next()
  } catch (error) {
    console.error('Generation limit check error:', error)
    return res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while checking generation limits'
    })
  }
}

// Record generation middleware (increments counters)
export const recordGeneration = async (req, res, next) => {
  try {
    if (!req.user || req.user.isPremium) {
      // Skip recording for premium users or unauthenticated requests
      return next()
    }

    const user = req.user
    console.log('Before increment:', JSON.stringify(user.usageStats, null, 2))
    user.incrementGenerations()
    console.log('After increment:', JSON.stringify(user.usageStats, null, 2))
    await user.save()
    console.log('After save:', JSON.stringify(user.usageStats, null, 2))

    req.user = user
    next()
  } catch (error) {
    console.error('Record generation error:', error)
    // Don't fail the request, just log the error
    next()
  }
}

// Refresh token middleware
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required'
      })
    }

    try {
      const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET)
      
      if (decoded.type !== 'refresh') {
        return res.status(400).json({
          error: 'Invalid Token',
          message: 'Invalid refresh token type'
        })
      }

      const user = await User.findById(decoded.userId).select('-password')
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'Invalid Token',
          message: 'User not found or inactive'
        })
      }

      // Generate new tokens
      const newToken = generateToken(user._id)
      const newRefreshToken = generateRefreshToken(user._id)

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            accountType: user.accountType,
            isPremium: user.isPremium
          }
        }
      })
    } catch (tokenError) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid or expired refresh token'
      })
    }
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while refreshing token'
    })
  }
}

// Email verification middleware
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please log in to access this feature'
    })
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      error: 'Email Verification Required',
      message: 'Please verify your email address to access this feature',
      verificationUrl: '/verify-email'
    })
  }

  next()
}

// Logging middleware for authenticated requests
export const logAuthenticatedRequest = (req, res, next) => {
  if (req.user) {
    console.log(`${new Date().toISOString()} - Authenticated request: ${req.method} ${req.path} - User: ${req.user.username} (${req.user._id})`)
  }
  next()
}