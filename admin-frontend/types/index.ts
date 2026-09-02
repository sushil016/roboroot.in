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
  | "3d-printing"
  | "coupons"
  | "careers"
  | "support"
  | "consents"
  | "media"
  | "settings";

export type ConsentType = "TERMS_AND_PRIVACY" | "CHECKOUT_POLICIES" | "COOKIE_PREFERENCES";
export type ConsentAction = "GRANTED" | "UPDATED" | "WITHDRAWN";
export type ConsentSource =
  | "REGISTRATION"
  | "LOGIN"
  | "OAUTH"
  | "CHECKOUT"
  | "THREE_D_PRINTING_CHECKOUT"
  | "COOKIE_BANNER"
  | "COOKIE_SETTINGS";

export type ConsentRecord = {
  id: string;
  userId: string | null;
  orderId: string | null;
  anonymousId: string | null;
  type: ConsentType;
  action: ConsentAction;
  source: ConsentSource;
  policyVersion: string;
  policyVersions: Record<string, string>;
  preferences: Record<string, boolean> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  order: { id: string; totalAmountCents: number; status: string } | null;
};

export type ConsentFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: ConsentType;
  source?: ConsentSource;
  action?: ConsentAction;
  from?: string;
  to?: string;
};

export type ConsentListData = {
  records: ConsentRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { total: number; byType: Partial<Record<ConsentType, number>> };
};

export type SupportTicketPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";
export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";
export type SupportTicketCategory = "ORDER" | "SHIPPING" | "RETURNS_REFUNDS" | "PRODUCT" | "TECHNICAL" | "OTHER";

export type AdminSupportMessage = {
  id: string;
  authorId: string | null;
  authorName: string | null;
  sender: "CUSTOMER" | "SUPPORT" | "SYSTEM";
  body: string;
  isInternal: boolean;
  createdAt: string;
};

export type AdminSupportTicket = {
  id: string;
  ticketNumber: string;
  userId: string | null;
  orderId: string | null;
  assignedToId: string | null;
  requesterName: string;
  requesterEmail: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  firstRespondedAt: string | null;
  resolvedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string } | null;
  assignedTo: { id: string; name: string | null; email: string } | null;
  order: { id: string; status: string; totalAmountCents: number } | null;
  messages: AdminSupportMessage[];
};

export type SupportTicketFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  category?: SupportTicketCategory;
  sla?: "BREACHED" | "DUE_SOON";
};

export type SupportTicketListData = {
  tickets: AdminSupportTicket[];
  summary: { total: number; open: number; breached: number; unassigned: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type SupportAgent = { id: string; name: string | null; email: string };

export type KnowledgeBaseCategory = "GENERAL" | "SHIPPING" | "RETURNS" | "PRODUCT" | "TROUBLESHOOTING";
export type KnowledgeBaseStatus = "DRAFT" | "PUBLISHED";

export type AdminKnowledgeArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: KnowledgeBaseCategory;
  status: KnowledgeBaseStatus;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  createdById: string | null;
  updatedById: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeArticleInput = Pick<
  AdminKnowledgeArticle,
  "title" | "slug" | "excerpt" | "content" | "category" | "status" | "isFeatured" | "sortOrder"
>;

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
