import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get the setId from the URL query parameter
    const url = new URL(request.url);
    const setId = url.searchParams.get("setId");

    let whereClause = {};

    // If a setId is provided, filter by it
    if (setId) {
      whereClause.setId = setId;
    }

    const cards = await prisma.card.findMany({
      where: whereClause,
      orderBy: {
        number: "asc",
      },
    });

    // Sort cards by number, handling numeric sorting for string numbers
    const sortedCards = cards.sort((a, b) => {
      const numA = parseInt(a.number);
      const numB = parseInt(b.number);
      return numA - numB;
    });

    return NextResponse.json(sortedCards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: `Error fetching cards: ${error.message}` },
      { status: 500 }
    );
  }
}
