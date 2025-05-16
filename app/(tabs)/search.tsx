import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/SearchBar';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import SectionHeader from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { searchYouTube, streamAndDownload } from '@/services/youtubeService';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { getFavoriteGenres } from '@/services/recommendationService';
import { Song } from '@/types/music';
import EmptyState from '@/components/EmptyState';
import { usePlayerStore } from '@/store/playerStore';

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { localSongs } = useMusicLibrary();
  const { setCurrentSong, setQueue } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<{genre: string, count: number}[]>([]);
  const [localResults, setLocalResults] = useState<Song[]>([]);
  
  // Load favorite genres
  useEffect(() => {
    const loadGenres = async () => {
      const genres = await getFavoriteGenres();
      setFavoriteGenres(genres.length > 0 ? genres : [
        { genre: 'Pop', count: 0 },
        { genre: 'Rock', count: 0 },
        { genre: 'Hip-Hop', count: 0 },
        { genre: 'Electronic', count: 0 },
        { genre: 'Classical', count: 0 },
        { genre: 'Jazz', count: 0 },
        { genre: 'Country', count: 0 },
        { genre: 'R&B', count: 0 },
      ]);
    };
    
    loadGenres();
  }, []);
  
  // Search local songs
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setLocalResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    const filteredSongs = localSongs.filter(
      song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    );
    
    setLocalResults(filteredSongs);
  }, [searchQuery, localSongs]);
  
  // Search YouTube
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchYouTube(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching YouTube:', error);
      Alert.alert('Error', 'Failed to search YouTube. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setLocalResults([]);
  };
  
  const handleGenrePress = (genre: string) => {
    setSearchQuery(genre);
  };
  
  const handleLocalSongPress = (index: number) => {
    if (localResults.length > 0) {
      setCurrentSong(localResults[index]);
      setQueue(localResults.slice(index + 1));
    }
  };
  
  const handleYouTubeSongPress = async (song: Song) => {
    if (song.youtubeId) {
      setIsSearching(true);
      try {
        // Stream and download the song
        const success = await streamAndDownload(song.youtubeId);
        if (!success) {
          Alert.alert('Error', 'Failed to play the song. Please try again.');
        }
      } catch (error) {
        console.error('Error playing YouTube song:', error);
        Alert.alert('Error', 'Failed to play the song. Please try again.');
      } finally {
        setIsSearching(false);
      }
    } else {
      // If no YouTube ID, try to play directly
      setCurrentSong(song);
    }
  };
  
  const renderGenreItem = ({ item }: { item: {genre: string, count: number} }) => (
    <TouchableOpacity 
      style={[styles.genreItem, { backgroundColor: colors.card }]}
      onPress={() => handleGenrePress(item.genre)}
    >
      <Text style={[styles.genreText, { color: colors.text }]}>{item.genre}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
      />
      
      {searchQuery.trim() === '' ? (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <SectionHeader title="Browse Genres" />
          <FlatList
            data={favoriteGenres}
            keyExtractor={(item) => item.genre}
            renderItem={renderGenreItem}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.genreList}
          />
          
          <View style={{ height: 80 }} />
        </ScrollView>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}
        >
          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subtext }]}>
                Searching...
              </Text>
            </View>
          )}
          
          {localResults.length > 0 && (
            <>
              <SectionHeader title="On Your Device" />
              <FlatList
                data={localResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <SongItem 
                    song={item} 
                    onPress={() => handleLocalSongPress(index)}
                  />
                )}
                scrollEnabled={false}
              />
            </>
          )}
          
          {searchResults.length > 0 && (
            <>
              <SectionHeader title="From YouTube" />
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongItem 
                    song={item} 
                    onPress={() => handleYouTubeSongPress(item)}
                  />
                )}
                scrollEnabled={false}
              />
            </>
          )}
          
          {!isSearching && localResults.length === 0 && searchResults.length === 0 && (
            <EmptyState
              title="No results found"
              message={`No results found for "${searchQuery}". Try a different search term.`}
              icon="search"
            />
          )}
          
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  resultsContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  genreList: {
    paddingHorizontal: 8,
  },
  genreItem: {
    flex: 1,
    margin: 8,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});