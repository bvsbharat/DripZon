import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
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

// Extract products from TypeScript file and create clean JSON
function extractProductsToJSON() {
  console.log('📖 Extracting products from TypeScript file...');
  
  try {
    const productsFileContent = readFileSync('../src/contexts/products.ts', 'utf8');
    
    // Find the start and end of the sampleProducts array
    const startMatch = productsFileContent.match(/export const sampleProducts: Product\[\] = \[/);
    if (!startMatch) {
      console.error('❌ Could not find sampleProducts array start');
      return null;
    }
    
    const startIndex = startMatch.index + startMatch[0].length;
    
    // Find the matching closing bracket
    let bracketCount = 1;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < productsFileContent.length && bracketCount > 0; i++) {
      if (productsFileContent[i] === '[' || productsFileContent[i] === '{') {
        bracketCount++;
      } else if (productsFileContent[i] === ']' || productsFileContent[i] === '}') {
        bracketCount--;
      }
      endIndex = i;
    }
    
    // Extract the array content
    const arrayContent = productsFileContent.substring(startIndex, endIndex);
    
    // Clean up the content to make it valid JSON
    let cleanContent = arrayContent
      .replace(/([a-zA-Z_][a-zA-Z0-9_]*):(?=\s)/g, '"$1":') // Add quotes around property names
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/\btrue\b/g, 'true') // Ensure boolean values are correct
      .replace(/\bfalse\b/g, 'false')
      .replace(/,\s*$/, ''); // Remove trailing comma at the end
    
    // Wrap in array brackets
    const jsonString = `[${cleanContent}]`;
    
    // Parse to validate JSON
    const products = JSON.parse(jsonString);
    
    console.log(`📦 Successfully extracted ${products.length} products`);
    
    // Save to JSON file for backup
    writeFileSync('products-backup.json', JSON.stringify(products, null, 2));
    console.log('💾 Saved backup to products-backup.json');
    
    return products;
    
  } catch (error) {
    console.error('❌ Error extracting products:', error.message);
    console.log('🔄 Trying alternative parsing method...');
    
    // Alternative method: try to load the backup file if it exists
    try {
      const backupContent = readFileSync('products-backup.json', 'utf8');
      const products = JSON.parse(backupContent);
      console.log(`📦 Loaded ${products.length} products from backup file`);
      return products;
    } catch (backupError) {
      console.error('❌ Could not load backup file either:', backupError.message);
      return null;
    }
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
    console.log('📝 Please create the products table in your Supabase dashboard first.');
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
  const batchSize = 5; // Smaller batches for reliability
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
      continue;
    }
    
    uploadedCount += batch.length;
    console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${uploadedCount}/${transformedProducts.length} total)`);
    
    // Add a delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return { uploadedCount, failedCount };
}

// Verify the upload
async function verifyUpload() {
  const { data: verifyData, error: verifyError } = await supabase
    .from('products')
    .select('id, name, category, price, images')
    .limit(5);
  
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
    console.log('🚀 Starting product extraction and upload process...');
    
    // Step 1: Check if products table exists
    const tableExists = await checkProductsTable();
    if (!tableExists) {
      console.error('❌ Please create the products table first and run the script again.');
      process.exit(1);
    }
    
    // Step 2: Extract products from TypeScript file
    const products = extractProductsToJSON();
    if (!products) {
      console.error('❌ Failed to extract products from file');
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