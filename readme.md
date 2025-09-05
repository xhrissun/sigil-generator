# 🔮 Advanced Sigil Generator

A professional, full-stack web application for generating mystical sigils with advanced algorithms and beautiful UI. Transform your intentions into powerful symbolic representations using sacred geometry and modern technology.

## ✨ Features

### 🎨 Advanced Generation
- **Category-Specific Algorithms**: Different generation patterns for Love, Prosperity, Protection, Wisdom, and General purposes
- **Sacred Geometry Integration**: Incorporates ancient geometric principles for powerful symbolic resonance
- **Real-time Preview**: Instant sigil generation with smooth animations
- **Customizable Styling**: Full control over colors, stroke width, and visual effects

### 🖥️ Professional UI/UX
- **Modern Design**: Dark theme with mystical aesthetics and gradient effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Intuitive Navigation**: Clean, organized interface with easy-to-use controls

### 💾 Data Management
- **MongoDB Atlas Integration**: Secure cloud database storage
- **Personal Collections**: Save and organize your sigil library
- **Search & Filter**: Find sigils by intention, category, or creation date
- **Export Options**: Download sigils in high-quality PNG format

### 🔧 Technical Excellence
- **React 18**: Modern frontend with hooks and functional components
- **Express.js API**: Robust backend with comprehensive error handling
- **Mongoose ODM**: Structured data modeling with validation
- **Tailwind CSS**: Utility-first styling with custom design system

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sigil-generator
   ```

2. **Install dependencies**
   ```bash
   # Install main dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sigil-generator?retryWrites=true&w=majority
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev:full
   
   # Or run separately:
   # Frontend only
   npm run dev
   
   # Backend only  
   npm run server
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
SIGIL_GENERATOR/
├── server/                 # Backend API
│   ├── models/
│   │   └── Sigil.js       # MongoDB schema
│   ├── routes/
│   │   └── sigils.js      # API routes
│   ├── server.js          # Express server
│   └── package.json
├── src/                   # Frontend React app
│   ├── api/
│   │   └── sigilAPI.js    # API client functions
│   ├── components/
│   │   ├── Navbar.jsx     # Navigation component
│   │   ├── Sidebar.jsx    # Settings sidebar
│   │   └── SigilCanvas.jsx # Canvas for sigil display
│   ├── pages/
│   │   ├── Home.jsx       # Landing page
│   │   ├── About.jsx      # Information page
│   │   └── SigilGenerator.jsx # Main generator page
│   ├── routes/
│   │   └── Dashboard.jsx  # Sigil collection management
│   ├── utils/
│   │   └── sigilUtils.js  # Client-side generation utilities
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

## 🔮 How Sigil Generation Works

### Traditional Method
1. **Write Intention**: "I am confident and strong"
2. **Remove Vowels**: "m cnfdnt nd strng"
3. **Remove Duplicates**: "mcnfdtsg"
4. **Create Symbol**: Combine letters into geometric pattern

### Our Advanced Method
1. **Linguistic Analysis**: Process intention with semantic understanding
2. **Category Optimization**: Apply category-specific generation patterns
3. **Sacred Geometry**: Incorporate golden ratio and geometric principles
4. **Aesthetic Refinement**: Create beautiful, balanced compositions

### Generation Categories

#### 💖 Love & Relationships
- Heart-based geometric patterns
- Flowing, organic curves
- Connection-focused designs

#### 💰 Prosperity & Success  
- Spiral growth patterns
- Expanding geometric forms
- Abundance-representing symbols

#### 🛡️ Protection & Healing
- Defensive geometric shapes
- Hexagonal and circular barriers
- Protective boundary patterns

#### 🧠 Wisdom & Knowledge
- Tree-like branching patterns
- Network and connection designs
- Growth-representing structures

#### ⭐ General
- Constellation patterns
- Balanced geometric designs
- Universal symbolic forms

## 🎨 Customization Options

### Visual Styling
- **Stroke Colors**: 8 preset colors plus custom color picker
- **Background Colors**: Full customization with presets
- **Stroke Width**: Adjustable from 1-8 pixels
- **Animation Effects**: Optional drawing animations

