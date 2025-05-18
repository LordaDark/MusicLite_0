import { z } from "zod";
import { publicProcedure } from "../../create-context";
import ytdl from "ytdl-core";

// Schema for search input
const searchInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(20),
});

export default publicProcedure
  .input(searchInputSchema)
  .query(async ({ input }) => {
    try {
      // In a real implementation, you would use the YouTube Data API
      // For now, we'll return more realistic mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate more realistic results based on the query
      const artists = [
        "Ed Sheeran", "Taylor Swift", "The Weeknd", "Billie Eilish", 
        "Post Malone", "Ariana Grande", "Drake", "BTS", "Dua Lipa"
      ];
      
      const genres = ["Pop", "Hip-Hop", "R&B", "Rock", "Electronic", "Latin"];
      
      const songTitles = [
        "Shape of You", "Blinding Lights", "Dance Monkey", "Believer",
        "Someone You Loved", "Bad Guy", "Levitating", "Watermelon Sugar",
        "Circles", "Don't Start Now", "Mood", "Memories", "Savage Love",
        "Dynamite", "Positions", "Peaches", "Stay", "Good 4 U", "Industry Baby"
      ];
      
      const results = Array.from({ length: input.limit }, (_, i) => {
        const artist = artists[Math.floor(Math.random() * artists.length)];
        const title = i < 3 
          ? `${input.query} - ${songTitles[i % songTitles.length]}` // First few results match query
          : songTitles[Math.floor(Math.random() * songTitles.length)];
        const genre = genres[Math.floor(Math.random() * genres.length)];
        
        return {
          id: `video-${i}-${Date.now()}`,
          title: title,
          artist: artist,
          album: `${artist} - Greatest Hits`,
          genre: genre,
          thumbnail: `https://picsum.photos/seed/${artist.replace(/\s+/g, '')}/300/300`,
          duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
          viewCount: Math.floor(Math.random() * 10000000),
          audioUrl: `https://musiclite-api.onrender.com/audio/${title.replace(/\s+/g, '_')}.mp3`,
        };
      });
      
      return {
        results,
        query: input.query,
      };
    } catch (error) {
      console.error("Error searching YouTube:", error);
      throw new Error("Failed to search YouTube");
    }
  });