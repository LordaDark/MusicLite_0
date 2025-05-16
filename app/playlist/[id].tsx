import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Play, Heart, MoreVertical, ArrowLeft, Trash, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SongItem from '@/components/SongItem';
import { usePlayerStore } from '@/store/playerStore';
import { useTheme } from '@/hooks/useTheme';
import { getPlaylistById, deletePlaylist, addSongToPlaylist } from '@/services/playlistService';
import { Playlist } from '@/types/music';
import EmptyState from '@/components/EmptyState';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setCurrentSong, setQueue } = usePlayerStore();
  const { colors } = useTheme();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { localSongs } = useMusicLibrary();
  
  // Load playlist data
  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoading(true);
      try {
        const playlistData = await getPlaylistById(id);
        setPlaylist(playlistData);
      } catch (error) {
        console.error('Error loading playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadPlaylist();
    }
  }, [id]);
  
  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0]);
      setQueue(playlist.songs.slice(1));
    }
  };
  
  const handleDeletePlaylist = () => {
    if (!playlist || playlist.isGenerated) return;
    
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deletePlaylist(playlist.id);
              if (success) {
                router.back();
              } else {
                Alert.alert("Error", "Failed to delete playlist");
              }
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert("Error", "Failed to delete playlist");
            }
          }
        }
      ]
    );
  };
  
  const handleAddSongs = () => {
    if (!playlist || playlist.isGenerated) return;
    
    // Show a list of songs to add
    Alert.alert(
      "Add Songs",
      "Choose songs to add to this playlist",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Show All Songs",
          onPress: () => {
            // Navigate to a song selection screen or show a modal
            // For now, we'll just add a random song as an example
            if (localSongs.length > 0) {
              const randomSong = localSongs[Math.floor(Math.random() * localSongs.length)];
              addSongToPlaylist(playlist.id, randomSong)
                .then(success => {
                  if (success) {
                    // Reload the playlist
                    getPlaylistById(id).then(updatedPlaylist => {
                      if (updatedPlaylist) {
                        setPlaylist(updatedPlaylist);
                      }
                    });
                  } else {
                    Alert.alert("Error", "Failed to add song to playlist");
                  }
                });
            } else {
              Alert.alert("No Songs", "No songs available to add");
            }
          }
        }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Loading playlist"
          message="Please wait..."
          icon="music"
        />
      </View>
    );
  }
  
  if (!playlist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Playlist not found"
          message="The playlist you're looking for doesn't exist or was deleted"
          icon="alert"
          actionText="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }
  
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
          <View style={styles.playlistHeader}>
            <Image
              source={{ uri: playlist.coverArt }}
              style={styles.playlistImage}
              contentFit="cover"
              transition={300}
            />
            
            <View style={styles.playlistInfo}>
              <Text style={[styles.playlistName, { color: colors.text }]}>{playlist.name}</Text>
              <Text style={[styles.playlistDescription, { color: colors.subtext }]}>{playlist.description}</Text>
              <Text style={[styles.playlistStats, { color: colors.subtext }]}>
                {playlist.songs.length} songs
              </Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            {!playlist.isGenerated && (
              <>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleDeletePlaylist}
                >
                  <Trash size={24} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleAddSongs}
                >
                  <Plus size={24} color={colors.text} />
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity style={styles.iconButton}>
              <MoreVertical size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayAll}
              disabled={playlist.songs.length === 0}
            >
              <Play color={colors.background} size={24} />
              <Text style={[styles.playButtonText, { color: colors.background }]}>Play All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.songsContainer}>
            {playlist.songs.length > 0 ? (
              <FlatList
                data={playlist.songs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <SongItem song={item} />}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState
                title="No songs in this playlist"
                message={playlist.isGenerated 
                  ? "This playlist will be filled with songs based on your listening habits" 
                  : "Add songs to this playlist from your library or search"
                }
                icon="music"
                actionText={!playlist.isGenerated ? "Add Songs" : undefined}
                onAction={!playlist.isGenerated ? handleAddSongs : undefined}
              />
            )}
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
    flexGrow: 1,
  },
  playlistHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  playlistImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playlistInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playlistDescription: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  playlistStats: {
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
  iconButton: {
    padding: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginLeft: 16,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  songsContainer: {
    marginTop: 24,
    flex: 1,
  },
});