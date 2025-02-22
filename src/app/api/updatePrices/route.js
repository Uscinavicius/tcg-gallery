import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Starting bulk price update process...");

    // Fetch all cards from the public API endpoint
    const response = await fetch(
      "https://api.pokemontcg.io/v2/cards?q=set.id:sv7"
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.data?.length || 0} cards from API`);

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid response from Pokemon TCG API");
    }

    // Create a map of card numbers to their prices for faster lookup
    const priceMap = new Map(
      data.data.map((card) => [
        card.number,
        {
          price: card.cardmarket?.prices?.averageSellPrice || 0,
          reverseHoloAvg1: card.cardmarket?.prices?.reverseHoloAvg1 || 0,
        },
      ])
    );

    // Get all cards from database
    const dbCards = await prisma.card.findMany({
      select: { id: true, number: true },
    });

    // Prepare batch updates
    const updates = dbCards
      .map((card) => {
        const prices = priceMap.get(card.number);
        if (!prices) {
          console.log(`No price data found for card ${card.number}`);
          return null;
        }

        return prisma.card.update({
          where: { id: card.id },
          data: {
            price: prices.price,
            reverseHoloAvg1: prices.reverseHoloAvg1,
            lastPriceUpdate: new Date(),
          },
        });
      })
      .filter(Boolean);

    // Execute all updates in a transaction
    console.log(`Executing ${updates.length} updates...`);
    const updatedCards = await prisma.$transaction(updates);

    return NextResponse.json({
      message: "Prices updated successfully",
      updatedCount: updatedCards.length,
      totalCards: dbCards.length,
    });
  } catch (error) {
    console.error("Error in bulk price update:", error);
    return NextResponse.json(
      { error: `Error updating prices: ${error.message}` },
      { status: 500 }
    );
  }
}
