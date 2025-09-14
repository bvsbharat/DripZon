import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { MemoryClient } from 'mem0ai';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config();

const app = express();

// Circuit breaker for Groq API
class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - Groq API temporarily disabled');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('🚨 Circuit breaker OPEN - Groq API disabled temporarily');
    }
  }
}

const groqCircuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30 second timeout

// Environment variables validation
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.AGENT_ID;
const MEM0_API_KEY = process.env.MEM0_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'user_001';

// Memgraph configuration
const MEMGRAPH_URI = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
const MEMGRAPH_USERNAME = process.env.MEMGRAPH_USERNAME || '';
const MEMGRAPH_PASSWORD = process.env.MEMGRAPH_PASSWORD || '';
const MEMGRAPH_USE_SSL = process.env.MEMGRAPH_USE_SSL === 'true';

// Initialize clients
let elevenLabsClient;
let mem0Client;
let groqClient;

// Initialize ElevenLabs client
try {
  if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your-elevenlabs-api-key-here') {
    elevenLabsClient = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
    console.log('✅ ElevenLabs client initialized');
  } else {
    console.log('⚠️  ElevenLabs client not initialized - invalid API key');
  }
} catch (error) {
  console.error('❌ Error initializing ElevenLabs client:', error.message);
}

// Initialize Mem0 client with Memgraph graph store
try {
  if (MEM0_API_KEY && MEM0_API_KEY !== 'your-mem0-api-key-here' && MEM0_API_KEY !== 'test-key-replace-with-real-key') {
    const config = {
      apiKey: MEM0_API_KEY,
      graph_store: {
        provider: "memgraph",
        config: {
          url: MEMGRAPH_URI,
          username: MEMGRAPH_USERNAME,
          password: MEMGRAPH_PASSWORD,
          encrypted: MEMGRAPH_USE_SSL
        }
      }
    };
    
    mem0Client = new MemoryClient(config);
    console.log('✅ Mem0 client initialized with Memgraph graph store');
    console.log(`🔗 Connected to Memgraph at: ${MEMGRAPH_URI}`);
  } else {
    console.log('⚠️  Mem0 client not initialized - using fallback API calls');
    mem0Client = null;
  }
} catch (error) {
  console.error('❌ Error initializing Mem0 client with Memgraph:', error.message);
  console.log('📝 Continuing with fallback API functionality...');
  mem0Client = null;
}

// Initialize Groq client
try {
  if (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here') {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
    console.log('✅ Groq client initialized');
  } else {
    console.log('⚠️  Groq client not initialized - invalid API key');
  }
} catch (error) {
  console.error('❌ Error initializing Groq client:', error.message);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://next-gen-e-com.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Function to add memories
async function addMemories({ message, user_id }) {
  try {
    if (mem0Client) {
      const messages = [{ role: 'user', content: message }];
      const result = await mem0Client.add(messages, { user_id });
      console.log('✅ Memory added via Mem0 client:', result);
      return result;
    } else {
      const messages = [{ role: 'user', content: message }];
      return await mem0Api.add(messages, { user_id });
    }
  } catch (error) {
    console.error('❌ Error adding memory:', error);
    throw error;
  }
}

// Function to retrieve memories
async function retrieveMemories({ message, user_id }) {
  try {
    if (mem0Client) {
      const memories = await mem0Client.search(message, { user_id });
      console.log('✅ Memories retrieved via Mem0 client:', memories);
      return memories;
    } else {
      return await mem0Api.search({ message, user_id });
    }
  } catch (error) {
    console.error('❌ Error retrieving memories:', error);
    throw error;
  }
}

// Mem0 API configuration
const MEM0_API_BASE = 'https://api.mem0.ai/v1';
const MEM0_API_KEY_FALLBACK = process.env.MEM0_API_KEY;

// Mem0 API fallback class
class Mem0Api {
  async add(messages, options = {}) {
    try {
      const requestBody = {
        messages: messages,
        user_id: options.user_id
      };
      
      console.log('🔍 Mem0 API request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post(`${MEM0_API_BASE}/memories/`, requestBody, {
        headers: {
          'Authorization': `Token ${MEM0_API_KEY_FALLBACK}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('🔍 Mem0 API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (MEM0_API_KEY_FALLBACK === 'test-key-replace-with-real-key') {
        return { message: 'Memory added (test mode)', id: 'test_' + Date.now() };
      }
      throw error;
    }
  }

  async search(query, options = {}) {
    try {
      const user_id = options.filters?.AND?.[0]?.user_id || options.user_id;
      
      const requestBody = {
        query,
        user_id: user_id,
        limit: options.limit || 5
      };
      
      console.log('🔍 Mem0 search request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post(`${MEM0_API_BASE}/memories/search/`, requestBody, {
        headers: {
          'Authorization': `Token ${MEM0_API_KEY_FALLBACK}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Mem0 search response:', response.data);
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    } catch (error) {
      console.error('🔍 Mem0 search error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (MEM0_API_KEY_FALLBACK === 'test-key-replace-with-real-key') {
        return [
          { memory: `Test memory related to: ${query}`, score: 0.9, id: 'test_1' },
          { memory: `Another test memory about: ${query}`, score: 0.8, id: 'test_2' }
        ];
      }
      throw error;
    }
  }
}

const mem0Api = new Mem0Api();

// Smart fallback recommendations function
function generateSmartFallbackRecommendations(products, currentCategory, cartItems, wishlistItems, selectedProduct) {
  let recommendations = [];
  const usedIds = new Set();
  
  if (selectedProduct && selectedProduct.category) {
    const similarProducts = products
      .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2);
    
    recommendations.push(...similarProducts);
    similarProducts.forEach(p => usedIds.add(p.id));
  }
  
  if (cartItems && cartItems.length > 0) {
    const cartCategories = [...new Set(cartItems.map(item => item.category))];
    const complementaryProducts = products
      .filter(p => cartCategories.includes(p.category) && !usedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 1);
    
    recommendations.push(...complementaryProducts);
    complementaryProducts.forEach(p => usedIds.add(p.id));
  }
  
  if (currentCategory && recommendations.length < 4) {
    const categoryProducts = products
      .filter(p => p.category === currentCategory && !usedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4 - recommendations.length);
    
    recommendations.push(...categoryProducts);
    categoryProducts.forEach(p => usedIds.add(p.id));
  }
  
  if (recommendations.length < 4) {
    const popularProducts = products
      .filter(p => !usedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4 - recommendations.length);
    
    recommendations.push(...popularProducts);
  }
  
  return recommendations.slice(0, 4);
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: {
      mem0_client: mem0Client ? 'connected' : 'fallback_api',
      elevenlabs: elevenLabsClient ? 'connected' : 'not_configured',
      groq: groqClient ? 'connected' : 'not_configured'
    },
    configuration: {
      memgraph_uri: MEMGRAPH_URI,
      default_user_id: DEFAULT_USER_ID
    }
  });
});

