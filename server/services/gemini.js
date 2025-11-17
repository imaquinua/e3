import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
let geminiClient = null;

export const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not configured. AI features will be disabled.');
    return null;
  }

  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✓ Google Gemini client initialized');
  return geminiClient;
};

export const getGemini = () => {
  if (!geminiClient) {
    initGemini();
  }
  return geminiClient;
};

/**
 * Generate a completion using Gemini
 */
export async function generateCompletion({
  messages,
  model = 'gemini-1.5-flash',
  temperature = 0.7,
  maxTokens = 2000,
}) {
  const client = getGemini();

  if (!client) {
    throw new Error('Gemini client not initialized. Please set GEMINI_API_KEY.');
  }

  try {
    const genModel = client.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    // Convert messages format from OpenAI to Gemini
    // Gemini expects a different format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    // Build the prompt with system instructions
    let fullPrompt = '';
    if (systemMessage) {
      fullPrompt = `${systemMessage.content}\n\n`;
    }

    // Add conversation history
    conversationMessages.forEach(msg => {
      const role = msg.role === 'assistant' ? 'Model' : 'User';
      fullPrompt += `${role}: ${msg.content}\n\n`;
    });

    const result = await genModel.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Generate structured JSON output
 */
export async function generateStructuredOutput({
  prompt,
  systemPrompt = 'You are a helpful AI assistant that generates accurate JSON responses.',
  model = 'gemini-1.5-flash',
}) {
  const fullPrompt = `${systemPrompt}\n\n${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No additional text or explanation.`;

  const response = await generateCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${prompt}\n\nRespond ONLY with valid JSON.` }
    ],
    model,
    temperature: 0.7,
  });

  // Clean response to extract JSON
  let cleanedResponse = response.trim();

  // Remove markdown code blocks if present
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Failed to parse JSON response:', cleanedResponse);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Stream a completion (for chat interfaces)
 */
export async function* streamCompletion({
  messages,
  model = 'gemini-1.5-flash',
  temperature = 0.7,
}) {
  const client = getGemini();

  if (!client) {
    throw new Error('Gemini client not initialized. Please set GEMINI_API_KEY.');
  }

  try {
    const genModel = client.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
      },
    });

    // Convert messages format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    let fullPrompt = '';
    if (systemMessage) {
      fullPrompt = `${systemMessage.content}\n\n`;
    }

    conversationMessages.forEach(msg => {
      const role = msg.role === 'assistant' ? 'Model' : 'User';
      fullPrompt += `${role}: ${msg.content}\n\n`;
    });

    const result = await genModel.generateContentStream(fullPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error('Gemini streaming error:', error);
    throw new Error(`Gemini streaming error: ${error.message}`);
  }
}
