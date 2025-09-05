// Helper function to generate initials patterns
const generateInitialPatterns = (initials, centerX, centerY, textLength) => {
  const paths = []
  const initialCount = initials.length
  
  if (initialCount === 0) return paths

  // Position initials around the main pattern
  const positions = getInitialPositions(initialCount, centerX, centerY)
  
  initials.split('').forEach((initial, index) => {
    const pos = positions[index]
    const shouldReverse = (textLength + index) % 3 === 0
    const shouldUseNumber = (textLength + index) % 4 === 0
    
    let character = initial
    
    if (shouldUseNumber) {
      // Convert to number based on alphabetical position
      character = ((initial.charCodeAt(0) - 96) % 10).toString()
    } else if (shouldReverse) {
      // Use mirrored/reversed version representation
      character = reverseCharacter(initial)
    }
    
    // Generate small geometric pattern for each initial
    const initialPath = generateCharacterGeometry(character, pos.x, pos.y, 0.03)
    if (initialPath.length > 0) {
      paths.push(...initialPath)
    }
  })

  return paths
}

const getInitialPositions = (count, centerX, centerY) => {
  const positions = []
  const radius = 0.35
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    positions.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  
  return positions
}

const reverseCharacter = (char) => {
  // Simple character reversal mapping for mystical effect
  const reverseMap = {
    'a': 'É', 'b': 'q', 'c': 'É"', 'd': 'p', 'e': 'Ç', 'f': 'ÉŸ',
    'g': 'Æƒ', 'h': 'É¥', 'i': 'á´‰', 'j': 'É¾', 'k': 'Êž', 'l': 'l',
    'm': 'É¯', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'É¹',
    's': 's', 't': 'Ê‡', 'u': 'n', 'v': 'ÊŒ', 'w': 'Ê', 'x': 'x',
    'y': 'ÊŽ', 'z': 'z'
  }
  
  return reverseMap[char] || char
}

const generateCharacterGeometry = (char, centerX, centerY, size) => {
  const paths = []
  
  // Generate a unique geometric pattern for each character
  const charCode = char.charCodeAt(0)
  const sides = 3 + (charCode % 6) // 3-8 sided pattern
  
  const outerPath = []
  const innerPath = []
  
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2
    const outerRadius = size
    const innerRadius = size * 0.5
    
    // Outer pattern
    outerPath.push({
      x: centerX + Math.cos(angle) * outerRadius,
      y: centerY + Math.sin(angle) * outerRadius
    })
    
    // Inner pattern
    innerPath.push({
      x: centerX + Math.cos(angle + Math.PI / sides) * innerRadius,
      y: centerY + Math.sin(angle + Math.PI / sides) * innerRadius
    })
  }
  
  paths.push(outerPath, innerPath)
  
  // Add connecting lines
  for (let i = 0; i < Math.min(outerPath.length - 1, innerPath.length - 1); i++) {
    paths.push([outerPath[i], innerPath[i]])
  }
  
  return paths
}

// Additional helper functions for complex patterns

const generateVesicaPiscis = (centerX, centerY, radius) => {
  const paths = []
  const offset = radius * 0.5
  
  // Two intersecting circles
  const circle1 = []
  const circle2 = []
  
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * Math.PI * 2
    
    circle1.push({
      x: centerX - offset + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
    
    circle2.push({
      x: centerX + offset + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  
  paths.push(circle1, circle2)
  return paths
}

const generateRunePattern = (processed, centerX, centerY) => {
  const paths = []
  const runeCount = Math.min(processed.length, 8)
  
  for (let i = 0; i < runeCount; i++) {
    const angle = (i / runeCount) * Math.PI * 2
    const distance = 0.28
    const runeX = centerX + Math.cos(angle) * distance
    const runeY = centerY + Math.sin(angle) * distance
    
    // Generate simple rune-like patterns
    const runeSize = 0.04
    const runePaths = generateRuneSymbol(processed.charCodeAt(i % processed.length), runeX, runeY, runeSize)
    paths.push(...runePaths)
  }
  
  return paths
}

const generateRuneSymbol = (charCode, centerX, centerY, size) => {
  const paths = []
  const pattern = charCode % 8 // 8 different rune patterns
  
  switch (pattern) {
    case 0: // Vertical line with branches
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size * 0.5, y: centerY - size * 0.5 },
        { x: centerX + size * 0.5, y: centerY - size * 0.5 }
      ])
      break
    case 1: // Triangle
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX - size, y: centerY + size },
        { x: centerX + size, y: centerY + size },
        { x: centerX, y: centerY - size }
      ])
      break
    default:
      // More rune patterns...
      paths.push([
        { x: centerX - size, y: centerY - size },
        { x: centerX + size, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size, y: centerY + size },
        { x: centerX + size, y: centerY - size }
      ])
  }
  
  return paths
}

const generateElementalCrosses = (centerX, centerY, radius) => {
  const paths = []
  
  // Four elemental directions
  const directions = [
    { angle: 0, element: 'fire' },
    { angle: Math.PI / 2, element: 'earth' },
    { angle: Math.PI, element: 'air' },
    { angle: 3 * Math.PI / 2, element: 'water' }
  ]
  
  directions.forEach(dir => {
    const x = centerX + Math.cos(dir.angle) * radius
    const y = centerY + Math.sin(dir.angle) * radius
    
    // Create elemental symbol
    const symbolSize = 0.03
    const symbol = generateElementalSymbol(dir.element, x, y, symbolSize)
    paths.push(...symbol)
  })
  
  return paths
}

const generateElementalSymbol = (element, centerX, centerY, size) => {
  const paths = []
  
  switch (element) {
    case 'fire': // Triangle pointing up
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX - size, y: centerY + size },
        { x: centerX + size, y: centerY + size },
        { x: centerX, y: centerY - size }
      ])
      break
    case 'earth': // Triangle pointing down
      paths.push([
        { x: centerX, y: centerY + size },
        { x: centerX - size, y: centerY - size },
        { x: centerX + size, y: centerY - size },
        { x: centerX, y: centerY + size }
      ])
      break
    case 'air': // Triangle up with line
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX - size, y: centerY + size },
        { x: centerX + size, y: centerY + size },
        { x: centerX, y: centerY - size }
      ])
      paths.push([
        { x: centerX - size * 0.5, y: centerY },
        { x: centerX + size * 0.5, y: centerY }
      ])
      break
    case 'water': // Triangle down with line
      paths.push([
        { x: centerX, y: centerY + size },
        { x: centerX - size, y: centerY - size },
        { x: centerX + size, y: centerY - size },
        { x: centerX, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size * 0.5, y: centerY },
        { x: centerX + size * 0.5, y: centerY }
      ])
      break
  }
  
  return paths
}

const getTreeOfLifeConnections = () => {
  // Simplified Tree of Life connections
  return {
    0: [1, 2, 4], // Kether
    1: [0, 3, 4], // Chokmah
    2: [0, 4, 5], // Binah
    3: [1, 4, 6], // Chesed
    4: [0, 1, 2, 3, 5, 6, 7], // Tiphereth
    5: [2, 4, 7], // Geburah
    6: [3, 4, 8], // Netzach
    7: [4, 5, 8], // Hod
    8: [6, 7, 9], // Yesod
    9: [8] // Malkuth
  }
}

