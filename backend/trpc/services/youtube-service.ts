import ytdl from "ytdl-core";
import { z } from "zod";
import fetch from "node-fetch";

// Interfaccia per i risultati di ricerca
interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  duration: number;
  genre: string;
  audioUrl?: string;
  youtubeId: string;
}

// Chiave API YouTube (da impostare in variabile ambiente)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
console.log("[YouTube API] YOUTUBE_API_KEY presente:", !!YOUTUBE_API_KEY, YOUTUBE_API_KEY ? YOUTUBE_API_KEY.substring(0, 6) + "..." : "(vuota)");

// Cerca video su YouTube
export async function searchYouTube(query: string, limit = 20): Promise<SearchResult[]> {
  console.log("[YouTube API][searchYouTube] Query:", query, "Limit:", limit);
  if (!YOUTUBE_API_KEY) throw new Error("YouTube API key non configurata");
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  console.log("[YouTube API][searchYouTube] URL chiamato:", url);
  const res = await fetch(url);
  const rawText = await res.text();
  console.log("[YouTube API][searchYouTube] Risposta grezza search:", rawText);
  if (!res.ok) {
    console.error("Errore nella chiamata alle API di YouTube. Status:", res.status, "Risposta:", rawText, "URL:", url);
    throw new Error("Errore nella chiamata alle API di YouTube: " + rawText);
  }
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error("Errore di parsing JSON dalla risposta search:", rawText);
    throw new Error("Errore di parsing JSON dalla risposta search");
  }
  if (!data.items) {
    console.error("Risposta search API senza items:", data);
    throw new Error("Risposta search API senza items");
  }
  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
  console.log("[YouTube API][searchYouTube] URL dettagli:", detailsUrl);
  const detailsRes = await fetch(detailsUrl);
  const detailsRawText = await detailsRes.text();
  console.log("[YouTube API][searchYouTube] Risposta grezza details:", detailsRawText);
  if (!detailsRes.ok) {
    console.error("Errore nel recupero dettagli video. Status:", detailsRes.status, "Risposta:", detailsRawText, "URL:", detailsUrl);
    throw new Error("Errore nel recupero dettagli video: " + detailsRawText);
  }
  let detailsData;
  try {
    detailsData = JSON.parse(detailsRawText);
  } catch (e) {
    console.error("Errore di parsing JSON dalla risposta details:", detailsRawText);
    throw new Error("Errore di parsing JSON dalla risposta details");
  }
  if (!detailsData.items) {
    console.error("Risposta details API senza items:", detailsData);
    throw new Error("Risposta details API senza items");
  }
  const results: SearchResult[] = detailsData.items.map((item: any) => {
    const durationISO = item.contentDetails.duration;
    const match = durationISO.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = match && match[1] ? parseInt(match[1]) : 0;
    const seconds = match && match[2] ? parseInt(match[2]) : 0;
    const duration = minutes * 60 + seconds;
    return {
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      album: item.snippet.channelTitle + " - YouTube",
      genre: "YouTube",
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
      duration,
      youtubeId: item.id,
      audioUrl: `/api/youtube/audio/${item.id}`
    };
  });
  return results;
}

// Ottieni informazioni su un video YouTube
export async function getYouTubeVideoInfo(videoId: string) {
  try {
    // In una implementazione reale, useresti ytdl-core
    // Per ora, restituiamo dati mock
    
    // Simula un ritardo di API
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
  } catch (error) {
    console.error("Error getting video info:", error);
    throw new Error("Failed to get video information");
  }
}

// Scarica un video YouTube
export async function downloadYouTubeVideo(videoId: string, quality: "high" | "medium" | "low" = "medium") {
  try {
    // In una implementazione reale, useresti ytdl-core
    // Per ora, restituiamo dati mock
    
    // Simula un ritardo di download
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Restituisci informazioni mock sul download
    return {
      id: videoId,
      downloadUrl: `https://musiclite-api.onrender.com/download/${videoId}.mp3`,
      fileName: `song-${videoId}.mp3`,
      fileSize: Math.floor(Math.random() * 10000000) + 1000000, // 1-11 MB
      quality,
      success: true,
    };
  } catch (error) {
    console.error("Error downloading video:", error);
    throw new Error("Failed to download video");
  }
}