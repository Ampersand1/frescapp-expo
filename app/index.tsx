import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Image
          source={require("./assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.welcome}>¡Bienvenido!</Text>
        <Text style={styles.description}>
          En Frescapp, somos tu plaza online, ¡permítenos ir a la plaza por ti!
        </Text>
      </View>

      <Image
        source={require("./assets/images/fruits.png")}
        style={styles.fruits}
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
    resizeMode: "contain",
    marginBottom: 25,
  },
  welcome: {
    fontSize: 42,
    color: "#fff",
    fontFamily: "Cursive",
    marginBottom: 20,
  },
  description: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    maxWidth: "85%",
    lineHeight: 26,
  },
  fruits: {
    width: 280,
    height: 180,
    resizeMode: "contain",
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
  },
});