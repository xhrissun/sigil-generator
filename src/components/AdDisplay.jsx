import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Crown, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const AdDisplay = ({ 
  placement = 'banner', // 'banner', 'sidebar', 'interstitial', 'native'
  onClose,
  showUpgrade = true 
}) => {
  const { user, isPremium } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [adContent, setAdContent] = useState(null)

  // Don't show ads to premium users
  if (isPremium) return null

  useEffect(() => {
    // Simulate ad loading (in real app, this would be an ad network)
    const loadAd = () => {
      const adVariants = {
        banner: [
          {
            type: 'upgrade',
            title: 'Unlock Unlimited Sigils',
            description: 'Upgrade to Premium for unlimited generations',
            cta: 'Upgrade Now',
            icon: Crown,
            gradient: 'from-purple-500 to-pink-500'
          },
          {
            type: 'feature',
            title: 'Advanced Sacred Geometry',
            description: 'Premium users get exclusive mystical patterns',
            cta: 'Learn More',
            icon: Sparkles,
            gradient: 'from-blue-500 to-cyan-500'
          }
        ],
        sidebar: [
          {
            type: 'upgrade',
            title: 'Go Premium',
            description: 'Remove ads and unlock unlimited sigils',
            cta: 'Upgrade',
            icon: Zap,
            gradient: 'from-yellow-500 to-orange-500'
          }
        ],
        interstitial: [
          {
            type: 'upgrade',
            title: 'You\'ve Used Your Daily Limit',
            description: 'Upgrade to Premium for unlimited sigil generation',
            cta: 'Upgrade to Premium',
            icon: Crown,
            gradient: 'from-purple-500 to-pink-500',
            showUsage: true
          }
        ],
        native: [
          {
            type: 'feature',
            title: 'Mystical Pro Tips',
            description: 'Premium members get exclusive sigil creation guides',
            cta: 'Go Premium',
            icon: Sparkles,
            gradient: 'from-green-500 to-emerald-500'
          }
        ]
      }

      const variants = adVariants[placement] || adVariants.banner
      const randomAd = variants[Math.floor(Math.random() * variants.length)]
      setAdContent(randomAd)
    }

    loadAd()
  }, [placement])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || !adContent) return null

  const AdContent = ({ content, className = '' }) => {
    const Icon = content.icon

    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${content.gradient} opacity-10`} />
        <div className="relative p-4 flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-gradient-to-r ${content.gradient} text-white flex-shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm mb-1">
              {content.title}
            </h3>
            <p className="text-gray-300 text-xs mb-2">
              {content.description}
            </p>
            
            {content.showUsage && user && (
              <div className="text-xs text-gray-400 mb-2">
                Daily: {user.usageStats?.dailyGenerations || 0}/{user.usageStats?.dailyLimit || 5} • 
                Monthly: {user.usageStats?.monthlyGenerations || 0}/{user.usageStats?.monthlyLimit || 50}
              </div>
            )}
          </div>

          {showUpgrade && (
            <Link 
              to="/upgrade" 
              className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${content.gradient} text-white text-xs font-medium hover:opacity-90 transition-opacity`}
            >
              {content.cta}
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Banner Ad (top/bottom)
  if (placement === 'banner') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg"
          >
            <AdContent content={adContent} />
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Sidebar Ad
  if (placement === 'sidebar') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg"
          >
            <div className="relative">
              <AdContent content={adContent} />
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Interstitial Ad (full overlay)
  if (placement === 'interstitial') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-lg border border-dark-600 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <AdContent content={adContent} className="text-center" />
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="px-4 pb-4 flex space-x-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors text-sm"
                >
                  Maybe Later
                </button>
                <Link
                  to="/upgrade"
                  className={`flex-1 px-4 py-2 bg-gradient-to-r ${adContent.gradient} text-white rounded-lg hover:opacity-90 transition-opacity text-sm text-center`}
                >
                  {adContent.cta}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Native Ad (inline content)
  if (placement === 'native') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-dark-800/50 border border-dark-600 rounded-lg backdrop-blur-sm"
          >
            <div className="relative">
              <div className="absolute top-2 left-2 text-xs text-gray-500 uppercase tracking-wide">
                Sponsored
              </div>
              <AdContent content={adContent} className="pt-6" />
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return null
}

// Hook for showing interstitial ads based on usage
export const useInterstitialAd = () => {
  const { user, isPremium, canGenerateSigil } = useAuth()
  const [showInterstitial, setShowInterstitial] = useState(false)

  const checkAndShowAd = () => {
    if (isPremium) return false

    const generationCheck = canGenerateSigil()
    
    // Show interstitial when user hits limits
    if (!generationCheck.allowed) {
      setShowInterstitial(true)
      return true
    }

    // Show interstitial occasionally for free users (every 10th generation)
    if (user?.usageStats?.totalGenerations && user.usageStats.totalGenerations % 10 === 0) {
      setShowInterstitial(true)
      return true
    }

    return false
  }

  const closeInterstitial = () => {
    setShowInterstitial(false)
  }

  return {
    showInterstitial,
    checkAndShowAd,
    closeInterstitial
  }
}

// Wrapper component for ads in different placements
export const AdWrapper = ({ children, placement = 'banner', showAd = true }) => {
  const { isPremium } = useAuth()
  
  if (isPremium || !showAd) {
    return children
  }

  return (
    <div className="space-y-4">
      {placement === 'top' && <AdDisplay placement="banner" />}
      {children}
      {placement === 'bottom' && <AdDisplay placement="banner" />}
    </div>
  )
}

export default AdDisplay