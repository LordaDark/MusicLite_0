import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { Song, AppMetadata } from '@/types/music';
import { getCompleteMetadata } from './metadataService';

// App directory structure
const APP_DIRECTORY = 'MusicLite';
const DOWNLOADS_DIRECTORY = 'Downloads';
const PLAYLISTS_DIRECTORY = 'Playlists';
const METADATA_FILE = 'metadata.json';
const METADATA_CACHE_FILE = 'metadata_cache.json';

// Full paths
export const getAppDirectory = async (): Promise<string> => {
  // On Android, we can create a directory in the external storage
  // On iOS, we need to use the app's documents directory
  if (Platform.OS === 'ios') {
    return `${FileSystem.documentDirectory}${APP_DIRECTORY}`;
  } else {
    // Android
    return `${FileSystem.documentDirectory}${APP_DIRECTORY}`;
  }
};

export const getDownloadsDirectory = async (): Promise<string> => {
  const appDir = await getAppDirectory();
  return `${appDir}/${DOWNLOADS_DIRECTORY}`;
};

export const getPlaylistsDirectory = async (): Promise<string> => {
  const appDir = await getAppDirectory();
  return `${appDir}/${PLAYLISTS_DIRECTORY}`;
};

// Initialize app directories
export const initializeFileSystem = async (): Promise<boolean> => {
  try {
    // Request permissions first
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Media library permission not granted');
      return false;
    }

    // Create app directory
    const appDir = await getAppDirectory();
    const appDirInfo = await FileSystem.getInfoAsync(appDir);
    if (!appDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
    }

    // Create downloads directory
    const downloadsDir = await getDownloadsDirectory();
    const downloadsDirInfo = await FileSystem.getInfoAsync(downloadsDir);
    if (!downloadsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
    }

    // Create playlists directory
    const playlistsDir = await getPlaylistsDirectory();
    const playlistsDirInfo = await FileSystem.getInfoAsync(playlistsDir);
    if (!playlistsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(playlistsDir, { intermediates: true });
    }

    // Initialize metadata file if it doesn't exist
    const metadataPath = `${appDir}/${METADATA_FILE}`;
    const metadataInfo = await FileSystem.getInfoAsync(metadataPath);
    if (!metadataInfo.exists) {
      await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify({
        songs: [],
        userPlaylists: [],
        generatedPlaylists: [],
        playHistory: [],
        lastScan: null,
        lastScanPath: null
      }));
    }
    
    // Initialize metadata cache file
    const metadataCachePath = `${appDir}/${METADATA_CACHE_FILE}`;
    const metadataCacheInfo = await FileSystem.getInfoAsync(metadataCachePath);
    if (!metadataCacheInfo.exists) {
      await FileSystem.writeAsStringAsync(metadataCachePath, JSON.stringify({
        songMetadata: {}
      }));
    }

    return true;
  } catch (error) {
    console.error('Error initializing file system:', error);
    return false;
  }
};

// Metadata cache functions
export const getMetadataCache = async (): Promise<Record<string, Partial<Song>>> => {
  try {
    const appDir = await getAppDirectory();
    const metadataCachePath = `${appDir}/${METADATA_CACHE_FILE}`;
    const metadataCacheString = await FileSystem.readAsStringAsync(metadataCachePath);
    const cache = JSON.parse(metadataCacheString);
    return cache.songMetadata || {};
  } catch (error) {
    console.error('Error getting metadata cache:', error);
    return {};
  }
};

export const updateMetadataCache = async (songId: string, metadata: Partial<Song>): Promise<boolean> => {
  try {
    const appDir = await getAppDirectory();
    const metadataCachePath = `${appDir}/${METADATA_CACHE_FILE}`;
    
    // Get current cache
    const cache = await getMetadataCache();
    
    // Update cache
    cache[songId] = metadata;
    
    // Write back to file
    await FileSystem.writeAsStringAsync(
      metadataCachePath, 
      JSON.stringify({ songMetadata: cache })
    );
    
    return true;
  } catch (error) {
    console.error('Error updating metadata cache:', error);
    return false;
  }
};

