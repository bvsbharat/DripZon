# Dripify AI Backend Service

Advanced backend service powering Dripify's AI-driven shopping experience with memory persistence, intelligent recommendations, and multi-modal AI integrations.

## 🌟 Features

- 🧠 **Persistent Memory**: Store and retrieve conversation context using Mem0 AI
- 🕸️ **Graph Memory**: Advanced relationship mapping with Memgraph integration
- 🤖 **AI Recommendations**: Groq-powered intelligent product suggestions with circuit breaker resilience
- 🎤 **Voice Integration**: Seamless ElevenLabs voice agent memory management
- 👤 **User-Specific Memory**: Individual memory storage and retrieval per user
- 🔍 **Semantic Search**: Context-aware memory search and retrieval
- 🔒 **Secure Authentication**: API key-based security for all endpoints
- 📊 **Smart Fallbacks**: Intelligent recommendation fallbacks when AI services are unavailable
- 🔄 **Circuit Breaker**: API resilience with automatic failure recovery
- 📈 **Performance Monitoring**: Real-time API health and performance tracking

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Memgraph

Memgraph is required for graph memory functionality. You can run it using Docker:

```bash
# Run Memgraph with Docker (recommended)
docker run -p 7687:7687 memgraph/memgraph-mage:latest --schema-info-enabled=True
```

The `--schema-info-enabled` flag is set to `True` for more performant schema generation. <mcreference link="https://docs.mem0.ai/open-source/graph_memory/overview" index="0">0</mcreference>

Memgraph will be available at `bolt://localhost:7687` (default configuration).

### 3. Environment Configuration

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Required: Mem0 API Key
MEM0_API_KEY=your-mem0-api-key-here

# Memgraph Configuration
MEMGRAPH_URI=bolt://localhost:7687
MEMGRAPH_USERNAME=
MEMGRAPH_PASSWORD=

# Optional: Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Get Mem0 API Key

1. Visit [Mem0.ai](https://mem0.ai)
2. Sign up for an account
3. Navigate to your dashboard
4. Generate an API key
5. Add it to your `.env` file

### 5. Start the Memory Service

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The service will start on `http://localhost:3001`

### 6. Configure Frontend

Update your frontend `.env` file:

```env
VITE_MEM0_API_KEY=your-mem0-api-key-here
VITE_MEMORY_SERVICE_URL=http://localhost:3001
```

## 🔌 API Endpoints

### Health & Monitoring

```
GET /health
Response: Comprehensive health check with component status
```

```
GET /api/status
Response: Detailed API status including circuit breaker state
```

### Memory Management

```
POST /api/add
Body: {
  "message": "conversation content",
  "user_id": "user_123"
}
Response: Memory storage confirmation
```

```
POST /api/search
Body: {
  "message": "search query",
  "user_id": "user_123",
  "limit": 5
}
Response: Relevant memories and context
```

### AI Recommendations

```
POST /api/recommendations
Body: {
  "user_id": "user_123",
  "store_mode": "fashion|food",
  "products": [...],
  "selected_product": {...},
  "cart_items": [...],
  "current_category": "category_name"
}
Response: AI-powered product recommendations with reasoning
```

```
POST /api/recommendations/interaction
Body: {
  "user_id": "user_123",
  "product_id": "product_id",
  "interaction_type": "viewed|liked|purchased",
  "product_name": "Product Name"
}
Response: Interaction tracking for improved recommendations
```

### ElevenLabs Integration

```
POST /api/elevenlabs/add-memories
Body: {
  "message": "conversation content",
  "user_id": "user_123"
}
Response: Memory storage via ElevenLabs integration
```

```
POST /api/elevenlabs/retrieve-memories
Body: {
  "message": "search query",
  "user_id": "user_123"
}
Response: Memory retrieval for voice interactions
```

### Authenticated Endpoints (Require API Key)

```
POST /api/memory/add
Headers: Authorization: Bearer <MEM0_API_KEY>
```

```
POST /api/memory/search
Headers: Authorization: Bearer <MEM0_API_KEY>
```

```
GET /api/memory/context/:user_id
Headers: Authorization: Bearer <MEM0_API_KEY>
```

Headers: Authorization: Bearer <MEM0_API_KEY>

````

## Frontend Integration

### Using the Enhanced Component

Replace your existing `RiyaInteractionHub` with `RiyaInteractionHubWithMemory`:

```tsx
import RiyaInteractionHubWithMemory from "./components/RiyaInteractionHubWithMemory";

// In your component
<RiyaInteractionHubWithMemory />;
````

### Memory Features

- **Automatic Memory Storage**: All conversations are automatically stored
- **Context Retrieval**: Previous conversation context is loaded on component mount
- **Memory Toggle**: Users can enable/disable memory with the brain icon
- **Enhanced Tools**: All ElevenLabs tools now include memory context

## Memory Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Memory Service │    │     Mem0 AI     │
│  (React App)    │◄──►│  (Express.js)   │◄──►│   (Cloud API)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
   ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
   │ Voice   │             │ Memory  │             │ Vector  │
   │ Agent   │             │ Storage │             │Database │
   │(11Labs) │             │ & Search│             │ & AI    │
   └─────────┘             └─────────┘             └─────────┘
                                   │
                                   │
                              ┌────▼────┐
                              │Memgraph │
                              │ Graph   │
                              │Database │
                              └─────────┘
```

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**

   - Check your MEM0_API_KEY in the server `.env` file
   - Ensure the API key is valid and active

2. **"Connection Refused"**

   - Make sure the memory service is running on port 3001
   - Check if the VITE_MEMORY_SERVICE_URL is correct in frontend

3. **"No memories found"**

   - This is normal for new users
   - Memories will accumulate as conversations happen

4. **Memgraph Connection Issues**

   - Ensure Memgraph is running: `docker ps` should show memgraph container
   - Check if port 7687 is accessible: `telnet localhost 7687`
   - Verify MEMGRAPH_URI in `.env` file (default: `bolt://localhost:7687`)
   - Check health endpoint for Memgraph status: `GET /health`

5. **Graph Memory Test Failures**
   - Run the graph test endpoint: `GET /api/graph/test`
   - Check server logs for detailed error messages
   - Ensure Mem0 client is properly initialized with graph store configuration

### Logs

The service provides detailed logging:

- ✅ Success operations
- ❌ Error operations
- 🧠 Memory operations
- 🔍 Search operations
- 📝 Context operations

## Development

### Running in Development

```bash
# Terminal 1: Start memory service
cd server
npm run dev

# Terminal 2: Start frontend
cd ..
npm run dev
```

### Testing the Integration

1. Start both services
2. Open the frontend application
3. Enable memory (brain icon should be green)
4. Start a voice conversation
5. Ask about previous conversations to test memory retrieval

## Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3001
MEM0_API_KEY=your-production-mem0-key
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment (Optional)

Create a `Dockerfile` in the server directory:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Support

For issues and questions:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Mem0 API key has sufficient credits
4. Test the health endpoint: `curlhttps://drip-backend-iota.vercel.app/health`
