// app/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("./assets/images/logo.png")} style={styles.logo} />
      <Text style={styles.welcome}>¡Bienvenido!</Text>
      <Text style={styles.description}>
        En Frescapp, somos tu plaza online, ¡permítenos ir a la plaza por ti!
      </Text>
      <Image
        source={require("./assets/images/fruits.png")}
        style={styles.fruits}
      />
      <TouchableOpacity style={styles.button} onPress={() => router.push("/register")}>
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
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 160,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcome: {
    fontSize: 32,
    color: "#fff",
    fontFamily: "Cursive",
    marginBottom: 10,
  },
  description: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  fruits: {
    width: 180,
    height: 100,
    resizeMode: "contain",
    position: "absolute",
    bottom: 80,
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
