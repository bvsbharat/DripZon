import { memoryService } from './memoryService';
import { Product } from '../contexts/products';
import { Restaurant } from '../data/restaurants';

interface RecommendationRequest {
  userId: string;
  storeMode: 'fashion' | 'food';
  products: Product[];
  restaurants?: Restaurant[];
  currentContext?: {
    selectedProduct?: Product;
    cartItems?: Product[];
    wishlistItems?: Product[];
    currentCategory?: string;
    recentSearches?: string[];
  };
}

interface RecommendationResponse {
  recommendations: Product[];
  reasoning: string;
  confidence: number;
}

class RecommendationService {
  private readonly serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_MEMORY_SERVICE_URL || 'http://localhost:3001';
  }

  async getPersonalizedRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      // Transform request to match server's expected format
      const serverRequest = {
        user_id: request.userId,
        store_mode: request.storeMode,
        products: request.products,
        restaurants: request.restaurants,
        selected_product: request.currentContext?.selectedProduct,
        cart_items: request.currentContext?.cartItems,
        wishlist_items: request.currentContext?.wishlistItems,
        current_category: request.currentContext?.currentCategory,
        recent_searches: request.currentContext?.recentSearches
      };

      const response = await fetch(`${this.serverUrl}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverRequest),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // The server returns full product objects, not just IDs
      const recommendedProducts = result.recommendations || [];

      return {
        recommendations: recommendedProducts,
        reasoning: result.reasoning || result.overall_reasoning || 'AI-powered recommendations',
        confidence: result.confidence || 0.8
      };

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      
      // Fallback to basic recommendations
      return this.getFallbackRecommendations(request);
    }
  }

  private buildContextPrompt(request: RecommendationRequest, userMemories: string): string {
    const { storeMode, products, currentContext } = request;
    
    let prompt = `
Store Mode: ${storeMode}
User Memories/Preferences: ${userMemories}

`;

    if (currentContext) {
      prompt += `Current Context:
`;
      if (currentContext.selectedProduct) {
        prompt += `- Currently viewing: ${currentContext.selectedProduct.name} (${currentContext.selectedProduct.category})
`;
      }
      if (currentContext.cartItems && currentContext.cartItems.length > 0) {
        prompt += `- Cart items: ${currentContext.cartItems.map(item => item.name).join(', ')}
`;
      }
      if (currentContext.wishlistItems && currentContext.wishlistItems.length > 0) {
        prompt += `- Wishlist items: ${currentContext.wishlistItems.map(item => item.name).join(', ')}
`;
      }
      if (currentContext.currentCategory) {
        prompt += `- Current category: ${currentContext.currentCategory}
`;
      }
      if (currentContext.recentSearches && currentContext.recentSearches.length > 0) {
        prompt += `- Recent searches: ${currentContext.recentSearches.join(', ')}
`;
      }
    }

    prompt += `
Available Products:
`;
    products.slice(0, 50).forEach(product => {
      prompt += `- ID: ${product.id}, Name: ${product.name}, Category: ${product.category}, Price: $${product.price}, Rating: ${product.rating}, Description: ${product.description}
`;
    });

    if (storeMode === 'fashion') {
      prompt += `
Please recommend 6-8 fashion products that best match the user's style preferences, current context, and shopping behavior. Consider factors like:
- Style compatibility with current selections
- Price range preferences
- Category preferences
- Seasonal appropriateness
- Trending items
- Complementary items to cart/wishlist

Return product IDs in the recommendations array.`;
    } else {
      prompt += `
Please recommend 6-8 food items that best match the user's taste preferences, dietary habits, and current context. Consider factors like:
- Cuisine preferences
- Dietary restrictions
- Price range
- Meal timing
- Popular items
- Complementary items to current order

Return product IDs in the recommendations array.`;
    }

    return prompt;
  }

  private mapProductIds(productIds: string[], products: Product[]): Product[] {
    const recommendations: Product[] = [];
    
    productIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product) {
        recommendations.push(product);
      }
    });

    // If we don't have enough recommendations, add some popular products
    if (recommendations.length < 6) {
      const popularProducts = products
        .filter(p => !recommendations.some(r => r.id === p.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6 - recommendations.length);
      
      recommendations.push(...popularProducts);
    }

    return recommendations.slice(0, 8); // Limit to 8 recommendations
  }

  private getFallbackRecommendations(request: RecommendationRequest): RecommendationResponse {
    // Simple fallback: return highest rated products
    const fallbackProducts = request.products
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    return {
      recommendations: fallbackProducts,
      reasoning: "Showing popular items based on ratings (AI recommendations temporarily unavailable)",
      confidence: 0.5
    };
  }

  async saveRecommendationInteraction(userId: string, productId: string, action: 'view' | 'click' | 'add_to_cart' | 'purchase'): Promise<void> {
    try {
      const interactionMessage = `User ${action} recommended product ${productId}`;
      await memoryService.addMemory(
        [{ role: 'user', content: interactionMessage }],
        userId
      );
    } catch (error) {
      console.error('Error saving recommendation interaction:', error);
    }
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;