const generateFractalBranches = (processed, x, y, length, angle, depth) => {
  const paths = []
  
  if (depth <= 0 || length < 0.02) return paths
  
  const endX = x + Math.cos(angle) * length
  const endY = y + Math.sin(angle) * length
  
  paths.push([{ x, y }, { x: endX, y: endY }])
  
  if (depth > 1) {
    const branchAngle1 = angle - Math.PI / 6
    const branchAngle2 = angle + Math.PI / 6
    const newLength = length * 0.7
    
    const leftBranches = generateFractalBranches(processed, endX, endY, newLength, branchAngle1, depth - 1)
    const rightBranches = generateFractalBranches(processed, endX, endY, newLength, branchAngle2, depth - 1)
    
    paths.push(...leftBranches, ...rightBranches)
  }
  
  return paths
}

const generatePolyhedronProjection = (processed, centerX, centerY) => {
  // Project 3D polyhedron onto 2D plane
  const paths = []
  const vertices = generateIcosahedronVertices()
  
  // Project vertices and create connections
  const projectedVertices = vertices.map(vertex => ({
    x: centerX + vertex.x * 0.2,
    y: centerY + vertex.y * 0.2
  }))
  
  // Connect vertices based on icosahedron edges
  const edges = getIcosahedronEdges()
  edges.forEach(edge => {
    if (edge[0] < projectedVertices.length && edge[1] < projectedVertices.length) {
      paths.push([projectedVertices[edge[0]], projectedVertices[edge[1]]])
    }
  })
  
  return paths
}

const generateIcosahedronVertices = () => {
  const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
  const vertices = []
  
  // Icosahedron vertices (simplified)
  const coords = [
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
  ]
  
  coords.forEach(coord => {
    vertices.push({
      x: coord[0] / phi,
      y: coord[1] / phi,
      z: coord[2] / phi
    })
  })
  
  return vertices
}

const getIcosahedronEdges = () => {
  // Simplified icosahedron edge connections
  return [
    [0, 1], [0, 4], [0, 6], [0, 8], [0, 10],
    [1, 4], [1, 6], [1, 9], [1, 11],
    [2, 3], [2, 5], [2, 7], [2, 8], [2, 10],
    [3, 5], [3, 7], [3, 9], [3, 11],
    [4, 5], [4, 8], [4, 9],
    [5, 9],
    [6, 7], [6, 10], [6, 11],
    [7, 10], [7, 11],
    [8, 10],
    [9, 11]
  ]
}

const generateFlowerOfLifePattern = (centerX, centerY, radius, complexity) => {
  const paths = []
  const layers = Math.min(complexity, 4)
  
  for (let layer = 0; layer < layers; layer++) {
    const currentRadius = radius * (0.5 + layer * 0.25)
    const circleCount = layer === 0 ? 1 : 6 * layer
    
    for (let i = 0; i < circleCount; i++) {
      const angle = (i / circleCount) * Math.PI * 2
      const distance = layer * currentRadius * 0.8
      const circleX = centerX + Math.cos(angle) * distance
      const circleY = centerY + Math.sin(angle) * distance
      
      const circle = []
      for (let j = 0; j <= 24; j++) {
        const circleAngle = (j / 24) * Math.PI * 2
        circle.push({
          x: circleX + Math.cos(circleAngle) * currentRadius,
          y: circleY + Math.sin(circleAngle) * currentRadius
        })
      }
      paths.push(circle)
    }
  }
  
  return paths
}

const generateMetatronsCube = (centerX, centerY, radius) => {
  const paths = []
  
  // Create 13 circles of Metatron's cube
  const positions = [
    { x: 0, y: 0 }, // Center
    // Inner ring
    { x: 0, y: -1 }, { x: 0.866, y: -0.5 }, { x: 0.866, y: 0.5 },
    { x: 0, y: 1 }, { x: -0.866, y: 0.5 }, { x: -0.866, y: -0.5 },
    // Outer ring
    { x: 0, y: -2 }, { x: 1.732, y: -1 }, { x: 1.732, y: 1 },
    { x: 0, y: 2 }, { x: -1.732, y: 1 }, { x: -1.732, y: -1 }
  ]
  
  const scale = radius * 0.15
  const circleRadius = scale * 0.3
  
  // Draw circles
  positions.forEach(pos => {
    const circle = []
    const circleX = centerX + pos.x * scale
    const circleY = centerY + pos.y * scale
    
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      circle.push({
        x: circleX + Math.cos(angle) * circleRadius,
        y: circleY + Math.sin(angle) * circleRadius
      })
    }
    paths.push(circle)
  })
  
  // Connect circles according to Metatron's cube pattern
  const connections = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], // Center to inner ring
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1], // Inner ring connections
    [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12], // Inner to outer
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7] // Outer ring
  ]
  
  connections.forEach(connection => {
    const start = positions[connection[0]]
    const end = positions[connection[1]]
    paths.push([
      { x: centerX + start.x * scale, y: centerY + start.y * scale },
      { x: centerX + end.x * scale, y: centerY + end.y * scale }
    ])
  })
  
  return paths
}

// Main generation function with initials integration
export const generateClientSideSigil = (intention, category = 'general') => {
  const { paths, initialPaths } = generateSacredGeometry(intention, category)
  
  // Combine main paths with initial paths
  const allPaths = [...paths, ...initialPaths]
  
  return {
    intention,
    category,
    paths: optimizePaths(allPaths),
    timestamp: new Date().toISOString(),
    method: 'enhanced-client-generated',
    complexity: calculateSigilComplexity(allPaths),
    hasInitials: initialPaths.length > 0
  }
}

export const validateSigilData = (sigilData) => {
  if (!sigilData) return false
  if (!sigilData.intention || typeof sigilData.intention !== 'string') return false
  if (!sigilData.paths || !Array.isArray(sigilData.paths)) return false
  if (sigilData.paths.length === 0) return false
  
  // Validate path structure
  for (const path of sigilData.paths) {
    if (!Array.isArray(path)) return false
    if (path.length === 0) return false
    
    for (const point of path) {
      if (typeof point !== 'object' || point === null) return false
      if (typeof point.x !== 'number' || typeof point.y !== 'number') return false
      if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return false
      if (isNaN(point.x) || isNaN(point.y)) return false
    }
  }
  
  return true
}

export const optimizePaths = (paths) => {
  // Remove duplicate consecutive points and optimize paths
  return paths.map(path => {
    if (!Array.isArray(path) || path.length === 0) return []
    
    const optimized = []
    let lastPoint = null
    
    for (const point of path) {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') continue
      
      if (!lastPoint || 
          Math.abs(point.x - lastPoint.x) > 0.001 || 
          Math.abs(point.y - lastPoint.y) > 0.001) {
        
        // Ensure points are within bounds
        const clampedPoint = {
          x: Math.max(0, Math.min(1, point.x)),
          y: Math.max(0, Math.min(1, point.y))
        }
        
        optimized.push(clampedPoint)
        lastPoint = clampedPoint
      }
    }
    
    return optimized
  }).filter(path => path.length > 1) // Remove paths with less than 2 points
}

export const calculateSigilComplexity = (paths) => {
  let totalPoints = 0
  let totalPaths = paths.length
  let totalLength = 0
  
  paths.forEach(path => {
    if (Array.isArray(path)) {
      totalPoints += path.length
      
      // Calculate path length for complexity
      for (let i = 1; i < path.length; i++) {
        if (path[i] && path[i-1] && 
            typeof path[i].x === 'number' && typeof path[i].y === 'number' &&
            typeof path[i-1].x === 'number' && typeof path[i-1].y === 'number') {
          const dx = path[i].x - path[i-1].x
          const dy = path[i].y - path[i-1].y
          totalLength += Math.sqrt(dx * dx + dy * dy)
        }
      }
    }
  })
  
  return {
    paths: totalPaths,
    points: totalPoints,
    totalLength: Math.round(totalLength * 1000) / 1000,
    complexity: Math.round((totalPaths * 3) + totalPoints + (totalLength * 100)),
    density: totalPoints > 0 ? Math.round((totalLength / totalPoints) * 1000) / 1000 : 0
  }
}

