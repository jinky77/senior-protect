import { memo, useState } from "react";
import { Alert, Platform, View, Pressable, Image, Text, StyleSheet } from "react-native";
import { Button, Menu, Divider } from "react-native-paper";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import DownloadModal from "./DownloadModal";

//@ts-ignore
const RecordingItem = memo(({ item, setSelectedVideo, deleteVideo }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const openMenu = () => setIsMenuVisible(true);
  const closeMenu = () => setIsMenuVisible(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [download, setDownload] = useState();
  const [isDownloading, setIsDownloading] = useState(false);

  //@ts-ignore
  const showDeletionAlert = (item) => {
    Alert.alert("Êtes-vous sûr(e) ?", "Cette action est irréversible.", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Supprimer",
        onPress: () => {
          deleteVideo(item);
        },
        style: "destructive",
      },
    ]);
  };

  //@ts-ignore
  const createResumableDownload = (uri, filename, callback) => {
    const downloadResumable = FileSystem.createDownloadResumable(uri, FileSystem.documentDirectory + filename, {}, (progress) => {
      const percentProgress = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
      setDownloadProgress(percentProgress);
    });
    //@ts-ignore
    callback(downloadResumable);
  };

  //@ts-ignore
  const saveVideoOnLocalStorage = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
          })
          .catch((err) => console.log(err));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  };

  //@ts-ignore
  const downloadVideo = async (uri, filename) => {
    setIsDownloading(true);
    //@ts-ignore
    createResumableDownload(uri, filename, (downloadResumable) => {
      setDownload(downloadResumable);
      //@ts-ignore
      downloadResumable.downloadAsync().then((result) => {
        setIsDownloading(false);
        saveVideoOnLocalStorage(result.uri, filename, result.headers["Content-Type"]);
      });
    });
  };

  return (
    <View style={styles.listItemContainer}>
      <Pressable style={styles.listItemPressable} onPress={() => setSelectedVideo(item.path)}>
        {item.thumbnail ? (
          <Image style={styles.listItemThumbnail} source={{ uri: item.thumbnail }} />
        ) : (
          <View style={styles.listItemThumbnail}></View>
        )}

        <View>
          <Text style={styles.listItemName}>{item.name}</Text>
          {/* //@ts-ignore */}
          <Text style={styles.listItemDate}>
            {new Date(item.creationDate).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })} à{" "}
            {new Date(item.creationDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} &bull; {item.size} Mb
          </Text>
        </View>
      </Pressable>
      <Menu
        visible={isMenuVisible}
        anchor={
          <View style={{ width: 40, marginRight: 10 }}>
            <Button compact onPress={openMenu}>
              <Ionicons name="ellipsis-vertical" size={20} color="#000" />
            </Button>
          </View>
        }
        statusBarHeight={5}
        anchorPosition="bottom"
        onDismiss={closeMenu}
        contentStyle={{
          backgroundColor: "#F2F2F2",
        }}
      >
        <Menu.Item
          leadingIcon={() => <MaterialIcons name="download" size={24} color="black" />}
          onPress={() => {
            closeMenu();
            setIsDownloading(true);
            // Check whether to pass item.path or not vs. destination uri
            downloadVideo(item.path, item.name);
          }}
          title="Télécharger"
        />
        <Divider />
        <Menu.Item
          titleStyle={{ color: "red" }}
          leadingIcon={() => <MaterialIcons name="delete" size={24} color="red" />}
          onPress={() => {
            closeMenu();
            showDeletionAlert(item);
          }}
          title="Supprimer"
        />
      </Menu>
      <DownloadModal isDownloading={isDownloading} downloadProgress={downloadProgress} />
    </View>
  );
});

export default RecordingItem;

const styles = StyleSheet.create({
  listItemContainer: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: "lightgray",
    marginLeft: 15,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  listItemThumbnail: {
    width: 50,
    height: 50,
    backgroundColor: "lightgray",
  },
  listItemName: {
    fontSize: 16,
    marginBottom: 2,
  },
  listItemDate: {
    color: "gray",
  },
});
