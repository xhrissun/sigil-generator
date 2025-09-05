// Professional Tarot Card Generation Utilities
// Integrated with Historical Variants and Sigil Magic

// Complete Major Arcana definitions with historical significance
const MAJOR_ARCANA_DETAILS = [
  { 
    number: 14, name: "Temperance", element: "sagittarius",
    imagery: "An angel pouring water between cups, sun and path in background.",
    colors: { primary: "#87CEEB", secondary: "#FFD700", accent: "#FFFFFF" },
    symbols: ["cups", "angel", "sun", "path"],
    keywords: "balance, moderation, patience, purpose",
    symbolism: "Divine alchemy, moderation, angelic guidance"
  },
  { 
    number: 15, name: "The Devil", element: "capricorn",
    imagery: "A horned figure with chained figures, pentagram above.",
    colors: { primary: "#8B0000", secondary: "#000000", accent: "#FFD700" },
    symbols: ["pentagram", "chains", "torch", "horns"],
    keywords: "bondage, addiction, sexuality, materialism",
    symbolism: "Material bondage, shadow self, illusion of limitation"
  },
  { 
    number: 16, name: "The Tower", element: "mars",
    imagery: "A tower struck by lightning, figures falling, flames around.",
    colors: { primary: "#FF4500", secondary: "#000000", accent: "#FFD700" },
    symbols: ["lightning", "tower", "flames", "crown"],
    keywords: "sudden change, upheaval, chaos, revelation",
    symbolism: "Divine lightning, false structures falling, revelation"
  },
  { 
    number: 17, name: "The Star", element: "aquarius",
    imagery: "A woman pouring water under stars, a large star above.",
    colors: { primary: "#87CEEB", secondary: "#FFD700", accent: "#FFFFFF" },
    symbols: ["stars", "water", "woman", "bird"],
    keywords: "hope, faith, purpose, renewal, spirituality",
    symbolism: "Divine hope, cosmic guidance, spiritual renewal"
  },
  { 
    number: 18, name: "The Moon", element: "pisces",
    imagery: "A moon with dogs howling, a path between towers.",
    colors: { primary: "#C0C0C0", secondary: "#4682B4", accent: "#FFD700" },
    symbols: ["moon", "dogs", "towers", "path"],
    keywords: "illusion, fear, anxiety, subconscious, intuition",
    symbolism: "Lunar mysteries, unconscious fears, psychic realm"
  },
  { 
    number: 19, name: "The Sun", element: "sun",
    imagery: "A child on a horse under a bright sun, sunflowers around.",
    colors: { primary: "#FFD700", secondary: "#FF4500", accent: "#FFFFFF" },
    symbols: ["sun", "child", "horse", "sunflowers"],
    keywords: "positivity, fun, warmth, success, vitality",
    symbolism: "Solar consciousness, divine joy, enlightenment"
  },
  { 
    number: 20, name: "Judgement", element: "fire",
    imagery: "An angel blowing a trumpet, figures rising from graves.",
    colors: { primary: "#FFD700", secondary: "#FFFFFF", accent: "#FF4500" },
    symbols: ["trumpet", "angel", "graves", "cross"],
    keywords: "judgement, rebirth, inner calling, absolution",
    symbolism: "Final judgment, spiritual awakening, resurrection"
  },
  { 
    number: 21, name: "The World", element: "saturn",
    imagery: "A dancing figure in a wreath, four creatures in corners.",
    colors: { primary: "#800080", secondary: "#FFD700", accent: "#FFFFFF" },
    symbols: ["wreath", "creatures", "wand", "laurel"],
    keywords: "completion, accomplishment, travel, fulfillment",
    symbolism: "Cosmic completion, unity, the great work finished"
  },
];

