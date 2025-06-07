import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

// Common email types
export interface BaseEmailData {
  email: string;
  name?: string;
}

export interface WelcomeEmailData extends BaseEmailData {
  // Welcome email can include additional onboarding data
  features?: string[];
  nextSteps?: string[];
}

export interface PurchaseEmailData extends BaseEmailData {
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  invoiceUrl?: string;
  customerId: string;
  subscriptionId: string;
  nextBillingDate?: string;
  features?: string[];
}

export interface CancellationEmailData extends BaseEmailData {
  planName: string;
  cancellationDate: string;
  endDate: string;
  reason?: string;
  refundAmount?: number;
  currency?: string;
  customerId: string;
  subscriptionId: string;
}

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'usd'): string => {
  const symbol = currency === 'usd' ? '$' : currency.toUpperCase();
  return `${symbol}${(amount / 100).toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Common email styles
export const getEmailStyles = () => `
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    h1 {
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px;
    }
    .secondary-button {
      background-color: transparent;
      color: #2563eb;
      border: 2px solid #2563eb;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .info-box {
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .info-box.warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    .info-box.success {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
    }
    .info-box.error {
      background-color: #fef2f2;
      border-left: 4px solid #dc2626;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
  </style>
`;

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Common email footer
export const getEmailFooter = (customerId?: string) => `
  <div class="footer">
    <p>Best regards,<br>The Team</p>
    <p style="margin-top: 20px;">
      <a href="${EMAIL_CONFIG.SITE_URL}/account" style="color: #2563eb;">Manage Account</a> |
      <a href="${EMAIL_CONFIG.SITE_URL}/support" style="color: #2563eb;">Contact Support</a> |
      <a href="${EMAIL_CONFIG.SITE_URL}/help" style="color: #2563eb;">Help Center</a>
    </p>
    ${customerId ? `
      <p style="margin-top: 15px; font-size: 12px;">
        Customer ID: ${customerId}
      </p>
    ` : ''}
  </div>
`;

// Error handling for email sending
export const handleEmailError = (error: unknown, emailType: string) => {
  console.error(`Error sending ${emailType} email:`, error);
  
  if (error instanceof Error) {
    return {
      error: `Failed to send ${emailType} email: ${error.message}`,
      details: error.stack
    };
  }
  
  return {
    error: `Failed to send ${emailType} email: Unknown error occurred`
  };
}; 