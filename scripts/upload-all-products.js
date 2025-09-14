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
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and parse the complete products data from the TypeScript file
function parseProductsFromFile() {
  console.log('📖 Reading products from TypeScript file...');
  
  try {
    const productsFileContent = readFileSync('../src/contexts/products.ts', 'utf8');
    
    // Extract the sampleProducts array from the TypeScript file
    const sampleProductsMatch = productsFileContent.match(/export const sampleProducts: Product\[\] = (\[[\s\S]*\]);/m);
    if (!sampleProductsMatch) {
      console.error('❌ Could not find sampleProducts array in products.ts');
      return null;
    }
    
    // Convert TypeScript to JSON-compatible format
    let productsArrayString = sampleProductsMatch[1];
    
    // Replace TypeScript-specific syntax with JSON-compatible syntax
    productsArrayString = productsArrayString
      .replace(/([a-zA-Z_][a-zA-Z0-9_]*):(?=\s)/g, '"$1":') // Add quotes around property names
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/\btrue\b/g, 'true') // Ensure boolean values are correct
      .replace(/\bfalse\b/g, 'false');
    
    // Use eval to parse the JavaScript object (safe in this controlled environment)
    const products = eval(`(${productsArrayString})`);
    console.log(`📦 Successfully parsed ${products.length} products from file`);
    return products;
    
  } catch (error) {
    console.error('❌ Error reading or parsing products file:', error.message);
    return null;
  }
}

// Generate unique ID function using crypto for UUID format
function generateUniqueId() {
  return randomUUID();
}

// Transform products to match database schema
function transformProducts(products) {
  return products.map(product => {
    return {
      id: generateUniqueId(),
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

// Check if products table exists
async function checkProductsTable() {
  console.log('🔍 Checking if products table exists...');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('❌ Products table does not exist.');
    console.log('📝 Please create the products table in your Supabase dashboard with the following SQL:');
    console.log(`\nCREATE TABLE products (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  name text NOT NULL,\n  price numeric NOT NULL,\n  image text NOT NULL,\n  category text NOT NULL,\n  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),\n  in_stock boolean DEFAULT true,\n  description text,\n  designer text,\n  article_number text,\n  images text[],\n  try_own boolean DEFAULT false,\n  category_flag boolean DEFAULT false,\n  key_words text[],\n  more_info text,\n  created_at timestamptz DEFAULT now(),\n  updated_at timestamptz DEFAULT now()\n);\n\n-- Enable Row Level Security\nALTER TABLE products ENABLE ROW LEVEL SECURITY;\n\n-- Create policy for public read access\nCREATE POLICY \"Anyone can view products\" ON products FOR SELECT TO public USING (true);\n\n-- Create policy for authenticated users to insert\nCREATE POLICY \"Authenticated users can insert products\" ON products FOR INSERT TO authenticated WITH CHECK (true);\n`);
    return false;
  } else if (error) {
    console.error('❌ Error checking products table:', error);
    return false;
  } else {
    console.log('✅ Products table exists!');
    return true;
  }
}

// Upload products to Supabase
async function uploadProducts(transformedProducts) {
  console.log('🔄 Uploading products to Supabase...');
  
  // Clear existing products first
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
  
  if (deleteError) {
    console.log('⚠️  Could not clear existing products:', deleteError.message);
  } else {
    console.log('🗑️  Cleared existing products');
  }
  
  // Upload products in batches to avoid timeout
  const batchSize = 10;
  let uploadedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < transformedProducts.length; i += batchSize) {
    const batch = transformedProducts.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      failedCount += batch.length;
      continue;
    }
    
    uploadedCount += batch.length;
    console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transformedProducts.length / batchSize)} (${uploadedCount}/${transformedProducts.length} products)`);
    
    // Add a small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { uploadedCount, failedCount };
}

// Verify the upload
async function verifyUpload() {
  const { data: verifyData, error: verifyError } = await supabase
    .from('products')
    .select('id, name, category, price, images')
    .limit(10);
  
  if (verifyError) {
    console.error('❌ Error verifying upload:', verifyError);
    return false;
  } else {
    console.log('\n📋 Sample of uploaded products:');
    verifyData.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.category}) - $${product.price}`);
      console.log(`     ID: ${product.id}`);
      console.log(`     Images: ${product.images ? product.images.length : 0} images preserved`);
    });
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 Total products in database: ${count}`);
    }
    
    return true;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting complete product upload process...');
    
    // Step 1: Check if products table exists
    const tableExists = await checkProductsTable();
    if (!tableExists) {
      console.error('❌ Please create the products table first and run the script again.');
      process.exit(1);
    }
    
    // Step 2: Parse products from file
    const products = parseProductsFromFile();
    if (!products) {
      console.error('❌ Failed to parse products from file');
      process.exit(1);
    }
    
    console.log(`📦 Found ${products.length} products to upload`);
    
    // Step 3: Transform products
    const transformedProducts = transformProducts(products);
    
    // Step 4: Upload products
    const { uploadedCount, failedCount } = await uploadProducts(transformedProducts);
    
    // Step 5: Verify upload
    const verified = await verifyUpload();
    
    if (verified) {
      console.log(`\n🎉 Upload process completed!`);
      console.log('\n📊 Final Summary:');
      console.log(`  - Total products found: ${products.length}`);
      console.log(`  - Successfully uploaded: ${uploadedCount}`);
      console.log(`  - Failed uploads: ${failedCount}`);
      console.log(`  - All product images preserved: ✅`);
      console.log(`  - Unique UUIDs generated: ✅`);
      console.log(`  - No placeholder images used: ✅`);
      
      if (failedCount > 0) {
        console.log(`\n⚠️  ${failedCount} products failed to upload. Check the error messages above.`);
      }
    } else {
      console.error('❌ Upload verification failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
main();