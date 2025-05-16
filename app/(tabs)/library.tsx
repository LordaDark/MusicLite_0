import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, RefreshCw } from 'lucide-react-native';
import { useLibraryStore } from '@/store/libraryStore';
import MusicCard from '@/components/MusicCard';
import SongItem from '@/components/SongItem';
import SectionHeader from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { getUserPlaylists, createPlaylist } from '@/services/playlistService';
import EmptyState from '@/components/EmptyState';

export default function LibraryScreen() {
  const router = useRouter();
  const { downloadedSongs, likedSongs } = useLibraryStore();
  const [activeTab, setActiveTab] = useState<'playlists' | 'downloads' | 'liked'>('playlists');
  const { colors } = useTheme();
  const { isLoading, isRefreshing, refreshLibrary } = useMusicLibrary();
  const [userPlaylists, setUserPlaylists] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load user playlists
  const loadPlaylists = useCallback(async () => {
    try {
      const playlists = await getUserPlaylists();
      setUserPlaylists(playlists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  }, []);
  
  // Load playlists on mount
  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);
  
  const handlePlaylistPress = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };
  
  const handleCreatePlaylist = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Create Playlist",
        "Enter a name for your new playlist",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Create",
            onPress: (text) => {
              if (text) {
                createNewPlaylist(text);
              }
            }
          }
        ]
      );
    } else {
      // For Android, we'll use a simpler approach
      Alert.alert(
        "Create Playlist",
        "Enter a name for your new playlist",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Create",
            onPress: () => {
              // For simplicity, create with a default name on Android
              createNewPlaylist("New Playlist");
            }
          }
        ]
      );
    }
  };
  
  const createNewPlaylist = async (name: string) => {
    try {
      // Create a new playlist
      const newPlaylist = await createPlaylist(
        name, 
        "My custom playlist",
        []
      );
      
      if (newPlaylist) {
        loadPlaylists();
      } else {
        Alert.alert("Error", "Failed to create playlist");
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert("Error", "Failed to create playlist");
    }
  };
  
  const handleRefreshLibrary = async () => {
    setRefreshing(true);
    await refreshLibrary();
    await loadPlaylists();
    setRefreshing(false);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <EmptyState
          title="Loading your music"
          message="Please wait while we scan your device for music..."
          icon="music"
        />
      );
    }
    
    switch (activeTab) {
      case 'playlists':
        return (
          <>
            <View style={styles.createPlaylistContainer}>
              <TouchableOpacity 
                style={[styles.createPlaylistButton, { backgroundColor: colors.card }]}
                onPress={handleCreatePlaylist}
              >
                <Plus size={24} color={colors.text} />
                <Text style={[styles.createPlaylistText, { color: colors.text }]}>Create Playlist</Text>
              </TouchableOpacity>
            </View>
            
            {userPlaylists.length > 0 ? (
              <View style={styles.playlistsGrid}>
                {userPlaylists.map((playlist) => (
                  <MusicCard
                    key={playlist.id}
                    item={playlist}
                    songs={playlist.songs}
                    onPress={() => handlePlaylistPress(playlist.id)}
                    size="medium"
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No playlists yet"
                message="Create your first playlist to organize your music"
                icon="plus"
              />
            )}
          </>
        );
      
      case 'downloads':
        return downloadedSongs.length > 0 ? (
          <>
            <View style={styles.refreshContainer}>
              <TouchableOpacity 
                style={[styles.refreshButton, { backgroundColor: colors.card }]}
                onPress={handleRefreshLibrary}
              >
                <RefreshCw size={18} color={colors.text} />
                <Text style={[styles.refreshText, { color: colors.text }]}>Refresh Library</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={downloadedSongs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongItem 
                  song={item} 
                  showDownload={false}
                />
              )}
              scrollEnabled={false}
            />
          </>
        ) : (
          <EmptyState
            title="No music found"
            message="Add music to your device or search for songs to download"
            icon="music-off"
            actionText="Search for music"
            onAction={() => router.push('/search')}
          />
        );
      
      case 'liked':
        const likedSongsList = downloadedSongs.filter(song => likedSongs.includes(song.id));
        
        return likedSongsList.length > 0 ? (
          <FlatList
            data={likedSongsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SongItem song={item} />}
            scrollEnabled={false}
          />
        ) : (
          <EmptyState
            title="No liked songs yet"
            message="Songs you like will appear here"
            icon="music"
          />
        );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'playlists' && [styles.activeTabButton, { backgroundColor: colors.card }]
          ]}
          onPress={() => setActiveTab('playlists')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: colors.subtext },
              activeTab === 'playlists' && { color: colors.text }
            ]}
          >
            Playlists
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'downloads' && [styles.activeTabButton, { backgroundColor: colors.card }]
          ]}
          onPress={() => setActiveTab('downloads')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: colors.subtext },
              activeTab === 'downloads' && { color: colors.text }
            ]}
          >
            Downloads
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'liked' && [styles.activeTabButton, { backgroundColor: colors.card }]
          ]}
          onPress={() => setActiveTab('liked')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: colors.subtext },
              activeTab === 'liked' && { color: colors.text }
            ]}
          >
            Liked
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || isRefreshing} 
            onRefresh={handleRefreshLibrary} 
          />
        }
      >
        {renderContent()}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabButton: {
    
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  createPlaylistContainer: {
    padding: 16,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  createPlaylistText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  refreshContainer: {
    padding: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});