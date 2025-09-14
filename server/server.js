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
const PORT = process.env.PORT || 3001;

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

if (!MEM0_API_KEY || MEM0_API_KEY === 'your-mem0-api-key') {
  console.log('⚠️  Warning: Using test MEM0_API_KEY. Please set a real MEM0_API_KEY for production.');
}

if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your-elevenlabs-api-key') {
  console.log('⚠️  Warning: ELEVENLABS_API_KEY not set properly.');
}

if (!AGENT_ID || AGENT_ID === 'your-agent-id') {
  console.log('⚠️  Warning: AGENT_ID not set properly.');
}

if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here') {
  console.log('⚠️  Warning: GROQ_API_KEY not set properly.');
}

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

// Function to add memories using ElevenLabs integration
async function addMemories({ message, user_id }) {
  try {
    if (mem0Client) {
      // Use Mem0 client if available
      const messages = [{ role: 'user', content: message }];
      const result = await mem0Client.add(messages, { user_id });
      console.log('✅ Memory added via Mem0 client:', result);
      return result;
    } else {
      // Fallback to direct API call
      const messages = [{ role: 'user', content: message }];
      return await mem0Api.add(messages, { user_id });
    }
  } catch (error) {
    console.error('❌ Error adding memory:', error);
    throw error;
  }
}

// Function to retrieve memories using ElevenLabs integration
async function retrieveMemories({ message, user_id }) {
  try {
    if (mem0Client) {
      // Use Mem0 client if available
      const memories = await mem0Client.search(message, { user_id });
      console.log('✅ Memories retrieved via Mem0 client:', memories);
      return memories;
    } else {
      // Fallback to direct API call
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

// Validate Mem0 API key
if (!MEM0_API_KEY_FALLBACK || MEM0_API_KEY_FALLBACK === 'test-key-replace-with-real-key') {
  console.log('⚠️  Warning: Using test API key. Please set a real MEM0_API_KEY for production.');
} else {
  console.log('✅ Mem0 API key configured');
}

// Smart fallback recommendation function
function generateSmartFallbackRecommendations(products, currentCategory, cartItems, wishlistItems, selectedProduct) {
  let recommendations = [];
  const usedIds = new Set();
  
  // 1. If user has a selected product, recommend similar items from same category
  if (selectedProduct && selectedProduct.category) {
    const similarProducts = products
      .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2);
    
    recommendations.push(...similarProducts);
    similarProducts.forEach(p => usedIds.add(p.id));
  }
  
  // 2. If user has items in cart, recommend complementary items
  if (cartItems && cartItems.length > 0) {
    const cartCategories = [...new Set(cartItems.map(item => item.category))];
    const complementaryProducts = products
      .filter(p => cartCategories.includes(p.category) && !usedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 1);
    
    recommendations.push(...complementaryProducts);
    complementaryProducts.forEach(p => usedIds.add(p.id));
  }
  
  // 3. If user has a current category, prioritize that category
  if (currentCategory && recommendations.length < 4) {
    const categoryProducts = products
      .filter(p => p.category === currentCategory && !usedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4 - recommendations.length);
    
    recommendations.push(...categoryProducts);
    categoryProducts.forEach(p => usedIds.add(p.id));
  }
  
  // 4. Fill remaining slots with highest rated products
  if (recommendations.length < 4) {
    const popularProducts = products
      .filter(p => !usedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4 - recommendations.length);
    
    recommendations.push(...popularProducts);
  }
  
  return recommendations.slice(0, 4);
}

// Mem0 API helper functions
const mem0Api = {
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
        // Mock response for testing
        return { message: 'Memory added (test mode)', id: 'test_' + Date.now() };
      }
      throw error;
    }
  },

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
      // Mem0 API returns results directly as an array
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    } catch (error) {
      console.error('🔍 Mem0 search error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (MEM0_API_KEY_FALLBACK === 'test-key-replace-with-real-key') {
        // Mock response for testing
        return [
          { memory: `Test memory related to: ${query}`, score: 0.9, id: 'test_1' },
          { memory: `Another test memory about: ${query}`, score: 0.8, id: 'test_2' }
        ];
      }
      throw error;
    }
  }
};

// Middleware to check API key
const authenticateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!apiKey || apiKey !== MEM0_API_KEY_FALLBACK) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  next();
};

// ElevenLabs integration endpoints
app.post('/api/elevenlabs/add-memories', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await addMemories({ message, user_id });
    
    res.json({ 
      success: true,
      message: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in add-memories endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add memory',
      details: error.message 
    });
  }
});

