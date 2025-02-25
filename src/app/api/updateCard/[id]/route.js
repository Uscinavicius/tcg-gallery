import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, context) {
  try {
    const { id } = context.params;
    const { hasNormal, hasHolofoil, hasReverseHolofoil, packNumber } =
      await request.json();
    console.log("Updating card:", {
      id,
      hasNormal,
      hasHolofoil,
      hasReverseHolofoil,
      packNumber,
    });

    // Validate input
    if (
      typeof hasNormal !== "boolean" ||
      typeof hasHolofoil !== "boolean" ||
      typeof hasReverseHolofoil !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "hasNormal, hasHolofoil, and hasReverseHolofoil must be boolean values",
        },
        { status: 400 }
      );
    }

    if (packNumber !== null && typeof packNumber !== "number") {
      return NextResponse.json(
        { error: "packNumber must be a number or null" },
        { status: 400 }
      );
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        hasNormal,
        hasHolofoil,
        hasReverseHolofoil,
        packNumber,
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