export const getSigilBoundingBox = (paths) => {
  let minX = 1, minY = 1, maxX = 0, maxY = 0
  let validPoints = 0
  
  paths.forEach(path => {
    if (Array.isArray(path)) {
      path.forEach(point => {
        if (point && typeof point.x === 'number' && typeof point.y === 'number' &&
            !isNaN(point.x) && !isNaN(point.y)) {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
          validPoints++
        }
      })
    }
  })
  
  // If no valid points, return default bounds
  if (validPoints === 0) {
    return {
      minX: 0, minY: 0, maxX: 1, maxY: 1,
      width: 1, height: 1,
      centerX: 0.5, centerY: 0.5
    }
  }
  
  return {
    minX, minY, maxX, maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  }
}

// Additional utility functions for enhanced sigil generation

export const getSigilMetadata = (intention, paths) => {
  const { processed, initials } = processIntention(intention)
  const complexity = calculateSigilComplexity(paths)
  const boundingBox = getSigilBoundingBox(paths)
  
  return {
    processedText: processed,
    initials: initials,
    originalLength: intention.length,
    processedLength: processed.length,
    initialsCount: initials.length,
    complexity,
    boundingBox,
    timestamp: new Date().toISOString()
  }
}

export const generateSigilVariations = (intention, category = 'general', count = 3) => {
  const variations = []
  
  for (let i = 0; i < count; i++) {
    // Add slight randomization for variations
    const modifiedIntention = intention + ' ' + String.fromCharCode(65 + i) // Add A, B, C etc.
    const variation = generateClientSideSigil(modifiedIntention, category)
    variation.variation = i + 1
    variation.intention = intention // Keep original intention
    variations.push(variation)
  }
  
  return variations
}

export const analyzeSigilSymmetry = (paths) => {
  // Analyze horizontal, vertical, and radial symmetry
  const analysis = {
    horizontalSymmetry: 0,
    verticalSymmetry: 0,
    radialSymmetry: 0,
    averageSymmetry: 0
  }
  
  if (!paths || paths.length === 0) return analysis
  
  const allPoints = []
  paths.forEach(path => {
    if (Array.isArray(path)) {
      allPoints.push(...path.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number'))
    }
  })
  
  if (allPoints.length === 0) return analysis
  
  // Calculate center of mass
  const centerX = allPoints.reduce((sum, p) => sum + p.x, 0) / allPoints.length
  const centerY = allPoints.reduce((sum, p) => sum + p.y, 0) / allPoints.length
  
  // Check symmetries (simplified analysis)
  let horizontalMatches = 0
  let verticalMatches = 0
  let radialMatches = 0
  
  allPoints.forEach(point => {
    const tolerance = 0.1
    
    // Find horizontal mirror
    const hMirror = allPoints.find(p => 
      Math.abs(p.x - (2 * centerX - point.x)) < tolerance && 
      Math.abs(p.y - point.y) < tolerance
    )
    if (hMirror) horizontalMatches++
    
    // Find vertical mirror
    const vMirror = allPoints.find(p => 
      Math.abs(p.x - point.x) < tolerance && 
      Math.abs(p.y - (2 * centerY - point.y)) < tolerance
    )
    if (vMirror) verticalMatches++
    
    // Find radial mirror (180 degree rotation)
    const rMirror = allPoints.find(p => 
      Math.abs(p.x - (2 * centerX - point.x)) < tolerance && 
      Math.abs(p.y - (2 * centerY - point.y)) < tolerance
    )
    if (rMirror) radialMatches++
  })
  
  const totalPoints = allPoints.length
  if (totalPoints > 0) {
    analysis.horizontalSymmetry = Math.round((horizontalMatches / totalPoints) * 100)
    analysis.verticalSymmetry = Math.round((verticalMatches / totalPoints) * 100)
    analysis.radialSymmetry = Math.round((radialMatches / totalPoints) * 100)
    analysis.averageSymmetry = Math.round((analysis.horizontalSymmetry + analysis.verticalSymmetry + analysis.radialSymmetry) / 3)
  }
  
  return analysis
}

export const exportSigilToSVG = (sigilData) => {
  if (!validateSigilData(sigilData)) {
    throw new Error('Invalid sigil data')
  }
  
  const { paths } = sigilData
  const boundingBox = getSigilBoundingBox(paths)
  const viewBoxSize = 400
  
  let svgContent = `<svg viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" xmlns="http://www.w3.org/2000/svg">\n`
  svgContent += `  <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#000"/>\n`
  
  paths.forEach((path, index) => {
    if (!Array.isArray(path) || path.length < 2) return
    
    let pathData = `M ${path[0].x * viewBoxSize} ${path[0].y * viewBoxSize}`
    
    for (let i = 1; i < path.length; i++) {
      if (path[i] && typeof path[i].x === 'number' && typeof path[i].y === 'number') {
        pathData += ` L ${path[i].x * viewBoxSize} ${path[i].y * viewBoxSize}`
      }
    }
    
    svgContent += `  <path d="${pathData}" stroke="#fff" stroke-width="2" fill="none" opacity="0.8"/>\n`
  })
  
  svgContent += `  <text x="${viewBoxSize/2}" y="${viewBoxSize - 20}" text-anchor="middle" fill="#666" font-size="12">${sigilData.intention}</text>\n`
  svgContent += '</svg>'
  
  return svgContent
}

// All functions are already exported above where they are defined// Enhanced Sigil generation utilities with complex patterns and initials integration

export const processIntention = (intention) => {
  // Enhanced processing: extract initials and process main text
  const words = intention.trim().split(/\s+/)
  const initials = words.map(word => word.charAt(0).toLowerCase()).join('')
  
  // Remove vowels and duplicate letters (traditional method)
  const processed = intention
    .toLowerCase()
    .replace(/[aeiou\s]/g, '')
    .split('')
    .filter((char, index, arr) => arr.indexOf(char) === index)
    .join('')

  return { processed, initials, wordCount: words.length }
}

export const generateSacredGeometry = (text, category = 'general') => {
  const { processed, initials, wordCount } = processIntention(text)
  const paths = []
  const initialPaths = []
  const centerX = 0.5
  const centerY = 0.5

  // Generate main pattern based on category
  const mainPaths = generateMainPattern(processed, category, centerX, centerY, wordCount)
  paths.push(...mainPaths)

  // Generate initial patterns
  const initialPatterns = generateInitialPatterns(initials, centerX, centerY, processed.length)
  initialPaths.push(...initialPatterns)

  return { paths, initialPaths }
}

const generateMainPattern = (processed, category, centerX, centerY, wordCount) => {
  switch (category) {
    case 'love':
      return generateAdvancedLovePattern(processed, centerX, centerY, wordCount)
    case 'prosperity':
      return generateAdvancedProsperityPattern(processed, centerX, centerY, wordCount)
    case 'protection':
      return generateAdvancedProtectionPattern(processed, centerX, centerY, wordCount)
    case 'wisdom':
      return generateAdvancedWisdomPattern(processed, centerX, centerY, wordCount)
    default:
      return generateAdvancedGeneralPattern(processed, centerX, centerY, wordCount)
  }
}

const generateAdvancedLovePattern = (processed, centerX, centerY, wordCount) => {
  const paths = []
  const complexity = Math.min(processed.length, 8)

  // Multi-layer heart patterns with fibonacci spirals
  for (let layer = 0; layer < 3; layer++) {
    const heartPoints = []
    const scale = 0.15 + (layer * 0.08)
    const offset = layer * 0.02

    for (let i = 0; i < processed.length * 3; i++) {
      const t = (i / (processed.length * 3)) * Math.PI * 2
      // Enhanced heart equation with harmonic variations
      const r = scale * (1 + 0.3 * Math.sin(processed.charCodeAt(i % processed.length) * 0.1))
      const x = centerX + offset + r * 16 * Math.pow(Math.sin(t), 3) * 0.15
      const y = centerY - offset - r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.15
      
      if (x >= 0.05 && x <= 0.95 && y >= 0.05 && y <= 0.95) {
        heartPoints.push({ x, y })
      }
    }

    if (heartPoints.length > 1) {
      paths.push(heartPoints)
    }

    // Add infinity loops connecting hearts
    if (layer === 1) {
      const infinityPath = []
      for (let i = 0; i < 50; i++) {
        const t = (i / 50) * Math.PI * 4
        const x = centerX + 0.2 * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t))
        const y = centerY + 0.15 * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t))
        infinityPath.push({ x, y })
      }
      paths.push(infinityPath)
    }
  }

  // Golden ratio spiral connections
  const goldenRatio = 1.618033988749
  const spiralPath = []
  for (let i = 0; i < processed.length * 5; i++) {
    const angle = i * 0.3
    const radius = 0.02 * Math.sqrt(i) / goldenRatio
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    if (x >= 0.1 && x <= 0.9 && y >= 0.1 && y <= 0.9) {
      spiralPath.push({ x, y })
    }
  }
  if (spiralPath.length > 1) paths.push(spiralPath)

  return paths
}

