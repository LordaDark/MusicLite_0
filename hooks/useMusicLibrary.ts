import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';
import { Song } from '@/types/music';
import { 
  initializeFileSystem, 
  scanDeviceForMusic,
  quickScanForNewMusic,
  getMetadata 
} from '@/services/fileService';
import { useLibraryStore } from '@/store/libraryStore';
import { generateDailyMixes } from '@/services/recommendationService';

export const useMusicLibrary = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const { setDownloadedSongs } = useLibraryStore();

  // Initialize the library
  const initializeLibrary = async () => {
    setIsLoading(true);
    
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        setHasPermission(false);
        Alert.alert(
          "Permission Required",
          "MusicLite needs access to your media library to find and play your music.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
        return;
      }
      
      setHasPermission(true);
      
      // Initialize file system
      const initialized = await initializeFileSystem();
      
      if (!initialized) {
        Alert.alert(
          "Error",
          "Could not initialize the app's file system. Some features may not work correctly.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
        return;
      }
      
      // Load metadata first (faster than scanning)
      const metadata = await getMetadata();
      
      if (metadata.songs && metadata.songs.length > 0) {
        console.log(`Loaded ${metadata.songs.length} songs from metadata`);
        setLocalSongs(metadata.songs);
        setDownloadedSongs(metadata.songs);
        
        // Do a quick scan for any new files
        const updatedSongs = await quickScanForNewMusic();
        if (updatedSongs.length > metadata.songs.length) {
          console.log(`Found ${updatedSongs.length - metadata.songs.length} new songs`);
          setLocalSongs(updatedSongs);
          setDownloadedSongs(updatedSongs);
        }
      } else {
        // No cached songs, do a full scan
        console.log('No cached songs, performing full scan');
        const scannedSongs = await scanDeviceForMusic(true);
        
        if (scannedSongs.length > 0) {
          console.log(`Scanned ${scannedSongs.length} songs`);
          setLocalSongs(scannedSongs);
          setDownloadedSongs(scannedSongs);
        }
      }
      
      // Generate recommendations if we have songs
      if (metadata.songs && metadata.songs.length > 0) {
        try {
          await generateDailyMixes(metadata.songs);
        } catch (recError) {
          console.error('Error generating recommendations:', recError);
        }
      }
      
    } catch (error) {
      console.error('Error initializing music library:', error);
      Alert.alert(
        "Error",
        "An error occurred while initializing the music library.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Scan for new music
  const refreshLibrary = useCallback(async () => {
    if (!hasPermission) {
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Do a full scan
      const scannedSongs = await scanDeviceForMusic(true);
      
      if (scannedSongs.length > 0) {
        setLocalSongs(scannedSongs);
        setDownloadedSongs(scannedSongs);
        
        // Generate recommendations
        try {
          await generateDailyMixes(scannedSongs);
        } catch (recError) {
          console.error('Error generating recommendations:', recError);
        }
      }
    } catch (error) {
      console.error('Error refreshing music library:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [hasPermission, setDownloadedSongs]);

  // Quick refresh - just check for new files
  const quickRefresh = useCallback(async () => {
    if (!hasPermission) {
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      const updatedSongs = await quickScanForNewMusic();
      setLocalSongs(updatedSongs);
      setDownloadedSongs(updatedSongs);
    } catch (error) {
      console.error('Error quick refreshing music library:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [hasPermission, setDownloadedSongs]);

  // Initialize on mount
  useEffect(() => {
    initializeLibrary();
    
    // Set up a timer to periodically check for new music
    const intervalId = setInterval(() => {
      if (!isRefreshing && !isLoading) {
        quickRefresh();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    isLoading,
    isRefreshing,
    hasPermission,
    localSongs,
    refreshLibrary,
    quickRefresh,
    initializeLibrary
  };
};