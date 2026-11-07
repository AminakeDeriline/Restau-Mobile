import { View, ImageBackground, StyleSheet } from 'react-native';
import React from 'react';

const Background = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/images/hero-food.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
};

export default Background;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: "100%",
    width: "100%"
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
