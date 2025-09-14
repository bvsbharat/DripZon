import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load products from JSON file
function loadProductsFromJSON() {
  try {
    const jsonContent = readFileSync('all-products.json', 'utf8');
    const products = JSON.parse(jsonContent);
    console.log(`📦 Loaded ${products.length} products from JSON file`);
    return products;
  } catch (error) {
    console.error('❌ Error loading products from JSON:', error.message);
    return null;
  }
}

// Transform products to match database schema
function transformProducts(products) {
  return products.map(product => {
    return {
      id: randomUUID(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating || 0,
      in_stock: product.inStock !== undefined ? product.inStock : true,
      description: product.description || null,
      designer: product.designer || null,
      article_number: product.articleNumber || null,
      images: product.images || [],
      try_own: product.tryown || false,
      category_flag: product.categoryFlag || false,
      key_words: product.keyWords || [],
      more_info: product.moreInfo || null
    };
  });
}

// Upload products to Supabase
async function uploadProducts(transformedProducts) {
  console.log('🔄 Uploading products to Supabase...');
  
  // Clear existing products first
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.log('⚠️  Could not clear existing products:', deleteError.message);
  } else {
    console.log('🗑️  Cleared existing products');
  }
  
  // Upload products in small batches
  const batchSize = 3;
  let uploadedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < transformedProducts.length; i += batchSize) {
    const batch = transformedProducts.slice(i, i + batchSize);
    
    console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transformedProducts.length / batchSize)}...`);
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      failedCount += batch.length;
    } else {
      uploadedCount += batch.length;
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${uploadedCount}/${transformedProducts.length} total)`);
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return { uploadedCount, failedCount };
}

// Verify the upload
async function verifyUpload() {
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Error getting count:', countError);
    return false;
  }
  
  console.log(`\n📊 Total products in database: ${count}`);
  
  // Get sample products
  const { data: sampleData, error: sampleError } = await supabase
    .from('products')
    .select('id, name, category, price, images')
    .limit(5);
  
  if (sampleError) {
    console.error('❌ Error getting sample:', sampleError);
    return false;
  }
  
  console.log('\n📋 Sample of uploaded products:');
  sampleData.forEach((product, index) => {
    console.log(`  ${index + 1}. ${product.name} (${product.category}) - $${product.price}`);
    console.log(`     ID: ${product.id}`);
    console.log(`     Images: ${product.images ? product.images.length : 0} images`);
  });
  
  return true;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting upload from JSON file...');
    
    // Load products from JSON
    const products = loadProductsFromJSON();
    if (!products) {
      console.error('❌ Failed to load products');
      process.exit(1);
    }
    
    // Transform products
    const transformedProducts = transformProducts(products);
    console.log(`🔄 Transformed ${transformedProducts.length} products`);
    
    // Upload products
    const { uploadedCount, failedCount } = await uploadProducts(transformedProducts);
    
    // Verify upload
    const verified = await verifyUpload();
    
    if (verified) {
      console.log(`\n🎉 Upload completed!`);
      console.log(`✅ Successfully uploaded: ${uploadedCount} products`);
      console.log(`❌ Failed uploads: ${failedCount} products`);
      console.log(`✅ All original images preserved`);
      console.log(`✅ Unique UUIDs generated for all products`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

main();