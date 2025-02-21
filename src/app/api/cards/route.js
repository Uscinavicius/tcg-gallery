import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: `Error fetching cards: ${error.message}` },
      { status: 500 }
    );
  }
}
