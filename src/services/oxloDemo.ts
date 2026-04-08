// Demo Script: Oxlo AI Integration for AgriToken Ledger
// This demonstrates the AI Oracle pipeline for agricultural data extraction

import OpenAI from "openai";

// Initialize Oxlo client (OpenAI-compatible)
const oxloClient = new OpenAI({
  baseURL: "https://api.oxlo.ai/v1",
  apiKey: process.env.VITE_OXLO_API_KEY || "your_api_key_here",
  dangerouslyAllowBrowser: true
});

// ============================================
// STAGE 1: Vision Model - Data Extraction
// ============================================
async function stage1_VisionExtraction(base64Image: string) {
  console.log("🔍 STAGE 1: Vision Model (kimi-k2.5)");
  console.log("━".repeat(50));
  
  const response = await oxloClient.chat.completions.create({
    model: "kimi-k2.5",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Extract agricultural transaction data from this image. Find: farmer ID, crop/produce type, weight in kg, buyer name, and transaction date. Return raw extracted text only." 
          },
          { 
            type: "image_url", 
            image_url: { url: base64Image } 
          }
        ]
      }
    ],
    max_tokens: 512,
    temperature: 0.1
  });
  
  const extractedText = response.choices[0].message.content || "";
  
  console.log("✅ Extraction Complete");
  console.log("Model: kimi-k2.5 (Premium Vision)");
  console.log("Tokens Used:", response.usage?.total_tokens);
  console.log("\nExtracted Text:");
  console.log(extractedText);
  console.log("\n");
  
  return extractedText;
}

// ============================================
// STAGE 2: Reasoning Model - Validation
// ============================================
async function stage2_ReasoningValidation(extractedText: string) {
  console.log("🧠 STAGE 2: Reasoning Model (deepseek-r1-0528)");
  console.log("━".repeat(50));
  
  const response = await oxloClient.chat.completions.create({
    model: "deepseek-r1-0528",
    temperature: 0.1,
    messages: [
      { 
        role: "system", 
        content: `You are an agricultural data oracle. Review extracted receipt data and format it into strict JSON with keys: 
        - farmer_id (string)
        - produce_type (string) 
        - weight_kg (number)
        - buyer_name (string)
        - transaction_date (YYYY-MM-DD format)
        - validityScore (0-100, based on data completeness and consistency)
        
        Return ONLY valid JSON, no markdown or explanation.`
      },
      { 
        role: "user", 
        content: extractedText 
      }
    ],
    max_tokens: 300
  });

  const content = response.choices[0].message.content || "{}";
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const validatedData = JSON.parse(cleaned);
  
  console.log("✅ Validation Complete");
  console.log("Model: deepseek-r1-0528 (Premium Reasoning)");
  console.log("Tokens Used:", response.usage?.total_tokens);
  console.log("\nValidated JSON:");
  console.log(JSON.stringify(validatedData, null, 2));
  console.log("\n");
  
  return validatedData;
}

// ============================================
// STAGE 3: Blockchain Preparation
// ============================================
async function stage3_BlockchainPrep(validatedData: any) {
  console.log("⛓️  STAGE 3: Blockchain Preparation");
  console.log("━".repeat(50));
  
  // Generate SHA-256 hash (same as existing AgriToken logic)
  const message = `${validatedData.farmer_id}${validatedData.produce_type}${validatedData.weight_kg}${validatedData.buyer_name}${validatedData.transaction_date}`;
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log("✅ Hash Generated");
  console.log("Algorithm: SHA-256");
  console.log("Hash:", hashHex);
  console.log("\nReady for blockchain submission to:");
  console.log("Contract: 0x94485b644064cBa391E196881EfC7E159A2b63f3");
  console.log("Network: Base Sepolia (Chain ID: 84532)");
  console.log("\n");
  
  return {
    data: validatedData,
    hash: hashHex,
    timestamp: new Date().toISOString()
  };
}

// ============================================
// COMPLETE PIPELINE DEMO
// ============================================
export async function demonstrateOxloPipeline(base64Image: string) {
  console.log("\n");
  console.log("═".repeat(50));
  console.log("🌾 AGRITOKEN LEDGER - OXLO AI ORACLE DEMO");
  console.log("═".repeat(50));
  console.log("\n");
  
  try {
    // Stage 1: Vision extraction
    const extractedText = await stage1_VisionExtraction(base64Image);
    
    // Stage 2: Reasoning validation
    const validatedData = await stage2_ReasoningValidation(extractedText);
    
    // Stage 3: Blockchain preparation
    const blockchainPayload = await stage3_BlockchainPrep(validatedData);
    
    console.log("═".repeat(50));
    console.log("✅ PIPELINE COMPLETE");
    console.log("═".repeat(50));
    console.log("\nFinal Payload:");
    console.log(JSON.stringify(blockchainPayload, null, 2));
    console.log("\n📊 Summary:");
    console.log("- Oxlo API Calls: 2 (kimi-k2.5 + deepseek-r1-0528)");
    console.log("- Total Tokens: ~800");
    console.log("- Processing Time: ~2-3 seconds");
    console.log("- Validity Score:", blockchainPayload.data.validityScore, "/100");
    console.log("\n🚀 Next Step: Submit to Base Sepolia blockchain");
    console.log("\n");
    
    return blockchainPayload;
    
  } catch (error) {
    console.error("\n❌ Pipeline Error:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Check VITE_OXLO_API_KEY in .env");
    console.log("2. Verify API key at https://portal.oxlo.ai");
    console.log("3. Ensure image is valid base64 data URI");
    console.log("\n");
    throw error;
  }
}

// ============================================
// EXAMPLE USAGE
// ============================================
/*
// Example 1: With actual image
const imageFile = document.querySelector('input[type="file"]').files[0];
const reader = new FileReader();
reader.onload = async (e) => {
  const base64Image = e.target.result;
  await demonstrateOxloPipeline(base64Image);
};
reader.readAsDataURL(imageFile);

// Example 2: With sample data (for testing without image)
const sampleBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRg...";
await demonstrateOxloPipeline(sampleBase64);
*/

// Export for use in components
export { stage1_VisionExtraction, stage2_ReasoningValidation, stage3_BlockchainPrep };
