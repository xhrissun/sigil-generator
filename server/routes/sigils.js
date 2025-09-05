import express from 'express'
import Sigil from '../models/Sigil.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For routes that can work with or without auth, set anonymous user
      req.user = { _id: 'anonymous', username: 'anonymous' }
      return next()
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    
    // You might want to fetch full user data from database here
    req.user = { _id: decoded.userId || decoded.id, ...decoded }
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    // For optional auth, continue as anonymous
    req.user = { _id: 'anonymous', username: 'anonymous' }
    next()
  }
}

// Authentication middleware that requires valid token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    
    req.user = { _id: decoded.userId || decoded.id, ...decoded }
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid token'
    })
  }
}

// Advanced sigil generation algorithm
const generateSigilPaths = (intention, category = 'general') => {
  const processed = intention
    .toLowerCase()
    .replace(/[aeiou\s]/g, '')
    .split('')
    .filter((char, index, arr) => arr.indexOf(char) === index)
    .join('')

  const centerX = 0.5
  const centerY = 0.5
  const paths = []

  switch (category) {
    case 'love':
      return generateLovePattern(processed, centerX, centerY)
    case 'prosperity':
      return generateProsperityPattern(processed, centerX, centerY)
    case 'protection':
      return generateProtectionPattern(processed, centerX, centerY)
    case 'wisdom':
      return generateWisdomPattern(processed, centerX, centerY)
    default:
      return generateGeneralPattern(processed, centerX, centerY)
  }
}

const generateLovePattern = (processed, centerX, centerY) => {
  const paths = []
  const heartPoints = []
  
  // Create heart shape
  for (let i = 0; i < processed.length * 4; i++) {
    const t = (i / (processed.length * 4)) * Math.PI * 2
    const scale = 0.15
    const x = centerX + scale * (16 * Math.pow(Math.sin(t), 3))
    const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    
    if (x >= 0.05 && x <= 0.95 && y >= 0.05 && y <= 0.95) {
      heartPoints.push({ x, y })
    }
  }
  
  if (heartPoints.length > 1) {
    paths.push(heartPoints)
  }
  
  return paths
}

const generateProsperityPattern = (processed, centerX, centerY) => {
  const paths = []
  const layers = 3
  
  for (let layer = 0; layer < layers; layer++) {
    const spiralPoints = []
    const radius = 0.08 + (layer * 0.08)
    const turns = 2.5
    
    for (let i = 0; i < processed.length * 8; i++) {
      const progress = i / (processed.length * 8)
      const angle = progress * Math.PI * 2 * turns
      const currentRadius = radius * (1 + progress * 1.5)
      const x = centerX + Math.cos(angle) * currentRadius
      const y = centerY + Math.sin(angle) * currentRadius
      
      if (x >= 0.05 && x <= 0.95 && y >= 0.05 && y <= 0.95) {
        spiralPoints.push({ x, y })
      }
    }
    
    if (spiralPoints.length > 1) {
      paths.push(spiralPoints)
    }
  }
  
  return paths
}

const generateProtectionPattern = (processed, centerX, centerY) => {
  const paths = []
  const sides = Math.max(6, processed.length)
  
  // Outer protective circle
  const outerPoints = []
  const innerPoints = []
  const outerRadius = 0.3
  const innerRadius = 0.18
  
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    
    outerPoints.push({
      x: centerX + Math.cos(angle) * outerRadius,
      y: centerY + Math.sin(angle) * outerRadius
    })
    
    innerPoints.push({
      x: centerX + Math.cos(angle) * innerRadius,
      y: centerY + Math.sin(angle) * innerRadius
    })
  }
  
  paths.push(outerPoints)
  paths.push(innerPoints)
  
  // Connecting lines
  for (let i = 0; i < sides; i += 2) {
    paths.push([outerPoints[i], innerPoints[i]])
  }
  
  return paths
}

const generateWisdomPattern = (processed, centerX, centerY) => {
  const paths = []
  
  // Tree trunk
  paths.push([
    { x: centerX, y: centerY + 0.25 },
    { x: centerX, y: centerY }
  ])
  
  // Branches
  const branches = processed.length
  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2
    const length = 0.12 + (Math.sin(i) * 0.05)
    const endX = centerX + Math.cos(angle) * length
    const endY = centerY + Math.sin(angle) * length
    
    paths.push([
      { x: centerX, y: centerY },
      { x: endX, y: endY }
    ])
    
    // Sub-branches
    if (i % 2 === 0) {
      const subAngle = angle + 0.3
      const subEndX = endX + Math.cos(subAngle) * 0.06
      const subEndY = endY + Math.sin(subAngle) * 0.06
      
      paths.push([
        { x: endX, y: endY },
        { x: subEndX, y: subEndY }
      ])
    }
  }
  
  return paths
}

