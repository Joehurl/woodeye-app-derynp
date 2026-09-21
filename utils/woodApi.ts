import { MOCK_WOOD_DATA, WoodResult } from './mockWoodData';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

function getRandomMockResult(): WoodResult {
  const idx = Math.floor(Math.random() * MOCK_WOOD_DATA.length);
  return { ...MOCK_WOOD_DATA[idx] };
}

export async function identifyWood(imageBase64: string): Promise<WoodResult> {
  console.log('[WoodEye] identifyWood called, backend URL:', BACKEND_URL ?? '(none — using mock)');

  if (BACKEND_URL) {
    try {
      const url = `${BACKEND_URL}/api/identify`;
      console.log('[WoodEye] POST', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = (body as { message?: string })?.message ?? `HTTP ${response.status}`;
        console.error('[WoodEye] Backend error:', response.status, msg);
        throw new Error(msg);
      }

      const data = await response.json();
      console.log('[WoodEye] Backend response received:', (data as WoodResult).species);
      return data as WoodResult;
    } catch (err) {
      console.warn('[WoodEye] Backend unavailable, using mock data:', err);
      return getRandomMockResult();
    }
  }

  // No backend URL configured — return mock data for development/demo
  console.log('[WoodEye] No backend URL, simulating 1.8s delay then returning mock data');
  await new Promise(resolve => setTimeout(resolve, 1800));
  const mock = getRandomMockResult();
  console.log('[WoodEye] Mock result:', mock.species, 'confidence:', mock.confidence);
  return mock;
}

export type { WoodResult };
