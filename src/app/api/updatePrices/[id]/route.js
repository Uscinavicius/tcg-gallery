import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import pokemon from "@/lib/pokemonTcg";

export async function POST(request, context) {
  try {
    // Get the card ID from the URL params
    const { params } = context;
    const id = await params.id;

    // Get the card number from the request body
    const { number } = await request.json();

    // First get the card to determine its set
    const card = await prisma.card.findUnique({
      where: { id }
    });

    if (!card) {
      throw new Error("Card not found");
    }

    // Get the set information
    const set = await prisma.set.findUnique({
      where: { id: card.setId }
    });

    if (!set?.code) {
      throw new Error("Set code not found");
    }

    console.log(`Updating price for card ${card.name} (#${number}) in set ${set.name}`);

    const cards = await pokemon.card.where({
      q: `number:${number} set.id:${set.code}`
    });

    if (!cards.data?.[0]?.tcgplayer?.prices) {
      throw new Error("No price data available for this card");
    }

    const tcgCard = cards.data[0];
    const prices = tcgCard.tcgplayer.prices;

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

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        price1: variants[0]?.price || 0,
        variant1: variants[0]?.type || "normal",
        price2: variants[1]?.price || 0,
        variant2: variants[1]?.type || null,
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
