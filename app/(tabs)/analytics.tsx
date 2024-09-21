import { View, Text, StyleSheet } from "react-native";

export default function Analytics() {
  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <View style={styles.container}>
        <Text>Notifications</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
