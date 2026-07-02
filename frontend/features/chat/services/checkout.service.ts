import { initiatePayment, verifyPayment } from "@/features/payment/services/payment.service";

/**
 * Razorpay's checkout modal is loaded from their CDN and attaches a global
 * `window.Razorpay` constructor. It has no first-party types, so the modal
 * surface is described locally.
 */
interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const BRAND_COLOR = "#1CA2D1";

/** Broadcast so any mounted profile/orders view can refresh its data. */
export const ORDER_PAID_EVENT = "roboroot:order-paid";

function getRazorpay(): RazorpayConstructor | undefined {
  return (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (getRazorpay()) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load the payment gateway")));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the payment gateway"));
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutHandlers {
  /** Fired after the payment signature is verified server-side and the order is PAID. */
  onSuccess?: (orderId: string) => void;
  /** Fired when the shopper closes the modal without paying. */
  onDismiss?: () => void;
  /** Fired for load/initiate/verify failures. */
  onError?: (message: string) => void;
  prefill?: { name?: string; email?: string; contact?: string };
}

/**
 * Run the full in-chat checkout for an existing order:
 *   initiate (server creates/reuses the Razorpay order)
 *     → open the Razorpay modal popup inside the chat
 *       → on success, verify the signature server-side (marks the order PAID)
 *
 * The card only needs an `orderId`; everything else (amount, gateway order id,
 * key) is fetched fresh from the backend so the flow is safe to retry.
 */
export async function startRazorpayCheckout(
  orderId: string,
  handlers: RazorpayCheckoutHandlers = {},
): Promise<void> {
  await loadRazorpayScript();

  const Razorpay = getRazorpay();
  if (!Razorpay) {
    handlers.onError?.("Payment gateway is unavailable. Please try again.");
    return;
  }

  const { gatewayOrderId, keyId, amount, currency } = await initiatePayment(orderId);

  const options: RazorpayOptions = {
    key: keyId,
    amount,
    currency,
    order_id: gatewayOrderId,
    name: "RoboRoot",
    description: `Order ${orderId}`,
    handler: (response) => {
      void verifyPayment(orderId, {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent(ORDER_PAID_EVENT, { detail: { orderId } }));
          handlers.onSuccess?.(orderId);
        })
        .catch((err: unknown) => {
          handlers.onError?.(err instanceof Error ? err.message : "Payment verification failed");
        });
    },
    modal: { ondismiss: () => handlers.onDismiss?.() },
    theme: { color: BRAND_COLOR },
    ...(handlers.prefill ? { prefill: handlers.prefill } : {}),
  };

  new Razorpay(options).open();
}
