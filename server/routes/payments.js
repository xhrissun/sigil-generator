import express from 'express'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Simple PayPal integration without external SDK
// You'll need to set up PayPal webhooks and API credentials

// Create PayPal payment order
router.post('/create-paypal-order', authenticate, async (req, res) => {
  try {
    const { planType } = req.body
    const user = req.user

    // Validate inputs
    if (!planType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Plan type is required'
      })
    }

    // Define plan prices
    const plans = {
      monthly: { price: 9.99, name: 'Monthly Premium' },
      yearly: { price: 99.99, name: 'Yearly Premium' },
      lifetime: { price: 299.99, name: 'Lifetime Premium' }
    }

    if (!plans[planType]) {
      return res.status(400).json({
        error: 'Invalid plan',
        message: 'Selected plan is not available'
      })
    }

    const plan = plans[planType]

    // For PayPal integration, you would create an order here
    // This is a simplified version - you'll need to implement actual PayPal API calls
    const orderId = `ORDER_${Date.now()}_${user._id}`
    
    // Store order details temporarily (in a real app, use a database)
    // For now, we'll store in user's temp data
    user.tempOrderData = {
      orderId,
      planType,
      price: plan.price,
      createdAt: new Date()
    }
    await user.save()

    res.json({
      orderId,
      price: plan.price,
      planName: plan.name,
      // PayPal checkout URL - replace with actual PayPal integration
      paypalUrl: `https://www.paypal.com/checkoutnow?token=${orderId}`,
      // For demo purposes, we'll use a simple success URL
      approvalUrl: `${process.env.CLIENT_URL}/upgrade/paypal-success?orderId=${orderId}`
    })

  } catch (error) {
    console.error('PayPal order creation error:', error)
    res.status(500).json({
      error: 'Payment Error',
      message: 'Failed to create payment order. Please try again.'
    })
  }
})

// Handle PayPal success (simplified)
router.post('/paypal-success', authenticate, async (req, res) => {
  try {
    const { orderId, payerID } = req.body
    const user = req.user

    // Verify order exists and belongs to user
    if (!user.tempOrderData || user.tempOrderData.orderId !== orderId) {
      return res.status(400).json({
        error: 'Invalid Order',
        message: 'Order not found or invalid'
      })
    }

    const orderData = user.tempOrderData
    
    // In a real implementation, you would:
    // 1. Verify payment with PayPal API
    // 2. Check payment status
    // 3. Handle subscription creation for recurring payments

    // For demo purposes, we'll simulate successful payment
    const subscriptionData = {
      subscriptionId: `PAYPAL_${Date.now()}`,
      startDate: new Date(),
      endDate: orderData.planType === 'lifetime' ? null : 
               orderData.planType === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) :
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paypalCustomerId: payerID,
      planId: orderData.planType,
      paymentMethod: 'paypal'
    }

    // Upgrade user to premium
    user.upgradeToPremium(subscriptionData)
    
    // Add payment record
    user.addPaymentRecord({
      amount: orderData.price,
      currency: 'USD',
      processor: 'paypal',
      transactionId: orderId,
      status: 'completed',
      planType: orderData.planType
    })

    // Clear temp order data
    user.tempOrderData = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Payment successful! Welcome to Premium!',
      user: {
        id: user._id,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        planType: orderData.planType
      }
    })

  } catch (error) {
    console.error('PayPal success handling error:', error)
    res.status(500).json({
      error: 'Processing Error',
      message: 'Failed to process payment. Please contact support.'
    })
  }
})

// Cancel subscription
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const user = req.user

    if (!user.subscriptionId) {
      return res.status(400).json({
        error: 'No Subscription',
        message: 'No active subscription found'
      })
    }

    // For PayPal subscriptions, you would cancel via PayPal API
    // For now, we'll simulate cancellation
    user.subscriptionStatus = 'cancelled'
    user.willCancelAt = user.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await user.save()

    res.json({
      success: true,
      message: 'Subscription cancelled. Premium access will continue until the end of your billing period.',
      cancelDate: user.willCancelAt
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({
      error: 'Cancellation Error',
      message: 'Failed to cancel subscription. Please try again.'
    })
  }
})

