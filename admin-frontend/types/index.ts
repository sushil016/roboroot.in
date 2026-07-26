export type ProductType =
  | "ELECTRONICS_COMPONENT"
  | "MODULE"
  | "SENSOR"
  | "DEVELOPMENT_BOARD"
  | "MOTOR_ACTUATOR"
  | "POWER_BATTERY"
  | "TOOL_EQUIPMENT"
  | "COURSE_KIT"
  | "BOOK"
  | "SOFTWARE"
  | "CUSTOM_PROJECT_SERVICE"
  | "OTHER";

export type Product = {
  id: string;
  name: string;
  slug: string | null;
  sku: string | null;
  description: string | null;
  typicalUseCase: string | null;
  vendorLink: string | null;
  imageUrl: string | null;
  category: string;
  subcategory: string;
  productType: ProductType;
  brand: string | null;
  tags: string[];
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  unitPriceCents: number;
  discountedPriceCents: number | null;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductListResponse = {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CategoryNode = {
  category: string;
  count: number;
  subcategories: {
    name: string;
    count: number;
    products: Product[];
  }[];
};

export type Project = {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category: string;
  difficulty: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  estimatedCostCents?: number;
  estimatedBuildTimeMinutes?: number;
  preBuiltAvailable?: boolean;
  preBuiltPriceCents?: number;
  preBuiltStock?: number;
  imageUrls?: string[];
  pdfUrls?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  isFeatured: boolean;
  isPublic: boolean;
};

export type ProjectListResponse = {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      total: number;
    };
  };
};

export type AdminOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUND_INITIATED"
  | "REFUNDED"
  | "CANCELLED";

export type AdminOrder = {
  id: string;
  userId: string;
  addressId: string;
  orderType: string;
  status: AdminOrderStatus;
  totalAmountCents: number;
  notes: string | null;
  trackingAwb: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  address?: {
    name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    subtotalCents: number;
    component?: Product | null;
  }[];
  payments: {
    id: string;
    gateway: string;
    gatewayTransactionId: string | null;
    status: string;
    amountCents: number;
    createdAt: string;
  }[];
  coupon?: {
    code: string;
    label: string;
  } | null;
};

export type AdminOrderListResponse = {
  success: boolean;
  data: AdminOrder[];
};

export type AdminOrderUpdateResponse = {
  success: boolean;
  data: AdminOrder;
  message?: string;
};

export type LoginResponse = {
  success: boolean;
  data: {
    user: {
      email: string;
      name: string | null;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
};

export type ProductForm = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  typicalUseCase: string;
  vendorLink: string;
  imageUrl: string;
  category: string;
  subcategory: string;
  productType: ProductType;
  brand: string;
  tags: string;
  unitPrice: string;
  discountedPrice: string;
  stockQuantity: string;
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  isActive: boolean;
};

export type ProjectForm = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  estimatedCost: string;
  estimatedBuildTimeMinutes: string;
  tags: string;
  learningOutcomes: string;
  prerequisites: string;
  preBuiltAvailable: boolean;
  preBuiltPrice: string;
  preBuiltStock: string;
  imageUrls: string;
  pdfUrls: string;
  isFeatured: boolean;
  isPublic: boolean;
};

export type AdminSection =
  | "dashboard"
  | "catalog"
  | "products"
  | "categories"
  | "subcategories"
  | "projects"
  | "orders"
  | "coupons"
  | "careers"
  | "media"
  | "settings";

export type DiscountType = "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";

export type Coupon = {
  id: string;
  code: string;
  label: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderCents: number;
  maxUsageCount: number | null;
  usageCount: number;
  perUserLimit: number | null;
  allowedEmail: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
};
