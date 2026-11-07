import React, { useState, useContext } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReservationBackground from "../../Background/ReservationBackground";
import { CartContext } from "../../context/CartContext";
import API from "../../../services/api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function BookingField({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity
      style={styles.bookingField}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name={icon} size={21} color="#514d53" />
      <View style={styles.fieldCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={21} color="#777077" />
    </TouchableOpacity>
  );
}

function CalendarPicker({ selectedDate, month, onMonthChange, onSelect }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const days = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: dayCount }, (_, i) => i + 1),
  ];
  const isSelected = (day) =>
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === monthIndex &&
    selectedDate.getDate() === day;

  return (
    <View>
      <View style={styles.pickerHeader}>
        <TouchableOpacity
          onPress={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
        >
          <Ionicons name="chevron-back" size={23} color="#332d34" />
        </TouchableOpacity>
        <Text style={styles.pickerTitle}>
          {month.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <TouchableOpacity
          onPress={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
        >
          <Ionicons name="chevron-forward" size={23} color="#332d34" />
        </TouchableOpacity>
      </View>
      <View style={styles.calendarGrid}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
        {days.map((day, idx) =>
          day ? (
            <TouchableOpacity
              key={`${day}-${idx}`}
              style={[styles.day, isSelected(day) && styles.selectedDay]}
              onPress={() => onSelect(new Date(year, monthIndex, day))}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected(day) && styles.selectedDayText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ) : (
            <View key={`empty-${idx}`} style={styles.day} />
          )
        )}
      </View>
    </View>
  );
}

export default function ReserveATableScreen() {
  const [reservationDate, setReservationDate] = useState(new Date());
  const [guests, setGuests] = useState(1);
  const [pickerMode, setPickerMode] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // State to manage loading during EmailJS call
  const [loading, setLoading] = useState(false);

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const [manualTime, setManualTime] = useState(() => {
    const h = reservationDate.getHours();
    const m = reservationDate.getMinutes();
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")}`;
  });
  const [manualPeriod, setManualPeriod] = useState(() =>
    reservationDate.getHours() >= 12 ? "PM" : "AM"
  );

  // Read the shared order and reservation history from context so the app updates immediately after each message is sent.
  const {
    cart,
    clearCart,
    setCart,
    addOrderToHistory,
    addReservationToHistory,
  } = useContext(CartContext);

  const formattedDate = reservationDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = reservationDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const selectDate = (date) => {
    setReservationDate(
      (current) =>
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          current.getHours(),
          current.getMinutes()
        )
    );
    setPickerMode(null);
  };

  const selectTime = (time) => {
    const [clock, period] = time.split(" ");
    let [hour, minute] = clock.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    setReservationDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate(),
          hour,
          minute
        )
    );
    setPickerMode(null);
  };

  const formatManualToPicker = (timeStr, period) => {
    if (!timeStr) return null;
    const cleaned = timeStr.replace(/\s+/g, "");
    const parts = cleaned.split(":");
    let hour = parseInt(parts[0], 10);
    let minute = parts[1] ? parseInt(parts[1].padEnd(2, "0"), 10) : 0;
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    hour = Math.max(1, Math.min(12, hour));
    minute = Math.max(0, Math.min(59, minute));
    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Helper function to safely reset cart items
  const resetCartItems = () => {
    if (typeof clearCart === "function") {
      clearCart();
    } else if (typeof setCart === "function") {
      setCart([]);
    }
  };

  const showAlert = (title, message) => {
    setAlertConfig({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: "", message: "" });
  };

  // ==========================================
  // EMAILJS INTEGRATION LOGIC
  // ==========================================
  const handleConfirmReservation = async () => {
    if ((await AsyncStorage.getItem("isGuest")) === "true") {
      showAlert(
        "Guest restriction",
        "You cannot reserve a table as a guest. Please log in first."
      );
      return;
    }

    const EMAILJS_SERVICE_ID = "service_bt1d3t9";
    const EMAILJS_TEMPLATE_ID = "template_tzc135b";
    const EMAILJS_PUBLIC_KEY = "Of3CfR86nTn2YWD_Q";

    setLoading(true);

    // Format cart items list
    const formattedFoodOrders =
      cart && cart.length > 0
        ? cart
            .map(
              (item) =>
                `- ${item.name} (x${item.quantity}) - ${(
                  item.price * item.quantity
                ).toLocaleString()} FCFA`
            )
            .join("\n")
        : "No food items ordered";

    // Calculate total price
    const calculateTotal = () => {
      if (!cart || cart.length === 0) return "0 FCFA";
      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return `${total.toLocaleString()} FCFA`;
    };

    // Map parameters
    const templateParams = {
      user_name: "Jane Doe",
      user_email: "janedoe@gmail.com",
      date: formattedDate,
      time: formattedTime,
      guests: guests.toString(),
      food_orders: formattedFoodOrders,
      total_price: calculateTotal(),
    };

    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: `${formattedDate} ~ ${formattedTime}`,
      totalPrice,
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: templateParams,
          }),
        }
      );

      if (response.ok) {
        // EmailJS only sends the email. The backend call below saves the reservation
        // and creates the Reservation Confirmed and New Order notifications in MongoDB.
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          throw new Error("You must be logged in to create a reservation.");
        }

        await API.post(
          "/reservations",
          {
            restaurant: "The Gourmet Kitchen",
            // Store one complete date so the backend can use it for future reminders.
            reservationDate: reservationDate.toISOString(),
            guests,
            foodOrders: cart.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            totalPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Keep the existing local history in sync after the database succeeds.
        addOrderToHistory(newOrder);
        addReservationToHistory({
          id: `RES-${Date.now()}`,
          restaurant: "The Gourmet Kitchen",
          cuisine: "Chef's special menu",
          date: formattedDate,
          time: formattedTime,
          guests,
          status: "Confirmed",
          estimatedTotal: `${totalPrice.toLocaleString()} FCFA`,
          image: require("../../../assets/images/home-food.jpg"),
        });
        resetCartItems();
        showAlert(
          "Reservation Confirmed",
          "Your order and reservation history have been updated."
        );
      } else {
        console.error("EmailJS request failed:", await response.text());
        showAlert("Error", "Failed to process reservation. Please try again.");
      }
    } catch (error) {
      console.error("EmailJS network request failed:", error);
      showAlert("Error", "The request took too long. Please try again.");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ReservationBackground>
        <View style={styles.hero}>
          <View style={styles.heroIcons}>
            <TouchableOpacity
              onPress={() => router.replace("/reservation")}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={27} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons name="notifications-outline" size={27} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Reserve a Table</Text>
          <Text style={styles.subtitle}>Choose a date and time</Text>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <BookingField
              icon="calendar-outline"
              label="Date"
              value={formattedDate}
              onPress={() => {
                setCalendarMonth(
                  new Date(
                    reservationDate.getFullYear(),
                    reservationDate.getMonth(),
                    1
                  )
                );
                setPickerMode("date");
              }}
            />

            <BookingField
              icon="time-outline"
              label="Time"
              value={formattedTime}
              onPress={() => {
                setManualTime(() => {
                  const h = reservationDate.getHours();
                  const m = reservationDate.getMinutes();
                  const hour12 = h % 12 === 0 ? 12 : h % 12;
                  return `${hour12}:${m.toString().padStart(2, "0")}`;
                });
                setManualPeriod(
                  reservationDate.getHours() >= 12 ? "PM" : "AM"
                );
                setPickerMode("editTime");
              }}
            />

            <View style={styles.bookingField}>
              <Ionicons name="people-outline" size={21} color="#514d53" />
              <View style={styles.fieldCopy}>
                <Text style={styles.fieldLabel}>Number of People</Text>
                <Text style={styles.fieldValue}>{guests}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[
                    styles.stepButton,
                    guests === 1 && styles.disabledStepButton,
                  ]}
                  onPress={() => setGuests((v) => Math.max(1, v - 1))}
                  disabled={guests === 1}
                >
                  <Ionicons name="remove" size={19} color="#d77718" />
                </TouchableOpacity>
                <Text style={styles.guestCount}>{guests}</Text>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => setGuests((v) => v + 1)}
                >
                  <Ionicons name="add" size={19} color="#d77718" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.orderSection}>
              <Text style={styles.orderTitle}>Your Order</Text>
              {cart && cart.length > 0 ? (
                cart.map((it) => (
                  <View
                    key={it.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                    }}
                  >
                    {it.image ? (
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          overflow: "hidden",
                          marginRight: 12,
                        }}
                      >
                        <Image
                          source={it.image}
                          style={{ width: 56, height: 56 }}
                        />
                      </View>
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "800" }}>{it.name}</Text>
                      <Text style={{ color: "#706973" }}>
                        {(it.price * it.quantity).toLocaleString()} FCFA
                      </Text>
                    </View>
                    <Text style={{ fontWeight: "800" }}>x{it.quantity}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyOrder}>
                  You have no order yet. Go to order screen
                </Text>
              )}
            </View>

            {/* CONFIRM RESERVATION BUTTON */}
            <TouchableOpacity
              style={[styles.confirmButton, loading && { opacity: 0.7 }]}
              onPress={handleConfirmReservation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm Reservation</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* CUSTOM ALERT MODAL */}
        <Modal
          visible={alertConfig.visible}
          transparent
          animationType="fade"
          onRequestClose={hideAlert}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.alertBox}>
              <Ionicons
                name={
                  alertConfig.title === "Error"
                    ? "alert-circle"
                    : "checkmark-circle"
                }
                size={48}
                color={alertConfig.title === "Error" ? "#d9534f" : "#28a745"}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={hideAlert}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* CALENDAR MODAL */}
        {pickerMode === "date" && (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setPickerMode(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <CalendarPicker
                  selectedDate={reservationDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  onSelect={selectDate}
                />
                <TouchableOpacity
                  style={styles.modalDismiss}
                  onPress={() => setPickerMode(null)}
                >
                  <Text style={styles.modalDismissText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* EDIT TIME MODAL */}
        {pickerMode === "editTime" && (
          <Modal
            visible
            transparent
            animationType="slide"
            onRequestClose={() => setPickerMode(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enter time</Text>
                <View style={styles.timeRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={manualTime}
                    onChangeText={setManualTime}
                    placeholder="7:00"
                    keyboardType="numeric"
                  />
                  <View style={styles.periodToggle}>
                    <TouchableOpacity
                      style={[
                        styles.periodButton,
                        manualPeriod === "AM" && styles.periodActive,
                      ]}
                      onPress={() => setManualPeriod("AM")}
                    >
                      <Text
                        style={[
                          styles.periodText,
                          manualPeriod === "AM" && styles.periodTextActive,
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.periodButton,
                        manualPeriod === "PM" && styles.periodActive,
                      ]}
                      onPress={() => setManualPeriod("PM")}
                    >
                      <Text
                        style={[
                          styles.periodText,
                          manualPeriod === "PM" && styles.periodTextActive,
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setPickerMode(null)}
                    style={styles.modalCancel}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const formatted = formatManualToPicker(
                        manualTime,
                        manualPeriod
                      );
                      if (formatted) selectTime(formatted);
                      else setPickerMode(null);
                    }}
                    style={styles.modalConfirm}
                  >
                    <Text style={styles.modalConfirmText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ReservationBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#26140c" },
  hero: { height: "37%", paddingHorizontal: 20, paddingTop: 8 },
  heroIcons: { flexDirection: "row", justifyContent: "space-between" },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 31,
    fontWeight: "800",
    marginTop: 36,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 5,
  },
  subtitle: {
    color: "#ffe6cc",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  bookingField: {
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: "#f5f4f6",
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldCopy: { flex: 1, marginLeft: 14 },
  fieldLabel: { color: "#5f5961", fontSize: 13, fontWeight: "700" },
  fieldValue: { color: "#242126", fontSize: 16, fontWeight: "800", marginTop: 3 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepButton: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: "#e6ad62",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledStepButton: { opacity: 0.45 },
  guestCount: { color: "#2c282d", fontSize: 16, fontWeight: "800" },
  orderSection: { marginTop: 17, minHeight: 137 },
  orderTitle: { color: "#171318", fontSize: 21, fontWeight: "800" },
  emptyOrder: {
    color: "#706973",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 23,
    marginTop: 36,
    paddingHorizontal: 18,
  },
  confirmButton: {
    minHeight: 63,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff8b17",
    shadowColor: "#c96300",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  confirmText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 14, padding: 18, width: "100%" },
  modalDismiss: { marginTop: 12, alignSelf: "flex-end" },
  modalDismissText: { color: "#d44f00", fontWeight: "700" },
  modalContent: { backgroundColor: "#fff", borderRadius: 14, padding: 18, width: "100%" },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  timeInput: {
    flex: 0,
    width: 140,
    borderWidth: 1,
    borderColor: "#e6e0df",
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    backgroundColor: "#fff",
  },
  periodToggle: {
    flexDirection: "row",
    marginLeft: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 0,
    alignItems: "center",
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0,
    marginHorizontal: 4,
    backgroundColor: "transparent",
  },
  periodActive: { backgroundColor: "#ff8b17" },
  periodText: { color: "#333", fontWeight: "700" },
  periodTextActive: { color: "#fff" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: "#444", fontWeight: "700" },
  modalConfirm: {
    backgroundColor: "#ff8b17",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalConfirmText: { color: "#fff", fontWeight: "800" },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  pickerTitle: { fontWeight: "800", fontSize: 16 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: "#666",
    marginBottom: 6,
  },
  day: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  dayText: { color: "#333" },
  selectedDay: { backgroundColor: "#ff8b17" },
  selectedDayText: { color: "#fff", fontWeight: "800" },
  /* CUSTOM ALERT MODAL STYLES */
  alertBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#242126",
    marginBottom: 8,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 15,
    color: "#5f5961",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 21,
  },
  alertButton: {
    backgroundColor: "#ff8b17",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});