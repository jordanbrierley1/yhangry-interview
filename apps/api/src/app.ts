import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { chefsRouter } from "./routes/chefs.js";
import { quoteRouter } from "./routes/quote.js";
import { bookingsRouter } from "./routes/bookings.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/chefs", chefsRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/bookings", bookingsRouter);

// Centralised error handler — keeps route handlers free of duplicated try/catch responses.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
