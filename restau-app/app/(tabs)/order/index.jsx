import React, { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { CartContext } from '../../context/CartContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Importing your background component (Pizza Background)
import ReservationBackground from "../../Background/ReservationBackground";

const CATEGORIES = [
  { id: "all", icon: "grid-outline", label: "All" },
  { id: "chicken", icon: "logo-no-smoking", label: "Chicken" },
  { id: "pizza", icon: "pizza-outline", label: "Pizza" },
  { id: "burgers", icon: "fast-food-outline", label: "Burger & Drinks" },
  { id: "shawarma", icon: "restaurant-outline", label: "Sharwama" },
  { id: "fried-rice", icon: "fast-food-outline", label: "Fried Rice" },
];

export default function OrderScreen() {

  const router = useRouter(); 
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // ... your other state variables
  // Array of 6 food items matching your design
  const [foodItems, setFoodItems] = useState([
    {
      id: "1",
      name: "Fresh Mimosa",
      category: "burgers",
      price: 1500,
      quantity: 1,
      isAdded: true, // Example state for "Added" button
      image: require("../../../assets/images/mimosa_order.jpg"),
    },
    {
      id: "2",
      name: "Fried Rice",
      category: "fried-rice", // if you want to use fried tice like from thesame category maintain the name
      price: 3000,
      quantity: 1,
      isAdded: false,
            image: require("../../../assets/images/rice_order.jpg"),
    },
    {
      id: "3",
      name: "Chicken Burger",
      category: "burgers",
      price: 3500,
      quantity: 1,
      isAdded: false,
            image: require("../../../assets/images/burger_order.jpg"),
    },
    {
      id: "4",
      name: "Chicken Sharwarma",
      category: "shawarma",
      price: 2000,
      quantity: 1,
      isAdded: false,
            image: require("../../../assets/images/shawarma_order.jpg"),
    },
    {
      id: "5",
      name: "Pepperoni Pizza",
      category: "pizza",
      price: 6000,
      quantity: 1,
      isAdded: false,
            image: require("../../../assets/images/pizza_order.jpg"),
    },
    {
      id: "6",
      name: "Margherita",
      category: "burgers",
      price: 5000,
      quantity: 1,
      isAdded: false,
      image: require("../../../assets/images/Margherita_order.jpg"),
    },
  ]);

  // Handler to increase quantity
  const handleIncrement = (id) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Handler to decrease quantity (Minimum 1)
  const handleDecrement = (id) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Handler to toggle Add/Added state
  const handleToggleAdd = (id) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isAdded: !item.isAdded } : item
      )
    );
  };

  const { setCart } = useContext(CartContext);

  // Calculate total items (sum of quantities of items marked as added)
  const totalItemsCount = foodItems
    .filter((item) => item.isAdded)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price of added items
  const totalPrice = foodItems
    .filter((item) => item.isAdded)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const visibleFoodItems =
    selectedCategory === "all"
      ? foodItems
      : foodItems.filter((item) => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Wrapper Component */}
      <ReservationBackground>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero Title and Order History Button */}
        <View style={styles.heroSection}>
          <View>
            <Text style={styles.heroTitle}>My Order</Text>
            <Text style={styles.heroSubtitle}>Manage your order</Text>
          </View>

          <TouchableOpacity style={styles.orderHistoryBtn} onPress={() => router.push("/order/orderHistory")}>
            <Ionicons name="receipt-outline" size={18} color="white" />
            <Text style={styles.orderHistoryText}>Order History</Text>
          </TouchableOpacity>
        </View>

        {/* White Card Container */}
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>

             {/* Category row */}
                      <View style={styles.categoryRow}>
                        {CATEGORIES.map((cat) => {
                          const isSelected = cat.id === selectedCategory;

                          return (
                          <TouchableOpacity
                            key={cat.id}
                            style={styles.catItem}
                            onPress={() => setSelectedCategory(cat.id)}
                            activeOpacity={0.75}
                          >
                            <View
                              style={[
                                styles.iconCircle,
                                isSelected && styles.iconCircleActive,
                              ]}
                            >
                              <Ionicons
                                name={cat.icon}
                                size={22}
                                color={isSelected ? "#fff" : "#f5921e"}
                              />
                            </View>
                            <Text style={[styles.catLabel, isSelected && styles.catLabelActive]}>{cat.label}</Text>
                          </TouchableOpacity>
                          );
                        })}
                      </View>
          

            {/* 2-Column Food Grid */}
            <View style={styles.gridContainer}>
              {visibleFoodItems.map((item) => (
                <View key={item.id} style={styles.foodCard}>
                  {/* Image Placeholder */}
                  <View style={styles.imagePlaceholder}>
                    {item.image ? (
                      <Image source={item.image} style={styles.foodImage} />
                    ) : (
                      <Ionicons name="image-outline" size={32} color="#aaa" />
                    )}
                  </View>

                  {/* Food Name & Price */}
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>
                    {(item.price * item.quantity).toLocaleString()} FCFA
                  </Text>

                  {/* Quantity Counter Row */}
                  <View style={styles.counterRow}>
                    <TouchableOpacity onPress={() => handleDecrement(item.id)}>
                      <Ionicons
                        name="remove-circle-outline"
                        size={26}
                        color="#f5921e"
                      />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleIncrement(item.id)}>
                      <Ionicons
                        name="add-circle-outline"
                        size={26}
                        color="#f5921e"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Add / Added Button */}
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      item.isAdded && styles.addedButton,
                    ]}
                    onPress={() => handleToggleAdd(item.id)}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        item.isAdded && styles.addedButtonText,
                      ]}
                    >
                      {item.isAdded ? "Added" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Total Items & Price Summary Box */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{totalItemsCount} items</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 10 }]}>
                <Text style={styles.summaryLabel}>Total Price</Text>
                <Text style={styles.summaryValueBold}>
                  {totalPrice.toLocaleString()}FCFA
                </Text>
              </View>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
              style={styles.placeOrderBtn}
              onPress={() => {
                const cartItems = foodItems.filter((i) => i.isAdded).map((it) => ({ id: it.id, name: it.name, price: it.price, quantity: it.quantity, image: it.image }));
                setCart(cartItems);
                router.push("/reservation/reserve-a-table");
              }}
            >
              <Text style={styles.placeOrderText}>Place Order</Text>
              <View style={styles.placeOrderRight}>
                <Text style={styles.placeOrderPrice}>
                  {totalPrice.toLocaleString()}FCFA
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </TouchableOpacity>
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
    zIndex: 10,
  },
  heroSection: {
    position: "absolute",
    top: 65,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  heroSubtitle: {
    color: "#ffe2c4",
    fontSize: 14,
    marginTop: 2,
  },
  orderHistoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f5921e",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  orderHistoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 190,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    zIndex: 3,
  },
  /* Grid styling for 2 cards per row */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  foodCard: {
    width: "50%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imagePlaceholder: {
    width: "100%",
    height: 130,
    backgroundColor: "#f4f4f4",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  foodImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },
  foodPrice: {
    fontSize: 13,
    color: "#f5921e",
    fontWeight: "600",
    marginVertical: 4,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "bold",
    marginHorizontal: 12,
    color: "#111",
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: "#f5921e",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  addedButton: {
    backgroundColor: "#f5921e",
    borderColor: "#f5921e",
  },
  addButtonText: {
    color: "#f5921e",
    fontSize: 14,
    fontWeight: "bold",
  },
  addedButtonText: {
    color: "white",
  },
  /* Order Summary Box */
  summaryContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#454047",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  /* Place Order Button */
  placeOrderBtn: {
    backgroundColor: "#f5921e",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  placeOrderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeOrderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeOrderPrice: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 8,
  },
  
  //categories
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  catItem: {
    alignItems: "center",
    gap: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffe0b2",
  },
  iconCircleActive: {
    backgroundColor: "#f5921e",
    borderColor: "#f5921e",
  },
  catLabel: {
    fontSize: 9,
    color: "#39333a",
    textAlign: "center",
  },
  catLabelActive: {
    color: "#f5921e",
    fontWeight: "700",
  },

});
