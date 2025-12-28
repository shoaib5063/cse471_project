const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test image analysis endpoint
const testImageAnalysis = async () => {
  try {
    console.log('\n🧪 Testing Image Food Analysis Fix\n');
    console.log('=====================================\n');

    // Test 1: Check that empty food response doesn't throw 500 error
    console.log('Test 1: Simulating empty food response...');
    
    // Create a minimal test image (1x1 white pixel PNG)
    const minimalPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const imageBase64 = minimalPng.toString('base64');
    
    try {
      const response = await axios.post('http://localhost:5003/api/meals/analyze-image', {
        imageBase64: `data:image/png;base64,${imageBase64}`
      });

      console.log('✅ Response received successfully!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Foods detected: ${response.data.foods?.length || 0}`);
      console.log(`   Response structure: ${JSON.stringify(response.data, null, 2).slice(0, 200)}...\n`);

      if (response.status === 200 && Array.isArray(response.data.foods)) {
        console.log('✅ TEST PASSED: Empty food response handled gracefully');
        console.log('   - No 500 error thrown');
        console.log('   - Returned empty array for foods');
        console.log('   - HTTP 200 status received\n');
      } else {
        console.log('❌ TEST FAILED: Unexpected response structure\n');
      }
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('❌ TEST FAILED: Still getting 500 error');
        console.log(`   Error message: ${error.response?.data?.error}\n`);
      } else {
        console.log(`❌ TEST FAILED: ${error.message}\n`);
      }
    }

    console.log('=====================================\n');
    console.log('✨ Testing complete!\n');

  } catch (error) {
    console.error('Test setup error:', error.message);
  }
};

testImageAnalysis();
