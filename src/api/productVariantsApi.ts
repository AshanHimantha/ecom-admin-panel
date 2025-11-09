import { apiClient } from '../lib/apiClient';

// Types for Product Variants API
export interface ProductVariant {
  id: number;
  productId: number;
  productName: string;
  color: string;
  size: string;
  unitCost: number;
  sellingPrice: number;
  quantity: number;
  sku: string;
  isActive: boolean;
  variantName: string;
  createdAt: string;
  updatedAt: string;
}

export interface VariantsData {
  content: ProductVariant[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface VariantsResponse {
  success: boolean;
  data: VariantsData | ProductVariant[];
}

export interface VariantResponse {
  success: boolean;
  data: ProductVariant;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface CreateVariantPayload {
  color: string;
  size: string;
  unitCost: number;
  sellingPrice: number;
  quantity: number;
  sku: string;
  isActive?: boolean;
}

export interface UpdateVariantPayload {
  color?: string;
  size?: string;
  unitCost?: number;
  sellingPrice?: number;
  quantity?: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateVariantStatusPayload {
  isActive: boolean;
}

export interface UpdateVariantPricingPayload {
  unitCost?: number;
  sellingPrice?: number;
}

/**
 * Product Variants API Service
 * Provides methods for managing product variants
 */
export class ProductVariantsAPI {
  private static baseUrl = '/api/product-variants';

  /**
   * Get all variants for a specific product
   * @param productId - The ID of the product
   */
  static async getVariantsByProductId(productId: number): Promise<VariantsResponse> {
    const response = await apiClient.get<VariantsResponse>(
      `${this.baseUrl}/product/${productId}`
    );
    return response.data;
  }

  /**
   * Get a specific variant by ID
   * @param variantId - The ID of the variant
   */
  static async getVariantById(variantId: number): Promise<VariantResponse> {
    const response = await apiClient.get<VariantResponse>(
      `${this.baseUrl}/${variantId}`
    );
    return response.data;
  }

  /**
   * Create a new variant for a product
   * @param productId - The ID of the product
   * @param payload - The variant data
   */
  static async createVariant(
    productId: number,
    payload: CreateVariantPayload
  ): Promise<VariantResponse> {
    const response = await apiClient.post<VariantResponse>(
      `${this.baseUrl}/product/${productId}`,
      payload
    );
    return response.data;
  }

  /**
   * Update variant details
   * @param variantId - The ID of the variant
   * @param payload - The updated variant data
   */
  static async updateVariant(
    variantId: number,
    payload: UpdateVariantPayload
  ): Promise<VariantResponse> {
    const response = await apiClient.patch<VariantResponse>(
      `${this.baseUrl}/${variantId}`,
      payload
    );
    return response.data;
  }

  /**
   * Update only the variant status
   * @param variantId - The ID of the variant
   * @param payload - The status update data
   */
  static async updateVariantStatus(
    variantId: number,
    payload: UpdateVariantStatusPayload
  ): Promise<VariantResponse> {
    const response = await apiClient.patch<VariantResponse>(
      `${this.baseUrl}/${variantId}/status`,
      payload
    );
    return response.data;
  }

  /**
   * Update only the variant pricing
   * @param variantId - The ID of the variant
   * @param payload - The pricing update data
   */
  static async updateVariantPricing(
    variantId: number,
    payload: UpdateVariantPricingPayload
  ): Promise<VariantResponse> {
    const response = await apiClient.patch<VariantResponse>(
      `${this.baseUrl}/${variantId}/pricing`,
      payload
    );
    return response.data;
  }

  /**
   * Delete a variant
   * @param variantId - The ID of the variant
   */
  static async deleteVariant(variantId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.baseUrl}/${variantId}`
    );
    return response.data;
  }
}
