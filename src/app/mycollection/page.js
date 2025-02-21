"use client";
import { PrismaClient } from "@prisma/client";
import { useEffect, useState } from "react";
import Image from "next/image";

const prisma = new PrismaClient();

export default function MyCollection() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function fetchCards() {
      const cards = await prisma.card.findMany();
      setCards(cards);
    }
    fetchCards();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">My Pokemon TCG Collection</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {cards.length === 0 ? (
            <p className="text-lg font-bold">No cards in collection</p>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col border border-gray-200 rounded-md w-fit p-4"
              >
                <Image
                  src={card.images.small}
                  alt={card.name}
                  width={200}
                  height={279}
                  className="pb-4"
                />
                <h2 className="text-lg font-bold">{card.name}</h2>
                <p>
                  <span className="font-bold">Rarity:</span> {card.rarity}
                </p>
                <p>
                  <span className="font-bold">Price:</span> $
                  {card.cardmarket.prices.averageSellPrice}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
