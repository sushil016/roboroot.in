export type PrintQuality = "DRAFT" | "STANDARD" | "FINE";
export type PrintFinish =
  | "RAW"
  | "SUPPORT_REMOVAL"
  | "SANDED"
  | "PRIMED"
  | "PAINTED";
export type PrintOrderStatus =
  | "PAYMENT_PENDING"
  | "PAID"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "PRINTING"
  | "POST_PROCESSING"
  | "QUALITY_CHECK"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "ON_HOLD"
  | "CANCELLED"
  | "REFUNDED";

export type PrintMaterial = {
  id: string;
  code: string;
  name: string;
  densityGramsPerCm3: number;
  pricePerGramCents: number;
  colors: string[];
  isActive: boolean;
  sortOrder: number;
};

export type PrintConfig = {
  id: number;
  isEnabled: boolean;
  baseFeeCents: number;
  minimumOrderCents: number;
  shellMaterialPercent: number;
  draftMultiplierPercent: number;
  standardMultiplierPercent: number;
  fineMultiplierPercent: number;
  rawFinishFeeCents: number;
  supportRemovalFeeCents: number;
  sandingFeeCents: number;
  primerFeeCents: number;
  paintingFeeCents: number;
  draftLeadDays: number;
  standardLeadDays: number;
  fineLeadDays: number;
  maxFileSizeMb: number;
  materials: PrintMaterial[];
  updatedAt: string;
};

export type PrintModelFile = {
  id: string;
  originalName: string;
  mimeType: string;
  format: "STL" | "OBJ";
  sizeBytes: number;
  volumeMm3: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  triangleCount: number;
  createdAt: string;
};

export type PrintConfiguration = {
  fileId: string;
  materialId: string;
  color: string;
  quality: PrintQuality;
  finish: PrintFinish;
  infillPercent: number;
  quantity: number;
};

export type PrintQuote = {
  file: PrintModelFile;
  material: Pick<
    PrintMaterial,
    "id" | "code" | "name" | "densityGramsPerCm3" | "pricePerGramCents"
  >;
  color: string;
  quality: PrintQuality;
  finish: PrintFinish;
  infillPercent: number;
  quantity: number;
  unitWeightGrams: number;
  totalWeightGrams: number;
  baseFeeCents: number;
  materialCostCents: number;
  qualityMarkupCents: number;
  finishFeeCents: number;
  minimumAdjustmentCents: number;
  subtotalCents: number;
  shippingCents: number;
  totalAmountCents: number;
  estimatedDays: number;
  pricingVersion: string;
  disclaimer: string;
};

export type PrintStatusEvent = {
  id: string;
  status: PrintOrderStatus;
  note: string | null;
  actorLabel: string | null;
  createdAt: string;
};

export type PrintOrder = {
  id: string;
  reference: string;
  status: PrintOrderStatus;
  color: string;
  quality: PrintQuality;
  finish: PrintFinish;
  infillPercent: number;
  quantity: number;
  unitWeightGrams: number;
  totalWeightGrams: number;
  baseFeeCents: number;
  materialCostCents: number;
  qualityMarkupCents: number;
  finishFeeCents: number;
  subtotalCents: number;
  shippingCents: number;
  totalAmountCents: number;
  estimatedDays: number;
  customerNotes: string | null;
  adminNotes: string | null;
  quotedAt: string;
  createdAt: string;
  updatedAt: string;
  modelFile: PrintModelFile;
  material: PrintMaterial;
  statusHistory: PrintStatusEvent[];
  commerceOrder: {
    id: string;
    status: string;
    trackingAwb: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    address: {
      name: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    payments: Array<{
      id: string;
      gateway: string;
      status: string;
      amountCents: number;
      createdAt: string;
    }>;
  };
};
