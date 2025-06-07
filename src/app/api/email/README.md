# THIS IS NOT WORKING, UTILIZING STRIPE EMAILS FOR NOW

# Email API Endpoints

This directory contains Resend email templates for various user lifecycle events. Each endpoint is designed to handle specific email scenarios with rich HTML templates.

## Setup

### Environment Variables

Add these environment variables to your `.env.local` file:

```env
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Resend Configuration

1. Sign up for a [Resend](https://resend.com) account
2. Add and verify your domain
3. Get your API key from the dashboard
4. Update the `FROM_EMAIL` to use your verified domain

## Available Endpoints

### 1. Welcome Email (`/api/email/welcome-email`)

Sends a welcome email to new users after they sign up.

**POST Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe" // optional
}
```

**Usage Example:**
```javascript
// After user signup
const response = await fetch('/api/email/welcome-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,
    name: user.name
  })
});
```

### 2. Purchase Successful (`/api/email/purchase-successful`)

Sends a subscription confirmation email with purchase details from Stripe webhooks.

**POST Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe", // optional
  "planName": "Pro Plan",
  "amount": 2999, // in cents
  "currency": "usd",
  "interval": "month", // or "year"
  "invoiceUrl": "https://invoice.stripe.com/...", // optional
  "customerId": "cus_...",
  "subscriptionId": "sub_...",
  "nextBillingDate": "2024-01-15T00:00:00Z", // optional
  "features": ["Feature 1", "Feature 2"] // optional
}
```

**Stripe Webhook Integration:**
```javascript
// In your Stripe webhook handler
export async function POST(request) {
  const sig = headers().get('stripe-signature');
  const body = await request.text();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed.`, { status: 400 });
  }

  if (event.type === 'customer.subscription.created' || event.type === 'invoice.payment_succeeded') {
    const subscription = event.data.object;
    
    // Send purchase confirmation email
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/purchase-successful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: subscription.customer.email,
        planName: subscription.items.data[0].price.nickname,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.items.data[0].price.currency,
        interval: subscription.items.data[0].price.recurring.interval,
        customerId: subscription.customer,
        subscriptionId: subscription.id,
        nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        features: ["Premium Features", "Priority Support", "Advanced Analytics"]
      })
    });
  }
}
```

### 3. Subscription Cancelled (`/api/email/subscription-cancelled`)

Sends a cancellation confirmation email with retention attempts and feedback requests.

**POST Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe", // optional
  "planName": "Pro Plan",
  "cancellationDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z", // when access actually ends
  "reason": "Too expensive", // optional
  "refundAmount": 1500, // optional, in cents
  "currency": "usd", // optional, defaults to 'usd'
  "customerId": "cus_...",
  "subscriptionId": "sub_..."
}
```

**Stripe Webhook Integration:**
```javascript
// In your Stripe webhook handler
if (event.type === 'customer.subscription.deleted') {
  const subscription = event.data.object;
  
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/subscription-cancelled`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: subscription.customer.email,
      planName: subscription.items.data[0].price.nickname,
      cancellationDate: new Date(subscription.canceled_at * 1000).toISOString(),
      endDate: new Date(subscription.current_period_end * 1000).toISOString(),
      customerId: subscription.customer,
      subscriptionId: subscription.id
    })
  });
}
```

## Email Template Features

### Design
- Mobile-responsive HTML templates
- Modern, clean design with consistent branding
- Professional typography and spacing
- Accessible color contrast

### Content
- Personalized with user names when provided
- Clear call-to-action buttons
- Comprehensive information relevant to each email type
- Links to relevant pages (dashboard, support, etc.)

### Purchase Successful Template Includes:
- Plan details and pricing
- Billing information and next billing date
- Feature list (if provided)
- Invoice link (if available)
- Account management links

### Cancellation Template Includes:
- Cancellation details and access end date
- Win-back section with reactivation option
- Feedback request with common reasons
- Refund information (if applicable)
- Support contact information

## Error Handling

All endpoints include proper error handling and return appropriate HTTP status codes:

- `200`: Email sent successfully
- `400`: Bad request (missing required fields)
- `500`: Server error (email sending failed)

Example error response:
```json
{
  "error": "Email is required"
}
```

## Utility Functions

The `src/lib/email.ts` file contains shared utilities:

- `formatCurrency()`: Format amounts with currency symbols
- `formatDate()`: Format dates in a user-friendly way
- `validateEmail()`: Validate email addresses
- `getEmailStyles()`: Common CSS styles for all templates
- `getEmailFooter()`: Consistent footer with links
- `handleEmailError()`: Centralized error handling

## Testing

You can test the email endpoints using tools like Postman or curl:

```bash
curl -X POST http://localhost:3000/api/email/welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## Customization

To customize the email templates:

1. Update the HTML content in each route file
2. Modify the CSS styles in the template or shared utilities
3. Add new fields to the TypeScript interfaces
4. Update environment variables for branding

## Best Practices

1. Always validate email addresses before sending
2. Include unsubscribe links where required by law
3. Test templates across different email clients
4. Monitor email delivery rates and engagement
5. Keep sensitive information secure
6. Use proper error logging for debugging 