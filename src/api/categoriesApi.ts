import { apiClient } from '../lib/apiClient';

// Types for Categories API
export interface Category {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  success: boolean;
}

export interface CategoryResponse {
  data: Category;
  success: boolean;
}

export interface ApiResponse {
  message?: string;
  success: boolean;
}

/**
 * Categories API Service
 * Provides methods for managing categories
 */
export class CategoriesAPI {
  private static baseUrl = '/api/categories';

  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<CategoriesResponse> {
    const response = await apiClient.get<CategoriesResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string): Promise<CategoryResponse> {
    const response = await apiClient.get<CategoryResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new category
   */
  static async createCategory(category: Partial<Category>): Promise<CategoryResponse> {
    const response = await apiClient.post<CategoryResponse>(this.baseUrl, category);
    return response.data;
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, category: Partial<Category>): Promise<CategoryResponse> {
    const response = await apiClient.put<CategoryResponse>(`${this.baseUrl}/${id}`, category);
    return response.data;
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}
