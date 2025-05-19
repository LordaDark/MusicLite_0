import { searchYouTube } from "./services/youtube-service";

(async () => {
  try {
    const query = "mamma";
    const limit = 3;
    console.log("[TEST] Avvio ricerca YouTube con query:", query);
    const results = await searchYouTube(query, limit);
    console.log("[TEST] Risultati ottenuti:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("[TEST] Errore durante la ricerca YouTube:", error);
  }
})();