// Complete Minor Arcana suit definitions
const MINOR_SUITS_DETAILS = {
  wands: { 
    element: 'fire', 
    imagery: "Fiery landscapes with budding wands, salamanders, and golden skies.",
    colors: { primary: "#FF4500", secondary: "#FFD700", accent: "#FFFFFF" }, 
    symbols: ["wand", "flame", "salamander", "sun"],
    keywords: "creativity, spirituality, determination, ambition, passion",
    symbolism: "Divine will, creative force, spiritual energy"
  },
  cups: { 
    element: 'water', 
    imagery: "Serene waters with overflowing cups, fish, and moonlit scenes.",
    colors: { primary: "#4682B4", secondary: "#87CEEB", accent: "#FFFFFF" }, 
    symbols: ["cup", "fish", "water", "moon"],
    keywords: "emotion, intuition, relationships, spirituality, love",
    symbolism: "Emotional realm, intuition, the heart's wisdom"
  },
  swords: { 
    element: 'air', 
    imagery: "Stormy skies with crossed swords, clouds, and birds in flight.",
    colors: { primary: "#4682B4", secondary: "#C0C0C0", accent: "#FFD700" }, 
    symbols: ["sword", "cloud", "bird", "wind"],
    keywords: "thought, communication, conflict, intellect, truth",
    symbolism: "Mental realm, communication, the sword of truth"
  },
  pentacles: { 
    element: 'earth', 
    imagery: "Lush gardens with pentacle coins, vines, and mountains.",
    colors: { primary: "#228B22", secondary: "#FFD700", accent: "#FFFFFF" }, 
    symbols: ["pentacle", "vine", "mountain", "tree"],
    keywords: "material world, career, money, achievement, manifestation",
    symbolism: "Material realm, earthly manifestation, practical wisdom"
  },
};

// Historical tarot variant styles
const TAROT_VARIANTS = {
  'rider-waite': {
    name: 'Rider-Waite-Smith',
    year: 1909,
    style: 'symbolic-pictorial',
    colorPalette: ['#8B4513', '#DAA520', '#4682B4', '#228B22'],
    characteristics: ['detailed symbolism', 'intuitive imagery', 'occult traditions']
  },
  'marseilles': {
    name: 'Tarot de Marseille',
    year: 1650,
    style: 'medieval-geometric',
    colorPalette: ['#DC143C', '#FFD700', '#4169E1', '#228B22'],
    characteristics: ['geometric patterns', 'heraldic symbols', 'traditional colors']
  },
  'thoth': {
    name: 'Thoth Tarot',
    year: 1944,
    style: 'occult-artistic',
    colorPalette: ['#8A2BE2', '#FF6347', '#40E0D0', '#32CD32'],
    characteristics: ['complex symbolism', 'astrological correspondences', 'artistic innovation']
  },
  'visconti': {
    name: 'Visconti-Sforza',
    year: 1450,
    style: 'renaissance-court',
    colorPalette: ['#B8860B', '#CD853F', '#4682B4', '#800080'],
    characteristics: ['courtly imagery', 'gold leaf details', 'renaissance art']
  }
};

// Sigil generation utilities
export const processIntention = (intention) => {
  if (!intention || typeof intention !== 'string') {
    return { 
      processedText: '', 
      initials: '', 
      letterCount: 0,
      vowelCount: 0,
      consonantCount: 0 
    };
  }

  const cleanText = intention.trim().toLowerCase();
  const processedText = cleanText.replace(/[aeiou\s]/g, ''); // Remove vowels and spaces
  const initials = cleanText.split(' ')
    .map(word => word.charAt(0))
    .filter(char => /[a-z]/.test(char))
    .join('');

  return {
    processedText,
    initials,
    letterCount: cleanText.replace(/\s/g, '').length,
    vowelCount: (cleanText.match(/[aeiou]/g) || []).length,
    consonantCount: processedText.length,
    originalIntention: intention.trim()
  };
};

