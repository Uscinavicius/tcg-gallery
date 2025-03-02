import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import pokemon from "@/lib/pokemonTcg";

export async function POST(request) {
  try {
    console.log("Starting bulk price update...");

    // Get all active sets
    const sets = await prisma.set.findMany({
      where: { isActive: true },
    });

    let totalSuccessfulUpdates = 0;
    const updateResults = [];

    // Update cards for each set
    for (const set of sets) {
      console.log(`Updating prices for set: ${set.name} (${set.code})`);

      // Get all cards for this set
      const dbCards = await prisma.card.findMany({
        where: { setId: set.id },
      });

      if (!dbCards.length) {
        console.log(`No cards found in database for set ${set.name}`);
        continue;
      }

      // Get cards from Pokemon TCG API for this set
      const tcgCards = await pokemon.card.where({ q: `set.id:${set.code}` });

      if (!tcgCards.data?.length) {
        console.log(`No cards found in TCG API for set ${set.name}`);
        continue;
      }

      console.log(`Found ${tcgCards.data.length} cards in set ${set.name}`);

      const tcgCardMap = new Map(
        tcgCards.data.map((card) => [card.number, card])
      );

      const updates = dbCards.map(async (card) => {
        const tcgCard = tcgCardMap.get(card.number);
        const prices = tcgCard?.tcgplayer?.prices;

        if (!prices) {
          console.log(
            `No price data available for card #${card.number} in set ${set.name}`
          );
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
      totalSuccessfulUpdates += successfulUpdates.length;

      updateResults.push({
        set: set.name,
        updatedCards: successfulUpdates.length,
        totalCards: dbCards.length,
      });

      console.log(
        `Updated ${successfulUpdates.length} cards in set ${set.name}`
      );
    }

    console.log(
      `Total cards updated across all sets: ${totalSuccessfulUpdates}`
    );

    return NextResponse.json({
      message: `Updated ${totalSuccessfulUpdates} cards across all sets`,
      results: updateResults,
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { error: `Failed to update prices: ${error.message}` },
      { status: 500 }
    );
  }
}
