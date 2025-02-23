"use client";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState({});
  const [searchText, setSearchText] = useState("");
  const [sidebarCards, setSidebarCards] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentSidebarPage, setCurrentSidebarPage] = useState(1);
  const cardsPerPage = 24; // Increased from 16 to 24 for better use of space
  const { data: cards, error, mutate } = useSWR("/api/cards", fetcher);

  // Load sidebar cards and visibility state from localStorage on initial render
  useEffect(() => {
    const savedCards = localStorage.getItem("sidebarCards");
    const savedVisibility = localStorage.getItem("sidebarVisible");
    if (savedCards) {
      setSidebarCards(JSON.parse(savedCards));
    }
    if (savedVisibility) {
      setSidebarVisible(JSON.parse(savedVisibility));
    }
  }, []);

  // Save sidebar visibility state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarVisible", JSON.stringify(sidebarVisible));
  }, [sidebarVisible]);

  const handleCollectionUpdate = async (id, field, value) => {
    try {
      const optimisticData = cards.map((card) => {
        if (card.id === id) {
          return {
            ...card,
            hasNormal: field === "normal" ? value : card.hasNormal,
            hasHolo: field === "holo" ? value : card.hasHolo,
            packNumber: field === "packNumber" ? value : card.packNumber,
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
          packNumber:
            field === "packNumber"
              ? value
              : cards.find((c) => c.id === id).packNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      mutate();
    } catch (error) {
      console.error("Error updating card:", error);
      mutate();
    }
  };

  const updatePrices = async () => {
    try {
      setUpdating(true);
      console.log("Starting price update request...");

      const response = await fetch("/api/updatePrices", {
        method: "POST",
      });

      const data = await response.json();
      console.log("Price update response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update prices");
      }

      await mutate();
      console.log("Price update successful:", data);
      alert("Prices updated successfully!");
    } catch (error) {
      console.error("Error updating prices:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });
      alert("Failed to update prices: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const updateCardPrice = async (cardId, cardNumber) => {
    try {
      setUpdating((prev) => ({ ...prev, [cardId]: true }));

      const response = await fetch(`/api/updatePrices/${cardId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: cardNumber }),
      });

      const data = await response.json();
      console.log("Price update response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update price");
      }

      await mutate();
      console.log("Price update successful:", data);
    } catch (error) {
      console.error("Error updating price:", {
        message: error.message,
        cardId,
        response: error.response,
      });
      alert(`Failed to update price for card #${cardNumber}: ${error.message}`);
    } finally {
      setUpdating((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  // Add card to sidebar
  const addToSidebar = (card) => {
    if (!sidebarCards.some((c) => c.id === card.id)) {
      const newSidebarCards = [...sidebarCards, card];
      setSidebarCards(newSidebarCards);
      localStorage.setItem("sidebarCards", JSON.stringify(newSidebarCards));
    }
  };

  // Remove card from sidebar
  const removeFromSidebar = (cardId) => {
    const newSidebarCards = sidebarCards.filter((card) => card.id !== cardId);
    setSidebarCards(newSidebarCards);
    localStorage.setItem("sidebarCards", JSON.stringify(newSidebarCards));
  };

  // Clear all cards from sidebar
  const clearSidebar = () => {
    setSidebarCards([]);
    localStorage.removeItem("sidebarCards");
  };

  const isInSidebar = (cardId) => sidebarCards.some((c) => c.id === cardId);

  const toggleSidebar = () => {
    const newVisibility = !sidebarVisible;
    setSidebarVisible(newVisibility);

    // If we're opening the panel and there are no cards, initialize with empty array
    if (newVisibility && !sidebarCards.length) {
      setSidebarCards([]);
      localStorage.setItem("sidebarCards", JSON.stringify([]));
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!cards)
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ paddingTop: "64px" }}
      >
        <div className="flex-1 flex flex-col max-w-[2400px] mx-auto w-full">
          <main className="flex flex-col gap-6 items-center p-3 sm:p-6 w-full">
            <div className="w-full animate-pulse flex justify-between items-center flex-wrap gap-4">
              <div className="h-10 w-48 bg-gray-700 rounded"></div>
              <div className="flex gap-4">
                <div className="h-10 w-32 bg-gray-700 rounded"></div>
                <div className="h-10 w-48 bg-gray-700 rounded"></div>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-gray-800/50 p-4 rounded-lg animate-pulse">
                <div className="text-center space-y-2">
                  <div className="h-6 w-32 bg-gray-700 rounded mx-auto"></div>
                  <div className="h-8 w-24 bg-gray-700 rounded mx-auto"></div>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-6 w-32 bg-gray-700 rounded mx-auto"></div>
                  <div className="h-8 w-24 bg-gray-700 rounded mx-auto"></div>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-6 w-32 bg-gray-700 rounded mx-auto"></div>
                  <div className="h-8 w-24 bg-gray-700 rounded mx-auto"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 w-full place-items-center">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex justify-center w-full h-[520px]">
                  <div className="flex flex-col border-2 border-gray-700 rounded-lg p-4 w-full max-w-[280px] h-full relative bg-black/20 animate-pulse">
                    <div className="w-full h-[251px] bg-gray-700 rounded mb-4"></div>
                    <div className="w-3/4 h-6 bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-gray-700 rounded"></div>
                      <div className="w-full h-4 bg-gray-700 rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="space-y-2 w-full">
                      <div className="w-full h-6 bg-gray-700 rounded"></div>
                      <div className="w-full h-6 bg-gray-700 rounded"></div>
                      <div className="w-full h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );

  const filteredCards = cards.filter((card) => {
    const collectionFiltered =
      filter === "owned"
        ? card.hasNormal || (card.reverseHoloAvg1 > 0 && card.hasHolo)
        : filter === "needed"
        ? !card.hasNormal || (card.reverseHoloAvg1 > 0 && !card.hasHolo)
        : true;

    const searchLower = searchText.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      card.name.toLowerCase().includes(searchLower) ||
      card.number.toLowerCase().includes(searchLower);

    return collectionFiltered && matchesSearch;
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
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "64px" }}>
      <div
        className={`flex-1 flex flex-col ${
          sidebarVisible
            ? "md:pr-[650px] lg:pr-[650px] xl:pr-[650px] 2xl:pr-[650px]"
            : ""
        } max-w-[2400px] mx-auto w-full`}
      >
        <main className="flex flex-col gap-6 items-center p-3 sm:p-6 w-full">
          <div
            className={`w-full max-w-[2000px] ${
              !sidebarVisible ? "mx-auto px-4" : ""
            } flex justify-between items-center flex-wrap gap-4`}
          >
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={toggleSidebar}
                className={`px-4 py-2 rounded-md transition-colors ${
                  sidebarVisible
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                title="Toggle reference panel"
              >
                {sidebarVisible
                  ? "Hide Reference Panel"
                  : "Show Reference Panel"}
              </button>
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="px-4 py-2 border rounded-md bg-inherit min-w-[200px]"
              />
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
            </div>
          </div>

          <div
            className={`w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-gray-800/50 p-4 rounded-lg max-w-[2000px] ${
              !sidebarVisible ? "mx-auto px-4" : ""
            }`}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold">Collection Progress</h2>
              <p className="text-3xl font-bold text-green-500">
                {cardsOwned} / {totalPossibleCards}
              </p>
              <p className="text-gray-400">
                ({((cardsOwned / totalPossibleCards) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Collection Value</h2>
              <p className="text-3xl font-bold text-blue-500">
                ${collectionValue.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Total Cards</h2>
              <p className="text-3xl font-bold text-purple-500">
                {cards.length}
              </p>
            </div>
          </div>

          <div className="w-full text-sm text-gray-500">
            Showing {filteredCards.length}{" "}
            {filteredCards.length === 1 ? "card" : "cards"}
            {searchText && ` matching "${searchText}"`}
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              sidebarVisible
                ? "md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            } gap-4 lg:gap-6 w-full ${
              !sidebarVisible ? "max-w-[2000px] mx-auto px-4" : ""
            } place-items-center`}
          >
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="flex justify-center w-full h-[520px]"
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
                  <button
                    onClick={() =>
                      isInSidebar(card.id)
                        ? removeFromSidebar(card.id)
                        : addToSidebar(card)
                    }
                    className={`absolute -top-2 -right-2 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-md ${
                      isInSidebar(card.id)
                        ? "bg-yellow-500 hover:bg-red-500"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    title={
                      isInSidebar(card.id)
                        ? "Remove from sidebar"
                        : "Add to sidebar"
                    }
                  >
                    {isInSidebar(card.id) ? "★" : "+"}
                  </button>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-gray-400">
                      #{card.number}
                    </div>
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      width={180}
                      height={271}
                      className="mx-auto rounded-md"
                    />
                    <h2 className="text-base font-bold truncate mb-4">
                      {card.name}
                    </h2>
                    <div className="space-y-4 text-sm flex-1 flex flex-col justify-end">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-700/50 pb-2">
                          <span className="text-gray-400">Normal:</span>
                          <div className="flex items-center gap-3">
                            <span className="tabular-nums">${card.price}</span>
                            <label className="flex items-center gap-1.5 min-w-[70px]">
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
                              <span>Have</span>
                            </label>
                          </div>
                        </div>
                        {card.reverseHoloAvg1 > 0 && (
                          <div className="flex items-center justify-between gap-4 border-b border-gray-700/50 pb-2">
                            <span className="text-gray-400">Holo:</span>
                            <div className="flex items-center gap-3">
                              <span className="tabular-nums">
                                ${card.reverseHoloAvg1}
                              </span>
                              <label className="flex items-center gap-1.5 min-w-[70px]">
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
                                <span>Have</span>
                              </label>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 border-gray-700/50">
                          <div className="flex items-center justify-between gap-2 border-b border-gray-700/50 pb-2">
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span className="text-gray-400 whitespace-nowrap">
                                Pack #:
                              </span>
                              <input
                                type="number"
                                value={card.packNumber || ""}
                                onChange={(e) =>
                                  handleCollectionUpdate(
                                    card.id,
                                    "packNumber",
                                    e.target.value
                                      ? parseInt(e.target.value, 10)
                                      : null
                                  )
                                }
                                className="w-14 px-2 py-1 border-b bg-inherit text-center"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              updateCardPrice(card.id, card.number)
                            }
                            disabled={updating[card.id]}
                            className={`w-full px-2 py-1 text-xs bg-blue-500/80 text-white rounded-md whitespace-nowrap ${
                              updating[card.id]
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-600"
                            }`}
                          >
                            {updating[card.id] ? "..." : "Update Price"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <div
        className={`w-[650px] md:w-[650px] lg:w-[650px] xl:w-[650px] 2xl:w-[650px] h-screen bg-gray-900/95 backdrop-blur-md fixed right-0 transition-transform ${
          sidebarVisible ? "translate-x-0" : "translate-x-full"
        } shadow-xl border-l border-gray-800 z-20`}
        style={{ top: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-3 border-b border-gray-800 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Reference Cards
                </h2>
                <p className="text-sm text-gray-400">
                  {sidebarCards.length}{" "}
                  {sidebarCards.length === 1 ? "card" : "cards"} total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sidebarCards.length > 0 && (
                <button
                  onClick={clearSidebar}
                  className="text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-md transition-colors"
                  title="Clear all cards"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Close sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Pagination controls in header */}
          {sidebarCards.length > cardsPerPage && (
            <div className="flex items-center justify-between mt-3 bg-gray-800/50 rounded-lg p-2">
              <button
                onClick={() => setCurrentSidebarPage((p) => Math.max(1, p - 1))}
                disabled={currentSidebarPage === 1}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  currentSidebarPage === 1
                    ? "bg-gray-700/50 text-gray-500"
                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                }`}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentSidebarPage} of{" "}
                {Math.ceil(sidebarCards.length / cardsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentSidebarPage((p) =>
                    Math.min(
                      Math.ceil(sidebarCards.length / cardsPerPage),
                      p + 1
                    )
                  )
                }
                disabled={
                  currentSidebarPage >=
                  Math.ceil(sidebarCards.length / cardsPerPage)
                }
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  currentSidebarPage >=
                  Math.ceil(sidebarCards.length / cardsPerPage)
                    ? "bg-gray-700/50 text-gray-500"
                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Cards container */}
        <div
          className="p-2 sm:p-3 overflow-y-auto"
          style={{ height: "calc(100% - 120px)" }}
        >
          <div className="grid grid-cols-1 [&>*]:max-w-[350px] min-[750px]:grid-cols-2 min-[750px]:[&>*]:max-w-none gap-3 auto-rows-max">
            {sidebarCards
              .slice(
                (currentSidebarPage - 1) * cardsPerPage,
                currentSidebarPage * cardsPerPage
              )
              .map((card, index) => (
                <div
                  key={card.id}
                  className="relative border rounded-lg p-2 bg-gray-800/80 backdrop-blur-sm flex gap-2 min-w-0 overflow-hidden hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "slideIn 0.3s ease-out forwards",
                  }}
                >
                  <button
                    onClick={() => removeFromSidebar(card.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10 shadow-md"
                    title="Remove from sidebar"
                  >
                    ×
                  </button>
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    width={65}
                    height={91}
                    className="rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold truncate flex-1">{card.name}</p>
                      <p className="text-gray-400 flex-shrink-0 text-right">
                        #{card.number}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-x-2">
                        <p className="truncate">
                          <span className="text-gray-400 mr-1">Normal:</span>$
                          {card.price}
                        </p>
                        {card.reverseHoloAvg1 > 0 && (
                          <p className="truncate">
                            <span className="text-gray-400 mr-1">Holo:</span>$
                            {card.reverseHoloAvg1}
                          </p>
                        )}
                      </div>
                      {card.packNumber && (
                        <p className="truncate">
                          <span className="text-gray-400 mr-1">Pack:</span>#
                          {card.packNumber}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {card.hasNormal && (
                          <span className="inline-block text-[10px] leading-none px-1.5 py-1 bg-green-700/30 border border-green-600/50 rounded whitespace-nowrap">
                            Normal
                          </span>
                        )}
                        {card.hasHolo && card.reverseHoloAvg1 > 0 && (
                          <span className="inline-block text-[10px] leading-none px-1.5 py-1 bg-blue-700/30 border border-blue-600/50 rounded whitespace-nowrap">
                            Holo
                          </span>
                        )}
                        <span className="inline-block text-[10px] leading-none px-1.5 py-1 bg-purple-700/30 border border-purple-600/50 rounded whitespace-nowrap">
                          {card.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Backdrop with blur effect */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-10"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

const slideInKeyframes = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Add the keyframes to a style tag
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = slideInKeyframes;
  document.head.appendChild(style);
}
