import OpenAI from "openai";

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

// Single chat completion call — proxy in prod, direct SDK in dev
async function oxloChat(payload: object): Promise<string> {
  if (import.meta.env.PROD) {
    const res = await fetch('/api/oxlo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Proxy error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } else {
    const client = new OpenAI({
      baseURL: 'https://api.oxlo.ai/v1',
      apiKey: import.meta.env.VITE_OXLO_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    const res = await client.chat.completions.create(payload as any);
    return res.choices[0].message.content ?? '';
  }
}

async function stage1_VisionExtraction(
  base64Image: string,
  onProgress: (status: PipelineStatus) => void
): Promise<{ extractedText: string; forensicAnalysis: string }> {
  onProgress({ stage: "vision", message: "Kimi-k2.5 (Vision) parsing document...", progress: 25 });

  const fullResponse = await oxloChat({
    model: "kimi-k2.5",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a forensic document analyst. Perform TWO tasks:

TASK 1 - FORENSIC ANALYSIS:
Analyze this image for signs of digital manipulation:
- Font consistency throughout the document
- Unusual blurring or pixelation around numbers
- Lighting inconsistencies
- Paper texture uniformity
- Signs of copy-paste or digital editing
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
DATA: [extracted information]`,
          },
          { type: "image_url", image_url: { url: base64Image } },
        ],
      },
    ],
    max_tokens: 800,
    temperature: 0.1,
  });

  const forensicMatch = fullResponse.match(/FORENSIC:(.*?)(?=DATA:|$)/s);
  const dataMatch = fullResponse.match(/DATA:(.*)/s);

  return {
    forensicAnalysis: forensicMatch ? forensicMatch[1].trim() : fullResponse,
    extractedText: dataMatch ? dataMatch[1].trim() : fullResponse,
  };
}

async function stage2_ReasoningValidation(
  extractedText: string,
  forensicAnalysis: string,
  onProgress: (status: PipelineStatus) => void
): Promise<ExtractedAgriData> {
  onProgress({ stage: "reasoning", message: "DeepSeek-r1 (Reasoning) validating and structuring payload...", progress: 60 });

  const content = await oxloChat({
    model: "deepseek-r1-0528",
    temperature: 0.1,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `You are an agricultural data oracle. Output ONLY a valid JSON object with these exact keys:
{
  "farmer_id": string,
  "produce_type": string,
  "weight_kg": number,
  "buyer_name": string,
  "transaction_date": "YYYY-MM-DD",
  "validityScore": number 0-100,
  "security_audit": {
    "metadata_match": boolean,
    "tamper_probability": number 0.0-1.0,
    "visual_anomalies": string[],
    "verdict": "SAFE_TO_HASH" | "FRAUD_DETECTED" | "REVIEW_REQUIRED",
    "confidence_score": number 0-100
  }
}
Use null for unknown fields. No markdown. No explanation. JSON only.`,
      },
      {
        role: "user",
        content: `Extracted text: ${extractedText}\n\nForensic analysis: ${forensicAnalysis}`,
      },
    ],
  });

  // Strip <think>...</think> block that deepseek-r1 prepends before its answer
  const stripped = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Pull out the first {...} JSON block regardless of any surrounding text
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`DeepSeek returned no JSON. Raw: ${stripped.slice(0, 300)}`);
  const parsed = JSON.parse(match[0]);

  return {
    farmer_id:        parsed.farmer_id        || '',
    produce_type:     parsed.produce_type     || '',
    weight_kg:        parsed.weight_kg        || 0,
    buyer_name:       parsed.buyer_name       || '',
    transaction_date: parsed.transaction_date || '',
    validityScore:    parsed.validityScore    || 0,
    security_audit: {
      metadata_match:    parsed.security_audit?.metadata_match    ?? true,
      tamper_probability:parsed.security_audit?.tamper_probability ?? 0.1,
      visual_anomalies:  parsed.security_audit?.visual_anomalies  || [],
      verdict:           parsed.security_audit?.verdict           || 'REVIEW_REQUIRED',
      confidence_score:  parsed.security_audit?.confidence_score  || 0,
    },
  };
}

export async function processAgriImageWithSecurity(
  base64Image: string,
  onProgress: (status: PipelineStatus) => void
): Promise<ExtractedAgriData> {
  onProgress({ stage: "idle", message: "Initializing Oxlo AI Oracle Pipeline...", progress: 0 });

  try {
    onProgress({ stage: "vision", message: "Extracting image metadata...", progress: 10 });

    const { extractedText, forensicAnalysis } = await stage1_VisionExtraction(base64Image, onProgress);
    const validatedData = await stage2_ReasoningValidation(extractedText, forensicAnalysis, onProgress);

    onProgress({ stage: "complete", message: "AI Oracle Pipeline complete.", progress: 100 });
    return validatedData;

  } catch (error) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("timeout") ||
        error.message.includes("ERR_"));

    const message = isConnectionError
      ? "Connection to Oxlo AI failed. Please fill in the fields manually."
      : `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Please fill in the fields manually.`;

    onProgress({ stage: "error", message, progress: 0 });
    throw error;
  }
}

export async function processAgriImage(base64Image: string): Promise<ExtractedAgriData> {
  return processAgriImageWithSecurity(base64Image, () => {});
}
