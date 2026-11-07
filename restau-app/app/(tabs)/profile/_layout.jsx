import { Stack } from "expo-router";

// These screens remain inside the Order tab, so its tab-bar state is kept
// while guests move between their orders and the menu.
export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
