import { Playlist, Song } from '@/types/music';
import { getMetadata, updateMetadata } from './fileService';
import { generatePlaylistImage } from './imageService';

// Get all user playlists
export const getUserPlaylists = async (): Promise<Playlist[]> => {
  try {
    const metadata = await getMetadata();
    return metadata.userPlaylists || [];
  } catch (error) {
    console.error('Error getting user playlists:', error);
    return [];
  }
};

// Get all generated playlists
export const getGeneratedPlaylists = async (): Promise<Playlist[]> => {
  try {
    const metadata = await getMetadata();
    return metadata.generatedPlaylists || [];
  } catch (error) {
    console.error('Error getting generated playlists:', error);
    return [];
  }
};

// Get a playlist by ID
export const getPlaylistById = async (playlistId: string): Promise<Playlist | null> => {
  try {
    const metadata = await getMetadata();
    
    // Check user playlists
    const userPlaylist = (metadata.userPlaylists || []).find(p => p.id === playlistId);
    if (userPlaylist) return userPlaylist;
    
    // Check generated playlists
    const generatedPlaylist = (metadata.generatedPlaylists || []).find(p => p.id === playlistId);
    if (generatedPlaylist) return generatedPlaylist;
    
    return null;
  } catch (error) {
    console.error('Error getting playlist by ID:', error);
    return null;
  }
};

// Create a new playlist
export const createPlaylist = async (
  name: string,
  description: string,
  songs: Song[] = []
): Promise<Playlist | null> => {
  try {
    // Generate a simple image for the playlist
    const colors = [
      `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`,
      `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`,
    ];
    
    const imageUri = await generatePlaylistImage(name, colors);
    
    // Create the playlist
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverArt: imageUri,
      songs,
      isGenerated: false,
      createdAt: new Date().toISOString(),
    };
    
    // Save the playlist
    const metadata = await getMetadata();
    const userPlaylists = metadata.userPlaylists || [];
    
    await updateMetadata({
      userPlaylists: [...userPlaylists, newPlaylist],
    });
    
    return newPlaylist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

// Update a playlist
export const updatePlaylist = async (
  playlistId: string,
  updates: Partial<Playlist>
): Promise<Playlist | null> => {
  try {
    const metadata = await getMetadata();
    const userPlaylists = metadata.userPlaylists || [];
    
    // Find the playlist
    const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex === -1) {
      throw new Error('Playlist not found');
    }
    
    // Update the playlist
    const updatedPlaylist = {
      ...userPlaylists[playlistIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Save the updated playlist
    const updatedPlaylists = [...userPlaylists];
    updatedPlaylists[playlistIndex] = updatedPlaylist;
    
    await updateMetadata({
      userPlaylists: updatedPlaylists,
    });
    
    return updatedPlaylist;
  } catch (error) {
    console.error('Error updating playlist:', error);
    return null;
  }
};

// Delete a playlist
export const deletePlaylist = async (playlistId: string): Promise<boolean> => {
  try {
    const metadata = await getMetadata();
    const userPlaylists = metadata.userPlaylists || [];
    
    // Filter out the playlist to delete
    const updatedPlaylists = userPlaylists.filter(p => p.id !== playlistId);
    
    // Check if a playlist was actually removed
    if (updatedPlaylists.length === userPlaylists.length) {
      return false;
    }
    
    // Save the updated playlists
    await updateMetadata({
      userPlaylists: updatedPlaylists,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return false;
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (
  playlistId: string,
  song: Song
): Promise<boolean> => {
  try {
    const metadata = await getMetadata();
    const userPlaylists = metadata.userPlaylists || [];
    
    // Find the playlist
    const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex === -1) {
      throw new Error('Playlist not found');
    }
    
    // Check if song is already in the playlist
    const playlist = userPlaylists[playlistIndex];
    if (playlist.songs.some(s => s.id === song.id)) {
      return true; // Song already in playlist
    }
    
    // Add the song
    const updatedPlaylist = {
      ...playlist,
      songs: [...playlist.songs, song],
      updatedAt: new Date().toISOString(),
    };
    
    // Save the updated playlist
    const updatedPlaylists = [...userPlaylists];
    updatedPlaylists[playlistIndex] = updatedPlaylist;
    
    await updateMetadata({
      userPlaylists: updatedPlaylists,
    });
    
    return true;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return false;
  }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (
  playlistId: string,
  songId: string
): Promise<boolean> => {
  try {
    const metadata = await getMetadata();
    const userPlaylists = metadata.userPlaylists || [];
    
    // Find the playlist
    const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex === -1) {
      throw new Error('Playlist not found');
    }
    
    // Remove the song
    const playlist = userPlaylists[playlistIndex];
    const updatedPlaylist = {
      ...playlist,
      songs: playlist.songs.filter(s => s.id !== songId),
      updatedAt: new Date().toISOString(),
    };
    
    // Save the updated playlist
    const updatedPlaylists = [...userPlaylists];
    updatedPlaylists[playlistIndex] = updatedPlaylist;
    
    await updateMetadata({
      userPlaylists: updatedPlaylists,
    });
    
    return true;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return false;
  }
};