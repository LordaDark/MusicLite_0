"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var create_context_1 = require("../../create-context");
// Schema for search input
var searchInputSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    limit: zod_1.z.number().min(1).max(50).default(20),
});
exports.default = create_context_1.publicProcedure
    .input(searchInputSchema)
    .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var artists_1, genres_1, songTitles_1, results, error_1;
    var input = _b.input;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                // In a real implementation, you would use the YouTube Data API
                // For now, we'll return more realistic mock data
                // Simulate API delay
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
            case 1:
                // In a real implementation, you would use the YouTube Data API
                // For now, we'll return more realistic mock data
                // Simulate API delay
                _c.sent();
                artists_1 = [
                    "Ed Sheeran", "Taylor Swift", "The Weeknd", "Billie Eilish",
                    "Post Malone", "Ariana Grande", "Drake", "BTS", "Dua Lipa"
                ];
                genres_1 = ["Pop", "Hip-Hop", "R&B", "Rock", "Electronic", "Latin"];
                songTitles_1 = [
                    "Shape of You", "Blinding Lights", "Dance Monkey", "Believer",
                    "Someone You Loved", "Bad Guy", "Levitating", "Watermelon Sugar",
                    "Circles", "Don't Start Now", "Mood", "Memories", "Savage Love",
                    "Dynamite", "Positions", "Peaches", "Stay", "Good 4 U", "Industry Baby"
                ];
                results = Array.from({ length: input.limit }, function (_, i) {
                    var artist = artists_1[Math.floor(Math.random() * artists_1.length)];
                    var title = i < 3
                        ? "".concat(input.query, " - ").concat(songTitles_1[i % songTitles_1.length]) // First few results match query
                        : songTitles_1[Math.floor(Math.random() * songTitles_1.length)];
                    var genre = genres_1[Math.floor(Math.random() * genres_1.length)];
                    return {
                        id: "video-".concat(i, "-").concat(Date.now()),
                        title: title,
                        artist: artist,
                        album: "".concat(artist, " - Greatest Hits"),
                        genre: genre,
                        thumbnail: "https://picsum.photos/seed/".concat(artist.replace(/\s+/g, ''), "/300/300"),
                        duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
                        viewCount: Math.floor(Math.random() * 10000000),
                        audioUrl: "https://example.com/audio/".concat(title.replace(/\s+/g, '_'), ".mp3"),
                    };
                });
                return [2 /*return*/, {
                        results: results,
                        query: input.query,
                    }];
            case 2:
                error_1 = _c.sent();
                console.error("Error searching YouTube:", error_1);
                throw new Error("Failed to search YouTube");
            case 3: return [2 /*return*/];
        }
    });
}); });