export const generateClientSideSigil = (intention, category = 'general', complexity = 'high') => {
  try {
    if (!intention || typeof intention !== 'string') {
      throw new Error('Invalid intention provided');
    }

    const processed = processIntention(intention);
    const paths = [];
    
    if (processed.processedText.length === 0) {
      // Fallback for vowel-only intentions
      return generateFallbackSigil(processed.initials || intention.charAt(0));
    }

    // Generate primary sigil path
    const primaryPath = generatePrimarySigilPath(processed, category);
    if (primaryPath.length > 1) {
      paths.push(primaryPath);
    }

    // Add complexity layers based on category and complexity level
    if (complexity === 'high' && processed.initials.length > 1) {
      const secondaryPath = generateSecondarySigilPath(processed, category);
      if (secondaryPath.length > 1) {
        paths.push(secondaryPath);
      }
    }

    // Add category-specific enhancements
    const categoryPaths = generateCategorySpecificPaths(processed, category);
    paths.push(...categoryPaths);

    return {
      paths,
      metadata: {
        category,
        complexity,
        pathCount: paths.length,
        processed,
        generated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error generating sigil:', error);
    return generateFallbackSigil(intention.charAt(0) || 'A');
  }
};

const generatePrimarySigilPath = (processed, category) => {
  const path = [];
  const centerX = 0.5, centerY = 0.5;
  const baseRadius = 0.2;

  // Create path based on processed consonants
  for (let i = 0; i < processed.processedText.length; i++) {
    const char = processed.processedText.charCodeAt(i);
    const normalizedChar = (char - 97) / 25; // Normalize to 0-1
    
    // Calculate angle and radius with category influence
    let angle = normalizedChar * 2 * Math.PI;
    let radius = baseRadius + (i / processed.processedText.length) * 0.15;

    // Category-specific modifications
    switch (category) {
      case 'love':
        angle += Math.sin(i * 0.5) * 0.3; // Heart-like curves
        radius *= (1 + Math.cos(angle * 2) * 0.2);
        break;
      case 'prosperity':
        angle += i * (Math.PI / 8); // Fibonacci-inspired spiral
        radius *= (1 + i * 0.05);
        break;
      case 'protection':
        angle = (i / processed.processedText.length) * 2 * Math.PI; // Circular protection
        radius = baseRadius + Math.sin(angle * 3) * 0.1;
        break;
      case 'wisdom':
        angle += Math.log(i + 1) * 0.5; // Logarithmic growth
        radius += Math.cos(angle) * 0.05;
        break;
      default:
        // General sacred geometry
        angle += (char % 7) * Math.PI / 7;
    }

    path.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }

  return path;
};

const generateSecondarySigilPath = (processed, category) => {
  const path = [];
  const centerX = 0.5, centerY = 0.5;
  const radius = 0.12;

  // Generate path from initials
  for (let i = 0; i < processed.initials.length; i++) {
    const char = processed.initials.charCodeAt(i);
    const angle = ((char - 97) / 25) * 2 * Math.PI + Math.PI; // Offset by π
    
    path.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }

  return path;
};

const generateCategorySpecificPaths = (processed, category) => {
  const paths = [];
  const centerX = 0.5, centerY = 0.5;

  switch (category) {
    case 'love':
      // Heart symbol integration
      const heartPath = generateHeartPath(centerX, centerY, 0.08);
      paths.push(heartPath);
      break;
      
    case 'prosperity':
      // Abundance spiral
      const spiralPath = generateFibonacciSpiral(centerX, centerY, 0.15);
      paths.push(spiralPath);
      break;
      
    case 'protection':
      // Protective circle
      const circlePath = generateProtectiveCircle(centerX, centerY, 0.25);
      paths.push(circlePath);
      break;
      
    case 'wisdom':
      // Tree of Life inspired pattern
      const treePath = generateTreePattern(centerX, centerY, 0.18);
      paths.push(treePath);
      break;
      
    default:
      // Sacred geometry - Flower of Life fragment
      const geometryPath = generateSacredGeometry(centerX, centerY, 0.1);
      paths.push(geometryPath);
  }

  return paths;
};

const generateHeartPath = (centerX, centerY, size) => {
  const path = [];
  for (let t = 0; t <= 2 * Math.PI; t += 0.1) {
    const x = centerX + size * (16 * Math.pow(Math.sin(t), 3)) / 16;
    const y = centerY - size * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
    path.push({ x, y });
  }
  return path;
};

const generateFibonacciSpiral = (centerX, centerY, maxRadius) => {
  const path = [];
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  
  for (let i = 0; i < 50; i++) {
    const angle = i * 0.2;
    const radius = (maxRadius / 50) * i * Math.pow(phi, -i/10);
    path.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }
  return path;
};

const generateProtectiveCircle = (centerX, centerY, radius) => {
  const path = [];
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * 2 * Math.PI;
    path.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }
  return path;
};

const generateTreePattern = (centerX, centerY, size) => {
  const path = [];
  // Trunk
  path.push({ x: centerX, y: centerY + size });
  path.push({ x: centerX, y: centerY - size });
  
  // Branches
  const branchAngles = [Math.PI/4, 3*Math.PI/4, -Math.PI/4, -3*Math.PI/4];
  branchAngles.forEach(angle => {
    path.push({ x: centerX, y: centerY });
    path.push({
      x: centerX + Math.cos(angle) * size * 0.7,
      y: centerY + Math.sin(angle) * size * 0.7
    });
  });
  
  return path;
};

const generateSacredGeometry = (centerX, centerY, radius) => {
  const path = [];
  // Hexagon (base of Flower of Life)
  for (let i = 0; i <= 6; i++) {
    const angle = (i / 6) * 2 * Math.PI;
    path.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }
  return path;
};

const generateFallbackSigil = (char) => {
  const centerX = 0.5, centerY = 0.5;
  const charCode = char.charCodeAt(0);
  const angle = ((charCode % 26) / 26) * 2 * Math.PI;
  
  return {
    paths: [[
      { x: centerX, y: centerY },
      { x: centerX + Math.cos(angle) * 0.2, y: centerY + Math.sin(angle) * 0.2 }
    ]],
    metadata: {
      fallback: true,
      char,
      generated: new Date().toISOString()
    }
  };
};

// Card generation utilities
export const generateCardDesign = (card, intention, sigilResult, variant = 'rider-waite') => {
  const centerX = 0.5, centerY = 0.5;
  const variantStyle = TAROT_VARIANTS[variant] || TAROT_VARIANTS['rider-waite'];

  const design = {
    centerSigil: sigilResult ? sigilResult.paths : generateCenterSigil(intention, card, centerX, centerY),
    corners: generateCornerElements(card, centerX, centerY, variantStyle),
    border: generateBorderPattern(card, centerX, centerY, variantStyle),
    symbols: generateSymbolicElements(card, centerX, centerY, variantStyle),
    colors: getCardColors(card, variantStyle),
    background: generateBackground(card, centerX, centerY, variantStyle),
    imagery: getCardImagery(card),
    variant: variant,
    style: variantStyle.style
  };

  return design;
};

const generateCenterSigil = (intention, card, centerX, centerY) => {
  if (!intention) {
    return generateDefaultSymbol(card, centerX, centerY);
  }

  const processed = processIntention(intention);
  const paths = [];
  const radius = 0.25;

  if (card.type === 'major') {
    const cardDetails = MAJOR_ARCANA_DETAILS[card.number];
    if (cardDetails) {
      const mainSymbol = cardDetails.symbols[0];
      paths.push(...generateSymbolPath(mainSymbol, centerX, centerY, radius));
    }
  } else {
    const suitDetails = MINOR_SUITS_DETAILS[card.suit];
    if (suitDetails) {
      const mainSymbol = suitDetails.symbols[0];
      const count = card.number === 'Ace' ? 1 : 
        (isNaN(parseInt(card.number)) ? 2 : Math.min(parseInt(card.number), 10));
      
      for (let i = 0; i < count; i++) {
        const offsetY = centerY + (i - (count - 1) / 2) * 0.08;
        paths.push(...generateSymbolPath(mainSymbol, centerX, offsetY, radius * 0.4));
      }
    }
  }

  // Integrate intention-based elements
  if (processed.processedText.length > 0) {
    const intentionPath = [];
    for (let i = 0; i < processed.processedText.length; i++) {
      const charCode = processed.processedText.charCodeAt(i);
      const angle = (charCode / 127) * 2 * Math.PI;
      const r = 0.15 + (charCode % 30) / 300;
      intentionPath.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
      });
    }
    if (intentionPath.length > 1) paths.push(intentionPath);
  }

  return { paths };
};

