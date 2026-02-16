export async function generateTransactionHash(data: {
  farmer_id: string;
  produce_type: string;
  weight_kg: number;
  buyer_name: string;
  transaction_date: string;
}): Promise<string> {
  const message = `${data.farmer_id}${data.produce_type}${data.weight_kg}${data.buyer_name}${data.transaction_date}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
