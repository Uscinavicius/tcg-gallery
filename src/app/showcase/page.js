"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ShowcasePage() {
  const [filter, setFilter] = useState("all");
  const [viewType, setViewType] = useState("card"); // "card" or "list"
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

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "64px" }}>
      <div className="flex-1 flex flex-col max-w-[2400px] mx-auto w-full">
        <main className="flex flex-col gap-6 items-center p-3 sm:p-6 w-full">
          <div className="w-full max-w-[2000px] mx-auto px-4 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-8 flex-wrap">
              <h1 className="text-4xl font-bold">Collection Showcase</h1>
              <div className="flex items-center gap-1.5 text-gray-400 border-l border-gray-700 pl-8">
                <span className="text-sm font-medium">Progress:</span>
                <span className="text-base text-green-600 tabular-nums">
                  {cardsOwned} / {totalPossibleCards}
                </span>
                <span className="text-xs">
                  ({((cardsOwned / totalPossibleCards) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border rounded-md bg-inherit"
              >
                <option value="all" className="bg-black">
                  All Cards
                </option>
                <option value="owned" className="bg-black">
                  Owned Cards
                </option>
                <option value="needed" className="bg-black">
                  Needed Cards
                </option>
              </select>
              <button
                onClick={() =>
                  setViewType(viewType === "card" ? "list" : "card")
                }
                className="px-4 py-2 border rounded-md hover:bg-gray-800 transition-colors"
              >
                {viewType === "card" ? "List View" : "Card View"}
              </button>
            </div>
          </div>
          <div className="w-full text-sm text-gray-500 max-w-[2000px] mx-auto px-4">
            Showing {filteredCards.length}{" "}
            {filteredCards.length === 1 ? "card" : "cards"}
          </div>

          {viewType === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 w-full max-w-[2000px] mx-auto px-4 place-items-center">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="flex justify-center w-full sm:h-[500px] h-fit"
                >
                  <div
                    className={`flex flex-col border-2 rounded-lg p-4 w-full max-w-[280px] h-full relative bg-black/20 hover:bg-black/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                      card.reverseHoloAvg1 > 0
                        ? card.hasNormal && card.hasHolo
                          ? "border-green-500"
                          : card.hasNormal || card.hasHolo
                          ? "border-blue-500"
                          : "border-gray-200"
                        : card.hasNormal
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="text-sm font-bold text-gray-500 mb-2">
                        #{card.number}
                      </div>
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={220}
                        height={280}
                        className="mx-auto rounded-md"
                      />
                      <h2 className="text-lg font-bold mt-2 truncate">
                        {card.name}
                      </h2>
                      <div className="text-sm text-gray-400 mt-1">
                        {card.rarity}
                      </div>
                      <div className="flex flex-col gap-1.5 mt-auto pt-3">
                        <p className="text-sm">
                          {card.hasNormal && (
                            <span className="text-green-600">
                              ✓ Have Normal
                            </span>
                          )}
                          {!card.hasNormal && (
                            <span className="text-red-600">
                              ✗ Missing Normal
                            </span>
                          )}
                        </p>
                        {card.reverseHoloAvg1 > 0 && (
                          <p className="text-sm">
                            {card.hasHolo && (
                              <span className="text-green-600">
                                ✓ Have Holo
                              </span>
                            )}
                            {!card.hasHolo && (
                              <span className="text-red-600">
                                ✗ Missing Holo
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-[2000px] mx-auto px-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Number</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Normal</th>
                    <th className="text-left py-3 px-4">Holo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-b border-gray-800 hover:bg-black/20"
                    >
                      <td className="py-3 px-4">#{card.number}</td>
                      <td className="py-3 px-4">{card.name}</td>
                      <td className="py-3 px-4">
                        {card.hasNormal ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {card.reverseHoloAvg1 > 0 ? (
                          card.hasHolo ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
