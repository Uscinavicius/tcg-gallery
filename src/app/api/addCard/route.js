import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, rarity, price, reverseHoloAvg1, imageUrl, number } =
      await req.json();

    // Check if card already exists
    const existingCard = await prisma.card.findFirst({
      where: { number },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "Card already exists" },
        { status: 409 }
      );
    }

    // Create new card
    const newCard = await prisma.card.create({
      data: {
        name,
        number,
        rarity,
        price,
        reverseHoloAvg1,
        imageUrl,
        hasNormal: false,
        hasHolo: false,
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Error adding card:", error);
    return NextResponse.json(
      { error: `Error adding card: ${error.message}` },
      { status: 500 }
    );
  }
}
