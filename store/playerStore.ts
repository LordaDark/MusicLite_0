import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '@/types/music';
import { 
  playSong, 
  pauseSong, 
  resumeSong, 
  seekToPosition,
  stopSong,
  unloadSound
} from '@/services/audioService';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  repeatMode: 'off' | 'all' | 'one';
  shuffleMode: boolean;
  progress: number;
  duration: number;
  isMinimized: boolean;
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearQueue: () => void;
  minimizePlayer: () => void;
  restorePlayer: () => void;
  closePlayer: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      isPlaying: false,
      repeatMode: 'off',
      shuffleMode: false,
      progress: 0,
      duration: 0,
      isMinimized: false,
      
      setCurrentSong: async (song) => {
        if (song) {
          // Play the song using the audio service
          const success = await playSong(song);
          
          if (success) {
            set({ 
              currentSong: song, 
              progress: 0, 
              duration: song.duration || 0,
              isPlaying: true,
              isMinimized: false // Ensure player is visible when a new song is set
            });
          }
        } else {
          // Stop and unload the current song
          await stopSong();
          await unloadSound();
          set({ currentSong: null, isPlaying: false });
        }
      },
      
      setQueue: (songs) => set({ queue: songs }),
      
      addToQueue: (song) => set((state) => ({ 
        queue: [...state.queue, song] 
      })),
      
      removeFromQueue: (songId) => set((state) => ({ 
        queue: state.queue.filter(song => song.id !== songId) 
      })),
      
      playNext: () => {
        const { queue, currentSong, repeatMode } = get();
        
        if (queue.length === 0) {
          if (repeatMode === 'one' && currentSong) {
            // Just restart the current song
            set({ progress: 0 });
            seekToPosition(0);
            return;
          } else if (repeatMode === 'all' && currentSong) {
            // Get all songs from the library and create a new queue
            // This is handled in the component
            return;
          }
          
          // No more songs to play
          set({ isPlaying: false });
          return;
        }
        
        // Play the next song in queue
        const nextSong = queue[0];
        const newQueue = queue.slice(1);
        
        // Play the song using the audio service
        playSong(nextSong).then(success => {
          if (success) {
            set({ 
              currentSong: nextSong, 
              queue: newQueue,
              progress: 0,
              duration: nextSong.duration,
              isPlaying: true,
              isMinimized: false // Ensure player is visible when playing next song
            });
          }
        });
      },
      
      playPrevious: () => {
        const { currentSong, progress } = get();
        
        // If we're more than 3 seconds into the song, restart it
        if (progress > 3) {
          seekToPosition(0);
          set({ progress: 0 });
          return;
        }
        
        // Otherwise, we'd need history to go back
        // For now, just restart the current song
        seekToPosition(0);
        set({ progress: 0 });
      },
      
      togglePlay: async () => {
        const { isPlaying, currentSong } = get();
        
        if (!currentSong) return;
        
        if (isPlaying) {
          const success = await pauseSong();
          if (success) {
            set({ isPlaying: false });
          }
        } else {
          const success = await resumeSong();
          if (success) {
            set({ isPlaying: true });
          }
        }
      },
      
      setProgress: async (progress) => {
        // Update the progress in the store
        set({ progress });
      },
      
      toggleShuffle: () => set((state) => ({ shuffleMode: !state.shuffleMode })),
      
      toggleRepeat: () => set((state) => {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(state.repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        return { repeatMode: modes[nextIndex] };
      }),
      
      clearQueue: () => set({ queue: [] }),

      minimizePlayer: () => set({ isMinimized: true }),
      
      restorePlayer: () => set({ isMinimized: false }),
      
      closePlayer: async () => {
        // Stop and unload the current song
        await stopSong();
        await unloadSound();
        
        // Reset the player state
        set({ 
          currentSong: null, 
          isPlaying: false, 
          progress: 0, 
          duration: 0,
          isMinimized: false
        });
      }
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Don't persist these values to avoid issues on reload
        repeatMode: state.repeatMode,
        shuffleMode: state.shuffleMode,
        // Don't persist playback state
        isPlaying: false,
        progress: 0,
        isMinimized: false,
      }),
    }
  )
);