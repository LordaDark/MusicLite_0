import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';
import MusicCard from '@/components/MusicCard';
import SongItem from '@/components/SongItem';
import SectionHeader from '@/components/SectionHeader';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { getUserPlaylists, getGeneratedPlaylists } from '@/services/playlistService';
import { hasEnoughDataForRecommendations } from '@/services/recommendationService';
import EmptyState from '@/components/EmptyState';
import { Shuffle, Play } from 'lucide-react-native';
import { playRandomSong } from '@/services/audioService';

export default function HomeScreen() {
  const router = useRouter();
  const { setCurrentSong, setQueue } = usePlayerStore();
  const { colors } = useTheme();
  const { localSongs, isLoading, isRefreshing, quickRefresh } = useMusicLibrary();
  
  const [recentlyPlayed, setRecentlyPlayed] = React.useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = React.useState<any[]>([]);
  const [generatedPlaylists, setGeneratedPlaylists] = React.useState<any[]>([]);
  const [hasRecommendations, setHasRecommendations] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Load playlists and recommendations
  const loadData = useCallback(async () => {
    try {
      // Get user playlists
      const userPlaylistsData = await getUserPlaylists();
      setUserPlaylists(userPlaylistsData);
      
      // Get generated playlists
      const generatedPlaylistsData = await getGeneratedPlaylists();
      setGeneratedPlaylists(generatedPlaylistsData);
      
      // Check if we have enough data for recommendations
      const hasEnoughData = await hasEnoughDataForRecommendations();
      setHasRecommendations(hasEnoughData);
      
      // Get recently played from metadata
      // For now, just use the first 5 songs as "recently played"
      setRecentlyPlayed(localSongs.slice(0, 5));
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load your music data');
    }
  }, [localSongs]);
  
  // Load data when songs change
  useEffect(() => {
    if (localSongs.length > 0) {
      loadData();
    }
  }, [localSongs, loadData]);
  
  const handlePlaylistPress = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };
  
  const handleSongPress = (index: number) => {
    if (recentlyPlayed.length > 0) {
      setCurrentSong(recentlyPlayed[index]);
      setQueue(recentlyPlayed.slice(index + 1));
    }
  };
  
  const handlePlayRandom = () => {
    if (localSongs.length > 0) {
      playRandomSong(localSongs);
    } else {
      Alert.alert('No Music', 'No songs available to play');
    }
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await quickRefresh();
    await loadData();
    setRefreshing(false);
  }, [quickRefresh, loadData]);
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Loading your music"
          message="Please wait while we scan your device for music..."
          icon="music"
        />
      </View>
    );
  }
  
  if (localSongs.length === 0) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <EmptyState
          title="No music found"
          message="We couldn't find any music on your device. Try adding some music or search for songs to download."
          icon="music-off"
          actionText="Search for music"
          onAction={() => router.push('/search')}
        />
      </ScrollView>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing || isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={[styles.greeting, { color: colors.text }]}>Good evening</Text>
        <Text style={[styles.welcomeText, { color: colors.subtext }]}>Welcome to MusicLite</Text>
      </View>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.shuffleButton, { backgroundColor: colors.primary }]}
          onPress={handlePlayRandom}
        >
          <Shuffle size={20} color={colors.background} />
          <Text style={[styles.shuffleText, { color: colors.background }]}>
            Shuffle Play
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: colors.card }]}
          onPress={() => {
            if (localSongs.length > 0) {
              setCurrentSong(localSongs[0]);
              setQueue(localSongs.slice(1));
            }
          }}
        >
          <Play size={20} color={colors.text} />
          <Text style={[styles.playText, { color: colors.text }]}>
            Play All
          </Text>
        </TouchableOpacity>
      </View>
      
      {recentlyPlayed.length > 0 && (
        <>
          <SectionHeader title="Recently Played" />
          <FlatList
            data={recentlyPlayed}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SongItem 
                song={item} 
                onPress={() => handleSongPress(index)}
              />
            )}
            scrollEnabled={false}
          />
        </>
      )}
      
      {generatedPlaylists.length > 0 ? (
        <>
          <SectionHeader 
            title="Made For You" 
            onSeeAll={() => router.push('/playlists/generated')}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {generatedPlaylists.map((playlist) => (
              <MusicCard
                key={playlist.id}
                item={playlist}
                songs={playlist.songs}
                onPress={() => handlePlaylistPress(playlist.id)}
                size="medium"
              />
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <SectionHeader title="Made For You" />
          <View style={styles.emptyRecommendations}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {hasRecommendations 
                ? "Creating your personalized playlists..." 
                : "Listen to more music to get personalized recommendations"}
            </Text>
          </View>
        </>
      )}
      
      {userPlaylists.length > 0 ? (
        <>
          <SectionHeader 
            title="Your Playlists" 
            onSeeAll={() => router.push('/playlists/user')}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {userPlaylists.map((playlist) => (
              <MusicCard
                key={playlist.id}
                item={playlist}
                songs={playlist.songs}
                onPress={() => handlePlaylistPress(playlist.id)}
                size="medium"
              />
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <SectionHeader title="Your Playlists" />
          <View style={styles.emptyRecommendations}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              You haven't created any playlists yet
            </Text>
          </View>
        </>
      )}
      
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flex: 1,
  },
  shuffleText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flex: 1,
  },
  playText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  emptyRecommendations: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
});