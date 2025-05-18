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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchYouTube = searchYouTube;
exports.getYouTubeVideoInfo = getYouTubeVideoInfo;
exports.downloadYouTubeVideo = downloadYouTubeVideo;
const axios = require("axios");
// Cerca video su YouTube
async function searchYouTube(query, limit = 20) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            throw new Error("YOUTUBE_API_KEY non impostata nelle variabili d'ambiente");
        }
        const url = `https://www.googleapis.com/youtube/v3/search`;
        const params = {
            part: "snippet",
            q: query,
            maxResults: limit,
            type: "video",
            key: apiKey
        };
        const response = await axios.get(url, { params });
        if (!response.data || !response.data.items) {
            throw new Error("Risposta API YouTube non valida");
        }
        const results = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            album: item.snippet.channelTitle + " - YouTube",
            genre: "YouTube",
            thumbnail: item.snippet.thumbnails && item.snippet.thumbnails.default ? item.snippet.thumbnails.default.url : "",
            duration: null,
            youtubeId: item.id.videoId
        }));
        return results;
    } catch (error) {
        console.error("Errore nella ricerca YouTube:", error?.response?.data || error.message);
        throw new Error("Errore nella ricerca su YouTube");
    }
}
// Ottieni informazioni su un video YouTube
function getYouTubeVideoInfo(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // In una implementazione reale, useresti ytdl-core
            // Per ora, restituiamo dati mock
            // Simula un ritardo di API
            yield new Promise(resolve => setTimeout(resolve, 300));
            // Genera informazioni mock sul video
            return {
                id: videoId,
                title: `Song Title for ${videoId}`,
                artist: `Artist for ${videoId}`,
                album: `Album for ${videoId}`,
                thumbnail: `https://picsum.photos/seed/${videoId}/300/300`,
                duration: Math.floor(Math.random() * 300) + 60, // 1-6 minuti
                genre: ["Pop", "Rock", "Hip-Hop", "Electronic"][Math.floor(Math.random() * 4)],
                releaseDate: new Date().toISOString(),
                audioUrl: `https://musiclite-api.onrender.com/audio/${videoId}.mp3`, // Questo sarebbe un URL di stream reale
            };
        }
        catch (error) {
            console.error("Error getting video info:", error);
            throw new Error("Failed to get video information");
        }
    });
}
// Scarica un video YouTube
function downloadYouTubeVideo(videoId_1) {
    return __awaiter(this, arguments, void 0, function* (videoId, quality = "medium") {
        try {
            // In una implementazione reale, useresti ytdl-core
            // Per ora, restituiamo dati mock
            // Simula un ritardo di download
            yield new Promise(resolve => setTimeout(resolve, 1000));
            // Restituisci informazioni mock sul download
            return {
                id: videoId,
                downloadUrl: `https://musiclite-api.onrender.com/download/${videoId}.mp3`,
                fileName: `song-${videoId}.mp3`,
                fileSize: Math.floor(Math.random() * 10000000) + 1000000, // 1-11 MB
                quality,
                success: true,
            };
        }
        catch (error) {
            console.error("Error downloading video:", error);
            throw new Error("Failed to download video");
        }
    });
}
