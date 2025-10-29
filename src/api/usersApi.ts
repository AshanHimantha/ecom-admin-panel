import { apiClient } from '../lib/apiClient';

// Types for Users API
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  emailVerified: boolean;
  status: 'ENABLED' | 'DISABLED' | 'CONFIRMED' | 'UNCONFIRMED' | 'ARCHIVED' | 'COMPROMISED' | 'UNKNOWN' | 'RESET_REQUIRED' | 'FORCE_CHANGE_PASSWORD';
  createdDate: string;
  lastModifiedDate: string;
  userGroups: string[];
}

export interface UserCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  userGroups?: string[];
}

export interface UsersResponse {
  data: {
    users: User[];
    nextToken: string | null;
  };
  success: boolean;
}

export interface EmployeesResponse {
  data: User[];
  success: boolean;
}

export interface UserResponse {
  data: User;
  success: boolean;
}

export interface ApiResponse {
  message?: string;
  success: boolean;
}

export interface GetUsersParams {
  limit?: number;
  nextToken?: string;
  search?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  status?: string;
  role?: string;
  emailVerified?: boolean;
}

/**
 * Users API Service
 * Provides methods for managing users
 */
export class UsersAPI {
  private static baseUrl = '/api/users';

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`${this.baseUrl}/currentUser`);
    return response.data;
  }

  /**
   * Get all users without any filters
   */
  static async getAllUsers(): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get all employees
   */
  static async getAllEmployees(): Promise<EmployeesResponse> {
    const response = await apiClient.get<EmployeesResponse>(`${this.baseUrl}/employees`);
    return response.data;
  }

  /**
   * Search users with filters
   */
  static async searchUsersWithFilters(params?: GetUsersParams): Promise<UsersResponse> {
    const queryParams: any = {};

    // Add optional parameters only if they have values
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.nextToken) queryParams.nextToken = params.nextToken;
    if (params?.search) queryParams.search = params.search;
    if (params?.email) queryParams.email = params.email;
    if (params?.firstName) queryParams.firstName = params.firstName;
    if (params?.lastName) queryParams.lastName = params.lastName;
    if (params?.username) queryParams.username = params.username;
    if (params?.status) queryParams.status = params.status;
    if (params?.role) queryParams.role = params.role;
    if (params?.emailVerified !== undefined) queryParams.emailVerified = params.emailVerified;

    const response = await apiClient.get<UsersResponse>(`${this.baseUrl}/search`, {
      params: queryParams
    });
    return response.data;
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  static async createUser(user: UserCreateDTO): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(this.baseUrl, user);
    return response.data;
  }

  /**
   * Update user
   */
  static async updateUser(id: string, user: UserUpdateDTO): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`${this.baseUrl}/${id}`, user);
    return response.data;
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Search users
   */
  static async searchUsers(query: string): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
    return response.data;
  }

  /**
   * Suspend user
   */
  static async suspendUser(id: string): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(`${this.baseUrl}/${id}/suspend`);
    return response.data;
  }

  /**
   * Activate user
   */
  static async activateUser(id: string): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(`${this.baseUrl}/${id}/activate`);
    return response.data;
  }

  /**
   * Update user status (enable/disable)
   */
  static async updateUserStatus(id: string, enabled: boolean): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(`${this.baseUrl}/${id}/status`, {
      enabled
    });
    return response.data;
  }
}
