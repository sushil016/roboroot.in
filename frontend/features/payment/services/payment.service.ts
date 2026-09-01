import apiClient from "@/lib/api-client";

export type RazorpayInitiatePaymentResponse = {
  gateway: "RAZORPAY";
  gatewayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
};

export type ZohoInitiatePaymentResponse = {
  gateway: "ZOHO";
  checkoutUrl: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
};

export type InitiatePaymentResponse = RazorpayInitiatePaymentResponse | ZohoInitiatePaymentResponse;

export async function initiatePayment(orderId: string): Promise<InitiatePaymentResponse> {
  const { data } = await apiClient.post(`/api/payments/${orderId}/initiate`);
  return data.data;
}

export async function verifyPayment(
  orderId: string,
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
): Promise<void> {
  await apiClient.post(`/api/payments/${orderId}/verify`, payload);
}
