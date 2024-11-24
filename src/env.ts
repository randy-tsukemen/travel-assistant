const env = {
  GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  PINECONE_API_KEY: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
  PINECONE_INDEX: process.env.NEXT_PUBLIC_PINECONE_INDEX,
} as const;

// Validate environment variables
const validateEnv = () => {
  const missingVars: string[] = [];
  
  if (!env.GROQ_API_KEY) missingVars.push('NEXT_PUBLIC_GROQ_API_KEY');
  if (!env.PINECONE_API_KEY) missingVars.push('NEXT_PUBLIC_PINECONE_API_KEY');
  if (!env.PINECONE_INDEX) missingVars.push('NEXT_PUBLIC_PINECONE_INDEX');
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file and restart the development server.'
    );
  }
};

// Validate on import
validateEnv();

export default env;
