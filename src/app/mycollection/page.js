"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function MyCollection() {
  const {
    data: cards,
    error,
    mutate,
  } = useSWR("/api/cards", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

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

      // Update the local data immediately
      mutate(optimisticData, false);

      // Send the request to the server
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update card");
      }

      // Revalidate the data
      mutate();
    } catch (error) {
      console.error("Error updating card:", error);
      // Revert the optimistic update on error
      mutate();
      alert("Failed to update card: " + error.message);
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!cards) return <div>Loading...</div>;

  const totalCards = cards.length;
  const cardsOwned = cards.filter(
    (card) => card.hasNormal || card.hasHolo
  ).length;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-between items-center p-4 bg-gray-800 text-white fixed top-0 z-50">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          Home
        </Link>
        <Link
          href="/mycollection"
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          My Collection
        </Link>
      </nav>
      <main className="flex flex-col gap-8 items-center sm:items-start mt-20 p-8">
        <div className="w-full">
          <h1 className="text-4xl font-bold">My Pokemon TCG Collection</h1>
          <p className="text-xl mt-2">
            Collection Progress: {cardsOwned} / {totalCards} cards
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {cards.length === 0 ? (
            <p className="text-lg font-bold">No cards in collection</p>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className={`flex flex-col border border-gray-200 rounded-md w-fit p-4 
                  ${card.hasNormal && card.hasHolo ? "border-green-700" : ""}`}
              >
                <div className="text-sm font-bold text-gray-500 mb-2">
                  #{card.number}
                </div>
                <Image
                  src={card.imageUrl}
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
                  <span className="font-bold">Normal Price:</span> ${card.price}
                </p>
                {card.reverseHoloAvg1 > 0 && (
                  <p>
                    <span className="font-bold">Reverse Holofoil Price:</span> $
                    {card.reverseHoloAvg1}
                  </p>
                )}
                <div className="flex flex-col gap-2 mt-4">
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
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
