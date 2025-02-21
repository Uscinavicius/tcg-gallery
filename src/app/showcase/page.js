"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ShowcasePage() {
  const [filter, setFilter] = useState("all"); // "all", "owned", "needed"
  const { data: cards, error } = useSWR("/api/cards", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (error) return <div>Failed to load</div>;
  if (!cards) return <div>Loading...</div>;

  const filteredCards = cards.filter((card) => {
    if (filter === "owned") {
      return card.hasNormal || (card.reverseHoloAvg1 > 0 && card.hasHolo);
    } else if (filter === "needed") {
      return !card.hasNormal || (card.reverseHoloAvg1 > 0 && !card.hasHolo);
    }
    return true;
  });

  // Calculate collection statistics
  const totalPossibleCards = cards.reduce((total, card) => {
    return total + (card.reverseHoloAvg1 > 0 ? 2 : 1);
  }, 0);

  const cardsOwned = cards.reduce((total, card) => {
    if (card.reverseHoloAvg1 > 0) {
      return total + (card.hasNormal ? 1 : 0) + (card.hasHolo ? 1 : 0);
    }
    return total + (card.hasNormal ? 1 : 0);
  }, 0);

  const collectionValue = cards.reduce((total, card) => {
    let value = 0;
    if (card.hasNormal) value += card.price;
    if (card.hasHolo && card.reverseHoloAvg1 > 0) value += card.reverseHoloAvg1;
    return total + value;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col gap-8 items-center sm:items-start p-8">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-4">Collection Showcase</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-gray-100 p-4 rounded-lg">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">
                Collection Progress
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {cardsOwned} / {totalPossibleCards}
              </p>
              <p className="text-gray-600">
                ({((cardsOwned / totalPossibleCards) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">
                Collection Value
              </h2>
              <p className="text-3xl font-bold text-blue-600">
                ${collectionValue.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">
                Filter Collection
              </h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mt-2 px-4 py-2 border rounded-md"
              >
                <option value="all">All Cards</option>
                <option value="owned">Owned Cards</option>
                <option value="needed">Needed Cards</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col border-2 rounded-md p-4 w-[250px] h-auto ${
                card.reverseHoloAvg1 > 0
                  ? card.hasNormal && card.hasHolo
                    ? "border-green-500"
                    : card.hasNormal || card.hasHolo
                    ? "border-yellow-500"
                    : "border-gray-200"
                  : card.hasNormal
                  ? "border-green-500"
                  : "border-gray-200"
              }`}
            >
              <div>
                <div className="text-sm font-bold text-gray-500 mb-2">
                  #{card.number}
                </div>
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  width={200}
                  height={279}
                  className="mx-auto"
                />
                <h2 className="text-lg font-bold mt-2 truncate">{card.name}</h2>
                <p>
                  <span className="font-bold">Rarity:</span> {card.rarity}
                </p>
                <p>
                  <span className="font-bold">Normal Price:</span> ${card.price}
                </p>
                {card.reverseHoloAvg1 > 0 && (
                  <p>
                    <span className="font-bold">Reverse Holofoil Price:</span> $
                    {card.reverseHoloAvg1}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-auto pt-4">
                <p className="text-sm">
                  {card.hasNormal && (
                    <span className="text-green-600">✓ Have Normal</span>
                  )}
                  {!card.hasNormal && (
                    <span className="text-red-600">✗ Missing Normal</span>
                  )}
                </p>
                {card.reverseHoloAvg1 > 0 && (
                  <p className="text-sm">
                    {card.hasHolo && (
                      <span className="text-green-600">✓ Have Holo</span>
                    )}
                    {!card.hasHolo && (
                      <span className="text-red-600">✗ Missing Holo</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
