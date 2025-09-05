import express from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Helper to get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('PayPal access token error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
};

// Verify PayPal payment
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { orderID, planType } = req.body;
    const accessToken = await getPayPalAccessToken();

    const response = await axios.get(`${PAYPAL_API}/v2/checkout/orders/${orderID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const order = response.data;

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment not completed', message: 'Payment is not in a completed state' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'User not found' });
    }

    const amount = parseFloat(order.purchase_units[0].amount.value);
    const currency = order.purchase_units[0].amount.currency_code;
    const paypalCustomerId = order.payer.payer_id;

    user.addPaymentRecord({
      amount,
      currency,
      processor: 'paypal',
      transactionId: orderID,
      status: 'completed',
      planType,
    });

    user.upgradeToPremium({
      subscriptionId: orderID,
      paypalCustomerId,
      startDate: new Date(),
      endDate: planType === 'lifetime' ? null : new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      planId: process.env[`PAYPAL_${planType.toUpperCase()}_PLAN_ID`] || `P-${planType.toUpperCase()}-TEST`,
      paymentMethod: 'paypal',
    });

    await user.save();

    res.json({ success: true, message: 'Payment verified and subscription updated' });
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Server Error', message: 'Failed to verify payment' });
  }
});

// Upgrade to premium
router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const { subscriptionId, paypalCustomerId, startDate, endDate, planId, paymentMethod } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'User not found' });
    }

    user.upgradeToPremium({
      subscriptionId,
      paypalCustomerId,
      startDate,
      endDate,
      planId,
      paymentMethod,
    });

    await user.save();

    res.json({ success: true, message: 'Upgraded to premium successfully' });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to upgrade subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'User not found' });
    }

    if (user.subscriptionStatus !== 'active') {
      return res.status(400).json({ error: 'Invalid subscription', message: 'No active subscription to cancel' });
    }

    const accessToken = await getPayPalAccessToken();
    await axios.post(
      `${PAYPAL_API}/v1/billing/subscriptions/${user.subscriptionId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    user.subscriptionStatus = 'cancelled';
    user.willCancelAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Subscription cancelled successfully', cancelDate: user.willCancelAt });
  } catch (error) {
    console.error('Cancel subscription error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Server Error', message: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'User not found' });
    }

    if (user.subscriptionStatus !== 'cancelled') {
      return res.status(400).json({ error: 'Invalid subscription', message: 'Subscription is not cancelled' });
    }

    const accessToken = await getPayPalAccessToken();
    await axios.post(
      `${PAYPAL_API}/v1/billing/subscriptions/${user.subscriptionId}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    user.subscriptionStatus = 'active';
    user.willCancelAt = null;
    await user.save();

    res.json({ success: true, message: 'Subscription reactivated successfully' });
  } catch (error) {
    console.error('Reactivate subscription error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Server Error', message: 'Failed to reactivate subscription' });
  }
});

// Get payment methods (simplified for PayPal)
router.get('/payment-methods', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'User not found' });
    }

    res.json({
      success: true,
      paymentMethods: user.paymentMethod ? [{ type: user.paymentMethod, processor: 'paypal' }] : [],
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch payment methods' });
  }
});

export default router;