"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var trpc_server_1 = require("@hono/trpc-server");
var cors_1 = require("hono/cors");
var app_router_1 = require("./trpc/app-router");
var create_context_1 = require("./trpc/create-context");
// app will be mounted at /api
var app = new hono_1.Hono();
// Enable CORS for all routes
app.use("*", (0, cors_1.cors)());
// Mount tRPC router at /trpc
app.use("/trpc/*", (0, trpc_server_1.trpcServer)({
    endpoint: "/api/trpc",
    router: app_router_1.appRouter,
    createContext: create_context_1.createContext,
}));
// Simple health check endpoint
app.get("/", function (c) {
    return c.json({ status: "ok", message: "API is running" });
});
exports.default = app;
