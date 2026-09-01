import apiClient from "@/lib/api-client";

export type DeliveryFeeRule = {
  id: string;
  minOrderCents: number;
  maxOrderCents: number;
  feeCents: number;
  sortOrder: number;
};

export type DeliverySettings = {
  deliveryFeeEnabled: boolean;
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  deliveryFeeRules: DeliveryFeeRule[];
  updatedAt: string | null;
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  deliveryFeeEnabled: true,
  deliveryFeeCents: 5000,
  freeDeliveryThresholdCents: 50000,
  deliveryFeeRules: [
    {
      id: "default-delivery-rule",
      minOrderCents: 0,
      maxOrderCents: 50000,
      feeCents: 5000,
      sortOrder: 0,
    },
  ],
  updatedAt: null,
};

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const response = await apiClient.get("/api/store-settings/delivery");
  return response.data.data;
}

export function calculateDeliveryFee(subtotalCents: number, settings: DeliverySettings): number {
  if (
    !settings.deliveryFeeEnabled ||
    subtotalCents === 0 ||
    subtotalCents >= settings.freeDeliveryThresholdCents
  ) {
    return 0;
  }

  const matchingRule = settings.deliveryFeeRules.find(
    (rule) => subtotalCents >= rule.minOrderCents && subtotalCents < rule.maxOrderCents,
  );

  return matchingRule?.feeCents ?? settings.deliveryFeeCents;
}
