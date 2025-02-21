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
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col gap-8 items-center sm:items-start p-8">
        <h1 className="text-4xl font-bold">Pokemon TCG Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col border border-gray-200 rounded-md p-4 w-[250px] h-[450px] justify-between"
            >
              <div>
                <Image
                  src={card.images.small}
                  alt={card.name}
                  width={200}
                  height={279}
                  className="mx-auto"
                />
                <h2 className="text-lg font-bold mt-2 truncate">{card.name}</h2>
                <p className="text-sm text-gray-600">#{card.number}</p>
                <p>
                  <span className="font-bold">Rarity:</span> {card.rarity}
                </p>
                <p>
                  <span className="font-bold">Price:</span> $
                  {card.cardmarket.prices.averageSellPrice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
