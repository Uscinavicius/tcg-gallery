import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sets = await prisma.set.findMany({
      orderBy: {
        releaseDate: "desc", // Show newest sets first
      },
    });

    return NextResponse.json(sets);
  } catch (error) {
    console.error("Error fetching sets:", error);
    return NextResponse.json(
      { error: `Error fetching sets: ${error.message}` },
      { status: 500 }
    );
  }
}
