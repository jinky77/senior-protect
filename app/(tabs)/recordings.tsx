//@ts-nocheck
import { useRef, useCallback, useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet, ActivityIndicator, SectionList } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import RecordingItem from "@/components/RecordingItem";
import { useDataFetching } from "@/hooks/useDataFetching";
import { RefreshButton } from "@/components/RefreshButton";
import axios from "axios";

const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.120.8.178:3001/api/v1";

export default function Recordings() {
  const {
    data: recordings,
    setData: setRecordings,
    isInitialLoading,
    isRefreshing,
    isManualRefresh,
    handleManualRefresh,
    fetchData,
    spin,
  } = useDataFetching(`${PUBLIC_API_URL}/recordings`);

  const [selectedVideo, setSelectedVideo] = useState(null);

  const ref = useRef(null);
  const player = useVideoPlayer(selectedVideo, (player) => {
    player.loop = true;
    player.play();
  });

  const deleteVideo = async (item) => {
    try {
      const res = await axios.delete(`${PUBLIC_API_URL}/recordings/delete/${item.directory}/${item.name}`);
      if (res.status === 200) {
        // Immediately update the UI
        setRecordings((prevRecordings) => {
          if (!prevRecordings) return [];

          const updatedRecordings = prevRecordings
            .map((section) => ({
              ...section,
              data: section.data.filter((recording) => recording.id !== item.id),
            }))
            .filter((section) => section.data.length > 0);
          return updatedRecordings;
        });

        // Fetch fresh data from the server to ensure consistency
        await fetchData(false, false);
      }
    } catch (err) {
      console.error("Erreur : ", err);
      Alert.alert("Erreur", "Erreur lors de la suppression de la vidéo. Veuillez réessayer.");
    }
  };

  const renderItem = useCallback(
    ({ item }) => <RecordingItem item={item} setSelectedVideo={setSelectedVideo} deleteVideo={deleteVideo} />,
    [setSelectedVideo]
  );

  // Rest of the component remains the same...
  return (
    <PaperProvider>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Enregistrements</Text>
        <RefreshButton onPress={handleManualRefresh} isRefreshing={isRefreshing} isManualRefresh={isManualRefresh} spin={spin} />
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
