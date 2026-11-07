import { Stack } from "expo-router";

// These screens remain inside the Notification tab, so its tab-bar state is kept
// while guests move between their notifications and the menu.
export default function NotificationLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
