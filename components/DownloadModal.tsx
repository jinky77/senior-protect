import { View, Text, Modal, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

//@ts-ignore
const DownloadModal = ({ isDownloading, downloadProgress }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={isDownloading}>
      <View style={styles.modalBackground}>
        <View style={styles.progressBarWrapper}>
          <Progress.Circle size={45} progress={downloadProgress} color="#4e2a84" showsText={true} textStyle={{ fontSize: 12 }} borderWidth={0} />
          <Text>Téléchargement</Text>
        </View>
      </View>
    </Modal>
  );
};

export default DownloadModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  progressBarWrapper: {
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    height: 120,
    width: 150,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
