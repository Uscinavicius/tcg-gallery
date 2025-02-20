import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { name, rarity, price, reverseHoloAvg1, imageUrl } = await req.json();
  try {
    const newCard = await prisma.card.create({
      data: { name, rarity, price, reverseHoloAvg1, imageUrl },
    });
    return new Response(JSON.stringify(newCard), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error adding card" }), {
      status: 500,
    });
  }
}
