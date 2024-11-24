'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateTravelPlan } from '@/lib/ai/travel-assistant'

export default function Home() {
  const [destination, setDestination] = useState('')
  const [travelPlan, setTravelPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGeneratePlan = async () => {
    if (!destination) return

    setIsLoading(true)
    try {
      const plan = await generateTravelPlan(destination)
      setTravelPlan(plan)
    } catch (error) {
      console.error('Failed to generate travel plan:', error)
      setTravelPlan('Sorry, I could not generate a travel plan at this moment.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Travel Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized travel recommendations powered by AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Your Next Adventure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Input 
              placeholder="Enter destination (e.g., Paris, Tokyo)" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={handleGeneratePlan} 
              disabled={isLoading || !destination}
            >
              {isLoading ? 'Generating...' : 'Generate Plan'}
            </Button>
          </div>

          {travelPlan && (
            <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Your Travel Plan</h2>
              <p className="whitespace-pre-wrap">{travelPlan}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