const generateAdvancedProsperityPattern = (processed, centerX, centerY, wordCount) => {
  const paths = []
  const layers = Math.min(wordCount, 5)

  // Fibonacci spiral with expanding wealth patterns
  const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
  
  for (let layer = 0; layer < layers; layer++) {
    const spiralPath = []
    const fibRadius = fibSequence[layer] * 0.008
    const turns = 2 + layer * 0.5
    const points = processed.length * fibSequence[Math.min(layer, fibSequence.length - 1)]

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 * turns
      const currentRadius = fibRadius * (1 + (i / points) * fibSequence[layer])
      const x = centerX + Math.cos(angle) * currentRadius
      const y = centerY + Math.sin(angle) * currentRadius

      if (x >= 0.05 && x <= 0.95 && y >= 0.05 && y <= 0.95) {
        spiralPath.push({ x, y })
      }
    }

    if (spiralPath.length > 1) paths.push(spiralPath)

    // Add expanding geometric progressions
    const expansionPath = []
    const sides = 6 + layer
    const radius = 0.1 + (layer * 0.05)
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      expansionPath.push({ x, y })
    }
    paths.push(expansionPath)
  }

  // Add sacred geometry overlays (vesica piscis for abundance)
  const vesicaPaths = generateVesicaPiscis(centerX, centerY, 0.2)
  paths.push(...vesicaPaths)

  return paths
}

const generateAdvancedProtectionPattern = (processed, centerX, centerY, wordCount) => {
  const paths = []
  const complexity = Math.max(6, processed.length)

  // Multi-layer protection mandala
  const layers = [0.35, 0.25, 0.15, 0.08] // Decreasing radii for nested protection
  
  layers.forEach((radius, layerIndex) => {
    const sides = complexity + layerIndex * 2
    const polygon = []
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
      // Add sacred harmonics to each point
      const harmonic = 1 + 0.1 * Math.sin(i * processed.charCodeAt(i % processed.length) * 0.1)
      const x = centerX + Math.cos(angle) * radius * harmonic
      const y = centerY + Math.sin(angle) * radius * harmonic
      polygon.push({ x, y })
    }
    
    paths.push(polygon)

    // Add star patterns within each layer
    if (layerIndex < 2) {
      const starPath = []
      const starRadius = radius * 0.7
      
      for (let i = 0; i < sides; i += 2) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
        const x = centerX + Math.cos(angle) * starRadius
        const y = centerY + Math.sin(angle) * starRadius
        starPath.push({ x, y })
      }
      starPath.push(starPath[0]) // Close the star
      paths.push(starPath)
    }
  })

  // Add protective runes pattern
  const runePattern = generateRunePattern(processed, centerX, centerY)
  paths.push(...runePattern)

  // Add elemental crosses
  const crossPaths = generateElementalCrosses(centerX, centerY, 0.4)
  paths.push(...crossPaths)

  return paths
}

const generateAdvancedWisdomPattern = (processed, centerX, centerY, wordCount) => {
  const paths = []
  const branches = Math.max(processed.length, 6)

  // Tree of Life pattern with Kabbalah-inspired geometry
  const sephirotPositions = [
    { x: 0, y: -0.3 }, { x: -0.15, y: -0.15 }, { x: 0.15, y: -0.15 },
    { x: -0.25, y: 0 }, { x: 0, y: 0 }, { x: 0.25, y: 0 },
    { x: -0.15, y: 0.15 }, { x: 0.15, y: 0.15 }, { x: 0, y: 0.25 },
    { x: 0, y: 0.35 }
  ]

  // Main trunk with root system
  const trunkPath = []
  for (let i = 0; i < 20; i++) {
    const t = i / 19
    const x = centerX + 0.02 * Math.sin(t * Math.PI * 2) * t
    const y = centerY + 0.4 - t * 0.6
    trunkPath.push({ x, y })
  }
  paths.push(trunkPath)

  // Sephirot connections
  sephirotPositions.forEach((pos, index) => {
    const sephirotX = centerX + pos.x
    const sephirotY = centerY + pos.y
    
    // Create circular nodes
    const circle = []
    const radius = 0.03
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      circle.push({
        x: sephirotX + Math.cos(angle) * radius,
        y: sephirotY + Math.sin(angle) * radius
      })
    }
    paths.push(circle)

    // Connect to relevant other sephirot
    const connections = getTreeOfLifeConnections()[index] || []
    connections.forEach(targetIndex => {
      if (targetIndex < sephirotPositions.length) {
        const target = sephirotPositions[targetIndex]
        paths.push([
          { x: sephirotX, y: sephirotY },
          { x: centerX + target.x, y: centerY + target.y }
        ])
      }
    })
  })

  // Add fractal branches
  const fractalBranches = generateFractalBranches(processed, centerX, centerY - 0.1, 0.15, 0, 3)
  paths.push(...fractalBranches)

  // Sacred spiral of knowledge
  const knowledgeSpiral = []
  for (let i = 0; i < processed.length * 10; i++) {
    const angle = i * 0.5
    const radius = 0.05 + (i / (processed.length * 10)) * 0.2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    if (x >= 0.1 && x <= 0.9 && y >= 0.1 && y <= 0.9) {
      knowledgeSpiral.push({ x, y })
    }
  }
  if (knowledgeSpiral.length > 1) paths.push(knowledgeSpiral)

  return paths
}

