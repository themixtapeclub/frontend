// app/api/test-swell-node/route.js - Test using swell-node library
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to use swell-node if available
    let swell;
    try {
      // Try different import methods for swell-node
      try {
        swell = require('swell-node');
        console.log('✅ swell-node loaded via require');
      } catch (requireError) {
        // Try ES6 import syntax
        const swellModule = await import('swell-node');
        swell = swellModule.default || swellModule;
        console.log('✅ swell-node loaded via import');
      }
    } catch (error) {
      console.log('❌ swell-node not available:', error.message);
      return NextResponse.json({
        success: false,
        error: 'swell-node library loading failed: ' + error.message,
        suggestion: 'Check swell-node installation'
      });
    }

    // Initialize swell - try different initialization methods
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const secretKey = process.env.SWELL_SECRET_KEY;

    let swellClient;
    try {
      if (typeof swell.init === 'function') {
        swellClient = swell.init(storeId, secretKey);
        console.log('✅ swell-node initialized with .init()');
      } else if (typeof swell === 'function') {
        swellClient = swell(storeId, secretKey);
        console.log('✅ swell-node initialized as function');
      } else if (swell.Client) {
        // Try using the Client constructor
        swellClient = new swell.Client(storeId, secretKey);
        console.log('✅ swell-node initialized with new Client()');
      } else if (swell.swell) {
        // Try using the swell property
        swellClient = swell.swell.init
          ? swell.swell.init(storeId, secretKey)
          : swell.swell(storeId, secretKey);
        console.log('✅ swell-node initialized with swell.swell');
      } else {
        // Try creating new instance
        swellClient = new swell(storeId, secretKey);
        console.log('✅ swell-node initialized with new operator');
      }
    } catch (initError) {
      console.log('❌ swell-node initialization failed:', initError.message);
      return NextResponse.json({
        success: false,
        error: 'swell-node initialization failed: ' + initError.message,
        swellType: typeof swell,
        swellKeys: Object.keys(swell),
        hasClient: !!swell.Client,
        hasSwellProperty: !!swell.swell,
        suggestion:
          'Try: new swell.Client(storeId, secretKey) or swell.swell.init(storeId, secretKey)'
      });
    }

    const results = {
      timestamp: new Date().toISOString(),
      swellType: typeof swell,
      swellKeys: Object.keys(swell),
      tests: []
    };

    // Test 1: List content models
    try {
      console.log('\n🧪 TEST 1: List content using swell-node');
      const modelsResult = await swellClient.get('/content');
      results.tests.push({
        name: 'List content models (swell-node)',
        success: true,
        result: modelsResult
      });
    } catch (error) {
      results.tests.push({
        name: 'List content models (swell-node)',
        success: false,
        error: error.message
      });
    }

    // Test 2: Check wantlist model
    try {
      console.log('\n🧪 TEST 2: Check wantlist model using swell-node');
      const wantlistResult = await swellClient.get('/content/wantlist');
      results.tests.push({
        name: 'Check wantlist model (swell-node)',
        success: true,
        result: wantlistResult
      });
    } catch (error) {
      results.tests.push({
        name: 'Check wantlist model (swell-node)',
        success: false,
        error: error.message
      });
    }

    // Test 3: Create wantlist item
    try {
      console.log('\n🧪 TEST 3: Create wantlist item using swell-node');
      const createResult = await swellClient.post('/content/wantlist', {
        customer_id: 'test_customer_node',
        product_id: 'test_product_node',
        email: 'node@test.com',
        status: 'active',
        notify_when_available: true,
        date_added: new Date().toISOString()
      });
      results.tests.push({
        name: 'Create wantlist item (swell-node)',
        success: true,
        result: createResult
      });
    } catch (error) {
      results.tests.push({
        name: 'Create wantlist item (swell-node)',
        success: false,
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      library: 'swell-node',
      debug: results
    });
  } catch (error) {
    console.error('swell-node test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
