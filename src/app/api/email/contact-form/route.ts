import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'contact@byteflow.shop',
      to: ['garrettadamsdev@gmail.com'],
      subject: `Saas New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contact Form Submission</title>
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
                padding-bottom: 20px;
                border-bottom: 2px solid #2563eb;
              }
              .contact-icon {
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
              .form-data {
                background-color: #f8f9fa;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
              }
              .field {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e5e7eb;
              }
              .field:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
              }
              .field-label {
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
                display: block;
              }
              .field-value {
                color: #111827;
                word-wrap: break-word;
              }
              .message-field {
                background-color: white;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                padding: 15px;
                margin-top: 10px;
                white-space: pre-wrap;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .timestamp {
                background-color: #eff6ff;
                color: #1d4ed8;
                padding: 10px;
                border-radius: 4px;
                font-size: 14px;
                text-align: center;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="contact-icon">📩</div>
                <h1>New Contact Form Submission</h1>
                <p class="subtitle">Someone has reached out through your website contact form</p>
              </div>
              
              <div class="timestamp">
                Received on: ${new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </div>
              
              <div class="form-data">
                <div class="field">
                  <span class="field-label">Name:</span>
                  <div class="field-value">${name}</div>
                </div>
                
                <div class="field">
                  <span class="field-label">Email:</span>
                  <div class="field-value">
                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                  </div>
                </div>
                
                <div class="field">
                  <span class="field-label">Subject:</span>
                  <div class="field-value">${subject}</div>
                </div>
                
                <div class="field">
                  <span class="field-label">Message:</span>
                  <div class="message-field">${message}</div>
                </div>
              </div>
              
              <div class="footer">
                <p>This email was sent from your website contact form.</p>
                <p style="margin-top: 10px;">
                  <strong>Reply directly to this email to respond to ${name}</strong>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      replyTo: email, // This allows you to reply directly to the person who submitted the form
    });
    console.log('Email sent successfully:', data);

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return NextResponse.json(
      { error: 'Failed to send contact form submission' },
      { status: 500 }
    );
  }
} 