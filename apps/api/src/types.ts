/**
 * API DTO types (see §6 / §7 of the build spec).
 * All money values are integer pence.
 */

export interface ChefSummary {
  id: number;
  name: string;
  cuisines: string[];
  location: string;
  fromPricePerHeadPence: number;
  minSpendPence: number;
  imageUrl: string;
  avgRating: number;
  reviewCount: number;
}

export interface MenuDTO {
  id: number;
  chefId: number;
  name: string;
  description: string;
  serviceStyle: string;
  pricePerHeadPence: number;
}

export interface ReviewDTO {
  id: number;
  chefId: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export interface ChefDetail {
  id: number;
  name: string;
  bio: string;
  cuisines: string[];
  location: string;
  pricePerHeadPence: number;
  fromPricePerHeadPence: number;
  minSpendPence: number;
  imageUrl: string;
  active: boolean;
  menus: MenuDTO[];
  reviews: ReviewDTO[];
  avgRating: number;
  reviewCount: number;
}

export interface ChefListResponse {
  data: ChefSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QuoteBreakdown {
  chefId: number;
  menuId?: number;
  guestCount: number;
  perHeadPence: number;
  subtotalPence: number;
  minSpendPence: number;
  minSpendTopUpPence: number;
  serviceFeePence: number;
  totalPence: number;
}

export interface BookingChefSummary {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
}

export interface BookingCustomerSummary {
  id: number;
  name: string;
  email: string;
}

export interface BookingDTO {
  id: number;
  customerId: number;
  chefId: number;
  menuId: number | null;
  eventDate: string;
  guestCount: number;
  status: string;
  dietaryNotes: string | null;
  perHeadPence: number;
  subtotalPence: number;
  minSpendTopUpPence: number;
  serviceFeePence: number;
  totalPence: number;
  createdAt: string;
  chef?: BookingChefSummary;
  customer?: BookingCustomerSummary;
}
