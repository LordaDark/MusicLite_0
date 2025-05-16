import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { usePlayerStore } from '@/store/playerStore';
import { Song } from '@/types/music';
import { useTheme } from '@/hooks/useTheme';

interface MusicCardProps {
  item: {
    id: string;
    title?: string;
    name?: string;
    coverArt: string;
    description?: string;
    artist?: string;
  };
  songs?: Song[];
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

const MusicCard: React.FC<MusicCardProps> = ({ 
  item, 
  songs, 
  onPress, 
  size = 'medium' 
}) => {
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);
  const setQueue = usePlayerStore(state => state.setQueue);
  const { colors } = useTheme();
  
  const handlePlay = (e: any) => {
    e.stopPropagation();
    if (songs && songs.length > 0) {
      setCurrentSong(songs[0]);
      setQueue(songs.slice(1));
    }
  };
  
  const getCardSize = () => {
    const width = Dimensions.get('window').width;
    switch (size) {
      case 'small':
        return { width: width * 0.3, height: width * 0.3 };
      case 'large':
        return { width: width * 0.5, height: width * 0.5 };
      case 'medium':
      default:
        return { width: width * 0.4, height: width * 0.4 };
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        getCardSize(),
        { backgroundColor: colors.card }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.coverArt }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={handlePlay}
        >
          <Play color={colors.background} size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
          {item.artist || item.description || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: '20%',
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 8,
    height: '20%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default MusicCard;