import React, { createContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const ORDER_HISTORY_KEY = '@restau/order-history';
const RESERVATION_HISTORY_KEY = '@restau/reservation-history';

export const CartContext = createContext({
  cart: [],
  setCart: () => {},
  clearCart: () => {},
  orderHistory: [],
  addOrderToHistory: () => {},
  reservationHistory: [],
  addReservationToHistory: () => {},
  deleteOrderFromHistory: () => {},
  deleteReservationFromHistory: () => {},
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const storageWriteQueue = useRef(Promise.resolve());

  const queueStorageWrite = (key, value) => {
    storageWriteQueue.current = storageWriteQueue.current
      .catch(() => {})
      .then(async () => {
        // Guest history belongs only to the current app session.
        if ((await AsyncStorage.getItem('isGuest')) === 'true') {
          await AsyncStorage.removeItem(key);
          return;
        }

        await AsyncStorage.setItem(key, JSON.stringify(value));
      })
      .catch((error) => console.error(`Failed to save ${key}:`, error));
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        if ((await AsyncStorage.getItem('isGuest')) === 'true') {
          // Never restore another Guest's or user's local history.
          await AsyncStorage.multiRemove([
            ORDER_HISTORY_KEY,
            RESERVATION_HISTORY_KEY,
          ]);
          return;
        }

        const [savedOrders, savedReservations] = await AsyncStorage.multiGet([
          ORDER_HISTORY_KEY,
          RESERVATION_HISTORY_KEY,
        ]);

        if (savedOrders[1]) setOrderHistory(JSON.parse(savedOrders[1]));
        if (savedReservations[1]) {
          setReservationHistory(JSON.parse(savedReservations[1]));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setStorageReady(true);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    const guestSessionSubscription = DeviceEventEmitter.addListener(
      'guest-session-started',
      async () => {
        // Reset this provider immediately when a new Guest enters.
        setCart([]);
        setOrderHistory([]);
        setReservationHistory([]);
        await AsyncStorage.multiRemove([
          ORDER_HISTORY_KEY,
          RESERVATION_HISTORY_KEY,
        ]);
      }
    );

    return () => guestSessionSubscription.remove();
  }, []);

  useEffect(() => {
    if (storageReady) {
      queueStorageWrite(ORDER_HISTORY_KEY, orderHistory);
    }
  }, [orderHistory, storageReady]);

  useEffect(() => {
    if (storageReady) {
      queueStorageWrite(RESERVATION_HISTORY_KEY, reservationHistory);
    }
  }, [reservationHistory, storageReady]);

  // Shared cart helper to reset the active order after the reservation is confirmed.
  const clearCart = () => setCart([]);

  // Save a completed order so every screen can read the latest order history.
  const addOrderToHistory = (order) => {
    setOrderHistory((prevOrders) => [order, ...prevOrders]);
  };

  // Save a completed reservation so the reservation history stays in sync.
  const addReservationToHistory = (reservation) => {
    setReservationHistory((prevReservations) => [reservation, ...prevReservations]);
  };

  // Remove a single item from each history list when the user deletes it.
  const deleteOrderFromHistory = (orderId) => {
    setOrderHistory((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
  };

  const deleteReservationFromHistory = (reservationId) => {
    setReservationHistory((prevReservations) =>
      prevReservations.filter((reservation) => reservation.id !== reservationId)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        clearCart,
        orderHistory,
        addOrderToHistory,
        reservationHistory,
        addReservationToHistory,
        deleteOrderFromHistory,
        deleteReservationFromHistory,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
