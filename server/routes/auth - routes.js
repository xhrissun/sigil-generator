import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/User.js'
import { 
  generateToken, 
  generateRefreshToken, 
  authenticate, 
  refreshToken,
  optionalAuth,
  recordGeneration,
  checkGenerationLimits 
} from '../middleware/auth.js'

const router = express.Router()

// Helper function to get user's current usage stats
const getUserUsageStats = (user) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastGenDate = user.lastGenerationDate ? new Date(user.lastGenerationDate) : null
  const lastGenToday = lastGenDate && new Date(lastGenDate.getFullYear(), lastGenDate.getMonth(), lastGenDate.getDate())

  // Calculate remaining counts
  let dailyGenerations = user.dailyGenerations || 0
  let monthlyGenerations = user.monthlyGenerations || 0

  // Reset daily count if it's a new day
  if (!lastGenDate || lastGenToday < today) {
    dailyGenerations = 0
  }

  // Reset monthly count if it's a new month
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastGenMonth = lastGenDate ? lastGenDate.getMonth() : null
  const lastGenYear = lastGenDate ? lastGenDate.getFullYear() : null

  if (!lastGenDate || lastGenYear < currentYear || (lastGenYear === currentYear && lastGenMonth < currentMonth)) {
    monthlyGenerations = 0
  }

  const dailyLimit = user.isPremium ? Number.MAX_SAFE_INTEGER : (user.dailyLimit || 5)
  const monthlyLimit = user.isPremium ? Number.MAX_SAFE_INTEGER : (user.monthlyLimit || 50)

  return {
    dailyGenerations,
    monthlyGenerations,
    totalGenerations: user.totalGenerations || 0,
    dailyLimit,
    monthlyLimit,
    remainingDaily: user.isPremium ? Number.MAX_SAFE_INTEGER : Math.max(0, dailyLimit - dailyGenerations),
    remainingMonthly: user.isPremium ? Number.MAX_SAFE_INTEGER : Math.max(0, monthlyLimit - monthlyGenerations),
    lastGenerationDate: user.lastGenerationDate
  }
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName,
      referralCode 
    } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username, email, and password are required'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    })

    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: existingUser.email === email.toLowerCase() 
          ? 'An account with this email already exists'
          : 'This username is already taken'
      })
    }

    // Handle referral
    let referredBy = null
    if (referralCode) {
      const referrer = await User.findOne({ referralCode })
      if (referrer) {
        referredBy = referrer._id
        referrer.referralCount += 1
        await referrer.save()
      }
    }

    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      referredBy,
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
      // Initialize usage stats
      dailyGenerations: 0,
      monthlyGenerations: 0,
      totalGenerations: 0,
      dailyLimit: 5,
      monthlyLimit: 50,
      lastGenerationDate: null
    })

    await user.save()

    // Generate tokens
    const token = generateToken(user._id)
    const refToken = generateRefreshToken(user._id)

    // Update login stats
    user.loginCount += 1
    user.lastLoginDate = new Date()
    await user.save()

    const usageStats = getUserUsageStats(user)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        refreshToken: refToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          accountType: user.accountType,
          isPremium: user.isPremium,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          createdAt: user.createdAt,
          preferences: user.preferences,
          usageStats
        }
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: Object.values(error.errors).map(e => e.message).join(', ')
      })
    }

    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during registration'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email/username and password are required'
      })
    }

    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier).select('+password')

    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email/username or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email/username or password'
      })
    }

    // Generate tokens
    const token = generateToken(user._id)
    const refreshTokenValue = generateRefreshToken(user._id)

    // Update login stats
    user.loginCount += 1
    user.lastLoginDate = new Date()
    await user.save()

    // Remove password from response
    user.password = undefined

    const usageStats = getUserUsageStats(user)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          accountType: user.accountType,
          isPremium: user.isPremium,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          createdAt: user.createdAt,
          lastLoginDate: user.lastLoginDate,
          preferences: user.preferences,
          usageStats
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during login'
    })
  }
})

// Refresh token endpoint
router.post('/refresh', refreshToken)

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user
    const usageStats = getUserUsageStats(user)

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          accountType: user.accountType,
          isPremium: user.isPremium,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
          lastLoginDate: user.lastLoginDate,
          preferences: user.preferences,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          usageStats
        }
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching profile'
    })
  }
})

// Update user profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      preferences,
      avatar
    } = req.body

    const user = req.user
    
    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar
    
    // Update preferences if provided
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme
      if (preferences.notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...preferences.notifications
        }
      }
      if (preferences.defaultSigilCategory) {
        user.preferences.defaultSigilCategory = preferences.defaultSigilCategory
      }
    }

    await user.save()

    const usageStats = getUserUsageStats(user)

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          accountType: user.accountType,
          isPremium: user.isPremium,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          bio: user.bio,
          preferences: user.preferences,
          usageStats
        }
      }
    })

  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: Object.values(error.errors).map(e => e.message).join(', ')
      })
    }

    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while updating profile'
    })
  }
})

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Current password and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters long'
      })
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password')

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid Password',
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while changing password'
    })
  }
})

// Logout (client-side token invalidation)
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required'
      })
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save()

    // In a real app, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`)

    res.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link',
      // In development, include the token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while processing password reset request'
    })
  }
})

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Reset token and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters long'
      })
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true
    })

    if (!user) {
      return res.status(400).json({
        error: 'Invalid Token',
        message: 'Password reset token is invalid or expired'
      })
    }

    // Update password
    user.password = newPassword
    user.passwordResetToken = null
    user.passwordResetExpires = null
    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while resetting password'
    })
  }
})

