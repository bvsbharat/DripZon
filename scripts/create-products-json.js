import { readFileSync, writeFileSync } from 'fs';

// This script manually extracts products from the TypeScript file
// and creates a clean JSON file

function createProductsJSON() {
  console.log('📖 Reading TypeScript file...');
  
  try {
    const content = readFileSync('../src/contexts/products.ts', 'utf8');
    
    // Extract individual product objects using regex
    const productMatches = content.match(/\{[\s\S]*?\},?(?=\s*\{|\s*\])/g);
    
    if (!productMatches) {
      console.error('❌ Could not find product objects');
      return;
    }
    
    console.log(`📦 Found ${productMatches.length} product objects`);
    
    const products = [];
    
    for (let i = 0; i < productMatches.length; i++) {
      let productStr = productMatches[i];
      
      // Clean up the product string
      productStr = productStr
        .replace(/,\s*$/, '') // Remove trailing comma
        .replace(/([a-zA-Z_][a-zA-Z0-9_]*):(?=\s)/g, '"$1":') // Add quotes around property names
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      
      try {
        const product = JSON.parse(productStr);
        products.push(product);
        console.log(`✅ Parsed product ${i + 1}: ${product.name}`);
      } catch (parseError) {
        console.log(`⚠️  Skipping product ${i + 1} due to parse error:`, parseError.message);
        // Try to extract basic info manually
        const idMatch = productStr.match(/"id":\s*"([^"]+)"/); 
        const nameMatch = productStr.match(/"name":\s*"([^"]+)"/); 
        if (idMatch && nameMatch) {
          console.log(`   Product ID: ${idMatch[1]}, Name: ${nameMatch[1]}`);
        }
      }
    }
    
    console.log(`\n📊 Successfully parsed ${products.length} products`);
    
    // Write to JSON file
    writeFileSync('all-products.json', JSON.stringify(products, null, 2));
    console.log('💾 Saved all products to all-products.json');
    
    // Show sample
    console.log('\n📋 Sample products:');
    products.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.category}) - $${product.price}`);
    });
    
    return products;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createProductsJSON();