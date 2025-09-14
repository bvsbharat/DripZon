# Dripify 🛍️✨

> **Your Personal AI-Powered Super-App for Fashion & Food**

Dripify is a revolutionary multi-store shopping application that combines fashion and food delivery into one seamless AI-powered experience. Built with cutting-edge technologies including Tavus AI, ElevenLabs, and advanced memory systems, it offers intelligent, personalized shopping across multiple domains.

## 🌟 Key Features

### 🤖 Advanced AI Integration

- **Tavus Video AI Agent**: Real-time conversational AI with video avatars for human-like interactions
- **ElevenLabs Voice Assistant**: Natural voice commands and responses with memory persistence
- **Mem0 AI Memory System**: Personalized recommendations based on conversation history and preferences
- **Groq AI Recommendations**: Intelligent product suggestions using advanced language models
- **Smart Context Switching**: Seamless transitions between fashion and food modes

### 🛒 Dual-Store Experience

- **Fashion Mode**: Browse clothing, bags, watches, and shoes with virtual try-on capabilities
- **Food Delivery Mode**: Order from multiple restaurants with full menu browsing
- **Intelligent Mode Switching**: AI automatically detects and switches between modes based on user intent
- **Unified Cart System**: Single cart experience across both store modes
- **Cross-Domain Memory**: AI remembers preferences across fashion and food interactions

### 👗 Virtual Try-On Technology

- **Fashn.ai Integration**: Advanced AI-powered virtual try-on for clothing items
- **Multiple Model Support**: Choose from predefined models or upload custom photos
- **Real-time Processing**: Live status updates during try-on generation
- **Result Gallery**: Save and manage generated try-on images
- **Video Generation**: Convert try-on results into dynamic videos using MiniMax Hailuo

### 🍕 Food Delivery Features

- **Multi-Restaurant Support**: Browse menus from various restaurants
- **Category-Based Navigation**: Organized by appetizers, main courses, desserts, and beverages
- **Restaurant Profiles**: Detailed information including cuisine type, ratings, and delivery times
- **Smart Food Recommendations**: AI suggests dishes based on preferences and order history

### 🧠 Memory & Personalization

- **Persistent Memory**: Conversations and preferences stored using Mem0 AI
- **Graph Memory**: Advanced relationship mapping with Memgraph integration
- **User Context Awareness**: AI remembers shopping history, preferences, and past interactions
- **Personalized Introductions**: Tailored greetings based on user history
- **Smart Recommendations**: Context-aware product suggestions using conversation history

### 🎨 Modern UI/UX

- **Glass Morphism Design**: Beautiful translucent UI elements with backdrop blur effects
- **Dynamic Wallpapers**: Customizable background themes with smooth transitions
- **Smooth Animations**: Fluid transitions powered by Motion (Framer Motion)
- **Responsive Design**: Optimized for all screen sizes and devices
- **Interactive Elements**: Hover effects, micro-interactions, and visual feedback

## 🚀 Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with strict mode
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Motion (Framer Motion)** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icon library

### AI & Machine Learning

- **Tavus AI** - Real-time conversational AI with video avatars
- **ElevenLabs** - Advanced voice synthesis and speech recognition
- **Mem0 AI** - Persistent memory and personalization system
- **Groq** - High-performance AI inference for recommendations
- **Fashn.ai** - Virtual try-on technology for fashion items
- **MiniMax Hailuo** - Video generation from static images

### Backend & Database

- **Express.js** - RESTful API server with TypeScript support
- **Supabase** - PostgreSQL database with real-time capabilities
- **Memgraph** - Graph database for advanced memory relationships
- **Daily.co** - Real-time video communication infrastructure

### State Management & Architecture

- **React Context API** - Global state management with multiple contexts
- **Custom Hooks** - Reusable stateful logic and data fetching
- **Circuit Breaker Pattern** - API resilience and error handling
- **Memory Service Architecture** - Centralized memory management

### Additional Libraries