const generateDefaultSymbol = (card, centerX, centerY) => {
  const paths = [];
  const radius = 0.2;

  if (card.type === 'major') {
    // Star symbol for major arcana
    const starPath = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : radius * 0.5;
      starPath.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      });
    }
    paths.push(starPath);
  } else {
    // Suit symbol for minor arcana
    const symbol = MINOR_SUITS_DETAILS[card.suit]?.symbols[0] || 'pentacle';
    paths.push(...generateSymbolPath(symbol, centerX, centerY, radius));
  }

  return { paths };
};

const generateSymbolPath = (symbol, centerX, centerY, radius) => {
  const paths = [];
  
  switch (symbol) {
    case 'sun':
      const sunPath = [];
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const r = i % 2 === 0 ? radius : radius * 0.6;
        sunPath.push({ x: centerX + Math.cos(angle) * r, y: centerY + Math.sin(angle) * r });
      }
      paths.push(sunPath);
      break;
      
    case 'moon':
      const moonPath = [];
      for (let i = 0; i <= 20; i++) {
        const angle = (i / 20) * Math.PI;
        moonPath.push({ 
          x: centerX + Math.cos(angle) * radius, 
          y: centerY + Math.sin(angle) * radius * 0.8 
        });
      }
      paths.push(moonPath);
      break;
      
    case 'wand':
      paths.push([
        { x: centerX, y: centerY - radius },
        { x: centerX, y: centerY + radius },
      ]);
      paths.push([
        { x: centerX - radius * 0.2, y: centerY - radius * 0.7 },
        { x: centerX + radius * 0.2, y: centerY - radius * 0.7 },
      ]);
      break;
      
    case 'cup':
      const cupPath = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const x = centerX + (t - 0.5) * radius * 1.2;
        const y = centerY + Math.sin(t * Math.PI) * radius * 0.3 - t * radius * 0.8;
        cupPath.push({ x, y });
      }
      paths.push(cupPath);
      break;
      
    case 'sword':
      paths.push([
        { x: centerX, y: centerY - radius },
        { x: centerX, y: centerY + radius },
      ]);
      paths.push([
        { x: centerX - radius * 0.3, y: centerY + radius * 0.6 },
        { x: centerX + radius * 0.3, y: centerY + radius * 0.6 },
      ]);
      break;
      
    case 'pentacle':
      const pentaclePath = [];
      for (let i = 0; i <= 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        pentaclePath.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
      paths.push(pentaclePath);
      // Add circle around pentacle
      const circlePath = [];
      for (let i = 0; i <= 24; i++) {
        const angle = (i / 24) * 2 * Math.PI;
        circlePath.push({
          x: centerX + Math.cos(angle) * radius * 1.1,
          y: centerY + Math.sin(angle) * radius * 1.1,
        });
      }
      paths.push(circlePath);
      break;
      
    default:
      // Default geometric pattern
      const defaultPath = [];
      for (let i = 0; i <= 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        defaultPath.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
      paths.push(defaultPath);
      break;
  }
  
  return paths;
};

