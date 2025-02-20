import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cards = await prisma.card.findMany();
    return new Response(JSON.stringify(cards), { status: 200 });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return new Response(JSON.stringify({ error: "Error fetching cards" }), {
      status: 500,
    });
  }
}
