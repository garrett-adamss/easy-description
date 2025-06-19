import { createClient } from "@/lib/supabase/server"
import { PricingPageClient } from "./pricing-client"
import { USE_SUPABASE_FOR_PRICING } from "@/config/constants"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { loadCreditPricingFromCSV, type PriceData } from "@/lib/utils/csv-parser"

// Define the type for product offers from the database
type ProductOffer = {
  stripe_price_id: string
  name: string
  description: string | null
  features: Record<string, string> | null
  button_text: string | null
  popular: boolean | null
  plan_type: string
  price: number
  annual_price: number | null
  credits: number
  is_deleted: boolean | null
  created_at: string
}

export default async function PricingPage() {
  // If USE_SUPABASE_FOR_PRICING is false, use CSV data directly
  if (!USE_SUPABASE_FOR_PRICING) {
    const csvPrices = loadCreditPricingFromCSV()
    return <PricingPageClient prices={csvPrices} />
  }

  const supabase = await createClient()
  
  // Fetch pricing data from the product_offers table
  const { data: productOffers, error } = await supabase
    .from('product_offers')
    .select('*')
    .eq('plan_type', 'credit')
    .eq('is_deleted', false)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching product offers:', error)
    // Use CSV data as fallback instead of hardcoded data
    const fallbackPrices = loadCreditPricingFromCSV()
    return <PricingPageClient prices={fallbackPrices} />
  }

  // Transform database results to match the expected format
  const prices = productOffers?.map((offer: ProductOffer) => {
    // Convert features from jsonb to string array
    let featuresArray: string[] = []
    if (offer.features) {
      if (Array.isArray(offer.features)) {
        featuresArray = offer.features
      } else if (typeof offer.features === 'object') {
        // If features is an object, convert values to array
        featuresArray = Object.values(offer.features).filter(Boolean) as string[]
      }
    }

    return {
      id: offer.stripe_price_id,
      stripe_price_id: offer.stripe_price_id,
      label: offer.name,
      price: Number(offer.price),
      period: "month", // Default to month since it's not in your schema
      description: offer.description || '',
      popular: offer.popular || false,
      features: featuresArray,
      buttonText: offer.button_text || 'Get Started',
    }
  }) || []

  return <PricingPageClient prices={prices} />
}