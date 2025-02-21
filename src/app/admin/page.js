"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const [filter, setFilter] = useState("all"); // "all", "owned", "needed"
  const [updating, setUpdating] = useState(false);
  const { data: cards, error, mutate } = useSWR("/api/cards", fetcher);

  const handleCollectionUpdate = async (id, field, value) => {
    try {
      // Optimistically update the UI
      const optimisticData = cards.map((card) => {
        if (card.id === id) {
          return {
            ...card,
            hasNormal: field === "normal" ? value : card.hasNormal,
            hasHolo: field === "holo" ? value : card.hasHolo,
          };
        }
        return card;
      });

      mutate(optimisticData, false);

      const response = await fetch(`/api/updateCard/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hasNormal:
            field === "normal"
              ? value
              : cards.find((c) => c.id === id).hasNormal,
          hasHolo:
            field === "holo" ? value : cards.find((c) => c.id === id).hasHolo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      mutate(); // Refresh data after successful update
    } catch (error) {
      console.error("Error updating card:", error);
      mutate(); // Revert optimistic update
    }
  };

  const updatePrices = async () => {
    try {
      setUpdating(true);
      const response = await fetch("/api/updatePrices", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update prices");
      }

      await mutate(); // Refresh the card data
      alert("Prices updated successfully!");
    } catch (error) {
      console.error("Error updating prices:", error);
      alert("Failed to update prices: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col gap-8 items-center sm:items-start p-8">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Cards</option>
              <option value="owned">Owned Cards</option>
              <option value="needed">Needed Cards</option>
            </select>
            <button
              onClick={updatePrices}
              disabled={updating}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                updating ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              {updating ? "Updating Prices..." : "Update Prices"}
            </button>
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={card.hasNormal || false}
                    onChange={(e) =>
                      handleCollectionUpdate(
                        card.id,
                        "normal",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span>Have Normal</span>
                </label>
                {card.reverseHoloAvg1 > 0 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={card.hasHolo || false}
                      onChange={(e) =>
                        handleCollectionUpdate(
                          card.id,
                          "holo",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4"
                    />
                    <span>Have Holo</span>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
