import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, RotateCcw, Palette, Sparkles, CheckCircle, X, Eye, Settings, Maximize2 } from 'lucide-react'

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, onViewDashboard }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 50px rgba(99, 102, 241, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: 'serif' }}
              >
                Sigil Saved Successfully!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 mb-8 leading-relaxed"
              >
                Your mystical sigil has been safely stored in your personal collection. 
                You can view, manage, and download all your sigils from your dashboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={onViewDashboard}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Dashboard</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Continue Creating
                </button>
              </motion.div>
            </div>

            <div className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-400/30 rounded-full blur-sm"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400/20 rounded-full blur-sm"></div>
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-pink-400/40 rounded-full blur-sm"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SigilCanvas = ({ sigilData, onSave }) => {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [strokeColor, setStrokeColor] = useState('#6366f1')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [backgroundColor, setBackgroundColor] = useState('#0f172a')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [canvasSize, setCanvasSize] = useState(800) // HD default
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(15)
  const [antiAlias, setAntiAlias] = useState(true)
  const [exportQuality, setExportQuality] = useState(1.0)

  const colorPresets = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#ef4444', '#f97316',
    '#ffffff', '#000000', '#ffd700', '#c0c0c0'
  ]

  const sizePresets = [
    { label: 'HD (800px)', value: 800 },
    { label: 'Full HD (1080px)', value: 1080 },
    { label: '2K (1440px)', value: 1440 },
    { label: '4K (2160px)', value: 2160 },
    { label: 'Custom', value: 'custom' }
  ]

  useEffect(() => {
    if (sigilData && canvasRef.current) {
      drawSigil()
    }
  }, [sigilData, strokeColor, strokeWidth, backgroundColor, canvasSize, glowIntensity, antiAlias])

  const drawSigil = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set high-resolution canvas
    const dpr = window.devicePixelRatio || 1
    const displaySize = Math.min(400, window.innerWidth - 40)
    
    canvas.width = canvasSize * dpr
    canvas.height = canvasSize * dpr
    canvas.style.width = displaySize + 'px'
    canvas.style.height = displaySize + 'px'
    
    // Scale context for high DPI
    ctx.scale(dpr, dpr)
    
    // Enable high-quality rendering
    if (antiAlias) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }
    
    // Clear canvas with background color
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    
    if (!sigilData || !sigilData.paths) return

    // Set up high-quality drawing properties
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth * (canvasSize / 400) // Scale stroke width with canvas size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Draw the sigil paths with enhanced quality
    sigilData.paths.forEach((path, pathIndex) => {
      if (!path || path.length < 2) return
      
      ctx.beginPath()
      
      // Use quadratic curves for smoother lines on complex paths
      if (path.length > 3) {
        const firstPoint = {
          x: path[0].x * canvasSize,
          y: path[0].y * canvasSize
        }
        ctx.moveTo(firstPoint.x, firstPoint.y)
        
        for (let i = 1; i < path.length - 1; i++) {
          const currentPoint = {
            x: path[i].x * canvasSize,
            y: path[i].y * canvasSize
          }
          const nextPoint = {
            x: path[i + 1].x * canvasSize,
            y: path[i + 1].y * canvasSize
          }
          
          const cpX = currentPoint.x
          const cpY = currentPoint.y
          const endX = (currentPoint.x + nextPoint.x) / 2
          const endY = (currentPoint.y + nextPoint.y) / 2
          
          ctx.quadraticCurveTo(cpX, cpY, endX, endY)
        }
        
        // Connect to the last point
        const lastPoint = {
          x: path[path.length - 1].x * canvasSize,
          y: path[path.length - 1].y * canvasSize
        }
        ctx.lineTo(lastPoint.x, lastPoint.y)
      } else {
        // Simple line drawing for shorter paths
        path.forEach((point, index) => {
          const x = point.x * canvasSize
          const y = point.y * canvasSize
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
      }
      
      ctx.stroke()
    })

    // Add enhanced mystical glow effect
    if (glowIntensity > 0) {
      ctx.shadowColor = strokeColor
      ctx.shadowBlur = glowIntensity * (canvasSize / 400)
      ctx.globalCompositeOperation = 'screen'
      
      // Multi-layer glow for depth
      for (let i = 0; i < 3; i++) {
        ctx.shadowBlur = (glowIntensity - i * 3) * (canvasSize / 400)
        sigilData.paths.forEach(path => {
          if (!path || path.length < 2) return
          ctx.beginPath()
          path.forEach((point, index) => {
            const x = point.x * canvasSize
            const y = point.y * canvasSize
            
            if (index === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          })
          ctx.stroke()
        })
      }
      
      // Reset composite operation and shadow
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
    }
  }

  const animateSigil = () => {
    setIsAnimating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const dpr = window.devicePixelRatio || 1
    ctx.scale(dpr, dpr)
    
    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    
    if (!sigilData || !sigilData.paths) return

    let pathIndex = 0
    let pointIndex = 0
    
    const animate = () => {
      if (pathIndex >= sigilData.paths.length) {
        setIsAnimating(false)
        drawSigil() // Redraw complete sigil with effects
        return
      }
      
      const currentPath = sigilData.paths[pathIndex]
      if (!currentPath || currentPath.length === 0) {
        pathIndex++
        return
      }
      
      // Clear and redraw background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasSize, canvasSize)
      
      // Draw completed paths
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth * (canvasSize / 400)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Draw all previous complete paths
      for (let i = 0; i < pathIndex; i++) {
        const path = sigilData.paths[i]
        if (path && path.length > 1) {
          ctx.beginPath()
          path.forEach((point, index) => {
            const x = point.x * canvasSize
            const y = point.y * canvasSize
            if (index === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.stroke()
        }
      }
      
      // Draw current path up to current point
      if (pointIndex > 0) {
        ctx.beginPath()
        for (let i = 0; i <= Math.min(pointIndex, currentPath.length - 1); i++) {
          const point = currentPath[i]
          const x = point.x * canvasSize
          const y = point.y * canvasSize
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      
      pointIndex++
      
      if (pointIndex >= currentPath.length) {
        pathIndex++
        pointIndex = 0
      }
      
      setTimeout(animate, 30) // Faster animation for HD
    }
    
    animate()
  }

  const downloadSigil = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `hd-sigil-${canvasSize}px-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png', exportQuality)
    link.click()
  }

  const downloadSVG = () => {
    if (!sigilData || !sigilData.paths) return
    
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${glowIntensity}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g stroke="${strokeColor}" stroke-width="${strokeWidth * (canvasSize / 400)}" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    ${sigilData.paths.map(path => {
      if (!path || path.length < 2) return ''
      const pathData = `M ${path[0].x * canvasSize} ${path[0].y * canvasSize} ` +
        path.slice(1).map(p => `L ${p.x * canvasSize} ${p.y * canvasSize}`).join(' ')
      return `<path d="${pathData}" />`
    }).join('\n    ')}
  </g>
</svg>`
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hd-sigil-${canvasSize}px-${Date.now()}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const regenerateSigil = () => {
    if (sigilData && sigilData.intention) {
      window.dispatchEvent(new CustomEvent('regenerate-sigil', { 
        detail: { intention: sigilData.intention } 
      }))
    }
  }

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave({
          ...sigilData,
          strokeColor,
          strokeWidth,
          backgroundColor,
          canvasSize,
          glowIntensity,
          antiAlias,
          exportQuality,
          imageData: canvasRef.current.toDataURL('image/png', exportQuality),
          hdSettings: {
            size: canvasSize,
            quality: exportQuality,
            glow: glowIntensity,
            antiAlias
          }
        })
        setShowSuccessModal(true)
      } catch (error) {
        console.error('Error saving HD sigil:', error)
      }
    }
  }

  const handleViewDashboard = () => {
    setShowSuccessModal(false)
    window.location.href = '/dashboard'
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-2xl mx-auto"
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-mystical font-semibold mb-2 text-gradient flex items-center justify-center">
            <Maximize2 className="h-5 w-5 mr-2" />
            Your HD Sigil
          </h3>
          {sigilData?.intention && (
            <p className="text-sm text-gray-400 italic">
              "{sigilData.intention}"
            </p>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Resolution: {canvasSize}×{canvasSize}px | Quality: {Math.round(exportQuality * 100)}%
          </div>
        </div>

        {/* Canvas */}
        <div className="relative mb-6 flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-2xl mystical-glow border border-primary-500/30"
            />
            {isAnimating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-primary-400" />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Quality Settings */}
        <div className="mb-6 space-y-4">
          {/* Canvas Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolution
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sizePresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => preset.value !== 'custom' && setCanvasSize(preset.value)}
                  className={`text-xs py-2 px-3 rounded-lg border transition-all ${
                    canvasSize === preset.value
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-dark-600 hover:border-primary-500/50 text-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stroke Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {colorPresets.map(color => (
                <button
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    strokeColor === color ? 'border-white scale-110' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800"
            />
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Advanced Settings</span>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center space-x-1"
            >
              <Settings className="h-3 w-3" />
              <span>{showAdvanced ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          {/* Advanced Settings */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-dark-600 pt-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stroke Width: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Glow Intensity: {glowIntensity}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={glowIntensity}
                    onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Export Quality: {Math.round(exportQuality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.1"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Anti-aliasing</span>
                  <button
                    onClick={() => setAntiAlias(!antiAlias)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      antiAlias ? 'bg-primary-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      antiAlias ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={animateSigil}
            disabled={isAnimating}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Animate</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={regenerateSigil}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Regenerate</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadSigil}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>PNG</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadSVG}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>SVG</span>
          </motion.button>

          {onSave && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Palette className="h-4 w-4" />
              <span>Save HD</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onViewDashboard={handleViewDashboard}
      />
    </>
  )
}

export default SigilCanvas