const generateGeneralPattern = (processed, centerX, centerY) => {
  const paths = []
  const points = []
  const radius = 0.25
  
  // Create constellation pattern
  for (let i = 0; i < processed.length; i++) {
    const angle = (i / processed.length) * Math.PI * 2
    const variance = (processed.charCodeAt(i) % 40 - 20) * 0.002
    const currentRadius = radius + variance
    
    points.push({
      x: centerX + Math.cos(angle) * currentRadius,
      y: centerY + Math.sin(angle) * currentRadius
    })
  }
  
  if (points.length > 0) {
    // Central connections
    const centralPath = [{ x: centerX, y: centerY }]
    points.forEach(point => {
      centralPath.push(point)
      centralPath.push({ x: centerX, y: centerY })
    })
    paths.push(centralPath)
    
    // Inter-point connections
    for (let i = 0; i < points.length; i++) {
      const connectTo = (i + Math.floor(processed.length / 2)) % points.length
      if (connectTo !== i) {
        paths.push([points[i], points[connectTo]])
      }
    }
  }
  
  return paths
}

// POST /api/sigils/generate - Generate a new sigil
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { intention, category = 'general' } = req.body
    
    if (!intention || typeof intention !== 'string' || intention.trim().length < 3) {
      return res.status(400).json({
        error: 'Invalid intention',
        message: 'Intention must be at least 3 characters long'
      })
    }
    
    const startTime = Date.now()
    const paths = generateSigilPaths(intention.trim(), category)
    const generationTime = Date.now() - startTime
    
    if (!paths || paths.length === 0) {
      return res.status(500).json({
        error: 'Generation failed',
        message: 'Unable to generate sigil paths'
      })
    }
    
    const sigilData = {
      intention: intention.trim(),
      category,
      paths,
      userId: req.user._id, // Set the authenticated user's ID
      generationMethod: 'server',
      metadata: {
        processedText: intention.toLowerCase().replace(/[aeiou\s]/g, '').split('').filter((char, index, arr) => arr.indexOf(char) === index).join(''),
        originalLength: intention.length,
        uniqueCharacters: new Set(intention.toLowerCase().replace(/\s/g, '')).size,
        generationTime
      }
    }
    
    res.json(sigilData)
    
  } catch (error) {
    console.error('Error generating sigil:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to generate sigil'
    })
  }
})

// GET /api/sigils - Get all sigils with filtering and pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      sortBy = 'newest',
      search,
      myOnly = false
    } = req.query

    let filter = {}
    
    // If myOnly is true and user is authenticated, filter by userId
    if (myOnly === 'true' && req.user._id !== 'anonymous') {
      filter.userId = req.user._id
    } else if (myOnly !== 'true') {
      // Show public sigils or user's own sigils
      filter.$or = [
        { isPublic: true },
        { userId: req.user._id }
      ]
    }
    
    if (category && category !== 'all') {
      filter.category = category
    }
    
    if (search) {
      filter.$or = [
        { intention: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    let sort = {}
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'alphabetical':
        sort = { intention: 1 }
        break
      case 'complexity':
        sort = { 'complexity.score': -1 }
        break
      case 'popular':
        sort = { views: -1, downloads: -1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const sigils = await Sigil.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      //.select('-imageData') // Exclude large image data for list view

    const total = await Sigil.countDocuments(filter)
    
    res.json({
      sigils,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    })

  } catch (error) {
    console.error('Error fetching sigils:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch sigils'
    })
  }
})

// POST /api/sigils - Create/save a new sigil
router.post('/', authenticate, async (req, res) => {
  try {
    const sigilData = req.body
    
    // Validate required fields
    if (!sigilData.intention || !sigilData.paths) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Intention and paths are required'
      })
    }

    // Set the authenticated user's ID
    sigilData.userId = req.user._id

    const sigil = new Sigil(sigilData)
    const savedSigil = await sigil.save()
    
    res.status(201).json(savedSigil)

  } catch (error) {
    console.error('Error saving sigil:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to save sigil'
    })
  }
})

// GET /api/sigils/my - Get current user's sigils
router.get('/my', requireAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      sortBy = 'newest',
      search
    } = req.query

    let filter = { userId: req.user._id }
    
    if (category && category !== 'all') {
      filter.category = category
    }
    
    if (search) {
      filter.$or = [
        { intention: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    let sort = {}
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'alphabetical':
        sort = { intention: 1 }
        break
      case 'complexity':
        sort = { 'complexity.score': -1 }
        break
      case 'popular':
        sort = { views: -1, downloads: -1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const sigils = await Sigil.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)

    const total = await Sigil.countDocuments(filter)
    
    res.json({
      sigils,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    })

  } catch (error) {
    console.error('Error fetching user sigils:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch user sigils'
    })
  }
})

