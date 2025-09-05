import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, Sparkles, AlertCircle, Loader, Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import * as authAPI from '../api/authAPI'

const Register = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    referralCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [availabilityChecks, setAvailabilityChecks] = useState({
    username: { checking: false, available: null, message: '' },
    email: { checking: false, available: null, message: '' }
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (error) setError('')
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Check availability for username and email with debouncing
    if (name === 'username' || name === 'email') {
      setAvailabilityChecks(prev => ({
        ...prev,
        [name]: { ...prev[name], checking: true, available: null }
      }))

      // Debounce availability check
      const timeoutId = setTimeout(() => {
        if (value.trim().length > 0) {
          checkAvailability(name, value.trim())
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }

  const checkAvailability = async (field, value) => {
    try {
      let response
      if (field === 'username') {
        if (value.length < 3) {
          setAvailabilityChecks(prev => ({
            ...prev,
            username: { checking: false, available: false, message: 'Username must be at least 3 characters' }
          }))
          return
        }
        response = await authAPI.checkUsernameAvailability(value)
      } else if (field === 'email') {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
        if (!emailRegex.test(value)) {
          setAvailabilityChecks(prev => ({
            ...prev,
            email: { checking: false, available: false, message: 'Invalid email format' }
          }))
          return
        }
        response = await authAPI.checkEmailAvailability(value)
      }

      setAvailabilityChecks(prev => ({
        ...prev,
        [field]: {
          checking: false,
          available: response.available,
          message: response.message
        }
      }))
    } catch (error) {
      setAvailabilityChecks(prev => ({
        ...prev,
        [field]: { checking: false, available: false, message: 'Error checking availability' }
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    // Check availability
    if (!availabilityChecks.username.available && formData.username.trim()) {
      errors.username = availabilityChecks.username.message || 'Username not available'
    }

    if (!availabilityChecks.email.available && formData.email.trim()) {
      errors.email = availabilityChecks.email.message || 'Email not available'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        referralCode: formData.referralCode.trim() || undefined
      }

      const result = await register(registrationData)
      
      if (result.success) {
        navigate('/dashboard', { 
          replace: true,
          state: { 
            message: 'Welcome to Sigil Factory! Your account has been created successfully.' 
          }
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'gray' }
    
    let score = 0
    let checks = []

    if (password.length >= 6) {
      score += 1
      checks.push('6+ characters')
    }
    if (password.length >= 10) {
      score += 1
      checks.push('10+ characters')
    }
    if (/[a-z]/.test(password)) {
      score += 1
      checks.push('lowercase')
    }
    if (/[A-Z]/.test(password)) {
      score += 1
      checks.push('uppercase')
    }
    if (/[0-9]/.test(password)) {
      score += 1
      checks.push('numbers')
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
      checks.push('symbols')
    }

    const strengthLevels = [
      { min: 0, max: 2, label: 'Weak', color: 'red' },
      { min: 3, max: 4, label: 'Medium', color: 'yellow' },
      { min: 5, max: 6, label: 'Strong', color: 'green' }
    ]

    const level = strengthLevels.find(l => score >= l.min && score <= l.max)
    
    return {
      strength: score,
      label: level.label,
      color: level.color,
      checks
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="min-h-screen pt-16 py-20 px-4 flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Sparkles className="h-12 w-12 text-primary-400 mystical-glow mx-auto" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-mystical font-bold text-gradient mb-2">
            Begin Your Journey
          </h1>
          <p className="text-gray-300">
            Create your account to start forging mystical sigils
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Registration Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                First Name <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Your first name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                Last Name <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Your last name"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className={`input-field w-full pr-12 ${
                  fieldErrors.username ? 'border-red-500' : 
                  availabilityChecks.username.available === true ? 'border-green-500' :
                  availabilityChecks.username.available === false ? 'border-red-500' : ''
                }`}
                placeholder="Choose a unique username"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {availabilityChecks.username.checking && (
                  <Loader className="h-5 w-5 text-gray-400 animate-spin" />
                )}
                {!availabilityChecks.username.checking && availabilityChecks.username.available === true && (
                  <Check className="h-5 w-5 text-green-400" />
                )}
                {!availabilityChecks.username.checking && availabilityChecks.username.available === false && (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>
            {fieldErrors.username && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
            )}
            {!fieldErrors.username && availabilityChecks.username.message && (
              <p className={`text-xs mt-1 ${
                availabilityChecks.username.available ? 'text-green-400' : 'text-red-400'
              }`}>
                {availabilityChecks.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field w-full pr-12 ${
                  fieldErrors.email ? 'border-red-500' : 
                  availabilityChecks.email.available === true ? 'border-green-500' :
                  availabilityChecks.email.available === false ? 'border-red-500' : ''
                }`}
                placeholder="your@email.com"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {availabilityChecks.email.checking && (
                  <Loader className="h-5 w-5 text-gray-400 animate-spin" />
                )}
                {!availabilityChecks.email.checking && availabilityChecks.email.available === true && (
                  <Check className="h-5 w-5 text-green-400" />
                )}
                {!availabilityChecks.email.checking && availabilityChecks.email.available === false && (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
            {!fieldErrors.email && availabilityChecks.email.message && (
              <p className={`text-xs mt-1 ${
                availabilityChecks.email.available ? 'text-green-400' : 'text-red-400'
              }`}>
                {availabilityChecks.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`input-field w-full pr-12 ${fieldErrors.password ? 'border-red-500' : ''}`}
                placeholder="Create a strong password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
            {formData.password && !fieldErrors.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Password Strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.color === 'red' ? 'text-red-400' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.color === 'red' ? 'bg-red-500' :
                      passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`input-field w-full pr-12 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Referral Code */}
          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-2">
              Referral Code <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={formData.referralCode}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="Enter referral code if you have one"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || Object.keys(fieldErrors).length > 0}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="h-5 w-5" />
              </motion.div>
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
          </motion.button>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Account Benefits */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="card bg-dark-700/50 border-primary-500/20 text-center">
            <h3 className="font-semibold text-primary-300 mb-2">Free Account</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>5 sigils per day</li>
              <li>50 sigils per month</li>
              <li>Basic sigil patterns</li>
              <li>Ad-supported experience</li>
              <li>Community access</li>
            </ul>
          </div>
          
          <div className="card bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-400/40 text-center">
            <h3 className="font-semibold text-primary-300 mb-2">Premium Account</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Unlimited sigils</li>
              <li>Advanced patterns</li>
              <li>No ads</li>
              <li>Priority support</li>
              <li>Exclusive features</li>
            </ul>
            <Link
              to="/upgrade"
              className="inline-block mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Learn more →
            </Link>
          </div>
        </motion.div>

        {/* Terms and Privacy */}
        <motion.div variants={itemVariants} className="text-center text-xs text-gray-500">
          <p>
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register