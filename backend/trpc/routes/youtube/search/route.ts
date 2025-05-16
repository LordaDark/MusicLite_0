import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { searchYouTube } from "../../../services/youtube-service";

// Schema for search input
const searchInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(20),
});

export default publicProcedure
  .input(searchInputSchema)
  .query(async ({ input }) => {
    try {
      // Usa il servizio YouTube per cercare video
      const results = await searchYouTube(input.query, input.limit);
      
      return {
        results,
        query: input.query,
      };
    } catch (error) {
      console.error("Error searching YouTube:", error);
      throw new Error("Failed to search YouTube");
    }
  });