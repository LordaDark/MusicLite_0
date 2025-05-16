import { Song } from '@/types/music';
import { trpcClient } from '@/lib/trpc';
import { Platform } from 'react-native';

// Estrae metadati dal nome del file in modo intelligente
export const extractMetadataFromFilename = (filename: string): Partial<Song> => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  const patterns = [
    /^(.*?)\s*-\s*(.*?)$/,                // Artista - Titolo
    /^(.*?)_(.*?)$/,                      // Artista_Titolo
    /^(.*?)\s*\(\s*(.*?)\s*\)$/,          // Titolo (Artista)
    /^(.*?)\s*ft\.\s*(.*?)$/i,            // Titolo ft. Artista
    /^(.*?)\s*feat\.\s*(.*?)$/i           // Titolo feat. Artista
  ];
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        return {
          artist: match[1].trim(),
          title: match[2].trim()
        };
      } else if (pattern === patterns[2] || pattern === patterns[3] || pattern === patterns[4]) {
        return {
          title: match[1].trim(),
          artist: match[2].trim()
        };
      } else {
        return {
          artist: match[1].trim(),
          title: match[2].trim()
        };
      }
    }
  }

  return {
    title: nameWithoutExt,
    artist: 'Unknown Artist'
  };
};

// Cerca metadati su YouTube basandosi sul nome del file
export const enrichMetadataFromYouTube = async (
  partialSong: Partial<Song>
): Promise<Partial<Song>> => {
  try {
    const searchQuery = partialSong.artist && partialSong.artist !== 'Unknown Artist'
      ? `${partialSong.artist} ${partialSong.title}`
      : partialSong.title;
    
    const searchResults = await trpcClient.youtube.search.query({
      query: searchQuery,
      limit: 1
    });
    
    if (searchResults.results && searchResults.results.length > 0) {
      const bestMatch = searchResults.results[0];
      const defaultCover = getDefaultCoverArt();
      
      return {
        ...partialSong,
        artist: bestMatch.artist ?? partialSong.artist,
        album: bestMatch.album ?? 'Unknown Album',
        genre: bestMatch.genre ?? 'Unknown',
        coverArt: bestMatch.thumbnail ?? defaultCover,
        youtubeId: bestMatch.id
      };
    }
    
    return {
      ...partialSong,
      coverArt: partialSong.coverArt ?? getDefaultCoverArt()
    };
  } catch (error) {
    console.error('Error enriching metadata from YouTube:', error);
    return {
      ...partialSong,
      coverArt: partialSong.coverArt ?? getDefaultCoverArt()
    };
  }
};

// Ottiene metadati completi per una canzone
export const getCompleteMetadata = async (
  filename: string,
  uri: string
): Promise<Partial<Song>> => {
  try {
    try {
      const backendMetadata = await trpcClient.metadata.extract.query({
        filePath: uri
      });
      
      if (backendMetadata.success) {
        const defaultCover = getDefaultCoverArt();
        
        return {
          title: backendMetadata.title ?? filename,
          artist: backendMetadata.artist ?? 'Unknown Artist',
          album: backendMetadata.album ?? 'Unknown Album',
          genre: backendMetadata.genre ?? 'Unknown',
          duration: backendMetadata.duration ?? 0,
          coverArt: backendMetadata.coverArt ?? defaultCover
        };
      }
    } catch (backendError) {
      console.log('Backend metadata extraction failed, falling back to filename parsing');
    }
    
    const filenameMetadata = extractMetadataFromFilename(filename);
    
    if (Platform.OS !== 'web') {
      return await enrichMetadataFromYouTube(filenameMetadata);
    }
    
    return {
      ...filenameMetadata,
      coverArt: getDefaultCoverArt()
    };
  } catch (error) {
    console.error('Error getting complete metadata:', error);
    return {
      title: filename,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      genre: 'Unknown',
      coverArt: getDefaultCoverArt()
    };
  }
};

// Genera un'immagine di copertina basata sul nome dell'artista e del titolo
export const getDefaultCoverArt = (): string => {
  const colors = [
    '1DB954', '9C27B0', '3F51B5',
    '2196F3', '009688', 'FF5722', 'E91E63'
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return `https://via.placeholder.com/400/${randomColor}/FFFFFF`;
};

// Aggiorna i metadati di una canzone esistente
export const updateSongMetadata = async (song: Song): Promise<Song> => {
  try {
    if (
      song.artist !== 'Unknown Artist' && 
      song.album !== 'Unknown Album' && 
      song.genre !== 'Unknown'
    ) {
      return song;
    }
    
    const enrichedMetadata = await enrichMetadataFromYouTube({
      title: song.title,
      artist: song.artist
    });
    
    return {
      ...song,
      artist: enrichedMetadata.artist ?? song.artist,
      album: enrichedMetadata.album ?? song.album,
      genre: enrichedMetadata.genre ?? song.genre,
      coverArt: enrichedMetadata.coverArt ?? song.coverArt ?? getDefaultCoverArt(),
      youtubeId: enrichedMetadata.youtubeId
    };
  } catch (error) {
    console.error('Error updating song metadata:', error);
    return song;
  }
};

// Batch update di metadati per più canzoni
export const batchUpdateMetadata = async (songs: Song[]): Promise<Song[]> => {
  const updatedSongs: Song[] = [];
  const batchSize = 3;

  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize);
    const updates = await Promise.all(
      batch.map(song => updateSongMetadata(song))
    );
    updatedSongs.push(...updates);
  }

  return updatedSongs;
};