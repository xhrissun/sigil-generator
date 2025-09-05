import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stars, Moon, Sun, Zap, Heart, Shield, Eye, Sparkles, 
  Download, RotateCcw, Palette, Settings, ChevronDown, 
  ChevronUp, Wand2, Target, Compass, BookOpen,
  Crown, Sword, Mountain, Waves, Flame, CreditCard
} from 'lucide-react';
import { generateClientSideSigil, getCardColors, getCardImagery, generateCardDesign, MAJOR_ARCANA_DETAILS, MINOR_SUITS_DETAILS } from '../utils/tarotUtils';

// Historical Tarot Deck Variants
const TAROT_VARIANTS = {
  'rider-waite': {
    name: 'Rider-Waite-Smith',
    year: 1909,
    description: 'The most influential modern tarot deck',
    style: 'symbolic-pictorial',
    colors: ['#8B4513', '#DAA520', '#4682B4', '#228B22'],
    backPattern: 'celestial-grid'
  },
  'marseilles': {
    name: 'Tarot de Marseille',
    year: 1650,
    description: 'Classic European tarot tradition',
    style: 'medieval-geometric',
    colors: ['#DC143C', '#FFD700', '#4169E1', '#228B22'],
    backPattern: 'heraldic'
  },
  'thoth': {
    name: 'Thoth Tarot',
    year: 1944,
    description: 'Aleister Crowley\'s esoteric masterpiece',
    style: 'occult-artistic',
    colors: ['#8A2BE2', '#FF6347', '#40E0D0', '#32CD32'],
    backPattern: 'astrological'
  },
  'visconti': {
    name: 'Visconti-Sforza',
    year: 1450,
    description: 'Earliest surviving tarot cards',
    style: 'renaissance-court',
    colors: ['#B8860B', '#CD853F', '#4682B4', '#800080'],
    backPattern: 'gold-leaf'
  }
};

