import axios from 'axios';

interface MemoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AddMemoryRequest {
  messages: MemoryMessage[];
  user_id: string;
}

interface SearchMemoryRequest {
  query: string;
  user_id: string;
  limit?: number;
}

interface MemoryResult {
  memory: string;
  score: number;
  id: string;
}

interface SearchMemoryResponse {
  results: MemoryResult[];
}

class MemoryService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_MEMORY_SERVICE_URL || 'http://localhost:3001';
    this.apiKey = import.meta.env.VITE_MEM0_API_KEY || '';
  }

  async addMemory(messages: MemoryMessage[], userId: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/add`,
        {
          message: messages.map(m => m.content).join(' '),
          user_id: userId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.message || 'Memory added successfully';
    } catch (error) {
      console.error('Error adding memory:', error);
      throw new Error('Failed to add memory');
    }
  }

  async searchMemories(query: string, userId: string, limit: number = 5): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/search`,
        {
          message: query,
          user_id: userId,
          limit
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const memories = response.data.results
        .map(result => result.memory || result.text || result)
        .join(' ');
      
      return memories || 'No memories found';
    } catch (error) {
      console.error('Error searching memories:', error);
      return 'No memories found';
    }
  }

  async getConversationContext(userId: string): Promise<string> {
    try {
      // Use search with a general query to get user context
      return await this.searchMemories('user preferences behavior', userId, 10);
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return '';
    }
  }
}

export const memoryService = new MemoryService();
export type { MemoryMessage, MemoryResult };