import { Stack } from "expo-router";

// These screens remain inside the Reservation tab, so its tab-bar state is kept
// while guests move between their reservations and the booking flow.
export default function ReservationLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