- **Axios** - HTTP client with interceptors and error handling
- **React Icons** - Extended icon collection
- **React Canvas Confetti** - Celebration effects and animations
- **UUID** - Unique identifier generation
- **Motion** - Animation library
- **React Canvas Confetti** - Celebration effects

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── home/            # Home page components (product display, navigation)
│   ├── pages/           # Page components (HomePage, CartPage, etc.)
│   ├── LandingPage.tsx  # Dynamic landing page with video backgrounds
│   ├── MainContent.tsx  # Main app content router
│   ├── RiyaInteractionHub.tsx # AI voice/video interaction center
│   ├── TavusVideoAgent.tsx # Tavus AI video agent integration
│   ├── VoiceAssistant.tsx # ElevenLabs voice integration
│   ├── PhotoSelectionModal.tsx # Virtual try-on photo selection
│   ├── RecommendationSection.tsx # AI-powered recommendations
│   └── ...
├── contexts/            # React contexts for state management
│   ├── AuthContext.tsx  # User authentication state
│   ├── ShoppingContext.tsx # Shopping cart, products, try-on state
│   ├── VoiceContext.tsx # Voice assistant state
│   ├── WallpaperContext.tsx # Dynamic theme management
│   ├── UserContext.tsx  # User profile and preferences
│   └── products.ts      # Product type definitions
├── data/               # Static data and configurations
│   ├── restaurants.ts   # Restaurant data for food mode
│   ├── demo.ts         # Demo data and configurations
│   └── mock-data.json  # Mock product data
├── services/           # External API integrations
│   ├── memoryService.ts # Mem0 AI memory management
│   └── recommendationService.ts # AI recommendation logic
├── hooks/              # Custom React hooks
│   └── useProducts.ts  # Product data fetching and management
├── config/             # Configuration files
│   └── tavusConfig.ts  # Tavus AI configuration and tools
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
└── main.tsx           # Application entry point

