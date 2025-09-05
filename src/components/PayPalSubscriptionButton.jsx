import React, { useState, useEffect, useCallback } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader, AlertCircle, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PayPalSubscriptionButton = ({ planId, onApprove, onError, onCancel, disabled, user }) => {
  const [{ isPending, isRejected }, paypalDispatch] = usePayPalScriptReducer();
  const { refreshAuth } = useAuth(); // Use refreshAuth instead of setUser
  const [buttonError, setButtonError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user || (!user._id && !user.id) || !user.email) {
        console.log('User data incomplete:', { user });
        return;
      }

      try {
        const userId = user._id || user.id;
        console.log('Checking subscription for user:', userId);
        
        const response = await fetch('/api/payments/paypal/check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: userId,
            email: user.email,
          }),
        });
        
        const result = await response.json();
        console.log('Check subscription response:', result);
        
        if (result.isSubscribed) {
          setHasActiveSubscription(true);
          // Refresh the auth context to get updated user data
          if (refreshAuth) {
            await refreshAuth();
          }
        }
      } catch (err) {
        console.error('Check subscription error:', err);
        setButtonError('Failed to verify subscription status. Please try again.');
      }
    };

    checkExistingSubscription();
  }, [user, refreshAuth]);

  const createSubscription = useCallback(
    async (data, actions) => {
      if (hasActiveSubscription) {
        setButtonError('You already have an active subscription. Please check your account status.');
        return Promise.reject(new Error('Active subscription exists'));
      }

      if (!user?.id && !user?._id || !user?.email) {
        setButtonError('User data is missing. Please log in again.');
        return Promise.reject(new Error('Missing user data'));
      }

      setIsProcessing(true);
      try {
        const userId = user._id || user.id;
        console.log('Creating PayPal subscription:', { planId, userId, email: user.email });
        const subscription = await actions.subscription.create({
          plan_id: planId,
          custom_id: userId,
          application_context: {
            brand_name: 'Sigil Generator Premium',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${window.location.origin}/upgrade?success=true`,
            cancel_url: `${window.location.origin}/upgrade?success=false`,
          },
          subscriber: {
            name: { given_name: user.firstName || 'User', surname: user.lastName || '' },
            email_address: user.email,
          },
        });
        console.log('Subscription created:', subscription);
        return subscription;
      } catch (error) {
        console.error('Create subscription error:', error);
        setIsProcessing(false);
        if (error.message.includes('no ack for postMessage') || error.message.includes('No ack for postMessage')) {
          setButtonError('PayPal timed out. You may already have an active subscription or a popup was blocked. Please check your PayPal account or try again.');
        } else {
          setButtonError(`Failed to create subscription: ${error.message}. Please try again or contact support.`);
        }
        throw error;
      }
    },
    [planId, user, hasActiveSubscription]
  );

  const handleApprove = async (data, actions) => {
    setIsProcessing(true);
    try {
      console.log('PayPal subscription approved:', data);

      // Use consistent user ID field
      const userId = user._id || user.id;
      
      if (!userId) {
        throw new Error('User ID is missing');
      }

      console.log('Sending approval request:', {
        subscriptionID: data.subscriptionID,
        orderID: data.orderID,
        userId: userId,
        email: user.email,
      });

      // Tell backend to update subscription
      const response = await fetch('/api/payments/paypal/approve-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          subscriptionID: data.subscriptionID,
          orderID: data.orderID,
          userId: userId,
          email: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(`Backend failed to approve subscription: ${errorData.message || response.statusText}`);
      }
      
      const updatedUser = await response.json();
      console.log('Backend response:', updatedUser);

      // Update frontend auth state
      setHasActiveSubscription(true);
      
      // Refresh the auth context to get updated user data
      if (refreshAuth) {
        await refreshAuth();
      }

      console.log('✅ Subscription processed, user updated');

      if (onApprove) onApprove(data);
    } catch (error) {
      console.error('Approval error:', error);
      setButtonError(`Subscription approval failed: ${error.message}. Please try again or contact support.`);
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error) => {
    console.error('PayPal button error:', error);
    setIsProcessing(false);
    setButtonError(`Payment error: ${error.message}. Please try again or check your PayPal account.`);
    if (onError) onError(error);
  };

  const handleCancel = () => {
    setIsProcessing(false);
    setButtonError('Subscription cancelled. Please try again if needed.');
    if (onCancel) onCancel();
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-6 w-6 animate-spin text-primary-400 mr-2" />
        <span className="text-gray-300">Loading PayPal...</span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center text-red-400 mb-2">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span className="font-semibold">PayPal Service Error</span>
        </div>
        <p className="text-red-300 text-sm">PayPal failed to load. Please reload the page or try again later.</p>
      </div>
    );
  }

  if (hasActiveSubscription) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center text-green-400 mb-2">
          <CheckCircle className="h-6 w-6 mr-2" />
          <span className="font-semibold">Active Subscription</span>
        </div>
        <p className="text-green-300 text-sm">You already have an active subscription. Premium features are enabled.</p>
      </div>
    );
  }

  if (buttonError) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center text-red-400 mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-semibold">Payment Error</span>
        </div>
        <p className="text-red-300 text-sm mb-3">{buttonError}</p>
        <button
          onClick={() => {
            setButtonError(null);
            setIsProcessing(false);
            paypalDispatch({ type: 'resetOptions', value: { currency: 'PHP', intent: 'subscription' } });
          }}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center justify-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
        <a
          href="https://www.sandbox.paypal.com/signin"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center justify-center mt-2"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Check PayPal Sandbox
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
          <Loader className="h-6 w-6 animate-spin text-primary-400" />
        </div>
      )}
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe', height: 50 }}
        disabled={disabled || !planId || (!user?.id && !user?._id) || !user?.email || isProcessing}
        createSubscription={createSubscription}
        onApprove={handleApprove}
        onError={handleError}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default PayPalSubscriptionButton;