import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Ya no necesitas importar Font, SplashScreen, useEffect, o useState aquí

export default function WelcomeScreen() {
  const router = useRouter();

  // No necesitamos el useEffect ni el 'if (!fontsLoaded)'
  // porque _layout.tsx se encarga de eso.

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Image
          source={require("./assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain" // <-- ARREGLADO: 'resizeMode' va aquí como prop
        />
        <Text style={styles.welcome}>Bienvenido!</Text>
        <Text style={styles.description}>
          En Frescapp, somos tu plaza online, ¡permítenos ir a la plaza por ti!
        </Text>
      </View>

      <Image
        source={require("./assets/images/fruits.png")}
        style={styles.fruits}
        resizeMode="contain" // <-- ARREGLADO: 'resizeMode' va aquí como prop
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Iniciar →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  topContent: {
    alignItems: "center",
    paddingTop: 60,
  },
  logo: {
    width: 220,
    height: 120,
    // quitamos 'resizeMode' de aquí
    marginBottom: 25,
  },
  welcome: {
    fontSize: 64,
    color: "#fff",
    fontFamily: "LiuJianMaoCao-Regular", // <-- Esto funcionará
    marginBottom: 20,
  },
  description: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    maxWidth: "85%",
    lineHeight: 26,
    fontFamily: "Poppins-Regular", // <-- Esto funcionará
  },
  fruits: {
    width: 280,
    height: 180,
    // quitamos 'resizeMode' de aquí
    position: "absolute",
    bottom: 0,
    left: -60,
  },
  button: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins-Regular",
  },
});