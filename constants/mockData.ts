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
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt: string;
  songs: Song[];
  isGenerated: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  genres: string[];
}

export const songs: Song[] = [
  {
    id: '1',
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 203,
    coverArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop",
    genre: "Pop",
    isDownloaded: true
  },
  {
    id: '2',
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 215,
    coverArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop",
    genre: "Pop",
    isDownloaded: true
  },
  {
    id: '3',
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 203,
    coverArt: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=400&auto=format&fit=crop",
    genre: "Pop",
    isDownloaded: false
  },
  {
    id: '4',
    title: "Don't Start Now",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 183,
    coverArt: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=400&auto=format&fit=crop",
    genre: "Pop",
    isDownloaded: true
  },
  {
    id: '5',
    title: "Circles",
    artist: "Post Malone",
    album: "Hollywood's Bleeding",
    duration: 215,
    coverArt: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=400&auto=format&fit=crop",
    genre: "Hip-Hop",
    isDownloaded: false
  },
  {
    id: '6',
    title: "Sunflower",
    artist: "Post Malone & Swae Lee",
    album: "Spider-Man: Into the Spider-Verse",
    duration: 158,
    coverArt: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=400&auto=format&fit=crop",
    genre: "Hip-Hop",
    isDownloaded: true
  },
  {
    id: '7',
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: 174,
    coverArt: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?q=80&w=400&auto=format&fit=crop",
    genre: "Pop",
    isDownloaded: true
  },
  {
    id: '8',
    title: "Adore You",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: 207,
    coverArt: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?q=80&w=400&auto=format&fit=crop",
    genre: "Pop",
    isDownloaded: false
  },
  {
    id: '9',
    title: "Bad Guy",
    artist: "Billie Eilish",
    album: "When We All Fall Asleep, Where Do We Go?",
    duration: 194,
    coverArt: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?q=80&w=400&auto=format&fit=crop",
    genre: "Alternative",
    isDownloaded: true
  },
  {
    id: '10',
    title: "Therefore I Am",
    artist: "Billie Eilish",
    album: "Happier Than Ever",
    duration: 174,
    coverArt: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?q=80&w=400&auto=format&fit=crop",
    genre: "Alternative",
    isDownloaded: false
  }
];

export const playlists: Playlist[] = [
  {
    id: '1',
    name: "Today's Top Hits",
    description: "The most popular songs right now",
    coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    songs: [songs[0], songs[2], songs[4], songs[6], songs[8]],
    isGenerated: false
  },
  {
    id: '2',
    name: "Chill Vibes",
    description: "Relaxing tunes for your downtime",
    coverArt: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=400&auto=format&fit=crop",
    songs: [songs[1], songs[3], songs[5], songs[7], songs[9]],
    isGenerated: false
  },
  {
    id: '3',
    name: "Morning Boost",
    description: "Start your day with energy",
    coverArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
    songs: [songs[0], songs[3], songs[6], songs[9]],
    isGenerated: true
  },
  {
    id: '4',
    name: "Evening Relaxation",
    description: "Wind down after a long day",
    coverArt: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    songs: [songs[1], songs[4], songs[7], songs[8]],
    isGenerated: true
  },
  {
    id: '5',
    name: "Workout Mix",
    description: "Keep your energy high while exercising",
    coverArt: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop",
    songs: [songs[0], songs[2], songs[5], songs[7]],
    isGenerated: false
  },
  {
    id: '6',
    name: "Focus Mode",
    description: "Concentration and productivity boost",
    coverArt: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop",
    songs: [songs[1], songs[3], songs[5], songs[9]],
    isGenerated: true
  }
];

export const artists: Artist[] = [
  {
    id: '1',
    name: "The Weeknd",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
    genres: ["Pop", "R&B"]
  },
  {
    id: '2',
    name: "Dua Lipa",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    genres: ["Pop", "Dance"]
  },
  {
    id: '3',
    name: "Post Malone",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    genres: ["Hip-Hop", "Pop"]
  },
  {
    id: '4',
    name: "Harry Styles",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    genres: ["Pop", "Rock"]
  },
  {
    id: '5',
    name: "Billie Eilish",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop",
    genres: ["Alternative", "Pop"]
  }
];

export const genres = [
  "Pop", "Hip-Hop", "R&B", "Rock", "Alternative", "Electronic", "Dance", "Jazz", "Classical", "Country"
];

export const recentlyPlayed = [songs[0], songs[3], songs[6], songs[9], songs[2]];