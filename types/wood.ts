export interface WoodResult {
  species: string;
  scientificName: string;
  confidence: number;
  origin: string;
  grain: string;
  texture: string;
  color: string;
  hardness: number;
  workability: string;
  finishing: string;
  bestUses: string[];
  costPerBoardFoot: string;
  availability: string;
  sustainability: string;
  funFact: string;
  imageUri?: string;
}

export interface HistoryEntry extends WoodResult {
  id: string;
  scannedAt: string;
}
