import type {
  Booking,
  ChefDetail,
  ChefListResponse,
  CreateBookingInput,
  Customer,
  ListChefsParams,
  QuoteBreakdown,
  QuoteInput,
} from "./types";

const BASE_PATH = "/api";
const CUSTOMER_STORAGE_KEY = "yhangry.activeCustomerId";
const DEFAULT_CUSTOMER_ID = 1;

export const CUSTOMERS: Customer[] = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Priya Patel" },
  { id: 4, name: "Tom Williams" },
];

export function getActiveCustomerId(): number {
  const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CUSTOMER_ID;
}

export function setActiveCustomerId(id: number): void {
  localStorage.setItem(CUSTOMER_STORAGE_KEY, String(id));
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-customer-id", String(getActiveCustomerId()));
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_PATH}${path}`, { ...init, headers });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.error === "string") {
        message = body.error;
      } else if (body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // response had no JSON body; fall back to the status message
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listChefs(params: ListChefsParams = {}): Promise<ChefListResponse> {
  const query = buildQuery({
    cuisine: params.cuisine,
    location: params.location,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  });
  return request<ChefListResponse>(`/chefs${query}`);
}

export function getChef(id: number): Promise<ChefDetail> {
  return request<ChefDetail>(`/chefs/${id}`);
}

export function getQuote(input: QuoteInput): Promise<QuoteBreakdown> {
  return request<QuoteBreakdown>("/quote", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listBookings(): Promise<Booking[]> {
  return request<Booking[]>("/bookings");
}

export function getBooking(id: number): Promise<Booking> {
  return request<Booking>(`/bookings/${id}`);
}

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return request<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function cancelBooking(id: number): Promise<Booking> {
  return request<Booking>(`/bookings/${id}/cancel`, { method: "PATCH" });
}
