import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import paypal from '@paypal/checkout-server-sdk';

import sigilRoutes from './routes/sigils.js';
import authRoutes from './routes/auth.js';
import paymentsRoutes from './routes/payments.js';
import User from './models/User.js'; // Import User model at the top
import { authenticate, optionalAuth, logAuthenticatedRequest } from './middleware/auth.js';

// Explicitly import PayPal SDK components
const { core: paypalCore, subscriptions: paypalSubscriptions, webhooks: paypalWebhooks } = paypal;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// PayPal SDK Configuration
const paypalClient = new paypalCore.PayPalHttpClient(
  new paypalCore.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

app.use('/api/payments', paymentsRoutes);

app.use('/api/payments/paypal/webhook', bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(logAuthenticatedRequest);

app.use('/api/auth', authRoutes);
app.use('/api/sigils', sigilRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      authentication: true,
      premium: true,
      rateLimit: true,
    },
  });
});

// User stats endpoint
app.get('/api/stats/users', authenticate, async (req, res) => {
  try {
    const stats = await User.getUsageStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching statistics',
    });
  }
});

// Webhook handler
app.post('/api/payments/paypal/webhook', async (req, res) => {
  const webhookEvent = req.body;
  console.log('Webhook received:', JSON.stringify(webhookEvent, null, 2));

  try {
    // Skip webhook verification for development/testing
    if (process.env.NODE_ENV !== 'development' && process.env.PAYPAL_WEBHOOK_ID) {
      // Verify webhook signature
      const request = new paypalWebhooks.WebhookVerifySignatureRequest();
      request.requestBody = {
        auth_algo: req.get('Paypal-Auth-Algo'),
        cert_url: req.get('Paypal-Cert-Url'),
        transmission_id: req.get('Paypal-Transmission-Id'),
        transmission_sig: req.get('Paypal-Transmission-Sig'),
        transmission_time: req.get('Paypal-Transmission-Time'),
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent
      };

      const response = await paypalClient.execute(request);
      if (response.result.verification_status !== 'SUCCESS') {
        console.error('Webhook verification failed:', response.result);
        return res.status(400).send('Webhook verification failed');
      }
    }

    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        const userId = webhookEvent.resource.custom_id;
        const user = await User.findById(userId);
        if (!user) {
          console.error(`User not found for ID: ${userId}`);
          return res.status(404).send('User not found');
        }

        const subscriptionData = {
          subscriptionId: webhookEvent.resource.id,
          startDate: new Date(webhookEvent.resource.create_time),
          endDate: webhookEvent.resource.billing_info?.next_billing_time
            ? new Date(webhookEvent.resource.billing_info.next_billing_time)
            : null,
          paypalCustomerId: webhookEvent.resource.subscriber?.email_address || user.email,
          planId: 'paypal-premium',
          paymentMethod: 'paypal',
          payment: {
            amount: webhookEvent.resource.billing_info?.last_payment?.amount?.value || 0,
            currency: webhookEvent.resource.billing_info?.last_payment?.amount?.currency_code || 'PHP',
            processor: 'paypal',
            transactionId: webhookEvent.resource.id,
            status: 'completed'
          }
        };

        user.upgradeToPremium(subscriptionData);
        await user.save();
        console.log(`User ${user.email} upgraded to premium via webhook`);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        const cancelledUser = await User.findOne({ subscriptionId: webhookEvent.resource.id });
        if (cancelledUser) {
          cancelledUser.subscriptionStatus = 'cancelled';
          cancelledUser.willCancelAt = cancelledUser.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await cancelledUser.save();
          console.log(`User ${cancelledUser.email} subscription cancelled via webhook`);
        }
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        const suspendedUser = await User.findOne({ subscriptionId: webhookEvent.resource.id });
        if (suspendedUser) {
          suspendedUser.subscriptionStatus = 'inactive';
          suspendedUser.isPremium = false;
          suspendedUser.accountType = 'free';
          suspendedUser.downgradeToFree();
          await suspendedUser.save();
          console.log(`User ${suspendedUser.email} subscription suspended via webhook`);
        }
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        const expiredUser = await User.findOne({ subscriptionId: webhookEvent.resource.id });
        if (expiredUser) {
          expiredUser.subscriptionStatus = 'expired';
          expiredUser.isPremium = false;
          expiredUser.accountType = 'free';
          expiredUser.downgradeToFree();
          await expiredUser.save();
          console.log(`User ${expiredUser.email} subscription expired via webhook`);
        }
        break;

      case 'PAYMENT.SALE.COMPLETED':
        console.log('Payment completed:', webhookEvent.resource);
        const paymentUser = await User.findOne({ subscriptionId: webhookEvent.resource.billing_agreement_id });
        if (paymentUser) {
          paymentUser.addPaymentRecord({
            amount: parseFloat(webhookEvent.resource.amount.total),
            currency: webhookEvent.resource.amount.currency,
            processor: 'paypal',
            transactionId: webhookEvent.resource.id,
            status: 'completed',
            planType: 'subscription'
          });
          await paymentUser.save();
        }
        break;

      default:
        console.log('Unhandled event type:', webhookEvent.event_type);
    }

    return res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Webhook processing failed');
  }
});

// Demo users for development
if (process.env.NODE_ENV === 'development') {
  app.post('/api/demo/create-users', async (req, res) => {
    try {
      const freeUser = new User({
        username: 'demo_free',
        email: 'demo@free.com',
        password: 'password123',
        firstName: 'Free',
        lastName: 'User',
        accountType: 'free',
        isEmailVerified: true,
      });

      const premiumUser = new User({
        username: 'demo_premium',
        email: 'demo@premium.com',
        password: 'password123',
        firstName: 'Premium',
        lastName: 'User',
        accountType: 'premium',
        isPremium: true,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isEmailVerified: true,
      });

      await freeUser.save();
      await premiumUser.save();

      res.json({
        success: true,
        message: 'Demo users created successfully',
        users: [
          { username: 'demo_free', email: 'demo@free.com', password: 'password123', type: 'free' },
          { username: 'demo_premium', email: 'demo@premium.com', password: 'password123', type: 'premium' },
        ],
      });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Demo users already exist',
        });
      } else {
        console.error('Demo user creation error:', error);
        res.status(500).json({
          success: false,
          message: 'Error creating demo users',
        });
      }
    }
  });
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      details: error.errors,
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not valid',
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: `A user with this ${field} already exists`,
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided authentication token is invalid',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Your session has expired. Please log in again.',
    });
  }

  res.status(error.statusCode || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});



app.listen(PORT, () => {
  console.log(`
🚀 Sigil Generator Server running!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}
🔐 Authentication: Enabled
💎 Premium Features: Enabled
⏰ Started at: ${new Date().toISOString()}
  `);

  if (process.env.NODE_ENV === 'development') {
    console.log(`
📋 Development Features:
- Demo users: POST /api/demo/create-users
- User stats: GET /api/stats/users (requires auth)
- Health check: GET /api/health
    `);
  }
});