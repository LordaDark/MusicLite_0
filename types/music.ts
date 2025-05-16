export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverArt: string;
  genre: string;
  isDownloaded: boolean;
  uri?: string; // Local or remote URI for the audio file
  localUri?: string; // Local file URI for downloaded songs
  source?: 'local' | 'youtube' | 'other';
  youtubeId?: string;
  downloadDate?: string;
  metadata?: Record<string, any>;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt: string;
  songs: Song[];
  isGenerated: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  genres: string[];
}

export interface PlayHistory {
  songId: string;
  title: string;
  artist: string;
  genre?: string;
  timestamp: string;
}

export interface AppMetadata {
  songs?: Song[];
  userPlaylists?: Playlist[];
  generatedPlaylists?: Playlist[];
  playHistory?: PlayHistory[];
  lastScan?: string;
  [key: string]: any;
}