const generateAdvancedGeneralPattern = (processed, centerX, centerY, wordCount) => {
  const paths = []
  const complexity = Math.max(processed.length, 4)

  // Traditional Solomonic Sigils and ceremonial magic patterns
  const solomonicPaths = generateSolomonicSigils(processed, centerX, centerY, complexity)
  paths.push(...solomonicPaths)

  // Enochian magical patterns
  const enochianPaths = generateEnochianPatterns(processed, centerX, centerY)
  paths.push(...enochianPaths)

  // Goetic circle patterns
  const goeticPaths = generateGoeticCircles(processed, centerX, centerY, wordCount)
  paths.push(...goeticPaths)

  // Hermetic seal patterns
  const hermeticPaths = generateHermeticSeals(processed, centerX, centerY)
  paths.push(...hermeticPaths)

  // Platonic solids projection patterns
  const polyhedronPaths = generatePolyhedronProjection(processed, centerX, centerY)
  paths.push(...polyhedronPaths)

  // Sacred geometry flower of life base pattern
  const flowerPaths = generateFlowerOfLifePattern(centerX, centerY, 0.25, complexity)
  paths.push(...flowerPaths)

  // Metatron's cube connections
  const metatronPaths = generateMetatronsCube(centerX, centerY, 0.3)
  paths.push(...metatronPaths)

  // Vortex mathematics pattern based on text
  const vortexPath = []
  for (let i = 0; i < processed.length * 9; i++) {
    const digitSum = (i % 9) + 1 // Vortex math digit sum
    const angle = (digitSum / 9) * Math.PI * 2 + (i * 0.1)
    const radius = 0.1 + (digitSum / 9) * 0.2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    vortexPath.push({ x, y })
  }
  if (vortexPath.length > 1) paths.push(vortexPath)

  // Planetary seals integration
  const planetaryPaths = generatePlanetarySeals(processed, centerX, centerY)
  paths.push(...planetaryPaths)

  return paths
}

// New Solomonic and ceremonial magic pattern generators
const generateSolomonicSigils = (processed, centerX, centerY, complexity) => {
  const paths = []
  
  // Traditional Solomonic pentagram with Hebrew names integration
  const pentagramPaths = generateSolomonicPentagram(centerX, centerY, 0.25)
  paths.push(...pentagramPaths)
  
  // Solomonic triangle with divine names
  const trianglePaths = generateSolomonicTriangle(centerX, centerY, 0.2)
  paths.push(...trianglePaths)
  
  // Magic square patterns (simplified)
  const magicSquarePaths = generateMagicSquarePattern(processed, centerX, centerY, 0.15)
  paths.push(...magicSquarePaths)
  
  // Seal of Solomon variations
  const sealPaths = generateSealOfSolomon(centerX, centerY, 0.3, complexity)
  paths.push(...sealPaths)
  
  return paths
}

const generateSolomonicPentagram = (centerX, centerY, radius) => {
  const paths = []
  
  // Outer pentagram
  const outerPentagram = []
  for (let i = 0; i < 5; i++) {
    const angle = (i * 144 - 90) * Math.PI / 180 // 144 degrees between points
    outerPentagram.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  
  // Connect pentagram points in star formation
  const starConnections = [0, 2, 4, 1, 3, 0] // Traditional pentagram connection order
  const pentagramPath = []
  starConnections.forEach(index => {
    pentagramPath.push(outerPentagram[index])
  })
  paths.push(pentagramPath)
  
  // Inner pentagon
  const innerRadius = radius * 0.618 // Golden ratio
  const innerPentagon = []
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180
    innerPentagon.push({
      x: centerX + Math.cos(angle) * innerRadius,
      y: centerY + Math.sin(angle) * innerRadius
    })
  }
  innerPentagon.push(innerPentagon[0]) // Close the pentagon
  paths.push(innerPentagon)
  
  // Add divine name positions (simplified geometric representations)
  const divineNameRadius = radius * 1.2
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180
    const nameX = centerX + Math.cos(angle) * divineNameRadius
    const nameY = centerY + Math.sin(angle) * divineNameRadius
    
    // Create small geometric symbol for each divine name position
    const nameSymbol = generateDivineNameSymbol(nameX, nameY, 0.02)
    paths.push(...nameSymbol)
  }
  
  return paths
}

const generateSolomonicTriangle = (centerX, centerY, size) => {
  const paths = []
  
  // Main triangle
  const triangle = []
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * Math.PI / 180
    triangle.push({
      x: centerX + Math.cos(angle) * size,
      y: centerY + Math.sin(angle) * size
    })
  }
  triangle.push(triangle[0]) // Close triangle
  paths.push(triangle)
  
  // Inner triangle (inverted)
  const innerTriangle = []
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 + 90) * Math.PI / 180 // Inverted
    innerTriangle.push({
      x: centerX + Math.cos(angle) * size * 0.5,
      y: centerY + Math.sin(angle) * size * 0.5
    })
  }
  innerTriangle.push(innerTriangle[0])
  paths.push(innerTriangle)
  
  // Add Hebrew letter-inspired geometric patterns at corners
  triangle.slice(0, 3).forEach((corner, index) => {
    const letterPattern = generateHebrewLetterGeometry(index, corner.x, corner.y, 0.03)
    paths.push(...letterPattern)
  })
  
  return paths
}

const generateMagicSquarePattern = (processed, centerX, centerY, size) => {
  const paths = []
  const gridSize = Math.min(processed.length, 7) // Max 7x7 magic square
  const cellSize = (size * 2) / gridSize
  
  // Create grid
  for (let i = 0; i <= gridSize; i++) {
    // Horizontal lines
    const startX = centerX - size
    const endX = centerX + size
    const y = centerY - size + (i * cellSize)
    
    paths.push([
      { x: startX, y: y },
      { x: endX, y: y }
    ])
    
    // Vertical lines
    const x = centerX - size + (i * cellSize)
    const startY = centerY - size
    const endY = centerY + size
    
    paths.push([
      { x: x, y: startY },
      { x: x, y: endY }
    ])
  }
  
  // Add connecting patterns based on processed text
  for (let i = 0; i < Math.min(processed.length, gridSize * gridSize); i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    const charCode = processed.charCodeAt(i % processed.length)
    
    const cellCenterX = centerX - size + (col * cellSize) + (cellSize / 2)
    const cellCenterY = centerY - size + (row * cellSize) + (cellSize / 2)
    
    // Create pattern based on character
    const pattern = generateMagicSquareSymbol(charCode, cellCenterX, cellCenterY, cellSize * 0.3)
    paths.push(...pattern)
  }
  
  return paths
}

const generateSealOfSolomon = (centerX, centerY, radius, complexity) => {
  const paths = []
  
  // Double hexagram (Star of David)
  const hexagram1 = []
  const hexagram2 = []
  
  // First hexagram (pointing up)
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * Math.PI / 180
    hexagram1.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  hexagram1.push(hexagram1[0])
  paths.push(hexagram1)
  
  // Second hexagram (pointing down)
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 + 90) * Math.PI / 180
    hexagram2.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  hexagram2.push(hexagram2[0])
  paths.push(hexagram2)
  
  // Outer protective circle
  const outerCircle = []
  for (let i = 0; i <= 72; i++) {
    const angle = (i / 72) * Math.PI * 2
    outerCircle.push({
      x: centerX + Math.cos(angle) * radius * 1.3,
      y: centerY + Math.sin(angle) * radius * 1.3
    })
  }
  paths.push(outerCircle)
  
  // Inner sacred circle
  const innerCircle = []
  const innerRadius = radius * 0.4
  for (let i = 0; i <= 36; i++) {
    const angle = (i / 36) * Math.PI * 2
    innerCircle.push({
      x: centerX + Math.cos(angle) * innerRadius,
      y: centerY + Math.sin(angle) * innerRadius
    })
  }
  paths.push(innerCircle)
  
  // Add 72 names of God positions (simplified as geometric markers)
  const nameRadius = radius * 1.15
  for (let i = 0; i < Math.min(complexity * 6, 72); i++) {
    const angle = (i / 72) * Math.PI * 2
    const nameX = centerX + Math.cos(angle) * nameRadius
    const nameY = centerY + Math.sin(angle) * nameRadius
    
    const nameMarker = generateSacredNameMarker(nameX, nameY, 0.01)
    paths.push(...nameMarker)
  }
  
  return paths
}

