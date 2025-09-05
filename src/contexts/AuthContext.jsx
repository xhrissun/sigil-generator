import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authAPI from '../api/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Helper function to clear all auth data
  const clearAuthData = () => {
    console.log('Clearing authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('subscriptionData');
    authAPI.clearAuthToken();
    setUser(null);
  };

  // Helper function to sync usage stats from API
  const syncUsageStats = async () => {
    try {
      if (!user) return;
      
      const response = await authAPI.getCurrentUser();
      let userData;
      if (response.data && response.data.user) {
        userData = response.data.user;
      } else if (response.user) {
        userData = response.user;
      } else if (response.data) {
        userData = response.data;
      } else {
        userData = response;
      }

      if (userData && userData.usageStats) {
        setUser(prevUser => ({
          ...prevUser,
          usageStats: userData.usageStats
        }));
      }
    } catch (error) {
      console.error('Error syncing usage stats:', error);
    }
  };

  // Helper function to get usage stats from API using new endpoint
  const getUsageStats = async () => {
    try {
      const response = await authAPI.getUsageStats();
      return { 
        success: true, 
        data: { 
          usageStats: response.data?.usageStats || response.usageStats 
        } 
      };
    } catch (error) {
      console.error('Get usage stats error:', error);
      throw error;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('=== AUTH INITIALIZATION START ===');
        
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        console.log('Token exists:', !!token);
        console.log('Refresh token exists:', !!refreshToken);
        
        if (token) {
          console.log('Checking token validity...');
          
          if (authAPI.isTokenExpired(token)) {
            console.log('Token is expired');
            
            if (refreshToken) {
              console.log('Attempting token refresh...');
              try {
                const response = await authAPI.refreshToken(refreshToken);
                const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
                
                console.log('Token refresh successful');
                localStorage.setItem('token', newToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                authAPI.setAuthToken(newToken);
                setUser(userData);
                
                // Sync usage stats after successful auth
                setTimeout(syncUsageStats, 1000);
              } catch (refreshError) {
                console.log('Token refresh failed:', refreshError);
                clearAuthData();
              }
            } else {
              console.log('No refresh token available, clearing auth');
              clearAuthData();
            }
          } else {
            console.log('Token is valid, fetching user data...');
            
            try {
              authAPI.setAuthToken(token);
              const response = await authAPI.getCurrentUser();
              
              let userData;
              if (response.data && response.data.user) {
                userData = response.data.user;
              } else if (response.user) {
                userData = response.user;
              } else if (response.data) {
                userData = response.data;
              } else {
                userData = response;
              }
              
              console.log('User data extracted:', {
                id: userData?._id,
                email: userData?.email,
                isPremium: userData?.isPremium,
                usageStats: userData?.usageStats
              });
              
              if (userData && (userData._id || userData.id)) {
                setUser(userData);
                // Sync usage stats after user is set
                setTimeout(syncUsageStats, 1000);
              } else {
                console.log('Invalid user data structure, clearing auth');
                clearAuthData();
              }
            } catch (userError) {
              console.log('Failed to fetch user data:', userError);
              
              if (userError.response?.status === 401 && refreshToken) {
                console.log('Got 401, attempting token refresh...');
                try {
                  const response = await authAPI.refreshToken(refreshToken);
                  const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
                  
                  console.log('Token refresh after 401 successful');
                  localStorage.setItem('token', newToken);
                  localStorage.setItem('refreshToken', newRefreshToken);
                  authAPI.setAuthToken(newToken);
                  setUser(userData);
                  setTimeout(syncUsageStats, 1000);
                } catch (refreshError) {
                  console.log('Token refresh after 401 failed:', refreshError);
                  clearAuthData();
                }
              } else {
                clearAuthData();
              }
            }
          }
        } else {
          console.log('No access token found, user not authenticated');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        if (!error.message?.includes('Network Error') && error.code !== 'NETWORK_ERROR') {
          console.log('Clearing auth data due to initialization error');
          clearAuthData();
        } else {
          console.log('Network error detected, keeping auth state');
        }
      } finally {
        console.log('Auth initialization complete');
        console.log('Final state - User exists:', !!user);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        console.log('Token expiring soon, refreshing...');
        refreshAuthToken();
      }
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }, [user]);

  // Check subscription status
  useEffect(() => {
    if (!user || !user.isPremium) return;

    const checkSubscriptionStatus = async () => {
      try {
        const now = new Date();
        const subscriptionEndDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;

        if (subscriptionEndDate && now > subscriptionEndDate && user.subscriptionEndDate !== null) {
          console.log('Subscription expired, downgrading to free');
          downgradeToFree();
          alert('Your premium subscription has expired. You have been downgraded to the free plan.');
        }
      } catch (error) {
        console.error('Subscription check error:', error);
      }
    };

    checkSubscriptionStatus();
    const interval = setInterval(checkSubscriptionStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (identifier, password) => {
    try {
      console.log('Attempting login...');
      const response = await authAPI.login(identifier, password);
      console.log('Login response:', response);
      
      let tokenData, userData;
      if (response.data) {
        tokenData = response.data;
        userData = response.data.user;
      } else {
        tokenData = response;
        userData = response.user;
      }

      const { token, refreshToken } = tokenData;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      authAPI.setAuthToken(token);
      setUser(userData);

      // Sync usage stats after login
      setTimeout(syncUsageStats, 1000);

      console.log('Login successful', { user: userData });
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration...');
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      let tokenData, newUser;
      if (response.data) {
        tokenData = response.data;
        newUser = response.data.user;
      } else {
        tokenData = response;
        newUser = response.user;
      }

      const { token, refreshToken } = tokenData;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      authAPI.setAuthToken(token);
      setUser(newUser);

      // Sync usage stats after registration
      setTimeout(syncUsageStats, 1000);

      console.log('Registration successful');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthData();
      console.log('Logout complete');
    }
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Refreshing auth token...');
      const response = await authAPI.refreshToken(refreshToken);
      const { token, refreshToken: newRefreshToken, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      authAPI.setAuthToken(token);
      setUser(userData);

      console.log('Token refresh successful');
      return { success: true };
    } catch (error) {
      console.error('Refresh token error:', error);
      clearAuthData();
      throw error;
    }
  };

  const upgradeToPremium = async (subscriptionData) => {
    try {
      console.log('Upgrading to premium...', subscriptionData);
      
      const response = await fetch('/api/payments/paypal/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upgrade to premium');
      }

      console.log('Premium upgrade successful');

      setUser((prevUser) => ({
        ...prevUser,
        isPremium: true,
        accountType: 'premium',
        subscriptionStatus: 'active',
        subscriptionId: subscriptionData.subscriptionId,
        paypalCustomerId: subscriptionData.paypalCustomerId,
        subscriptionStartDate: subscriptionData.startDate,
        subscriptionEndDate: subscriptionData.endDate,
        planId: subscriptionData.planId,
        paymentMethod: subscriptionData.paymentMethod,
        usageStats: {
          ...prevUser?.usageStats,
          dailyLimit: Number.MAX_SAFE_INTEGER,
          monthlyLimit: Number.MAX_SAFE_INTEGER,
          remainingDaily: Number.MAX_SAFE_INTEGER,
          remainingMonthly: Number.MAX_SAFE_INTEGER,
        },
      }));

      return { success: true, message: 'Upgraded to premium successfully' };
    } catch (error) {
      console.error('Upgrade error:', error);
      throw error;
    }
  };

  const downgradeToFree = () => {
    setUser((prevUser) => ({
      ...prevUser,
      isPremium: false,
      accountType: 'free',
      subscriptionStatus: 'inactive',
      subscriptionId: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      planId: null,
      paymentMethod: null,
      willCancelAt: null,
      usageStats: {
        ...prevUser?.usageStats,
        dailyLimit: 5,
        monthlyLimit: 50,
        remainingDaily: Math.max(0, 5 - (prevUser?.usageStats?.dailyGenerations || 0)),
        remainingMonthly: Math.max(0, 50 - (prevUser?.usageStats?.monthlyGenerations || 0)),
      },
    }));
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/payments/paypal/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      setUser((prevUser) => ({
        ...prevUser,
        subscriptionStatus: 'cancelled',
        willCancelAt: data.cancelDate,
      }));

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Cancellation error:', error);
      throw error;
    }
  };

  const reactivateSubscription = async () => {
    try {
      const response = await fetch('/api/payments/paypal/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reactivate subscription');
      }

      setUser((prevUser) => ({
        ...prevUser,
        subscriptionStatus: 'active',
        willCancelAt: null,
      }));

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Reactivation error:', error);
      throw error;
    }
  };

  const getPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/paypal/payment-methods', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment methods');
      }

      return { success: true, paymentMethods: data.paymentMethods };
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  };

  // Updated canGenerateSigil using new API endpoint
  const canGenerateSigil = () => {
    if (!user) return { allowed: false, reason: 'not_authenticated' };

    if (user.isPremium) {
      return { allowed: true, reason: 'premium' };
    }

    if (!user.usageStats) {
      return { allowed: false, reason: 'no_usage_stats' };
    }

    if (user.usageStats.remainingDaily <= 0) {
      return {
        allowed: false,
        reason: 'daily_limit_reached',
        message: `Daily limit reached (${user.usageStats.dailyLimit}). Upgrade to premium for unlimited generations.`,
      };
    }

    if (user.usageStats.remainingMonthly <= 0) {
      return {
        allowed: false,
        reason: 'monthly_limit_reached',
        message: `Monthly limit reached (${user.usageStats.monthlyLimit}). Upgrade to premium for unlimited generations.`,
      };
    }

    return { allowed: true, reason: 'within_limits' };
  };

  // Check generation ability using backend API
  const checkCanGenerate = async () => {
    try {
      const response = await authAPI.canGenerate();
      return {
        allowed: response.allowed,
        reason: response.reason,
        message: response.message,
        currentUsage: response.currentUsage,
        resetTime: response.resetTime
      };
    } catch (error) {
      console.error('Check generation ability error:', error);
      throw error;
    }
  };

  // Record sigil generation using new backend endpoint
  const recordSigilGeneration = async () => {
    try {
      const response = await authAPI.recordGeneration();
      
      // Update local user state with new usage stats
      if (response.usageStats) {
        setUser(prevUser => ({
          ...prevUser,
          usageStats: response.usageStats
        }));
      }

      return { success: true, usageStats: response.usageStats };
    } catch (error) {
      console.error('Record generation error:', error);
      throw error;
    }
  };

  // Updated function to sync with server after generation
  const updateUsageAfterGeneration = async () => {
    try {
      // Record the generation on backend first
      const result = await recordSigilGeneration();
      
      // Then sync the latest stats to ensure consistency
      await syncUsageStats();
      
      return result;
    } catch (error) {
      console.error('Failed to update usage after generation:', error);
      throw error;
    }
  };

  // Optimistic local increment (for immediate UI feedback)
  const incrementUsageCount = () => {
    if (!user || user.isPremium) return;

    // Optimistic update - will be synced from server
    setUser((prevUser) => ({
      ...prevUser,
      usageStats: {
        ...prevUser.usageStats,
        dailyGenerations: prevUser.usageStats.dailyGenerations + 1,
        monthlyGenerations: prevUser.usageStats.monthlyGenerations + 1,
        totalGenerations: prevUser.usageStats.totalGenerations + 1,
        remainingDaily: Math.max(0, prevUser.usageStats.remainingDaily - 1),
        remainingMonthly: Math.max(0, prevUser.usageStats.remainingMonthly - 1),
        lastGenerationDate: new Date().toISOString(),
      },
    }));
  };

  const syncUserData = async () => {
    try {
      if (!user) return;

      const response = await authAPI.syncUserData();
      let userData;
      if (response.data && response.data.user) {
        userData = response.data.user;
      } else if (response.user) {
        userData = response.user;
      } else if (response.data) {
        userData = response.data;
      } else {
        userData = response;
      }
      
      setUser(userData);
      // Also sync usage stats
      await syncUsageStats();
    } catch (error) {
      console.error('Sync user data error:', error);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    isPremium: user?.isPremium || false,
    login,
    register,
    logout,
    refreshAuthToken,
    upgradeToPremium,
    downgradeToFree,
    cancelSubscription,
    reactivateSubscription,
    getPaymentMethods,
    getUsageStats,
    updateUsageStats: (newStats) => setUser((prev) => ({ ...prev, usageStats: { ...prev?.usageStats, ...newStats } })),
    canGenerateSigil,
    checkCanGenerate,
    incrementUsageCount,
    syncUserData,
    syncUsageStats,
    updateUsageAfterGeneration,
    recordSigilGeneration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};