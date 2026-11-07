import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ReservationBackground from "../../Background/ReservationBackground";

const getAvatarStorageKey = (email) =>
  `profile-avatar:${email.trim().toLowerCase()}`;

export default function ProfileScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    username: "Jane Doe",
    email: "janedoe@gmail.com",
    avatar: null,
  });

  const [stats, setStats] = useState({
    favorites: 0,
    reservations: 0,
    orders: 0,
    paymentMethods: 0,
  });
  const [isGuest, setIsGuest] = useState(false);

  // Reload user profile from AsyncStorage whenever this screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const guestMode = (await AsyncStorage.getItem("isGuest")) === "true";
          setIsGuest(guestMode);

          if (guestMode) {
            // Guest profile is always the neutral default, never the last account.
            setUserData({
              username: "Jane Doe",
              email: "janedoe@gmail.com",
              avatar: null,
            });
            setStats({
              favorites: 0,
              reservations: 0,
              orders: 0,
              paymentMethods: 0,
            });
            return;
          }

          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const savedAvatar = await AsyncStorage.getItem(
              getAvatarStorageKey(parsed.email || "")
            );
            setUserData((prev) => ({
              ...prev,
              username: parsed.username || "Jane Doe",
              email: parsed.email || "janedoe@gmail.com",
              avatar: savedAvatar || parsed.avatarUri || null,
            }));
          }
        } catch (error) {
          console.log("Error loading user profile:", error);
        }
      };

      loadUserData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "user",
            "token",
            "isGuest",
            "notifications",
            "@restau/order-history",
            "@restau/reservation-history",
          ]);
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReservationBackground>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile/notifications")}>
            <Ionicons name="notifications-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Top Banner Section */}
        <View style={styles.topBanner}>
          <Text style={styles.bannerTitle}>My Profile</Text>
          <Text style={styles.bannerSubtitle}>Manage your profile</Text>
        </View>

        {/* Main Content Card */}
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Profile Card */}
            <View style={styles.profileBox}>
              <View style={styles.userInfoRow}>
                {/* Avatar Box */}
                <View style={styles.avatarCircle}>
                  {userData.avatar ? (
                    <Image
                      source={{ uri: userData.avatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={40} color="#ffffff" />
                  )}
                </View>

                {/* Updated Details */}
                <View style={styles.userDetails}>
                  <Text style={styles.usernameText}>{userData.username}</Text>
                  <Text style={styles.emailText}>{userData.email}</Text>
                </View>

                {!isGuest && (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push("/profile/editProfile")}
                  >
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              {/* Stats Bar */}
              <View style={styles.statsRow}>
                {/* Favorites */}
                <View style={styles.statItem}>
                  <Ionicons name="heart-outline" size={26} color="#f5921e" />
                  <Text style={styles.statNumber}>{stats.favorites}</Text>
                  <Text style={styles.statLabel}>Favorites</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Reservations */}
                <TouchableOpacity
                  style={styles.statItem}
                  disabled={isGuest}
                  onPress={() => router.push("/reservation")}
                >
                  <Ionicons name="calendar-outline" size={26} color="#f5921e" />
                  <Text style={styles.statNumber}>{stats.reservations}</Text>
                  <Text style={styles.statLabel}>Reservations</Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider} />

                {/* Orders */}
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push("/order-history")}
                >
                  <Ionicons name="list-outline" size={26} color="#f5921e" />
                  <Text style={styles.statNumber}>{stats.orders}</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider} />

                {/* Payment Methods */}
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push("/payment-settings")}
                >
                  <Ionicons name="card-outline" size={26} color="#f5921e" />
                  <Text style={styles.statNumber}>{stats.paymentMethods}</Text>
                  <Text style={styles.statLabel}>Payment Methods</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu List */}
            <View style={styles.menuContainer}>
              {!isGuest && (
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => router.push("/reservation")}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons name="calendar" size={20} color="#111" style={styles.menuIcon} />
                    <Text style={styles.menuText}>My Reservation</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#111" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push("/order/orderHistory")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="list"
                    size={20}
                    color="#111"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>Order History</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push("/payment-settings")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color="#111"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>Payment Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push("/notification")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#111"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push("/support")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#111"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lastMenuRow}
                onPress={handleLogout}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#e74c3c"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuText, { color: "#e74c3c" }]}>
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
  topBanner: {
    position: "absolute",
    top: 70,
    left: 20,
    zIndex: 10,
  },
  bannerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  bannerSubtitle: {
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
    backgroundColor: "#f9f9f9",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    zIndex: 3,
  },
  profileBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#f5921e",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  emailText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  editBtn: {
    borderWidth: 1.5,
    borderColor: "#f5921e",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editBtnText: {
    color: "#f5921e",
    fontSize: 13,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#eee",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 30,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lastMenuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
});