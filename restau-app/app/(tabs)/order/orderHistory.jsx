import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ReservationBackground from "../../Background/ReservationBackground";
import { CartContext } from "../../context/CartContext";

export default function OrderHistoryScreen() {
  const router = useRouter();

  // This order history sits in the shared app state so it updates immediately after a reservation is confirmed.
  const { orderHistory, deleteOrderFromHistory } = useContext(CartContext);

  // Handler to delete an order from history.
  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      "Delete Order",
      "Are you sure you want to delete this order from history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteOrderFromHistory(orderId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReservationBackground>
        {/* Top Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Order History</Text>
          <Text style={styles.heroSubtitle}>View your past orders</Text>
        </View>

        {/* White Main Card */}
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
            {orderHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>You have no order yet. Start by placing one from the order screen.</Text>
              </View>
            ) : (
              orderHistory.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order ID & Date Header */}
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>

                    {/* Trash / Delete Icon */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteOrder(order.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>

                  {/* Order Table Headers */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.columnTitle, { flex: 2 }]}>Item</Text>
                    <Text style={[styles.columnTitle, { flex: 1, textAlign: "center" }]}>
                      Quantity
                    </Text>
                    <Text style={[styles.columnTitle, { flex: 1.5, textAlign: "right" }]}>
                      Price
                    </Text>
                  </View>

                  {/* Order Items List */}
                  {order.items.map((item, index) => (
                    <View key={`${order.id}-${index}`} style={styles.tableRow}>
                      <Text style={[styles.itemText, { flex: 2 }]}>{item.name}</Text>
                      <Text style={[styles.itemText, { flex: 1, textAlign: "center", color: "#666" }]}>
                        x{item.quantity}
                      </Text>
                      <Text style={[styles.itemText, { flex: 1.5, textAlign: "right" }]}>
                        {item.price.toLocaleString()} FCFA
                      </Text>
                    </View>
                  ))}

                  {/* Total Price Footer */}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Price</Text>
                    <Text style={styles.totalValue}>
                      {order.totalPrice.toLocaleString()} FCFA
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ReservationBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  heroSection: {
    position: "absolute",
    top: 70,
    left: 20,
    zIndex: 10,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  heroSubtitle: {
    color: "#ff6b35",
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 190,
    backgroundColor: "#fff7f1",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    zIndex: 3,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#f0d7c5",
    elevation: 5,
    shadowColor: "#6b3216",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  historyList: { paddingTop: 2, paddingBottom: 28 },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  orderDate: {
    fontSize: 12,
    color: "#5e5961",
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: "#fde8e8",
    padding: 8,
    borderRadius: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  columnTitle: {
    fontSize: 13,
    color: "#514b54",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  itemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f5921e",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: "#625c65",
    fontSize: 15,
  },
});
