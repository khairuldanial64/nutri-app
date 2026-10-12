import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export async function extractMacros(mealDescription) {
  const response = await fetch(`${API_URL}/api/macros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meal: mealDescription }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}