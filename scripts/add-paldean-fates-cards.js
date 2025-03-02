// This script adds Paldean Fates cards from the Pokémon TCG API to the database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");

async function main() {
  try {
    console.log("Starting to add Paldean Fates cards...");

    // Get cards from Pokémon TCG API for Paldean Fates (sv4pt5)
    const response = await axios.get("https://api.pokemontcg.io/v2/cards", {
      params: {
        q: "set.id:sv4pt5",
        pageSize: 250, // Adjust if needed
      },
      headers: {
        // Optional: Add your API key if you have one
        // 'X-Api-Key': 'your-api-key-here'
      },
    });

    const apiCards = response.data.data;
    console.log(`Found ${apiCards.length} Paldean Fates cards in the API`);

    let addedCount = 0;
    let skippedCount = 0;

    // Process each card from the API
    for (const apiCard of apiCards) {
      // Check if the card already exists in our database
      const existingCard = await prisma.card.findFirst({
        where: {
          number: apiCard.number,
          setId: "paldean_fates",
        },
      });

      if (existingCard) {
        console.log(
          `Card ${apiCard.name} (#${apiCard.number}) already exists. Skipping.`
        );
        skippedCount++;
        continue;
      }

      // Determine if the card has normal/holofoil/reverseHolofoil variants
      // and set appropriate pricing info based on card rarity
      const isHolo =
        apiCard.rarity === "Rare Holo" ||
        apiCard.rarity === "Rare Holo V" ||
        apiCard.rarity === "Rare Holo VMAX" ||
        apiCard.rarity === "Rare Holo ex";

      const hasReverseHolo =
        apiCard.rarity !== "Rare Holo V" &&
        apiCard.rarity !== "Rare Holo VMAX" &&
        apiCard.rarity !== "Rare Holo ex" &&
        apiCard.rarity !== "Rare ACE" &&
        apiCard.rarity !== "Rare BREAK" &&
        apiCard.rarity !== "Ultra Rare" &&
        apiCard.rarity !== "Secret Rare";

      // Set default prices based on rarity (you may want to adjust these)
      let price1 = 0.1;
      let price2 = 0;

      if (apiCard.rarity === "Common") {
        price1 = 0.05;
        price2 = hasReverseHolo ? 0.15 : 0;
      } else if (apiCard.rarity === "Uncommon") {
        price1 = 0.1;
        price2 = hasReverseHolo ? 0.25 : 0;
      } else if (apiCard.rarity === "Rare") {
        price1 = 0.25;
        price2 = hasReverseHolo ? 0.5 : 0;
      } else if (apiCard.rarity === "Rare Holo") {
        price1 = 1.0;
        price2 = hasReverseHolo ? 1.25 : 0;
      } else if (
        apiCard.rarity?.includes("V") ||
        apiCard.rarity?.includes("ex")
      ) {
        price1 = 3.0;
      } else if (apiCard.rarity === "Ultra Rare") {
        price1 = 10.0;
      } else if (apiCard.rarity === "Secret Rare") {
        price1 = 25.0;
      }

      // Set up the card data
      const cardData = {
        name: apiCard.name,
        number: apiCard.number,
        setId: "paldean_fates",
        imageUrl: apiCard.images.small,
        rarity: apiCard.rarity || "Common",
        price1: price1,
        variant1: isHolo ? "holofoil" : "normal",
        price2: price2,
        variant2: hasReverseHolo ? "reverseHolofoil" : null,
        hasNormal: false,
        hasHolofoil: false,
        hasReverseHolofoil: false,
      };

      // Create the new card
      const newCard = await prisma.card.create({
        data: cardData,
      });

      console.log(
        `Added: ${newCard.name} (#${newCard.number}) - ${newCard.rarity}`
      );
      addedCount++;
    }

    console.log(`Finished adding Paldean Fates cards!`);
    console.log(
      `Summary: Added ${addedCount} new cards, Skipped ${skippedCount} existing cards`
    );
  } catch (error) {
    console.error("Error adding cards:", error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
