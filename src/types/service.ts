// src/types/service.ts
import { User } from '../core/contexts/AuthContext';

export interface ServiceLocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface ServiceImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  categoryId: string;
  category?: ServiceCategory;
  pricePerHour: number;
  isActive: boolean;
  location: ServiceLocation;
  images: ServiceImage[];
  providerId: number;
  provider?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  pricePerHour: number;
  isActive: boolean;
  location: ServiceLocation;
  images: File[];
}

export interface ServiceResponse {
  success: boolean;
  data?: Service;
  message?: string;
}

export interface ServicesListResponse {
  success: boolean;
  data?: Service[];
  message?: string;
}

export interface CategoryListResponse {
  success: boolean;
  data?: ServiceCategory[];
  message?: string;
}