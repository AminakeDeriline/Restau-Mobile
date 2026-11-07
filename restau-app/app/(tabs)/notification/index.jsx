import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import API from "../../../services/api";

// Convert the database date into the short time format used by the design.
const formatNotificationTime = (dateString) => {
  const notificationDate = new Date(dateString);
  const now = new Date();
  const minutesAgo = Math.floor((now - notificationDate) / (1000 * 60));

  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo} min ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hr ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;

  return notificationDate.toLocaleDateString();
};

// Use a different icon for each notification type while keeping one reusable card.
const getNotificationIcon = (type) => {
  switch (type) {
    case "reservation_confirmed":
      return "calendar-outline";
    case "new_order":
      return "pizza-outline";
    case "order_ready":
      return "star-outline";
    case "welcome":
      return "notifications-outline";
    case "restaurant_update":
      return "megaphone-outline";
    default:
      return "notifications-outline";
  }
};

export default function Notifications() {
  // This state contains the notifications returned by MongoDB.
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load notifications every time this screen becomes active again.
  // This matters because the red dot may have changed on the content screen.
  const loadNotifications = useCallback(async () => {
    let hasCachedNotifications = false;
    try {
      setLoading(true);
      setErrorMessage("");

      const isGuest = (await AsyncStorage.getItem("isGuest")) === "true";

      if (isGuest) {
        // Guests have one local notification and no database notification history.
        setNotifications([
          {
            _id: "guest-welcome",
            type: "welcome",
            title: "Welcome",
            message: "Welcome Jane Doe!",
            createdAt: new Date().toISOString(),
            isRead: false,
          },
        ]);
        return;
      }

      // The backend uses the JWT to return only this user's notifications.
      const token = await AsyncStorage.getItem("token");
      const storedNotifications = await AsyncStorage.getItem("notifications");

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
        hasCachedNotifications = true;
      }

      if (!token) {
        setErrorMessage("Please log in to view your notifications.");
        return;
      }

      const response = await API.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data);
      await AsyncStorage.setItem("notifications", JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to load notifications:", error);
      if (!hasCachedNotifications) {
        setErrorMessage("Unable to load notifications right now.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // useFocusEffect runs when the user enters or returns to this screen.
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {/* Mark-all-as-read needs its own backend endpoint before enabling this action. */}
        <Text style={styles.subTitle}>mark all as read</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Show a spinner while the first database request is running. */}
        {loading && (
          <ActivityIndicator size="large" color="#ff7a00" style={styles.loader} />
        )}

        {/* Show a useful message instead of an empty screen when loading fails. */}
        {!loading && errorMessage ? (
          <Text style={styles.statusText}>{errorMessage}</Text>
        ) : null}

        {/* The old hardcoded cards are replaced by one card for each database record. */}
        {!loading && !errorMessage && notifications.length === 0 ? (
          <Text style={styles.statusText}>You have no notifications yet.</Text>
        ) : null}

        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification._id}
            activeOpacity={0.8}
            style={styles.notificationStack}
            onPress={() =>
              router.push({
                pathname: "/notification/content",
                // The content screen uses this id to mark the item as read.
                params: { notificationId: notification._id },
              })
            }
          >
            <View style={styles.notificationCard}>
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={26}
                  color="#ff7a00"
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>

                  {/* isRead=false means the user has not opened this message yet. */}
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationText}>
                  {notification.message}
                </Text>
              </View>

              <View style={styles.notificationMeta}>
                <Text style={styles.notificationTime}>
                  {formatNotificationTime(notification.createdAt)}
                </Text>
                <Ionicons name="chevron-forward" size={15} color="#555" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  scrollContainer: { padding: 20 },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 25,
    fontWeight: "bold",
    paddingLeft: 8,
    color: "#111",
  },
  subTitle: { fontSize: 12, color: "#ff7a00" },
  loader: { marginTop: 30 },
  statusText: { marginTop: 30, textAlign: "center", color: "#666" },
  notificationStack: { paddingVertical: 10 },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#fff4eb",
    marginRight: 12,
  },
  notificationContent: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e53935",
    marginLeft: 6,
  },
  notificationMeta: {
    marginLeft: 10,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingTop: 2,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },
  notificationText: { color: "#4b4b4b", fontSize: 14, lineHeight: 18 },
  notificationTime: { color: "#8c8c8c", fontSize: 11, marginBottom: 4 },
});
