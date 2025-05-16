import { Audio, AVPlaybackStatus } from 'expo-av';
import { Platform } from 'react-native';
import { Song } from '@/types/music';
import { saveFileToDownloads } from './fileService';
import { trackSongPlay } from './recommendationService';
import { usePlayerStore } from '@/store/playerStore';

// Initialize audio
export const initializeAudio = async (): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      // Use numeric values directly since the enum constants might have changed
      interruptionModeIOS: 2, // This is equivalent to DUCK_OTHERS
      interruptionModeAndroid: 2, // This is equivalent to DUCK_OTHERS
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

// Sound object for playback
let sound: Audio.Sound | null = null;

// Load and play a song
export const playSong = async (song: Song): Promise<boolean> => {
  try {
    // Unload any existing sound
    if (sound) {
      await sound.unloadAsync();
    }
    
    // Check if the song has a URI
    if (!song.uri && !song.localUri) {
      console.error('Song has no URI to play');
      return false;
    }
    
    // Create a new sound object
    const { sound: newSound, status } = await Audio.Sound.createAsync(
      { uri: song.localUri || song.uri || '' },
      { shouldPlay: true, progressUpdateIntervalMillis: 1000 },
      onPlaybackStatusUpdate
    );
    
    sound = newSound;
    
    // Track this play for recommendations
    trackSongPlay(song).catch(err => {
      console.error('Error tracking song play:', err);
    });
    
    return true;
  } catch (error) {
    console.error('Error playing song:', error);
    return false;
  }
};

// Callback for playback status updates
const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
  if (!status.isLoaded) return;
  
  // Update progress
  if (status.isPlaying) {
    const progress = status.positionMillis / 1000; // Convert to seconds
    const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
    
    // Update the store with current progress
    const store = usePlayerStore.getState();
    store.setProgress(progress);
    
    // If we're at the end of the song, play the next one
    if (status.didJustFinish) {
      store.playNext();
    }
  }
};

// Pause the current song
export const pauseSong = async (): Promise<boolean> => {
  try {
    if (sound) {
      await sound.pauseAsync();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error pausing song:', error);
    return false;
  }
};

// Resume the current song
export const resumeSong = async (): Promise<boolean> => {
  try {
    if (sound) {
      await sound.playAsync();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error resuming song:', error);
    return false;
  }
};

// Stop the current song
export const stopSong = async (): Promise<boolean> => {
  try {
    if (sound) {
      await sound.stopAsync();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error stopping song:', error);
    return false;
  }
};

// Seek to a specific position
export const seekToPosition = async (position: number): Promise<boolean> => {
  try {
    if (sound) {
      await sound.setPositionAsync(position * 1000); // Convert to milliseconds
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeking to position:', error);
    return false;
  }
};

// Get the current playback status
export const getPlaybackStatus = async (): Promise<AVPlaybackStatus | null> => {
  try {
    if (sound) {
      return await sound.getStatusAsync();
    }
    return null;
  } catch (error) {
    console.error('Error getting playback status:', error);
    return null;
  }
};

// Set up a callback for playback status updates
export const setPlaybackStatusCallback = (
  callback: (status: AVPlaybackStatus) => void
): (() => void) => {
  if (sound) {
    sound.setOnPlaybackStatusUpdate(callback);
    return () => {
      if (sound) {
        sound.setOnPlaybackStatusUpdate(null);
      }
    };
  }
  
  return () => {};
};

// Clean up resources
export const unloadSound = async (): Promise<void> => {
  try {
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Error unloading sound:', error);
  }
};

// Play a random song from the library
export const playRandomSong = async (songs: Song[]): Promise<boolean> => {
  if (!songs || songs.length === 0) return false;
  
  try {
    // Get a random song
    const randomIndex = Math.floor(Math.random() * songs.length);
    const randomSong = songs[randomIndex];
    
    // Create a shuffled queue from the remaining songs
    const remainingSongs = [...songs];
    remainingSongs.splice(randomIndex, 1); // Remove the selected song
    
    // Shuffle the remaining songs
    const shuffledQueue = remainingSongs.sort(() => Math.random() - 0.5);
    
    // Play the random song and set the queue
    const store = usePlayerStore.getState();
    store.setCurrentSong(randomSong);
    store.setQueue(shuffledQueue);
    
    return true;
  } catch (error) {
    console.error('Error playing random song:', error);
    return false;
  }
};

// Download a song
export const downloadSong = async (song: Song): Promise<Song | null> => {
  // In a real app, this would download from a remote source
  // For now, we'll just simulate by copying a local file
  
  try {
    if (!song.uri) {
      console.error('Song URI is missing');
      return null;
    }
    
    // Generate a filename
    const fileName = `${song.id}_${song.title.replace(/\s+/g, '_')}.mp3`;
    
    // Save the file
    const savedUri = await saveFileToDownloads(song.uri, fileName);
    
    if (savedUri) {
      // Return an updated song object with the local URI
      return {
        ...song,
        uri: savedUri,
        localUri: savedUri,
        isDownloaded: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error downloading song:', error);
    return null;
  }
};