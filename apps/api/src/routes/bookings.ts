import { Router } from "express";
import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { buildQuote, NotFoundError } from "../services/quoteService.js";
import type { BookingDTO } from "../types.js";

export const bookingsRouter = Router();

/**
 * The authenticated customer is simulated by the `x-customer-id` header.
 * Returns the parsed id, or null when the header is missing/invalid.
 */
function getAuthCustomerId(req: Request): number | null {
  const raw = req.header("x-customer-id");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

type BookingWithChef = Awaited<
  ReturnType<typeof prisma.booking.findFirstOrThrow>
> & {
  chef?: { id: number; name: string; location: string; imageUrl: string };
  customer?: { id: number; name: string; email: string };
};

function toBookingDTO(booking: BookingWithChef): BookingDTO {
  return {
    id: booking.id,
    customerId: booking.customerId,
    chefId: booking.chefId,
    menuId: booking.menuId,
    eventDate: booking.eventDate.toISOString(),
    guestCount: booking.guestCount,
    status: booking.status,
    dietaryNotes: booking.dietaryNotes,
    perHeadPence: booking.perHeadPence,
    subtotalPence: booking.subtotalPence,
    minSpendTopUpPence: booking.minSpendTopUpPence,
    serviceFeePence: booking.serviceFeePence,
    totalPence: booking.totalPence,
    createdAt: booking.createdAt.toISOString(),
    chef: booking.chef
      ? {
          id: booking.chef.id,
          name: booking.chef.name,
          location: booking.chef.location,
          imageUrl: booking.chef.imageUrl,
        }
      : undefined,
    customer: booking.customer
      ? {
          id: booking.customer.id,
          name: booking.customer.name,
          email: booking.customer.email,
        }
      : undefined,
  };
}

const createBookingSchema = z.object({
  chefId: z.number().int().positive(),
  menuId: z.number().int().positive().optional(),
  eventDate: z.string().datetime().or(z.string().min(1)),
  guestCount: z.number().int().min(1),
  dietaryNotes: z.string().optional(),
});

const listQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

bookingsRouter.post("/", async (req, res, next) => {
  try {
    const authCustomerId = getAuthCustomerId(req);
    if (authCustomerId === null) {
      return res.status(400).json({ error: "Missing or invalid x-customer-id" });
    }

    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid booking request" });
    }
    const { chefId, menuId, eventDate, guestCount, dietaryNotes } = parsed.data;

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid eventDate" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: authCustomerId },
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    let quote;
    try {
      quote = await buildQuote({ chefId, menuId, guestCount });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      throw err;
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: authCustomerId,
        chefId,
        menuId: menuId ?? null,
        eventDate: parsedDate,
        guestCount,
        status: "confirmed",
        dietaryNotes: dietaryNotes ?? null,
        perHeadPence: quote.perHeadPence,
        subtotalPence: quote.subtotalPence,
        minSpendTopUpPence: quote.minSpendTopUpPence,
        serviceFeePence: quote.serviceFeePence,
        totalPence: quote.totalPence,
      },
      include: {
        chef: {
          select: { id: true, name: true, location: true, imageUrl: true },
        },
      },
    });

    res.status(201).json(toBookingDTO(booking));
  } catch (err) {
    next(err);
  }
});

bookingsRouter.get("/", async (req, res, next) => {
  try {
    const authCustomerId = getAuthCustomerId(req);
    if (authCustomerId === null) {
      return res.status(400).json({ error: "Missing or invalid x-customer-id" });
    }

    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const customerId = parsed.data.customerId ?? authCustomerId;

    const bookings = await prisma.booking.findMany({
      where: { customerId },
      orderBy: { eventDate: "desc" },
      include: {
        chef: {
          select: { id: true, name: true, location: true, imageUrl: true },
        },
      },
    });

    res.json(bookings.map(toBookingDTO));
  } catch (err) {
    next(err);
  }
});

bookingsRouter.get("/:id", async (req, res, next) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid booking id" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsed.data.id },
      include: {
        chef: {
          select: { id: true, name: true, location: true, imageUrl: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(toBookingDTO(booking));
  } catch (err) {
    next(err);
  }
});

bookingsRouter.patch("/:id/cancel", async (req, res, next) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid booking id" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsed.data.id },
    });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const updated = await prisma.booking.update({
      where: { id: parsed.data.id },
      data: { status: "cancelled" },
      include: {
        chef: {
          select: { id: true, name: true, location: true, imageUrl: true },
        },
      },
    });

    res.json(toBookingDTO(updated));
  } catch (err) {
    next(err);
  }
});
