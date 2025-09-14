import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  in_stock?: boolean;
  description?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  material?: string;
  care_instructions?: string;
  images?: string[];
  tags?: string[];
  discount_percentage?: number;
  original_price?: number;
  created_at?: string;
  updated_at?: string;
}

// Product service functions
export const productService = {
  // Fetch all products
  async getAllProducts(): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return data || [];
  },

  // Fetch products by category
  async getProductsByCategory(category: string): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
    
    return data || [];
  },

  // Fetch single product by ID
  async getProductById(id: string): Promise<DatabaseProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
    
    return data;
  },

  // Search products
  async searchProducts(query: string): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, brand.ilike.%${query}%`)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get unique categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('in_stock', true);
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories;
  }
};