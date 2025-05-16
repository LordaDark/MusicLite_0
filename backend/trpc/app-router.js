"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
var create_context_1 = require("./create-context");
var route_1 = require("./routes/example/hi/route");
var search_1 = require("./routes/youtube/search");
var getInfo_1 = require("./routes/youtube/getInfo");
var download_1 = require("./routes/youtube/download");
var extract_1 = require("./routes/metadata/extract");
exports.appRouter = (0, create_context_1.createTRPCRouter)({
    example: (0, create_context_1.createTRPCRouter)({
        hi: route_1.default,
    }),
    youtube: (0, create_context_1.createTRPCRouter)({
        search: search_1.default,
        getInfo: getInfo_1.default,
        download: download_1.default,
    }),
    metadata: (0, create_context_1.createTRPCRouter)({
        extract: extract_1.default,
    }),
});
