import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
  const faqItems = [
    {
      question: "What is your SaaS product?",
      answer:
        "Our SaaS product is a comprehensive platform designed to streamline project management and team collaboration for businesses of all sizes. It offers features like task tracking, file sharing, communication tools, and reporting.",
    },
    {
      question: "How do I sign up?",
      answer:
        "You can sign up by visiting our homepage and clicking on the 'Get Started' or 'Sign Up' button. Follow the on-screen instructions to create your account and choose a plan.",
    },
    {
      question: "What pricing plans do you offer?",
      answer:
        "We offer several pricing plans, including a free tier for individuals, a Pro plan for small teams, and an Enterprise plan for larger organizations with advanced needs. You can find detailed information on our pricing page.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a 14-day free trial for our Pro plan. No credit card is required to start the trial, and you'll have access to all Pro features during this period.",
    },
    {
      question: "How can I get support?",
      answer:
        "You can reach our support team through the contact form on our 'Contact Us' page, or by emailing us directly at support@example.com. We also have a comprehensive knowledge base available.",
    },
    {
      question: "Can I integrate with other tools?",
      answer:
        "Our platform supports integrations with popular tools like Slack, Google Drive, and GitHub. We are continuously working to add more integrations based on user feedback.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time from your account settings page. Navigate to 'Billing & Plans' and follow the instructions to manage your subscription. Your plan will remain active until the end of your current billing cycle.",
    },
  ]

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Frequently Asked Questions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Find answers to the most common questions about our product and services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}