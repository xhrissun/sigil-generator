import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Menu, 
  X, 
  Sparkles, 
  Home, 
  Wand2, 
  Info, 
  Layout, 
  User, 
  LogOut, 
  Crown,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, isPremium, logout } = useAuth()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/generator', label: 'Sigil Generator', icon: Wand2, requireAuth: true },
    { path: '/tarot', label: 'Tarot Generator', icon: Sparkles, requireAuth: true },
    { path: '/dashboard', label: 'Dashboard', icon: Layout, requireAuth: true },
    { path: '/about', label: 'About', icon: Info },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const filteredNavItems = navItems.filter(item => 
    !item.requireAuth || (item.requireAuth && isAuthenticated)
  )

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Sparkles className="h-8 w-8 text-primary-400" />
              <div className="absolute inset-0 h-8 w-8 text-purple-400 animate-pulse-slow">
                <Sparkles className="h-8 w-8" />
              </div>
            </motion.div>
            <span className="text-xl font-mystical font-bold text-gradient">
              Sigil Factory
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {filteredNavItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(path)
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-gray-300 hover:text-primary-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </motion.div>
                  {isActive(path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-primary-400 hover:bg-white/5 transition-all duration-200"
                >
                  <div className="relative">
                    <User className="h-5 w-5" />
                    {isPremium && (
                      <Crown className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span>{user?.username || 'User'}</span>
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-dark-600">
                      <p className="text-sm text-gray-300">{user?.email}</p>
                      <p className="text-xs text-gray-500">
                        {isPremium ? (
                          <span className="flex items-center space-x-1">
                            <Crown className="h-3 w-3 text-yellow-400" />
                            <span>Premium Member</span>
                          </span>
                        ) : (
                          'Free Account'
                        )}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition-colors"
                      >
                        <Layout className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>

                      {!isPremium && (
                        <Link
                          to="/upgrade"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-primary-400 hover:bg-dark-700 transition-colors"
                        >
                          <Crown className="h-4 w-4" />
                          <span>Upgrade to Premium</span>
                        </Link>
                      )}

                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>

                      <div className="border-t border-dark-600 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 px-4"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-400 hover:bg-white/5 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden border-t border-white/10"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-dark-800/80 backdrop-blur-md">
          {filteredNavItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive(path)
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-gray-300 hover:text-primary-400 hover:bg-white/5'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <div className="border-t border-white/10 mt-2 pt-2">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-300">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {isPremium && (
                    <p className="text-xs text-yellow-400 flex items-center space-x-1 mt-1">
                      <Crown className="h-3 w-3" />
                      <span>Premium Member</span>
                    </p>
                  )}
                </div>

                {!isPremium && (
                  <Link
                    to="/upgrade"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-primary-400 hover:bg-white/5 transition-colors rounded-md"
                  >
                    <Crown className="h-5 w-5" />
                    <span>Upgrade to Premium</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-red-400 hover:bg-white/5 transition-colors rounded-md"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-white/10 mt-2 pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-gray-300 hover:text-primary-400 hover:bg-white/5 transition-colors rounded-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 bg-primary-500 text-white hover:bg-primary-600 transition-colors rounded-md text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </motion.nav>
  )
}

export default Navbar