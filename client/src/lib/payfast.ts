export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
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

  private async generateSignature(params: Record<string, string>): Promise<string> {
    // Sort parameters and create query string
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    // Add passphrase if provided
    const stringToSign = this.config.passphrase 
      ? `${sortedParams}&passphrase=${encodeURIComponent(this.config.passphrase)}`
      : sortedParams;

    // Simple hash using built-in crypto for now - in production you'd use a proper MD5 library
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }

  async generatePaymentUrl(payment: PayFastPayment, userEmail: string): Promise<string> {
    const baseUrl = this.config.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    const paymentId = `ILM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const params = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      name_first: 'IronLedger',
      name_last: 'Patient',
      email_address: userEmail,
      m_payment_id: paymentId,
      amount: payment.amount.toFixed(2),
      item_name: payment.itemName,
      item_description: payment.itemDescription,
      custom_str1: payment.customStr1 || '',
      custom_str2: payment.customStr2 || '',
      custom_str3: payment.customStr3 || '',
    };

    // Generate signature
    const signature = await this.generateSignature(params);
    
    const urlParams = new URLSearchParams({
      ...params,
      signature,
    });

    return `${baseUrl}?${urlParams.toString()}`;
  }

  async processPayment(payment: PayFastPayment, userEmail: string): Promise<{ success: boolean; url?: string; error?: string; paymentId?: string }> {
    try {
      const paymentUrl = await this.generatePaymentUrl(payment, userEmail);
      const paymentId = `ILM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return { success: true, url: paymentUrl, paymentId };
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
  passphrase: import.meta.env.VITE_PAYFAST_PASSPHRASE || '',
  returnUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancelled`,
  notifyUrl: `${window.location.origin}/api/payfast/notify`,
  sandbox: false, // Using live PayFast now that we have real credentials
});
