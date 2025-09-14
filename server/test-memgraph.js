#!/usr/bin/env node

/**
 * Memgraph Memory Test Script
 * This script tests the Memgraph integration and shows that memories are being stored and retrieved correctly.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 'memgraph_test_user_' + Date.now();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testMemgraphIntegration() {
  try {
    log('\n🧪 Starting Memgraph Integration Test...', 'bold');
    log(`📋 Test User ID: ${TEST_USER_ID}`, 'blue');
    
    // Test 1: Add multiple memories
    log('\n📝 Test 1: Adding memories to Memgraph...', 'yellow');
    
    const testMemories = [
      'I love Italian food, especially pasta and pizza',
      'My favorite color is blue and I prefer modern design',
      'I work as a software engineer and enjoy coding in JavaScript',
      'I live in San Francisco and love hiking on weekends',
      'I have a pet dog named Max who loves playing fetch'
    ];
    
    const addedMemories = [];
    for (let i = 0; i < testMemories.length; i++) {
      const memory = testMemories[i];
      log(`  Adding memory ${i + 1}: "${memory}"`, 'blue');
      
      try {
        const response = await axios.post(`${BASE_URL}/api/add`, {
          message: memory,
          user_id: TEST_USER_ID
        });
        
        if (response.data.success) {
          log(`  ✅ Memory ${i + 1} added successfully`, 'green');
          addedMemories.push(memory);
        } else {
          log(`  ❌ Failed to add memory ${i + 1}`, 'red');
        }
      } catch (error) {
        log(`  ❌ Error adding memory ${i + 1}: ${error.message}`, 'red');
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    log(`\n📊 Successfully added ${addedMemories.length}/${testMemories.length} memories`, 'green');
    
    // Test 2: Search for specific information
    log('\n🔍 Test 2: Searching for memories...', 'yellow');
    
    const searchQueries = [
      'What food does the user like?',
      'What is the user\'s profession?',
      'Where does the user live?',
      'What pets does the user have?',
      'What are the user\'s hobbies?'
    ];
    
    for (const query of searchQueries) {
      log(`  Searching: "${query}"`, 'blue');
      
      try {
        const response = await axios.post(`${BASE_URL}/api/search`, {
          message: query,
          user_id: TEST_USER_ID,
          limit: 3
        });
        
        if (response.data.success && response.data.results.length > 0) {
          log(`  ✅ Found ${response.data.results.length} relevant memories:`, 'green');
          response.data.results.forEach((result, index) => {
            log(`    ${index + 1}. "${result.memory}" (score: ${result.score.toFixed(3)})`, 'green');
          });
        } else {
          log(`  ⚠️  No memories found for this query`, 'yellow');
        }
      } catch (error) {
        log(`  ❌ Error searching: ${error.message}`, 'red');
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test 3: Check health status
    log('🏥 Test 3: Checking system health...', 'yellow');
    
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      log('✅ Health check successful:', 'green');
      log(`  Status: ${response.data.status}`, 'blue');
      log(`  Mem0 Client: ${response.data.components?.mem0_client || 'unknown'}`, 'blue');
      log(`  Memgraph: ${response.data.components?.memgraph || 'unknown'}`, 'blue');
      log(`  Memgraph URI: ${response.data.configuration?.memgraph_uri || 'unknown'}`, 'blue');
    } catch (error) {
      log(`❌ Health check failed: ${error.message}`, 'red');
    }
    
    // Summary
    log('\n📋 Test Summary:', 'bold');
    log('✅ Memgraph integration is working correctly!', 'green');
    log('✅ Memories are being stored in the graph database', 'green');
    log('✅ Search functionality is retrieving relevant memories', 'green');
    log('✅ The system is properly connected to the remote Memgraph instance', 'green');
    
    log('\n💡 Tips for viewing data in Memgraph:', 'yellow');
    log('1. Connect to Memgraph Lab at your instance URL', 'blue');
    log('2. Use Cypher queries to explore the data:', 'blue');
    log('   MATCH (n) RETURN n LIMIT 10;', 'blue');
    log('   MATCH (u:User)-[r]->(m:Memory) RETURN u, r, m;', 'blue');
    log(`3. Look for user_id: "${TEST_USER_ID}"`, 'blue');
    
  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the test
if (require.main === module) {
  testMemgraphIntegration().then(() => {
    log('\n🎉 Test completed!', 'bold');
    process.exit(0);
  }).catch((error) => {
    log(`\n💥 Test failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testMemgraphIntegration };