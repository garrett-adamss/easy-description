/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs'
import path from 'path'

type CSVProductOffer = {
  stripe_product_id: string
  name: string
  description: string
  features: string
  button_text: string
  popular: string
  plan_type: string
  price: string
  annual_price: string
  credits: string
  is_deleted: string
  created_at: string
  label: string
}

export type PriceData = {
  id: string
  stripe_product_id: string
  label: string
  price: number
  period: string
  description: string
  popular?: boolean
  features: string[]
  buttonText: string
}

export function parseCSVData(csvContent: string): PriceData[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  
  return lines.slice(1).map(line => {
    // Parse CSV line considering quoted values and preserving quotes for JSON fields
    const values: string[] = []
    let current = ''
    let inQuotes = false
    let quoteCount = 0
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        quoteCount++
        inQuotes = !inQuotes
        // Keep the quotes in the value for proper JSON parsing later
        current += char
      } else if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current) // Add the last value
    
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      let value = values[index] || ''
      // Remove outer quotes only if they're wrapping the entire value
      if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
        value = value.slice(1, -1)
      }
      row[header] = value
    })
    
    const csvRow = row as unknown as CSVProductOffer
    
    // Parse features from JSON string with escaped quotes
    let featuresArray: string[] = []
    try {
      // The CSV contains features like: [""item1"", ""item2""]
      // Replace escaped double quotes with regular double quotes
      const featuresString = csvRow.features.replace(/""/g, '"')
      
      featuresArray = JSON.parse(featuresString)
    } catch (e) {
      console.error('Error parsing features:', e, 'Raw features:', csvRow.features)
      featuresArray = []
    }
    
    return {
      id: csvRow.stripe_product_id,
      stripe_product_id: csvRow.stripe_product_id,
      label: csvRow.label || csvRow.name,
      price: Number(csvRow.price),
      period: "month",
      description: csvRow.description || '',
      popular: csvRow.popular === 'true',
      features: featuresArray,
      buttonText: csvRow.button_text || 'Get Started',
    }
  })
}

export function loadSubscriptionPricingFromCSV(): PriceData[] {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'subscription_pricing.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    return parseCSVData(csvContent)
  } catch (error) {
    console.error('Error loading subscription pricing from CSV:', error)
    return []
  }
} 

export function loadCreditPricingFromCSV(): PriceData[] {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'credit_pricing.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    return parseCSVData(csvContent)
  } catch (error) {
    console.error('Error loading credit pricing from CSV:', error)
    return []
  }
} 