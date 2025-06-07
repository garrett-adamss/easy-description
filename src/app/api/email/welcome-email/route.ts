import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@yourdomain.com',
      to: [email],
      subject: 'Welcome to Our Platform! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome Email</title>
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
              .welcome-icon {
                font-size: 48px;
                margin-bottom: 20px;
              }
              h1 {
                color: #2563eb;
                margin-bottom: 10px;
                font-size: 28px;
              }
              .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
              }
              .content {
                margin-bottom: 30px;
              }
              .feature-list {
                list-style: none;
                padding: 0;
                margin: 20px 0;
              }
              .feature-list li {
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
              }
              .feature-list li:last-child {
                border-bottom: none;
              }
              .checkmark {
                color: #10b981;
                margin-right: 10px;
                font-weight: bold;
              }
              .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="welcome-icon">🎉</div>
                <h1>Welcome${name ? `, ${name}` : ''}!</h1>
                <p class="subtitle">Thanks for joining our platform. We're excited to have you on board!</p>
              </div>
              
              <div class="content">
                <p>You've successfully created your account and you're now part of our growing community. Here's what you can do next:</p>
                
                <ul class="feature-list">
                  <li><span class="checkmark">✓</span> Complete your profile setup</li>
                  <li><span class="checkmark">✓</span> Explore our dashboard features</li>
                  <li><span class="checkmark">✓</span> Check out our getting started guide</li>
                  <li><span class="checkmark">✓</span> Connect with our community</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="cta-button">
                    Get Started Now
                  </a>
                </div>
                
                <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team. We're here to help!</p>
              </div>
              
              <div class="footer">
                <p>Best regards,<br>The Team</p>
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" style="color: #2563eb;">Contact Support</a> |
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/help" style="color: #2563eb;">Help Center</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { message: 'Welcome email sent successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
} 