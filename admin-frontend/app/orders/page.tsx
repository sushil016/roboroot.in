"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/core/context/AdminContext";
import { OrdersView } from "@/components/admin/sections/OrdersView";
import type { AdminOrder, AdminOrderStatus } from "@/types";
import { fetchAllOrders, updateOrderStatus } from "@/api/orders";

export default function OrdersPage() {
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  async function loadOrders() {
    if (!token) return;
    setIsLoading(true);
    try {
      const orderList = await fetchAllOrders(token);
      setOrders(orderList);
      setStatus("Orders loaded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleUpdateOrderStatus(order: AdminOrder, newStatus: AdminOrderStatus) {
    if (!token) return;
    setIsLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus, token);
      setStatus(`Updated order ${order.id} to ${newStatus}`);
      await loadOrders();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OrdersView 
      orders={orders} 
      isLoading={isLoading} 
      onUpdateStatus={handleUpdateOrderStatus} 
      onOrderUpdated={loadOrders} 
    />
  );
}