const generateCornerElements = (card, centerX, centerY, variantStyle) => {
  const corners = [];
  const cornerSize = 0.04;
  const positions = [
    { x: 0.08, y: 0.08 },
    { x: 0.92, y: 0.08 },
    { x: 0.92, y: 0.92 },
    { x: 0.08, y: 0.92 },
  ];

  const symbols = card.type === 'major' 
    ? (MAJOR_ARCANA_DETAILS[card.number]?.symbols || ['star'])
    : (MINOR_SUITS_DETAILS[card.suit]?.symbols || ['pentacle']);

  positions.forEach((pos, index) => {
    const symbol = symbols[index % symbols.length];
    const cornerPaths = generateSymbolPath(symbol, pos.x, pos.y, cornerSize);
    corners.push({ paths: cornerPaths, position: pos });
  });

  return corners;
};

const generateBorderPattern = (card, centerX, centerY, variantStyle) => {
  const pattern = [];
  const segments = card.type === 'major' ? 16 : 12;
  const outerRadius = 0.47;
  const innerRadius = 0.43;

  // Outer decorative border
  for (let i = 0; i < segments; i++) {
    const angle1 = (i * 2 * Math.PI) / segments;
    const angle2 = ((i + 1) * 2 * Math.PI) / segments;
    
    pattern.push([
      { x: centerX + Math.cos(angle1) * outerRadius, y: centerY + Math.sin(angle1) * outerRadius },
      { x: centerX + Math.cos(angle2) * outerRadius, y: centerY + Math.sin(angle2) * outerRadius },
    ]);
    
    // Inner decorative elements
    const midAngle = (angle1 + angle2) / 2;
    pattern.push([
      { x: centerX + Math.cos(midAngle) * innerRadius, y: centerY + Math.sin(midAngle) * innerRadius },
      { x: centerX + Math.cos(midAngle) * outerRadius, y: centerY + Math.sin(midAngle) * outerRadius },
    ]);
  }

  return pattern;
};

