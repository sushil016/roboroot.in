/**
 * Component Marketplace API Client
 * Handles all component and order-related API calls
 */

import api from '@/lib/api-client';
import type {
  Component,
  ComponentCategoryNode,
  ComponentCategorySummaryNode,
  ComponentFilters,
  ComponentListResponse,
  ProductMedia,
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  CouponValidationResponse,
} from '@/types/marketplace.types';

export const componentApi = {
  /**
   * Get list of components with filters and pagination
   */
  getComponents: async (filters?: ComponentFilters): Promise<ComponentListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.subcategory) params.append('subcategory', filters.subcategory);
    if (filters?.productType) params.append('productType', filters.productType);
    if (filters?.isBestSeller !== undefined) params.append('isBestSeller', filters.isBestSeller.toString());
    if (filters?.isRobomaniacItem !== undefined) params.append('isRobomaniacItem', filters.isRobomaniacItem.toString());
    if (filters?.isSoftware !== undefined) params.append('isSoftware', filters.isSoftware.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.inStock !== undefined) params.append('inStock', filters.inStock.toString());
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/api/components?${params.toString()}`);
    
    // Transform backend response to frontend format
    const { data, pagination } = response.data;
    return {
      components: data,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    };
  },

  /**
   * Get single component by ID
   */
  getComponentById: async (id: string): Promise<Component> => {
    const response = await api.get(`/api/components/${id}`);
    return response.data.data;
  },

  /**
   * Get single component by slug (SEO-friendly URL)
   */
  getComponentBySlug: async (slug: string): Promise<Component> => {
    const response = await api.get(`/api/components/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Get component by SKU
   */
  getComponentBySku: async (sku: string): Promise<Component> => {
    const response = await api.get(`/api/components/sku/${sku}`);
    return response.data.data;
  },

  /**
   * Get category > subcategory > products tree
   */
  getCategoryTree: async (): Promise<ComponentCategoryNode[]> => {
    const response = await api.get('/api/components/categories/tree');
    return response.data.data;
  },

  getCategorySummary: async (): Promise<ComponentCategorySummaryNode[]> => {
    const response = await api.get('/api/components/categories/summary');
    return response.data.data;
  },

  /**
   * Get all media (images + video) for a product
   */
  getProductMedia: async (id: string): Promise<ProductMedia[]> => {
    const response = await api.get(`/api/components/${id}/media`);
    return response.data.data;
  },
};

export const orderApi = {
  /**
   * Create new order
   */
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.post('/api/orders', data);
    return response.data.data;
  },

  /**
   * Validate checkout coupon code
   */
  validateCoupon: async (data: {
    code: string;
    subtotalCents: number;
    shippingCents: number;
  }): Promise<CouponValidationResponse | null> => {
    const response = await api.post('/api/orders/coupons/validate', data);
    return response.data.data;
  },

  /**
   * Get user's orders
   */
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/api/orders/my');
    return response.data.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data.data;
  },

  /**
   * Confirm payment for a pending order
   */
  confirmPayment: async (id: string): Promise<Order> => {
    const response = await api.post(`/api/orders/${id}/payments/confirm`);
    return response.data.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.post(`/api/orders/${id}/cancel`);
    return response.data.data;
  },
};

export async function getProductMetadataById(id: string): Promise<Component> {
  return componentApi.getComponentById(id);
}

export async function getProductMetadataBySlug(slug: string): Promise<Component> {
  return componentApi.getComponentBySlug(slug);
}
