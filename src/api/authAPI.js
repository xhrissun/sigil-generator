import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
authAPI.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    console.log('🚫 API Error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      isRetry: originalRequest._retry,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          console.log('🔄 401 detected, attempting token refresh...');
          
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          const { token, refreshToken: newRefreshToken } = response.data.data
          
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Update the authorization header
          authAPI.defaults.headers.Authorization = `Bearer ${token}`
          originalRequest.headers.Authorization = `Bearer ${token}`

          console.log('✅ Token refreshed, retrying original request');
          return authAPI(originalRequest)
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError)
        
        // Clear tokens and redirect to login only if not already there
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        
        // Only redirect if we're not already on login/register pages
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          console.log('🔀 Redirecting to login due to auth failure...');
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    console.error('Auth API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Set auth token for API calls
export const setAuthToken = (token) => {
  if (token) {
    authAPI.defaults.headers.Authorization = `Bearer ${token}`
  } else {
    delete authAPI.defaults.headers.Authorization
  }
}

// Clear auth token
export const clearAuthToken = () => {
  delete authAPI.defaults.headers.Authorization
}

// Authentication endpoints
export const register = async (userData) => {
  try {
    const response = await authAPI.post('/register', userData)
    console.log('📦 Register API response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Register API error:', error.response?.data);
    throw error.response?.data || error
  }
}

export const login = async (identifier, password) => {
  try {
    const response = await authAPI.post('/login', {
      identifier,
      password
    })
    console.log('📦 Login API response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Login API error:', error.response?.data);
    throw error.response?.data || error
  }
}

export const logout = async () => {
  try {
    const response = await authAPI.post('/logout')
    return response.data
  } catch (error) {
    console.error('Logout error:', error)
    // Don't throw on logout error, just log it
    return { success: false }
  }
}

export const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    })
    console.log('📦 Refresh token API response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Refresh token API error:', error.response?.data);
    throw error.response?.data || error
  }
}

export const getCurrentUser = async () => {
  try {
    console.log('📡 Fetching current user...');
    const response = await authAPI.get('/me')
    console.log('📦 Get current user API response:', response.data);
    console.log('✅ Current user fetched successfully');
    
    // Return the full response for better debugging
    return response.data
  } catch (error) {
    console.error('❌ Get current user error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      responseData: error.response?.data
    });
    throw error.response?.data || error
  }
}

export const updateProfile = async (profileData) => {
  try {
    const response = await authAPI.patch('/me', profileData)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await authAPI.post('/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await authAPI.post('/forgot-password', { email })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await authAPI.post('/reset-password', {
      token,
      newPassword
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const verifyEmail = async (token) => {
  try {
    const response = await authAPI.post('/verify-email', { token })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const resendVerification = async () => {
  try {
    const response = await authAPI.post('/resend-verification')
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const checkUsernameAvailability = async (username) => {
  try {
    const response = await authAPI.get(`/check-username/${username}`)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const checkEmailAvailability = async (email) => {
  try {
    const response = await authAPI.get(`/check-email/${email}`)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const getUsageStats = async () => {
  try {
    const response = await authAPI.get('/usage-stats')
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Check if user can generate sigils (without recording a generation)
export const canGenerate = async () => {
  try {
    console.log('📡 Checking generation ability...');
    const response = await authAPI.get('/can-generate')
    console.log('📦 Can generate response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Can generate error:', error.response?.data);
    throw error.response?.data || error
  }
}

// Record a sigil generation (increments usage counters)
export const recordGeneration = async () => {
  try {
    console.log('📡 Recording sigil generation...');
    const response = await authAPI.post('/record-generation')
    console.log('📦 Record generation response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Record generation error:', error.response?.data);
    throw error.response?.data || error
  }
}

// Sync user data (including updated usage stats)
export const syncUserData = async () => {
  try {
    console.log('📡 Syncing user data...');
    const response = await getCurrentUser()
    console.log('📦 Sync user data response:', response);
    return response
  } catch (error) {
    console.error('❌ Sync user data error:', error);
    throw error
  }
}

// Utility functions
export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    const isExpired = payload.exp < currentTime
    
    console.log('🕒 Token expiry check:', {
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString(),
      isExpired: isExpired
    });
    
    return isExpired
  } catch (error) {
    console.error('❌ Token parsing error:', error);
    return true
  }
}

export const getTokenExpiryTime = (token) => {
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return new Date(payload.exp * 1000)
  } catch (error) {
    return null
  }
}

// Helper function to check usage limits locally (for UI)
export const checkUsageLimits = (usageStats, isPremium = false) => {
  if (isPremium) {
    return {
      canGenerate: true,
      reason: 'premium'
    }
  }

  if (!usageStats) {
    return {
      canGenerate: false,
      reason: 'no_usage_data'
    }
  }

  const { remainingDaily, remainingMonthly } = usageStats

  if (remainingDaily <= 0) {
    return {
      canGenerate: false,
      reason: 'daily_limit_reached',
      message: `Daily limit reached. ${remainingDaily} remaining today.`
    }
  }

  if (remainingMonthly <= 0) {
    return {
      canGenerate: false,
      reason: 'monthly_limit_reached', 
      message: `Monthly limit reached. ${remainingMonthly} remaining this month.`
    }
  }

  return {
    canGenerate: true,
    reason: 'within_limits',
    remainingDaily,
    remainingMonthly
  }
}