const generateEnochianPatterns = (processed, centerX, centerY) => {
  const paths = []
  
  // Enochian tablet structure (simplified)
  const tabletPattern = generateEnochianTablet(centerX, centerY, 0.2)
  paths.push(...tabletPattern)
  
  // Angelic sigil patterns
  const angelicPattern = generateAngelicSigils(processed, centerX, centerY)
  paths.push(...angelicPattern)
  
  // Watchtower references
  const watchtowerPattern = generateWatchtowerSymbols(centerX, centerY, 0.35)
  paths.push(...watchtowerPattern)
  
  return paths
}

const generateEnochianTablet = (centerX, centerY, size) => {
  const paths = []
  const rows = 12
  const cols = 13
  const cellWidth = (size * 2) / cols
  const cellHeight = (size * 2) / rows
  
  // Create Enochian-style grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = centerX - size + (col * cellWidth)
      const y = centerY - size + (row * cellHeight)
      
      // Create cell boundary
      const cell = [
        { x: x, y: y },
        { x: x + cellWidth, y: y },
        { x: x + cellWidth, y: y + cellHeight },
        { x: x, y: y + cellHeight },
        { x: x, y: y }
      ]
      paths.push(cell)
      
      // Add Enochian-style symbols in key positions
      if ((row + col) % 3 === 0) {
        const symbolPaths = generateEnochianSymbol(
          x + cellWidth / 2,
          y + cellHeight / 2,
          Math.min(cellWidth, cellHeight) * 0.3
        )
        paths.push(...symbolPaths)
      }
    }
  }
  
  return paths
}

const generateEnochianSymbol = (centerX, centerY, size) => {
  const paths = []
  
  // Create geometric Enochian-inspired symbols
  const symbol = []
  const sides = 7 // Enochian heptagram
  
  for (let i = 0; i < sides; i++) {
    const angle = (i * (360 / sides)) * Math.PI / 180
    symbol.push({
      x: centerX + Math.cos(angle) * size,
      y: centerY + Math.sin(angle) * size
    })
  }
  
  // Connect every second point for heptagram
  const heptagram = []
  for (let i = 0; i < sides; i++) {
    heptagram.push(symbol[(i * 2) % sides])
  }
  heptagram.push(heptagram[0])
  paths.push(heptagram)
  
  return paths
}

const generateAngelicSigils = (processed, centerX, centerY) => {
  const paths = []
  
  // Create angelic name sigils based on processed text
  const angelicRadius = 0.15
  const angleStep = (Math.PI * 2) / processed.length
  
  let currentAngle = 0
  const sigilPath = []
  
  for (let i = 0; i < processed.length; i++) {
    const charCode = processed.charCodeAt(i)
    const radiusVariation = 1 + (charCode % 50) / 100 // Slight radius variation
    const radius = angelicRadius * radiusVariation
    
    sigilPath.push({
      x: centerX + Math.cos(currentAngle) * radius,
      y: centerY + Math.sin(currentAngle) * radius
    })
    
    currentAngle += angleStep + (charCode % 30) / 100 // Add variation based on character
  }
  
  if (sigilPath.length > 1) {
    paths.push(sigilPath)
  }
  
  return paths
}

const generateWatchtowerSymbols = (centerX, centerY, radius) => {
  const paths = []
  
  // Four watchtowers at cardinal directions
  const watchtowers = [
    { angle: 0, name: 'East' },
    { angle: Math.PI / 2, name: 'South' },
    { angle: Math.PI, name: 'West' },
    { angle: 3 * Math.PI / 2, name: 'North' }
  ]
  
  watchtowers.forEach(watchtower => {
    const watchtowerX = centerX + Math.cos(watchtower.angle) * radius
    const watchtowerY = centerY + Math.sin(watchtower.angle) * radius
    
    // Create watchtower symbol
    const symbol = generateWatchtowerSymbol(watchtowerX, watchtowerY, 0.04)
    paths.push(...symbol)
  })
  
  return paths
}

const generateWatchtowerSymbol = (centerX, centerY, size) => {
  const paths = []
  
  // Square base
  const square = [
    { x: centerX - size, y: centerY - size },
    { x: centerX + size, y: centerY - size },
    { x: centerX + size, y: centerY + size },
    { x: centerX - size, y: centerY + size },
    { x: centerX - size, y: centerY - size }
  ]
  paths.push(square)
  
  // Inner cross
  paths.push([
    { x: centerX, y: centerY - size },
    { x: centerX, y: centerY + size }
  ])
  paths.push([
    { x: centerX - size, y: centerY },
    { x: centerX + size, y: centerY }
  ])
  
  return paths
}

const generateGoeticCircles = (processed, centerX, centerY, wordCount) => {
  const paths = []
  
  // Main Goetic circle
  const mainCircle = []
  const radius = 0.3
  
  for (let i = 0; i <= 72; i++) {
    const angle = (i / 72) * Math.PI * 2
    mainCircle.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  paths.push(mainCircle)
  
  // Inner triangle for demon binding
  const triangle = []
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * Math.PI / 180
    triangle.push({
      x: centerX + Math.cos(angle) * radius * 0.5,
      y: centerY + Math.sin(angle) * radius * 0.5
    })
  }
  triangle.push(triangle[0])
  paths.push(triangle)
  
  // Divine names around circle (geometric representations)
  const namePositions = 4
  for (let i = 0; i < namePositions; i++) {
    const angle = (i / namePositions) * Math.PI * 2
    const nameX = centerX + Math.cos(angle) * radius * 1.2
    const nameY = centerY + Math.sin(angle) * radius * 1.2
    
    const divineSymbol = generateDivineNameSymbol(nameX, nameY, 0.03)
    paths.push(...divineSymbol)
  }
  
  // Goetic seals based on processed text
  const sealCount = Math.min(processed.length, 72) // Max 72 Goetic demons
  for (let i = 0; i < Math.min(sealCount, 12); i++) {
    const angle = (i / 12) * Math.PI * 2
    const sealX = centerX + Math.cos(angle) * radius * 0.8
    const sealY = centerY + Math.sin(angle) * radius * 0.8
    
    const sealPattern = generateGoeticSeal(processed.charCodeAt(i % processed.length), sealX, sealY, 0.02)
    paths.push(...sealPattern)
  }
  
  return paths
}

const generateGoeticSeal = (charCode, centerX, centerY, size) => {
  const paths = []
  const sealType = charCode % 8 // 8 different seal patterns
  
  switch (sealType) {
    case 0: // Circular seal with inner pattern
      const circle = []
      for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        circle.push({
          x: centerX + Math.cos(angle) * size,
          y: centerY + Math.sin(angle) * size
        })
      }
      paths.push(circle)
      
      // Inner cross
      paths.push([
        { x: centerX, y: centerY - size * 0.7 },
        { x: centerX, y: centerY + size * 0.7 }
      ])
      paths.push([
        { x: centerX - size * 0.7, y: centerY },
        { x: centerX + size * 0.7, y: centerY }
      ])
      break
      
    case 1: // Diamond with internal geometry
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX + size, y: centerY },
        { x: centerX, y: centerY + size },
        { x: centerX - size, y: centerY },
        { x: centerX, y: centerY - size }
      ])
      
      // Internal triangle
      paths.push([
        { x: centerX, y: centerY - size * 0.5 },
        { x: centerX + size * 0.4, y: centerY + size * 0.3 },
        { x: centerX - size * 0.4, y: centerY + size * 0.3 },
        { x: centerX, y: centerY - size * 0.5 }
      ])
      break
      
    case 2: // Hexagonal seal
      const hexagon = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180
        hexagon.push({
          x: centerX + Math.cos(angle) * size,
          y: centerY + Math.sin(angle) * size
        })
      }
      hexagon.push(hexagon[0])
      paths.push(hexagon)
      
      // Inner lines
      for (let i = 0; i < 6; i += 2) {
        const angle1 = (i * 60) * Math.PI / 180
        const angle2 = ((i + 3) * 60) * Math.PI / 180
        paths.push([
          { x: centerX + Math.cos(angle1) * size, y: centerY + Math.sin(angle1) * size },
          { x: centerX + Math.cos(angle2) * size, y: centerY + Math.sin(angle2) * size }
        ])
      }
      break
      
    default:
      // Complex sigil pattern
      const complexity = 3 + (charCode % 4)
      const sigilPath = []
      for (let i = 0; i < complexity * 2; i++) {
        const angle = (i / (complexity * 2)) * Math.PI * 4 // Double rotation
        const radius = size * (0.3 + 0.7 * (i % 2))
        sigilPath.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        })
      }
      if (sigilPath.length > 1) paths.push(sigilPath)
  }
  
  return paths
}

