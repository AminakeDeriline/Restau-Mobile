import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

export default function TabLayout() {
  // This count controls the red dot on the bottom Notifications tab.
  const [unreadCount, setUnreadCount] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const loadGuestState = async () => {
      setIsGuest((await AsyncStorage.getItem("isGuest")) === "true");
    };

    loadGuestState();
  }, []);

  // Refresh the count whenever the tab navigator becomes active.
  // This catches new welcome, reservation, and order messages.
  const loadUnreadCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (isGuest) {
        // The local Guest welcome notification is unread by default.
        setUnreadCount(1);
        return;
      }

      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await API.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Only notifications with isRead=false should produce the red dot.
      const unreadNotifications = response.data.filter(
        (notification) => !notification.isRead
      );
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      // The notification screen displays the full error. The tab remains usable.
      console.error("Failed to load unread notification count:", error);
    }
  }, [isGuest]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  // Refresh periodically so a reservation made on another tab updates this badge.
  useEffect(() => {
    const refreshTimer = setInterval(loadUnreadCount, 10000);

    // Always clear the timer when the tab navigator is unmounted.
    return () => clearInterval(refreshTimer);
  }, [loadUnreadCount]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f5921e",
        tabBarInactiveTintColor: "gray",

        tabBarStyle: {
          height: 82,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          borderTopColor: "#f0f0f0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          alignItems: "center",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="Homescreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reservation"
        options={{
          title: "Reservation",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="ReservationScreen" options={{ href: null }} />

      <Tabs.Screen
        name="order"
        options={{
          title: "Order",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
     
     <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          // A space tells React Navigation to render the badge; the style makes it a dot.
          tabBarBadge: unreadCount > 0 ? " " : undefined,
          tabBarBadgeStyle: styles.unreadBadge,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
        
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = {
  unreadBadge: {
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    padding: 0,
    backgroundColor: "#e53935",
    color: "transparent",
    top: 2,
    right: 2,
  },
};
