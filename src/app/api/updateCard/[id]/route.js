import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const { hasNormal, hasHolo } = await request.json();

    console.log("Updating card:", { id, hasNormal, hasHolo });

    // Validate input
    if (typeof hasNormal !== "boolean" || typeof hasHolo !== "boolean") {
      return NextResponse.json(
        { error: "hasNormal and hasHolo must be boolean values" },
        { status: 400 }
      );
    }

    const updatedCard = await prisma.card.update({
      where: {
        id: id,
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
    });

    return NextResponse.json(
      { error: `Error updating card: ${error.message}` },
      { status: 500 }
    );
  }
}
