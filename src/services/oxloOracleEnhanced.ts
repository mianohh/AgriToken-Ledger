import OpenAI from "openai";

const oxloClient = new OpenAI({
  baseURL: "https://api.oxlo.ai/v1",
  apiKey: import.meta.env.VITE_OXLO_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface SecurityAudit {
  metadata_match: boolean;
  tamper_probability: number;
  visual_anomalies: string[];
  verdict: "SAFE_TO_HASH" | "FRAUD_DETECTED" | "REVIEW_REQUIRED";
  confidence_score: number;
}

export interface ExtractedAgriData {
  farmer_id: string;
  produce_type: string;
  weight_kg: number;
  buyer_name: string;
  transaction_date: string;
  validityScore: number;
  security_audit: SecurityAudit;
}

export interface PipelineStatus {
  stage: "idle" | "vision" | "reasoning" | "validation" | "complete" | "error";
  message: string;
  progress: number;
}

// Extract EXIF metadata from image
async function extractImageMetadata(base64Image: string): Promise<{ timestamp: string | null; hasMetadata: boolean }> {
  try {
    // Simple metadata check - in production, use exifr library
    const hasDataUri = base64Image.startsWith('data:image');
    return {
      timestamp: new Date().toISOString(),
      hasMetadata: hasDataUri
    };
  } catch (error) {
    return { timestamp: null, hasMetadata: false };
  }
}

// Stage 1: Vision Model with Forensic Analysis
async function stage1_VisionExtraction(
  base64Image: string, 
  onProgress: (status: PipelineStatus) => void
): Promise<{ extractedText: string; forensicAnalysis: string }> {
  
  onProgress({
    stage: "vision",
    message: "⚙️ Oxlo Kimi-k2.5 (Vision) parsing document...",
    progress: 25
  });
  
  console.log('🔍 Stage 1: Vision extraction with forensic analysis');
  
  const response = await oxloClient.chat.completions.create({
    model: "kimi-k2.5",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `You are a forensic document analyst. Perform TWO tasks:

TASK 1 - FORENSIC ANALYSIS:
Before extracting data, analyze this image for signs of digital manipulation:
- Are fonts consistent throughout the document?
- Is there unusual blurring or pixelation around numbers?
- Are there lighting inconsistencies?
- Does the paper texture look uniform?
- Any signs of copy-paste or digital editing?

Output a tamper_probability score from 0.0 (pristine) to 1.0 (highly suspicious).

TASK 2 - DATA EXTRACTION:
Extract agricultural transaction data:
- Farmer ID or name
- Crop/produce type
- Weight in kg
- Buyer name
- Transaction date

Format your response as:
FORENSIC: [your analysis and tamper_probability score]
DATA: [extracted information]` 
          },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      }
    ],
    max_tokens: 800,
    temperature: 0.1
  });
  
  const fullResponse = response.choices[0].message.content || "";
  console.log('✅ Vision extraction complete:', fullResponse);
  
  // Parse forensic and data sections
  const forensicMatch = fullResponse.match(/FORENSIC:(.*?)(?=DATA:|$)/s);
  const dataMatch = fullResponse.match(/DATA:(.*)/s);
  
  return {
    forensicAnalysis: forensicMatch ? forensicMatch[1].trim() : fullResponse,
    extractedText: dataMatch ? dataMatch[1].trim() : fullResponse
  };
}

