import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Crown, Zap, Sparkles, Check, X, Star, Infinity, Shield, Headphones, Download, Palette, Lock, ArrowLeft, AlertCircle, Loader, CheckCircle
} from 'lucide-react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useAuth } from '../contexts/AuthContext';
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";

const Upgrade = () => {
  const { user, isPremium, upgradeToPremium, isAuthenticated, refreshAuth } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const processingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // PayPal configuration
  const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "PHP",
    intent: "subscription",
    vault: true,
    components: "buttons",
    debug: import.meta.env.NODE_ENV === 'development',
  };

  // Plans configuration
  const plans = {
    monthly: {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 99.00,
      billingCycle: 'month',
      description: 'Perfect for regular sigil creators',
      popular: false,
      planId: import.meta.env.VITE_PAYPAL_MONTHLY_PLAN_ID,
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 999.99,
      originalPrice: 1188.00,
      billingCycle: 'year',
      description: 'Best value - save 2 months!',
      popular: true,
      savings: 16,
      planId: import.meta.env.VITE_PAYPAL_YEARLY_PLAN_ID,
    },
    lifetime: {
      id: 'lifetime',
      name: 'Lifetime Premium',
      price: 4999.00,
      billingCycle: 'once',
      description: 'One-time payment, lifetime access',
      popular: false,
      planId: import.meta.env.VITE_PAYPAL_LIFETIME_PLAN_ID,
    },
  };

  // Features configuration
  const features = {
    free: [
      { name: '5 sigils per day', included: true },
      { name: '50 sigils per month', included: true },
      { name: 'Basic sigil patterns', included: true },
      { name: 'Standard export formats', included: true },
      { name: 'Community access', included: true },
      { name: 'Ads displayed', included: false, isNegative: true },
      { name: 'Advanced patterns', included: false },
      { name: 'Unlimited generations', included: false },
      { name: 'Priority support', included: false },
      { name: 'Exclusive features', included: false },
    ],
    premium: [
      { name: 'Unlimited sigil generation', included: true, icon: Infinity },
      { name: 'Advanced sacred geometry patterns', included: true, icon: Sparkles },
      { name: 'No ads', included: true, icon: Shield },
      { name: 'All export formats (PNG, SVG, PDF)', included: true, icon: Download },
      { name: 'Custom color schemes', included: true, icon: Palette },
      { name: 'Priority customer support', included: true, icon: Headphones },
      { name: 'Early access to new features', included: true, icon: Star },
      { name: 'Advanced sigil customization', included: true, icon: Zap },
      { name: 'Batch generation tools', included: true, icon: Crown },
      { name: 'Personal sigil library backup', included: true, icon: Shield },
    ],
  };

  // Validate PayPal configuration
  const isPayPalConfigValid = () => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const currentPlan = plans[selectedPlan];
    
    if (!clientId) {
      console.error('VITE_PAYPAL_CLIENT_ID is missing');
      return false;
    }
    
    if (!currentPlan?.planId) {
      console.error(`Plan ID missing for ${selectedPlan}`);
      return false;
    }
    
    return true;
  };

  // Manual subscription verification
  const handleVerifySubscription = useCallback(async () => {
    if (!mountedRef.current || processingRef.current) {
      console.log('Component unmounted or already processing, skipping verification');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/payments/paypal/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Subscription check failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Subscription check result:', result);

      if (result.isSubscribed && mountedRef.current) {
        await upgradeToPremium({
          subscriptionId: result.subscriptionId,
          planType: result.planType || 'yearly',
          paypalCustomerId: user.paypalCustomerId || 'unknown',
          startDate: new Date(result.startDate),
          endDate: result.endDate ? new Date(result.endDate) : null,
          paymentMethod: 'paypal',
        });
        await refreshAuth();
        setSuccess('Subscription verified! Your premium features are now active.');
      } else {
        setError('No active subscription found. Please try subscribing again.');
      }
    } catch (err) {
      console.error('Subscription verification error:', err);
      if (mountedRef.current) {
        setError(`Failed to verify subscription: ${err.message}`);
      }
    } finally {
      processingRef.current = false;
      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [user, upgradeToPremium, refreshAuth]);

  // Handle successful payment redirect
  useEffect(() => {
    if (!mountedRef.current) return;
    
    const successParam = searchParams.get('success');
    const subscriptionId = searchParams.get('subscriptionId');
    
    console.log('=== URL PARAMS CHECK ===');
    console.log('Success:', successParam);
    console.log('Subscription ID:', subscriptionId);
    console.log('User premium status:', isPremium);
    
    if (successParam === 'true' && subscriptionId && !isPremium && !processingRef.current) {
      console.log('Processing successful subscription from URL...');
      processingRef.current = true;
      
      if (mountedRef.current) {
        setSuccess('Subscription successful! Your premium features are now active.');
        
        upgradeToPremium({
          subscriptionId,
          planType: selectedPlan,
          paypalCustomerId: user?.paypalCustomerId || 'unknown',
          startDate: new Date(),
          endDate: selectedPlan === 'lifetime' ? null : new Date(Date.now() + (selectedPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
          paymentMethod: 'paypal',
        }).then(() => {
          if (mountedRef.current) {
            refreshAuth();
          }
        });
      }
    } else if (successParam === 'false') {
      if (mountedRef.current) {
        setError('Subscription was cancelled or failed. Please try again.');
      }
    }
  }, [searchParams, user, selectedPlan, upgradeToPremium, isPremium, refreshAuth]);

  // PayPal approval handler
  const handlePayPalApprove = useCallback(async (data) => {
    if (!mountedRef.current || processingRef.current) {
      console.log('Component unmounted or already processing, skipping approval');
      return;
    }

    console.log('=== PAYPAL APPROVAL START ===');
    console.log('Subscription ID:', data.subscriptionID);
    console.log('Selected plan:', selectedPlan);
    console.log('User ID:', user?.id);
    
    if (!user || !isAuthenticated) {
      if (mountedRef.current) {
        setError('Please log in to complete your subscription.');
      }
      return;
    }

    if (!data.subscriptionID) {
      if (mountedRef.current) {
        setError('Invalid subscription data received from PayPal.');
      }
      return;
    }

    processingRef.current = true;
    
    if (mountedRef.current) {
      setIsProcessing(true);
      setError('');
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch('/api/payments/paypal/verify-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          subscriptionID: data.subscriptionID, 
          planType: selectedPlan,
          userId: user.id
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Backend verification response:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Backend verification failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Verification successful:', result);
      
      if (!mountedRef.current) {
        console.log('Component unmounted during verification, aborting');
        return;
      }
      
      await upgradeToPremium({
        subscriptionId: data.subscriptionID,
        planType: selectedPlan,
        paypalCustomerId: user.paypalCustomerId || 'unknown',
        startDate: new Date(),
        endDate: selectedPlan === 'lifetime' ? null : new Date(Date.now() + (selectedPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        paymentMethod: 'paypal',
      });
      
      if (mountedRef.current) {
        await refreshAuth();
        setSuccess('Subscription successful! Your premium features are now active.');
        
        setTimeout(() => {
          if (mountedRef.current) {
            navigate(`/upgrade?success=true&subscriptionId=${data.subscriptionID}`, { replace: true });
          }
        }, 2000);
      }
      
    } catch (err) {
      console.error('=== PAYPAL APPROVAL ERROR ===');
      console.error('Error:', err);
      
      if (mountedRef.current) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError(`Subscription verification failed: ${err.message}`);
        }
      }
    } finally {
      processingRef.current = false;
      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [user, selectedPlan, upgradeToPremium, isAuthenticated, navigate, refreshAuth]);

  // PayPal error handler
  const handlePayPalError = useCallback((err) => {
    if (!mountedRef.current) return;
    
    console.error('=== PAYPAL ERROR ===');
    console.error('Error details:', err);
    
    let errorMessage = 'Payment failed. Please try again or contact support.';
    
    if (err && typeof err === 'object') {
      if (err.message) {
        errorMessage = `Payment failed: ${err.message}`;
      } else if (err.name === 'VALIDATION_ERROR') {
        errorMessage = 'Invalid payment information. Please check your details and try again.';
      } else if (err.name === 'INSTRUMENT_DECLINED') {
        errorMessage = 'Payment method declined. Please try a different payment method.';
      }
    }
    
    setError(errorMessage);
    setIsProcessing(false);
    processingRef.current = false;
  }, []);

  // PayPal cancel handler
  const handlePayPalCancel = useCallback((data) => {
    if (!mountedRef.current) return;
    
    console.log('PayPal subscription cancelled:', data);
    
    setError('Subscription was cancelled. Please try again.');
    setIsProcessing(false);
    processingRef.current = false;
  }, []);

  // JSX
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="min-h-screen pt-16 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden"
            animate="visible"
          >
            <Link to="/dashboard" className="inline-flex items-center text-primary-300 hover:text-primary-400 mb-8">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-4xl md:text-5xl font-mystical font-bold text-gradient text-center mb-12"
            >
              Unlock the Power of Premium
            </motion.h1>

            {success && (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center"
              >
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-300">{success}</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center"
              >
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-300">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-4 text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* Plan Selection */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {Object.values(plans).map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`card cursor-pointer transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'border-primary-500 bg-gradient-to-br from-primary-500/20 to-purple-500/20'
                      : 'border-dark-600'
                  } ${plan.popular ? 'relative overflow-hidden' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-mystical font-semibold text-primary-300 mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-white mb-2">
                    ₱{plan.price.toFixed(2)}
                    <span className="text-sm text-gray-400">/{plan.billingCycle}</span>
                  </p>
                  {plan.originalPrice && (
                    <p className="text-sm text-gray-400 line-through mb-2">₱{plan.originalPrice.toFixed(2)}/year</p>
                  )}
                  {plan.savings && (
                    <p className="text-sm text-green-400 mb-4">Save {plan.savings}%</p>
                  )}
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="flex items-center justify-center">
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === plan.id}
                      onChange={() => setSelectedPlan(plan.id)}
                      className="h-5 w-5 text-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* PayPal Payment Button */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="max-w-md mx-auto mb-16">
              <div className="card">
                {isPremium ? (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-300">You are already a Premium member!</p>
                    <Link to="/dashboard" className="btn-primary mt-4 inline-block">
                      Back to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-primary-300 mb-2">
                        Subscribe to {plans[selectedPlan].name}
                      </h3>
                      <p className="text-3xl font-bold text-white">
                        ₱{plans[selectedPlan].price.toFixed(2)}
                        <span className="text-sm text-gray-400">/{plans[selectedPlan].billingCycle}</span>
                      </p>
                    </div>

                    {isProcessing ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader className="h-6 w-6 animate-spin text-primary-400 mr-2" />
                        <span className="text-gray-300">Processing subscription...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <PayPalSubscriptionButton
                          key={`${selectedPlan}-${plans[selectedPlan].planId}`}
                          planId={plans[selectedPlan].planId}
                          onApprove={handlePayPalApprove}
                          onError={handlePayPalError}
                          onCancel={handlePayPalCancel}
                          disabled={isProcessing || !plans[selectedPlan].planId}
                          user={user}
                        />
                        
                        {import.meta.env.NODE_ENV === 'development' && (
                          <button
                            onClick={handleVerifySubscription}
                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                          >
                            Verify Subscription Status
                          </button>
                        )}
                        
                        {import.meta.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-500 p-2 bg-gray-800 rounded">
                            <p>Plan ID: {plans[selectedPlan].planId || 'Missing'}</p>
                            <p>Client ID: {import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'Set' : 'Missing'}</p>
                            <p>User ID: {user?.id || 'Missing'}</p>
                            <p>User Email: {user?.email || 'Missing'}</p>
                            <p>Premium Status: {isPremium ? 'True' : 'False'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>

            {/* Feature Comparison */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-16">
              <h2 className="text-2xl font-mystical font-semibold mb-8 text-gradient text-center">
                Feature Comparison
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="text-xl font-mystical font-semibold mb-6 text-center text-gray-300">
                    Free Account
                  </h3>
                  <div className="space-y-3">
                    {features.free.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <X className={`h-5 w-5 flex-shrink-0 ${feature.isNegative ? 'text-red-400' : 'text-gray-500'}`} />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-300' : feature.isNegative ? 'text-red-300' : 'text-gray-500'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-primary-500/10 to-purple-500/10 border-primary-500/30">
                  <h3 className="text-xl font-mystical font-semibold mb-6 text-center text-primary-300">
                    Premium Account
                  </h3>
                  <div className="space-y-3">
                    {features.premium.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="p-1 rounded bg-primary-500/20">
                            <Icon className="h-4 w-4 text-primary-400 flex-shrink-0" />
                          </div>
                          <span className="text-sm text-gray-300">{feature.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Money Back Guarantee */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-center mb-16">
              <div className="card bg-green-500/10 border-green-500/20">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-300 mb-2">
                  30-Day Money-Back Guarantee
                </h3>
                <p className="text-gray-300">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h2 className="text-2xl font-mystical font-semibold mb-8 text-gradient text-center">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold text-primary-300 mb-2">Can I cancel anytime?</h3>
                  <p className="text-gray-400 text-sm">
                    Yes! You can cancel your subscription at any time. You'll keep premium features until the end of your billing period.
                  </p>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-primary-300 mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-400 text-sm">
                    We accept payments through PayPal, including credit cards and PayPal balance.
                  </p>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-primary-300 mb-2">Do I keep my sigils if I downgrade?</h3>
                  <p className="text-gray-400 text-sm">
                    Yes! All sigils you've created remain yours forever. You'll just be limited to the free tier generation limits going forward.
                  </p>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-primary-300 mb-2">Is my payment information secure?</h3>
                  <p className="text-gray-400 text-sm">
                    Absolutely! We use PayPal for payment processing, which is trusted by millions of businesses worldwide.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Upgrade;