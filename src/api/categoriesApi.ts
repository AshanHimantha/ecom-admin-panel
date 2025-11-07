import { apiClient } from '../lib/apiClient';

// Types for Categories API
export interface CategoryType {
  id: number;
  name: string;
  sizeOptions: string[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  status: string; // "ACTIVE" or "INACTIVE"
  imageUrl?: string;
  categoryType?: CategoryType;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  categoryTypeId?: number;
  image?: File;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  categoryTypeId?: number;
  image?: File;
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
   * Create new category with FormData (supports image upload)
   * Uses multipart/form-data endpoint
   */
  static async createCategory(payload: CreateCategoryPayload): Promise<CategoryResponse> {
    const formData = new FormData();
    formData.append('name', payload.name);
    
    if (payload.description) {
      formData.append('description', payload.description);
    }
    
    if (payload.categoryTypeId) {
      formData.append('categoryTypeId', payload.categoryTypeId.toString());
    }
    
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = await apiClient.post<CategoryResponse>(this.baseUrl, formData);
    return response.data;
  }

  /**
   * Update category with FormData (supports image upload)
   * Uses multipart/form-data endpoint
   */
  static async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<CategoryResponse> {
    const formData = new FormData();
    
    if (payload.name) {
      formData.append('name', payload.name);
    }
    
    if (payload.description !== undefined) {
      formData.append('description', payload.description);
    }
    
    if (payload.categoryTypeId) {
      formData.append('categoryTypeId', payload.categoryTypeId.toString());
    }
    
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = await apiClient.put<CategoryResponse>(`${this.baseUrl}/${id}`, formData);
    return response.data;
  }

  /**
   * Update category status only using PATCH
   * @param id - The category ID
   * @param status - The new status (ACTIVE or INACTIVE)
   */
  static async updateCategoryStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<CategoryResponse> {
    try {
      
      const axiosResponse = await apiClient.patch<CategoryResponse>(`${this.baseUrl}/${id}/status`, { status });
      
      return axiosResponse.data;
    } catch (error) {
     
      throw error;
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}