// Get subscription details
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const user = req.user

    res.json({
      success: true,
      subscription: {
        isActive: user.isPremium,
        status: user.subscriptionStatus,
        planType: user.planId,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        willCancelAt: user.willCancelAt,
        paymentMethod: user.paymentMethod
      }
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch subscription details'
    })
  }
})

// Handle PayPal Subscription Approval
router.post('/paypal/approve-subscription', authenticate, async (req, res) => {
  try {
    const { subscriptionID, orderID, userId, email } = req.body
    const user = req.user

    console.log('Approve subscription request:', {
      subscriptionID,
      orderID,
      userId,
      email,
      authenticatedUserId: user._id,
      authenticatedUserEmail: user.email
    })

    if (!subscriptionID || !orderID) {
      return res.status(400).json({ error: 'Missing subscription data' })
    }

    // Verify the user ID matches the authenticated user (if provided)
    if (userId && userId !== user._id.toString()) {
      console.warn('User ID mismatch:', { provided: userId, authenticated: user._id.toString() })
      return res.status(403).json({ error: 'User ID mismatch' })
    }

    // Update user subscription fields using the User model method
    const subscriptionData = {
      subscriptionId: subscriptionID,
      startDate: new Date(),
      endDate: null, // PayPal handles recurring billing
      paypalCustomerId: email || user.email,
      planId: 'paypal-premium',
      paymentMethod: 'paypal',
      payment: {
        amount: 0, // PayPal will handle the actual amount in webhooks
        currency: 'PHP',
        processor: 'paypal',
        transactionId: orderID,
        status: 'completed'
      }
    }

    console.log('Upgrading user to premium:', subscriptionData)

    // Use the User model method
    user.upgradeToPremium(subscriptionData)

    // Save additional PayPal-specific fields
    user.paypalOrderId = orderID
    user.paypalEmail = email || user.email

    await user.save()

    console.log('User successfully upgraded:', {
      id: user._id,
      email: user.email,
      isPremium: user.isPremium,
      subscriptionId: user.subscriptionId
    })

    // Return the updated user object
    res.json({
      _id: user._id,
      id: user._id, // Include both for compatibility
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isPremium: user.isPremium,
      accountType: user.accountType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionId: user.subscriptionId,
      paymentMethod: user.paymentMethod,
      subscriptionStartDate: user.subscriptionStartDate,
      paypalOrderId: user.paypalOrderId,
      paypalEmail: user.paypalEmail
    })

  } catch (error) {
    console.error('Error approving subscription:', error)
    res.status(500).json({ 
      error: 'Failed to approve subscription',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Check PayPal Subscription Status
router.post('/paypal/check-subscription', authenticate, async (req, res) => {
  try {
    const { userId, email } = req.body
    const authenticatedUser = req.user

    console.log('Check subscription request:', { userId, email, authenticatedUserId: authenticatedUser._id })

    // Verify the user ID matches the authenticated user (if provided)
    if (userId && userId !== authenticatedUser._id.toString()) {
      console.warn('User ID mismatch in check subscription:', { provided: userId, authenticated: authenticatedUser._id.toString() })
      return res.status(403).json({ error: 'User ID mismatch' })
    }

    const user = authenticatedUser // Use the authenticated user directly

    // Check if user already has premium status
    if (user.isPremium && user.subscriptionStatus === 'active' && user.subscriptionId) {
      console.log('User already has active subscription:', {
        userId: user._id,
        subscriptionId: user.subscriptionId,
        isPremium: user.isPremium
      })

      return res.json({
        isSubscribed: true,
        subscriptionId: user.subscriptionId,
        planType: user.planId || 'premium',
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        user: {
          _id: user._id,
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isPremium: user.isPremium,
          accountType: user.accountType,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionId: user.subscriptionId,
          paymentMethod: user.paymentMethod
        }
      })
    }

    return res.json({ 
      isSubscribed: false, 
      message: 'No active subscription found',
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPremium: user.isPremium,
        accountType: user.accountType,
        subscriptionStatus: user.subscriptionStatus
      }
    })

  } catch (error) {
    console.error('Check subscription error:', error)
    res.status(500).json({ 
      error: 'Failed to check subscription status',
      message: error.message
    })
  }
})

export default router