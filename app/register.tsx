import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
// Asegúrate que esta ruta a tu configuración de Firebase sea correcta
import { auth, googleProvider } from "./config/firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Campos vacíos", "Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error al registrar", error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      // ADVERTENCIA: signInWithPopup es para WEB.
      // Para React Native (Expo) deberías usar 'expo-auth-session'.
      await signInWithPopup(auth, googleProvider);
      router.push("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error al iniciar con Google", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          // Asegúrate que esta ruta a tu logo sea correcta
          source={require("./assets/images/logo3.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Crea una cuenta</Text>

        <Text style={styles.label}>Correo ó teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo o teléfono"
          placeholderTextColor="#AAA"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu contraseña"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirma tu contraseña"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity style={styles.createButton} onPress={handleRegister}>
          <Text style={styles.createButtonText}>Crear</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
          <Image
            // Asegúrate que esta ruta a tu ícono de Google sea correcta
            source={require("./assets/images/google-ico.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Estilos adaptados del LoginScreen para coincidir con el Mockup de Registro
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 390,
    height: 124,
    resizeMode: "contain",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5D5D5D",
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 8,
    marginLeft: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0EF",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  createButton: {
    width: "60%",
    backgroundColor: "#FFFFFF", // Fondo blanco (como el mockup)
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#83c41a", // Borde verde (como el mockup)
  },
  createButtonText: {
    color: "#83c41a", // Texto verde (como el mockup)
    fontSize: 16,
    fontWeight: "bold",
  },
  googleButton: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  loginLink: {
    fontSize: 14,
    color: "#83c41a", // Link verde (como el mockup)
    fontWeight: "bold",
  },
});