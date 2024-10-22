import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import axios from "axios";

export default function Analytics() {
  const [allData, setAllData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("day");
  const [options, setOptions] = useState([
    { key: "day", value: "Jour", endSpacing: 50 },
    { key: "week", value: "Semaine", endSpacing: 5 },
    { key: "month", value: "Mois", endSpacing: 10 },
    { key: "year", value: "Année", endSpacing: 10 },
  ]);

  const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.174:3001/api/v1";

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${PUBLIC_API_URL}/users/getAllAnalytics`);
      setAllData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const currentData = useMemo(() => allData?.[timeframe] || [], [allData, timeframe]);

  const maxValue = useMemo(() => {
    //@ts-ignore
    const _maxValue = Math.max(...currentData.map((d) => d.value));
    if (_maxValue === 0) return 1;
    return _maxValue * 1.25; // Adjust depending on height prop
  }, [currentData]);

  const currentOption = useMemo(() => options.find((option) => option.key === timeframe) || options[0], [timeframe, options]);

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Analytique</Text>
        <Pressable onPress={fetchAllData} android_ripple={{ color: "#E1E0EB", radius: 20 }} style={{ padding: 10 }}>
          <Ionicons name="refresh" size={25} color="black" />
        </Pressable>
      </View>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#4e2a84" />
          </View>
        ) : (
          <>
            <View style={styles.segmentedButtonsContainer}>
              {options.map((option, index) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.segmentedButtonsOption,
                    index === 0 && styles.segmentedButtonsOptionFirst,
                    index === options.length - 1 && styles.segmentedButtonsOptionLast,
                    index !== options.length - 1 && styles.segmentedButtonsOptionMiddle,
                    option.key === timeframe && styles.segmentedButtonsOptionActive,
                  ]}
                  onPress={() => setTimeframe(option.key)}
                >
                  <Text style={styles.segmentedButtonsOptionText}>{option.value}</Text>
                </Pressable>
              ))}
            </View>
            <BarChart
              height={550}
              adjustToWidth
              data={currentData}
              frontColor="#4E2A84"
              disableScroll
              activeOpacity={1}
              noOfSections={maxValue < 5 ? 1 : 5} // Check if relevant
              maxValue={maxValue}
              endSpacing={currentOption.endSpacing}
              //@ts-ignore
              renderTooltip={(item, index) => {
                const isRightSide = index >= currentData.length / 2;
                return (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "white",
                      borderWidth: 1.25,
                      borderColor: item.frontColor,
                      justifyContent: "center",
                      borderRadius: 7,
                      width: 175,
                      left: isRightSide ? -125 : -15,
                      bottom: -35,
                      padding: 15,
                    }}
                  >
                    <View style={{ display: "flex", flexDirection: "column" }}>
                      <Text style={{ color: item.frontColor, fontWeight: 500 }}>{item.formattedLabel}</Text>
                      <Text style={{ color: item.frontColor, fontSize: 18, marginTop: 7, fontWeight: 500 }}>{item.value}</Text>
                      <Text style={{ color: item.frontColor, marginTop: 2, fontSize: 12 }}>{item.value > 1 ? "Evénements" : "Evénement"}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </>
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
  segmentedButtonsContainer: {
    borderWidth: 1.5,
    borderColor: "#948F95",
    flexDirection: "row",
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 25,
  },
  segmentedButtonsOption: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    fontWeight: "bold",
  },
  segmentedButtonsOptionText: {
    fontWeight: "bold",
  },
  segmentedButtonsOptionFirst: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  segmentedButtonsOptionLast: {
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  segmentedButtonsOptionMiddle: {
    borderRightWidth: 1.5,
    borderRightColor: "#948F95",
  },
  segmentedButtonsOptionActive: {
    backgroundColor: "#E9DDF8",
  },
});
