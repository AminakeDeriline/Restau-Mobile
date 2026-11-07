import { View, ImageBackground, StyleSheet } from 'react-native';
import React from 'react';

const ReserveBg = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/images/reserve-hero.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
};

export default ReserveBg;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: "180%",
    width: "100%"
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