app.post('/api/add', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const userId = user_id || DEFAULT_USER_ID;
    console.log(`📝 Adding memory for user ${userId}: ${message}`);
    
    const result = await addMemories({ message, user_id: userId });
    
    res.json({
      success: true,
      result,
      user_id: userId
    });
  } catch (error) {
    console.error('❌ Error in /api/add:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add memory',
      details: error.message
    });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const { message, user_id, limit } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const userId = user_id || DEFAULT_USER_ID;
    console.log(`🔍 Searching memories for user ${userId}: ${message}`);
    
    const memories = await retrieveMemories({ 
      message, 
      user_id: userId,
      limit: limit || 5
    });
    
    res.json({
      success: true,
      results: memories,
      user_id: userId
    });
  } catch (error) {
    console.error('❌ Error in /api/search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search memories',
      details: error.message
    });
  }
});

app.post('/api/recommendations', async (req, res) => {
  try {
    const {
      user_id,
      products,
      current_category,
      cart_items,
      wishlist_items,
      selected_product,
      user_preferences
    } = req.body;

    if (!user_id || !products || !Array.isArray(products)) {
      return res.status(400).json({
        error: 'Missing required fields: user_id and products array'
      });
    }

    console.log(`🤖 Generating AI recommendations for user ${user_id}`);

    let userMemories = [];
    try {
      userMemories = await retrieveMemories({
        message: `user preferences shopping behavior ${current_category || ''} ${selected_product?.name || ''}`,
        user_id
      });
      console.log(`📚 Retrieved ${userMemories.length} memories for context`);
    } catch (memoryError) {
      console.warn('⚠️ Could not retrieve memories:', memoryError.message);
    }

    const contextPrompt = `
You are an AI shopping assistant. Based on the user's context, recommend 4 products from the available list.

User Context:
- Current Category: ${current_category || 'browsing all'}
- Cart Items: ${cart_items?.length || 0} items
- Wishlist Items: ${wishlist_items?.length || 0} items
- Selected Product: ${selected_product?.name || 'none'}
- User Preferences: ${user_preferences || 'none specified'}

User's Shopping History & Preferences:
${userMemories.map(m => `- ${m.memory || m.text || m}`).join('\n')}

Available Products (first 20 for context):
${products.slice(0, 20).map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: $${p.price}, Rating: ${p.rating}`).join('\n')}

Please respond with ONLY a valid JSON object in this exact format:
{
  "recommendations": [
    {
      "id": "product_id",
      "reasoning": "why this product fits the user"
    }
  ],
  "overall_reasoning": "explanation of recommendation strategy",
  "confidence": 0.8
}

Ensure all product IDs exist in the provided list. Focus on personalization based on user context and memories.`;

    let aiRecommendations;
    try {
      const aiResponse = await groqCircuitBreaker.execute(async () => {
        const completion = await groqClient.chat.completions.create({
          messages: [{ role: 'user', content: contextPrompt }],
          model: 'llama-3.1-70b-versatile',
          temperature: 0.3,
          max_tokens: 1000
        });
        return completion.choices[0]?.message?.content;
      });

      console.log('🤖 Raw AI Response:', aiResponse);

      let jsonStr = aiResponse.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      } else if (firstBrace !== -1) {
        const partialJson = jsonStr.substring(firstBrace);
        const recommendationsMatch = partialJson.match(/"recommendations"\s*:\s*\[(.*?)(?:\]|$)/s);
        if (recommendationsMatch) {
          const recsText = recommendationsMatch[1];
          const recMatches = recsText.match(/\{[^}]*"id"[^}]*\}/g);
          if (recMatches && recMatches.length > 0) {
            const validRecs = recMatches.slice(0, 4).map(rec => {
              try {
                return JSON.parse(rec);
              } catch {
                return null;
              }
            }).filter(Boolean);
            
            if (validRecs.length > 0) {
              jsonStr = JSON.stringify({
                recommendations: validRecs,
                overall_reasoning: 'AI-powered recommendations',
                confidence: 0.8
              });
            }
          }
        }
      }
      
      console.log('🔍 Extracted JSON:', jsonStr.substring(0, 200) + '...');
      aiRecommendations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn('⚠️ Could not parse AI response:', parseError.message);
      
      const smartRecommendations = generateSmartFallbackRecommendations(
        products, 
        current_category, 
        cart_items, 
        wishlist_items, 
        selected_product
      );
      
      return res.json({
        success: true,
        recommendations: smartRecommendations,
        reasoning: 'Smart recommendations based on your preferences and context',
        confidence: 0.7,
        source: 'smart_fallback'
      });
    }

    const recommendedProducts = aiRecommendations.recommendations
      .map(rec => {
        const product = products.find(p => p.id === rec.id);
        return product ? {
          ...product,
          reasoning: rec.reasoning
        } : null;
      })
      .filter(Boolean)
      .slice(0, 4);

    if (recommendedProducts.length < 4) {
      const usedIds = new Set(recommendedProducts.map(p => p.id));
      const fallbackProducts = products
        .filter(p => !usedIds.has(p.id) && (p.category === current_category || !current_category))
        .slice(0, 4 - recommendedProducts.length);
      
      recommendedProducts.push(...fallbackProducts);
    }

    console.log(`✅ Generated ${recommendedProducts.length} recommendations for user ${user_id}`);

    res.json({
      success: true,
      recommendations: recommendedProducts,
      reasoning: aiRecommendations.overall_reasoning || 'AI-powered personalized recommendations',
      confidence: aiRecommendations.confidence || 0.8,
      source: 'ai'
    });

  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    
    const fallbackRecommendations = req.body.products
      ?.filter(p => p.category === req.body.current_category || !req.body.current_category)
      ?.slice(0, 4)
      ?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category
      })) || [];

    res.status(500).json({
      success: false,
      error: 'Failed to generate AI recommendations',
      details: error.message,
      recommendations: fallbackRecommendations,
      reasoning: 'Showing popular items (AI recommendations failed)',
      confidence: 0.5,
      source: 'fallback'
    });
  }
});

app.post('/api/recommendations/interaction', async (req, res) => {
  try {
    const { user_id, product_id, interaction_type, product_name } = req.body;

    if (!user_id || !product_id || !interaction_type) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, product_id, and interaction_type'
      });
    }

    const interactionMessage = `User ${interaction_type} recommended product: ${product_name || product_id}`;
    
    try {
      if (mem0Client) {
        await mem0Client.add(
          [{ role: 'user', content: interactionMessage }],
          { user_id }
        );
      } else {
        await mem0Api.add(
          [{ role: 'user', content: interactionMessage }],
          { user_id }
        );
      }
      
      console.log(`✅ Saved recommendation interaction for user ${user_id}: ${interaction_type} ${product_id}`);
    } catch (memoryError) {
      console.warn('⚠️ Could not save interaction to memory:', memoryError.message);
    }

    res.json({
      success: true,
      message: 'Interaction saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving recommendation interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save interaction',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Export the Express app for Vercel
export default app;