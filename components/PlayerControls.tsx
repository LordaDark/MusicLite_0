import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Play, Pause, SkipForward, SkipBack, Repeat, Repeat1, Shuffle } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/utils/timeUtils';
import { useTheme } from '@/hooks/useTheme';

const PlayerControls: React.FC = () => {
  const { 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious, 
    progress, 
    duration, 
    setProgress,
    repeatMode,
    toggleRepeat,
    shuffleMode,
    toggleShuffle
  } = usePlayerStore();
  
  const { colors } = useTheme();
  const [localProgress, setLocalProgress] = useState(0);
  
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);
  
  const handleSliderChange = (value: number) => {
    setLocalProgress(value);
  };
  
  const handleSliderComplete = (value: number) => {
    setProgress(value);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Text style={[styles.timeText, { color: colors.subtext }]}>
          {formatDuration(localProgress)}
        </Text>
        
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={localProgress}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        
        <Text style={[styles.timeText, { color: colors.subtext }]}>
          {formatDuration(duration)}
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.shuffleButton} 
          onPress={toggleShuffle}
        >
          <Shuffle 
            color={shuffleMode ? colors.primary : colors.subtext} 
            size={20} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={playPrevious}
        >
          <SkipBack color={colors.text} size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: colors.primary }]} 
          onPress={togglePlay}
        >
          {isPlaying ? (
            <Pause color={colors.background} size={28} />
          ) : (
            <Play color={colors.background} size={28} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={playNext}
        >
          <SkipForward color={colors.text} size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.repeatButton} 
          onPress={toggleRepeat}
        >
          {repeatMode === 'one' ? (
            <Repeat1 color={colors.primary} size={20} />
          ) : (
            <Repeat 
              color={repeatMode === 'all' ? colors.primary : colors.subtext} 
              size={20} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 12,
    width: 40,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shuffleButton: {
    padding: 10,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatButton: {
    padding: 10,
  },
});

export default PlayerControls;