import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name must be less than 50 characters'],
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name must be less than 50 characters'],
  },
  avatar: {
    type: String,
    default: null,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  accountType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'inactive',
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  paypalCustomerId: {
    type: String,
    default: null,
  },
  lastPaymentDate: {
    type: Date,
    default: null,
  },
  paymentHistory: [{
    amount: Number,
    currency: String,
    processor: String,
    transactionId: String,
    status: String,
    planType: String,
    date: { type: Date, default: Date.now },
  }],
  planId: {
    type: String,
    default: null,
  },
  paymentMethod: {
    type: String,
    default: null,
  },
  willCancelAt: {
    type: Date,
    default: null,
  },
  usageStats: {
    dailyGenerations: { type: Number, default: 0 },
    monthlyGenerations: { type: Number, default: 0 },
    totalGenerations: { type: Number, default: 0 },
    lastGenerationDate: { type: Date, default: null },
    lastResetDate: { type: Date, default: Date.now },
    dailyLimit: { type: Number, default: 5 },
    monthlyLimit: { type: Number, default: 50 },
    remainingDaily: { type: Number, default: 5 },
    remainingMonthly: { type: Number, default: 50 },
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio must be less than 200 characters'],
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark',
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
    },
    defaultSigilCategory: {
      type: String,
      enum: ['general', 'love', 'prosperity', 'protection', 'wisdom'],
      default: 'general',
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginDate: {
    type: Date,
    default: null,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referralCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ accountType: 1 });
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ paypalCustomerId: 1 });
userSchema.index({ isActive: 1 });

// Password hashing
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can generate a sigil
userSchema.methods.canGenerateSigil = function () {
  if (this.isPremium || this.accountType === 'premium') {
    return { allowed: true, reason: 'premium' };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (this.usageStats.dailyGenerations >= this.usageStats.dailyLimit) {
    return {
      allowed: false,
      reason: 'daily_limit_reached',
      resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  if (this.usageStats.monthlyGenerations >= this.usageStats.monthlyLimit) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      allowed: false,
      reason: 'monthly_limit_reached',
      resetTime: nextMonth,
    };
  }

  return { allowed: true, reason: 'within_limits' };
};

// Method to increment generation count
userSchema.methods.incrementGenerations = function () {
  if (this.isPremium || this.accountType === 'premium') {
    this.usageStats.totalGenerations += 1;
    this.usageStats.lastGenerationDate = new Date();
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastGenDate = this.usageStats.lastGenerationDate ? new Date(this.usageStats.lastGenerationDate) : null;
  const lastGenToday = lastGenDate && new Date(lastGenDate.getFullYear(), lastGenDate.getMonth(), lastGenDate.getDate());

  if (!lastGenToday || lastGenToday.getTime() !== today.getTime()) {
    this.usageStats.dailyGenerations = 0;
    this.usageStats.remainingDaily = this.usageStats.dailyLimit;
  }

  const lastResetMonth = new Date(this.usageStats.lastResetDate.getFullYear(), this.usageStats.lastResetDate.getMonth());
  const currentMonth = new Date(now.getFullYear(), now.getMonth());
  if (lastResetMonth.getTime() !== currentMonth.getTime()) {
    this.usageStats.monthlyGenerations = 0;
    this.usageStats.remainingMonthly = this.usageStats.monthlyLimit;
    this.usageStats.lastResetDate = now;
  }

  this.usageStats.dailyGenerations += 1;
  this.usageStats.monthlyGenerations += 1;
  this.usageStats.totalGenerations += 1;
  this.usageStats.remainingDaily = Math.max(0, this.usageStats.remainingDaily - 1);
  this.usageStats.remainingMonthly = Math.max(0, this.usageStats.remainingMonthly - 1);
  this.usageStats.lastGenerationDate = now;
};

// Method to upgrade to premium
userSchema.methods.upgradeToPremium = function (subscriptionData) {
  if (!subscriptionData.subscriptionId || !subscriptionData.startDate) {
    throw new Error('subscriptionId and startDate are required');
  }

  this.isPremium = true;
  this.accountType = 'premium';
  this.subscriptionStatus = 'active';
  this.subscriptionId = subscriptionData.subscriptionId;
  this.subscriptionStartDate = new Date(subscriptionData.startDate);
  this.subscriptionEndDate = subscriptionData.endDate ? new Date(subscriptionData.endDate) : null;
  this.paypalCustomerId = subscriptionData.paypalCustomerId || null;
  this.planId = subscriptionData.planId || null;
  this.paymentMethod = subscriptionData.paymentMethod || 'paypal';
  this.lastPaymentDate = new Date();
  this.usageStats = {
    ...this.usageStats,
    dailyLimit: Infinity,
    monthlyLimit: Infinity,
    remainingDaily: Infinity,
    remainingMonthly: Infinity
  };

  if (subscriptionData.payment) {
    this.paymentHistory.push({
      amount: subscriptionData.payment.amount,
      currency: subscriptionData.payment.currency || 'PHP',
      processor: subscriptionData.payment.processor || 'paypal',
      transactionId: subscriptionData.payment.transactionId || subscriptionData.subscriptionId,
      status: subscriptionData.payment.status || 'completed',
      planType: subscriptionData.planType || 'yearly',
      date: new Date()
    });
  }
};

// Method to downgrade to free
userSchema.methods.downgradeToFree = function () {
  this.isPremium = false;
  this.accountType = 'free';
  this.subscriptionStatus = 'inactive';
  this.subscriptionId = null;
  this.subscriptionStartDate = null;
  this.subscriptionEndDate = null;
  this.planId = null;
  this.paymentMethod = null;
  this.willCancelAt = null;
  this.usageStats = {
    ...this.usageStats,
    dailyLimit: 5,
    monthlyLimit: 50,
    remainingDaily: Math.max(0, 5 - this.usageStats.dailyGenerations),
    remainingMonthly: Math.max(0, 50 - this.usageStats.monthlyGenerations)
  };
};

// Method to add payment to history
userSchema.methods.addPaymentRecord = function (paymentData) {
  if (!paymentData.transactionId || !paymentData.amount) {
    throw new Error('transactionId and amount are required');
  }

  this.paymentHistory.push({
    amount: paymentData.amount,
    currency: paymentData.currency || 'PHP',
    processor: paymentData.processor || 'paypal',
    transactionId: paymentData.transactionId,
    status: paymentData.status || 'completed',
    planType: paymentData.planType || 'yearly',
    date: new Date()
  });
  this.lastPaymentDate = new Date();
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    isActive: true,
  });
};

// Static method to find by customer ID
userSchema.statics.findByCustomerId = function (customerId, processor = 'paypal') {
  return this.findOne({ paypalCustomerId: customerId, isActive: true });
};

// Static method to get usage stats
userSchema.statics.getUsageStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        premiumUsers: { $sum: { $cond: [{ $or: [{ $eq: ['$accountType', 'premium'] }, { $eq: ['$isPremium', true] }] }, 1, 0] } },
        freeUsers: { $sum: { $cond: [{ $and: [{ $eq: ['$accountType', 'free'] }, { $eq: ['$isPremium', false] }] }, 1, 0] } },
        totalGenerations: { $sum: '$usageStats.totalGenerations' },
        averageGenerations: { $avg: '$usageStats.totalGenerations' },
      },
    },
  ]);

  return stats[0] || {
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    totalGenerations: 0,
    averageGenerations: 0,
  };
};

export default mongoose.model('User', userSchema);