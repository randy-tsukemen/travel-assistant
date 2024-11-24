declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_GROQ_API_KEY: string;
      NEXT_PUBLIC_PINECONE_API_KEY: string;
      NEXT_PUBLIC_PINECONE_INDEX: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}
