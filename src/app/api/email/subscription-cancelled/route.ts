import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface CancellationData {
  email: string;
  name?: string;
  planName: string;
  cancellationDate: string;
  endDate: string; // When access will actually end
  reason?: string;
  refundAmount?: number;
  currency?: string;
  customerId: string;
  subscriptionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      planName,
      cancellationDate,
      endDate,
      reason,
      refundAmount,
      currency = 'usd',
      customerId,
      subscriptionId
    }: CancellationData = await request.json();

    if (!email || !planName || !cancellationDate || !endDate) {
      return NextResponse.json(
        { error: 'Email, plan name, cancellation date, and end date are required' },
        { status: 400 }
      );
    }

    const currencySymbol = currency === 'usd' ? '$' : currency.toUpperCase();
    const formattedRefund = refundAmount ? (refundAmount / 100).toFixed(2) : null;
    
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'support@yourdomain.com',
      to: [email],
      subject: 'Subscription Cancelled - We\'re sorry to see you go',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Cancelled</title>
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
              .sad-icon {
                font-size: 48px;
                margin-bottom: 20px;
              }
              h1 {
                color: #dc2626;
                margin-bottom: 10px;
                font-size: 28px;
              }
              .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
              }
              .cancellation-details {
                background-color: #fef2f2;
                border-left: 4px solid #dc2626;
                border-radius: 0 8px 8px 0;
                padding: 20px;
                margin: 20px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #fecaca;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .access-info {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 6px 6px 0;
              }
              .refund-info {
                background-color: #ecfdf5;
                border-left: 4px solid #10b981;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 6px 6px 0;
              }
              .win-back-section {
                background-color: #f0f9ff;
                border-radius: 8px;
                padding: 25px;
                margin: 30px 0;
                text-align: center;
              }
              .win-back-title {
                color: #2563eb;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 15px;
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
              .feedback-section {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .reasons-list {
                text-align: left;
                margin: 15px 0;
                padding-left: 20px;
              }
              .reasons-list li {
                margin: 8px 0;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="sad-icon">😢</div>
                <h1>Subscription Cancelled</h1>
                <p class="subtitle">We're sorry to see you go${name ? `, ${name}` : ''}. Your subscription has been successfully cancelled.</p>
              </div>
              
              <div class="cancellation-details">
                <h3 style="margin-top: 0; color: #374151;">Cancellation Details</h3>
                <div class="detail-row">
                  <span>Plan:</span>
                  <span>${planName}</span>
                </div>
                <div class="detail-row">
                  <span>Cancelled On:</span>
                  <span>${new Date(cancellationDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span>Access Ends:</span>
                  <span>${new Date(endDate).toLocaleDateString()}</span>
                </div>
                ${reason ? `
                  <div class="detail-row">
                    <span>Reason:</span>
                    <span>${reason}</span>
                  </div>
                ` : ''}
                <div class="detail-row">
                  <span>Subscription ID:</span>
                  <span style="font-family: monospace; font-size: 12px;">${subscriptionId}</span>
                </div>
              </div>
              
              <div class="access-info">
                <p><strong>Important:</strong> You'll continue to have access to all ${planName} features until ${new Date(endDate).toLocaleDateString()}. After this date, your account will be downgraded to the free tier.</p>
              </div>
              
              ${formattedRefund ? `
                <div class="refund-info">
                  <p><strong>Refund Processed:</strong> A refund of ${currencySymbol}${formattedRefund} has been processed and will appear in your account within 5-10 business days.</p>
                </div>
              ` : ''}
              
              <div class="win-back-section">
                <div class="win-back-title">Changed your mind?</div>
                <p>We'd love to have you back! You can reactivate your subscription anytime before ${new Date(endDate).toLocaleDateString()} to continue without interruption.</p>
                
                <div style="margin: 20px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing" class="cta-button">
                    Reactivate Subscription
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">
                  Or explore our other plans that might be a better fit for your needs.
                </p>
              </div>
              
              <div class="feedback-section">
                <h3 style="margin-top: 0; color: #374151;">Help us improve</h3>
                <p>We're always working to make our service better. Could you take a moment to let us know why you cancelled?</p>
                
                <ul class="reasons-list">
                  <li>Too expensive</li>
                  <li>Not using it enough</li>
                  <li>Missing features I need</li>
                  <li>Found a better alternative</li>
                  <li>Technical issues</li>
                  <li>Other</li>
                </ul>
                
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/feedback?type=cancellation&sub=${subscriptionId}" class="cta-button secondary-button">
                    Share Feedback
                  </a>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; margin-bottom: 15px;">Need help with something else?</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" class="cta-button secondary-button">
                  Contact Support
                </a>
              </div>
              
              <div class="footer">
                <p>We're sad to see you go, but we understand. Thank you for being part of our community.</p>
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account" style="color: #2563eb;">Manage Account</a> |
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/help" style="color: #2563eb;">Help Center</a> |
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #2563eb;">Contact Us</a>
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
      { message: 'Cancellation email sent successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return NextResponse.json(
      { error: 'Failed to send cancellation email' },
      { status: 500 }
    );
  }
} 