export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  sandbox: boolean;
}

export interface PayFastPayment {
  amount: number;
  itemName: string;
  itemDescription: string;
  customStr1?: string;
  customStr2?: string;
  customStr3?: string;
}

export class PayFastService {
  private config: PayFastConfig;

  constructor(config: PayFastConfig) {
    this.config = config;
  }

  generatePaymentUrl(payment: PayFastPayment, userEmail: string): string {
    const baseUrl = this.config.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    const params = new URLSearchParams({
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      name_first: 'IronLedger',
      name_last: 'Patient',
      email_address: userEmail,
      m_payment_id: `payment_${Date.now()}`,
      amount: payment.amount.toFixed(2),
      item_name: payment.itemName,
      item_description: payment.itemDescription,
      custom_str1: payment.customStr1 || '',
      custom_str2: payment.customStr2 || '',
      custom_str3: payment.customStr3 || '',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async processPayment(payment: PayFastPayment, userEmail: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const paymentUrl = this.generatePaymentUrl(payment, userEmail);
      
      // In a real implementation, you would:
      // 1. Save payment record to database
      // 2. Generate signature for security
      // 3. Redirect user to PayFast
      
      return { success: true, url: paymentUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed' 
      };
    }
  }
}

export const payFastService = new PayFastService({
  merchantId: import.meta.env.VITE_PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  returnUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancelled`,
  notifyUrl: `${window.location.origin}/api/payfast/notify`,
  sandbox: true, // Set to false for production
});
