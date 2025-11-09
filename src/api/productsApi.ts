import { apiClient } from '../lib/apiClient';

// Types for Products API
export interface CategoryType {
  id: number;
  name: string;
  sizeOptions: string[];
  status: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  categoryType?: CategoryType;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sellingPrice: number;
  producerInfo?: string;
  stockCount?: number;
  productType?: string;
  status: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
  imageUrls: string[];
  variants?: any[];
}

export interface ProductsData {
  content: Product[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductsResponse {
  success: boolean;
  data: ProductsData;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface CreateProductPayload {
  name: string;
  categoryId: number;
  sellingPrice: number;
  unitCost: number;
  stockCount: number;
  description: string;
  producerInfo: string;
  imageUrls: string[];
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
    const response = await apiClient.get<ProductsResponse>(this.baseUrl + "/admin");
    return response.data;
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: number): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(`${this.baseUrl}/admin/${id}`);
    return response.data;
  }

  /**
   * Create new product with FormData (supports file upload)
   * Note: Content-Type is automatically set by axios for FormData
   */
  static async createProduct(formData: FormData): Promise<ProductResponse> {
    const response = await apiClient.post<ProductResponse>(this.baseUrl, formData);
    return response.data;
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}
