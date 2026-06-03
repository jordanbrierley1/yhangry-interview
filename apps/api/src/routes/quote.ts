import { Router } from "express";
import { z } from "zod";
import { buildQuote, NotFoundError } from "../services/quoteService.js";

export const quoteRouter = Router();

const quoteBodySchema = z.object({
  chefId: z.number().int().positive(),
  menuId: z.number().int().positive().optional(),
  guestCount: z.number().int().min(1),
});

quoteRouter.post("/", async (req, res, next) => {
  try {
    const parsed = quoteBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid quote request" });
    }

    const quote = await buildQuote(parsed.data);
    res.json(quote);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});
