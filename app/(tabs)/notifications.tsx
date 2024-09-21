import { View, Text, StyleSheet } from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function App() {
  const { expoPushToken, notification } = usePushNotifications();

  const data = JSON.stringify(notification, undefined, 2);

  console.log(expoPushToken);

  return (
    <View style={styles.container}>
      <Text>Token: {expoPushToken?.data ?? ""}</Text>
      <Text>{data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