// GET /api/sigils/:id - Get specific sigil by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sigil = await Sigil.findById(req.params.id)
    
    if (!sigil) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sigil not found'
      })
    }

    // Check if user can access this sigil
    if (!sigil.isPublic && sigil.userId !== req.user._id && req.user._id !== 'anonymous') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You do not have permission to view this sigil'
      })
    }

    // Increment view count
    await sigil.incrementViews()
    
    res.json(sigil)

  } catch (error) {
    console.error('Error fetching sigil:', error)
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid sigil ID format'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch sigil'
    })
  }
})

// PATCH /api/sigils/:id - Update specific sigil
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const sigil = await Sigil.findById(req.params.id)
    
    if (!sigil) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sigil not found'
      })
    }

    // Check if user owns this sigil
    if (sigil.userId !== req.user._id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only update your own sigils'
      })
    }

    const updates = req.body
    const allowedUpdates = ['strokeColor', 'strokeWidth', 'backgroundColor', 'imageData', 'tags', 'isPublic']
    const actualUpdates = {}
    
    // Filter allowed updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key]
      }
    })
    
    const updatedSigil = await Sigil.findByIdAndUpdate(
      req.params.id,
      actualUpdates,
      { new: true, runValidators: true }
    )
    
    res.json(updatedSigil)

  } catch (error) {
    console.error('Error updating sigil:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      })
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid sigil ID format'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update sigil'
    })
  }
})

// DELETE /api/sigils/:id - Delete specific sigil
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const sigil = await Sigil.findById(req.params.id)
    
    if (!sigil) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sigil not found'
      })
    }

    // Check if user owns this sigil
    if (sigil.userId !== req.user._id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own sigils'
      })
    }

    await Sigil.findByIdAndDelete(req.params.id)
    
    res.json({
      message: 'Sigil deleted successfully',
      deletedSigil: sigil.toMinimalJSON()
    })

  } catch (error) {
    console.error('Error deleting sigil:', error)
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid sigil ID format'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete sigil'
    })
  }
})

// GET /api/sigils/category/:category - Get sigils by category
router.get('/category/:category', authenticate, async (req, res) => {
  try {
    const { category } = req.params
    const { limit = 12, page = 1 } = req.query
    
    const validCategories = ['general', 'love', 'prosperity', 'protection', 'wisdom']
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid Category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      })
    }
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    // Filter to show public sigils or user's own sigils
    const filter = {
      category,
      $or: [
        { isPublic: true },
        { userId: req.user._id }
      ]
    }
    
    const sigils = await Sigil.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-imageData')
    
    const total = await Sigil.countDocuments(filter)
    
    res.json({
      category,
      sigils,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    })

  } catch (error) {
    console.error('Error fetching sigils by category:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch sigils by category'
    })
  }
})

// GET /api/sigils/search - Search sigils
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q: query, category, limit = 12, page = 1 } = req.query
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid Query',
        message: 'Search query must be at least 2 characters long'
      })
    }
    
    let searchFilter = {
      $or: [
        { intention: { $regex: query.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } }
      ]
    }

    // Add category filter if specified
    if (category && category !== 'all') {
      searchFilter.category = category
    }

    // Filter to show public sigils or user's own sigils
    searchFilter.$and = [
      {
        $or: [
          { isPublic: true },
          { userId: req.user._id }
        ]
      }
    ]
    
    const searchOptions = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    }
    
    const sigils = await Sigil.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(searchOptions.skip)
      .limit(searchOptions.limit)
    
    const total = await Sigil.countDocuments(searchFilter)
    
    res.json({
      query: query.trim(),
      sigils,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    })

  } catch (error) {
    console.error('Error searching sigils:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to search sigils'
    })
  }
})

// POST /api/sigils/:id/download - Track download
router.post('/:id/download', authenticate, async (req, res) => {
  try {
    const sigil = await Sigil.findById(req.params.id)
    
    if (!sigil) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sigil not found'
      })
    }

    // Check if user can access this sigil
    if (!sigil.isPublic && sigil.userId !== req.user._id && req.user._id !== 'anonymous') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You do not have permission to download this sigil'
      })
    }

    await sigil.incrementDownloads()
    
    res.json({
      message: 'Download tracked',
      downloads: sigil.downloads
    })

  } catch (error) {
    console.error('Error tracking download:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to track download'
    })
  }
})

// GET /api/sigils/stats/summary - Get statistics summary
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const filter = req.user._id !== 'anonymous' ? 
      { $or: [{ isPublic: true }, { userId: req.user._id }] } : 
      { isPublic: true }
    
    const totalSigils = await Sigil.countDocuments(filter)
    const categoryStats = await Sigil.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgComplexity: { $avg: '$complexity.score' }
        }
      },
      { $sort: { count: -1 } }
    ])
    
    const recentSigils = await Sigil.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('intention category createdAt complexity')
    
    const totalDownloads = await Sigil.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ])
    
    const totalViews = await Sigil.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])

    res.json({
      total: totalSigils,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      categories: categoryStats,
      recent: recentSigils
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch statistics'
    })
  }
})

export default router