import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeBg from "../Background/HomeBg";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { height } = Dimensions.get("window");

const CATEGORIES = [
  { icon: "fast-food-outline", label: "Fried Rice" },
  { icon: "logo-no-smoking", label: "Chicken" },
  { icon: "pizza-outline", label: "Pizza" },
  { icon: "fast-food-outline", label: "Burgers" },
  { icon: "restaurant-outline", label: "Sharwama" },
  { icon: "grid-outline", label: "More" },
];

const POPULAR_PICKS = [
  {
    image: require("../../assets/images/grilled.jpg"),
    title: "Grilled Chicken",
    subtitle: "Spicy & Juicy",
    price: "4,000 FCFA",
  },
  {
    image: require("../../assets/images/burger_order.jpg"),
    title: "Beef Burger",
    subtitle: "Classic Beef",
    price: "3,500 FCFA",
  },
  {
    image: require("../../assets/images/pizza_order.jpg"),
    title: "Veggie Pizza",
    subtitle: "Fresh Veggies",
    price: "4,500 FCFA",
  },
  {
    image: require("../../assets/images/rices.jpg"),
    title: "Fish Tacos",
    subtitle: "Crispy Fish",
    price: "3,000 FCFA",
  },
];

export default function Homescreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Full-screen hero background */}
      <HomeBg>
        {/* Top bar — menu + notification */}
        <View style={styles.header}>
          <Ionicons name="menu" size={28} color="white" />
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero text — pushed below the header */}
        <View style={styles.heroText}>
          <Text style={styles.heading}>Good Food,</Text>
          <Text style={styles.headingAccent}>Great Times!</Text>
          <Text style={styles.subText}>
            Reserve your table and{"\n"}enjoy amazing meals.
          </Text>
        </View>

        {/* White card */}
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category row */}
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat, i) => (
                <View key={i} style={styles.catItem}>
                  <View
                    style={[
                      styles.iconCircle,
                      i === 0 && styles.iconCircleActive,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={i === 0 ? "#fff" : "#f5921e"}
                    />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </View>
              ))}
            </View>

            {/*Popular Picks */}

            <View style={styles.popularPicks}>
              <Text style={styles.popularPicksTitle}>Popular Picks</Text>
              <Text style={styles.popularPicksText}>View all</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularPicksGrid}
            >
              {POPULAR_PICKS.map((pick, index) => (
                <View key={index} style={styles.popularPicksGridCard}>
                  <Image source={pick.image} style={styles.popularPicksImage} />
                  <View style={{ padding: 10 }}>
                    <Text style={styles.pickTitle}>{pick.title}</Text>
                    <Text style={styles.pickSubtitle}>{pick.subtitle}</Text>
                    <Text style={styles.pickPrice}>{pick.price}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.extraMealCard}>
              {/* Text side */}
              <View style={styles.extraMealText}>
                <Text style={styles.extraMealTitle}>
                  Make it a{"\n"}Perfect Meal!
                </Text>
                <Text style={styles.extraMealSubtitle}>
                  Add sides, drinks and more{"\n"}to your order.
                </Text>
                <TouchableOpacity style={styles.extraMealButton}>
                  <Text style={styles.extraMealButtonText}>Add Extras</Text>
                </TouchableOpacity>
              </View>

              {/* Image — overflows top of card */}
              <Image
                source={require("../../assets/images/burger-hero.png")}
                style={styles.extraMealImage}
              />
            </View>
          </ScrollView>
        </View>
      </HomeBg>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  //header
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },

  //hero text
  heroText: {
    position: "absolute",
    top: 90,
    left: 20,
    zIndex: 5,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
  },
  headingAccent: {
    fontSize: 30,
    fontWeight: "700",
    color: "#f5921e",
  },
  subText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    lineHeight: 20,
  },

  //card
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "62%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 16,
    zIndex: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
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

  //popular picks
  popularPicks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  popularPicksTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#241d26",
  },
  popularPicksText: {
    fontSize: 14,
    color: "#f5921e",
  },
  popularPicksGrid: {
    flexDirection: "row",
    paddingBottom: 8,
  },
  popularPicksGridCard: {
    width: 140,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  popularPicksImage: {
    width: "100%",
    height: 110,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  pickTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#241d26",
    marginTop: 8,
  },
  pickSubtitle: {
    fontSize: 14,
    color: "#514b54",
    marginTop: 4,
  },
  pickPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f5921e",
    marginTop: 8,
  },
  //bottom card
  extraMealCard: {
  backgroundColor: "rgba(0,0,0,0.95)",
  borderRadius: 16,
  marginTop: 24,
  marginBottom: 24,
  flexDirection: "row",
  alignItems: "flex-end",
  overflow: "visible",      
  minHeight: 160,
  paddingLeft: 20,
  paddingVertical: 20,
},
extraMealText: {
  flex: 1,
  justifyContent: "center",
},
extraMealTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#fff",
  marginBottom: 6,
},
extraMealSubtitle: {
  fontSize: 12,
  color: "rgba(255,255,255,0.7)",
  marginBottom: 16,
  lineHeight: 18,
},
extraMealButton: {
  backgroundColor: "#f5921e",
  alignSelf: "flex-start",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 8,
},
extraMealButtonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 13,
},
extraMealImage: {
  width: 170,
  height: 190,
  resizeMode: "contain",
  marginBottom: -20,          
  marginTop: -40,           
},
});
