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

// Cerca video su YouTube
export async function searchYouTube(query: string, limit = 20): Promise<SearchResult[]> {
  if (!YOUTUBE_API_KEY) throw new Error("YouTube API key non configurata");
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore nella chiamata alle API di YouTube");
  const data = await res.json();
  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
  // Recupera dettagli dei video (durata, ecc)
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  if (!detailsRes.ok) throw new Error("Errore nel recupero dettagli video");
  const detailsData = await detailsRes.json();
  const results: SearchResult[] = detailsData.items.map((item: any) => {
    const durationISO = item.contentDetails.duration;
    // Converti ISO 8601 duration in secondi
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