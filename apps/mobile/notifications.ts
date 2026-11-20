import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const NATIVE_PUSH_TOKEN_KEY = "four_d_native_push_token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerNativeNotifications(): Promise<{ enabled: boolean; token?: string; message: string }> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "اعلان‌های 4D",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#009688",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return { enabled: false, message: "اجازه اعلان صادر نشد." };

  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId || projectId === "REPLACE_WITH_EAS_PROJECT_ID") return { enabled: true, message: "اعلان‌های داخل برنامه فعال شد؛ برای اعلان خارج از برنامه باید نسخه EAS با تنظیمات FCM نصب شود." };
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    await AsyncStorage.setItem(NATIVE_PUSH_TOKEN_KEY, result.data);
    return { enabled: true, token: result.data, message: "اعلان‌های موبایل فعال شد." };
  } catch {
    return { enabled: true, message: "اعلان‌های داخل برنامه فعال شد؛ Push دستگاه در این نسخه نیازمند تنظیمات FCM/EAS است." };
  }
}

export async function getSavedNativePushToken() {
  return AsyncStorage.getItem(NATIVE_PUSH_TOKEN_KEY);
}
