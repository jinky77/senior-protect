import { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { Text as SKText, useFont } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

//@ts-ignore
import roboto from "../../assets/fonts/Roboto-Regular.ttf";

export default function Analytics() {
  const font = useFont(roboto, 12);
  const tooltipFont = useFont(roboto, 16);
  const [allData, setAllData] = useState(null);
  const [timeframe, setTimeframe] = useState("day");
  const [isLoading, setIsLoading] = useState(true);

  const [customDomainPadding, setCustomDomainPadding] = useState(40);
  const [roundedCorners, setRoundedCorners] = useState(3);
  const [tooltipHeight, setTooltipHeight] = useState(40);
  const [tooltipWidth, setTooltipWidth] = useState(100);

  const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.21:3001/api/v1";

  const options = [
    { key: "day", value: "Jour" },
    { key: "week", value: "Semaine" },
    { key: "month", value: "Mois" },
    { key: "year", value: "Année" },
  ];

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${PUBLIC_API_URL}/users/getAllAnalytics`);
      setAllData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Implement error handling UI here
    } finally {
      setIsLoading(false);
    }
  }, [PUBLIC_API_URL]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const { state, isActive } = useChartPressState({
    x: 0,
    y: { events: 0 },
  });

  const value = useDerivedValue(() => "" + state.y.events.value.value, [state]);

  const textYPosition = useDerivedValue(() => state.y.events.position.value - 15, [value]);

  const textXPosition = useDerivedValue(() => {
    if (!tooltipFont) return 0;
    return state.x.position.value - tooltipFont.measureText(value.value).width / 2;
  }, [value, tooltipFont]);

  const currentData = useMemo(() => allData?.[timeframe] || [], [allData, timeframe]);

  const maxDomain = useMemo(() => {
    //@ts-ignore
    const maxValue = Math.max(...currentData.map((d) => d.events));
    if (maxValue === 0) return 1;
    return Math.ceil(maxValue * 1.1); // Add 10% to maxValue to make sur tooltip is displayed
  }, [currentData]);

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Analytique</Text>
        <Pressable onPress={fetchAllData} android_ripple={{ color: "#E1E0EB", radius: 20 }} style={{ padding: 10 }}>
          <Ionicons name="refresh" size={25} color="black" />
        </Pressable>
      </View>
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
          <View style={styles.chart}>
            {!isLoading && allData && (
              <CartesianChart
                data={currentData}
                //@ts-ignore
                chartPressState={state}
                xKey="period"
                yKeys={["events"]}
                padding={10}
                domainPadding={{ left: customDomainPadding, right: customDomainPadding }}
                domain={{ y: [0, maxDomain] }}
                // Prop axisOptions is deprecated, will need update
                // See https://commerce.nearform.com/open-source/victory-native/docs/cartesian/cartesian-chart#axisoptions-deprecated
                axisOptions={{
                  font,
                  lineColor: {
                    grid: { x: "#F2F2F2", y: "#A6A6A6" },
                    frame: "#F2F2F2",
                  },
                  lineWidth: {
                    grid: { x: 0, y: 0.5 },
                    frame: 0,
                  },
                  tickCount: { x: currentData.length, y: maxDomain < 4 ? 1 : 4 },
                  labelOffset: { x: 10, y: 10 },
                }}
              >
                {({ points, chartBounds }) => (
                  <>
                    <Bar
                      points={points.events}
                      chartBounds={chartBounds}
                      animate={{ type: "timing", duration: 300 }}
                      barCount={currentData.length}
                      color="#4e2a84"
                      roundedCorners={{
                        topLeft: roundedCorners,
                        topRight: roundedCorners,
                      }}
                    />
                    {isActive && tooltipFont && <SKText font={tooltipFont} color="black" x={textXPosition} y={textYPosition} text={value} />}
                  </>
                )}
              </CartesianChart>
            )}
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  chart: {
    flex: 1,
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
