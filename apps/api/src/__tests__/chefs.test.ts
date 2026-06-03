import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

/**
 * These tests run against the seeded database, so `npm run setup` must be run
 * before `npm run test`. The seed inserts 18 active chefs.
 *
 * We assert on the response *shape* and pagination metadata rather than which
 * specific chefs land on a given page, so the tests remain stable.
 */
describe("GET /api/chefs", () => {
  it("returns a paginated list with the default page size", async () => {
    const res = await request(app).get("/api/chefs");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      page: 1,
      pageSize: 6,
    });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBe(18);
    expect(res.body.totalPages).toBe(3);
  });

  it("returns chef summaries with the expected fields", async () => {
    const res = await request(app).get("/api/chefs");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    const chef = res.body.data[0];
    expect(chef).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      location: expect.any(String),
      fromPricePerHeadPence: expect.any(Number),
      minSpendPence: expect.any(Number),
      imageUrl: expect.any(String),
      avgRating: expect.any(Number),
      reviewCount: expect.any(Number),
    });
    expect(Array.isArray(chef.cuisines)).toBe(true);
  });

  it("filters by location", async () => {
    const res = await request(app).get("/api/chefs").query({ location: "Manchester" });

    expect(res.status).toBe(200);
    for (const chef of res.body.data) {
      expect(chef.location).toBe("Manchester");
    }
    expect(res.body.total).toBeLessThan(18);
  });

  it("includes the first chefs on page 1 and returns a non-empty last page", async () => {
    const first = await request(app).get("/api/chefs").query({ page: 1, pageSize: 6 });
    expect(first.status).toBe(200);
    const ids = first.body.data.map((c: { id: number }) => c.id);
    // `page` is 1-indexed: page 1 must start at the very first chef (id 1), not skip past it.
    expect(ids).toContain(1);

    // 18 chefs at pageSize 6 ⇒ 3 pages; the last page must not come back empty.
    const last = await request(app).get("/api/chefs").query({ page: 3, pageSize: 6 });
    expect(last.status).toBe(200);
    expect(last.body.data.length).toBeGreaterThan(0);
  });
});

describe("GET /api/chefs/:id", () => {
  it("returns full chef detail with menus and reviews newest-first", async () => {
    const res = await request(app).get("/api/chefs/1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: expect.any(String),
      bio: expect.any(String),
      avgRating: expect.any(Number),
      reviewCount: expect.any(Number),
    });
    expect(Array.isArray(res.body.menus)).toBe(true);
    expect(Array.isArray(res.body.reviews)).toBe(true);

    const dates = res.body.reviews.map((r: { createdAt: string }) =>
      new Date(r.createdAt).getTime()
    );
    const sortedDesc = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sortedDesc);
  });

  it("returns 404 for an unknown chef", async () => {
    const res = await request(app).get("/api/chefs/99999");
    expect(res.status).toBe(404);
  });
});
