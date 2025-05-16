import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, Playlist, playlists as mockPlaylists } from '@/constants/mockData';

interface LibraryState {
  downloadedSongs: Song[];
  userPlaylists: Playlist[];
  likedSongs: string[]; // Song IDs
  
  // Actions
  addDownloadedSong: (song: Song) => void;
  removeDownloadedSong: (songId: string) => void;
  setDownloadedSongs: (songs: Song[]) => void;
  createPlaylist: (name: string, description: string, coverArt: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  toggleLikeSong: (songId: string) => void;
  isLiked: (songId: string) => boolean;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      downloadedSongs: [],
      userPlaylists: mockPlaylists.filter(p => !p.isGenerated),
      likedSongs: [],
      
      addDownloadedSong: (song) => set((state) => {
        // Don't add if already downloaded
        if (state.downloadedSongs.some(s => s.id === song.id)) {
          return state;
        }
        
        const updatedSong = { ...song, isDownloaded: true };
        return { 
          downloadedSongs: [...state.downloadedSongs, updatedSong] 
        };
      }),
      
      removeDownloadedSong: (songId) => set((state) => ({ 
        downloadedSongs: state.downloadedSongs.filter(song => song.id !== songId) 
      })),
      
      setDownloadedSongs: (songs) => set({ downloadedSongs: songs }),
      
      createPlaylist: (name, description, coverArt) => set((state) => {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          description,
          coverArt,
          songs: [],
          isGenerated: false
        };
        
        return { 
          userPlaylists: [...state.userPlaylists, newPlaylist] 
        };
      }),
      
      deletePlaylist: (playlistId) => set((state) => ({ 
        userPlaylists: state.userPlaylists.filter(playlist => playlist.id !== playlistId) 
      })),
      
      addSongToPlaylist: (playlistId, song) => set((state) => {
        const updatedPlaylists = state.userPlaylists.map(playlist => {
          if (playlist.id === playlistId) {
            // Don't add if already in playlist
            if (playlist.songs.some(s => s.id === song.id)) {
              return playlist;
            }
            
            return {
              ...playlist,
              songs: [...playlist.songs, song]
            };
          }
          return playlist;
        });
        
        return { userPlaylists: updatedPlaylists };
      }),
      
      removeSongFromPlaylist: (playlistId, songId) => set((state) => {
        const updatedPlaylists = state.userPlaylists.map(playlist => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              songs: playlist.songs.filter(song => song.id !== songId)
            };
          }
          return playlist;
        });
        
        return { userPlaylists: updatedPlaylists };
      }),
      
      toggleLikeSong: (songId) => set((state) => {
        if (state.likedSongs.includes(songId)) {
          return { 
            likedSongs: state.likedSongs.filter(id => id !== songId) 
          };
        } else {
          return { 
            likedSongs: [...state.likedSongs, songId] 
          };
        }
      }),
      
      isLiked: (songId) => {
        return get().likedSongs.includes(songId);
      }
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);