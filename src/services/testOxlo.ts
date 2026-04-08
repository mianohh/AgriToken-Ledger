// Quick test to verify Oxlo API is working
// Run this in browser console after starting the app

async function testOxloConnection() {
  console.log('🧪 Testing Oxlo API Connection...');
  console.log('━'.repeat(50));
  
  // Check if API key is set
  const apiKey = import.meta.env.VITE_OXLO_API_KEY;
  if (!apiKey || apiKey === 'your_oxlo_api_key_here') {
    console.error('❌ VITE_OXLO_API_KEY is not set or still has placeholder value');
    console.log('💡 Please add your real API key to .env file');
    return false;
  }
  
  console.log('✅ API key is configured');
  console.log('🔑 Key starts with:', apiKey.substring(0, 10) + '...');
  
  // Test simple text completion (no image)
  try {
    console.log('\n📡 Testing simple text completion...');
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      baseURL: "https://api.oxlo.ai/v1",
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    const response = await client.chat.completions.create({
      model: "deepseek-r1-0528",
      messages: [{ role: "user", content: "Say 'Hello from Oxlo!'" }],
      max_tokens: 50
    });
    
    console.log('✅ API Response:', response.choices[0].message.content);
    console.log('📊 Tokens used:', response.usage?.total_tokens);
    console.log('\n✅ Oxlo API is working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your API key at https://portal.oxlo.ai');
    console.log('2. Verify the key is active and has credits');
    console.log('3. Check browser console for CORS errors');
    return false;
  }
}

// Export for use
export { testOxloConnection };

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('💡 Run testOxloConnection() to verify your Oxlo API setup');
}
