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
      console.log("Updating card:", { id, field, value }); // Debug log

      const card = cards.find((c) => c.id === id);
      const updatedData = {
        hasNormal: field === "normal" ? value : card.hasNormal,
        hasHolo: field === "holo" ? value : card.hasHolo,
      };

      console.log("Request data:", updatedData); // Debug log

      const response = await fetch(`/api/updateCard/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update card");
      }

      // Update the local data immediately
      await mutate();
    } catch (error) {
      console.error("Error updating card:", error);
      // You might want to add error handling UI here
      alert("Failed to update card: " + error.message);
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!cards) return <div>Loading...</div>;

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