// Email verification
router.post('/verify-email', authenticate, async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Verification token is required'
      })
    }

    const user = req.user

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Already Verified',
        message: 'Email is already verified'
      })
    }

    if (user.emailVerificationToken !== token) {
      return res.status(400).json({
        error: 'Invalid Token',
        message: 'Invalid verification token'
      })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = null
    await user.save()

    res.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while verifying email'
    })
  }
})

// Resend email verification
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const user = req.user

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Already Verified',
        message: 'Email is already verified'
      })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = verificationToken
    await user.save()

    // In a real app, send email here
    console.log(`Email verification token for ${user.email}: ${verificationToken}`)

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      // In development, include the token
      ...(process.env.NODE_ENV === 'development' && { verificationToken })
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while sending verification email'
    })
  }
})

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params

    if (!username || username.length < 3) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username must be at least 3 characters long'
      })
    }

    const existingUser = await User.findOne({ username })

    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    })

  } catch (error) {
    console.error('Check username error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while checking username availability'
    })
  }
})

// Check email availability
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format'
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Email is already registered' : 'Email is available'
    })

  } catch (error) {
    console.error('Check email error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while checking email availability'
    })
  }
})

// Get user's usage statistics
router.get('/usage-stats', authenticate, async (req, res) => {
  try {
    const user = req.user
    const usageStats = getUserUsageStats(user)

    res.json({
      success: true,
      data: {
        accountType: user.accountType,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        usageStats: {
          daily: {
            used: usageStats.dailyGenerations,
            limit: usageStats.dailyLimit,
            remaining: usageStats.remainingDaily
          },
          monthly: {
            used: usageStats.monthlyGenerations,
            limit: usageStats.monthlyLimit,
            remaining: usageStats.remainingMonthly
          },
          total: usageStats.totalGenerations,
          lastGenerationDate: usageStats.lastGenerationDate
        }
      }
    })
  } catch (error) {
    console.error('Get usage stats error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching usage statistics'
    })
  }
})

// Record sigil generation - This endpoint increments usage counters
router.post('/record-generation', authenticate, recordGeneration, async (req, res) => {
  try {
    const user = req.user
    const usageStats = getUserUsageStats(user)

    res.json({
      success: true,
      message: 'Generation recorded successfully',
      usageStats
    })
  } catch (error) {
    console.error('Record generation error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to record generation'
    })
  }
})

// Check if user can generate (without recording)
router.get('/can-generate', authenticate, async (req, res) => {
  try {
    const user = req.user

    if (user.isPremium) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'premium'
      })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastGenDate = user.lastGenerationDate ? new Date(user.lastGenerationDate) : null
    const lastGenToday = lastGenDate && new Date(lastGenDate.getFullYear(), lastGenDate.getMonth(), lastGenDate.getDate())

    // Get current usage counts
    let dailyGenerations = user.dailyGenerations || 0
    let monthlyGenerations = user.monthlyGenerations || 0

    // Reset daily count if it's a new day
    if (!lastGenDate || lastGenToday < today) {
      dailyGenerations = 0
    }

    // Reset monthly count if it's a new month
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastGenMonth = lastGenDate ? lastGenDate.getMonth() : null
    const lastGenYear = lastGenDate ? lastGenDate.getFullYear() : null

    if (!lastGenDate || lastGenYear < currentYear || (lastGenYear === currentYear && lastGenMonth < currentMonth)) {
      monthlyGenerations = 0
    }

    // Check limits
    const dailyLimit = user.dailyLimit || 5
    const monthlyLimit = user.monthlyLimit || 50

    if (dailyGenerations >= dailyLimit) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      return res.json({
        success: true,
        allowed: false,
        reason: 'daily_limit_reached',
        message: `Daily generation limit reached (${dailyLimit}). Upgrade to premium for unlimited generations.`,
        resetTime: tomorrow.toISOString(),
        currentUsage: {
          daily: dailyGenerations,
          monthly: monthlyGenerations,
          dailyLimit,
          monthlyLimit
        }
      })
    }

    if (monthlyGenerations >= monthlyLimit) {
      const nextMonth = new Date(currentYear, currentMonth + 1, 1)
      
      return res.json({
        success: true,
        allowed: false,
        reason: 'monthly_limit_reached',
        message: `Monthly generation limit reached (${monthlyLimit}). Upgrade to premium for unlimited generations.`,
        resetTime: nextMonth.toISOString(),
        currentUsage: {
          daily: dailyGenerations,
          monthly: monthlyGenerations,
          dailyLimit,
          monthlyLimit
        }
      })
    }

    res.json({
      success: true,
      allowed: true,
      reason: 'within_limits',
      currentUsage: {
        daily: dailyGenerations,
        monthly: monthlyGenerations,
        dailyLimit,
        monthlyLimit,
        remainingDaily: dailyLimit - dailyGenerations,
        remainingMonthly: monthlyLimit - monthlyGenerations
      }
    })

  } catch (error) {
    console.error('Check generation ability error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while checking generation ability'
    })
  }
})

// Legacy endpoint for compatibility (deprecated)
router.post('/usage', authenticate, async (req, res) => {
  try {
    const user = req.user
    const usageStats = getUserUsageStats(user)

    res.json({
      success: true,
      usageStats
    })
  } catch (error) {
    console.error('Usage update error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update usage statistics'
    })
  }
})

export default router