app.post('/api/elevenlabs/retrieve-memories', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const memories = await retrieveMemories({ message, user_id });
    
    res.json({ 
      success: true,
      memories: memories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in retrieve-memories endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve memories',
      details: error.message,
      memories: 'No memories found'
    });
  }
});

// Health check endpoint with Memgraph connectivity
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Memory Service with Mem0 + Memgraph',
    components: {
      mem0_client: mem0Client ? 'connected' : 'disconnected',
      memgraph: 'unknown',
      elevenlabs: elevenLabsClient ? 'connected' : 'disconnected'
    },
    configuration: {
      memgraph_uri: MEMGRAPH_URI,
      mem0_api_configured: !!MEM0_API_KEY && MEM0_API_KEY !== 'test-key-replace-with-real-key'
    },
    circuitBreaker: {
      state: groqCircuitBreaker.state,
      failureCount: groqCircuitBreaker.failureCount,
      lastFailureTime: groqCircuitBreaker.lastFailureTime
    }
  };

  // Test Memgraph connectivity if mem0Client is available
  if (mem0Client) {
    try {
      // Try to perform a simple graph operation to test connectivity
      await mem0Client.search('health check test', { user_id: 'health_check_user', limit: 1 });
      healthStatus.components.memgraph = 'connected';
    } catch (error) {
      console.warn('⚠️ Memgraph connectivity test failed:', error.message);
      healthStatus.components.memgraph = 'error';
      healthStatus.memgraph_error = error.message;
    }
  }

  const isHealthy = healthStatus.components.mem0_client === 'connected' && 
                   healthStatus.components.memgraph !== 'error';
  
  res.status(isHealthy ? 200 : 503).json(healthStatus);
});

// API status endpoint for detailed monitoring
app.get('/api/status', (req, res) => {
  const now = Date.now();
  const timeSinceLastFailure = groqCircuitBreaker.lastFailureTime 
    ? now - groqCircuitBreaker.lastFailureTime 
    : null;
    
  res.json({
    timestamp: new Date().toISOString(),
    groqApi: {
      circuitBreakerState: groqCircuitBreaker.state,
      failureCount: groqCircuitBreaker.failureCount,
      lastFailureTime: groqCircuitBreaker.lastFailureTime,
      timeSinceLastFailure: timeSinceLastFailure,
      isHealthy: groqCircuitBreaker.state === 'CLOSED',
      nextRetryIn: groqCircuitBreaker.state === 'OPEN' && timeSinceLastFailure 
        ? Math.max(0, groqCircuitBreaker.resetTimeout - timeSinceLastFailure)
        : null
    },
    recommendations: {
      fallbackMode: groqCircuitBreaker.state !== 'CLOSED',
      smartFallbackAvailable: true
    }
  });
});

// Simple add memory endpoint (no auth required for testing)
app.post('/api/add', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    
    if (!message || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and user_id' 
      });
    }

    const messages = [{ role: 'user', content: message }];
    let result;
    
    if (mem0Client) {
      // Use Mem0 client with Memgraph integration
      console.log(`🔗 Adding memory to Memgraph for user ${user_id}: "${message}"`);
      result = await mem0Client.add(messages, { user_id });
      console.log(`✅ Memory added to Memgraph for user ${user_id}:`, result);
    } else {
      // Fallback to direct API call
      console.log(`⚠️ Using fallback API for user ${user_id} (Memgraph not available)`);
      result = await mem0Api.add(messages, { user_id });
      console.log(`✅ Memory added via API for user ${user_id}:`, result);
    }
    
    res.json({ 
      success: true,
      message: 'Memory added successfully',
      result: result,
      storage: mem0Client ? 'memgraph' : 'cloud_api',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error adding memory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add memory',
      details: error.message 
    });
  }
});

// Simple search memory endpoint (no auth required for testing)
app.post('/api/search', async (req, res) => {
  try {
    const { message, user_id, limit = 5 } = req.body;
    
    if (!message || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and user_id' 
      });
    }

    let results;
    if (mem0Client) {
      // Use Mem0 client with Memgraph integration
      console.log(`🔗 Searching Memgraph for user ${user_id} with query "${message}"`);
      results = await mem0Client.search(message, { user_id, limit });
      console.log(`🔍 Memgraph search results for user ${user_id}:`, results);
    } else {
      // Fallback to direct API call
      console.log(`⚠️ Using fallback API search for user ${user_id} (Memgraph not available)`);
      results = await mem0Api.search(message, { user_id, limit });
      console.log(`🔍 API search results for user ${user_id}:`, results);
    }
    
    res.json({ 
      success: true,
      results: results || [],
      query: message,
      user_id: user_id,
      storage: mem0Client ? 'memgraph' : 'cloud_api',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error searching memories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search memories',
      details: error.message,
      results: []
    });
  }
});


