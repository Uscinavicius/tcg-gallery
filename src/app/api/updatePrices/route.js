import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import pokemon from "@/lib/pokemonTcg";

export async function POST() {
  try {
    console.log("Starting bulk price update...");

    const dbCards = await prisma.card.findMany();
    const tcgCards = await pokemon.card.where({ q: "set.id:sv7" });

    if (!tcgCards.data?.length) {
      throw new Error("No cards found in the set");
    }

    console.log(`Found ${tcgCards.data.length} cards in the set`);

    const tcgCardMap = new Map(
      tcgCards.data.map((card) => [card.number, card])
    );

    const updates = dbCards.map(async (card) => {
      const tcgCard = tcgCardMap.get(card.number);
      const prices = tcgCard?.tcgplayer?.prices;

      if (!prices) {
        console.log(`No price data available for card #${card.number}`);
        return null;
      }

      // Collect all available variants with their prices
      const variants = [];

      if (prices.normal?.market || prices.normal?.mid) {
        variants.push({
          type: "normal",
          price: prices.normal.market || prices.normal.mid,
        });
      }

      if (prices.holofoil?.market || prices.holofoil?.mid) {
        variants.push({
          type: "holofoil",
          price: prices.holofoil.market || prices.holofoil.mid,
        });
      }

      if (prices.reverseHolofoil?.market || prices.reverseHolofoil?.mid) {
        variants.push({
          type: "reverseHolofoil",
          price: prices.reverseHolofoil.market || prices.reverseHolofoil.mid,
        });
      }

      // Sort variants by price
      variants.sort((a, b) => a.price - b.price);

      return prisma.card.update({
        where: { id: card.id },
        data: {
          price1: variants[0]?.price || 0,
          variant1: variants[0]?.type || "normal",
          price2: variants[1]?.price || 0,
          variant2: variants[1]?.type || null,
          lastPriceUpdate: new Date(),
        },
      });
    });

    const results = await Promise.all(updates);
    const successfulUpdates = results.filter(Boolean);

    console.log(`Successfully updated ${successfulUpdates.length} cards`);

    return NextResponse.json({
      message: `Updated ${successfulUpdates.length} cards`,
      updatedCards: successfulUpdates,
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { error: `Failed to update prices: ${error.message}` },
      { status: 500 }
    );
  }
}