const generateHermeticSeals = (processed, centerX, centerY) => {
  const paths = []
  
  // Hermetic circle with alchemical symbols
  const hermeticCircle = []
  const radius = 0.25
  
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2
    hermeticCircle.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  paths.push(hermeticCircle)
  
  // Seven planetary seals around the circle
  const planets = ['Sol', 'Luna', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
  planets.forEach((planet, index) => {
    const angle = (index / planets.length) * Math.PI * 2
    const planetX = centerX + Math.cos(angle) * radius * 1.3
    const planetY = centerY + Math.sin(angle) * radius * 1.3
    
    const planetarySymbol = generatePlanetarySymbol(index, planetX, planetY, 0.03)
    paths.push(...planetarySymbol)
  })
  
  // Central Hermetic seal
  const centralSeal = generateHermeticCentralSeal(centerX, centerY, 0.1)
  paths.push(...centralSeal)
  
  // Four elements at cardinal points
  const elements = ['Fire', 'Water', 'Air', 'Earth']
  elements.forEach((element, index) => {
    const angle = (index * 90) * Math.PI / 180
    const elementX = centerX + Math.cos(angle) * radius * 0.7
    const elementY = centerY + Math.sin(angle) * radius * 0.7
    
    const elementSymbol = generateElementalSymbol(element.toLowerCase(), elementX, elementY, 0.025)
    paths.push(...elementSymbol)
  })
  
  return paths
}

const generateHermeticCentralSeal = (centerX, centerY, size) => {
  const paths = []
  
  // Hermetic hexagram (union of opposites)
  const upTriangle = []
  const downTriangle = []
  
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * Math.PI / 180
    upTriangle.push({
      x: centerX + Math.cos(angle) * size,
      y: centerY + Math.sin(angle) * size
    })
    
    const downAngle = (i * 120 + 90) * Math.PI / 180
    downTriangle.push({
      x: centerX + Math.cos(downAngle) * size,
      y: centerY + Math.sin(downAngle) * size
    })
  }
  
  upTriangle.push(upTriangle[0])
  downTriangle.push(downTriangle[0])
  
  paths.push(upTriangle, downTriangle)
  
  // Central point
  const centerDot = []
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    centerDot.push({
      x: centerX + Math.cos(angle) * size * 0.1,
      y: centerY + Math.sin(angle) * size * 0.1
    })
  }
  paths.push(centerDot)
  
  return paths
}

const generatePlanetarySeals = (processed, centerX, centerY) => {
  const paths = []
  
  // Generate seals for the seven classical planets based on processed text
  const planetaryRadius = 0.2
  const planets = [
    { name: 'Sun', number: 6, magic_constant: 111 },
    { name: 'Moon', number: 9, magic_constant: 369 },
    { name: 'Mars', number: 5, magic_constant: 65 },
    { name: 'Mercury', number: 8, magic_constant: 260 },
    { name: 'Jupiter', number: 4, magic_constant: 34 },
    { name: 'Venus', number: 7, magic_constant: 175 },
    { name: 'Saturn', number: 3, magic_constant: 15 }
  ]
  
  // Select planet based on processed text length
  const selectedPlanet = planets[processed.length % planets.length]
  
  // Generate planetary square pattern
  const squarePattern = generatePlanetarySquarePattern(
    selectedPlanet, 
    centerX, 
    centerY, 
    planetaryRadius
  )
  paths.push(...squarePattern)
  
  // Generate connecting sigil based on processed text
  const planetarySigil = generatePlanetaryTextSigil(
    processed, 
    selectedPlanet, 
    centerX, 
    centerY, 
    planetaryRadius * 0.8
  )
  paths.push(...planetarySigil)
  
  return paths
}

const generatePlanetarySquarePattern = (planet, centerX, centerY, size) => {
  const paths = []
  const gridSize = planet.number
  const cellSize = (size * 2) / gridSize
  
  // Create planetary square grid
  for (let i = 0; i <= gridSize; i++) {
    // Horizontal lines
    paths.push([
      { x: centerX - size, y: centerY - size + (i * cellSize) },
      { x: centerX + size, y: centerY - size + (i * cellSize) }
    ])
    
    // Vertical lines
    paths.push([
      { x: centerX - size + (i * cellSize), y: centerY - size },
      { x: centerX - size + (i * cellSize), y: centerY + size }
    ])
  }
  
  // Add planetary symbol in center
  const planetSymbol = generatePlanetarySymbol(
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].indexOf(planet.name),
    centerX,
    centerY,
    size * 0.3
  )
  paths.push(...planetSymbol)
  
  return paths
}

const generatePlanetaryTextSigil = (processed, planet, centerX, centerY, radius) => {
  const paths = []
  
  // Create sigil path through planetary square based on processed text
  const gridSize = planet.number
  const cellSize = (radius * 2) / gridSize
  
  const sigilPath = []
  let currentX = centerX - radius + cellSize / 2 // Start in first cell
  let currentY = centerY - radius + cellSize / 2
  
  sigilPath.push({ x: currentX, y: currentY })
  
  for (let i = 0; i < processed.length; i++) {
    const charCode = processed.charCodeAt(i)
    const cellNumber = (charCode % (gridSize * gridSize)) + 1
    
    // Convert cell number to grid position
    const row = Math.floor((cellNumber - 1) / gridSize)
    const col = (cellNumber - 1) % gridSize
    
    const targetX = centerX - radius + (col * cellSize) + (cellSize / 2)
    const targetY = centerY - radius + (row * cellSize) + (cellSize / 2)
    
    sigilPath.push({ x: targetX, y: targetY })
    currentX = targetX
    currentY = targetY
  }
  
  if (sigilPath.length > 1) {
    paths.push(sigilPath)
  }
  
  return paths
}

