import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { getMostPlayedSongs, getFavoriteGenres, getFavoriteArtists } from '@/services/recommendationService';
import { getListeningStats } from '@/services/chartService';
import { BarChart, PieChart } from '@/components/Charts';
import { ArrowLeft } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [mostPlayedSongs, setMostPlayedSongs] = useState<{songId: string, title: string, artist: string, count: number}[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<{genre: string, count: number}[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<{artist: string, count: number}[]>([]);
  const [listeningStats, setListeningStats] = useState<{day: string, minutes: number}[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get most played songs
        const songs = await getMostPlayedSongs(5);
        setMostPlayedSongs(songs);
        
        // Get favorite genres
        const genres = await getFavoriteGenres();
        setFavoriteGenres(genres);
        
        // Get favorite artists
        const artists = await getFavoriteArtists();
        setFavoriteArtists(artists);
        
        // Get listening stats
        const stats = await getListeningStats();
        setListeningStats(stats);
        
        // Check if we have any data
        setHasData(songs.length > 0 || genres.length > 0 || artists.length > 0);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Loading your stats"
          message="Please wait while we analyze your listening habits..."
          icon="music"
        />
      </View>
    );
  }
  
  if (!hasData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Not enough data"
          message="Listen to more music to see your stats. We'll analyze your listening habits as you use the app."
          icon="music"
          actionText="Back to Home"
          onAction={() => router.push('/')}
        />
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Your Listening Stats",
          headerLeft: () => (
            <ArrowLeft 
              size={24} 
              color={colors.text} 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            />
          ),
        }}
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Weekly Listening Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Weekly Listening Activity
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <BarChart 
              data={listeningStats}
              width={Dimensions.get('window').width - 48}
              height={200}
              barColor={colors.primary}
              textColor={colors.text}
            />
          </View>
        </View>
        
        {/* Top Songs */}
        {mostPlayedSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Most Played Songs
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {mostPlayedSongs.map((song, index) => (
                <View key={song.songId} style={styles.listItem}>
                  <Text style={[styles.listItemRank, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <View style={styles.listItemContent}>
                    <Text style={[styles.listItemTitle, { color: colors.text }]} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={[styles.listItemSubtitle, { color: colors.subtext }]} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </View>
                  <Text style={[styles.listItemCount, { color: colors.subtext }]}>
                    {song.count} plays
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Favorite Genres */}
        {favoriteGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favorite Genres
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <PieChart 
                data={favoriteGenres.slice(0, 5).map(item => ({
                  name: item.genre,
                  value: item.count,
                  color: getRandomColor(),
                }))}
                width={Dimensions.get('window').width - 48}
                height={200}
                textColor={colors.text}
              />
            </View>
          </View>
        )}
        
        {/* Favorite Artists */}
        {favoriteArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favorite Artists
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {favoriteArtists.slice(0, 5).map((artist, index) => (
                <View key={artist.artist} style={styles.listItem}>
                  <Text style={[styles.listItemRank, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <View style={styles.listItemContent}>
                    <Text style={[styles.listItemTitle, { color: colors.text }]} numberOfLines={1}>
                      {artist.artist}
                    </Text>
                  </View>
                  <Text style={[styles.listItemCount, { color: colors.subtext }]}>
                    {artist.count} plays
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

// Helper function to generate random colors for the pie chart
const getRandomColor = () => {
  const colors = [
    '#1DB954', // Spotify green
    '#9C27B0', // Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#009688', // Teal
    '#FF5722', // Deep Orange
    '#E91E63'  // Pink
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listItemRank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  listItemCount: {
    fontSize: 14,
    marginLeft: 8,
  },
});