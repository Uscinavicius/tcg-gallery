"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { sv7, carddata } from "../const";

export default function Home() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    setCards(carddata.data);
  }, []);

  const handleAddToCollection = async (card) => {
    const newCard = {
      name: card.name,
      rarity: card.rarity,
      price: card.cardmarket.prices.averageSellPrice,
      reverseHoloAvg1: card.cardmarket.prices.reverseHoloAvg1,
      imageUrl: card.images.small,
    };
    await fetch("/api/addCard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard),
    });
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Pokemon TCG Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {cards.map((card) => (
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
              {card.cardmarket.prices.reverseHoloAvg1 > 0 ? (
                <p>
                  <span className="font-bold">Reverse Holofoil Price:</span> $
                  {card.cardmarket.prices.reverseHoloAvg1}
                </p>
              ) : (
                <p className="text-red-500">No Reverse Holo
                </p>
              )}
              <button
                onClick={() => handleAddToCollection(card)}
                className="bg-blue-500 text-white p-2 rounded-md mt-2"
              >
                Add to Collection
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
