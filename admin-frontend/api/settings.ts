import { apiFetch } from "./client";

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

export type DeliverySettingsUpdate = Pick<
  DeliverySettings,
  "deliveryFeeEnabled" | "deliveryFeeCents" | "freeDeliveryThresholdCents"
> & {
  deliveryFeeRules: Array<
    Pick<DeliveryFeeRule, "minOrderCents" | "maxOrderCents" | "feeCents">
  >;
};

export async function getDeliverySettings(token: string): Promise<DeliverySettings> {
  const payload = await apiFetch<{ success: boolean; data: DeliverySettings }>(
    "/api/admin/settings/delivery",
    { token },
  );
  return payload.data;
}

export async function updateDeliverySettings(
  settings: DeliverySettingsUpdate,
  token: string,
): Promise<DeliverySettings> {
  const payload = await apiFetch<{ success: boolean; data: DeliverySettings }>(
    "/api/admin/settings/delivery",
    {
      method: "PATCH",
      body: JSON.stringify(settings),
      token,
    },
  );
  return payload.data;
}