const generateSymbolicElements = (card, centerX, centerY, variantStyle) => {
  const symbols = [];
  const symbolCount = card.type === 'major' ? 4 : 2;
  const radius = 0.32;
  
  const cardDetails = card.type === 'major' 
    ? MAJOR_ARCANA_DETAILS[card.number] 
    : MINOR_SUITS_DETAILS[card.suit];

  if (cardDetails) {
    for (let i = 0; i < symbolCount; i++) {
      const angle = (i * 2 * Math.PI) / symbolCount;
      const symbol = cardDetails.symbols[i % cardDetails.symbols.length];
      const symbolPaths = generateSymbolPath(
        symbol, 
        centerX + Math.cos(angle) * radius, 
        centerY + Math.sin(angle) * radius, 
        0.03
      );
      symbols.push({ paths: symbolPaths });
    }
  }

  return symbols;
};

export const getCardColors = (card, variantStyle = null) => {
  if (!card || !card.type) {
    console.warn('Invalid card in getCardColors:', card);
    return { primary: '#d4d4d8', secondary: '#3f3f46', accent: '#a1a1aa' };
  }

  let baseColors;
  
  if (card.type === 'major') {
    const cardDetails = MAJOR_ARCANA_DETAILS[card.number];
    baseColors = cardDetails ? cardDetails.colors : { 
      primary: '#d4af37', 
      secondary: '#2a1810', 
      accent: '#f4e4c1' 
    };
  } else {
    const suitDetails = MINOR_SUITS_DETAILS[card.suit];
    baseColors = suitDetails ? suitDetails.colors : { 
      primary: '#6366f1', 
      secondary: '#1e293b', 
      accent: '#e2e8f0' 
    };
  }

  // Apply variant-specific color modifications
  if (variantStyle && variantStyle.colorPalette) {
    const variantColors = variantStyle.colorPalette;
    return {
      primary: variantColors[0] || baseColors.primary,
      secondary: variantColors[1] || baseColors.secondary,
      accent: variantColors[2] || baseColors.accent
    };
  }

  return baseColors;
};

export const getCardImagery = (card) => {
  if (!card || !card.type) {
    console.warn('Invalid card in getCardImagery:', card);
    return "A mystical scene with abstract symbols.";
  }
  
  return card.type === 'major' 
    ? (MAJOR_ARCANA_DETAILS[card.number]?.imagery || "Mystical major arcana imagery")
    : (MINOR_SUITS_DETAILS[card.suit]?.imagery || "Mystical minor arcana imagery");
};

