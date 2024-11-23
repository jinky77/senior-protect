//@ts-nocheck
import { useState, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useDataFetching } from "@/hooks/useDataFetching";
import { RefreshButton } from "@/components/RefreshButton";

const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.120.8.178:3001/api/v1";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("day");
  const [options] = useState([
    { key: "day", value: "Jour", endSpacing: 50 },
    { key: "week", value: "Semaine", endSpacing: 5 },
    { key: "month", value: "Mois", endSpacing: 10 },
    { key: "year", value: "Année", endSpacing: 10 },
  ]);

  const {
    data: allData,
    isInitialLoading,
    isRefreshing,
    isManualRefresh,
    handleManualRefresh,
    spin,
  } = useDataFetching(`${PUBLIC_API_URL}/users/getAllAnalytics`);

  const currentData = useMemo(() => allData?.[timeframe] || [], [allData, timeframe]);

  const maxValue = useMemo(() => {
    const _maxValue = Math.max(...currentData.map((d) => d.value));
    if (_maxValue === 0) return 1;
    return _maxValue * 1.25;
  }, [currentData]);

  const currentOption = useMemo(() => options.find((option) => option.key === timeframe) || options[0], [timeframe, options]);

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Analytique</Text>
        <RefreshButton onPress={handleManualRefresh} isRefreshing={isRefreshing} isManualRefresh={isManualRefresh} spin={spin} />
      </View>
      <View style={styles.container}>
        {isInitialLoading ? (
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
              height={475}
              adjustToWidth
              data={currentData}
              frontColor="#4E2A84"
              disableScroll
              activeOpacity={1}
              noOfSections={maxValue < 5 ? 1 : 5}
              maxValue={maxValue}
              endSpacing={currentOption.endSpacing}
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
                      padding: 10,
                    }}
                  >
                    <View style={{ display: "flex", flexDirection: "column" }}>
                      <Text style={{ color: item.frontColor, fontWeight: "500" }}>{item.formattedLabel}</Text>
                      <Text style={{ color: item.frontColor, fontSize: 18, marginTop: 7, fontWeight: "500" }}>{item.value}</Text>
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