server/                 # Backend API server
├── server.js          # Express server with AI integrations
├── api/               # API route handlers
│   └── index.js       # Vercel serverless function entry
├── package.json       # Server dependencies
└── vercel.json        # Vercel deployment configuration
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Memgraph database (optional, for advanced memory features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd next-gen-e-com
   ```

2. **Install Frontend Dependencies**

   ```bash
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Environment Configuration

#### Frontend Environment Setup

Create a `.env` file in the root directory using the provided example:

```bash
cp .env.example .env
```

Update the `.env` file with your API keys:

```env
# ElevenLabs Voice AI Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here

# Tavus Video AI Configuration
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_TAVUS_REPLICA_ID=your_tavus_replica_id_here
VITE_TAVUS_PERSONA_ID=your_tavus_persona_id_here
VITE_TAVUS_AGENT_ID=your_tavus_agent_id_here

# Virtual Try-On Configuration
VITE_FASHN_API_KEY=your_fashn_api_key_here

# Database Configuration
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_URL=your_supabase_url_here

# Memory & AI Services
VITE_MEM0_API_KEY=your_mem0_api_key_here
VITE_MEM0_ORG_ID=your_mem0_org_id_here
VITE_GROQ_API_KEY=your_groq_api_key_here

# Video Generation
VITE_MINIMAX_API_KEY=your_minimax_api_key_here

# Additional AI Services (Optional)
VITE_VAPI_API_KEY=your_vapi_api_key_here
VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
VITE_HEDRA_API_KEY=your_hedra_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Backend Service URL
VITE_MEMORY_SERVICE_URL=http://localhost:3001
VITE_BACKEND_URL=http://localhost:3001
```

#### Server Environment Setup

Create a `.env` file in the server directory:

```bash
cd server
cp .env.example .env
```

Update the `server/.env` file:

```env
# Mem0 API Configuration
MEM0_API_KEY=your_mem0_api_key_here

# Memgraph Configuration (Optional)
MEMGRAPH_URI=bolt://localhost:7687
MEMGRAPH_USERNAME=your_memgraph_username
MEMGRAPH_PASSWORD=your_memgraph_password

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
AGENT_ID=your_agent_id_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# User Configuration
DEFAULT_USER_ID=user_001
DEFAULT_USER_NAME=User
DEFAULT_USER_EMAIL=user@example.com

# AI Recommendation Service
GROQ_API_KEY=your_groq_api_key_here
```

### Running the Application

#### Option 1: Run Both Services Separately

1. **Start the Backend Server**

   ```bash
   cd server
   npm run dev
   ```

   The server will start on `http://localhost:3001`

2. **Start the Frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

#### Option 2: Quick Start (Recommended)

1. **Start Backend Server**

   ```bash
   cd server && npm run dev
   ```

2. **Start Frontend (in new terminal)**

   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### API Keys Setup Guide

#### Required API Keys:

1. **ElevenLabs Voice AI**

   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Get your API key from the dashboard
   - Create a conversational agent and get the Agent ID
   - Optional: Get a specific Voice ID for custom voices

2. **Tavus Video AI**

   - Sign up at [Tavus](https://tavus.io/)
   - Create a replica (digital avatar) and get the Replica ID
   - Create a persona with shopping tools and get the Persona ID
   - Get your API key and Agent ID from the dashboard

3. **Fashn.ai Virtual Try-On**

   - Sign up at [Fashn.ai](https://fashn.ai/)
   - Get your API key for virtual try-on functionality

4. **Supabase Database**

   - Create a project at [Supabase](https://supabase.com/)
   - Get your project URL and anon key from settings
   - Set up product tables using provided migration files

5. **Mem0 AI Memory System**

   - Sign up at [Mem0](https://mem0.ai/)
   - Get your API key and organization ID from the dashboard
   - This enables persistent conversation memory

6. **Groq AI Recommendations**

   - Sign up at [Groq](https://groq.com/)
   - Get your API key for high-performance AI inference
   - Used for intelligent product recommendations

7. **MiniMax Video Generation**
   - Sign up at [MiniMax](https://api.minimax.io/)
   - Get your API key for video generation from try-on images

#### Optional API Keys:

8. **VAPI AI** (Alternative voice solution)

   - Sign up at [VAPI](https://vapi.ai/)
   - Get API key and assistant ID

9. **Hedra AI** (Alternative video generation)

   - Sign up at [Hedra](https://hedra.com/)
   - Get API key for video generation

10. **OpenAI** (Backup AI service)
    - Sign up at [OpenAI](https://openai.com/)
    - Get API key for additional AI capabilities

### Database Setup (Optional)

#### Memgraph Setup

For advanced memory features, install Memgraph:

```bash
# Using Docker (Recommended)
docker run -it -p 7687:7687 -p 7444:7444 -p 3000:3000 memgraph/memgraph-platform

# Or install locally following Memgraph documentation
```

#### Supabase Setup

1. Create tables using the migration files in `supabase/migrations/`
2. Run migrations:
   ```bash
   npx supabase db push
   ```

## 📜 Available Scripts

### Frontend Scripts

- `npm run dev` - Start frontend development server (http://localhost:5173)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

### Server Scripts

- `cd server && npm run dev` - Start backend server with auto-reload (http://localhost:3001)
- `cd server && npm start` - Start backend server in production mode

### Development Workflow

1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev` (in new terminal)
3. Access application at `http://localhost:5173`

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

If you get a port conflict error:

```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

#### Environment Variables Not Loading

- Ensure `.env` files are in the correct directories
- Restart both servers after updating environment variables
- Check that variable names start with `VITE_` for frontend variables

#### API Connection Issues

- Verify all API keys are correctly set
- Check that the backend server is running on port 3001
- Ensure CORS is properly configured in server settings

#### Database Connection Issues

- For Memgraph: Ensure Docker container is running on port 7687
- For Supabase: Verify URL and anon key are correct in environment variables
- Check network connectivity to external services

#### AI Service Issues

- **Tavus Video Agent**: Verify replica and persona IDs are correctly configured
- **ElevenLabs Voice**: Check agent ID and voice ID settings
- **Virtual Try-On**: Ensure Fashn.ai API key has sufficient credits
- **Memory Service**: Verify Mem0 API key and organization ID
- **Recommendations**: Check Groq API key and rate limits

#### Memory and Personalization Issues

- Memory not persisting: Check backend server connection and Mem0 configuration
- Recommendations not working: Verify Groq API key and check circuit breaker status
- Context not loading: Ensure user ID consistency across sessions

### Development Tips

- Use browser developer tools to check console for errors
- Monitor network tab for failed API requests and API key issues
- Check server logs for backend errors and AI service responses
- Test individual AI services using the health endpoints
- Verify all environment variables are properly set with `VITE_` prefix
- Use the `/api/status` endpoint to check circuit breaker states
- Monitor memory service logs for Mem0 and Memgraph connectivity

## 🎯 Key Components

### LandingPage

Dynamic entry point with adaptive theming:

- Glass morphism design with dynamic color extraction
- Multi-media backgrounds (video/image rotation)
- Context-aware messaging based on current media
- Smooth authentication flow integration
- Responsive design for all screen sizes

### RiyaInteractionHub

Central AI interaction center:

- Voice conversation with ElevenLabs integration
- Video chat with Tavus AI avatars
- Memory-powered personalized interactions
- Smart tool integration for shopping actions
- Context-aware responses based on store mode

### TavusVideoAgent

Advanced video AI agent:

- Real-time video conversations with AI avatars
- Shopping tool integration (search, add to cart, try-on)
- Memory persistence across conversations
- Multi-store mode support (fashion/food)
- Daily.co integration for video infrastructure

### ShoppingContext

Comprehensive dual-store state management:

- Fashion and food mode switching
- Product catalog with Supabase integration
- Virtual try-on state management
- Cart and wishlist functionality across modes
- Restaurant selection and menu browsing
- AI-powered recommendation integration

### Memory Service

Persistent AI memory system:

- Mem0 AI integration for conversation history
- Memgraph graph database for relationship mapping
- User preference learning and storage
- Context-aware memory retrieval
- Cross-session personalization

### Virtual Try-On System

Advanced fashion visualization:

- Fashn.ai integration for realistic try-on
- Multiple model support with custom photo uploads
- Real-time processing status tracking
- Generated image gallery and management
- Video generation from try-on results

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configurations for:

- Glass morphism effects
- Custom animations
- Responsive breakpoints
- Color schemes

### Vite Configuration

Optimized build configuration with:

- React plugin integration
- Dependency optimization
- Fast HMR (Hot Module Replacement)

## 🌐 API Integration

### Tavus AI Integration

- Real-time conversational AI
- Video avatar generation
- Natural language processing

### ElevenLabs Integration

- Voice synthesis
- Speech recognition
- Multi-language support

## 🎨 Design System

### Color Palette

- Primary: Cyan/Blue gradients
- Secondary: Purple/Teal accents
- Glass effects with transparency
- High contrast text for accessibility

### Typography

- Modern, clean font stack
- Responsive text sizing
- Proper hierarchy and spacing

## 🚀 Deployment

### Frontend Deployment

#### Build for Production

```bash
npm run build
```

#### Preview Production Build

```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

#### Environment Variables for Production

Ensure all `VITE_` prefixed environment variables are set in your hosting platform:

- `VITE_ELEVENLABS_API_KEY`
- `VITE_TAVUS_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MEMORY_SERVICE_URL` (your deployed backend URL)
- And all other required variables

### Backend Deployment

#### Deploy to Cloud Platforms

The backend can be deployed to:

- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS/GCP/Azure

#### Production Environment Setup

1. Set all environment variables in your hosting platform
2. Update `VITE_MEMORY_SERVICE_URL` in frontend to point to your deployed backend
3. Configure CORS `ALLOWED_ORIGINS` to include your frontend domain

#### Docker Deployment (Optional)

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Tavus AI** - For providing cutting-edge conversational AI technology
- **ElevenLabs** - For advanced voice synthesis capabilities
- **Daily.co** - For real-time communication infrastructure
- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

For support, email support@Dripify.com or join our community Discord.

---

**Dripify** - Redefining how you shop online with AI-powered conversations and effortless fashion discovery. 🛍️✨

## 📊 Implementation Status

### ✅ Completed Features

- **Multi-Store Architecture**: Fashion and food delivery modes with intelligent switching
- **Advanced AI Integration**: Tavus video agents, ElevenLabs voice, and Mem0 memory systems
- **Virtual Try-On**: Fashn.ai integration with video generation capabilities
- **Memory Persistence**: Conversation history and user preferences across sessions
- **Smart Recommendations**: AI-powered product suggestions with fallback systems
- **Real-time Interactions**: Voice and video conversations with context awareness
- **Dynamic UI**: Glass morphism design with adaptive theming and smooth animations
- **Database Integration**: Supabase for products and Memgraph for memory relationships
- **API Resilience**: Circuit breaker patterns and intelligent error handling

### 🚧 In Progress

- **Production Deployment**: Optimizing for scale and performance monitoring
- **Enhanced Analytics**: User interaction tracking and behavior analysis
- **Mobile Optimization**: Progressive Web App features and mobile-specific interactions
- **Advanced Personalization**: Machine learning-based preference modeling

### 🔮 Planned Features

- **Multi-language Support**: Internationalization for global markets
- **Social Features**: Sharing try-on results and collaborative shopping
- **AR Integration**: Augmented reality try-on experiences
- **Voice Commerce**: Complete voice-driven shopping workflows
- **Advanced Analytics**: Comprehensive user behavior insights

## 🏗️ Architecture Highlights

- **Microservices Design**: Separate frontend and backend with clear API boundaries
- **AI-First Approach**: Every interaction enhanced by artificial intelligence
- **Memory-Driven UX**: Persistent context across all user interactions
- **Resilient Systems**: Circuit breakers and fallbacks for reliable operation
- **Modern Stack**: Latest React, TypeScript, and AI technologies

---

Made with ❤️ by the open source community
