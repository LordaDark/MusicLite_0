import { z } from "zod";
import { publicProcedure } from "../../create-context";
import ytdl from "ytdl-core";

// Schema for video ID input
const videoIdSchema = z.object({
  videoId: z.string().min(1),
});

export default publicProcedure
  .input(videoIdSchema)
  .query(async ({ input, ctx }) => {
    try {
      // Recupera info reali dal video YouTube usando ytdl-core
      const info = await ytdl.getInfo(input.videoId);
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      const bestAudio = audioFormats[0];
      if (!bestAudio || !bestAudio.url) throw new Error("Audio non trovato");
      return {
        id: input.videoId,
        title: info.videoDetails.title,
        artist: info.videoDetails.author.name,
        album: info.videoDetails.author.name + " - YouTube",
        thumbnail: info.videoDetails.thumbnails?.[info.videoDetails.thumbnails.length-1]?.url || "",
        duration: parseInt(info.videoDetails.lengthSeconds),
        genre: info.videoDetails.category || "YouTube",
        releaseDate: info.videoDetails.publishDate,
        audioUrl: bestAudio.url,
      };
    } catch (error) {
      console.error("Error getting video info:", error);
      throw new Error("Failed to get video information");
    }
  });