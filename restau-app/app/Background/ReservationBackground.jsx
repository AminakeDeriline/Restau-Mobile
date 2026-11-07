import { ImageBackground, StyleSheet, View } from "react-native";

// Shared, darkened photo treatment keeps text readable and visually connects
// the parent Reservation screen with its Reserve a table sub-screen.
export default function ReservationBackground({ children }) {
  return (
    <ImageBackground source={require("../../assets/images/reserve-hero.jpeg")} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({ background: { flex: 1 }, overlay: { flex: 1, backgroundColor: "rgba(57, 24, 13, 0.48)" } });
