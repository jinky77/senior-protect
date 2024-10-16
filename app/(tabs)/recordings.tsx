import { useState, useEffect, useRef, useCallback } from "react";
import { ActivityIndicator, View, Text, Pressable, SectionList, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useVideoPlayer, VideoView } from "expo-video";
import { PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import RecordingItem from "@/components/RecordingItem";

const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.174:3001/api/v1";

export default function Recordings() {
  const [recordings, setRecordings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const ref = useRef(null);
  const player = useVideoPlayer(selectedVideo, (player) => {
    player.play();
  });

  const fetchRecordings = async () => {
    console.log(`${PUBLIC_API_URL}/recordings`);

    try {
      //@ts-ignore
      setLoading(true);
      const res = await axios.get(`${PUBLIC_API_URL}/recordings`);
      setRecordings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      //@ts-ignore
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  //@ts-ignore
  const deleteVideo = async (item) => {
    try {
      const res = await axios.delete(`${PUBLIC_API_URL}/delete/${item.directory}/${item.name}`);
      if (res.status === 200) {
        setRecordings((prevRecordings) => {
          //@ts-ignore
          const updatedRecordings = prevRecordings
            //@ts-ignore
            .map((section) => ({
              ...section,
              //@ts-ignore
              data: section.data.filter((recording) => recording.id !== item.id),
            }))
            //@ts-ignore
            .filter((section) => section.data.length > 0);
          return updatedRecordings;
        });
      }
    } catch (err) {
      console.error("Erreur : ", err);
      Alert.alert("Erreur", "Erreur lors de la suppression de la vidéo. Veuillez réessayer.");
    }
  };

  const renderItem = useCallback(
    // @ts-ignore
    ({ item }) => (
      <RecordingItem
        // @ts-ignore
        item={item}
        setSelectedVideo={setSelectedVideo}
        deleteVideo={deleteVideo}
      />
    ),
    [setSelectedVideo]
  );

  return (
    <PaperProvider>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Enregistrements</Text>
        <Pressable onPress={() => fetchRecordings()} android_ripple={{ color: "#E1E0EB", radius: 20 }} style={{ padding: 10 }}>
          <Ionicons name="refresh" size={25} color="black" />
        </Pressable>
      </View>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#4e2a84" />
          </View>
        ) : // @ts-ignore
        recordings && recordings.length > 0 ? (
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
            <>
              <SectionList
                sections={recordings}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionListHeader}>{title}</Text>}
                style={styles.list}
              />
            </>
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
