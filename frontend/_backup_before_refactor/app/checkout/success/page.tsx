import Link from "next/link";
import { CheckCircle2, FileText, Package, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/config";

type SuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      {/* Dark hero */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Order Confirmed
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Order placed successfully!
          </h1>
          <p className="mt-3 text-zinc-400 text-sm max-w-sm mx-auto">
            {params.orderId
              ? `Your order has been confirmed and is being processed.`
              : "Your order is confirmed and is being processed."}
          </p>
          {params.orderId && (
            <p className="mt-2 text-xs font-mono text-zinc-500">{params.orderId}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 py-10">
        {/* Info card */}
        <div className="rounded-2xl border border-[#D2D2D0] bg-white p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8E8E6]">
              <Package className="h-5 w-5 text-[#222222]" />
            </div>
            <div>
              <h2 className="font-bold text-[#222222]">What happens next?</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1CA2D1]" />
                  Your order is being reviewed by our team.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1CA2D1]" />
                  You'll receive a confirmation email once it ships.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1CA2D1]" />
                  Track your order status in My Orders.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={params.orderId ? `/orders/${params.orderId}` : "/orders"}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#222222] text-sm font-bold text-white hover:bg-[#1CA2D1] transition-colors"
          >
            <Package className="h-4 w-4" />
            View My Order
          </Link>
          <Link
            href="/components"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D2D2D0] text-sm font-semibold text-[#222222] hover:border-[#222222] transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {params.orderId && (
          <a
            href={`${API_BASE_URL}/api/orders/${params.orderId}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D2D2D0] bg-white text-sm font-semibold text-zinc-600 hover:border-[#222222] hover:text-[#222222] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Download Invoice (PDF)
          </a>
        )}
      </div>
    </div>
  );
}