const generateBackground = (card, centerX, centerY, variantStyle) => {
  const paths = [];
  
  // Generate background elements based on card type and variant
  if (card.type === 'major') {
    const cardDetails = MAJOR_ARCANA_DETAILS[card.number];
    if (cardDetails) {
      // Add background elements based on card imagery
      if (cardDetails.imagery.includes("sun") || cardDetails.imagery.includes("stars")) {
        // Celestial background
        for (let i = 0; i < 5; i++) {
          const starPath = [];
          const starX = 0.1 + (i * 0.2);
          const starY = 0.1 + Math.sin(i) * 0.1;
          
          for (let j = 0; j < 8; j++) {
            const angle = (j * Math.PI) / 4;
            const r = j % 2 === 0 ? 0.02 : 0.01;
            starPath.push({
              x: starX + Math.cos(angle) * r,
              y: starY + Math.sin(angle) * r
            });
          }
          paths.push(starPath);
        }
      }
      
      if (cardDetails.imagery.includes("water") || cardDetails.imagery.includes("moon")) {
        // Water/lunar background
        for (let i = 0; i < 3; i++) {
          const wavePath = [];
          const waveY = 0.8 + i * 0.05;
          for (let x = 0; x <= 1; x += 0.05) {
            wavePath.push({
              x: x,
              y: waveY + Math.sin(x * Math.PI * 4 + i) * 0.02
            });
          }
          paths.push(wavePath);
        }
      }
    }
  } else {
    // Minor arcana backgrounds based on suit
    const suitDetails = MINOR_SUITS_DETAILS[card.suit];
    if (suitDetails) {
      switch (suitDetails.element) {
        case 'fire':
          // Flame patterns
          for (let i = 0; i < 2; i++) {
            const flamePath = [];
            const baseY = 0.7 + i * 0.1;
            for (let x = 0.2; x <= 0.8; x += 0.05) {
              const t = (x - 0.2) / 0.6;
              flamePath.push({
                x: x,
                y: baseY + Math.sin(t * Math.PI * 6) * 0.03 * (1 - t)
              });
            }
            paths.push(flamePath);
          }
          break;
          
        case 'water':
          // Wave patterns
          for (let i = 0; i < 4; i++) {
            const wavePath = [];
            const waveY = 0.6 + i * 0.08;
            for (let x = 0; x <= 1; x += 0.03) {
              wavePath.push({
                x: x,
                y: waveY + Math.sin(x * Math.PI * 3 + i * 0.5) * 0.02
              });
            }
            paths.push(wavePath);
          }
          break;
          
        case 'air':
          // Cloud patterns
          for (let i = 0; i < 3; i++) {
            const cloudPath = [];
            const cloudY = 0.15 + i * 0.1;
            const cloudX = 0.1 + i * 0.3;
            for (let t = 0; t <= Math.PI; t += 0.1) {
              cloudPath.push({
                x: cloudX + Math.cos(t) * 0.08,
                y: cloudY + Math.sin(t) * 0.04
              });
            }
            paths.push(cloudPath);
          }
          break;
          
        case 'earth':
          // Mountain/earth patterns
          const mountainPath = [];
          for (let x = 0; x <= 1; x += 0.05) {
            const height = 0.8 + Math.sin(x * Math.PI * 2) * 0.1 + Math.cos(x * Math.PI * 4) * 0.05;
            mountainPath.push({ x: x, y: height });
          }
          paths.push(mountainPath);
          break;
      }
    }
  }
  
  return { paths };
};

// Validation utilities
export const validateSigilData = (sigilData) => {
  if (!sigilData || typeof sigilData !== 'object') {
    return false;
  }
  
  if (!Array.isArray(sigilData.paths)) {
    return false;
  }
  
  // Check if all paths are valid
  return sigilData.paths.every(path => 
    Array.isArray(path) && path.every(point => 
      typeof point === 'object' && 
      typeof point.x === 'number' && 
      typeof point.y === 'number' &&
      point.x >= 0 && point.x <= 1 &&
      point.y >= 0 && point.y <= 1
    )
  );
};

export const getSigilMetadata = (intention, paths) => {
  const processed = processIntention(intention);
  
  return {
    intention: intention.trim(),
    processed,
    pathCount: Array.isArray(paths) ? paths.length : 0,
    complexity: paths.length > 2 ? 'high' : paths.length > 1 ? 'medium' : 'simple',
    pointCount: Array.isArray(paths) ? paths.reduce((sum, path) => sum + path.length, 0) : 0,
    generated: new Date().toISOString()
  };
};

