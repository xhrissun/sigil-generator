import mongoose from 'mongoose'

const pointSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  y: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  }
}, { _id: false })

const pathSchema = new mongoose.Schema({
  points: [pointSchema]
}, { _id: false })

const sigilSchema = new mongoose.Schema({
  intention: {
    type: String,
    required: [true, 'Intention is required'],
    trim: true,
    minlength: [3, 'Intention must be at least 3 characters long'],
    maxlength: [200, 'Intention cannot exceed 200 characters']
  },
  
  category: {
    type: String,
    required: true,
    enum: ['general', 'love', 'prosperity', 'protection', 'wisdom'],
    default: 'general'
  },
  
  paths: {
    type: [[pointSchema]],
    required: true,
    validate: {
      validator: function(paths) {
        return paths && paths.length > 0
      },
      message: 'At least one path is required'
    }
  },
  
  strokeColor: {
    type: String,
    default: '#6366f1',
    validate: {
      validator: function(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
      },
      message: 'Invalid hex color format'
    }
  },
  
  strokeWidth: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  
  backgroundColor: {
    type: String,
    default: '#0f172a',
    validate: {
      validator: function(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
      },
      message: 'Invalid hex color format'
    }
  },
  
  imageData: {
    type: String,
    validate: {
      validator: function(data) {
        if (!data) return true // Optional field
        return data.startsWith('data:image/')
      },
      message: 'Invalid image data format'
    }
  },
  
  generationMethod: {
    type: String,
    enum: ['server', 'client', 'hybrid'],
    default: 'server'
  },
  
  complexity: {
    paths: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  },
  
  metadata: {
    processedText: String,
    originalLength: Number,
    uniqueCharacters: Number,
    generationTime: Number
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  userId: {
    type: String,
    default: 'anonymous'
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance
sigilSchema.index({ createdAt: -1 })
sigilSchema.index({ category: 1, createdAt: -1 })
sigilSchema.index({ userId: 1, createdAt: -1 })
sigilSchema.index({ intention: 'text' })
sigilSchema.index({ tags: 1 })

// Virtual for formatted creation date
sigilSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

// Virtual for age in days
sigilSchema.virtual('ageInDays').get(function() {
  const now = new Date()
  const created = new Date(this.createdAt)
  const diffTime = Math.abs(now - created)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to calculate complexity
sigilSchema.pre('save', function(next) {
  if (this.paths && Array.isArray(this.paths)) {
    let totalPoints = 0
    let totalPaths = this.paths.length
    
    this.paths.forEach(path => {
      totalPoints += path.length
    })
    
    this.complexity = {
      paths: totalPaths,
      points: totalPoints,
      score: (totalPaths * 2) + totalPoints
    }
    
    // Auto-generate tags based on intention and category
    if (this.isModified('intention') || this.isModified('category')) {
      const intentionWords = this.intention.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 5) // Limit to 5 words
      
      this.tags = [...new Set([this.category, ...intentionWords])]
    }
  }
  
  next()
})

// Static method to find similar sigils
sigilSchema.statics.findSimilar = function(intention, category, limit = 5) {
  return this.find({
    $or: [
      { category: category },
      { intention: { $regex: intention.split(' ').join('|'), $options: 'i' } }
    ]
  })
  .limit(limit)
  .sort({ createdAt: -1 })
}

// Static method for advanced search
sigilSchema.statics.search = function(query, options = {}) {
  const searchFilter = {
    $or: [
      { intention: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }
  
  if (options.category && options.category !== 'all') {
    searchFilter.category = options.category
  }
  
  if (options.userId) {
    searchFilter.userId = options.userId
  }
  
  let queryBuilder = this.find(searchFilter)
  
  // Sorting
  switch (options.sortBy) {
    case 'newest':
      queryBuilder = queryBuilder.sort({ createdAt: -1 })
      break
    case 'oldest':
      queryBuilder = queryBuilder.sort({ createdAt: 1 })
      break
    case 'complexity':
      queryBuilder = queryBuilder.sort({ 'complexity.score': -1 })
      break
    case 'popular':
      queryBuilder = queryBuilder.sort({ views: -1, downloads: -1 })
      break
    default:
      queryBuilder = queryBuilder.sort({ createdAt: -1 })
  }
  
  if (options.limit) {
    queryBuilder = queryBuilder.limit(parseInt(options.limit))
  }
  
  if (options.skip) {
    queryBuilder = queryBuilder.skip(parseInt(options.skip))
  }
  
  return queryBuilder
}

// Instance method to increment views
sigilSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Instance method to increment downloads
sigilSchema.methods.incrementDownloads = function() {
  this.downloads += 1
  return this.save()
}

// Instance method to export minimal data
sigilSchema.methods.toMinimalJSON = function() {
  return {
    _id: this._id,
    intention: this.intention,
    category: this.category,
    createdAt: this.createdAt,
    strokeColor: this.strokeColor,
    backgroundColor: this.backgroundColor,
    complexity: this.complexity
  }
}

const Sigil = mongoose.model('Sigil', sigilSchema)

export default Sigil