// Scan for music files in the device - optimized version
export const scanDeviceForMusic = async (fullScan = false): Promise<Song[]> => {
  try {
    // Get metadata to check last scan
    const metadata = await getMetadata();
    const lastScanTime = metadata.lastScan ? new Date(metadata.lastScan) : null;
    
    // If not a full scan and we've scanned in the last 24 hours, use cached results
    if (!fullScan && lastScanTime && (Date.now() - lastScanTime.getTime() < 24 * 60 * 60 * 1000)) {
      console.log('Using cached scan results');
      return metadata.songs || [];
    }
    
    console.log('Starting music scan...');
    
    // Get all media from the device - use pagination for better performance
    const batchSize = 100;
    let allSongs: Song[] = [];
    let hasMore = true;
    let after = undefined;
    
    // Get metadata cache
    const metadataCache = await getMetadataCache();
    
    while (hasMore) {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: batchSize,
        after,
        sortBy: MediaLibrary.SortBy.creationTime,
      });
      
      console.log(`Found ${media.assets.length} audio files in batch`);
      
      if (media.assets.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process this batch
      const songBatch = await processSongBatch(media.assets, metadataCache);
      allSongs = [...allSongs, ...songBatch];
      
      // Check if we need to continue
      hasMore = media.hasNextPage;
      after = media.endCursor;
      
      console.log(`Processed ${allSongs.length} songs so far. Has more: ${hasMore}`);
    }

    console.log(`Scan complete. Found ${allSongs.length} valid songs.`);
    
    // Save the scanned songs to metadata
    await updateMetadata({ 
      songs: allSongs, 
      lastScan: new Date().toISOString(),
      lastScanPath: allSongs.length > 0 ? allSongs[0].uri : null
    });

    return allSongs;
  } catch (error) {
    console.error('Error scanning device for music:', error);
    return [];
  }
};

// Process a batch of songs
const processSongBatch = async (
  assets: MediaLibrary.Asset[], 
  metadataCache: Record<string, Partial<Song>>
): Promise<Song[]> => {
  const songs: Song[] = [];
  
  for (const asset of assets) {
    try {
      // Get full asset info
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      
      // Check if we have cached metadata for this song
      let metadata: Partial<Song> = {};
      
      if (metadataCache[asset.id]) {
        metadata = metadataCache[asset.id];
      } else {
        // Extract metadata from filename and enrich it
        metadata = await getCompleteMetadata(asset.filename, asset.uri);
        
        // Cache the metadata for future use
        await updateMetadataCache(asset.id, metadata);
      }
      
      // Create a song object
      const song: Song = {
        id: asset.id,
        title: metadata.title || asset.filename.replace(/\.[^/.]+$/, "") || 'Unknown Title',
        artist: metadata.artist || 'Unknown Artist',
        album: metadata.album || 'Unknown Album',
        duration: asset.duration || 0,
        coverArt: metadata.coverArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop',
        genre: metadata.genre || 'Unknown',
        isDownloaded: true, // It's on the device, so it's "downloaded"
        uri: asset.uri,
        source: 'local',
        localUri: asset.uri,
        youtubeId: metadata.youtubeId
      };
      
      songs.push(song);
    } catch (assetError) {
      console.error('Error processing audio asset:', assetError);
    }
  }
  
  return songs;
};

