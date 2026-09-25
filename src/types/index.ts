import type {
  Category,
  Currency,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductImage,
  ProductStatus,
  Role,
  SiteSettings,
} from "@prisma/client";
import type { Permission } from "@/lib/permissions";

export type {
  Category,
  Currency,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductImage,
  ProductStatus,
  Role,
  SiteSettings,
  Permission,
};

export type AuthSessionUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  nameAr: string;
  price: number;
  quantity: number;
  image?: string | null;
  stock: number;
  compareAtPrice?: number | null;
};

export type ProductWithRelations = Product & {
  images: ProductImage[];
  categories: Array<{
    category: Pick<Category, "id" | "nameAr" | "slug">;
  }>;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: string;
  issues?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type WhyUsItem = {
  title: string;
  description: string;
  icon?: string;
};

export type ProductFilters = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "bestselling";
  page?: number;
  pageSize?: number;
};
