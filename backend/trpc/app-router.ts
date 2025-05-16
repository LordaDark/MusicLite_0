import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import youtubeSearch from "./routes/youtube/search";
import youtubeGetInfo from "./routes/youtube/getInfo";
import youtubeDownload from "./routes/youtube/download";
import metadataExtract from "./routes/metadata/extract";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  youtube: createTRPCRouter({
    search: youtubeSearch,
    getInfo: youtubeGetInfo,
    download: youtubeDownload,
  }),
  metadata: createTRPCRouter({
    extract: metadataExtract,
  }),
});

export type AppRouter = typeof appRouter;