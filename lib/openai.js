const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function extractMacros(mealDescription) {
  console.log('API_URL:', API_URL);
  console.log('Calling:', `${API_URL}/api/macros`);
  
  const response = await fetch(`${API_URL}/api/macros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meal: mealDescription }),
  });

  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response data:', JSON.stringify(data));
  
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}