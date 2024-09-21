import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="recordings"
        options={{
          title: "Enregistrements",
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "videocam" : "videocam-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Live",
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "radio" : "radio-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "notifications" : "notifications-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "analytics" : "analytics-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}
