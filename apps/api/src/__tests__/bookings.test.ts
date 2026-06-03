import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

/**
 * Authorization tests for the bookings endpoints. These run against the seeded
 * database, so `pnpm bootstrap` must be run first.
 *
 * The "authenticated" customer is the `x-customer-id` header. Seeded ownership:
 *   customer 1 (Alice) owns bookings 1 & 2; customer 2 (Bob) owns booking 3.
 *
 * A customer must only ever see their OWN bookings — identity comes from the
 * authenticated header, never from client-supplied input.
 */
describe("bookings authorization", () => {
  it("lets a customer read their own booking", async () => {
    const res = await request(app).get("/api/bookings/1").set("x-customer-id", "1");

    expect(res.status).toBe(200);
    expect(res.body.customerId).toBe(1);
  });

  it("does NOT let a customer read another customer's booking", async () => {
    // Alice (customer 1) requesting Bob's booking (id 3) must not receive Bob's data.
    const res = await request(app).get("/api/bookings/3").set("x-customer-id", "1");

    expect([403, 404]).toContain(res.status);
  });

  it("scopes the bookings list to the authenticated customer, ignoring ?customerId", async () => {
    // Alice tries to override her identity via the query string — it must be ignored.
    const res = await request(app)
      .get("/api/bookings")
      .query({ customerId: 2 })
      .set("x-customer-id", "1");

    expect(res.status).toBe(200);
    for (const booking of res.body) {
      expect(booking.customerId).toBe(1);
    }
  });
});
