import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request, context) {
  try {
    const { id } = context.params;
    console.log("Deleting card:", id);

    const deletedCard = await prisma.card.delete({
      where: { id },
    });

    return NextResponse.json(deletedCard, { status: 200 });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: `Error deleting card: ${error.message}` },
      { status: 500 }
    );
  }
}
