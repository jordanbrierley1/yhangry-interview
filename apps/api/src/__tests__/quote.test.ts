import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

/**
 * These tests run against the seeded database, so `npm run setup` must be run
 * before `npm run test`. They document the intended pricing behaviour for a
 * quote whose subtotal already meets the chef's minimum spend (no top-up).
 *
 * Chef 1 (seeded): base price 5500p/head, minimum spend 45000p.
 */
describe("POST /api/quote", () => {
  it("returns a 10% service fee and correct total when above minimum spend", async () => {
    const res = await request(app)
      .post("/api/quote")
      .send({ chefId: 1, guestCount: 10 });

    expect(res.status).toBe(200);

    const { subtotalPence, minSpendTopUpPence, serviceFeePence, totalPence } =
      res.body;

    // 5500 * 10 = 55000, which already exceeds the 45000 minimum spend.
    expect(subtotalPence).toBe(55000);
    expect(minSpendTopUpPence).toBe(0);
    expect(serviceFeePence).toBe(Math.round(subtotalPence * 0.1));
    expect(serviceFeePence).toBe(5500);
    expect(totalPence).toBe(subtotalPence + minSpendTopUpPence + serviceFeePence);
    expect(totalPence).toBe(60500);
  });

  it("returns the full quote breakdown shape", async () => {
    const res = await request(app)
      .post("/api/quote")
      .send({ chefId: 1, guestCount: 10 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      chefId: 1,
      guestCount: 10,
      perHeadPence: expect.any(Number),
      subtotalPence: expect.any(Number),
      minSpendPence: expect.any(Number),
      minSpendTopUpPence: expect.any(Number),
      serviceFeePence: expect.any(Number),
      totalPence: expect.any(Number),
    });
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app)
      .post("/api/quote")
      .send({ chefId: 1, guestCount: 0 });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the chef does not exist", async () => {
    const res = await request(app)
      .post("/api/quote")
      .send({ chefId: 99999, guestCount: 4 });

    expect(res.status).toBe(404);
  });

  it("charges only the shortfall as a top-up when the subtotal is below the minimum spend", async () => {
    const res = await request(app)
      .post("/api/quote")
      .send({ chefId: 1, guestCount: 1 });

    expect(res.status).toBe(200);

    const {
      subtotalPence,
      minSpendPence,
      minSpendTopUpPence,
      serviceFeePence,
      totalPence,
    } = res.body;

    // Chef 1: 5500p/head, 45000p minimum spend. One guest = 5500p subtotal — below the minimum.
    expect(subtotalPence).toBe(5500);
    expect(minSpendPence).toBe(45000);
    // The top-up should bring the subtotal UP TO the minimum spend: the shortfall, NOT the whole minimum.
    expect(minSpendTopUpPence).toBe(45000 - 5500); // 39500
    expect(serviceFeePence).toBe(Math.round((subtotalPence + minSpendTopUpPence) * 0.1)); // 4500
    expect(totalPence).toBe(subtotalPence + minSpendTopUpPence + serviceFeePence);
    expect(totalPence).toBe(49500);
  });
});
