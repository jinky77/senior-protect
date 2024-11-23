import { useState } from "react";
import { View, Dimensions, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import { WebView } from "react-native-webview";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videoContainerHeight, setVideoContainerHeight] = useState(512);

  const { expoPushToken } = usePushNotifications();
  console.log("ExpoPushToken \n");
  console.log(expoPushToken);

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Live</Text>
      </View>
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#4e2a84" />
          </View>
        )}
        {!error ? (
          <WebView
            style={[
              isLoading && styles.hideWebViewContainer,
              { flex: 0, height: videoContainerHeight, marginTop: (Dimensions.get("screen").height - videoContainerHeight) / 5.5 },
            ]}
            source={{ uri: process.env.EXPO_PUBLIC_STREAM_URL || "https://www.youtube.com/watch?v=R7vrbiDi0Tc" }}
            
            onError={() => setError(true)}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <View style={styles.errorMessage}>
            <Text>Une erreur est survenue.</Text>
            <Text>Vérifiez votre connexion Internet.</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#FFF",
    paddingTop: 70,
    paddingBottom: 15,
    paddingLeft: 15,
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
    top: "25%",
  },
  hideWebViewContainer: {
    display: "none",
  },
  errorMessage: {
    alignItems: "center",
    top: "50%",
  },
});
