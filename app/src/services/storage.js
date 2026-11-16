import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getSeen(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setSeen(key, value = true) {
  try {
    await AsyncStorage.setItem(key, value ? "true" : "false");
  } catch {
    // Storage failures should never block the app.
  }
}