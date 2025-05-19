import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Endpoint di ricerca reale su YouTube
import { searchYouTube } from "./trpc/services/youtube-service";

app.get("/search", async (c) => {
  const query = c.req.query("q") || "";
  const limit = Number(c.req.query("limit")) || 20;
  if (!query) {
    return c.json({ status: "error", message: "Parametro 'q' mancante nella query." }, 400);
  }
  try {
    const results = await searchYouTube(query, limit);
    return c.json({ status: "success", results });
  } catch (error) {
    return c.json({ status: "error", message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

export default app;