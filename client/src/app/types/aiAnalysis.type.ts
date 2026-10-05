export interface aiAnalysisMaterialInterface {
  inventoryItemId: string;
  name: string;
  category: string;
  unit: string;
  estimatedQuantity: number;
  unitCost: number;
  estimatedCost: number;
}

export interface aiCalibrationInterface {
  timeFactor: number;
  hoursPerSession: number;
  refAreaCm2: number;
  refSessions: number;
}

export interface aiInkOptionInterface {
  inventoryItemId: string;
  name: string;
  unit: string;
  quantityPerItem: number | null;
  pricePerMl: number | null;
  availableMl: number | null;
  selectable: boolean;
}

export interface aiInkSelectionInterface {
  inventoryItemId: string;
  share: number;
}

export interface aiInkUsageInterface extends aiInkSelectionInterface {
  name: string;
  ml: number;
  quantityInUnit: number;
  unit: string;
  pricePerMl: number | null;
  cost: number;
}

export interface aiInkEstimateInterface {
  baseMl: number;
  estimatedMl: number;
  selections: aiInkUsageInterface[];
  cost: number;
  needsSelection: boolean;
  options: aiInkOptionInterface[];
}

export interface aiAnalysisResultInterface {
  analysis: {
    category: string;
    complexity: number;
    isColored: boolean;
    bodyPart: string;
    estimatedHours: number;
    estimatedSessions: number;
  };
  size: {
    widthCm: number;
    heightCm: number;
    areaCm2: number;
  };
  calibration: aiCalibrationInterface;
  baseMaterials: { inventoryItemId: string; quantity: number }[];
  ink: aiInkEstimateInterface | null;
  materials: aiAnalysisMaterialInterface[];
  missingMaterialIds: string[];
  detected?: {
    bodyPart: string | null;
    inkItemIds: string[];
  };
  pricing: {
    hourlyRate: number;
    laborCost: number;
    inkCost: number;
    materialCost: number;
    totalCost: number;
    complexitySurchargePercent: number;
    marginPercent: number;
    suggestedPrice: number;
    estimatedProfit: number;
  };
}

export interface clientTattooEstimateInterface {
  style: string;
  complexity: number;
  isColored: boolean;
  bodyPart: string;
  size: { widthCm: number; heightCm: number; source: "client" | "ai" };
  hours: { min: number; max: number };
  sessions: { min: number; max: number };
  price: { min: number; max: number; currency: "PHP" };
  estimateToken: string;
  usage?: estimatorUsageInterface;
}

export interface estimatorUsageInterface {
  limit: number;
  used: number;
  remaining: number;
  cooldownUntil: string | null;
  cooldownRemainingMs: number;
  serverTime: string;
}

export interface aiEstimateSnapshotInterface {
  category: string;
  complexity: number;
  isColored: boolean;
  bodyPart: string;
  sizeWidthCm: number;
  sizeHeightCm: number;
  hourlyRate: number;
  estimatedHours: number;
  estimatedSessions: number;
  materials: Pick<
    aiAnalysisMaterialInterface,
    | "inventoryItemId"
    | "name"
    | "estimatedQuantity"
    | "unitCost"
    | "estimatedCost"
  >[];
  laborCost: number;
  materialCost: number;
  totalCost: number;
  suggestedPrice: number;
  estimatedProfit: number;
  generatedAt: string;
}
