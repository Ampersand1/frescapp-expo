// app/register.tsx
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, googleProvider } from "./config/firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    if (password !== confirm) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/(tabs)/home");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/(tabs)/home");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una cuenta</Text>

      <TextInput
        placeholder="Correo o teléfono"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirmar contraseña"
        style={styles.input}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleRegister}>
        <Text style={styles.createButtonText}>Crear</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
        <Text style={styles.googleText}>Continuar con Google</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿Ya tienes cuenta? <Text style={{ color: "#83c41a" }}><TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={{ color: "#2196F3", textAlign: "center", marginTop: 20 }}>
            Inicia sesión
          </Text>
        </TouchableOpacity>
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
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
  createButton: {
    backgroundColor: "#83c41a",
    borderRadius: 25,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  createButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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
