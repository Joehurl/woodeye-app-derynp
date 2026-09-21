import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry, WoodResult } from '@/types/wood';

const HISTORY_KEY = 'woodeye_history';

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch (e) {
    console.error('[WoodEye] Failed to load history:', e);
    return [];
  }
}

export async function saveToHistory(result: WoodResult): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    ...result,
    id: Date.now().toString(),
    scannedAt: new Date().toISOString(),
  };
  try {
    const existing = await getHistory();
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    console.log('[WoodEye] Saved to history:', entry.species, 'id:', entry.id);
  } catch (e) {
    console.error('[WoodEye] Failed to save to history:', e);
  }
  return entry;
}

export async function deleteFromHistory(id: string): Promise<HistoryEntry[]> {
  try {
    const existing = await getHistory();
    const updated = existing.filter((e) => e.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    console.log('[WoodEye] Deleted history entry:', id);
    return updated;
  } catch (e) {
    console.error('[WoodEye] Failed to delete history entry:', e);
    return [];
  }
}