export const analyzeSigilSymmetry = (paths) => {
  if (!Array.isArray(paths) || paths.length === 0) {
    return { symmetric: false, type: 'none' };
  }
  
  // Simple symmetry analysis
  const centerX = 0.5, centerY = 0.5;
  let horizontalSymmetric = true;
  let verticalSymmetric = true;
  
  paths.forEach(path => {
    if (Array.isArray(path)) {
      path.forEach(point => {
        const mirrorX = centerX * 2 - point.x;
        const mirrorY = centerY * 2 - point.y;
        
        // Check if mirrored points exist (simplified check)
        const hasHorizontalMirror = path.some(p => 
          Math.abs(p.x - point.x) < 0.05 && Math.abs(p.y - mirrorY) < 0.05
        );
        const hasVerticalMirror = path.some(p => 
          Math.abs(p.x - mirrorX) < 0.05 && Math.abs(p.y - point.y) < 0.05
        );
        
        if (!hasHorizontalMirror) horizontalSymmetric = false;
        if (!hasVerticalMirror) verticalSymmetric = false;
      });
    }
  });
  
  if (horizontalSymmetric && verticalSymmetric) {
    return { symmetric: true, type: 'both' };
  } else if (horizontalSymmetric) {
    return { symmetric: true, type: 'horizontal' };
  } else if (verticalSymmetric) {
    return { symmetric: true, type: 'vertical' };
  } else {
    return { symmetric: false, type: 'asymmetric' };
  }
};

export const getSigilBoundingBox = (paths) => {
  if (!Array.isArray(paths) || paths.length === 0) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 };
  }
  
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  
  paths.forEach(path => {
    if (Array.isArray(path)) {
      path.forEach(point => {
        if (typeof point === 'object' && point.x !== undefined && point.y !== undefined) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
      });
    }
  });
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
};

// Export all card data for external use
export { MAJOR_ARCANA_DETAILS, MINOR_SUITS_DETAILS, TAROT_VARIANTS };

// Utility function to get complete card information
export const getCompleteCardInfo = (cardType, cardNumber, suit = null) => {
  if (cardType === 'major') {
    return MAJOR_ARCANA_DETAILS[cardNumber] || null;
  } else if (cardType === 'minor' && suit) {
    const suitInfo = MINOR_SUITS_DETAILS[suit];
    if (suitInfo) {
      return {
        ...suitInfo,
        suit,
        type: 'minor'
      };
    }
  }
  return null;
};

// Generate a reading spread (bonus utility)
export const generateTarotSpread = (spreadType = 'three-card') => {
  const spreads = {
    'three-card': {
      name: 'Past, Present, Future',
      positions: [
        { name: 'Past', description: 'What influences from the past affect this situation' },
        { name: 'Present', description: 'The current state and immediate influences' },
        { name: 'Future', description: 'Likely outcome if current path continues' }
      ]
    },
    'celtic-cross': {
      name: 'Celtic Cross',
      positions: [
        { name: 'Present Situation', description: 'The heart of the matter' },
        { name: 'Challenge', description: 'What crosses or challenges you' },
        { name: 'Distant Past', description: 'Foundation of the situation' },
        { name: 'Possible Outcome', description: 'What may come to pass' },
        { name: 'Recent Past', description: 'Recent influences' },
        { name: 'Immediate Future', description: 'What approaches' },
        { name: 'Your Approach', description: 'How you approach the situation' },
        { name: 'External Influences', description: 'Others\' influence on the situation' },
        { name: 'Hopes and Fears', description: 'Your inner hopes and fears' },
        { name: 'Final Outcome', description: 'The ultimate result' }
      ]
    }
  };
  
  return spreads[spreadType] || spreads['three-card'];
};

// Error handling utility
export const handleTarotError = (error, context = 'tarot generation') => {
  console.error(`Error in ${context}:`, error);
  
  return {
    error: true,
    message: `Failed to complete ${context}`,
    details: error.message || 'Unknown error occurred',
    fallback: true
  };
};

// Performance monitoring utility
export const measureTarotPerformance = (operation, func) => {
  const start = performance.now();
  try {
    const result = func();
    const end = performance.now();
    console.log(`${operation} completed in ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`${operation} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
}