const generatePlanetarySymbol = (planetIndex, centerX, centerY, size) => {
  const paths = []
  
  switch (planetIndex) {
    case 0: // Sun - Circle with center dot
      const sunCircle = []
      for (let i = 0; i <= 24; i++) {
        const angle = (i / 24) * Math.PI * 2
        sunCircle.push({
          x: centerX + Math.cos(angle) * size,
          y: centerY + Math.sin(angle) * size
        })
      }
      paths.push(sunCircle)
      
      const sunDot = []
      for (let i = 0; i <= 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        sunDot.push({
          x: centerX + Math.cos(angle) * size * 0.2,
          y: centerY + Math.sin(angle) * size * 0.2
        })
      }
      paths.push(sunDot)
      break
      
    case 1: // Moon - Crescent
      const moonArc1 = []
      for (let i = -60; i <= 60; i += 5) {
        const angle = i * Math.PI / 180
        moonArc1.push({
          x: centerX + Math.cos(angle) * size,
          y: centerY + Math.sin(angle) * size
        })
      }
      paths.push(moonArc1)
      
      const moonArc2 = []
      for (let i = -45; i <= 45; i += 5) {
        const angle = i * Math.PI / 180
        moonArc2.push({
          x: centerX + 0.3 * size + Math.cos(angle + Math.PI) * size * 0.8,
          y: centerY + Math.sin(angle + Math.PI) * size * 0.8
        })
      }
      paths.push(moonArc2)
      break
      
    case 2: // Mars - Circle with arrow
      const marsCircle = []
      for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        marsCircle.push({
          x: centerX + Math.cos(angle) * size * 0.7,
          y: centerY + Math.sin(angle) * size * 0.7
        })
      }
      paths.push(marsCircle)
      
      // Arrow
      paths.push([
        { x: centerX + size * 0.5, y: centerY - size * 0.5 },
        { x: centerX + size, y: centerY - size }
      ])
      paths.push([
        { x: centerX + size, y: centerY - size },
        { x: centerX + size * 0.8, y: centerY - size }
      ])
      paths.push([
        { x: centerX + size, y: centerY - size },
        { x: centerX + size, y: centerY - size * 0.8 }
      ])
      break
      
    case 3: // Mercury - Circle with cross and crescent
      const mercuryCircle = []
      for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        mercuryCircle.push({
          x: centerX + Math.cos(angle) * size * 0.5,
          y: centerY + Math.sin(angle) * size * 0.5
        })
      }
      paths.push(mercuryCircle)
      
      // Cross below
      paths.push([
        { x: centerX, y: centerY + size * 0.5 },
        { x: centerX, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size * 0.3, y: centerY + size * 0.75 },
        { x: centerX + size * 0.3, y: centerY + size * 0.75 }
      ])
      
      // Crescent above
      const mercuryCrescent = []
      for (let i = -60; i <= 60; i += 10) {
        const angle = (i + 180) * Math.PI / 180
        mercuryCrescent.push({
          x: centerX + Math.cos(angle) * size * 0.3,
          y: centerY - size * 0.5 + Math.sin(angle) * size * 0.3
        })
      }
      paths.push(mercuryCrescent)
      break
      
    case 4: // Jupiter - Curved line with cross
      paths.push([
        { x: centerX - size * 0.5, y: centerY - size },
        { x: centerX - size * 0.5, y: centerY + size * 0.3 }
      ])
      paths.push([
        { x: centerX - size * 0.8, y: centerY },
        { x: centerX - size * 0.2, y: centerY }
      ])
      
      const jupiterCurve = []
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const x = centerX - size * 0.5 + t * size * 0.8
        const y = centerY + size * 0.3 - Math.pow(t, 2) * size * 1.3
        jupiterCurve.push({ x, y })
      }
      paths.push(jupiterCurve)
      break
      
    case 5: // Venus - Circle with cross below
      const venusCircle = []
      for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        venusCircle.push({
          x: centerX + Math.cos(angle) * size * 0.6,
          y: centerY - size * 0.2 + Math.sin(angle) * size * 0.6
        })
      }
      paths.push(venusCircle)
      
      // Cross below
      paths.push([
        { x: centerX, y: centerY + size * 0.4 },
        { x: centerX, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size * 0.4, y: centerY + size * 0.7 },
        { x: centerX + size * 0.4, y: centerY + size * 0.7 }
      ])
      break
      
    case 6: // Saturn - Cross with curve
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX, y: centerY + size * 0.2 }
      ])
      paths.push([
        { x: centerX - size * 0.4, y: centerY - size * 0.4 },
        { x: centerX + size * 0.4, y: centerY - size * 0.4 }
      ])
      
      const saturnCurve = []
      for (let i = 0; i <= 15; i++) {
        const t = (i / 15) * Math.PI
        const x = centerX - size * 0.6 + Math.cos(t) * size * 0.6
        const y = centerY + size * 0.2 + Math.sin(t) * size * 0.3
        saturnCurve.push({ x, y })
      }
      paths.push(saturnCurve)
      break
  }
  
  return paths
}

const generateDivineNameSymbol = (centerX, centerY, size) => {
  const paths = []
  
  // Create geometric representation of divine names
  const symbol = []
  const sides = 12 // 12-pointed star for divine representation
  
  for (let i = 0; i < sides; i++) {
    const angle = (i * 30) * Math.PI / 180
    const radius = i % 2 === 0 ? size : size * 0.5
    symbol.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  symbol.push(symbol[0])
  paths.push(symbol)
  
  return paths
}

const generateHebrewLetterGeometry = (letterIndex, centerX, centerY, size) => {
  const paths = []
  
  // Simplified geometric representations of Hebrew letters
  switch (letterIndex % 3) {
    case 0: // Aleph-like pattern
      paths.push([
        { x: centerX - size, y: centerY + size },
        { x: centerX, y: centerY - size }
      ])
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX + size, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size * 0.5, y: centerY },
        { x: centerX + size * 0.5, y: centerY }
      ])
      break
      
    case 1: // Bet-like pattern
      paths.push([
        { x: centerX - size, y: centerY - size },
        { x: centerX - size, y: centerY + size },
        { x: centerX + size, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size, y: centerY },
        { x: centerX + size * 0.5, y: centerY }
      ])
      break
      
    case 2: // Gimel-like pattern
      paths.push([
        { x: centerX - size, y: centerY - size },
        { x: centerX + size, y: centerY - size },
        { x: centerX, y: centerY },
        { x: centerX + size, y: centerY + size }
      ])
      break
  }
  
  return paths
}

const generateMagicSquareSymbol = (charCode, centerX, centerY, size) => {
  const paths = []
  const pattern = charCode % 6
  
  switch (pattern) {
    case 0: // Cross
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX, y: centerY + size }
      ])
      paths.push([
        { x: centerX - size, y: centerY },
        { x: centerX + size, y: centerY }
      ])
      break
      
    case 1: // Circle
      const circle = []
      for (let i = 0; i <= 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        circle.push({
          x: centerX + Math.cos(angle) * size,
          y: centerY + Math.sin(angle) * size
        })
      }
      paths.push(circle)
      break
      
    case 2: // Triangle
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX - size, y: centerY + size },
        { x: centerX + size, y: centerY + size },
        { x: centerX, y: centerY - size }
      ])
      break
      
    case 3: // Square
      paths.push([
        { x: centerX - size, y: centerY - size },
        { x: centerX + size, y: centerY - size },
        { x: centerX + size, y: centerY + size },
        { x: centerX - size, y: centerY + size },
        { x: centerX - size, y: centerY - size }
      ])
      break
      
    case 4: // Diamond
      paths.push([
        { x: centerX, y: centerY - size },
        { x: centerX + size, y: centerY },
        { x: centerX, y: centerY + size },
        { x: centerX - size, y: centerY },
        { x: centerX, y: centerY - size }
      ])
      break
      
    case 5: // Star
      const star = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 144 - 90) * Math.PI / 180
        star.push({
          x: centerX + Math.cos(angle) * size,
          y: centerY + Math.sin(angle) * size
        })
      }
      const starPath = [star[0], star[2], star[4], star[1], star[3], star[0]]
      paths.push(starPath)
      break
  }
  
  return paths
}

const generateSacredNameMarker = (centerX, centerY, size) => {
  const paths = []
  
  // Simple sacred geometry marker
  const outerCircle = []
  const innerCircle = []
  
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    outerCircle.push({
      x: centerX + Math.cos(angle) * size,
      y: centerY + Math.sin(angle) * size
    })
    
    innerCircle.push({
      x: centerX + Math.cos(angle) * size * 0.5,
      y: centerY + Math.sin(angle) * size * 0.5
    })
  }
  
  paths.push(outerCircle, innerCircle)
  
  return paths
}