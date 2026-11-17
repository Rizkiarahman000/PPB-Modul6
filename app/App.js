import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { ProfileScreen } from "./src/screens/ProfileScreen.js";
import { SplashScreen } from "./src/components/SplashScreen.js";
import { assertConfig } from "./src/services/config.js";
import { tokens } from "./src/theme/tokens.js";

const Tab = createBottomTabNavigator();
const { color } = tokens;

const TAB_ICONS = {
  Monitoring: "pulse",
  Control: "options",
  Profil: "people",
};

enableScreens(true);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: "LiveTemp",
        headerTitleAlign: "left",
        headerTintColor: color.text,
        headerStyle: {
          backgroundColor: color.surface,
          borderBottomWidth: 1,
          borderBottomColor: color.border,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
          // ponytail: system monospace, no custom font dep
          fontFamily: "monospace",
          letterSpacing: -0.5,
        },
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.text2,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopWidth: 1,
          borderTopColor: color.border,
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color: iconColor }) => (
          <Ionicons
            name={TAB_ICONS[route.name] ?? "ellipse"}
            size={24}
            color={iconColor}
          />
        ),
      })}
    >
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Control" component={ControlScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const finishSplash = useCallback(() => setBooted(true), []);

  useEffect(() => {
    assertConfig();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: color.bg,
      card: color.surface,
      text: color.text,
      border: color.border,
      primary: color.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: booted ? color.bg : color.text }}>
        <StatusBar style={booted ? "dark" : "light"} />
        <NavigationContainer theme={theme}>
          <MainTabs />
        </NavigationContainer>
        {booted ? null : <SplashScreen onFinish={finishSplash} />}
      </View>
    </SafeAreaProvider>
  );
}