// Fast scan for new music files
export const quickScanForNewMusic = async (): Promise<Song[]> => {
  try {
    // Get metadata to check last scan and known songs
    const metadata = await getMetadata();
    const knownSongs = metadata.songs || [];
    const knownIds = new Set(knownSongs.map(song => song.id));
    const lastScanPath = metadata.lastScanPath;
    
    console.log('Starting quick scan for new music...');
    
    // Get recent media from the device
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: 50, // Just check the most recent files
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    console.log(`Found ${media.assets.length} recent audio files`);
    
    // Filter to only new files
    const newAssets = media.assets.filter(asset => !knownIds.has(asset.id));
    
    console.log(`Found ${newAssets.length} new audio files`);
    
    if (newAssets.length === 0) {
      return knownSongs;
    }
    
    // Get metadata cache
    const metadataCache = await getMetadataCache();
    
    // Process each new audio file
    const newSongs = await processSongBatch(newAssets, metadataCache);

    console.log(`Quick scan complete. Found ${newSongs.length} new songs.`);
    
    // Combine with existing songs and save
    const allSongs = [...knownSongs, ...newSongs];
    
    await updateMetadata({ 
      songs: allSongs, 
      lastScan: new Date().toISOString(),
      lastScanPath: newSongs.length > 0 ? newSongs[0].uri : lastScanPath
    });

    return allSongs;
  } catch (error) {
    console.error('Error in quick scan for music:', error);
    return [];
  }
};

// Save a file to the downloads directory
export const saveFileToDownloads = async (fileUri: string, fileName: string): Promise<string | null> => {
  try {
    const downloadsDir = await getDownloadsDirectory();
    const destinationUri = `${downloadsDir}/${fileName}`;
    
    await FileSystem.copyAsync({
      from: fileUri,
      to: destinationUri
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error saving file to downloads:', error);
    return null;
  }
};

// Delete a file from the downloads directory
export const deleteFileFromDownloads = async (fileName: string): Promise<boolean> => {
  try {
    const downloadsDir = await getDownloadsDirectory();
    const fileUri = `${downloadsDir}/${fileName}`;
    
    await FileSystem.deleteAsync(fileUri);
    return true;
  } catch (error) {
    console.error('Error deleting file from downloads:', error);
    return false;
  }
};

// Get all downloaded files
export const getDownloadedFiles = async (): Promise<string[]> => {
  try {
    const downloadsDir = await getDownloadsDirectory();
    const files = await FileSystem.readDirectoryAsync(downloadsDir);
    return files;
  } catch (error) {
    console.error('Error getting downloaded files:', error);
    return [];
  }
};

// Metadata management
export const getMetadata = async (): Promise<AppMetadata> => {
  try {
    const appDir = await getAppDirectory();
    const metadataPath = `${appDir}/${METADATA_FILE}`;
    const metadataString = await FileSystem.readAsStringAsync(metadataPath);
    return JSON.parse(metadataString);
  } catch (error) {
    console.error('Error getting metadata:', error);
    return {};
  }
};

export const updateMetadata = async (newData: Partial<AppMetadata>): Promise<boolean> => {
  try {
    const appDir = await getAppDirectory();
    const metadataPath = `${appDir}/${METADATA_FILE}`;
    
    // Get current metadata
    const currentMetadata = await getMetadata();
    
    // Merge with new data
    const updatedMetadata = { ...currentMetadata, ...newData };
    
    // Write back to file
    await FileSystem.writeAsStringAsync(
      metadataPath, 
      JSON.stringify(updatedMetadata)
    );
    
    return true;
  } catch (error) {
    console.error('Error updating metadata:', error);
    return false;
  }
};

// Calculate storage usage
export const getStorageUsage = async (): Promise<{ total: number; used: number }> => {
  try {
    const downloadsDir = await getDownloadsDirectory();
    const downloadsDirInfo = await FileSystem.getInfoAsync(downloadsDir);
    
    // This only works on Android
    if (Platform.OS === 'android' && downloadsDirInfo.exists) {
      // Get all files in the downloads directory
      const files = await FileSystem.readDirectoryAsync(downloadsDir);
      
      // Calculate total size
      let totalSize = 0;
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${downloadsDir}/${file}`);
        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }
      
      return {
        total: downloadsDirInfo.size || 0,
        used: totalSize
      };
    }
    
    // Fallback for iOS or if the above fails
    return {
      total: 0,
      used: 0
    };
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return {
      total: 0,
      used: 0
    };
  }
};