// Add memory endpoint
app.post('/api/memory/add', authenticateApiKey, async (req, res) => {
  try {
    const { messages, user_id } = req.body;
    
    if (!messages || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: messages and user_id' 
      });
    }

    let result;
    if (mem0Client) {
      // Use Mem0 client with Memgraph integration
      console.log(`🔗 Adding memory to Memgraph for user ${user_id}`);
      result = await mem0Client.add(messages, { user_id });
      console.log(`✅ Memory added to Memgraph for user ${user_id}:`, result);
    } else {
      // Fallback to direct API call
      console.log(`⚠️ Using fallback API for user ${user_id} (Memgraph not available)`);
      result = await mem0Api.add(
        messages,
        {
          user_id: user_id,
          output_format: "v1.1",
          version: "v2"
        }
      );
      console.log(`✅ Memory added via API for user ${user_id}:`, result);
    }
    
    res.json({ 
      message: 'Memory added successfully',
      result: result,
      storage: mem0Client ? 'memgraph' : 'cloud_api'
    });
  } catch (error) {
    console.error('❌ Error adding memory:', error);
    res.status(500).json({ 
      error: 'Failed to add memory',
      details: error.message 
    });
  }
});

// Search memories endpoint
app.post('/api/memory/search', authenticateApiKey, async (req, res) => {
  try {
    const { query, user_id, limit = 5 } = req.body;
    
    if (!query || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: query and user_id' 
      });
    }

    let results;
    if (mem0Client) {
      // Use Mem0 client with Memgraph integration
      console.log(`🔗 Searching Memgraph for user ${user_id} with query "${query}"`);
      results = await mem0Client.search(query, { user_id, limit });
      console.log(`🔍 Memgraph search results for user ${user_id}:`, results);
    } else {
      // Fallback to direct API call
      console.log(`⚠️ Using fallback API search for user ${user_id} (Memgraph not available)`);
      results = await mem0Api.search(
        query,
        {
          user_id: user_id,
          limit: limit
        }
      );
      console.log(`🔍 API search results for user ${user_id}:`, results);
    }
    
    res.json({ 
      results: results || [],
      query: query,
      user_id: user_id,
      storage: mem0Client ? 'memgraph' : 'cloud_api'
    });
  } catch (error) {
    console.error('❌ Error searching memories:', error);
    res.status(500).json({ 
      error: 'Failed to search memories',
      details: error.message,
      results: []
    });
  }
});

// Get conversation context endpoint
app.get('/api/memory/context/:user_id', authenticateApiKey, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing user_id parameter' 
      });
    }

    // Get recent memories for context
    const filters = {
      "AND": [
        {
          "user_id": user_id
        }
      ]
    };

    const results = await mem0Api.search(
      "recent conversation context",
      {
        version: "v2",
        filters: filters,
        limit: 10
      }
    );

    const context = results
      ? results.map(result => result.memory).join(' ')
      : '';

    console.log(`📝 Context retrieved for user ${user_id}`);
    
    res.json({ 
      context: context,
      user_id: user_id,
      memories_count: results ? results.length : 0
    });
  } catch (error) {
    console.error('❌ Error getting context:', error);
    res.status(500).json({ 
      error: 'Failed to get conversation context',
      details: error.message,
      context: ''
    });
  }
});

// Get all memories for a user (admin endpoint)
app.get('/api/memory/user/:user_id', authenticateApiKey, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const filters = {
      "AND": [
        {
          "user_id": user_id
        }
      ]
    };

    const results = await mem0Api.search(
      "", // Empty query to get all memories
      {
        version: "v2",
        filters: filters,
        limit: 100
      }
    );

    res.json({ 
      memories: results || [],
      user_id: user_id,
      total_count: results ? results.length : 0
    });
  } catch (error) {
    console.error('❌ Error getting user memories:', error);
    res.status(500).json({ 
      error: 'Failed to get user memories',
      details: error.message,
      memories: []
    });
  }
});

