import { apiClient } from '../lib/apiClient';

// Types for Category Types API
export interface CategoryType {
  id: number;
  name: string;
  sizeOptions: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CategoryTypesResponse {
  data: CategoryType[];
  success: boolean;
}

export interface CategoryTypeResponse {
  data: CategoryType;
  success: boolean;
}

export interface ApiResponse {
  message?: string;
  success: boolean;
}

/**
 * Category Types API Service
 * Provides methods for managing category types
 */
export class CategoryTypesAPI {
  private static baseUrl = '/api/category-types';

  /**
   * Get all category types
   */
  static async getAllCategoryTypes(): Promise<CategoryTypesResponse> {
    const response = await apiClient.get<CategoryTypesResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get category type by ID
   */
  static async getCategoryTypeById(id: string): Promise<CategoryTypeResponse> {
    const response = await apiClient.get<CategoryTypeResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new category type
   */
  static async createCategoryType(categoryType: Partial<CategoryType>): Promise<CategoryTypeResponse> {
    const response = await apiClient.post<CategoryTypeResponse>(this.baseUrl, categoryType);
    return response.data;
  }

  /**
   * Update category type. This method replaces the entire resource.
   */
  static async updateCategoryType(id: string, categoryType: Partial<CategoryType>): Promise<CategoryTypeResponse> {
    try {
      const axiosResponse = await apiClient.put<CategoryTypeResponse>(`${this.baseUrl}/${id}`, categoryType);
      console.log('📥 Raw axios response:', axiosResponse);
      console.log('📦 Response data:', axiosResponse.data);
      return axiosResponse.data;
    } catch (error) {
      console.error('❌ Error in updateCategoryType API method:', error);
      throw error;
    }
  }

  /**
   * Update category type status only using PATCH
   * @param id - The category type ID
   * @param status - The new status (ACTIVE or INACTIVE)
   */
  static async updateCategoryTypeStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<CategoryTypeResponse> {
    try {
      const axiosResponse = await apiClient.patch<CategoryTypeResponse>(`${this.baseUrl}/${id}`, { status });
      console.log('📥 PATCH status response:', axiosResponse);
      return axiosResponse.data;
    } catch (error) {
      console.error('❌ Error in updateCategoryTypeStatus API method:', error);
      throw error;
    }
  }

  /**
   * Delete category type
   */
  static async deleteCategoryType(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}