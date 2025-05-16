import { Song, Playlist } from '@/types/music';
import { getMetadata, updateMetadata } from './fileService';
import { generatePlaylistImage } from './imageService';

// Track when a song is played
export const trackSongPlay = async (song: Song): Promise<void> => {
  try {
    // Get current metadata
    const metadata = await getMetadata();
    
    // Get or initialize play history
    const playHistory = metadata.playHistory || [];
    
    // Add new play event
    playHistory.push({
      songId: song.id,
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only the last 1000 plays to avoid excessive storage
    const trimmedHistory = playHistory.slice(-1000);
    
    // Update metadata
    await updateMetadata({
      playHistory: trimmedHistory,
    });
  } catch (error) {
    console.error('Error tracking song play:', error);
  }
};

// Get song play count
export const getSongPlayCount = async (songId: string): Promise<number> => {
  try {
    const metadata = await getMetadata();
    const playHistory = metadata.playHistory || [];
    
    return playHistory.filter(play => play.songId === songId).length;
  } catch (error) {
    console.error('Error getting song play count:', error);
    return 0;
  }
};

// Get most played songs
export const getMostPlayedSongs = async (limit = 20): Promise<{songId: string, title: string, artist: string, count: number}[]> => {
  try {
    const metadata = await getMetadata();
    const playHistory = metadata.playHistory || [];
    
    // Count plays for each song
    const playCounts: Record<string, {count: number, title: string, artist: string}> = {};
    
    playHistory.forEach(play => {
      if (!playCounts[play.songId]) {
        playCounts[play.songId] = {
          count: 0,
          title: play.title || 'Unknown Title',
          artist: play.artist || 'Unknown Artist'
        };
      }
      playCounts[play.songId].count++;
    });
    
    // Convert to array and sort
    const sortedSongs = Object.entries(playCounts)
      .map(([songId, data]) => ({ 
        songId, 
        title: data.title,
        artist: data.artist,
        count: data.count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return sortedSongs;
  } catch (error) {
    console.error('Error getting most played songs:', error);
    return [];
  }
};

// Get favorite genres
export const getFavoriteGenres = async (): Promise<{genre: string, count: number}[]> => {
  try {
    const metadata = await getMetadata();
    const playHistory = metadata.playHistory || [];
    
    // Count plays for each genre
    const genreCounts: Record<string, number> = {};
    
    playHistory.forEach(play => {
      if (play.genre && play.genre !== 'Unknown') {
        genreCounts[play.genre] = (genreCounts[play.genre] || 0) + 1;
      }
    });
    
    // Convert to array and sort
    const sortedGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
    
    return sortedGenres;
  } catch (error) {
    console.error('Error getting favorite genres:', error);
    return [];
  }
};

// Get favorite artists
export const getFavoriteArtists = async (limit = 10): Promise<{artist: string, count: number}[]> => {
  try {
    const metadata = await getMetadata();
    const playHistory = metadata.playHistory || [];
    
    // Count plays for each artist
    const artistCounts: Record<string, number> = {};
    
    playHistory.forEach(play => {
      if (play.artist && play.artist !== 'Unknown Artist') {
        artistCounts[play.artist] = (artistCounts[play.artist] || 0) + 1;
      }
    });
    
    // Convert to array and sort
    const sortedArtists = Object.entries(artistCounts)
      .map(([artist, count]) => ({ artist, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return sortedArtists;
  } catch (error) {
    console.error('Error getting favorite artists:', error);
    return [];
  }
};

// Check if we have enough data for recommendations
export const hasEnoughDataForRecommendations = async (): Promise<boolean> => {
  try {
    const metadata = await getMetadata();
    const playHistory = metadata.playHistory || [];
    
    // We need at least 20 plays to make recommendations
    return playHistory.length >= 20;
  } catch (error) {
    console.error('Error checking recommendation data:', error);
    return false;
  }
};

// Generate a recommended playlist based on listening history
export const generateRecommendedPlaylist = async (
  name: string,
  description: string,
  songPool: Song[],
  maxSongs = 15
): Promise<Playlist | null> => {
  try {
    // Check if we have enough data
    const hasEnoughData = await hasEnoughDataForRecommendations();
    
    if (!hasEnoughData || songPool.length < 10) {
      return null;
    }
    
    // Get favorite genres and artists
    const favoriteGenres = await getFavoriteGenres();
    const favoriteArtists = await getFavoriteArtists();
    
    // Score each song based on genre and artist preferences
    const scoredSongs = songPool.map(song => {
      let score = 0;
      
      // Add points for matching genres
      const genreMatch = favoriteGenres.find(g => g.genre === song.genre);
      if (genreMatch) {
        score += genreMatch.count;
      }
      
      // Add points for matching artists
      const artistMatch = favoriteArtists.find(a => a.artist === song.artist);
      if (artistMatch) {
        score += artistMatch.count * 2; // Weight artist matches more heavily
      }
      
      return { song, score };
    });
    
    // Sort by score and take the top songs
    const selectedSongs = scoredSongs
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSongs)
      .map(item => item.song);
    
    // Generate a simple image for the playlist
    const colors = favoriteGenres.slice(0, 3).map(g => {
      // Generate colors based on genre names
      const hash = g.genre.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
      return `#${(hash % 0xFFFFFF).toString(16).padStart(6, '0')}`;
    });
    
    const imageUri = await generatePlaylistImage(name, colors);
    
    // Create the playlist
    const playlist: Playlist = {
      id: `rec-${Date.now()}`,
      name,
      description,
      coverArt: imageUri,
      songs: selectedSongs,
      isGenerated: true,
      createdAt: new Date().toISOString(),
    };
    
    // Save the playlist
    const metadata = await getMetadata();
    const generatedPlaylists = metadata.generatedPlaylists || [];
    
    await updateMetadata({
      generatedPlaylists: [...generatedPlaylists, playlist],
    });
    
    return playlist;
  } catch (error) {
    console.error('Error generating recommended playlist:', error);
    return null;
  }
};

// Generate daily mixes based on listening history
export const generateDailyMixes = async (songPool: Song[]): Promise<Playlist[]> => {
  try {
    // Check if we have enough data
    const hasEnoughData = await hasEnoughDataForRecommendations();
    
    if (!hasEnoughData || songPool.length < 20) {
      return [];
    }
    
    // Get favorite genres
    const favoriteGenres = await getFavoriteGenres();
    
    // Take top 3 genres
    const topGenres = favoriteGenres.slice(0, 3);
    
    // Create a mix for each top genre
    const mixes = await Promise.all(topGenres.map(async (genreInfo, index) => {
      // Filter songs by genre
      const genreSongs = songPool.filter(song => song.genre === genreInfo.genre);
      
      // If not enough songs in this genre, add some random songs
      let mixSongs = [...genreSongs];
      
      if (mixSongs.length < 10 && songPool.length >= 10) {
        // Add random songs to reach at least 10 songs
        const randomSongs = songPool
          .filter(song => song.genre !== genreInfo.genre)
          .sort(() => Math.random() - 0.5)
          .slice(0, 10 - mixSongs.length);
        
        mixSongs = [...mixSongs, ...randomSongs];
      }
      
      // Limit to 15 songs max
      mixSongs = mixSongs.slice(0, 15);
      
      // Generate a simple image
      const colors = [
        `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`,
        `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`,
      ];
      
      const imageUri = await generatePlaylistImage(`Daily Mix ${index + 1}`, colors);
      
      // Create the playlist
      return {
        id: `daily-mix-${index + 1}-${Date.now()}`,
        name: `Daily Mix ${index + 1}`,
        description: `Based on your ${genreInfo.genre} listening`,
        coverArt: imageUri,
        songs: mixSongs,
        isGenerated: true,
        createdAt: new Date().toISOString(),
      };
    }));
    
    // Save the mixes
    const metadata = await getMetadata();
    const generatedPlaylists = metadata.generatedPlaylists || [];
    
    // Remove old daily mixes
    const filteredPlaylists = generatedPlaylists.filter(p => !p.name.startsWith('Daily Mix'));
    
    await updateMetadata({
      generatedPlaylists: [...filteredPlaylists, ...mixes],
    });
    
    return mixes;
  } catch (error) {
    console.error('Error generating daily mixes:', error);
    return [];
  }
};