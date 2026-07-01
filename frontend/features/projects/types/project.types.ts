/**
 * Projects Feature Type Definitions
 */

export enum ProjectCategory {
  IOT = 'IOT',
  ROBOTICS = 'ROBOTICS',
  DRONE = 'DRONE',
  AUTOMATION = 'AUTOMATION',
  ENVIRONMENT = 'ENVIRONMENT',
  HEALTH = 'HEALTH',
  AGRICULTURE = 'AGRICULTURE',
  SECURITY = 'SECURITY',
  EDUCATION = 'EDUCATION',
  AUTOMOTIVE = 'AUTOMOTIVE',
  SMART_HOME = 'SMART_HOME',
  ENERGY = 'ENERGY',
  WEARABLES = 'WEARABLES',
  GAMING = 'GAMING',
  MUSIC = 'MUSIC',
  COMMUNICATION = 'COMMUNICATION',
  AI_ML = 'AI_ML',
  COMPUTER_VISION = 'COMPUTER_VISION',
  OTHER = 'OTHER',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum ProjectType {
  FEATURED = 'FEATURED',
  AI_GENERATED = 'AI_GENERATED',
  CUSTOM = 'CUSTOM',
}

export interface ProjectComponentDetail {
  id: string;
  componentId: string;
  quantity: number;
  notes?: string;
  component: {
    id: string;
    slug: string;
    name: string;
    sku?: string;
    description?: string;
    typicalUseCase?: string;
    vendorLink?: string;
    imageUrl?: string;
    category?: string;
    subcategory?: string;
    productType?: string;
    brand?: string | null;
    tags?: string[];
    isBestSeller?: boolean;
    isRobomaniacItem?: boolean;
    isSoftware?: boolean;
    imageUrls: string[]; // Component image gallery
    unitPriceCents: number;
    unitPrice: number;
    stockQuantity: number;
    isActive: boolean;
  };
  totalCost: number;
}

export interface ExternalLink {
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  
  category: ProjectCategory;
  tags: string[];
  
  projectType: ProjectType;
  difficulty: DifficultyLevel;
  
  estimatedCostCents?: number;
  estimatedCost?: number; // In rupees
  estimatedBuildTimeMinutes?: number;
  
  preBuiltAvailable: boolean;
  preBuiltStock: number;
  preBuiltPriceCents?: number;
  preBuiltPrice?: number; // In rupees
  preBuiltImages: string[];
  
  // Media & Resources (Azure Blob Storage)
  thumbnailUrl?: string;
  imageUrls: string[]; // Project image gallery
  pdfUrls: string[]; // Documentation PDFs
  youtubeUrl?: string;
  externalLinks: ExternalLink[]; // Notion docs, GitHub repos, etc.
  
  isFeatured: boolean;
  isPublic: boolean;
  isAIGenerated: boolean;
  publishedAt?: string;
  
  learningOutcomes: string[];
  prerequisites: string[];
  
  viewCount: number;
  buildCount: number;
  averageRating: number;
  
  createdById?: string;
  defaultMentorId?: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Optional relations
  projectComponents?: ProjectComponentDetail[];
  components?: ProjectComponentDetail[]; // Backend sends as 'components'
  componentsCount?: number;
  totalComponentsCost?: number;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProjectFilters {
  category?: ProjectCategory | ProjectCategory[];
  difficulty?: DifficultyLevel | DifficultyLevel[];
  projectType?: ProjectType;
  tags?: string | string[];
  isFeatured?: boolean;
  isPublic?: boolean;
  isAIGenerated?: boolean;
  preBuiltAvailable?: boolean;
  minCost?: number;
  maxCost?: number;
  minBuildTime?: number;
  maxBuildTime?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' | 'buildCount' | 'averageRating' | 'estimatedCostCents';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryWithCount {
  category: ProjectCategory;
  label: string;
  count: number;
}
