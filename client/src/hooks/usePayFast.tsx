import { useState } from 'react';
import { payFastService, PayFastPayment } from '@/lib/payfast';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';

export function usePayFast() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const processPayment = async (payment: PayFastPayment) => {
    if (!user?.email) {
      throw new Error('User must be logged in to make payments');
    }

    setLoading(true);
    try {
      // Save payment record to database first
      const paymentRecord = await apiRequest('POST', '/api/payments', {
        amount: payment.amount,
        type: payment.customStr1 || 'general',
        status: 'pending'
      });

      const result = await payFastService.processPayment(payment, user.email);
      
      if (result.success && result.url) {
        // Redirect to PayFast
        window.location.href = result.url;
        return { success: true };
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const processMembershipPayment = async () => {
    return processPayment({
      amount: 39.00,
      itemName: 'Premium Membership',
      itemDescription: 'IronLedger MedMap Premium Membership - Quarterly',
      customStr1: 'membership',
    });
  };

  const processBookingPayment = async (doctorName: string, appointmentDate: string) => {
    return processPayment({
      amount: 10.00,
      itemName: 'Appointment Booking Fee',
      itemDescription: `Booking with ${doctorName} on ${appointmentDate}`,
      customStr1: 'booking',
    });
  };

  return {
    processPayment,
    processMembershipPayment,
    processBookingPayment,
    loading,
  };
}
