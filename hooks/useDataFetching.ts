//@ts-nocheck
import { useState, useEffect, useCallback, useMemo } from "react";
import { Animated, Easing } from "react-native";
import axios from "axios";

export const useDataFetching = (url, refreshInterval = 10000) => {
  const [data, setData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  // Create animated value for rotation
  const rotateAnim = useMemo(() => new Animated.Value(0), []);

  // Animation setup
  const startRotation = useCallback(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const stopRotation = useCallback(() => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const fetchData = useCallback(
    async (isInitial = false, isManual = false) => {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
        if (isManual) {
          setIsManualRefresh(true);
          startRotation();
        }
      }

      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        if (isManual) {
          setIsManualRefresh(false);
          stopRotation();
        }
      }
    },
    [url, startRotation, stopRotation]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Setup periodic refresh
  useEffect(() => {
    const updateInterval = setInterval(() => {
      fetchData(false, false);
    }, refreshInterval);

    return () => clearInterval(updateInterval);
  }, [fetchData, refreshInterval]);

  const handleManualRefresh = useCallback(() => {
    fetchData(false, true);
  }, [fetchData]);

  return {
    data,
    setData,
    isInitialLoading,
    isRefreshing,
    isManualRefresh,
    handleManualRefresh,
    fetchData,
    spin,
  };
};
