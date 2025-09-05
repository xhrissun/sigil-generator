import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Wand2, Star, Zap, Eye, Crown } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Wand2,
      title: 'Advanced Generation',
      description: 'Sophisticated algorithms transform your intentions into unique mystical symbols'
    },
    {
      icon: Star,
      title: 'Sacred Geometry',
      description: 'Incorporates ancient geometric principles for powerful symbolic resonance'
    },
    {
      icon: Zap,
      title: 'Instant Creation',
      description: 'Generate personalized sigils in seconds with our intuitive interface'
    },
    {
      icon: Eye,
      title: 'Mystical Aesthetics',
      description: 'Beautiful, otherworldly designs that captivate and inspire'
    },
    {
      icon: Crown,
      title: 'Personal Library',
      description: 'Save and organize your sigil collection with detailed metadata'
    },
    {
      icon: Sparkles,
      title: 'Export Options',
      description: 'Download your sigils in multiple formats for various uses'
    }
  ]

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

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative py-20 px-4 text-center overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Sparkles className="h-20 w-20 text-primary-400 mystical-glow" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-mystical font-bold mb-6 text-gradient">
              Forge Your Destiny
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Transform your deepest intentions into powerful mystical symbols with our 
              advanced sigil generation system
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/generator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Wand2 className="h-5 w-5" />
                <span>Create Sigil</span>
              </motion.button>
            </Link>
            
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-mystical font-bold mb-6 text-gradient">
              Mystical Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the power of ancient symbolism combined with modern technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="card group cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 group-hover:from-primary-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary-400 group-hover:text-primary-300 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-xl font-mystical font-semibold mb-3 text-white group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-20 px-4 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="card"
          >
            <h2 className="text-3xl md:text-4xl font-mystical font-bold mb-6 text-gradient">
              Begin Your Journey
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Step into the realm of mystical creation. Your intentions await transformation 
              into powerful symbols that will guide your path forward.
            </p>
            <Link to="/generator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Start Creating</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home