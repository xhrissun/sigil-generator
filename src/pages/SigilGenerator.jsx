import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Sparkles, Eye, Heart, Star, Zap, Info, Download, RotateCcw, Settings, Target, Compass, BookOpen, Shield, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react'
import SigilCanvas from '../components/SigilCanvas'
import { useAuth } from '../contexts/AuthContext'
import { saveSigil } from '../api/sigilAPI'
import { 
  generateClientSideSigil, 
  getSigilMetadata, 
  analyzeSigilSymmetry,
  generateSigilVariations,
  validateSigilData,
  getSigilBoundingBox,
  exportSigilToSVG,
  processIntention
} from '../utils/sigilUtils'

const SigilGenerator = () => {
  const { user, canGenerateSigil, updateUsageAfterGeneration, isPremium, isAuthenticated } = useAuth()
  const [intention, setIntention] = useState('')
  const [sigilData, setSigilData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [sigilMetadata, setSigilMetadata] = useState(null)
  const [showVariations, setShowVariations] = useState(false)
  const [variations, setVariations] = useState([])
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false)
  const [generationHistory, setGenerationHistory] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    examples: true,
    history: true,
    analysis: false,
    knowledge: true
  })

  const categories = [
    { 
      id: 'general', 
      name: 'General Magic', 
      icon: Star, 
      description: 'Solomonic sigils, sacred geometry, Platonic solids',
      color: 'text-purple-400',
      features: ['Metatron\'s Cube', 'Flower of Life', 'Enochian Patterns', 'Goetic Circles']
    },
    { 
      id: 'love', 
      name: 'Love & Relationships', 
      icon: Heart, 
      description: 'Heart patterns, infinity loops, golden ratio spirals',
      color: 'text-pink-400',
      features: ['Heart Equations', 'Golden Spirals', 'Fibonacci Patterns', 'Venus Symbols']
    },
    { 
      id: 'prosperity', 
      name: 'Prosperity & Success', 
      icon: Zap, 
      description: 'Fibonacci spirals, abundance symbols, expansion patterns',
      color: 'text-yellow-400',
      features: ['Fibonacci Spirals', 'Vesica Piscis', 'Expansion Geometry', 'Jupiter Seals']
    },
    { 
      id: 'protection', 
      name: 'Protection & Healing', 
      icon: Shield, 
      description: 'Protective mandalas, runes, elemental crosses',
      color: 'text-blue-400',
      features: ['Protection Mandalas', 'Rune Patterns', 'Elemental Crosses', 'Binding Circles']
    },
    { 
      id: 'wisdom', 
      name: 'Wisdom & Knowledge', 
      icon: BookOpen, 
      description: 'Tree of Life, fractal branches, Kabbalistic patterns',
      color: 'text-green-400',
      features: ['Tree of Life', 'Fractal Branches', 'Sacred Spirals', 'Hermetic Seals']
    }
  ]

  const intentionExamples = {
    general: [
      "I am confident and powerful in all situations",
      "My dreams manifest into reality effortlessly", 
      "I attract positive energy and abundance",
      "I am at peace with my true divine nature",
      "Sacred wisdom flows through me daily"
    ],
    love: [
      "I attract my perfect soulmate connection",
      "My heart chakra radiates unconditional love",
      "Divine love flows through every relationship",
      "I am worthy of deep spiritual connection",
      "Love and harmony surround me always"
    ],
    prosperity: [
      "Abundance flows to me from multiple sources",
      "I am aligned with infinite prosperity consciousness",
      "Golden opportunities manifest before me daily",
      "My wealth grows through divine guidance",
      "Success comes naturally through sacred action"
    ],
    protection: [
      "I am shielded by divine white light",
      "Negative energy transforms around my aura",
      "My sacred space is protected and blessed",
      "Guardian spirits watch over me always",
      "I release all that does not serve"
    ],
    wisdom: [
      "Ancient wisdom awakens within my soul",
      "Divine knowledge flows through my intuition",
      "I access higher dimensional understanding",
      "Sacred mysteries reveal themselves to me",
      "My third eye sees truth clearly"
    ]
  }

  const enhancedTips = [
    "Your intention is processed through ancient Solomonic methods",
    "Initials from each word create geometric patterns around the main sigil",
    "Each category uses specific sacred geometry: mandalas, fractals, planetary seals",
    "Write intentions in present tense as if already manifested",
    "Complex patterns emerge from Hebrew letter geometry and Enochian tablets",
    "The system analyzes symmetry, complexity, and sacred proportions",
    "Generate variations to find the sigil that resonates most powerfully",
    "Advanced patterns include Tree of Life, Metatron's Cube, and Goetic circles"
  ]

  const processIntentionPreview = useCallback((text) => {
    if (!text.trim()) return null
    return processIntention(text)
  }, [])

  const intentionPreview = processIntentionPreview(intention)

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    const handleRegenerate = (event) => {
      if (event.detail && event.detail.intention) {
        handleGenerate(event.detail.intention)
      }
    }

    window.addEventListener('regenerate-sigil', handleRegenerate)
    return () => window.removeEventListener('regenerate-sigil', handleRegenerate)
  }, [selectedCategory])

  const handleGenerate = async (customIntention = null) => {
    const targetIntention = customIntention || intention
    if (!targetIntention.trim()) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please login to generate sigils.');
      return;
    }

    // Check usage limits
    const usageCheck = canGenerateSigil();
    if (!usageCheck.allowed) {
      if (usageCheck.reason === 'daily_limit_reached' || usageCheck.reason === 'monthly_limit_reached') {
        alert(usageCheck.message);
        return;
      } else if (usageCheck.reason === 'not_authenticated') {
        alert('Please login to generate sigils.');
        return;
      }
    }

    setIsGenerating(true)
    setVariations([])
    
    try {
      console.log('Generating enhanced sigil with category:', selectedCategory)
      
      // Use the enhanced client-side generation
      const result = generateClientSideSigil(targetIntention.trim(), selectedCategory)
      
      // Validate the generated sigil data
      if (!validateSigilData(result)) {
        throw new Error('Generated sigil data is invalid')
      }
      
      // Get comprehensive metadata and analysis
      const metadata = getSigilMetadata(targetIntention.trim(), result.paths)
      const symmetry = analyzeSigilSymmetry(result.paths)
      const boundingBox = getSigilBoundingBox(result.paths)
      
      const fullMetadata = { 
        ...metadata, 
        symmetry, 
        boundingBox,
        category: selectedCategory,
        enhancedFeatures: categories.find(c => c.id === selectedCategory)?.features || []
      }
      
      setSigilData(result)
      setSigilMetadata(fullMetadata)
      
      // Add to generation history
      setGenerationHistory(prev => [{
        intention: targetIntention,
        category: selectedCategory,
        timestamp: new Date().toISOString(),
        complexity: result.complexity
      }, ...prev.slice(0, 9)]) // Keep last 10 generations
      
      console.log('Enhanced sigil generated successfully:', {
        complexity: result.complexity,
        hasInitials: result.hasInitials,
        category: result.category,
        pathCount: result.paths.length,
        method: result.method,
        boundingBox: boundingBox,
        symmetryAnalysis: symmetry
      })

      // Record the generation on the backend (for non-premium users)
      if (!isPremium) {
        try {
          await updateUsageAfterGeneration();
          console.log('Usage stats updated after generation');
        } catch (error) {
          console.error('Failed to update usage stats:', error);
          // Don't prevent sigil generation, just log the error
        }
      }
      
    } catch (error) {
      console.error('Error generating enhanced sigil:', error)
      
      // Enhanced fallback with basic patterns
      const fallbackSigil = {
        intention: targetIntention,
        category: selectedCategory,
        paths: generateFallbackPattern(targetIntention, selectedCategory),
        timestamp: new Date().toISOString(),
        method: 'fallback-enhanced',
        complexity: { paths: 3, points: 12, complexity: 50 }
      }
      
      setSigilData(fallbackSigil)
      setSigilMetadata({
        processedText: targetIntention.toLowerCase().replace(/[aeiou\s]/g, ''),
        initials: targetIntention.split(' ').map(w => w[0]).join(''),
        complexity: fallbackSigil.complexity
      })

      // Still record generation even for fallback
      if (!isPremium) {
        try {
          await updateUsageAfterGeneration();
        } catch (usageError) {
          console.error('Failed to update usage stats for fallback:', usageError);
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackPattern = (text, category) => {
    const centerX = 0.5, centerY = 0.5
    const baseRadius = 0.2
    
    // Create a simple but meaningful pattern based on category
    const patterns = {
      general: [
        // Simple pentagram
        Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 144) * Math.PI / 180
          return {
            x: centerX + Math.cos(angle) * baseRadius,
            y: centerY + Math.sin(angle) * baseRadius
          }
        })
      ],
      love: [
        // Heart shape
        Array.from({ length: 20 }, (_, i) => {
          const t = (i / 20) * Math.PI * 2
          const x = centerX + baseRadius * 16 * Math.pow(Math.sin(t), 3) * 0.05
          const y = centerY - baseRadius * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.05
          return { x: Math.max(0.1, Math.min(0.9, x)), y: Math.max(0.1, Math.min(0.9, y)) }
        })
      ],
      prosperity: [
        // Spiral
        Array.from({ length: 30 }, (_, i) => {
          const angle = i * 0.5
          const radius = baseRadius * (i / 30)
          return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          }
        })
      ],
      protection: [
        // Protective circle with cross
        Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 2
          return {
            x: centerX + Math.cos(angle) * baseRadius,
            y: centerY + Math.sin(angle) * baseRadius
          }
        })
      ],
      wisdom: [
        // Tree-like pattern
        [
          { x: centerX, y: centerY + baseRadius },
          { x: centerX, y: centerY },
          { x: centerX - baseRadius * 0.5, y: centerY - baseRadius * 0.5 },
          { x: centerX + baseRadius * 0.5, y: centerY - baseRadius * 0.5 }
        ]
      ]
    }
    
    return patterns[category] || patterns.general
  }

  const handleGenerateVariations = async () => {
    if (!intention.trim()) return

    // Check authentication and usage limits for variations too
    if (!isAuthenticated) {
      alert('Please login to generate variations.');
      return;
    }

    const usageCheck = canGenerateSigil();
    if (!usageCheck.allowed && !isPremium) {
      if (usageCheck.reason === 'daily_limit_reached' || usageCheck.reason === 'monthly_limit_reached') {
        alert(`${usageCheck.message} Variations count towards your usage limit.`);
        return;
      }
    }
    
    setIsGenerating(true)
    try {
      const variationsList = generateSigilVariations(intention.trim(), selectedCategory, 3)
      setVariations(variationsList.filter(v => validateSigilData(v)))
      setShowVariations(true)
      
      console.log('Generated variations:', variationsList.length)

      // Record each variation generation for non-premium users
      if (!isPremium && variationsList.length > 0) {
        try {
          // Record multiple generations for variations
          for (let i = 0; i < Math.min(variationsList.length, 3); i++) {
            await updateUsageAfterGeneration();
          }
          console.log('Usage stats updated for variations');
        } catch (error) {
          console.error('Failed to update usage stats for variations:', error);
        }
      }
    } catch (error) {
      console.error('Error generating variations:', error)
      setVariations([])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async (sigilWithCustomization) => {
    try {
      const savedSigil = await saveSigil({
        ...sigilWithCustomization,
        metadata: sigilMetadata,
        enhancedFeatures: true
      })
      console.log('Enhanced sigil saved:', savedSigil)
    } catch (error) {
      console.error('Error saving sigil:', error)
    }
  }

  const handleExportSVG = () => {
    if (!sigilData) return
    
    try {
      const svgContent = exportSigilToSVG(sigilData)
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sigil-${sigilData.intention.replace(/\s+/g, '-').toLowerCase()}.svg`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting SVG:', error)
    }
  }

  const selectExample = (example) => {
    setIntention(example)
  }

  const selectVariation = (variation) => {
    setSigilData(variation)
    const metadata = getSigilMetadata(variation.intention, variation.paths)
    const symmetry = analyzeSigilSymmetry(variation.paths)
    const boundingBox = getSigilBoundingBox(variation.paths)
    setSigilMetadata({ ...metadata, symmetry, boundingBox })
    setShowVariations(false)
  }

  const regenerateFromHistory = (historyItem) => {
    setIntention(historyItem.intention)
    setSelectedCategory(historyItem.category)
    handleGenerate(historyItem.intention)
  }

  // Usage display component
  const UsageDisplay = () => {
    if (!isAuthenticated) return null

    if (isPremium) {
      return (
        <div className="card">
          <div className="text-center py-2">
            <div className="text-primary-400 font-bold">✨ Premium Account ✨</div>
            <div className="text-xs text-gray-400 mt-1">Unlimited Generations</div>
          </div>
        </div>
      )
    }

    if (!user?.usageStats) return null

    const { dailyGenerations, monthlyGenerations, dailyLimit, monthlyLimit, remainingDaily, remainingMonthly } = user.usageStats

    return (
      <div className="card">
        <h3 className="text-base font-mystical font-semibold mb-3 text-gradient">Usage Stats</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Daily</span>
              <span>{dailyGenerations}/{dailyLimit}</span>
            </div>
            <div className="w-full bg-dark-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((dailyGenerations / dailyLimit) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{remainingDaily} remaining today</div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Monthly</span>
              <span>{monthlyGenerations}/{monthlyLimit}</span>
            </div>
            <div className="w-full bg-dark-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((monthlyGenerations / monthlyLimit) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{remainingMonthly} remaining this month</div>
          </div>

          {(remainingDaily <= 2 || remainingMonthly <= 5) && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-2">
              <div className="text-amber-200 text-xs font-medium">⚠️ Low Usage Remaining</div>
              <div className="text-amber-300/80 text-xs mt-1">
                Consider upgrading to premium for unlimited generations
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 py-8 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className={`mx-auto transition-all duration-300 ${isFullWidth ? 'max-w-none px-4' : 'max-w-7xl'}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Compass className="h-7 w-7 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-mystical font-bold text-gradient">
              Advanced Sigil Forge
            </h1>
            <Compass className="h-7 w-7 text-primary-400 scale-x-[-1]" />
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
            Harness the power of <span className="text-primary-400 font-semibold">Solomonic magic</span>, 
            <span className="text-purple-400 font-semibold"> sacred geometry</span>, and 
            <span className="text-indigo-400 font-semibold"> ancient wisdom traditions</span>
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Initials Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Sacred Geometry</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Ancient Wisdom</span>
            </div>
          </div>
          
          {/* Layout Toggle */}
          <button
            onClick={() => setIsFullWidth(!isFullWidth)}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg border border-dark-600 hover:border-primary-500/50 transition-colors text-sm text-gray-300"
          >
            {isFullWidth ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span>{isFullWidth ? 'Normal View' : 'Full Width'}</span>
          </button>
        </motion.div>

        <div className={`grid gap-6 ${isFullWidth ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 xl:grid-cols-3'}`}>
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`space-y-4 ${isFullWidth ? 'lg:col-span-1' : 'xl:col-span-1'}`}
          >
            {/* Usage Display */}
            <UsageDisplay />

            {/* Category Selection - Collapsible */}
            <div className="card">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-lg font-mystical font-bold text-gradient">Sacred Tradition</h3>
                {collapsedSections.categories ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
              
              <AnimatePresence>
                {!collapsedSections.categories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {categories.map(category => {
                      const Icon = category.icon
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full p-3 rounded-lg border transition-all duration-300 text-left group ${
                            selectedCategory === category.id
                              ? 'border-primary-500 bg-primary-500/20 text-primary-300 shadow-md shadow-primary-500/20'
                              : 'border-dark-600 hover:border-primary-500/50 text-gray-300 hover:bg-dark-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${
                              selectedCategory === category.id ? 'text-primary-400' : category.color
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base">{category.name}</div>
                              <div className="text-xs text-gray-400 mt-1">{category.description}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Intention Input */}
            <div className="card">
              <h3 className="text-lg font-mystical font-bold mb-4 text-gradient">Sacred Intention</h3>
              
              {/* Real-time preview - Compact */}
              {intentionPreview && (
                <div className="mb-3 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-primary-300 font-medium mb-1">Processed:</div>
                      <div className="font-mono text-primary-200 bg-dark-800/50 px-2 py-1 rounded text-xs">
                        {intentionPreview.processed || 'None'}
                      </div>
                    </div>
                    <div>
                      <div className="text-primary-300 font-medium mb-1">Initials:</div>
                      <div className="font-mono text-primary-200 bg-dark-800/50 px-2 py-1 rounded text-xs">
                        {intentionPreview.initials || 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Enter your sacred intention..."
                className="input-field w-full h-24 resize-none"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-2 mb-3">
                <span className="text-xs text-gray-400">
                  {intention.length}/300 characters
                </span>
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGenerate()}
                  disabled={!intention.trim() || isGenerating || (!isAuthenticated) || (!canGenerateSigil().allowed && !isPremium)}
                  className="flex-1 btn-primary inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span>{isGenerating ? 'Forging...' : 'Forge'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateVariations}
                  disabled={!intention.trim() || isGenerating || (!isAuthenticated) || (!canGenerateSigil().allowed && !isPremium)}
                  className="btn-secondary inline-flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-2"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Variations</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportSVG}
                  disabled={!sigilData}
                  className="btn-secondary inline-flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-2"
                >
                  <Download className="h-3 w-3" />
                  <span>SVG</span>
                </motion.button>
              </div>

              {/* Authentication/Usage Warning */}
              {!isAuthenticated && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="text-amber-200 text-xs font-medium">⚠️ Login Required</div>
                  <div className="text-amber-300/80 text-xs mt-1">
                    Please login to generate sigils
                  </div>
                </div>
              )}

              {isAuthenticated && !isPremium && !canGenerateSigil().allowed && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-red-200 text-xs font-medium">🚫 Limit Reached</div>
                  <div className="text-red-300/80 text-xs mt-1">
                    {canGenerateSigil().message}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-base font-mystical font-semibold mb-3 text-gradient">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
                    const randomExample = intentionExamples[randomCategory.id][
                      Math.floor(Math.random() * intentionExamples[randomCategory.id].length)
                    ]
                    setSelectedCategory(randomCategory.id)
                    setIntention(randomExample)
                  }}
                  className="btn-secondary text-xs py-2 flex items-center justify-center space-x-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Random</span>
                </button>
                
                <button
                  onClick={() => {
                    setIntention('')
                    setSigilData(null)
                    setSigilMetadata(null)
                    setVariations([])
                    setShowVariations(false)
                  }}
                  className="btn-secondary text-xs py-2 flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Example Intentions - Collapsible */}
            <div className="card">
              <button
                onClick={() => toggleSection('examples')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-mystical font-semibold text-gradient">Sacred Templates</h3>
                {collapsedSections.examples ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {!collapsedSections.examples && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    {intentionExamples[selectedCategory].slice(0, 3).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => selectExample(example)}
                        className="w-full text-left p-2 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-primary-500/50 text-gray-300 hover:text-white transition-all duration-300 text-xs group"
                      >
                        <span className="group-hover:text-primary-200">"{example.slice(0, 50)}..."</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generation History - Collapsible */}
            {generationHistory.length > 0 && (
              <div className="card">
                <button
                  onClick={() => toggleSection('history')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="text-base font-mystical font-semibold text-gradient flex items-center">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Recent
                  </h3>
                  {collapsedSections.history ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                
                <AnimatePresence>
                  {!collapsedSections.history && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 max-h-32 overflow-y-auto"
                    >
                      {generationHistory.slice(0, 3).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => regenerateFromHistory(item)}
                          disabled={!isAuthenticated || (!canGenerateSigil().allowed && !isPremium)}
                          className="w-full text-left p-2 rounded-lg bg-dark-700/30 hover:bg-dark-700/60 border border-dark-600/50 hover:border-primary-500/30 transition-all duration-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="text-gray-300 truncate">{item.intention.slice(0, 30)}...</div>
                          <div className="text-gray-500 flex items-center justify-between mt-1">
                            <span className="capitalize text-xs">{item.category}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Tips - Collapsible */}
            <div className="card">
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-mystical font-semibold text-gradient flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guide
                </h3>
                {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {showTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-gray-300 space-y-1 max-h-40 overflow-y-auto"
                  >
                    {enhancedTips.slice(0, 4).map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Canvas Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${isFullWidth ? 'lg:col-span-2' : 'xl:col-span-1'}`}
          >
            <div className="sticky top-4">
              <AnimatePresence mode="wait">
                {sigilData ? (
                  <SigilCanvas
                    key={`${sigilData.timestamp}-${selectedCategory}`}
                    sigilData={sigilData}
                    onSave={handleSave}
                    enhanced={true}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="card h-[500px] lg:h-[600px] flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="mb-6"
                      >
                        <div className="relative">
                          <Compass className="h-16 w-16 text-primary-400/30 mx-auto" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-primary-500" />
                          </div>
                        </div>
                      </motion.div>
                      <h3 className="text-lg font-mystical text-gray-400 mb-2">
                        Ready to Forge Your Sigil
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                        {!isAuthenticated 
                          ? "Please login to begin creating your personalized sigils."
                          : "Enter your sacred intention and select your preferred mystical tradition to create a personalized sigil."
                        }
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Variations Display */}
              <AnimatePresence>
                {showVariations && variations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card mt-4"
                  >
                    <h3 className="text-lg font-mystical font-bold mb-4 text-gradient flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Sacred Variations
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {variations.map((variation, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => selectVariation(variation)}
                          className="aspect-square bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg border border-dark-600 hover:border-primary-500/70 p-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 group"
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-md">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <rect width="100" height="100" fill="#1a1a2e" />
                              {variation.paths?.map((path, pathIndex) => {
                                if (!path || path.length < 2) return null
                                const pathData = `M ${path[0].x * 100} ${path[0].y * 100} ` +
                                  path.slice(1).map(p => `L ${p.x * 100} ${p.y * 100}`).join(' ')
                                return (
                                  <path
                                    key={pathIndex}
                                    d={pathData}
                                    stroke="#8b5cf6"
                                    strokeWidth="1.5"
                                    fill="none"
                                    opacity="0.9"
                                    className="group-hover:stroke-primary-300 transition-colors"
                                  />
                                )
                              })}
                            </svg>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 text-center group-hover:text-primary-300 transition-colors">
                            Variant {index + 1}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowVariations(false)}
                      className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-primary-300 transition-colors"
                    >
                      Hide Variations
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Analysis Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`space-y-4 ${isFullWidth ? 'lg:col-span-1' : 'xl:col-span-1'}`}
          >
            {/* Sigil Analysis - Collapsible */}
            {sigilMetadata && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="card"
              >
                <button
                  onClick={() => toggleSection('analysis')}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-mystical font-bold text-gradient flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Sigil Analysis
                  </h3>
                  {collapsedSections.analysis ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </button>
                
                <AnimatePresence>
                  {!collapsedSections.analysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="bg-dark-700/30 p-3 rounded-lg text-center">
                          <div className="text-gray-400 mb-1 text-xs">Complexity</div>
                          <div className="text-primary-300 font-bold text-lg">
                            {sigilMetadata.complexity?.complexity || 0}
                          </div>
                        </div>
                        <div className="bg-dark-700/30 p-3 rounded-lg text-center">
                          <div className="text-gray-400 mb-1 text-xs">Paths</div>
                          <div className="text-primary-300 font-bold text-lg">
                            {sigilMetadata.complexity?.paths || 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Advanced Analysis</span>
                        <button
                          onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
                          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {showAdvancedAnalysis ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showAdvancedAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-2 rounded-lg border border-purple-500/20">
                                <div className="text-gray-400 mb-2 font-medium">Symmetry</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>H:</span>
                                    <span className="text-primary-300">{sigilMetadata.symmetry?.horizontalSymmetry || 0}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>V:</span>
                                    <span className="text-primary-300">{sigilMetadata.symmetry?.verticalSymmetry || 0}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>R:</span>
                                    <span className="text-primary-300">{sigilMetadata.symmetry?.radialSymmetry || 0}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-2 rounded-lg border border-emerald-500/20">
                                <div className="text-gray-400 mb-2 font-medium">Geometry</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>Points:</span>
                                    <span className="text-emerald-300">{sigilMetadata.complexity?.points || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Length:</span>
                                    <span className="text-emerald-300">{Math.round(sigilMetadata.complexity?.totalLength || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Density:</span>
                                    <span className="text-emerald-300">{Math.round(sigilMetadata.complexity?.density || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {sigilMetadata.enhancedFeatures && (
                              <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 p-3 rounded-lg border border-amber-500/20">
                                <div className="text-gray-400 mb-2 font-medium text-xs">Active Patterns:</div>
                                <div className="flex flex-wrap gap-1">
                                  {sigilMetadata.enhancedFeatures.slice(0, 4).map((feature, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full border border-amber-500/30"
                                    >
                                      {feature.split(' ')[0]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Sacred Knowledge - Collapsible */}
            <div className="card">
              <button
                onClick={() => toggleSection('knowledge')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-mystical font-semibold text-gradient flex items-center">
                  <Compass className="h-4 w-4 mr-2" />
                  Sacred Knowledge
                </h3>
                {collapsedSections.knowledge ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {!collapsedSections.knowledge && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 text-xs"
                  >
                    <div className="p-2 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/20">
                      <div className="text-purple-300 font-medium mb-1">Solomonic Tradition</div>
                      <div className="text-gray-400">Magical squares, pentagrammic seals, and divine name geometry.</div>
                    </div>
                    
                    <div className="p-2 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-500/20">
                      <div className="text-emerald-300 font-medium mb-1">Sacred Geometry</div>
                      <div className="text-gray-400">Flower of Life, Metatron's Cube, golden ratio spirals.</div>
                    </div>

                    <div className="p-2 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg border border-amber-500/20">
                      <div className="text-amber-300 font-medium mb-1">Initials Integration</div>
                      <div className="text-gray-400">Transformed into geometric patterns using sacred principles.</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card"
                >
                  <h3 className="text-base font-mystical font-semibold mb-3 text-gradient flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Options
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-2 bg-dark-700/30 rounded-lg">
                      <div className="text-gray-300 font-medium mb-1">Generation Method:</div>
                      <div className="text-gray-400">Enhanced Client-Side with Sacred Geometry</div>
                    </div>
                    
                    <div className="p-2 bg-dark-700/30 rounded-lg">
                      <div className="text-gray-300 font-medium mb-1">Current Features:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories.find(c => c.id === selectedCategory)?.features.slice(0, 2).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-primary-500/20 text-primary-200 rounded-full"
                          >
                            {feature.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Stats */}
            {sigilMetadata && (
              <div className="card">
                <h3 className="text-base font-mystical font-semibold mb-3 text-gradient">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-dark-700/50 rounded-lg">
                    <div className="text-gray-400">Words</div>
                    <div className="text-sm font-bold text-primary-300">{sigilMetadata.initialsCount || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-dark-700/50 rounded-lg">
                    <div className="text-gray-400">Processed</div>
                    <div className="text-sm font-bold text-primary-300">{sigilMetadata.processedLength || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-dark-700/50 rounded-lg">
                    <div className="text-gray-400">Original</div>
                    <div className="text-sm font-bold text-primary-300">{sigilMetadata.originalLength || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Toggle */}
            <div className="card">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-gray-400 hover:text-primary-300 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>{showSettings ? 'Hide Settings' : 'Show Settings'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SigilGenerator