### Export Formats
- **High-Quality PNG**: Perfect for printing or digital use
- **Transparent Background**: Option for versatile usage
- **Multiple Resolutions**: Optimized for different use cases

## 📱 Usage Guide

### Creating Your First Sigil

1. **Navigate to Generator**: Click "Create Sigil" from home page
2. **Choose Category**: Select the most appropriate category for your intention
3. **Write Intention**: Enter your desire in present tense (e.g., "I am successful")
4. **Generate**: Click "Generate Sigil" to create your symbol
5. **Customize**: Adjust colors and styling to your preference
6. **Save**: Save to your collection for future reference
7. **Download**: Export as PNG for external use

### Best Practices for Intentions

✅ **Do:**
- Use present tense ("I am..." not "I will be...")
- Be specific but not overly complex
- Focus on positive outcomes
- Keep it personal and meaningful
- Trust your intuition

❌ **Don't:**
- Use negative language ("I am not afraid" → "I am brave")
- Make it too long or complicated
- Focus on what you don't want
- Copy others' intentions exactly
- Doubt the process

### Using Your Sigils

#### Digital Practice
- Set as wallpaper or screensaver
- Include in digital vision boards
- Meditate while viewing on screen
- Share in spiritual communities

#### Physical Practice
- Print and frame for altar space
- Draw or trace during meditation
- Engrave on jewelry or objects
- Include in ritual work

## 🔧 API Reference

### Endpoints

#### Generate Sigil
```http
POST /api/sigils/generate
Content-Type: application/json

{
  "intention": "I am confident and strong",
  "category": "general"
}
```

#### Save Sigil
```http
POST /api/sigils
Content-Type: application/json

{
  "intention": "I am confident and strong",
  "category": "general",
  "paths": [...],
  "strokeColor": "#6366f1",
  "backgroundColor": "#0f172a"
}
```

#### Get All Sigils
```http
GET /api/sigils?page=1&limit=12&category=love&sortBy=newest
```

#### Get Specific Sigil
```http
GET /api/sigils/:id
```

#### Update Sigil
```http
PATCH /api/sigils/:id
Content-Type: application/json

{
  "strokeColor": "#8b5cf6",
  "tags": ["updated", "purple"]
}
```

#### Delete Sigil
```http
DELETE /api/sigils/:id
```

#### Search Sigils
```http
GET /api/sigils/search?q=confidence&category=general&limit=10
```

## 🛠️ Development

### Available Scripts

```bash
# Frontend development
npm run dev              # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Backend development  
npm run server          # Start Express server
cd server && npm run dev # Start with nodemon

# Full stack development
npm run dev:full        # Run both frontend and backend
```

### Environment Variables

```env
# Required
MONGODB_URI=your_mongodb_connection_string

# Optional
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Database Schema

```javascript
// Sigil Model
{
  intention: String,        // Required, 3-200 characters
  category: String,         // Enum: general, love, prosperity, protection, wisdom
  paths: [[{x: Number, y: Number}]], // Array of path coordinates
  strokeColor: String,      // Hex color
  strokeWidth: Number,      // 1-10 pixels
  backgroundColor: String,  // Hex color
  imageData: String,        // Base64 image data
  complexity: {
    paths: Number,
    points: Number, 
    score: Number
  },
  tags: [String],          // Auto-generated from intention
  views: Number,           // Analytics
  downloads: Number,       // Analytics
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

### Backend (Railway/Heroku)
1. Create MongoDB Atlas cluster
2. Set environment variables
3. Deploy server folder
4. Update frontend API URL

### Full Stack (Railway)
```bash
# Add to package.json
"scripts": {
  "build": "npm run build",
  "start": "cd server && npm start"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new features (optional)
- Maintain consistent code style
- Add tests for new functionality
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Traditional sigil creation methods
- Sacred geometry principles
- Modern web development community
- Open source contributors

## 📞 Support

- **Documentation**: Check this README for detailed information
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions for questions
- **Email**: Contact for business inquiries

---

**Made with 🔮 and ❤️ for the mystical community**