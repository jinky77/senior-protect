//@ts-nocheck
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ActivityIndicator, View, Text, Pressable, SectionList, StyleSheet, Alert, Animated, Easing } from "react-native";
import axios from "axios";
import { useVideoPlayer, VideoView } from "expo-video";
import { PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import RecordingItem from "@/components/RecordingItem";

const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.120.8.178:3001/api/v1";

export default function Recordings() {
  const [recordings, setRecordings] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const ref = useRef(null);
  const player = useVideoPlayer(selectedVideo, (player) => {
    player.loop = true;
    player.play();
  });

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

  const fetchRecordings = useCallback(
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
        const res = await axios.get(`${PUBLIC_API_URL}/recordings`);
        setRecordings(res.data);
      } catch (err) {
        console.error(err);
        if (!isInitial) {
          Alert.alert("Erreur", "Impossible de mettre à jour les enregistrements. Veuillez réessayer.");
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        if (isManual) {
          setIsManualRefresh(false);
          stopRotation();
        }
      }
    },
    [startRotation, stopRotation]
  );

  // Initial data fetch
  useEffect(() => {
    fetchRecordings(true);
  }, [fetchRecordings]);

  // Setup periodic refresh
  useEffect(() => {
    const updateRecordings = setInterval(() => {
      fetchRecordings(false, false);
    }, 5000);

    return () => clearInterval(updateRecordings);
  }, [fetchRecordings]);

  const deleteVideo = async (item) => {
    try {
      const res = await axios.delete(`${PUBLIC_API_URL}/delete/${item.directory}/${item.name}`);
      if (res.status === 200) {
        setRecordings((prevRecordings) => {
          const updatedRecordings = prevRecordings
            .map((section) => ({
              ...section,
              data: section.data.filter((recording) => recording.id !== item.id),
            }))
            .filter((section) => section.data.length > 0);
          return updatedRecordings;
        });
      }
    } catch (err) {
      console.error("Erreur : ", err);
      Alert.alert("Erreur", "Erreur lors de la suppression de la vidéo. Veuillez réessayer.");
    }
  };

  const handleManualRefresh = () => {
    fetchRecordings(false, true);
  };

  const renderItem = useCallback(
    ({ item }) => <RecordingItem item={item} setSelectedVideo={setSelectedVideo} deleteVideo={deleteVideo} />,
    [setSelectedVideo]
  );

  const RefreshIcon = () => (
    <Animated.View style={isManualRefresh ? { transform: [{ rotate: spin }] } : undefined}>
      <Ionicons name={isManualRefresh ? "sync" : "refresh"} size={25} color={isManualRefresh ? "gray" : "black"} />
    </Animated.View>
  );

  return (
    <PaperProvider>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Enregistrements</Text>
        <Pressable
          onPress={handleManualRefresh}
          android_ripple={{ color: "#E1E0EB", radius: 20 }}
          style={styles.refreshButton}
          disabled={isRefreshing || isManualRefresh}
        >
          <RefreshIcon />
        </Pressable>
      </View>
      <View style={styles.container}>
        {isInitialLoading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#4e2a84" />
          </View>
        ) : recordings && recordings.length > 0 ? (
          selectedVideo ? (
            <View style={styles.videoContainer}>
              <VideoView ref={ref} style={styles.video} player={player} contentFit="contain" allowsFullscreen allowsPictureInPicture />
              <Pressable style={styles.closeButton} onPress={() => setSelectedVideo(null)}>
                <Ionicons
                  style={{
                    shadowOpacity: 1,
                    textShadowRadius: 10,
                  }}
                  name="close-outline"
                  size={30}
                  color="#fff"
                />
              </Pressable>
            </View>
          ) : (
            <SectionList
              sections={recordings}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionListHeader}>{title}</Text>}
              style={styles.list}
            />
          )
        ) : (
          <View style={styles.errorMessage}>
            <Text>Pas de vidéo disponible.</Text>
          </View>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#FFF",
    paddingTop: 60,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  refreshButton: {
    padding: 10,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    position: "relative",
    backgroundColor: "black",
  },
  sectionListHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#303030",
    paddingVertical: 10,
    paddingLeft: 15,
    backgroundColor: "#F2F2F2",
  },
  list: {
    borderTopWidth: 0.75,
    borderTopColor: "lightgray",
    borderBottomWidth: 0.75,
    borderBottomColor: "lightgray",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 8,
  },
  errorMessage: {
    alignItems: "center",
    top: "50%",
  },
});
