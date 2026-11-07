import React, { useContext, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ReservationBackground from "../../Background/ReservationBackground";
import { CartContext } from "../../context/CartContext";

export default function ReservationScreen() {
  const { reservationHistory, deleteReservationFromHistory } = useContext(CartContext);

  useEffect(() => {
    const protectGuestRoute = async () => {
      if ((await AsyncStorage.getItem("isGuest")) === "true") {
        router.replace("/(tabs)/Homescreen");
      }
    };

    protectGuestRoute();
  }, []);

  // A reservation card can be deleted individually from the shared reservation history.
  const handleDeleteReservation = (reservationId) => {
    deleteReservationFromHistory(reservationId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ReservationBackground>
        <View style={styles.hero}>
          <View style={styles.header}><Ionicons name="menu" size={27} color="#fff" /><TouchableOpacity onPress={() => router.push("/notifications")}><Ionicons name="notifications-outline" size={27} color="#fff" /></TouchableOpacity></View>
          <Text style={styles.eyebrow}>YOUR DINING PLANS</Text>
          <Text style={styles.title}>My Reservations</Text>
          <Text style={styles.subtitle}>Manage your upcoming tables</Text>
        </View>
        <View style={styles.sheet}>
          <View style={styles.subTabs}>
            <View style={[styles.subTab, styles.activeSubTab]}><Text style={styles.activeSubTabText}>Reservations</Text></View>
            <TouchableOpacity style={styles.subTab} onPress={() => router.push("/reservation/reserve-a-table")}><Text style={styles.subTabText}>Reserve a table</Text></TouchableOpacity>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming reservations</Text>
            <TouchableOpacity style={styles.reserveButton} onPress={() => router.push("/reservation/reserve-a-table")}>
              <Ionicons name="add" size={17} color="#fff" /><Text style={styles.reserveButtonText}>Reserve a table</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>
            {reservationHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={52} color="#d2cac5" />
                <Text style={styles.emptyText}>You have no reservations yet. Tap “Reserve a Table” to start!</Text>
              </View>
            ) : (
              reservationHistory.map((reservation) => {
                const isConfirmed = reservation.status === "Confirmed";

                return (
                  <View key={reservation.id} style={styles.card}>
                    <Image source={reservation.image} style={styles.cardImage} resizeMode="cover" />

                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Text style={styles.cardName}>{reservation.restaurant}</Text>
                        <View style={styles.cardActions}>
                          <View style={[styles.statusBadge, isConfirmed ? styles.statusConfirmed : styles.statusPending]}>
                            <Text style={[styles.statusText, isConfirmed ? styles.statusTextConfirmed : styles.statusTextPending]}>
                              {isConfirmed ? "✓ Confirmed" : "⏳ Pending"}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteReservation(reservation.id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.cuisineTag}>
                        <Text style={styles.cuisineText}>{reservation.cuisine}</Text>
                      </View>

                      <View style={styles.dateInfoRow}>
                        <View style={styles.dateInfoItem}>
                          <Ionicons name="calendar-outline" size={13} color="#aaa" />
                          <Text style={styles.dateInfoText}>{reservation.date}</Text>
                        </View>
                        <View style={styles.dateInfoItem}>
                          <Ionicons name="time-outline" size={13} color="#aaa" />
                          <Text style={styles.dateInfoText}>{reservation.time}</Text>
                        </View>
                        <View style={styles.dateInfoItem}>
                          <Ionicons name="people-outline" size={13} color="#aaa" />
                          <Text style={styles.dateInfoText}>{reservation.guests}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.footerPrice}>
                        Est. total <Text style={styles.footerPriceBold}>{reservation.estimatedTotal}</Text>
                      </Text>
                      <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.8}>
                        <Ionicons name="arrow-forward" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </ReservationBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2d1711" },
  hero: { height: "20%", paddingHorizontal: 20, paddingTop: 12 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { color: "#ffc38a", fontSize: 11, fontWeight: "800", letterSpacing: 1.3, marginTop: 38 },
  title: { color: "#fff", fontSize: 31, fontWeight: "800", marginTop: 6 },
  subtitle: { color: "#fff1e7", fontSize: 14, marginTop: 5 },
  sheet: { position: 'absolute', top: 190, left: 0, right: 0, bottom: 0, backgroundColor: "#fffaf5", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 18 },
  subTabs: { flexDirection: "row", marginHorizontal: 20, backgroundColor: "#f1e9e2", borderRadius: 14, padding: 4 },
  subTab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  activeSubTab: { backgroundColor: "#fff" },
  subTabText: { color: "#806f66", fontSize: 13, fontWeight: "700" },
  activeSubTabText: { color: "#bd531d", fontSize: 13, fontWeight: "800" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 22, marginBottom: 14 },
  sectionTitle: { color: "#241814", fontSize: 18, fontWeight: "800" },
  reserveButton: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#d95e20", paddingVertical: 9, paddingHorizontal: 11, borderRadius: 20 },
  reserveButtonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  cards: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 34, gap: 14 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34, paddingBottom: 76 },
  emptyText: { color: "#746d72", fontSize: 17, fontStyle: "italic", textAlign: "center", lineHeight: 25, marginTop: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#efefef",
  },
  cardImage: {
    width: "100%",
    height: 110,
  },
  cardBody: {
    padding: 14,
    paddingBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusConfirmed: { backgroundColor: "#e8f9ef" },
  statusPending: { backgroundColor: "#fff1e6" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextConfirmed: { color: "#12a864" },
  statusTextPending: { color: "#d7791b" },
  cuisineTag: {
    backgroundColor: "#f7f2ee",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  cuisineText: {
    color: "#6d5d57",
    fontSize: 11,
    fontWeight: "700",
  },
  dateInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 10,
  },
  dateInfoText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff9f5",
    borderTopWidth: 1,
    borderTopColor: "#f2ece8",
  },
  footerPrice: {
    fontSize: 12,
    color: "#666",
  },
  footerPriceBold: {
    color: "#111",
    fontWeight: "700",
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff6b35",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fff1ef",
    alignItems: "center",
    justifyContent: "center",
  },
});
