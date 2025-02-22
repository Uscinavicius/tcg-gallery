import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request, context) {
  try {
    const { id } = context.params;
    const { number } = await request.json();

    console.log("Updating single card price:", { id, number });

    // Fetch the card data from Pokemon TCG API
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=number:${number} set.id:sv7`
    );

    if (!response.ok) {
      throw new Error(`Pokemon TCG API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);

    if (!data.data?.[0]?.cardmarket?.prices) {
      throw new Error("No price data available for this card");
    }

    const tcgCard = data.data[0];

    // Update the card in the database
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        price: tcgCard.cardmarket.prices.averageSellPrice || 0,
        reverseHoloAvg1: tcgCard.cardmarket.prices.reverseHoloAvg1 || 0,
        lastPriceUpdate: new Date(),
      },
    });

    console.log("Card updated successfully:", updatedCard);

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card price:", error);
    return NextResponse.json(
      { error: `Failed to update card price: ${error.message}` },
      { status: 500 }
    );
  }
}
