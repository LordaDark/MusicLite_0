import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Play, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SongItem from '@/components/SongItem';
import { artists, songs } from '@/constants/mockData';
import { usePlayerStore } from '@/store/playerStore';
import { useTheme } from '@/hooks/useTheme';

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setCurrentSong, setQueue } = usePlayerStore();
  const { colors } = useTheme();
  
  const artist = artists.find(a => a.id === id);
  const artistSongs = songs.filter(s => s.artist === artist?.name);
  
  if (!artist) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.text }]}>Artist not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      setCurrentSong(artistSongs[0]);
      setQueue(artistSongs.slice(1));
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['rgba(30,30,30,0.8)', colors.background]}
          style={styles.gradient}
        />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.artistHeader}>
            <Image
              source={{ uri: artist.image }}
              style={styles.artistImage}
              contentFit="cover"
              transition={300}
            />
            
            <View style={styles.artistInfo}>
              <Text style={[styles.artistName, { color: colors.text }]}>{artist.name}</Text>
              <Text style={[styles.artistGenres, { color: colors.subtext }]}>
                {artist.genres.join(' • ')}
              </Text>
              <Text style={[styles.artistStats, { color: colors.subtext }]}>
                {artistSongs.length} songs
              </Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayAll}
            >
              <Play color={colors.background} size={24} />
              <Text style={[styles.playButtonText, { color: colors.background }]}>Play All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.songsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Songs</Text>
            
            <FlatList
              data={artistSongs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongItem 
                  song={item} 
                  showArtist={false}
                />
              )}
              scrollEnabled={false}
            />
          </View>
          
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  artistHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  artistImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artistInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artistGenres: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  artistStats: {
    fontSize: 14,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  songsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
  },
  backLink: {
    fontSize: 16,
    marginTop: 16,
  },
});