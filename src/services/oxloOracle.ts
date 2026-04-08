import OpenAI from "openai";

const oxloClient = new OpenAI({
  baseURL: "https://api.oxlo.ai/v1",
  apiKey: import.meta.env.VITE_OXLO_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ExtractedAgriData {
  farmer_id: string;
  produce_type: string;
  weight_kg: number;
  buyer_name: string;
  transaction_date: string;
  validityScore: number;
}

async function extractDataFromImage(base64Image: string): Promise<string> {
  console.log('🔍 Stage 1: Vision extraction with kimi-k2.5');
  
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
          { type: "image_url", image_url: { url: base64Image } }
        ]
      }
    ],
    max_tokens: 512,
    temperature: 0.1
  });
  
  const extractedText = response.choices[0].message.content || "";
  console.log('✅ Vision extraction result:', extractedText);
  return extractedText;
}

async function validateAndFormatForBlockchain(extractedText: string): Promise<ExtractedAgriData> {
  console.log('🧠 Stage 2: Reasoning validation with deepseek-r1-0528');
  
  const response = await oxloClient.chat.completions.create({
    model: "deepseek-r1-0528",
    temperature: 0.1,
    messages: [
      { 
        role: "system", 
        content: "You are an agricultural data oracle. Review extracted receipt data and format it into strict JSON with keys: farmer_id, produce_type, weight_kg (number), buyer_name, transaction_date (YYYY-MM-DD), validityScore (0-100). Return ONLY valid JSON, no markdown."
      },
      { 
        role: "user", 
        content: extractedText 
      }
    ],
    max_tokens: 300
  });

  const content = response.choices[0].message.content || "{}";
  console.log('📝 Raw reasoning response:', content);
  
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  console.log('✅ Validated data:', parsed);
  
  return parsed;
}

export async function processAgriImage(base64Image: string): Promise<ExtractedAgriData> {
  console.log('🚀 Starting Oxlo AI pipeline...');
  
  if (!import.meta.env.VITE_OXLO_API_KEY) {
    throw new Error('VITE_OXLO_API_KEY is not configured. Please add it to your .env file.');
  }
  
  try {
    const extractedText = await extractDataFromImage(base64Image);
    const validatedData = await validateAndFormatForBlockchain(extractedText);
    console.log('✅ AI pipeline complete!');
    return validatedData;
  } catch (error) {
    console.error('❌ AI pipeline error:', error);
    throw error;
  }
}
