import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { hasNormal, hasHolo } = body;
    const cardId = params.id;

    console.log("Updating card:", { cardId, hasNormal, hasHolo });

    // Validate input
    if (typeof hasNormal !== "boolean" || typeof hasHolo !== "boolean") {
      return NextResponse.json(
        { error: "hasNormal and hasHolo must be boolean values" },
        { status: 400 }
      );
    }

    const updatedCard = await prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        hasNormal,
        hasHolo,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", {
      message: error.message,
      code: error.code,
      params,
    });

    return NextResponse.json(
      { error: `Error updating card: ${error.message}` },
      { status: 500 }
    );
  }
}
