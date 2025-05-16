import { trpcClient } from '@/lib/trpc';
import { Song } from '@/types/music';
import { saveFileToDownloads, updateMetadata } from './fileService';
import { playSong } from './audioService';
import { Alert } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';

// Search YouTube for songs
export const searchYouTube = async (query: string, limit = 20): Promise<Song[]> => {
  try {
    const response = await trpcClient.youtube.search.query({
      query,
      limit,
    });

    // Convert YouTube results to Song objects
    return response.results.map(item => ({
      id: item.id,
      title: item.title,
      artist: item.artist || 'Unknown Artist',
      album: item.album || 'YouTube',
      duration: item.duration,
      coverArt: item.thumbnail,
      genre: item.genre || 'Unknown',
      isDownloaded: false,
      source: 'youtube',
      youtubeId: item.id, // Use the video ID as youtubeId
      uri: item.audioUrl, // Include direct audio URL if available
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
};

// Get detailed info about a YouTube video
export const getYouTubeInfo = async (videoId: string): Promise<Song | null> => {
  try {
    const info = await trpcClient.youtube.getInfo.query({
      videoId,
    });

    return {
      id: info.id,
      title: info.title,
      artist: info.artist || 'Unknown Artist',
      album: info.album || 'YouTube',
      duration: info.duration,
      coverArt: info.thumbnail,
      genre: info.genre || 'Unknown',
      isDownloaded: false,
      source: 'youtube',
      youtubeId: info.id,
      uri: info.audioUrl,
    };
  } catch (error) {
    console.error('Error getting YouTube info:', error);
    return null;
  }
};

// Download a song from YouTube
export const downloadYouTubeSong = async (videoId: string, quality: "high" | "medium" | "low" = 'medium'): Promise<Song | null> => {
  try {
    // Get video info first
    const songInfo = await getYouTubeInfo(videoId);
    
    if (!songInfo) {
      throw new Error('Could not get song information');
    }
    
    // Start the download
    const downloadInfo = await trpcClient.youtube.download.mutate({
      videoId,
      quality,
    });
    
    if (!downloadInfo.success) {
      throw new Error('Download failed');
    }
    
    // Generate a safe filename
    const safeTitle = songInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeTitle}-${videoId}.mp3`;
    
    // In a real implementation, we would download the file from downloadInfo.downloadUrl
    // For now, we'll simulate this by saving metadata
    
    // Create an updated song object with download info
    const downloadedSong: Song = {
      ...songInfo,
      isDownloaded: true,
      localUri: downloadInfo.downloadUrl || `file:///music/${fileName}`, // Use the actual download URL
      downloadDate: new Date().toISOString(),
    };
    
    // Update metadata to include this downloaded song
    await updateMetadata({
      downloads: [downloadedSong],
    });
    
    return downloadedSong;
  } catch (error) {
    console.error('Error downloading YouTube song:', error);
    return null;
  }
};

// Stream and download a song simultaneously
export const streamAndDownload = async (videoId: string): Promise<boolean> => {
  try {
    // Get song info
    const songInfo = await getYouTubeInfo(videoId);
    
    if (!songInfo) {
      Alert.alert("Error", "Could not get song information");
      return false;
    }
    
    // Start playing the song
    const playSuccess = await playSong(songInfo);
    
    if (!playSuccess) {
      Alert.alert("Error", "Could not play the song");
      return false;
    }
    
    // Update player store
    const playerStore = usePlayerStore.getState();
    playerStore.setCurrentSong(songInfo);
    
    // Start downloading in the background
    downloadYouTubeSong(videoId).catch(err => {
      console.error('Background download failed:', err);
    });
    
    return true;
  } catch (error) {
    console.error('Error streaming and downloading:', error);
    Alert.alert("Error", "Failed to stream and download the song");
    return false;
  }
};