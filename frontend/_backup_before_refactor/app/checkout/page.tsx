"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, ShieldCheck, MapPin, Tag, ArrowRight, CheckCircle2, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice, useCartStore } from "@/lib/store/cartStore";
import { addressApi } from "@/lib/api/address.api";
import { orderApi } from "@/lib/api/marketplace.api";
import { PaymentGateway, type CouponValidationResponse } from "@/lib/types/marketplace.types";
import { ProductImage } from "@/features/marketplace/components/ProductImage";
import { MagicCard } from "@/components/ui/magic-card";

const initialAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const ADDRESS_FIELDS: [keyof typeof initialAddress, string, boolean][] = [
  ["name", "Full name", true],
  ["phone", "Phone number", true],
  ["line1", "Address line 1", true],
  ["line2", "Address line 2 (optional)", false],
  ["city", "City", true],
  ["state", "State", true],
  ["pincode", "Pincode", true],
  ["country", "Country", true],
];

const PAYMENT_OPTIONS = [
  { value: PaymentGateway.RAZORPAY, title: "Razorpay", copy: "UPI, cards, net banking & wallets" },
  { value: PaymentGateway.TEST, title: "Test Payment", copy: "Instant confirmation (dev only)" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [address, setAddress] = useState(initialAddress);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>(PaymentGateway.RAZORPAY);
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list(),
    enabled: isAuthenticated,
  });
  const savedAddresses = addressesQuery.data || [];
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 5000;
  const discount = appliedCoupon?.discountCents || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const canCheckout = useMemo(() => {
    const hasSavedAddress = !useNewAddress && Boolean(selectedAddressId);
    const hasNewAddress =
      address.name.trim() &&
      address.phone.trim() &&
      address.line1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim();
    return items.length > 0 && (hasSavedAddress || hasNewAddress);
  }, [address, items.length, selectedAddressId, useNewAddress]);

  useEffect(() => {
    if (savedAddresses.length === 0 || selectedAddressId) return;
    const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    setSelectedAddressId(defaultAddress.id);
    setUseNewAddress(false);
  }, [savedAddresses, selectedAddressId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) { router.push("/login?redirect=/checkout"); return; }
    if (!canCheckout) { toast.error("Please fill shipping details"); return; }
    setIsSubmitting(true);
    try {
      const payload = await orderApi.createOrder({
        items: items.map((item) => ({ componentId: item.component.id, quantity: item.quantity })),
        shippingAddressId: useNewAddress ? undefined : selectedAddressId,
        shippingAddress: useNewAddress ? address : undefined,
        paymentGateway,
        couponCode: appliedCoupon?.code,
        notes: notes || undefined,
      });
      clearCart();
      if (payload.paymentUrl) { router.push(payload.paymentUrl); return; }
      toast.success("Order placed successfully");
      router.push(`/checkout/success?orderId=${payload.order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return; }
    if (!isAuthenticated) { router.push("/login?redirect=/checkout"); return; }
    setIsApplyingCoupon(true);
    try {
      const coupon = await orderApi.validateCoupon({ code: couponCode, subtotalCents: subtotal, shippingCents: shipping });
      setAppliedCoupon(coupon);
      toast.success(coupon ? `Coupon applied: ${coupon.label}` : "Coupon cleared");
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error instanceof Error ? error.message : "Coupon failed");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f2f0] flex items-center justify-center">
        <p className="text-sm font-semibold text-zinc-400">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f2f2f0]">
        <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white">Your cart is empty</h1>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-sm text-zinc-500">Add products before checkout.</p>
          <Link
            href="/components"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#222222] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-primary)] transition-colors"
          >
            Browse Components <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      {/* Dark hero */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-[var(--brand-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Checkout</span>
          </div>
          <h1 className="text-4xl font-bold text-white md:text-5xl tracking-tight">Shipping & Payment</h1>
          {!isAuthenticated && (
            <p className="mt-3 text-sm font-medium text-amber-400">
              You need to{" "}
              <Link href="/login?redirect=/checkout" className="underline font-bold">
                login
              </Link>{" "}
              before placing the order.
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8"
      >
        <div className="space-y-6 mb-8 lg:mb-0">
          {/* Shipping address */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.05}
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#222222]">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-[#222222]">Shipping Address</h2>
                </div>

                {addressesQuery.isLoading && (
                  <p className="text-sm text-zinc-400">Loading saved addresses...</p>
                )}

                {savedAddresses.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {savedAddresses.map((savedAddress) => (
                      <label
                        key={savedAddress.id}
                        className={`relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-colors ${
                          !useNewAddress && selectedAddressId === savedAddress.id
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                            : "border-[#D2D2D0] hover:border-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="checkout-address"
                          checked={!useNewAddress && selectedAddressId === savedAddress.id}
                          onChange={() => { setUseNewAddress(false); setSelectedAddressId(savedAddress.id); }}
                          className="sr-only"
                        />
                        {!useNewAddress && selectedAddressId === savedAddress.id && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[var(--brand-primary)]" />
                        )}
                        <span className="text-sm font-bold text-[#222222]">{savedAddress.name}</span>
                        {savedAddress.isDefault && (
                          <span className="inline-flex w-fit rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-primary)]">
                            Default
                          </span>
                        )}
                        <span className="text-xs leading-5 text-zinc-500">
                          {savedAddress.line1}
                          {savedAddress.line2 ? `, ${savedAddress.line2}` : ""}, {savedAddress.city},{" "}
                          {savedAddress.state} - {savedAddress.pincode}
                        </span>
                        <span className="text-[11px] text-zinc-400">{savedAddress.phone}</span>
                      </label>
                    ))}
                    <label
                      className={`relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-colors ${
                        useNewAddress ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-[#D2D2D0] hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="checkout-address"
                        checked={useNewAddress}
                        onChange={() => setUseNewAddress(true)}
                        className="sr-only"
                      />
                      {useNewAddress && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[var(--brand-primary)]" />
                      )}
                      <span className="text-sm font-bold text-[#222222]">New address</span>
                      <span className="text-xs text-zinc-500">Add a new delivery location.</span>
                    </label>
                  </div>
                )}

                {useNewAddress && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {ADDRESS_FIELDS.map(([key, placeholder, required]) => (
                      <input
                        key={key}
                        value={address[key]}
                        onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required={required}
                        className="h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none transition-colors focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-zinc-400"
                      />
                    ))}
                  </div>
                )}

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes, GST details, delivery instructions (optional)"
                  className="min-h-20 w-full rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 py-3 text-sm font-medium text-[#222222] outline-none transition-colors focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-zinc-400 resize-none"
                />
              </div>
            </MagicCard>
          </motion.div>

          {/* Payment method */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}>
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.05}
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#222222]">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-[#222222]">Payment Method</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {PAYMENT_OPTIONS.map(({ value, title, copy }) => (
                    <label
                      key={value}
                      className={`relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-colors ${
                        paymentGateway === value
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                          : "border-[#D2D2D0] hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={paymentGateway === value}
                        onChange={() => setPaymentGateway(value as PaymentGateway)}
                        className="sr-only"
                      />
                      {paymentGateway === value && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[var(--brand-primary)]" />
                      )}
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8E8E6]">
                        <CreditCard className="h-4 w-4 text-[#222222]" />
                      </div>
                      <span className="text-sm font-bold text-[#222222]">{title}</span>
                      <span className="text-xs text-zinc-500">{copy}</span>
                    </label>
                  ))}
                </div>
              </div>
            </MagicCard>
          </motion.div>

          {/* Coupon */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}>
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.05}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#222222]">
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-[#222222]">Coupon Code</h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Try <code className="font-mono font-bold text-[var(--brand-primary)]">ROBO10</code>,{" "}
                  <code className="font-mono font-bold text-[var(--brand-primary)]">STUDENT250</code>, or{" "}
                  <code className="font-mono font-bold text-[var(--brand-primary)]">FREESHIP</code> during development.
                </p>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="h-11 flex-1 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-bold uppercase tracking-wider text-[#222222] outline-none transition-colors focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-zinc-300 placeholder:font-normal placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="h-11 rounded-xl bg-[#222222] px-5 text-sm font-bold text-white hover:bg-[var(--brand-primary)] disabled:opacity-50 transition-colors"
                  >
                    {isApplyingCoupon ? "..." : "Apply"}
                  </button>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                      className="h-11 rounded-xl border border-[#D2D2D0] px-4 text-sm font-semibold text-zinc-500 hover:border-red-200 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-semibold text-emerald-700">
                      {appliedCoupon.label}: -{formatPrice(appliedCoupon.discountCents)}
                    </p>
                  </div>
                )}
              </div>
            </MagicCard>
          </motion.div>
        </div>

        {/* Order summary sidebar */}
        <aside className="h-fit lg:sticky lg:top-24">
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="var(--brand-primary)"
            gradientTo="#E8E8E6"
            gradientColor="var(--brand-primary)"
            gradientOpacity={0.07}
          >
            <div className="p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#222222]">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.component.id} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-[#F2F2F0] overflow-hidden">
                      <ProductImage
                        src={item.component.imageUrl}
                        alt={item.component.name}
                        className="h-full w-full"
                        imageClassName="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold text-[#222222] leading-4">
                        {item.component.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#222222] shrink-0">
                      {formatPrice(item.component.unitPriceCents * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 border-t border-[#D2D2D0] pt-4 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#222222]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-[#222222]"}`}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#D2D2D0] pt-2.5">
                  <span className="text-base font-bold text-[#222222]">Total</span>
                  <span className="text-xl font-bold text-[var(--brand-primary)]">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                disabled={isSubmitting || !canCheckout || !isAuthenticated}
                className="w-full h-12 rounded-xl bg-[#222222] text-sm font-bold text-white hover:bg-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Placing order..." : (
                  <>Place Order <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Secured & encrypted checkout</span>
              </div>
            </div>
          </MagicCard>
        </aside>
      </form>
    </div>
  );
}
