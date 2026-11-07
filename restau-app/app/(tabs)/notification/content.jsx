import React, { useEffect, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../../services/api";

const formatCurrency = (amount) =>
  `FCFA ${Number(amount || 0).toLocaleString("fr-FR")}`;

const formatDate = (dateString) => {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatNotificationTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
};

export default function NotificationContent() {
  // Expo Router gives us the id passed from notification/index.jsx.
  const { notificationId } = useLocalSearchParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadNotification = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = await AsyncStorage.getItem("token");
        const isGuest = (await AsyncStorage.getItem("isGuest")) === "true";

        if (!notificationId) {
          setErrorMessage("This notification could not be opened.");
          return;
        }

        if (isGuest && notificationId === "guest-welcome") {
          setNotification({
            _id: "guest-welcome",
            type: "welcome",
            title: "Welcome",
            message: "Welcome Jane Doe!",
            createdAt: new Date().toISOString(),
            isRead: false,
          });
          return;
        }

        if (isGuest) {
          setErrorMessage("This notification could not be opened.");
          return;
        }

        const storedNotifications = await AsyncStorage.getItem("notifications");
        let selectedNotification = storedNotifications
          ? JSON.parse(storedNotifications).find(
              (item) => item._id === notificationId
            )
          : null;

        if (token) {
          // Marking it read here removes the red dot after the user opens it.
          await API.patch(
            `/notifications/${notificationId}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Fetch the complete list so reservation details are populated by the backend.
          const response = await API.get("/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          await AsyncStorage.setItem("notifications", JSON.stringify(response.data));
          selectedNotification = response.data.find(
            (item) => item._id === notificationId
          );
        }

        if (!selectedNotification) {
          setErrorMessage("Notification not found.");
          return;
        }

        setNotification(selectedNotification);
      } catch (error) {
        console.error("Failed to load notification:", error);
        setErrorMessage("Unable to open this notification right now.");
      } finally {
        setLoading(false);
      }
    };

    // This runs once for the notification id currently in the route.
    loadNotification();
  }, [notificationId]);

  // Welcome and restaurant-update messages do not have reservation details.
  const reservation = notification?.reservation;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading && (
          <ActivityIndicator size="large" color="#ff7a00" style={styles.loader} />
        )}

        {!loading && errorMessage ? (
          <Text style={styles.statusText}>{errorMessage}</Text>
        ) : null}

        {!loading && notification ? (
          <>
            {/* The header now displays values from the selected database record. */}
            <View style={styles.alertCard}>
              <View style={styles.iconWrap}>
                <Ionicons name="notifications-outline" size={22} color="#ff7a00" />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>{notification.title}</Text>
                <Text style={styles.cardTime}>
                  {formatNotificationTime(notification.createdAt)}
                </Text>
              </View>
            </View>

            <Text style={styles.messageText}>{notification.message}</Text>

            {/* Only notifications connected to a reservation render these sections. */}
            {reservation && notification.type === "reservation_confirmed" ? (
              <>
                <Text style={styles.sectionTitle}>Reservation Details</Text>
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons name="calendar-outline" size={18} color="#ff7a00" />
                      <Text style={styles.detailLabel}>Date</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDate(reservation.reservationDate)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons name="time-outline" size={18} color="#ff7a00" />
                      <Text style={styles.detailLabel}>Time</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatTime(reservation.reservationDate)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons name="people-outline" size={18} color="#ff7a00" />
                      <Text style={styles.detailLabel}>Guests</Text>
                    </View>
                    <Text style={styles.detailValue}>{reservation.guests}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons name="location-outline" size={18} color="#ff7a00" />
                      <Text style={styles.detailLabel}>Restaurant</Text>
                    </View>
                    <Text style={styles.detailValue}>{reservation.restaurant}</Text>
                  </View>
                </View>

                {reservation.foodOrders?.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Food & Beverages</Text>
                    <View style={styles.orderCard}>
                      {reservation.foodOrders.map((item, index) => (
                        <View style={styles.orderRow} key={`${item.name}-${index}`}>
                          <Text style={styles.orderName}>
                            {item.name} x{item.quantity}
                          </Text>
                          <Text style={styles.orderPrice}>
                            {formatCurrency(item.price * item.quantity)}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                          {formatCurrency(reservation.totalPrice)}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f8f8" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111111" },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 },
  loader: { marginTop: 30 },
  statusText: { marginTop: 30, textAlign: "center", color: "#666" },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4eb",
    borderRadius: 12,
    marginRight: 12,
  },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111111" },
  cardTime: { fontSize: 11, color: "#7b7b7b", marginTop: 3 },
  messageText: { marginTop: 16, color: "#3f3f3f", fontSize: 14, lineHeight: 22 },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { fontSize: 14, color: "#444444" },
  detailValue: { fontSize: 14, color: "#111111", fontWeight: "600" },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  orderName: { fontSize: 14, color: "#333333", flex: 1, marginRight: 8 },
  orderPrice: { fontSize: 14, color: "#111111", fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#111111" },
  totalValue: { fontSize: 16, fontWeight: "700", color: "#111111" },
});