// Complete Major Arcana with visual symbols
const MAJOR_ARCANA = [
  { number: 0, name: "The Fool", keywords: "new beginnings, innocence, spontaneity", element: "air", 
    symbolism: "The eternal child, divine madness, leap of faith", symbol: "fool", sigilCategory: "journey" },
  { number: 1, name: "The Magician", keywords: "manifestation, resourcefulness, power", element: "mercury",
    symbolism: "Will made manifest, as above so below, divine creativity", symbol: "infinity", sigilCategory: "creation" },
  { number: 2, name: "The High Priestess", keywords: "intuition, sacred knowledge, divine feminine", element: "moon",
    symbolism: "Hidden wisdom, the veil between worlds, lunar mysteries", symbol: "pillars", sigilCategory: "wisdom" },
  { number: 3, name: "The Empress", keywords: "femininity, beauty, nature, nurturing", element: "venus",
    symbolism: "Mother Earth, fertility, creative abundance", symbol: "venus", sigilCategory: "abundance" },
  { number: 4, name: "The Emperor", keywords: "authority, establishment, structure", element: "aries",
    symbolism: "Earthly power, paternal authority, cosmic order", symbol: "throne", sigilCategory: "authority" },
  { number: 5, name: "The Hierophant", keywords: "spiritual wisdom, conformity, tradition", element: "taurus",
    symbolism: "Sacred tradition, spiritual teaching, religious authority", symbol: "keys", sigilCategory: "tradition" },
  { number: 6, name: "The Lovers", keywords: "love, harmony, relationships, values", element: "gemini",
    symbolism: "Divine union, choice and consequence, Adam and Eve", symbol: "heart", sigilCategory: "love" },
  { number: 7, name: "The Chariot", keywords: "control, willpower, success, determination", element: "cancer",
    symbolism: "Spiritual triumph, mastery of opposites, victory through will", symbol: "chariot", sigilCategory: "will" },
  { number: 8, name: "Strength", keywords: "strength, courage, patience, control", element: "leo",
    symbolism: "Inner strength, taming the beast within, divine courage", symbol: "lion", sigilCategory: "courage" },
  { number: 9, name: "The Hermit", keywords: "soul searching, seeking inner guidance", element: "virgo",
    symbolism: "Inner light, spiritual quest, divine guidance", symbol: "lantern", sigilCategory: "wisdom" },
  { number: 10, name: "Wheel of Fortune", keywords: "good luck, karma, life cycles", element: "jupiter",
    symbolism: "Cosmic cycles, fate and fortune, eternal return", symbol: "wheel", sigilCategory: "fate" },
  { number: 11, name: "Justice", keywords: "justice, fairness, truth, karma", element: "libra",
    symbolism: "Divine justice, karmic balance, cosmic law", symbol: "scales", sigilCategory: "justice" },
  { number: 12, name: "The Hanged Man", keywords: "suspension, restriction, letting go", element: "water",
    symbolism: "Sacrifice, new perspective, spiritual surrender", symbol: "hanged", sigilCategory: "surrender" },
  { number: 13, name: "Death", keywords: "endings, beginnings, change, transformation", element: "scorpio",
    symbolism: "Transformation, rebirth, the great mystery", symbol: "scythe", sigilCategory: "transformation" },
  { number: 14, name: "Temperance", keywords: "balance, moderation, patience, purpose", element: "sagittarius",
    symbolism: "Divine alchemy, moderation, angelic guidance", symbol: "angel", sigilCategory: "balance" },
  { number: 15, name: "The Devil", keywords: "bondage, addiction, sexuality, materialism", element: "capricorn",
    symbolism: "Material bondage, shadow self, illusion of limitation", symbol: "devil", sigilCategory: "temptation" },
  { number: 16, name: "The Tower", keywords: "sudden change, upheaval, chaos, revelation", element: "mars",
    symbolism: "Divine lightning, false structures falling, revelation", symbol: "tower", sigilCategory: "revelation" },
  { number: 17, name: "The Star", keywords: "hope, faith, purpose, renewal, spirituality", element: "aquarius",
    symbolism: "Divine hope, cosmic guidance, spiritual renewal", symbol: "star", sigilCategory: "hope" },
  { number: 18, name: "The Moon", keywords: "illusion, fear, anxiety, subconscious, intuition", element: "pisces",
    symbolism: "Lunar mysteries, unconscious fears, psychic realm", symbol: "moon", sigilCategory: "intuition" },
  { number: 19, name: "The Sun", keywords: "positivity, fun, warmth, success, vitality", element: "sun",
    symbolism: "Solar consciousness, divine joy, enlightenment", symbol: "sun", sigilCategory: "vitality" },
  { number: 20, name: "Judgement", keywords: "judgement, rebirth, inner calling, absolution", element: "fire",
    symbolism: "Final judgment, spiritual awakening, resurrection", symbol: "trumpet", sigilCategory: "awakening" },
  { number: 21, name: "The World", keywords: "completion, accomplishment, travel, fulfillment", element: "saturn",
    symbolism: "Cosmic completion, unity, the great work finished", symbol: "wreath", sigilCategory: "completion" },
];

// Complete Minor Arcana suits with elemental correspondences
const MINOR_SUITS = {
  wands: { 
    element: 'fire', 
    icon: Flame,
    keywords: 'creativity, spirituality, determination, ambition, passion',
    color: '#ff6b47',
    symbolism: 'Divine will, creative force, spiritual energy',
    cards: ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'],
    sigilCategory: 'passion'
  },
  cups: { 
    element: 'water', 
    icon: Waves,
    keywords: 'emotion, intuition, relationships, spirituality, love',
    color: '#4ecdc4',
    symbolism: 'Emotional realm, intuition, the heart\'s wisdom',
    cards: ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'],
    sigilCategory: 'love'
  },
  swords: { 
    element: 'air', 
    icon: Sword,
    keywords: 'thought, communication, conflict, intellect, truth',
    color: '#a8e6cf',
    symbolism: 'Mental realm, communication, the sword of truth',
    cards: ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'],
    sigilCategory: 'truth'
  },
  pentacles: { 
    element: 'earth', 
    icon: Mountain,
    keywords: 'material world, career, money, achievement, manifestation',
    color: '#ffd93d',
    symbolism: 'Material realm, earthly manifestation, practical wisdom',
    cards: ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'],
    sigilCategory: 'prosperity'
  },
};

