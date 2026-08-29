import api from './axios';

export const paymentsAPI = {
  // Get all pricing plans
  getPlans: async () => {
    const response = await api.get('/payments/plans/');
    return response.data;
  },

  // Get current user's subscription
  getSubscription: async () => {
    const response = await api.get('/payments/subscription/');
    return response.data;
  },

  // Get payment transactions
  getTransactions: async () => {
    const response = await api.get('/payments/transactions/');
    return response.data;
  },

  // Create Razorpay payment order
  createPaymentOrder: async (planId) => {
    const response = await api.post('/payments/create-order/', {
      plan_id: planId,
    });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify-payment/', paymentData);
    return response.data;
  },
};
