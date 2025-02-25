import pokemon from "pokemontcgsdk";

// Configure the SDK with the API key
if (!pokemon.configured) {
  pokemon.configure({ apiKey: process.env.POKEMON_TCG_API_KEY });
}

export default pokemon;
