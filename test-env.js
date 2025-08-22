console.log("Build Env Check:");
console.log("Store ID:", process.env.NEXT_PUBLIC_SWELL_STORE_ID || "MISSING");
console.log("Secret Key:", process.env.SWELL_SECRET_KEY ? "EXISTS" : "MISSING");  
console.log("Public Key:", process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY ? "EXISTS" : "MISSING");
