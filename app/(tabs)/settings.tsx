import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { ChevronRight, Wifi, Moon, Sun, Info, Database, Trash2, BarChart2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { getStorageUsage, initializeFileSystem } from '@/services/fileService';
import { formatBytes } from '@/utils/formatUtils';
import { hasEnoughDataForRecommendations } from '@/services/recommendationService';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { toggleTheme } = useThemeStore();
  const [downloadOnWifi, setDownloadOnWifi] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecommendationData, setHasRecommendationData] = useState(false);
  
  // Load storage usage and recommendation data on mount
  useEffect(() => {
    loadStorageUsage();
    checkRecommendationData();
  }, []);
  
  const loadStorageUsage = async () => {
    setIsLoading(true);
    try {
      // Initialize file system first
      await initializeFileSystem();
      
      // Get storage usage
      const usage = await getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error loading storage usage:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkRecommendationData = async () => {
    try {
      const hasEnoughData = await hasEnoughDataForRecommendations();
      setHasRecommendationData(hasEnoughData);
    } catch (error) {
      console.error('Error checking recommendation data:', error);
    }
  };
  
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove all temporary files. Your downloaded music will not be affected.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          onPress: () => {
            // In a real app, this would clear the cache
            Alert.alert("Cache Cleared", "All temporary files have been removed.");
            loadStorageUsage();
          }
        }
      ]
    );
  };
  
  const handleViewListeningData = () => {
    router.push('/analytics');
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Playback</Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Wifi size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Download on Wi-Fi only</Text>
          </View>
          <Switch
            value={downloadOnWifi}
            onValueChange={setDownloadOnWifi}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Wifi size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Offline Mode</Text>
          </View>
          <Switch
            value={offlineMode}
            onValueChange={setOfflineMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Display</Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            {isDark ? (
              <Moon size={20} color={colors.text} />
            ) : (
              <Sun size={20} color={colors.text} />
            )}
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Your Data</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleViewListeningData}
        >
          <View style={styles.settingInfo}>
            <BarChart2 size={20} color={colors.text} />
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>Listening Stats</Text>
              <Text style={[styles.settingSubtext, { color: colors.subtext }]}>
                View your listening history and stats
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Storage</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={loadStorageUsage}
        >
          <View style={styles.settingInfo}>
            <Database size={20} color={colors.text} />
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>Downloaded Music</Text>
              <Text style={[styles.settingSubtext, { color: colors.subtext }]}>
                {isLoading ? 'Loading...' : `${formatBytes(storageUsage.used)} used`}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleClearCache}
        >
          <View style={styles.settingInfo}>
            <Trash2 size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Clear Cache</Text>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>About</Text>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Info size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>App Version</Text>
          </View>
          <Text style={[styles.versionText, { color: colors.subtext }]}>1.0.0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Info size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Terms of Service</Text>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Info size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingSubtext: {
    fontSize: 12,
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
  },
});