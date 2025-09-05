import { motion } from 'framer-motion'
import { BookOpen, Sparkles, Star, Eye, Zap, Crown } from 'lucide-react'

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Ancient Wisdom',
      description: 'Based on traditional sigil creation methods used by practitioners for centuries'
    },
    {
      icon: Zap,
      title: 'Modern Technology',
      description: 'Advanced algorithms that understand the symbolic nature of language and intention'
    },
    {
      icon: Star,
      title: 'Sacred Geometry',
      description: 'Incorporates principles of sacred geometry to create harmonious and powerful symbols'
    },
    {
      icon: Eye,
      title: 'Intuitive Design',
      description: 'Clean, mystical interface that enhances your creative and spiritual experience'
    },
    {
      icon: Crown,
      title: 'Personal Collection',
      description: 'Save and organize your sigils with detailed metadata and customization options'
    },
    {
      icon: Sparkles,
      title: 'Multiple Formats',
      description: 'Export your sigils in various formats for digital use or physical manifestation'
    }
  ]

  return (
    <div className="min-h-screen pt-24 py-20 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <BookOpen className="h-16 w-16 text-primary-400 mystical-glow" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-mystical font-bold mb-6 text-gradient">
            About Sigil Factory
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Where ancient mysticism meets cutting-edge technology to transform your intentions 
            into powerful symbolic representations
          </p>
        </motion.div>

        {/* What are Sigils */}
        <motion.section
          variants={itemVariants}
          className="card mb-12"
        >
          <h2 className="text-2xl font-mystical font-semibold mb-6 text-gradient">
            What are Sigils?
          </h2>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Sigils are mystical symbols created to manifest specific intentions or desires. 
              Dating back to ancient civilizations, these powerful glyphs serve as focal points 
              for meditation, intention-setting, and personal transformation.
            </p>
            <p>
              Traditional sigil creation involves transforming written statements of intent into 
              abstract symbols by removing duplicate letters, vowels, and combining the remaining 
              letters into a unique design. This process helps bypass the conscious mind, allowing 
              the intention to work on a subconscious level.
            </p>
            <p>
              Our advanced generator honors these ancient practices while leveraging modern technology 
              to create even more sophisticated and aesthetically pleasing results. Each sigil is 
              unique, personal, and imbued with the energy of your specific intention.
            </p>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          variants={itemVariants}
          className="card mb-12"
        >
          <h2 className="text-2xl font-mystical font-semibold mb-6 text-gradient">
            How Our Generator Works
          </h2>
          <div className="text-gray-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold text-primary-400">2</span>
                </div>
                <h3 className="font-semibold text-primary-300 mb-2">Symbol Generation</h3>
                <p className="text-sm">Advanced algorithms create unique geometric patterns based on your intention, incorporating sacred geometry principles.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold text-primary-400">3</span>
                </div>
                <h3 className="font-semibold text-primary-300 mb-2">Artistic Refinement</h3>
                <p className="text-sm">The raw symbol is refined into a beautiful, mystical design with customizable colors and effects.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          variants={itemVariants}
          className="mb-12"
        >
          <h2 className="text-2xl font-mystical font-semibold mb-8 text-gradient text-center">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="card group cursor-pointer h-full"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 group-hover:from-primary-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary-400 group-hover:text-primary-300 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-lg font-mystical font-semibold mb-3 text-white group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Usage Guide */}
        <motion.section
          variants={itemVariants}
          className="card mb-12"
        >
          <h2 className="text-2xl font-mystical font-semibold mb-6 text-gradient">
            How to Use Your Sigils
          </h2>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-primary-300 mb-3">Digital Practice</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Use as desktop wallpaper or phone background</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Include in digital vision boards</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Meditate while viewing on screen</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Share in spiritual communities</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-primary-300 mb-3">Physical Practice</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Print and frame for altar or sacred space</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Draw or trace during meditation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Engrave on jewelry or talismans</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>Include in ritual work</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
              <h4 className="font-semibold text-primary-300 mb-2">Activation Tip:</h4>
              <p className="text-sm">
                For maximum effectiveness, spend time contemplating your sigil after creation. 
                Focus on the symbol while holding your intention in mind, then release attachment 
                to the outcome and trust in the process.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Philosophy */}
        <motion.section
          variants={itemVariants}
          className="card"
        >
          <h2 className="text-2xl font-mystical font-semibold mb-6 text-gradient">
            Our Philosophy
          </h2>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              We believe that technology should serve to amplify human potential and spiritual 
              growth, not replace traditional wisdom. Sigil Factory bridges the ancient and modern, 
              honoring time-tested mystical practices while making them accessible to a new generation.
            </p>
            <p>
              Every sigil created through our platform carries the intention and energy you invest 
              in it. The tool is simply a conduit – the real power comes from your focused intention 
              and belief in the process. We've designed this generator to be a collaborative partner 
              in your spiritual journey, not a replacement for personal practice and growth.
            </p>
            <p>
              Whether you're a seasoned practitioner or new to the world of sigil magic, our goal 
              is to provide you with beautiful, meaningful symbols that resonate with your deepest 
              intentions and support your path toward manifestation and transformation.
            </p>
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}

export default About