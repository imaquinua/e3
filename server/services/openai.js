import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient = null;

export const initOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not configured. AI features will be disabled.');
    return null;
  }

  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('✓ OpenAI client initialized');
  return openaiClient;
};

export const getOpenAI = () => {
  if (!openaiClient) {
    initOpenAI();
  }
  return openaiClient;
};

/**
 * Generate a completion using OpenAI
 */
export async function generateCompletion({
  messages,
  model = 'gpt-4o',
  temperature = 0.7,
  maxTokens = 2000,
  responseFormat = null,
}) {
  const client = getOpenAI();

  if (!client) {
    throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY.');
  }

  const params = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat) {
    params.response_format = responseFormat;
  }

  try {
    const completion = await client.chat.completions.create(params);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate structured JSON output
 */
export async function generateStructuredOutput({
  prompt,
  schema,
  systemPrompt = 'You are a helpful AI assistant that generates accurate JSON responses.',
  model = 'gpt-4o',
}) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  const response = await generateCompletion({
    messages,
    model,
    temperature: 0.7,
    responseFormat: { type: 'json_object' },
  });

  return JSON.parse(response);
}

/**
 * Stream a completion (for chat interfaces)
 */
export async function* streamCompletion({
  messages,
  model = 'gpt-4o',
  temperature = 0.7,
}) {
  const client = getOpenAI();

  if (!client) {
    throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY.');
  }

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
