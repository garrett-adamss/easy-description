import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface StripeWebhookData {
  email: string;
  name?: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string; // 'month' | 'year'
  invoiceUrl?: string;
  customerId: string;
  subscriptionId: string;
  nextBillingDate?: string;
  features?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      planName,
      amount,
      currency,
      interval,
      invoiceUrl,
      customerId,
      subscriptionId,
      nextBillingDate,
      features = []
    }: StripeWebhookData = await request.json();

    if (!email || !planName || !amount) {
      return NextResponse.json(
        { error: 'Email, plan name, and amount are required' },
        { status: 400 }
      );
    }

    // Format amount for display
    const formattedAmount = (amount / 100).toFixed(2);
    const currencySymbol = currency === 'usd' ? '$' : currency.toUpperCase();
    
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'billing@yourdomain.com',
      to: [email],
      subject: `Welcome to ${planName}! Your subscription is active 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Purchase Confirmation</title>
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
              .success-icon {
                font-size: 48px;
                margin-bottom: 20px;
              }
              h1 {
                color: #10b981;
                margin-bottom: 10px;
                font-size: 28px;
              }
              .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
              }
              .plan-details {
                background-color: #f3f4f6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .plan-name {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
              }
              .price {
                font-size: 20px;
                font-weight: 600;
                color: #059669;
                margin-bottom: 15px;
              }
              .billing-info {
                background-color: white;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
              }
              .billing-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .billing-row:last-child {
                border-bottom: none;
                font-weight: 600;
              }
              .features-list {
                list-style: none;
                padding: 0;
                margin: 20px 0;
              }
              .features-list li {
                padding: 8px 0;
                display: flex;
                align-items: center;
              }
              .checkmark {
                color: #10b981;
                margin-right: 10px;
                font-weight: bold;
              }
              .cta-buttons {
                text-align: center;
                margin: 30px 0;
              }
              .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 0 10px;
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
              .important-info {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 6px 6px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success-icon">✅</div>
                <h1>Payment Successful!</h1>
                <p class="subtitle">Thank you${name ? `, ${name}` : ''} for your subscription. Your payment has been processed successfully.</p>
              </div>
              
              <div class="plan-details">
                <div class="plan-name">${planName}</div>
                <div class="price">${currencySymbol}${formattedAmount}/${interval}</div>
                
                ${features.length > 0 ? `
                  <p><strong>What's included:</strong></p>
                  <ul class="features-list">
                    ${features.map(feature => `<li><span class="checkmark">✓</span> ${feature}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
              
              <div class="billing-info">
                <h3 style="margin-top: 0; color: #374151;">Billing Details</h3>
                <div class="billing-row">
                  <span>Plan:</span>
                  <span>${planName}</span>
                </div>
                <div class="billing-row">
                  <span>Amount:</span>
                  <span>${currencySymbol}${formattedAmount}</span>
                </div>
                <div class="billing-row">
                  <span>Billing Cycle:</span>
                  <span>Every ${interval}</span>
                </div>
                ${nextBillingDate ? `
                  <div class="billing-row">
                    <span>Next Billing Date:</span>
                    <span>${new Date(nextBillingDate).toLocaleDateString()}</span>
                  </div>
                ` : ''}
                <div class="billing-row">
                  <span>Subscription ID:</span>
                  <span style="font-family: monospace; font-size: 12px;">${subscriptionId}</span>
                </div>
              </div>
              
              <div class="important-info">
                <p><strong>Important:</strong> Your subscription is now active and you have full access to all ${planName} features. You can manage your subscription anytime from your account dashboard.</p>
              </div>
              
              <div class="cta-buttons">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="cta-button">
                  Access Dashboard
                </a>
                ${invoiceUrl ? `
                  <a href="${invoiceUrl}" class="cta-button secondary-button">
                    View Invoice
                  </a>
                ` : ''}
              </div>
              
              <div class="footer">
                <p>Questions about your subscription? We're here to help!</p>
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account" style="color: #2563eb;">Manage Subscription</a> |
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" style="color: #2563eb;">Contact Support</a> |
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/billing" style="color: #2563eb;">Billing History</a>
                </p>
                <p style="margin-top: 15px; font-size: 12px;">
                  Customer ID: ${customerId}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { message: 'Purchase confirmation email sent successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send purchase confirmation email' },
      { status: 500 }
    );
  }
} 