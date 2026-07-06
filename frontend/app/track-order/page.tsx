"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/user.store";
import { orderApi } from "@/features/products/services/product.service";
import { formatPrice } from "@/store/cart.store";
import type { Order } from "@/types/marketplace.types";
import { cn } from "@/lib/utils";
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  HelpCircle, 
  Lock, 
  Loader2, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIMELINE_STEPS = [
  { status: "PLACED", label: "Order Placed", desc: "Your order has been submitted successfully." },
  { status: "CONFIRMED", label: "Confirmed", desc: "Our team is preparing your hardware items." },
  { status: "SHIPPED", label: "Shipped", desc: "Dispatched via logistics. Tracking details generated." },
  { status: "DELIVERED", label: "Delivered", desc: "Item received at delivery destination." }
];

export default function TrackOrderPage() {
  const { isAuthenticated } = useAuthStore();
  const [searchOrderId, setSearchOrderId] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // 1. Get user's orders if authenticated
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.getMyOrders(),
    enabled: isAuthenticated,
  });

  // 2. Fetch specific order status if selected
  const { data: order, isLoading: isLoadingDetails, error: detailsError } = useQuery({
    queryKey: ["order-details", activeOrderId],
    queryFn: () => orderApi.getOrderById(activeOrderId!),
    enabled: !!activeOrderId,
  });

  // Map database status string to timeline step index
  function getStepIndex(status: string): number {
    switch (status) {
      case "PENDING_PAYMENT":
      case "CREATED":
        return 0;
      case "PROCESSING":
      case "CONFIRMED":
        return 1;
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return 2;
      case "DELIVERED":
        return 3;
      case "CANCELLED":
        return -1; // special case
      default:
        return 0;
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchOrderId.trim()) return;
    setActiveOrderId(searchOrderId.trim());
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-[#f2f2f0] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D2D2D0] rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 bg-[#1CA2D1]/10 rounded-full flex items-center justify-center mx-auto text-[#1CA2D1]">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#222222]">Login Required</h1>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              Order tracking details are private and secure. Please log in to your account to search and view your shipments.
            </p>
          </div>
          <Link href="/login?redirect=/track-order" className="block">
            <Button className="w-full bg-[#1CA2D1] hover:bg-[#1CA2D1]/90 text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2">
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] text-[#222222] font-sans pb-16">
      
      {/* Hero Header */}
      <section className="bg-[#222222] rounded-b-[2.5rem] py-12 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Track Your Shipment</h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Monitor real-time statuses, shipping carriers, and estimated delivery dates for your RoboRoot orders.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* LEFT PANEL — Order Search & Selection list */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Search Widget */}
            <div className="bg-white rounded-2xl p-5 border border-[#D2D2D0] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Find by Order ID</h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ord_clxyz..."
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="flex-1 h-10 px-3 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1]"
                />
                <button
                  type="submit"
                  disabled={!searchOrderId.trim()}
                  className="h-10 px-4 rounded-xl bg-[#222222] text-xs font-bold text-white transition hover:bg-[#1CA2D1] disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Orders List */}
            <div className="bg-white rounded-2xl p-5 border border-[#D2D2D0] shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Your Recent Orders</h3>

              {isLoadingOrders ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1CA2D1]" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No orders found on this account.</p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {orders.map((o: Order) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setActiveOrderId(o.id);
                        setSearchOrderId(o.id);
                      }}
                      className={cn(
                        "w-full text-left p-3.5 border rounded-xl transition duration-150 flex flex-col gap-1.5 cursor-pointer",
                        activeOrderId === o.id
                          ? "border-[#1CA2D1] bg-[#1CA2D1]/5"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-700 truncate max-w-[130px]">{o.id}</span>
                        <span className="text-[10px] text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-black text-[#1CA2D1]">{formatPrice(o.totalAmountCents)}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                          o.status === "DELIVERED" ? "bg-green-150 text-green-700" :
                          o.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                          o.status === "SHIPPED" ? "bg-blue-100 text-blue-600" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {o.status.replace("_", " ")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL — Active Order timeline & breakdown */}
          <div className="lg:col-span-8">
            {isLoadingDetails ? (
              <div className="bg-white rounded-2xl p-12 border border-[#D2D2D0] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#1CA2D1]" />
                <p className="text-xs text-zinc-500 font-semibold">Loading shipment info...</p>
              </div>
            ) : detailsError || (activeOrderId && !order) ? (
              <div className="bg-white rounded-2xl p-12 border border-[#D2D2D0] flex flex-col items-center justify-center gap-3 text-center">
                <ShieldAlert className="w-10 h-10 text-red-500" />
                <h3 className="font-black text-lg text-[#222222]">Order Not Found</h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  We couldn&apos;t load order details. Please double-check your Order ID and make sure it belongs to your account.
                </p>
              </div>
            ) : order ? (
              <div className="space-y-6">
                
                {/* Status Timeline Card */}
                <div className="bg-white rounded-2xl p-6 border border-[#D2D2D0] shadow-xs space-y-8">
                  
                  {/* Timeline Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-150 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-[#222222]">Shipment Timeline</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Order ID: <span className="font-bold text-[#222222]">{order.id}</span></p>
                    </div>
                    
                    {order.trackingAwb && (
                      <div className="text-xs font-semibold p-2.5 bg-zinc-50 border rounded-xl flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#1CA2D1]" />
                        <span>AWB Code: <span className="text-[#222222] font-black">{order.trackingAwb}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Cancelled Alert */}
                  {order.status === "CANCELLED" ? (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Order Cancelled</h4>
                        <p className="text-xs leading-normal mt-1 font-medium text-red-650">
                          {order.notes || "This order was cancelled. Any refunds will be returned to the origin payment method."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Timeline graphic */
                    <div className="grid gap-6 md:grid-cols-4 relative pl-4 md:pl-0">
                      {/* Vertical line for mobile viewports */}
                      <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-zinc-200 md:hidden" />
                      
                      {TIMELINE_STEPS.map((step, idx) => {
                        const stepIndex = getStepIndex(order.status);
                        const isCompleted = stepIndex >= idx;
                        const isCurrent = stepIndex === idx;

                        return (
                          <div key={step.status} className="relative flex md:flex-col gap-4 md:gap-0 md:text-center items-start md:items-center">
                            
                            {/* Connector line for desktop */}
                            {idx < TIMELINE_STEPS.length - 1 && (
                              <div className={cn(
                                "hidden md:block absolute left-1/2 top-4 w-full h-0.5 bg-zinc-200 z-0",
                                stepIndex > idx ? "bg-emerald-500" : "bg-zinc-200"
                              )} />
                            )}

                            {/* Circle Indicator */}
                            <div className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center z-10 shrink-0 border-4 transition-all duration-300",
                              isCompleted 
                                ? "bg-emerald-500 border-emerald-50 text-white" 
                                : "bg-white border-zinc-150 text-zinc-400"
                            )}>
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                              ) : (
                                <Clock className="w-4.5 h-4.5" />
                              )}
                            </div>

                            {/* Descriptions */}
                            <div className="md:mt-3 flex-1">
                              <h4 className={cn(
                                "font-black text-sm",
                                isCompleted ? "text-[#222222]" : "text-zinc-400",
                                isCurrent && "text-[#1CA2D1]"
                              )}>
                                {step.label}
                              </h4>
                              <p className="text-[10px] text-zinc-400 mt-1 leading-normal md:max-w-[150px] md:mx-auto font-medium">
                                {step.desc}
                              </p>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Items breakdown card */}
                <div className="bg-white rounded-2xl p-6 border border-[#D2D2D0] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Order Items</h3>
                  <div className="divide-y divide-zinc-200">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start">
                        <div className="relative w-12 h-12 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shrink-0 flex items-center justify-center">
                          {item.component?.imageUrl ? (
                            <img src={item.component.imageUrl} alt="" className="object-contain p-1 w-full h-full" />
                          ) : (
                            <Package className="w-6 h-6 text-zinc-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#222222] truncate leading-tight">{item.component?.name || "Marketplace Component"}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-xs font-black text-[#222222] shrink-0">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const subtotalCents = order.items?.reduce((sum: number, item: any) => sum + (item.unitPriceCents * item.quantity), 0) || 0;
                    const diff = order.totalAmountCents - subtotalCents;
                    const shippingCents = diff > 0 ? diff : 0;
                    const discountCents = diff < 0 ? -diff : 0;

                    return (
                      <div className="border-t border-zinc-200 pt-4 flex flex-col items-end gap-1.5">
                        <div className="flex justify-between w-40 text-xs font-bold text-zinc-500">
                          <span>Subtotal:</span>
                          <span>{formatPrice(subtotalCents)}</span>
                        </div>
                        {shippingCents > 0 && (
                          <div className="flex justify-between w-40 text-xs font-bold text-zinc-500">
                            <span>Shipping:</span>
                            <span>{formatPrice(shippingCents)}</span>
                          </div>
                        )}
                        {discountCents > 0 && (
                          <div className="flex justify-between w-40 text-xs font-bold text-red-500">
                            <span>Discount:</span>
                            <span>-{formatPrice(discountCents)}</span>
                          </div>
                        )}
                        <div className="flex justify-between w-40 text-sm font-black text-[#222222] border-t pt-1.5">
                          <span>Total Paid:</span>
                          <span className="text-[#1CA2D1]">{formatPrice(order.totalAmountCents)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-[#D2D2D0] flex flex-col items-center justify-center gap-3 text-center">
                <Package className="w-12 h-12 text-zinc-200" />
                <h3 className="font-black text-lg text-[#222222]">Select an Order to Track</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Choose a recent order from the left sidebar or input an Order ID manually to monitor your package.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
