import { useState, useEffect, useCallback } from 'react';
import { productService, DatabaseProduct } from '../lib/supabase';
import { Product } from '../contexts/products';
import { restaurantMenuItems, getAllRestaurantCategories, getMenuItemsByRestaurant, getMenuItemsByCategory } from '../data/restaurants';

// Transform database product to app product format
const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    image: dbProduct.image,
    category: dbProduct.category,
    rating: dbProduct.rating || 0,
    inStock: dbProduct.in_stock ?? true,
    description: dbProduct.description,
    brand: dbProduct.brand,
    sizes: dbProduct.sizes || [],
    colors: dbProduct.colors || [],
    material: dbProduct.material,
    careInstructions: dbProduct.care_instructions,
    images: dbProduct.images || [dbProduct.image],
    tags: dbProduct.tags || [],
    discountPercentage: dbProduct.discount_percentage,
    originalPrice: dbProduct.original_price
  };
};

interface UseProductsOptions {
  storeMode?: 'fashion' | 'food';
  restaurantId?: string;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { storeMode = 'fashion', restaurantId } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (storeMode === 'food') {
        // Use restaurant menu items for food mode
        const menuItems = restaurantId 
          ? getMenuItemsByRestaurant(restaurantId)
          : restaurantMenuItems;
        setProducts(menuItems);
      } else {
        // Use Supabase products for fashion mode
        const dbProducts = await productService.getAllProducts();
        const transformedProducts = dbProducts.map(transformDatabaseProduct);
        setProducts(transformedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [storeMode, restaurantId]);

  // Fetch products by category
  const fetchProductsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const startTime = Date.now();
      setLoadingStartTime(startTime);
      
      if (storeMode === 'food') {
        // Filter restaurant menu items by category
        let filteredItems = getMenuItemsByCategory(category);
        
        // Further filter by restaurant if specified
        if (restaurantId) {
          const restaurantItems = getMenuItemsByRestaurant(restaurantId);
          filteredItems = filteredItems.filter(item => 
            restaurantItems.some(rItem => rItem.id === item.id)
          );
        }
        
        setProducts(filteredItems);
      } else {
        // Handle Gift category specially (may be empty)
        if (category === 'Gift') {
          // Set empty products for Gift category
          setProducts([]);
        } else {
          // Use Supabase for other fashion products
          const dbProducts = await productService.getProductsByCategory(category);
          const transformedProducts = dbProducts.map(transformDatabaseProduct);
          setProducts(transformedProducts);
        }
      }
      
      // Ensure minimum loading duration of 800ms for smooth animation
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 800;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    } catch (err) {
      console.error('Error fetching products by category:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
      setLoadingStartTime(null);
    }
  }, [storeMode, restaurantId]);

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const dbProducts = await productService.searchProducts(query);
      const transformedProducts = dbProducts.map(transformDatabaseProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      if (storeMode === 'food') {
        // Use restaurant categories for food mode
        const restaurantCategories = getAllRestaurantCategories();
        setCategories(restaurantCategories);
      } else {
        // Use Supabase categories for fashion mode
        const dbCategories = await productService.getCategories();
        
        // Ensure Clothing appears first and add Gift category
        const orderedCategories = [];
        
        // Add Clothing first if it exists
        if (dbCategories.includes('Clothing')) {
          orderedCategories.push('Clothing');
        }
        
        // Add other categories (excluding Clothing since it's already added)
        const otherCategories = dbCategories.filter(cat => cat !== 'Clothing');
        orderedCategories.push(...otherCategories);
        
        // Add Gift category if it doesn't exist
        if (!orderedCategories.includes('Gift')) {
          orderedCategories.push('Gift');
        }
        
        setCategories(orderedCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [storeMode]);

  // Get product by ID
  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const dbProduct = await productService.getProductById(id);
      return dbProduct ? transformDatabaseProduct(dbProduct) : null;
    } catch (err) {
      console.error('Error fetching product by ID:', err);
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories, storeMode, restaurantId]);

  return {
    products,
    loading,
    error,
    categories,
    fetchProducts,
    fetchProductsByCategory,
    searchProducts,
    getProductById,
    refetch: fetchProducts
  };
};