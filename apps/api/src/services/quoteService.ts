import { prisma } from "../db.js";
import type { QuoteBreakdown } from "../types.js";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export interface QuoteInput {
  chefId: number;
  menuId?: number;
  guestCount: number;
}

const SERVICE_FEE_RATE = 0.1;

/**
 * Builds a full price breakdown for a chef (optionally for a specific menu).
 * Money is handled in integer pence throughout.
 *
 * Throws NotFoundError if the chef or referenced menu cannot be found.
 */
export async function buildQuote(input: QuoteInput): Promise<QuoteBreakdown> {
  const { chefId, menuId, guestCount } = input;

  const chef = await prisma.chef.findUnique({ where: { id: chefId } });
  if (!chef) {
    throw new NotFoundError("Chef not found");
  }

  let perHeadPence = chef.pricePerHeadPence;

  if (menuId !== undefined) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu || menu.chefId !== chef.id) {
      throw new NotFoundError("Menu not found");
    }
    perHeadPence = menu.pricePerHeadPence;
  }

  const subtotalPence = perHeadPence * guestCount;
  const minSpendTopUpPence = subtotalPence < chef.minSpendPence ? chef.minSpendPence : 0;
  const serviceFeePence = Math.round(
    (subtotalPence + minSpendTopUpPence) * SERVICE_FEE_RATE
  );
  const totalPence = subtotalPence + minSpendTopUpPence + serviceFeePence;

  return {
    chefId: chef.id,
    menuId,
    guestCount,
    perHeadPence,
    subtotalPence,
    minSpendPence: chef.minSpendPence,
    minSpendTopUpPence,
    serviceFeePence,
    totalPence,
  };
}
