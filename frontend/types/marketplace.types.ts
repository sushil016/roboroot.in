/**
 * Component Marketplace Type Definitions
 */

export interface ProductMedia {
  id: string;
  componentId: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  sortOrder: number;
  createdAt: string;
}

export interface Component {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  description: string | null;
  typicalUseCase: string | null;
  vendorLink: string | null;
  imageUrl: string | null;
  category: string;
  subcategory: string;
  productType: ComponentProductType;
  brand: string | null;
  tags: string[];
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  unitPriceCents: number;
  discountedPriceCents?: number | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ComponentProductType =
  | 'ELECTRONICS_COMPONENT'
  | 'MODULE'
  | 'SENSOR'
  | 'DEVELOPMENT_BOARD'
  | 'MOTOR_ACTUATOR'
  | 'POWER_BATTERY'
  | 'TOOL_EQUIPMENT'
  | 'COURSE_KIT'
  | 'BOOK'
  | 'SOFTWARE'
  | 'CUSTOM_PROJECT_SERVICE'
  | 'OTHER';

export interface ComponentFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  productType?: ComponentProductType;
  isBestSeller?: boolean;
  isRobomaniacItem?: boolean;
  isSoftware?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ComponentListResponse {
  components: Component[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComponentCategoryNode {
  category: string;
  imageUrl?: string | null;
  description?: string | null;
  count: number;
  subcategories: {
    name: string;
    count: number;
    products: Component[];
  }[];
}

export interface CartItem {
  component: Component;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotalCents: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  orderType: OrderType;
  totalAmountCents: number;
  addressId: string;
  notes: string | null;
  trackingAwb: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
  address?: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemType: OrderItemType;
  componentId: string | null;
  kitId: string | null;
  description: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  component?: Component;
}

export interface Payment {
  id: string;
  orderId: string;
  gateway: PaymentGateway;
  amountCents: number;
  status: PaymentStatus;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  gatewayTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'Awaiting Payment',
  [OrderStatus.PAID]: 'Payment Confirmed',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.PACKED]: 'Packed',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.RETURN_REQUESTED]: 'Return Requested',
  [OrderStatus.RETURNED]: 'Returned',
  [OrderStatus.REFUND_INITIATED]: 'Refund Initiated',
  [OrderStatus.REFUNDED]: 'Refunded',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

export enum OrderType {
  KIT_ONLY = 'KIT_ONLY',
  PROJECT_KIT = 'PROJECT_KIT',
  COMPONENTS_ONLY = 'COMPONENTS_ONLY',
  BUILT_PROJECT = 'BUILT_PROJECT',
  PRE_BUILT_PROJECT = 'PRE_BUILT_PROJECT',
}

export enum OrderItemType {
  KIT = 'KIT',
  COMPONENT = 'COMPONENT',
  SERVICE = 'SERVICE',
}

export enum PaymentGateway {
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE',
  STRIPE = 'STRIPE',
  TEST = 'TEST',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface CreateOrderRequest {
  items: {
    componentId: string;
    quantity: number;
  }[];
  shippingAddressId?: string;
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  paymentGateway?: PaymentGateway;
  couponCode?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  order: Order;
  paymentUrl?: string;
}

export interface CouponValidationResponse {
  code: string;
  label: string;
  discountCents: number;
}
