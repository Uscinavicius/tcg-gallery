import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Get all cards from the database
    const cards = await prisma.card.findMany();
    const updatedCards = [];

    // Update each card's prices
    for (const card of cards) {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=number:${card.number} set.id:sv7`
      );
      const data = await response.json();

      if (data.data && data.data[0]) {
        const tcgCard = data.data[0];

        // Update card prices
        const updatedCard = await prisma.card.update({
          where: { id: card.id },
          data: {
            price: tcgCard.cardmarket.prices.averageSellPrice,
            reverseHoloAvg1: tcgCard.cardmarket.prices.reverseHoloAvg1,
            lastPriceUpdate: new Date(), // Update timestamp when prices are updated
          },
        });
        updatedCards.push(updatedCard);
      }
    }

    return NextResponse.json(
      { message: "Prices updated successfully", updatedCards },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { error: `Error updating prices: ${error.message}` },
      { status: 500 }
    );
  }
}
