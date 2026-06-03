import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import type {
  ChefSummary,
  ChefDetail,
  ChefListResponse,
  MenuDTO,
  ReviewDTO,
} from "../types.js";

export const chefsRouter = Router();

const listQuerySchema = z.object({
  cuisine: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  sort: z.enum(["rating", "price"]).default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(6),
});

function parseCuisines(csv: string): string[] {
  return csv
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

chefsRouter.get("/", async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    const { cuisine, location, sort, page, pageSize } = parsed.data;

    const where: Record<string, unknown> = { active: true };
    if (cuisine) {
      where.cuisines = { contains: cuisine };
    }
    if (location) {
      where.location = location;
    }

    const orderBy =
      sort === "price"
        ? { pricePerHeadPence: "asc" as const }
        : { id: "asc" as const };

    const total = await prisma.chef.count({ where });

    const skip = page * pageSize;
    const take = pageSize;

    const chefs = await prisma.chef.findMany({ where, orderBy, skip, take });

    const data: ChefSummary[] = [];
    for (const chef of chefs) {
      const reviews = await prisma.review.findMany({
        where: { chefId: chef.id },
      });
      const menus = await prisma.menu.findMany({ where: { chefId: chef.id } });

      const menuPrices = menus.map((m) => m.pricePerHeadPence);
      const fromPricePerHeadPence = Math.min(
        chef.pricePerHeadPence,
        ...menuPrices
      );

      data.push({
        id: chef.id,
        name: chef.name,
        cuisines: parseCuisines(chef.cuisines),
        location: chef.location,
        fromPricePerHeadPence,
        minSpendPence: chef.minSpendPence,
        imageUrl: chef.imageUrl,
        avgRating: averageRating(reviews.map((r) => r.rating)),
        reviewCount: reviews.length,
      });
    }

    if (sort === "rating") {
      data.sort((a, b) => b.avgRating - a.avgRating);
    }

    const response: ChefListResponse = {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

chefsRouter.get("/:id", async (req, res, next) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid chef id" });
    }
    const { id } = parsed.data;

    const chef = await prisma.chef.findUnique({
      where: { id },
      include: {
        menus: true,
        reviews: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!chef) {
      return res.status(404).json({ error: "Chef not found" });
    }

    const menus: MenuDTO[] = chef.menus.map((m) => ({
      id: m.id,
      chefId: m.chefId,
      name: m.name,
      description: m.description,
      serviceStyle: m.serviceStyle,
      pricePerHeadPence: m.pricePerHeadPence,
    }));

    const reviews: ReviewDTO[] = chef.reviews.map((r) => ({
      id: r.id,
      chefId: r.chefId,
      rating: r.rating,
      comment: r.comment,
      authorName: r.authorName,
      createdAt: r.createdAt.toISOString(),
    }));

    const fromPricePerHeadPence = Math.min(
      chef.pricePerHeadPence,
      ...menus.map((m) => m.pricePerHeadPence)
    );

    const detail: ChefDetail = {
      id: chef.id,
      name: chef.name,
      bio: chef.bio,
      cuisines: parseCuisines(chef.cuisines),
      location: chef.location,
      pricePerHeadPence: chef.pricePerHeadPence,
      fromPricePerHeadPence,
      minSpendPence: chef.minSpendPence,
      imageUrl: chef.imageUrl,
      active: chef.active,
      menus,
      reviews,
      avgRating: averageRating(reviews.map((r) => r.rating)),
      reviewCount: reviews.length,
    };

    res.json(detail);
  } catch (err) {
    next(err);
  }
});
