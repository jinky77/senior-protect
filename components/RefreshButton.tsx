//@ts-nocheck
import React from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RefreshButton = ({ 
  onPress, 
  isRefreshing, 
  isManualRefresh, 
  spin,
  style 
}) => {
  const RefreshIcon = () => (
    <Animated.View style={isManualRefresh ? { transform: [{ rotate: spin }] } : undefined}>
      <Ionicons 
        name={isManualRefresh ? 'sync' : 'refresh'} 
        size={25} 
        color={isManualRefresh ? 'gray' : 'black'} 
      />
    </Animated.View>
  );

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#E1E0EB', radius: 20 }}
      style={[styles.refreshButton, style]}
      disabled={isRefreshing || isManualRefresh}
    >
      <RefreshIcon />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  refreshButton: {
    padding: 10,
  },
});