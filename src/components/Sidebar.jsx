import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Settings, Info, Star, Heart, Zap, Eye, Sparkles } from 'lucide-react'

const Sidebar = ({ isOpen, onClose, selectedCategory, onCategoryChange, onStyleChange, styles }) => {
  const [activeTab, setActiveTab] = useState('categories')

  const categories = [
    { id: 'general', name: 'General', icon: Star, color: '#6366f1' },
    { id: 'love', name: 'Love & Relationships', icon: Heart, color: '#ec4899' },
    { id: 'prosperity', name: 'Prosperity & Success', icon: Zap, color: '#f59e0b' },
    { id: 'protection', name: 'Protection & Healing', icon: Eye, color: '#10b981' },
    { id: 'wisdom', name: 'Wisdom & Knowledge', icon: Sparkles, color: '#8b5cf6' }
  ]

  const colorPresets = [
    { name: 'Mystic Blue', stroke: '#6366f1', bg: '#0f172a' },
    { name: 'Royal Purple', stroke: '#8b5cf6', bg: '#1e1b4b' },
    { name: 'Rose Gold', stroke: '#ec4899', bg: '#4c0519' },
    { name: 'Forest Green', stroke: '#10b981', bg: '#022c22' },
    { name: 'Sunset Orange', stroke: '#f97316', bg: '#431407' },
    { name: 'Crimson Red', stroke: '#ef4444', bg: '#450a0a' },
    { name: 'Ocean Teal', stroke: '#06b6d4', bg: '#083344' },
    { name: 'Golden Yellow', stroke: '#eab308', bg: '#422006' }
  ]

  const tabs = [
    { id: 'categories', name: 'Categories', icon: Star },
    { id: 'styles', name: 'Styles', icon: Palette },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'info', name: 'Info', icon: Info }
  ]

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '100%', opacity: 0 }
  }

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 glass-effect border-l border-white/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-mystical font-bold text-gradient">
                Sigil Studio
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 p-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-primary-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs">{tab.name}</div>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="sidebar-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'categories' && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                      Choose Category
                    </h3>
                    {categories.map(category => {
                      const Icon = category.icon
                      return (
                        <button
                          key={category.id}
                          onClick={() => onCategoryChange(category.id)}
                          className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                            selectedCategory === category.id
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-dark-600 hover:border-primary-500/50 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <Icon 
                                className="h-4 w-4" 
                                style={{ color: category.color }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Optimized patterns for {category.name.toLowerCase()}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </motion.div>
                )}

                {activeTab === 'styles' && (
                  <motion.div
                    key="styles"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-4">
                        Color Presets
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {colorPresets.map(preset => (
                          <button
                            key={preset.name}
                            onClick={() => onStyleChange({
                              strokeColor: preset.stroke,
                              backgroundColor: preset.bg
                            })}
                            className="p-3 rounded-lg border border-dark-600 hover:border-primary-500/50 transition-colors text-left"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: preset.stroke }}
                              />
                              <div 
                                className="w-4 h-4 rounded border border-white/20"
                                style={{ backgroundColor: preset.bg }}
                              />
                            </div>
                            <div className="text-xs font-medium text-gray-300">
                              {preset.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-4">
                        Custom Colors
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Stroke Color
                          </label>
                          <input
                            type="color"
                            value={styles.strokeColor}
                            onChange={(e) => onStyleChange({ strokeColor: e.target.value })}
                            className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Background Color
                          </label>
                          <input
                            type="color"
                            value={styles.backgroundColor}
                            onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                            className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Stroke Width: {styles.strokeWidth}px
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="8"
                            value={styles.strokeWidth}
                            onChange={(e) => onStyleChange({ strokeWidth: parseInt(e.target.value) })}
                            className="w-full accent-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                      Generation Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-600">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">
                            Auto-animate
                          </label>
                          <input
                            type="checkbox"
                            className="rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Automatically animate sigils when generated
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-600">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">
                            High Quality Export
                          </label>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Export sigils at higher resolution
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-600">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">
                            Save History
                          </label>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Keep a history of generated sigils
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                      About Sigils
                    </h3>
                    
                    <div className="space-y-4 text-sm text-gray-300">
                      <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                        <h4 className="font-semibold text-primary-300 mb-2">
                          What are Sigils?
                        </h4>
                        <p className="text-gray-400">
                          Sigils are mystical symbols created from written statements of intent. 
                          They serve as focal points for meditation and manifestation practices.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-600">
                        <h4 className="font-semibold text-gray-300 mb-2">
                          How to Use
                        </h4>
                        <ul className="text-gray-400 text-xs space-y-1">
                          <li>• Write your intention clearly</li>
                          <li>• Choose appropriate category</li>
                          <li>• Generate your unique sigil</li>
                          <li>• Meditate on the symbol</li>
                          <li>• Release attachment to outcome</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-600">
                        <h4 className="font-semibold text-gray-300 mb-2">
                          Tips for Success
                        </h4>
                        <ul className="text-gray-400 text-xs space-y-1">
                          <li>• Use present tense statements</li>
                          <li>• Be specific but not complex</li>
                          <li>• Focus on positive language</li>
                          <li>• Trust your intuition</li>
                          <li>• Regular practice enhances results</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar