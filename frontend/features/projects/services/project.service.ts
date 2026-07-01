/**
 * Projects API Client
 * Handles all project-related API calls
 */

import api from '@/lib/api-client';
import type {
  Project,
  ProjectFilters,
  ProjectListResponse,
  CategoryWithCount,
} from '@/features/projects/types/project.types';

export const projectApi = {
  /**
   * Get list of projects with filters and pagination
   */
  getProjects: async (filters?: ProjectFilters): Promise<ProjectListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) {
      if (Array.isArray(filters.category)) {
        filters.category.forEach(cat => params.append('category', cat));
      } else {
        params.append('category', filters.category);
      }
    }
    if (filters?.difficulty) {
      if (Array.isArray(filters.difficulty)) {
        filters.difficulty.forEach(diff => params.append('difficulty', diff));
      } else {
        params.append('difficulty', filters.difficulty);
      }
    }
    if (filters?.projectType) params.append('projectType', filters.projectType);
    if (filters?.tags) {
      if (Array.isArray(filters.tags)) {
        filters.tags.forEach(tag => params.append('tags', tag));
      } else {
        params.append('tags', filters.tags);
      }
    }
    if (filters?.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
    if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
    if (filters?.isAIGenerated !== undefined) params.append('isAIGenerated', filters.isAIGenerated.toString());
    if (filters?.preBuiltAvailable !== undefined) params.append('preBuiltAvailable', filters.preBuiltAvailable.toString());
    if (filters?.minCost !== undefined) params.append('minCost', filters.minCost.toString());
    if (filters?.maxCost !== undefined) params.append('maxCost', filters.maxCost.toString());
    if (filters?.minBuildTime !== undefined) params.append('minBuildTime', filters.minBuildTime.toString());
    if (filters?.maxBuildTime !== undefined) params.append('maxBuildTime', filters.maxBuildTime.toString());
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/api/projects?${params.toString()}`);
    
    // Backend returns: { success: true, data: { projects: [...], pagination: {...} } }
    const result = response.data.data;
    return {
      projects: result.projects,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages,
    };
  },

  /**
   * Get single project by ID
   */
  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data.data;
  },

  /**
   * Get project by slug
   */
  getProjectBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get(`/api/projects/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Get all categories with project counts
   */
  getCategories: async (): Promise<CategoryWithCount[]> => {
    const response = await api.get('/api/projects/categories');
    return response.data.data;
  },

  /**
   * Get featured projects by category
   */
  getFeaturedByCategory: async (category: string): Promise<Project[]> => {
    const response = await api.get(`/api/projects/categories/${category}/featured`);
    return response.data.data;
  },
};

export async function getProjectMetadataById(id: string): Promise<Project> {
  return projectApi.getProjectById(id);
}

export async function getProjectMetadataBySlug(slug: string): Promise<Project> {
  return projectApi.getProjectBySlug(slug);
}

