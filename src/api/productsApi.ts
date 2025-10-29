import { apiClient } from '../lib/apiClient';

// Types for Products API
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  sku?: string;
}

export interface ProductUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
  sku?: string;
}

export interface ProductsResponse {
  data: Product[];
  success: boolean;
  count: number;
  timestamp: number;
}

export interface ProductResponse {
  data: Product;
  success: boolean;
  timestamp: number;
}

export interface ApiResponse {
  message: string;
  success: boolean;
  timestamp: number;
}

/**
 * Products API Service
 * Provides methods for managing products
 */
export class ProductsAPI {
  private static baseUrl = '/api/products';

  /**
   * Get all products
   */
  static async getAllProducts(): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: number): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new product
   */
  static async createProduct(product: ProductCreateDTO): Promise<ProductResponse> {
    const response = await apiClient.post<ProductResponse>(this.baseUrl, product);
    return response.data;
  }

  /**
   * Update product
   */
  static async updateProduct(id: number, product: ProductUpdateDTO): Promise<ProductResponse> {
    const response = await apiClient.put<ProductResponse>(`${this.baseUrl}/${id}`, product);
    return response.data;
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Search products
   */
  static async searchProducts(query: string): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
    return response.data;
  }
}
