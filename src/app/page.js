"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

function LoadingSkeleton({ viewType = "card" }) {
  if (viewType === "card") {
    return (
      <>
        <div className="w-full animate-pulse flex justify-between items-center flex-wrap gap-4 max-w-[2000px] mx-auto px-4">
          <div className="flex items-center gap-8 flex-wrap">
            <div className="h-12 w-64 bg-gray-800/80 rounded"></div>
            <div className="h-8 w-72 bg-gray-800/80 rounded flex items-center gap-2 pl-8 border-l border-gray-700">
              <div className="w-20 h-5 bg-gray-700/80 rounded"></div>
              <div className="w-24 h-6 bg-gray-700/80 rounded"></div>
              <div className="w-16 h-4 bg-gray-700/80 rounded"></div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-36 bg-gray-800/80 rounded"></div>
            <div className="h-10 w-36 bg-gray-800/80 rounded"></div>
          </div>
        </div>

        <div className="w-full text-sm text-gray-500 max-w-[2000px] mx-auto px-4">
          <div className="h-5 w-32 bg-gray-800/80 rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 w-full max-w-[2000px] mx-auto px-4 place-items-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex justify-center w-full sm:h-[500px] h-fit"
            >
              <div className="flex flex-col border-2 border-gray-800/80 rounded-lg p-4 w-full max-w-[280px] h-full relative bg-black/20 animate-pulse">
                <div className="h-4 w-16 bg-gray-800/80 rounded mb-4"></div>
                <div className="w-full h-[280px] bg-gray-800/80 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-gray-800/80 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-800/80 rounded mb-4"></div>
                <div className="mt-auto space-y-2">
                  <div className="h-5 w-32 bg-gray-800/80 rounded"></div>
                  <div className="h-5 w-32 bg-gray-800/80 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full animate-pulse flex justify-between items-center flex-wrap gap-4 max-w-[2000px] mx-auto px-4">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="h-12 w-64 bg-gray-800/80 rounded"></div>
          <div className="h-8 w-72 bg-gray-800/80 rounded flex items-center gap-2 pl-8 border-l border-gray-700">
            <div className="w-20 h-5 bg-gray-700/80 rounded"></div>
            <div className="w-24 h-6 bg-gray-700/80 rounded"></div>
            <div className="w-16 h-4 bg-gray-700/80 rounded"></div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-36 bg-gray-800/80 rounded"></div>
          <div className="h-10 w-36 bg-gray-800/80 rounded"></div>
        </div>
      </div>

      <div className="w-full text-sm text-gray-500 max-w-[2000px] mx-auto px-4">
        <div className="h-5 w-32 bg-gray-800/80 rounded"></div>
      </div>

      <div className="w-full max-w-[2000px] mx-auto px-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 w-24">
                <div className="h-6 bg-gray-800/80 rounded"></div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="h-6 bg-gray-800/80 rounded w-32"></div>
              </th>
              <th className="text-left py-3 px-4 w-24">
                <div className="h-6 bg-gray-800/80 rounded"></div>
              </th>
              <th className="text-left py-3 px-4 w-24">
                <div className="h-6 bg-gray-800/80 rounded"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-3 px-4">
                  <div className="h-5 bg-gray-800/80 rounded w-12"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-5 bg-gray-800/80 rounded w-48"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-5 bg-gray-800/80 rounded w-6"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-5 bg-gray-800/80 rounded w-6"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [viewType, setViewType] = useState("card");
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: cards, error } = useSWR("/api/cards", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.status === 200) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  }, []);

  if (error) return <div>Failed to load</div>;
  if (!cards) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col max-w-[2400px] mx-auto w-full">
          <main className="flex flex-col gap-6 items-center p-3 sm:p-6 w-full">
            <LoadingSkeleton viewType={viewType} />
          </main>
        </div>
      </div>
    );
  }

  const filteredCards = cards.filter((card) => {
    if (filter === "owned") {
      const hasVariant1 =
        card.variant1 === "normal"
          ? card.hasNormal
          : card.variant1 === "holofoil"
          ? card.hasHolofoil
          : card.variant1 === "reverseHolofoil"
          ? card.hasReverseHolofoil
          : false;

      const hasVariant2 = card.variant2
        ? card.variant2 === "normal"
          ? card.hasNormal
          : card.variant2 === "holofoil"
          ? card.hasHolofoil
          : card.variant2 === "reverseHolofoil"
          ? card.hasReverseHolofoil
          : false
        : false;

      return hasVariant1 || hasVariant2;
    } else if (filter === "needed") {
      const needsVariant1 =
        card.variant1 === "normal"
          ? !card.hasNormal
          : card.variant1 === "holofoil"
          ? !card.hasHolofoil
          : card.variant1 === "reverseHolofoil"
          ? !card.hasReverseHolofoil
          : false;

      const needsVariant2 = card.variant2
        ? card.variant2 === "normal"
          ? !card.hasNormal
          : card.variant2 === "holofoil"
          ? !card.hasHolofoil
          : card.variant2 === "reverseHolofoil"
          ? !card.hasReverseHolofoil
          : false
        : false;

      return needsVariant1 || needsVariant2;
    }
    return true;
  });

  const totalPossibleCards = cards.reduce((total, card) => {
    return total + (card.variant2 ? 2 : 1);
  }, 0);

  const cardsOwned = cards.reduce((total, card) => {
    let count = 0;
    if (card.variant1 === "normal" && card.hasNormal) count++;
    if (card.variant1 === "holofoil" && card.hasHolofoil) count++;
    if (card.variant1 === "reverseHolofoil" && card.hasReverseHolofoil) count++;

    if (card.variant2) {
      if (card.variant2 === "normal" && card.hasNormal) count++;
      if (card.variant2 === "holofoil" && card.hasHolofoil) count++;
      if (card.variant2 === "reverseHolofoil" && card.hasReverseHolofoil)
        count++;
    }
    return total + count;
  }, 0);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ paddingTop: isAdmin ? "64px" : "0" }}
    >
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
                      card.variant2
                        ? ((card.variant1 === "normal" && card.hasNormal) ||
                            (card.variant1 === "holofoil" &&
                              card.hasHolofoil) ||
                            (card.variant1 === "reverseHolofoil" &&
                              card.hasReverseHolofoil)) &&
                          ((card.variant2 === "normal" && card.hasNormal) ||
                            (card.variant2 === "holofoil" &&
                              card.hasHolofoil) ||
                            (card.variant2 === "reverseHolofoil" &&
                              card.hasReverseHolofoil))
                          ? "border-green-500"
                          : (card.variant1 === "normal" && card.hasNormal) ||
                            (card.variant1 === "holofoil" &&
                              card.hasHolofoil) ||
                            (card.variant1 === "reverseHolofoil" &&
                              card.hasReverseHolofoil) ||
                            (card.variant2 === "normal" && card.hasNormal) ||
                            (card.variant2 === "holofoil" &&
                              card.hasHolofoil) ||
                            (card.variant2 === "reverseHolofoil" &&
                              card.hasReverseHolofoil)
                          ? "border-blue-500"
                          : "border-gray-200"
                        : (card.variant1 === "normal" && card.hasNormal) ||
                          (card.variant1 === "holofoil" && card.hasHolofoil) ||
                          (card.variant1 === "reverseHolofoil" &&
                            card.hasReverseHolofoil)
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
                          {card.variant1 === "normal" ? (
                            card.hasNormal ? (
                              <span className="text-green-600">
                                ✓ Have Normal
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ Missing Normal
                              </span>
                            )
                          ) : card.variant1 === "holofoil" ? (
                            card.hasHolofoil ? (
                              <span className="text-green-600">
                                ✓ Have Holofoil
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ Missing Holofoil
                              </span>
                            )
                          ) : card.hasReverseHolofoil ? (
                            <span className="text-green-600">
                              ✓ Have Reverse Holofoil
                            </span>
                          ) : (
                            <span className="text-red-600">
                              ✗ Missing Reverse Holofoil
                            </span>
                          )}
                        </p>
                        {card.variant2 && (
                          <p className="text-sm">
                            {card.variant2 === "normal" ? (
                              card.hasNormal ? (
                                <span className="text-green-600">
                                  ✓ Have Normal
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  ✗ Missing Normal
                                </span>
                              )
                            ) : card.variant2 === "holofoil" ? (
                              card.hasHolofoil ? (
                                <span className="text-green-600">
                                  ✓ Have Holofoil
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  ✗ Missing Holofoil
                                </span>
                              )
                            ) : card.hasReverseHolofoil ? (
                              <span className="text-green-600">
                                ✓ Have Reverse Holofoil
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ Missing Reverse Holofoil
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
                    <th className="text-left py-3 px-4">Holofoil</th>
                    <th className="text-left py-3 px-4">Reverse Holofoil</th>
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
                        {card.variant1 === "normal" ||
                        card.variant2 === "normal" ? (
                          card.hasNormal ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {card.variant1 === "holofoil" ||
                        card.variant2 === "holofoil" ? (
                          card.hasHolofoil ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {card.variant1 === "reverseHolofoil" ||
                        card.variant2 === "reverseHolofoil" ? (
                          card.hasReverseHolofoil ? (
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
