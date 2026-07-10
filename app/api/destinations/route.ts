import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
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

    return NextResponse.json(
      {
        destinations: Array.from(destinations).sort(),
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET /api/destinations failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load destinations",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
