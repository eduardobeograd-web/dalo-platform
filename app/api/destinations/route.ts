import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    select: {
      country: true,
      region: true,
    },
    orderBy: {
      country: "asc",
    },
  });

  const destinations = new Set<string>();

  products.forEach((product) => {
    if (product.region) {
      destinations.add(product.region);
    }

    if (product.country) {
      destinations.add(product.country);
    }
  });

  return NextResponse.json({
    destinations: Array.from(destinations).sort(),
  });
}
