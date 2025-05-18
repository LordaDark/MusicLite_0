import { z } from "zod";
import { publicProcedure } from "../../create-context";
import ytdl from "ytdl-core";

// Schema for download input
const downloadInputSchema = z.object({
  videoId: z.string().min(1),
  quality: z.enum(["high", "medium", "low"]).default("medium"),
});

export default publicProcedure
  .input(downloadInputSchema)
  .mutation(async ({ input, ctx }) => {
    console.log("[DOWNLOAD] Richiesta ricevuta:", input);
    try {
      // Streamma l'audio reale da YouTube usando ytdl-core
      const info = await ytdl.getInfo(input.videoId);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      if (!format || !format.url) throw new Error("Audio non trovato");
      // Restituisci direttamente l'URL audio di YouTube (stream diretto)
      const result = {
        id: input.videoId,
        downloadUrl: format.url,
        fileName: `${info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${input.videoId}.mp3`,
        fileSize: format.contentLength ? parseInt(format.contentLength) : null,
        quality: input.quality,
        success: true,
      };
      console.log("[DOWNLOAD] Risposta inviata:", result);
      return result;
    } catch (error) {
      console.error("[DOWNLOAD] Errore durante il download:", error);
      throw new Error("Failed to download video");
    }
  });