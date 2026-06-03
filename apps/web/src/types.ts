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

export interface Menu {
  id: number;
  chefId: number;
  name: string;
  description: string;
  serviceStyle: string;
  pricePerHeadPence: number;
}

export interface Review {
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
  minSpendPence: number;
  imageUrl: string;
  active: boolean;
  avgRating: number;
  reviewCount: number;
  menus: Menu[];
  reviews: Review[];
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

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface BookingChef {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
}

export interface Booking {
  id: number;
  customerId: number;
  chefId: number;
  menuId: number | null;
  eventDate: string;
  guestCount: number;
  status: BookingStatus;
  dietaryNotes: string | null;
  perHeadPence: number;
  subtotalPence: number;
  minSpendTopUpPence: number;
  serviceFeePence: number;
  totalPence: number;
  createdAt: string;
  chef: BookingChef;
}

export interface Customer {
  id: number;
  name: string;
}

export interface ListChefsParams {
  cuisine?: string;
  location?: string;
  sort?: "rating" | "price";
  page?: number;
  pageSize?: number;
}

export interface QuoteInput {
  chefId: number;
  menuId?: number;
  guestCount: number;
}

export interface CreateBookingInput {
  chefId: number;
  menuId?: number;
  eventDate: string;
  guestCount: number;
  dietaryNotes?: string;
}
