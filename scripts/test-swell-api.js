// scripts/test-swell-api.js
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
    }
  });

  return envVars;
}

async function testSwellAPI() {
  const envVars = loadEnvVars();

  const storeId = envVars.SWELL_STORE_ID;
  const publicKey = envVars.SWELL_PUBLIC_KEY;

  if (!storeId || !publicKey) {
    return;
  }

  try {
    const url = `https://${storeId}.swell.store/api/products?limit=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    // Data is available here if needed for further processing
  } catch (error) {
    // Handle error if needed
  }
}

testSwellAPI();
