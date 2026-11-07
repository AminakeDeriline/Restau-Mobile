import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Background from "./Background/Background";
import {
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <Background>
        {/* Logo */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.image}
        />

        {/* Title and Subtitle */}
        <View>
          <Text style={styles.title}>
            Welcome to{"\n"}
            <Text style={styles.brand}>DineEasy</Text>
          </Text>

          <Text style={styles.subtitle}>
            Reserve your table and enjoy{"\n"}
            amazing meals anytime
          </Text>
        </View>

        {/* Features Card */}
        <View style={styles.card}>
          <View style={styles.cardContentContainer}>
            {/* Reservation */}
            <View style={styles.featureItem}>
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons
                  name="table-chair"
                  size={24}
                  color="#ff6b35"
                />
              </View>
              <Text style={styles.cardText}>Easy Reservations</Text>
            </View>

            {/* Food */}
            <View style={styles.featureItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons
                  name="restaurant"
                  size={24}
                  color="#ff6b35"
                />
              </View>
              <Text style={styles.cardText}>Delicious Food</Text>
            </View>

            {/* Groups */}
            <View style={styles.featureItem}>
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#ff6b35"
                />
              </View>
              <Text style={styles.cardText}>For Groups</Text>
            </View>

            {/* Security */}
            <View style={styles.featureItem}>
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={24}
                  color="#ff6b35"
                />
              </View>
              <Text style={styles.cardText}>Secure & Trusted</Text>
            </View>
          </View>
        </View>

        {/**Small dots */}
        <View style={styles.dotsContainer}>
            <View style={[styles.dot, { backgroundColor: "#ff6b35" }]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
        </View>

        {/**Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity> 
      </Background>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
    resizeMode: "contain",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    //marginTop: 20,
  },

  brand: {
    fontSize: 58,
    color: "#ff6b35",
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 20,
    color: "#f0f0f0",
    textAlign: "center",
    //marginTop: 15,
    lineHeight: 28,
  },

  card: {
    position: "absolute",
    bottom: 150,
    left: 15,
    right: 15,
    backgroundColor: "rgba(18,18,18,0.9)",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#535353ff",
  },

  cardContentContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },

  featureItem: {
    alignItems: "center",
    flex: 1,
  },

  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A1A00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  cardText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    gap: 10,
    bottom: 100,
    left: 0,
    right: 0,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#535353ff",
    marginHorizontal: 5,
  },
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ff6b35",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});