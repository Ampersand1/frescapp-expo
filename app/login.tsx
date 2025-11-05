import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, googleProvider } from "./config/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔑 Inicio de sesión con correo y contraseña
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/(tabs)/home"); // Ruta después del login exitoso
    } catch (error: any) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  // 🔐 Inicio de sesión con Google (Firebase)
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/(tabs)/home");
    } catch (error: any) {
      alert("Error al iniciar con Google: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicia sesión</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
        <Text style={styles.googleText}>Continuar con Google</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿No tienes cuenta?{" "}
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={{ color: "#2196F3", textAlign: "center" }}>Regístrate</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 8,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loginButton: {
    backgroundColor: "#83c41a",
    borderRadius: 25,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  loginButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleText: { fontSize: 16 },
  footer: { marginTop: 20, color: "#666" },
});
