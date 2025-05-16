import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronDown, Heart, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import PlayerControls from '@/components/PlayerControls';
import { useTheme } from '@/hooks/useTheme';

export default function PlayerScreen() {
  const router = useRouter();
  const { currentSong, isPlaying, restorePlayer, queue } = usePlayerStore();
  const { toggleLikeSong, isLiked } = useLibraryStore();
  const { colors } = useTheme();
  const [liked, setLiked] = useState(false);
  
  useEffect(() => {
    if (currentSong) {
      setLiked(isLiked(currentSong.id));
      // Ensure the mini player is restored when navigating to the full player
      restorePlayer();
    }
  }, [currentSong, isLiked, restorePlayer]);
  
  const handleLike = () => {
    if (currentSong) {
      toggleLikeSong(currentSong.id);
      setLiked(!liked);
    }
  };
  
  const handleShare = () => {
    // In a real app, this would share the song
    console.log('Share song:', currentSong?.title);
  };
  
  if (!currentSong) {
    router.back();
    return null;
  }
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', colors.background]}
        style={styles.gradient}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronDown size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Now Playing</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.albumContainer}>
        <Image
          source={{ uri: currentSong.coverArt }}
          style={styles.albumArt}
          contentFit="cover"
          transition={300}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <View style={styles.titleTextContainer}>
            <Text style={[styles.songTitle, { color: colors.text }]}>{currentSong.title}</Text>
            <Text style={[styles.artistName, { color: colors.subtext }]}>{currentSong.artist}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={handleLike}
          >
            <Heart 
              size={24} 
              color={liked ? colors.primary : colors.text} 
              fill={liked ? colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        
        <PlayerControls />
        
        <View style={styles.additionalInfo}>
          <Text style={[styles.albumName, { color: colors.subtext }]}>
            Album: {currentSong.album}
          </Text>
          <Text style={[styles.genreText, { color: colors.subtext }]}>
            Genre: {currentSong.genre}
          </Text>
        </View>
        
        {queue.length > 0 && (
          <View style={styles.queueContainer}>
            <Text style={[styles.queueTitle, { color: colors.text }]}>
              Next in Queue ({queue.length})
            </Text>
            
            {queue.slice(0, 3).map((song, index) => (
              <View key={song.id} style={styles.queueItem}>
                <Text style={[styles.queueNumber, { color: colors.subtext }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.queueSongTitle, { color: colors.text }]} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={[styles.queueArtist, { color: colors.subtext }]} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>
            ))}
            
            {queue.length > 3 && (
              <Text style={[styles.moreInQueue, { color: colors.subtext }]}>
                +{queue.length - 3} more songs
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  albumContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 18,
  },
  likeButton: {
    padding: 8,
    marginTop: 4,
  },
  additionalInfo: {
    marginTop: 32,
    marginBottom: 24,
  },
  albumName: {
    fontSize: 14,
    marginBottom: 4,
  },
  genreText: {
    fontSize: 14,
  },
  queueContainer: {
    marginTop: 16,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueNumber: {
    width: 24,
    fontSize: 14,
    textAlign: 'center',
  },
  queueSongTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  queueArtist: {
    fontSize: 12,
    marginLeft: 8,
    width: 100,
    textAlign: 'right',
  },
  moreInQueue: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});