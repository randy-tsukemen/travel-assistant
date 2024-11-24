import { Pinecone, RecordMetadata, ScoredPineconeRecord, Index } from '@pinecone-database/pinecone';
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "@langchain/openai";
import env from '@/env';

// Initialize Pinecone client lazily
let pineconeInstance: Pinecone | null = null;

function getPineconeClient() {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
    });
  }
  return pineconeInstance;
}

const SYSTEM_PROMPT = `You are an expert travel assistant AI. 
When given a destination, provide a comprehensive and personalized travel plan that includes:
1. Best time to visit
2. Top 3-5 attractions
3. Recommended 3-day itinerary
4. Local cuisine highlights
5. Budget and cost estimates
6. Travel tips and cultural insights

Format the response in a clear, easy-to-read manner. Be specific and actionable.`;

export async function generateTravelPlan(destination: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3-groq-70b-8192-tool-use-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Create a detailed travel plan for a trip to ${destination}. 
            Include practical information, must-visit locations, and insider tips.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Groq API error: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No plan generated.';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate travel plan. Please check your API configuration and try again.');
  }
}

interface TravelRecord extends RecordMetadata {
  destination: string;
  category: string;
  description: string;
}

type PineconeIndex = Index<TravelRecord>;

// Initialize Pinecone index
export async function initPinecone(): Promise<PineconeIndex> {
  try {
    const pinecone = getPineconeClient();
    const index = pinecone.index<TravelRecord>(env.PINECONE_INDEX);
    
    // Validate index specs
    const description = await index.describeIndexStats();
    console.log('Index stats:', description);
    
    return index;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    throw new Error('Failed to initialize Pinecone. Please check your API configuration and try again.');
  }
}

// Utility function to upsert travel data
export async function upsertTravelData(
  index: PineconeIndex,
  vectors: Array<{
    id: string;
    values: number[];
    metadata: TravelRecord;
  }>
) {
  try {
    await index.upsert(vectors);
    console.log('Successfully upserted vectors to Pinecone');
  } catch (error) {
    console.error('Failed to upsert vectors:', error);
    throw new Error('Failed to update travel data. Please try again.');
  }
}

// Query similar travel destinations
export async function querySimilarDestinations(
  index: PineconeIndex,
  queryVector: number[],
  topK: number = 5
): Promise<ScoredPineconeRecord<TravelRecord>[]> {
  try {
    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });
    
    return queryResponse.matches;
  } catch (error) {
    console.error('Failed to query similar destinations:', error);
    throw new Error('Failed to find similar destinations. Please try again.');
  }
}
