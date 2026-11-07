import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext } from "react";
import ReserveBg from "../Background/ReserveBg";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import { router } from "expo-router";

function ReservationCard({ item, onDelete }) {
  const isConfirmed = item.status === "Confirmed";

  return (
    <View style={styles.card}>
      {/* Restaurant image on the card */}
      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

      <View style={styles.cardBody}>
        {/* Name + status badge */}
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{item.restaurant}</Text>
          <View style={styles.cardActions}>
            <View style={[styles.statusBadge, isConfirmed ? styles.statusConfirmed : styles.statusPending]}>
              <Text style={[styles.statusText, isConfirmed ? styles.statusTextConfirmed : styles.statusTextPending]}>
                {isConfirmed ? "✓ Confirmed" : "⏳ Pending"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuisine tag */}
        <View style={styles.cuisineTag}>
          <Text style={styles.cuisineText}>{item.cuisine}</Text>
        </View>

        {/* DateInfo row: date · time · number of guests */}
        <View style={styles.dateInfoRow}>
          <View style={styles.dateInfoItem}>
            <Ionicons name="calendar-outline" size={13} color="#aaa" />
            <Text style={styles.dateInfoText}>{item.date}</Text>
          </View>
          <View style={styles.dateInfoItem}>
            <Ionicons name="time-outline" size={13} color="#aaa" />
            <Text style={styles.dateInfoText}>{item.time}</Text>
          </View>
          <View style={styles.dateInfoItem}>
            <Ionicons name="people-outline" size={13} color="#aaa" />
            <Text style={styles.dateInfoText}>{item.guests}</Text>
          </View>
        </View>
      </View>

      {/* Footer: estimated total + arrow */}
      <View style={styles.cardFooter}>
        <Text style={styles.footerPrice}>
          Est. total <Text style={styles.footerPriceBold}>{item.estimatedTotal}</Text>
        </Text>
        <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ReservationScreen() {
  const { reservationHistory, deleteReservationFromHistory } = useContext(CartContext);

  // Show the live reservation list from shared app state so it updates immediately after a booking is confirmed.
  const handleDeleteReservation = (reservationId) => {
    deleteReservationFromHistory(reservationId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReserveBg>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="menu" size={28} color="white" />
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero title */}
        <View style={styles.heroTitleContainer}>
          <Text style={styles.heroTitleText}>My Reservations</Text>
          <Text style={styles.heroSubtitleText}>Manage your reservations</Text>
        </View>

        {/* White bottom sheet or Card */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>All Reservations</Text>
            <TouchableOpacity style={styles.reservationButton} activeOpacity={0.8}>
              <Text style={styles.addReservationText}>Reserve a table</Text>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Show an empty state when there are no saved reservations. */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardList}>
            {reservationHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={52} color="#d2cac5" />
                <Text style={styles.emptyText}>You have no reservation yet. Tap “Reserve a table” to start!</Text>
              </View>
            ) : (
              reservationHistory.map((item) => (
                <ReservationCard key={item.id} item={item} onDelete={handleDeleteReservation} />
              ))
            )}
          </ScrollView>
        </View>
      </ReserveBg>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  heroTitleContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    zIndex: 10,
  },
  heroSubtitleText: {
    color: "#ff6b35",
    fontSize: 14,
    marginBottom: 4,
  },
  heroTitleText: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  /* Bottom sheet */
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.4,
  },
  reservationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ff6b35",
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  addReservationText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyText: {
    color: "#746d72",
    fontSize: 17,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 25,
    marginTop: 16,
  },
  deleteBtn: {
    backgroundColor: "#fde8e8",
    padding: 8,
    borderRadius: 10,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Card list */
  cardList: { gap: 14, paddingBottom: 32 },

  /* Card */
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
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },

  /* Status badge */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: "#fff5ef",
    borderColor: "#ffd5bf",
  },
  statusPending: {
    backgroundColor: "#eef7ee",
    borderColor: "#b8e0b8",
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextConfirmed: { color: "#ff6b35" },
  statusTextPending: { color: "#3a9c3a" },

  /* Cuisine tag */
  cuisineTag: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 10,
  },
  cuisineText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
    letterSpacing: 0.2,
  },

  /* Meta row */
  dateInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateInfoText: { 
    fontSize: 12, 
    color: "#888" 
  },

  /* Card footer */
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  footerPrice: { 
    fontSize: 13, 
    color: "#888" 
  },
  footerPriceBold: { 
    color: "#111", 
    fontWeight: "600" 
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
});