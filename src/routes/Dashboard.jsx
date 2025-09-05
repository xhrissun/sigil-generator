import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, Trash2, Calendar, Tag, Sparkles } from 'lucide-react'
import { getAllSigils, deleteSigil } from '../api/sigilAPI'

const Dashboard = () => {
  const [sigils, setSigils] = useState([])
  const [filteredSigils, setFilteredSigils] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [selectedSigil, setSelectedSigil] = useState(null)

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General' },
    { id: 'love', name: 'Love & Relationships' },
    { id: 'prosperity', name: 'Prosperity & Success' },
    { id: 'protection', name: 'Protection & Healing' },
    { id: 'wisdom', name: 'Wisdom & Knowledge' }
  ]

  useEffect(() => {
    loadSigils()
  }, [])

  useEffect(() => {
    filterAndSortSigils()
  }, [sigils, searchTerm, selectedCategory, sortBy])

  const loadSigils = async () => {
    try {
      const data = await getAllSigils()
      setSigils(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading sigils:', error)
      setSigils([
        {
          _id: '1',
          intention: 'I am confident and strong',
          category: 'general',
          createdAt: new Date().toISOString(),
          strokeColor: '#6366f1',
          backgroundColor: '#ffffff',
          imageData:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortSigils = () => {
    let filtered = [...sigils]

    if (searchTerm) {
      filtered = filtered.filter(sigil =>
        sigil.intention.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(sigil => sigil.category === selectedCategory)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'alphabetical':
          return a.intention.localeCompare(b.intention)
        default:
          return 0
      }
    })

    setFilteredSigils(filtered)
  }

  const handleDeleteSigil = async sigilId => {
    if (window.confirm('Are you sure you want to delete this sigil?')) {
      try {
        await deleteSigil(sigilId)
        setSigils(prev => prev.filter(s => s._id !== sigilId))
      } catch (error) {
        console.error('Error deleting sigil:', error)
      }
    }
  }

  const downloadSigil = sigil => {
    if (sigil.imageData) {
      const link = document.createElement('a')
      link.download = `sigil-${sigil.intention.substring(0, 20)}.png`
      link.href = sigil.imageData
      link.click()
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const SigilModal = ({ sigil, onClose }) => (
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
        className="card max-w-2xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-mystical font-bold text-gradient mb-2">
            {sigil.intention}
          </h3>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(sigil.createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span className="capitalize">{sigil.category}</span>
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          {sigil.svgData ? (
            <div
              className="max-w-md mx-auto rounded-lg shadow-lg border p-4"
              style={{ backgroundColor: sigil.backgroundColor || '#ffffff' }}
              dangerouslySetInnerHTML={{ __html: sigil.svgData }}
            />
          ) : sigil.imageData ? (
            <div
              className="max-w-md mx-auto rounded-lg shadow-lg border p-4"
              style={{ backgroundColor: sigil.backgroundColor || '#ffffff' }}
            >
              <img
                src={sigil.imageData}
                alt="Sigil"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-64 h-64 mx-auto bg-dark-800 rounded-lg border border-dark-600 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary-400/50" />
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => downloadSigil(sigil)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <button
            onClick={() => {
              handleDeleteSigil(sigil._id)
              onClose()
            }}
            className="btn-secondary text-red-400 border-red-500/50 hover:border-red-500 inline-flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-12 w-12 text-primary-400" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-mystical font-bold mb-6 text-gradient">
            Your Sigil Collection
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manage and explore your personal library of mystical symbols
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search intentions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="input-field pl-10 w-full"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field w-full"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredSigils.length} of {sigils.length} sigils
          </div>
        </motion.div>

        {/* Sigils Grid */}
        <AnimatePresence>
          {filteredSigils.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Sparkles className="h-16 w-16 text-primary-400/50 mx-auto mb-6" />
              <h3 className="text-xl font-mystical font-semibold text-gray-400 mb-2">
                No sigils found
              </h3>
              <p className="text-gray-500">
                {sigils.length === 0
                  ? 'Create your first sigil to get started'
                  : 'Try adjusting your filters'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredSigils.map(sigil => (
                <motion.div
                  key={sigil._id}
                  variants={{ hidden: { opacity: 1, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02 }}
                  className="card group cursor-pointer"
                  onClick={() => setSelectedSigil(sigil)}
                >
                  <div
                    className="aspect-square mb-4 rounded-lg overflow-hidden border flex items-center justify-center"
                    style={{ backgroundColor: sigil.backgroundColor || '#ffffff' }}
                  >
                    {sigil.svgData ? (
                      <div
                        className="w-full h-full flex items-center justify-center p-2"
                        dangerouslySetInnerHTML={{ __html: sigil.svgData }}
                      />
                    ) : sigil.imageData ? (
                      <img
                        src={sigil.imageData}
                        alt="Sigil"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : sigil.imageUrl ? (
                      <img
                        src={sigil.imageUrl}
                        alt="Sigil"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Sparkles className="h-8 w-8 text-primary-400/50" />
                    )}
                  </div>

                  <h3 className="font-medium text-white group-hover:text-primary-300 transition-colors mb-2 line-clamp-2">
                    {sigil.intention}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span className="capitalize">{sigil.category}</span>
                    </span>
                    <span>{formatDate(sigil.createdAt)}</span>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        downloadSigil(sigil)
                      }}
                      className="flex-1 btn-secondary py-2 text-sm inline-flex items-center justify-center space-x-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteSigil(sigil._id)
                      }}
                      className="btn-secondary py-2 px-3 text-red-400 border-red-500/50 hover:border-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {selectedSigil && (
            <SigilModal
              sigil={selectedSigil}
              onClose={() => setSelectedSigil(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Dashboard
