"use client";
import useSWR from "swr";
import Image from "next/image";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function MyCollection() {
  const { data: cards, error } = useSWR("/api/cards", fetcher);

  if (error) return <div>Failed to load</div>;
  if (!cards) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col gap-8 items-center sm:items-start p-8">
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
                  <span className="font-bold">Price:</span> ${card.price}
                </p>
                {card.reverseHoloAvg1 > 0 && (
                  <p>
                    <span className="font-bold">Reverse Holofoil Price:</span> $
                    {card.reverseHoloAvg1}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
