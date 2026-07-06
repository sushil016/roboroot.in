"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, PackageCheck, ShieldCheck, ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ProductImage } from "@/features/products/components/ProductImage";
import { orderApi } from "@/features/products/services/product.service";
import { formatPrice } from "@/store/cart.store";
import { useAuthStore } from "@/store/user.store";
import { MagicCard } from "@/components/ui/magic-card";
import { OrderStatus } from "@/types/marketplace.types";
import { Skeleton } from "@/components/ui/skeleton";
import { initiatePayment, verifyPayment } from "@/features/payment/services/payment.service";

// Razorpay checkout script — typed loosely as any is unavoidable for 3rd-party modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let Razorpay: any;

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof Razorpay !== "undefined") { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

type PaymentClientProps = {
  orderId: string;
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 border-amber-200",
  CREATED: "text-blue-600 bg-blue-50 border-blue-200",
  PAID: "text-emerald-600 bg-emerald-50 border-emerald-200",
  FAILED: "text-red-600 bg-red-50 border-red-200",
};

export function PaymentClient({ orderId }: PaymentClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async () => {
      await loadRazorpayScript();

      const { gatewayOrderId, keyId, amount, currency } = await initiatePayment(orderId);

      return new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          amount,
          currency,
          order_id: gatewayOrderId,
          name: "RoboRoot",
          description: `Order ${orderId}`,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await verifyPayment(orderId, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          theme: { color: "#1CA2D1" },
        };

        const rzp = new Razorpay(options);
        rzp.open();
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Payment successful!");
      router.push(`/checkout/success?orderId=${orderId}`);
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : "Payment failed";
      if (msg !== "Payment cancelled") toast.error(msg);
    },
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f2f2f0]">
        <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
          <div className="mx-auto max-w-7xl space-y-3">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-10 w-72 bg-white/10" />
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-zinc-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f2f2f0]">
        <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <Lock className="h-8 w-8 text-[#1CA2D1] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white">Login to continue</h1>
            <p className="mt-2 text-zinc-400 text-sm">This payment belongs to your RoboRoot account.</p>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <Link
            href={`/login?redirect=/checkout/payment/${orderId}`}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1CA2D1] px-6 text-sm font-bold text-white hover:bg-[#1590bb] transition-colors"
          >
            Login to continue
          </Link>
        </div>
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f2f0]">
        <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
          <div className="mx-auto max-w-7xl space-y-3">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-10 w-80 bg-white/10" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="min-h-screen bg-[#f2f2f0]">
        <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white">Order not found</h1>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-sm text-zinc-500">Check your order history or start checkout again.</p>
          <Link
            href="/orders"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#222222] px-6 text-sm font-bold text-white hover:bg-[#1CA2D1] transition-colors"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = orderQuery.data;
  const payment = order.payments[0];
  const isPending = order.status === OrderStatus.PENDING_PAYMENT;
  const isPaid = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.PACKED,
    OrderStatus.SHIPPED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ].includes(order.status);
  const paymentStatusStyle =
    PAYMENT_STATUS_COLORS[payment?.status || "CREATED"] ?? PAYMENT_STATUS_COLORS.CREATED;

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      {/* Dark hero */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <Link href="/">
              <Image src="/roboroot-logo.png" alt="RoboRoot" width={140} height={38} className="h-9 w-auto brightness-0 invert" />
            </Link>
          </div>
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to order
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[#1CA2D1]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Secure Payment
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white md:text-5xl tracking-tight">
            Complete your payment
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-xs text-zinc-400 font-mono">{order.id}</p>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${paymentStatusStyle}`}
            >
              {payment?.status || "CREATED"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <div className="space-y-6 mb-8 lg:mb-0">
          {/* Payment method info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="#1CA2D1"
              gradientTo="#E8E8E6"
              gradientColor="#1CA2D1"
              gradientOpacity={0.05}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#222222]">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#222222]">Payment Method</h2>
                    <p className="text-xs text-zinc-400">{payment?.gateway || "TEST"}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#F2F2F0] border border-[#D2D2D0] p-4">
                  <p className="text-xs font-medium leading-5 text-zinc-600">
                    Payments are processed securely via Razorpay. UPI, cards, and net banking are supported.
                    You will be redirected to the Razorpay modal to complete payment.
                  </p>
                </div>
              </div>
            </MagicCard>
          </motion.div>

          {/* Order items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="#1CA2D1"
              gradientTo="#E8E8E6"
              gradientColor="#1CA2D1"
              gradientOpacity={0.05}
            >
              <div className="p-6 space-y-4">
                <h2 className="text-base font-bold text-[#222222]">Order Items</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] p-3"
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-[#F2F2F0] overflow-hidden">
                        <ProductImage
                          src={item.component?.imageUrl}
                          alt={item.description}
                          className="h-full w-full"
                          imageClassName="object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#222222] line-clamp-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1CA2D1] shrink-0">
                        {formatPrice(item.subtotalCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </motion.div>
        </div>

        {/* Payment summary sidebar */}
        <aside className="h-fit lg:sticky lg:top-24">
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="#1CA2D1"
            gradientTo="#E8E8E6"
            gradientColor="#1CA2D1"
            gradientOpacity={0.07}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-[#222222]">Payment Summary</h2>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Payment status</span>
                  <span
                    className={`font-semibold rounded-full border px-2 py-0.5 text-[11px] ${paymentStatusStyle}`}
                  >
                    {payment?.status || "CREATED"}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Order status</span>
                  <span className="font-semibold text-[#222222]">{order.status}</span>
                </div>
                <div className="border-t border-[#D2D2D0] pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-[#222222]">Total</span>
                    <span className="text-xl font-bold text-[#1CA2D1]">
                      {formatPrice(order.totalAmountCents)}
                    </span>
                  </div>
                </div>
              </div>

              {isPending && (
                <button
                  type="button"
                  onClick={() => initiatePaymentMutation.mutate()}
                  disabled={initiatePaymentMutation.isPending}
                  className="w-full h-12 rounded-xl bg-[#222222] text-sm font-bold text-white hover:bg-[#1CA2D1] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {initiatePaymentMutation.isPending ? (
                    "Opening payment..."
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay with Razorpay
                    </>
                  )}
                </button>
              )}

              {isPaid && (
                <Link
                  href={`/checkout/success?orderId=${order.id}`}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
                >
                  <PackageCheck className="h-4 w-4" />
                  View Confirmation
                </Link>
              )}

              {order.status === OrderStatus.CANCELLED && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-600">
                    This order has been cancelled. Create a new checkout to purchase these items.
                  </p>
                </div>
              )}

              <Link
                href={`/orders/${order.id}`}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#D2D2D0] text-sm font-semibold text-zinc-600 hover:border-[#222222] hover:text-[#222222] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                View Order Detail
              </Link>
            </div>
          </MagicCard>
        </aside>
      </div>
    </div>
  );
}