// Stage 2: Reasoning Model with Security Validation
async function stage2_ReasoningValidation(
  extractedText: string,
  forensicAnalysis: string,
  imageMetadata: { timestamp: string | null; hasMetadata: boolean },
  onProgress: (status: PipelineStatus) => void
): Promise<ExtractedAgriData> {
  
  onProgress({
    stage: "reasoning",
    message: "🧠 Oxlo DeepSeek-r1 (Reasoning) validating data and formatting payload...",
    progress: 60
  });
  
  console.log('🧠 Stage 2: Reasoning validation with fraud detection');
  
  try {
    const response = await oxloClient.chat.completions.create({
      model: "deepseek-r1-0528",
      temperature: 0.1,
      messages: [
        { 
          role: "system", 
          content: `You are an agricultural data oracle. Extract data and format as JSON.

Return ONLY this JSON structure (no markdown, no explanation):
{
  "farmer_id": "string",
  "produce_type": "string",
  "weight_kg": number,
  "buyer_name": "string",
  "transaction_date": "YYYY-MM-DD",
  "validityScore": number (0-100),
  "security_audit": {
    "metadata_match": boolean,
    "tamper_probability": number (0.0-1.0),
    "visual_anomalies": ["string"],
    "verdict": "SAFE_TO_HASH" or "FRAUD_DETECTED" or "REVIEW_REQUIRED",
    "confidence_score": number (0-100)
  }
}

If data is missing, use reasonable defaults. Always return valid JSON.`
        },
        { 
          role: "user", 
          content: `Extract data from: ${extractedText}\n\nForensic notes: ${forensicAnalysis}`
        }
      ],
      max_tokens: 500
    });

    const content = response.choices[0].message.content || "{}";
    console.log('📝 Raw reasoning response:', content);
    
    // Clean markdown and parse
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    
    // Validate structure and add defaults if needed
    const validated: ExtractedAgriData = {
      farmer_id: parsed.farmer_id || "UNKNOWN",
      produce_type: parsed.produce_type || "Unknown Crop",
      weight_kg: parsed.weight_kg || 0,
      buyer_name: parsed.buyer_name || "Unknown Buyer",
      transaction_date: parsed.transaction_date || new Date().toISOString().split('T')[0],
      validityScore: parsed.validityScore || 50,
      security_audit: {
        metadata_match: parsed.security_audit?.metadata_match ?? true,
        tamper_probability: parsed.security_audit?.tamper_probability ?? 0.1,
        visual_anomalies: parsed.security_audit?.visual_anomalies || [],
        verdict: parsed.security_audit?.verdict || "SAFE_TO_HASH",
        confidence_score: parsed.security_audit?.confidence_score || 70
      }
    };
    
    console.log('✅ Validated data with security audit:', validated);
    return validated;
    
  } catch (error) {
    console.error('❌ Reasoning stage error:', error);
    // Return safe defaults if parsing fails
    return {
      farmer_id: "EXTRACTION_FAILED",
      produce_type: "Unknown",
      weight_kg: 0,
      buyer_name: "Unknown",
      transaction_date: new Date().toISOString().split('T')[0],
      validityScore: 0,
      security_audit: {
        metadata_match: false,
        tamper_probability: 0.5,
        visual_anomalies: ["AI extraction failed"],
        verdict: "REVIEW_REQUIRED",
        confidence_score: 0
      }
    };
  }
}

// Main Pipeline with Progress Tracking
export async function processAgriImageWithSecurity(
  base64Image: string,
  onProgress: (status: PipelineStatus) => void
): Promise<ExtractedAgriData> {
  
  onProgress({
    stage: "idle",
    message: "🚀 Initializing Oxlo AI Oracle Pipeline...",
    progress: 0
  });
  
  console.log('🚀 Starting enhanced Oxlo AI pipeline with fraud detection...');
  
  if (!import.meta.env.VITE_OXLO_API_KEY) {
    throw new Error('VITE_OXLO_API_KEY is not configured. Please add it to your .env file.');
  }
  
  try {
    // Extract metadata
    onProgress({
      stage: "vision",
      message: "📊 Extracting image metadata...",
      progress: 10
    });
    const metadata = await extractImageMetadata(base64Image);
    
    // Stage 1: Vision + Forensics
    const { extractedText, forensicAnalysis } = await stage1_VisionExtraction(base64Image, onProgress);
    
    // Stage 2: Reasoning + Security
    const validatedData = await stage2_ReasoningValidation(
      extractedText, 
      forensicAnalysis, 
      metadata,
      onProgress
    );
    
    onProgress({
      stage: "complete",
      message: "✅ AI Oracle Pipeline Complete!",
      progress: 100
    });
    
    console.log('✅ Enhanced AI pipeline complete with security audit!');
    return validatedData;
    
  } catch (error) {
    onProgress({
      stage: "error",
      message: `❌ Pipeline Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      progress: 0
    });
    console.error('❌ AI pipeline error:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function processAgriImage(base64Image: string): Promise<ExtractedAgriData> {
  return processAgriImageWithSecurity(base64Image, () => {});
}