// Professional Tarot Card Component
const TarotCard = ({ card, sigilData, onDownload }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 1000);
    return () => clearTimeout(timer);
  }, [card]);

  useEffect(() => {
    if (canvasRef.current && card) {
      drawTarotCard();
    }
  }, [isRevealed, flipped, card, sigilData]);

  const drawTarotCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set high-resolution canvas
    canvas.width = 400 * dpr;
    canvas.height = 700 * dpr;
    canvas.style.width = '300px';
    canvas.style.height = '525px';
    ctx.scale(dpr, dpr);

    // Enable antialiasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, 400, 700);

    if (flipped) {
      drawCardBack(ctx, card);
      return;
    }

    // Get card design from tarotUtils
    const cardColors = getCardColors(card, TAROT_VARIANTS[card.variant]);
    const cardDesign = generateCardDesign(card, card.intention, sigilData, card.variant);
    const imagery = getCardImagery(card);

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 700);
    bgGradient.addColorStop(0, cardColors.primary + 'E6');
    bgGradient.addColorStop(1, cardColors.secondary + '80');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 400, 700);

    // Draw ornate border
    ctx.strokeStyle = cardColors.accent;
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 380, 680);
    ctx.strokeStyle = cardColors.primary + '80';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 360, 660);

    // Draw background patterns
    drawBackgroundPatterns(ctx, cardDesign.background, cardColors);

    // Draw title
    ctx.fillStyle = cardColors.accent;
    ctx.font = 'bold 24px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText(card.name.toUpperCase(), 200, 50);

    // Draw number/suit
    ctx.font = '16px "Cinzel", serif';
    if (card.type === 'major') {
      ctx.fillText(`Arcanum ${card.number}`, 200, 80);
    } else {
      ctx.fillText(`${card.number} of ${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}`, 200, 80);
    }

    // Draw main imagery area
    ctx.fillStyle = cardColors.secondary + '20';
    ctx.fillRect(40, 100, 320, 450);

    // Draw sigil
    if (sigilData && sigilData.paths) {
      drawSigil(ctx, sigilData, cardColors, 200, 325, 150);
    }

    // Draw symbolic elements
    drawSymbolicElements(ctx, cardDesign.symbols, cardColors);

    // Draw corner elements
    drawCornerElements(ctx, cardDesign.corners, cardColors);

    // Draw imagery description
    ctx.font = 'italic 12px "Cinzel", serif';
    ctx.fillStyle = cardColors.accent + '80';
    ctx.textAlign = 'center';
    const imageryLines = wrapText(imagery, 300);
    imageryLines.forEach((line, index) => {
      ctx.fillText(line, 200, 570 + index * 16);
    });

    // Draw keywords
    ctx.font = '12px "Cinzel", serif';
    const keywords = card.keywords.split(',').map(k => k.trim());
    keywords.slice(0, 3).forEach((keyword, index) => {
      ctx.fillText(keyword.toUpperCase(), 200, 620 + index * 16);
    });

    // Draw variant signature
    ctx.font = '10px "Cinzel", serif';
    ctx.fillStyle = cardColors.accent + '60';
    const variantInfo = TAROT_VARIANTS[card.variant];
    ctx.fillText(`${variantInfo.name} (${variantInfo.year})`, 200, 680);
  };

  const drawCardBack = (ctx, card) => {
    const variant = TAROT_VARIANTS[card.variant] || TAROT_VARIANTS['rider-waite'];
    const cardColors = getCardColors(card, variant);

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 700);
    bgGradient.addColorStop(0, cardColors.secondary + 'E6');
    bgGradient.addColorStop(1, cardColors.primary + '80');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 400, 700);

    // Draw ornate border
    ctx.strokeStyle = cardColors.accent;
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 380, 680);

    // Draw back pattern
    switch (variant.backPattern) {
      case 'celestial-grid':
        drawCelestialGrid(ctx, cardColors);
        break;
      case 'heraldic':
        drawHeraldicPattern(ctx, cardColors);
        break;
      case 'astrological':
        drawAstrologicalPattern(ctx, cardColors);
        break;
      case 'gold-leaf':
        drawGoldLeafPattern(ctx, cardColors);
        break;
    }

    // Draw central emblem
    ctx.fillStyle = cardColors.accent + '40';
    ctx.strokeStyle = cardColors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 350, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '20px "Cinzel", serif';
    ctx.fillStyle = cardColors.accent;
    ctx.textAlign = 'center';
    ctx.fillText('TAROT', 200, 360);
  };

  const drawCelestialGrid = (ctx, colors) => {
    ctx.strokeStyle = colors.accent + '60';
    ctx.lineWidth = 1;
    for (let i = 50; i < 350; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 50);
      ctx.lineTo(i, 650);
      ctx.moveTo(50, i);
      ctx.lineTo(350, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(i, i, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent + '40';
      ctx.fill();
    }
  };

  const drawHeraldicPattern = (ctx, colors) => {
    ctx.fillStyle = colors.accent + '40';
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    for (let y = 100; y < 600; y += 100) {
      for (let x = 100; x < 300; x += 100) {
        drawStar(ctx, x, y, 15, 7, 5);
      }
    }
  };

  const drawAstrologicalPattern = (ctx, colors) => {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    const radius = 80;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = 200 + Math.cos(angle) * radius;
      const y = 350 + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawGoldLeafPattern = (ctx, colors) => {
    ctx.fillStyle = colors.accent + '40';
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = 200 + Math.cos(angle) * 100;
      const y = 350 + Math.sin(angle) * 100;
      drawHeart(ctx, x, y, 15);
    }
  };

  const drawBackgroundPatterns = (ctx, background, colors) => {
    ctx.strokeStyle = colors.accent + '60';
    ctx.lineWidth = 1.5;
    background.paths.forEach(path => {
      ctx.beginPath();
      path.forEach((point, index) => {
        const x = point.x * 400;
        const y = point.y * 700;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  };

  const drawSigil = (ctx, sigilData, colors, centerX, centerY, scale) => {
    ctx.save();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = colors.accent + '80';
    ctx.shadowBlur = 8;

    sigilData.paths.forEach(path => {
      ctx.beginPath();
      path.forEach((point, index) => {
        const x = centerX + (point.x - 0.5) * scale;
        const y = centerY + (point.y - 0.5) * scale;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawSymbolicElements = (ctx, symbols, colors) => {
    ctx.strokeStyle = colors.primary;
    ctx.fillStyle = colors.primary + '40';
    ctx.lineWidth = 2;
    symbols.forEach(symbol => {
      symbol.paths.forEach(path => {
        ctx.beginPath();
        path.forEach((point, index) => {
          const x = point.x * 400;
          const y = point.y * 700;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.fill();
      });
    });
  };

  const drawCornerElements = (ctx, corners, colors) => {
    ctx.strokeStyle = colors.accent;
    ctx.fillStyle = colors.accent + '40';
    ctx.lineWidth = 1.5;
    corners.forEach(corner => {
      corner.paths.forEach(path => {
        ctx.beginPath();
        path.forEach((point, index) => {
          const x = point.x * 400;
          const y = point.y * 700;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.fill();
      });
    });
  };

  const drawStar = (ctx, x, y, outerRadius, innerRadius, points) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  const drawHeart = (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
    ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.3);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const wrapText = (text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const ctx = canvasRef.current.getContext('2d');
    ctx.font = 'italic 12px "Cinzel", serif';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const downloadCard = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `tarot-${card.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();

    if (onDownload) {
      onDownload();
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          {flipped ? 'Card Back' : (isRevealed ? card.name : 'Revealing...')}
        </h3>
        {card.symbolism && !flipped && isRevealed && (
          <p className="text-sm text-gray-400 mt-1 italic">
            {card.symbolism}
          </p>
        )}
      </div>

      <div className="relative bg-gray-900 rounded-lg p-4 shadow-xl border border-purple-500/50">
        <canvas ref={canvasRef} className="w-full rounded-lg shadow-inner" />
        <div className="flex justify-center space-x-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFlip}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Flip</span>
          </motion.button>

          {!flipped && isRevealed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCard}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Save</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Tarot Generator Component
const TarotGenerator = () => {
  const [intention, setIntention] = useState('');
  const [cardType, setCardType] = useState('major');
  const [suit, setSuit] = useState('wands');
  const [variant, setVariant] = useState('rider-waite');
  const [generatedCard, setGeneratedCard] = useState(null);
  const [sigilData, setSigilData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    examples: true,
    variants: true,
    knowledge: true
  });

  // Sample intentions for different card types
  const sampleIntentions = {
    major: [
      "Guide me through this major life transition",
      "Show me the spiritual lesson I need to learn",
      "Reveal the deeper meaning behind recent events",
      "Help me understand my soul's journey",
      "What transformation awaits me?"
    ],
    minor: {
      wands: [
        "Ignite my creative passion",
        "Show me my spiritual purpose",
        "Guide my ambitious endeavors",
        "Fuel my inner fire"
      ],
      cups: [
        "Heal my emotional wounds",
        "Open my heart to love",
        "Deepen my intuitive abilities",
        "Bring harmony to relationships"
      ],
      swords: [
        "Cut through mental confusion",
        "Speak my truth with clarity",
        "Resolve this conflict wisely",
        "Find mental breakthrough"
      ],
      pentacles: [
        "Manifest material abundance",
        "Ground my spiritual practice",
        "Build lasting prosperity",
        "Achieve practical success"
      ]
    }
  };

  const generateTarotCard = useCallback(async () => {
    if (!intention.trim()) return;

    setIsGenerating(true);
    setGeneratedCard(null);
    setSigilData(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Realistic generation delay

      let selectedCard;

      if (cardType === 'major') {
        selectedCard = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
        selectedCard.type = 'major';
      } else {
        const suitData = MINOR_SUITS[suit];
        const randomCard = suitData.cards[Math.floor(Math.random() * suitData.cards.length)];

        selectedCard = {
          number: randomCard,
          name: `${randomCard} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
          keywords: suitData.keywords,
          element: suitData.element,
          symbolism: `${suitData.symbolism} - ${randomCard}`,
          suit,
          type: 'minor',
          sigilCategory: suitData.sigilCategory
        };
      }

      // Generate sigil based on intention and arcana-specific category
      const sigilCategory = selectedCard.sigilCategory || 'general';
      const generatedSigil = generateClientSideSigil(intention.trim(), sigilCategory, 'high');

      // Enhance card with variant-specific styling
      const enhancedCard = {
        ...selectedCard,
        intention: intention.trim(),
        variant,
        timestamp: Date.now()
      };

      setGeneratedCard(enhancedCard);
      setSigilData(generatedSigil);

    } catch (error) {
      console.error('Error generating tarot card:', error);
      const fallbackCard = {
        name: "The Fool",
        number: 0,
        keywords: "new beginnings, innocence, spontaneity",
        type: 'major',
        intention: intention.trim(),
        variant,
        symbolism: "The eternal child, divine madness, leap of faith",
        symbol: "fool",
        sigilCategory: "journey"
      };
      setGeneratedCard(fallbackCard);
      setSigilData(generateClientSideSigil(intention.trim(), 'journey', 'medium'));
    } finally {
      setIsGenerating(false);
    }
  }, [intention, cardType, suit, variant]);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectSampleIntention = (sample) => {
    setIntention(sample);
  };

  const currentSamples = cardType === 'major' 
    ? sampleIntentions.major 
    : sampleIntentions.minor[suit] || [];

  return (
    <div className="min-h-screen pt-16 py-8 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CreditCard className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Legendary Tarot Forge
            </h1>
            <Stars className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Generate authentic tarot cards based on <span className="text-purple-400 font-semibold">historical legendary variants</span> with 
            <span className="text-indigo-400 font-semibold"> personalized sigil integration</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Tarot Variant Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-gradient mb-4 flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Historical Variant
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(TAROT_VARIANTS).map(([key, variantData]) => (
                  <button
                    key={key}
                    onClick={() => setVariant(key)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      variant === key
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-slate-600 hover:border-purple-500/50 text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{variantData.name}</div>
                    <div className="text-xs text-gray-400">{variantData.year} • {variantData.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Arcana Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-gradient mb-4">Arcana Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCardType('major')}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    cardType === 'major'
                      ? 'border-gold-500 bg-gold-500/20 text-gold-300'
                      : 'border-slate-600 hover:border-gold-500/50 text-gray-300'
                  }`}
                >
                  <Crown className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Major Arcana</div>
                  <div className="text-xs text-gray-400">22 trumps • Life lessons</div>
                </button>
                
                <button
                  onClick={() => setCardType('minor')}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    cardType === 'minor'
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-600 hover:border-indigo-500/50 text-gray-300'
                  }`}
                >
                  <Target className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Minor Arcana</div>
                  <div className="text-xs text-gray-400">56 cards • Daily guidance</div>
                </button>
              </div>
            </div>

            {/* Suit Selection */}
            <AnimatePresence>
              {cardType === 'minor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700"
                >
                  <h3 className="text-lg font-bold text-gradient mb-4">Elemental Suit</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(MINOR_SUITS).map(([suitName, suitData]) => {
                      const Icon = suitData.icon;
                      return (
                        <button
                          key={suitName}
                          onClick={() => setSuit(suitName)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            suit === suitName
                              ? 'border-current bg-current/20'
                              : 'border-slate-600 hover:border-current/50 text-gray-300'
                          }`}
                          style={{ 
                            color: suit === suitName ? suitData.color : undefined,
                            borderColor: suit === suitName ? suitData.color : undefined 
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon className="h-4 w-4" />
                            <span className="font-semibold capitalize">{suitName}</span>
                          </div>
                          <div className="text-xs opacity-80">{suitData.element} • 14 cards</div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Intention Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-gradient mb-4 flex items-center">
                <Wand2 className="h-5 w-5 mr-2" />
                Sacred Intention
              </h3>
              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="What guidance do you seek? Your intention will be woven into a personalized sigil..."
                className="w-full h-24 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{intention.length}/200 characters</span>
                {intention.trim() && (
                  <span className="text-xs text-purple-400">Sigil will be generated</span>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateTarotCard}
                disabled={!intention.trim() || isGenerating}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                    <span>Channeling Ancient Wisdom...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>Draw Sacred Card</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Sample Intentions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <button
                onClick={() => toggleSection('examples')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-semibold text-gradient">Sacred Templates</h3>
                {collapsedSections.examples ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {!collapsedSections.examples && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {currentSamples.slice(0, 4).map((sample, index) => (
                      <button
                        key={index}
                        onClick={() => selectSampleIntention(sample)}
                        className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all text-sm"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Card Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-1"
          >
            <div className="sticky top-8">
              {generatedCard ? (
                <TarotCard 
                  card={generatedCard} 
                  sigilData={sigilData}
                />
              ) : (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="mb-6"
                    >
                      <CreditCard className="h-20 w-20 text-purple-400/30 mx-auto" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-400 mb-3">
                      Your Legendary Card Awaits
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                      Enter your sacred intention and draw from the ancient wisdom of legendary tarot traditions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Information Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Card Information */}
            {generatedCard && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-gradient mb-4">Card Wisdom</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Card</div>
                    <div className="font-semibold text-purple-300 text-lg">{generatedCard.name}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Historical Variant</div>
                    <div className="text-sm text-gray-300">
                      {TAROT_VARIANTS[generatedCard.variant]?.name} ({TAROT_VARIANTS[generatedCard.variant]?.year})
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Keywords</div>
                    <div className="text-sm text-gray-300">{generatedCard.keywords}</div>
                  </div>
                  
                  {generatedCard.element && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Element</div>
                      <div className="text-sm text-gray-300 capitalize">{generatedCard.element}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your Intention</div>
                    <div className="text-sm text-gray-300 italic">"{generatedCard.intention}"</div>
                  </div>
                  
                  {sigilData?.metadata && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Sigil Complexity</div>
                      <div className="text-sm text-gray-300">
                        {sigilData.metadata.pathCount} paths • {sigilData.metadata.complexity} complexity
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historical Variants Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <button
                onClick={() => toggleSection('variants')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-semibold text-gradient">Legendary Variants</h3>
                {collapsedSections.variants ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {!collapsedSections.variants && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 text-sm"
                  >
                    {Object.entries(TAROT_VARIANTS).map(([key, variantData]) => (
                      <div 
                        key={key}
                        className={`p-3 rounded-lg border ${
                          variant === key 
                            ? 'border-purple-500/50 bg-purple-500/10' 
                            : 'border-slate-600 bg-slate-700/30'
                        }`}
                      >
                        <div className="font-medium text-purple-300">{variantData.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {variantData.year} • {variantData.description}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tarot Knowledge */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <button
                onClick={() => toggleSection('knowledge')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-semibold text-gradient flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
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
                    className="space-y-3 text-sm"
                  >
                    <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-lg border border-yellow-500/20">
                      <div className="text-yellow-300 font-medium mb-1 flex items-center">
                        <Crown className="h-4 w-4 mr-2" />
                        Major Arcana (22 cards)
                      </div>
                      <div className="text-gray-400">
                        The spiritual journey of the soul through archetypal experiences, from Fool to World
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-lg border border-blue-500/20">
                      <div className="text-blue-300 font-medium mb-1 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Minor Arcana (56 cards)
                      </div>
                      <div className="text-gray-400">
                        Daily life through four elemental suits: Wands (Fire), Cups (Water), Swords (Air), Pentacles (Earth)
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/20">
                      <div className="text-purple-300 font-medium mb-1 flex items-center">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Sigil Integration
                      </div>
                      <div className="text-gray-400">
                        Personal intentions transformed into mystical symbols and woven into traditional card designs
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
                      <div className="text-green-300 font-medium mb-1">Historical Accuracy</div>
                      <div className="text-gray-400">
                        Based on authentic historical tarot traditions spanning 600+ years of esoteric wisdom
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TarotGenerator;