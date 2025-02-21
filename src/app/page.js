"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error } = useSWR(
    `https://api.pokemontcg.io/v2/cards?q=set.id:sv7`,
    fetcher,
    {
      refreshInterval: 0, // Disable automatic revalidation
      revalidateOnFocus: false, // Disable revalidation on focus
      revalidateOnReconnect: false, // Disable revalidation on reconnect
    }
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const cards = data.data;

  const handleAddToCollection = async (card) => {
    const newCard = {
      name: card.name,
      number: card.number,
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

  const handleAddAllToCollection = async () => {
    for (const card of cards) {
      const newCard = {
        name: card.name,
        number: card.number,
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
    }
  };

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
        <h1 className="text-4xl font-bold">Pokemon TCG Gallery</h1>
        <button
          onClick={handleAddAllToCollection}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md mb-4 transition-colors"
        >
          Add All to Collection
        </button>
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
              <p className="text-sm text-gray-600">#{card.number}</p>
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
                <p className="text-red-500">No Reverse Holo</p>
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
