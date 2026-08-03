import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const destinationHeaders = {
  ...corsHeaders,
  "Cache-Control":
    "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
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
        sellPrice: {
          gt: 0,
        },
        validityDays: {
          gt: 0,
        },
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
      const region = product.region?.trim();
      const country = product.country?.trim();

      if (region) {
        destinations.add(region);
      } else if (country) {
        destinations.add(country);
      }
    });

    return NextResponse.json(
      {
        destinations: Array.from(destinations).sort(),
      },
      {
        headers: destinationHeaders,
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