// AI Recommendations endpoint
app.post('/api/recommendations', async (req, res) => {
  try {
    const {
      user_id,
      store_mode,
      products,
      selected_product,
      cart_items,
      wishlist_items,
      current_category,
      restaurants
    } = req.body;

    if (!user_id || !store_mode || !products) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, store_mode, and products'
      });
    }

    if (!groqClient) {
      // Fallback to popular products if Groq is not available
      const fallbackRecommendations = products
        .filter(p => p.category === current_category || !current_category)
        .slice(0, 4)
        .map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
          category: product.category
        }));

      return res.json({
        success: true,
        recommendations: fallbackRecommendations,
        reasoning: 'Showing popular items (AI recommendations unavailable)',
        confidence: 0.5,
        source: 'fallback'
      });
    }

    // Get user memories for context
    let userMemories = [];
    try {
      if (mem0Client) {
        userMemories = await mem0Client.search(
          `${store_mode} preferences shopping history`,
          { user_id, limit: 10 }
        );
      } else {
        userMemories = await mem0Api.search(
          `${store_mode} preferences shopping history`,
          { user_id, limit: 10 }
        );
      }
    } catch (memoryError) {
      console.warn('⚠️ Could not fetch user memories:', memoryError.message);
    }

    // Build context for AI
    const memoryContext = userMemories
      .map(memory => typeof memory === 'string' ? memory : memory.memory || memory.content)
      .join(' ');

    const contextPrompt = `
User Context:
- Store Mode: ${store_mode}
- Current Category: ${current_category || 'None'}
- Selected Product: ${selected_product ? selected_product.name : 'None'}
- Cart Items: ${cart_items?.length || 0} items
- Wishlist Items: ${wishlist_items?.length || 0} items
- User Memory: ${memoryContext || 'No previous preferences found'}
${restaurants?.length ? `- Available Restaurants: ${restaurants.map(r => r.name).join(', ')}` : ''}

Available Products (${products.length} total):
${products.slice(0, 20).map(p => `- ${p.name} (${p.category}) - $${p.price}`).join('\n')}

Please recommend 4 products that would be most relevant to this user based on their context and preferences. Consider their shopping history, current selections, and store mode.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "id": "product_id",
      "reasoning": "why this product fits the user"
    }
  ],
  "overall_reasoning": "explanation of recommendation strategy",
  "confidence": 0.85
}`;

    // Get AI recommendations with retry logic
    let completion;
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    while (retryCount < maxRetries) {
       try {
         // Use circuit breaker to protect against repeated API failures
         completion = await groqCircuitBreaker.execute(async () => {
           return await groqClient.chat.completions.create({
             messages: [
               {
                 role: 'system',
                 content: `You are an AI shopping assistant that provides personalized product recommendations. You analyze user context, preferences, and shopping behavior to suggest relevant products.`
               },
               {
                 role: 'user',
                 content: contextPrompt
               }
             ],
             model: 'meta-llama/llama-4-maverick-17b-128e-instruct', //'deepseek-r1-distill-llama-70b',
             temperature: 0.7,
             max_tokens: 1000
           });
         });
         break; // Success, exit retry loop
       } catch (apiError) {
        retryCount++;
        console.warn(`⚠️ Groq API attempt ${retryCount} failed:`, apiError.message);
        
        if (retryCount >= maxRetries) {
          console.error('❌ All Groq API retry attempts failed, using fallback');
          // Use intelligent fallback instead of throwing error
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
            reasoning: 'Smart recommendations based on your preferences (AI service temporarily unavailable)',
            confidence: 0.7,
            source: 'smart_fallback_api_error'
          });
        }
        
        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, retryCount - 1);
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('🤖 Raw AI Response:', aiResponse);

    // Parse AI response
    let aiRecommendations;
    try {
      console.log('🤖 Raw AI Response:', aiResponse.substring(0, 500) + '...');
      
      // Try to extract JSON from the response
      let jsonStr = aiResponse.trim();
      
      // Look for JSON object boundaries
      const firstBrace = jsonStr.indexOf('{');
      let lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      } else if (firstBrace !== -1) {
        // If we found opening brace but no closing, try to find incomplete JSON
        const partialJson = jsonStr.substring(firstBrace);
        // Try to complete the JSON structure
        const recommendationsMatch = partialJson.match(/"recommendations"\s*:\s*\[(.*?)(?:\]|$)/s);
        if (recommendationsMatch) {
          // Extract individual recommendation objects
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
      console.warn('📝 AI Response was:', aiResponse);
      
      // Use intelligent fallback instead of throwing error
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

    // Map AI recommendations to actual products
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

    // If we don't have enough AI recommendations, fill with popular products
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
    
    // Fallback to popular products
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

// Save recommendation interaction endpoint
app.post('/api/recommendations/interaction', async (req, res) => {
  try {
    const { user_id, product_id, interaction_type, product_name } = req.body;

    if (!user_id || !product_id || !interaction_type) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, product_id, and interaction_type'
      });
    }

    // Save interaction as memory
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

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Memory Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 Mem0 API Key configured: ${process.env.MEM0_API_KEY ? '✅' : '❌'}`);
  console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});