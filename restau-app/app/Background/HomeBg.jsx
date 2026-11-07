import { View, Image, StyleSheet } from "react-native";
import React from "react";

const HomeBg = ({ children }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/hero.jpeg")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>{children}</View>
    </View>
  );
};

export default HomeBg;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",   //clips the image so it doesn't bleed out
  },
  image: {
    position: "absolute",
    width: "90%",        //make it wider than the screen
    height: "70%",        //only fill the top portion
    top: -15,              //anchor to top
    left: 110,             //anchor to left
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});