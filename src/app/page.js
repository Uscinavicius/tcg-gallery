"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { sv7, carddata } from "../const";

export default function Home() {
  const [cards, setCards] = useState([]);

  // useEffect(() => {
  //   async function fetchCards() {
  //     const response = await fetch(
  //       `https://api.pokemontcg.io/v2/cards?q=set.id:sv7`
  //     );
  //     const data = await response.json();
  //     console.log(data.data);
  //     setCards(data.data);
  //   }
  //   fetchCards();
  // }, []);

  useEffect(() => {
    setCards(carddata.data);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Pokemon TCG Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md"
            >
              <Image
                src={card.images.small}
                alt={card.name}
                width={200}
                height={279}
              />
              <h2 className="text-lg font-bold">{card.name}</h2>
              <p>
                <span className="font-bold">Rarity:</span> {card.rarity}
              </p>
              <p>
                <span className="font-bold">Price:</span> ${card.cardmarket.prices.averageSellPrice}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
