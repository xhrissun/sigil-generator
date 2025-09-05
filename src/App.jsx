import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SigilGenerator from './pages/SigilGenerator'
import TarotGenerator from './pages/TarotGenerator'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Upgrade from './pages/Upgrade'
import Dashboard from './routes/Dashboard'
import ProtectedRoute, { AuthRoute, GuestRoute } from './components/ProtectedRoute'
import AdDisplay, { useInterstitialAd } from './components/AdDisplay'

// Debug component to monitor auth state
const AuthDebugger = () => {
  const { user, loading, initialized, isAuthenticated, isPremium } = useAuth();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-xs z-50 border border-gray-600">
      <h4 className="font-bold mb-2 text-green-400">Auth Debug:</h4>
      <div className="space-y-1">
        <p>Loading: <span className={loading ? 'text-red-400' : 'text-green-400'}>{loading.toString()}</span></p>
        <p>Initialized: <span className={initialized ? 'text-green-400' : 'text-red-400'}>{initialized.toString()}</span></p>
        <p>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated.toString()}</span></p>
        <p>Premium: <span className={isPremium ? 'text-green-400' : 'text-red-400'}>{isPremium.toString()}</span></p>
        <p>User: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? (user.email || user._id) : 'null'}</span></p>
        <p>Token: <span className={localStorage.getItem('token') ? 'text-green-400' : 'text-red-400'}>{localStorage.getItem('token') ? 'Present' : 'Missing'}</span></p>
        <p>URL: <span className="text-blue-400">{window.location.pathname}</span></p>
      </div>
      <button 
        onClick={() => {
          console.log('=== FULL AUTH STATE ===');
          console.log('User:', user);
          console.log('Loading:', loading);
          console.log('Initialized:', initialized);
          console.log('Token:', localStorage.getItem('token'));
          console.log('RefreshToken:', localStorage.getItem('refreshToken'));
          console.log('Current URL:', window.location.href);
        }}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs w-full hover:bg-blue-700"
      >
        Log Full State
      </button>
      <button 
        onClick={() => {
          console.log('🧹 Clearing localStorage manually...');
          localStorage.clear();
          window.location.reload();
        }}
        className="mt-1 px-2 py-1 bg-red-600 rounded text-xs w-full hover:bg-red-700"
      >
        Clear & Reload
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/sigil-generator">
        <div className="min-h-screen bg-dark-900 relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
            <div className="floating-particles" />
          </div>
          
          <div className="relative z-10">
            <Navbar />
            <main className="min-h-screen">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route 
                    path="/login" 
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <GuestRoute>
                        <Register />
                      </GuestRoute>
                    } 
                  />
                  <Route 
                    path="/generator" 
                    element={
                      <AuthRoute>
                        <SigilGeneratorWithAds />
                      </AuthRoute>
                    } 
                  />
                  <Route 
                    path="/tarot" 
                    element={
                      <AuthRoute>
                        <TarotGeneratorWithAds />
                      </AuthRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <AuthRoute>
                        <Dashboard />
                      </AuthRoute>
                    } 
                  />
                  <Route 
                    path="/upgrade" 
                    element={
                      <AuthRoute>
                        <Upgrade />
                      </AuthRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
          
          <InterstitialAdManager />
          
          {process.env.NODE_ENV === 'development' && <AuthDebugger />}
        </div>
      </Router>
    </AuthProvider>
  )
}

const SigilGeneratorWithAds = () => {
  return (
    <div>
      <div className="px-4 pt-20 pb-4">
        <div className="max-w-6xl mx-auto">
          <AdDisplay placement="banner" />
        </div>
      </div>
      
      <SigilGenerator />
      
      <div className="px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <AdDisplay placement="banner" />
        </div>
      </div>
    </div>
  )
}

const TarotGeneratorWithAds = () => {
  return (
    <div>
      <div className="px-4 pt-20 pb-4">
        <div className="max-w-6xl mx-auto">
          <AdDisplay placement="banner" />
        </div>
      </div>
      
      <TarotGenerator />
      
      <div className="px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <AdDisplay placement="banner" />
        </div>
      </div>
    </div>
  )
}

const InterstitialAdManager = () => {
  const { showInterstitial, closeInterstitial } = useInterstitialAd()
  
  return showInterstitial ? (
    <AdDisplay 
      placement="interstitial" 
      onClose={closeInterstitial}
    />
  ) : null
}

const NotFound = () => {
  return (
    <div className="min-h-screen pt-16 py-20 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-6xl font-mystical font-bold text-gradient mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-8">
          This mystical page has vanished into the ethereal realm
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Return to Reality
        </motion.button>
      </motion.div>
    </div>
  )
}

export default App