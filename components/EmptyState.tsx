import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Music, AlertCircle, Search, Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: 'music' | 'music-off' | 'search' | 'plus' | 'alert';
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'alert',
  actionText,
  onAction,
}) => {
  const { colors } = useTheme();
  
  const renderIcon = () => {
    const iconSize = 64;
    const iconColor = colors.subtext;
    
    switch (icon) {
      case 'music':
        return <Music size={iconSize} color={iconColor} />;
      case 'music-off':
        // Using regular Music icon with a slash overlay since MusicOff doesn't exist
        return (
          <View style={styles.iconWithSlash}>
            <Music size={iconSize} color={iconColor} />
            <View style={[styles.slash, { backgroundColor: iconColor }]} />
          </View>
        );
      case 'search':
        return <Search size={iconSize} color={iconColor} />;
      case 'plus':
        return <Plus size={iconSize} color={iconColor} />;
      case 'alert':
      default:
        return <AlertCircle size={iconSize} color={iconColor} />;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: colors.subtext }]}>
        {message}
      </Text>
      
      {actionText && onAction && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
        >
          <Text style={[styles.actionText, { color: colors.background }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconWithSlash: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slash: {
    position: 'absolute',
    width: 2,
    height: '100%',
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;