import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Play, Pause, SkipForward, X } from 'lucide-react-native';
import { usePlayerStore } from '@/store/playerStore';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const MiniPlayer: React.FC = () => {
  const { currentSong, isPlaying, togglePlay, playNext, progress, duration, isMinimized, closePlayer } = usePlayerStore();
  const router = useRouter();
  const { colors } = useTheme();
  const [progressWidth, setProgressWidth] = useState(0);
  
  useEffect(() => {
    if (duration > 0) {
      setProgressWidth((progress / duration) * 100);
    } else {
      setProgressWidth(0);
    }
  }, [progress, duration]);
  
  if (!currentSong) {
    return null;
  }
  
  if (isMinimized) {
    return null;
  }
  
  const handlePress = () => {
    router.push('/player');
  };

  const handleClose = () => {
    closePlayer();
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.player,
          borderTopColor: colors.border
        }
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progressWidth}%`,
              backgroundColor: colors.primary
            }
          ]} 
        />
      </View>
      
      <View style={styles.content}>
        <Image
          source={{ uri: currentSong.coverArt }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={[styles.artist, { color: colors.subtext }]} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isPlaying ? (
              <Pause color={colors.text} size={24} />
            ) : (
              <Play color={colors.text} size={24} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={(e) => {
              e.stopPropagation();
              playNext();
            }}
          >
            <SkipForward color={colors.text} size={24} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <X color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Positioned above the tab bar
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'transparent',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  artist: {
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default MiniPlayer;