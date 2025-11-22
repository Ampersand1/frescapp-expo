import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
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

// Importamos el componente que creamos arriba
// Si te marca error aquí, revisa que la ruta '../components/GoogleLoginModal' sea correcta
import GoogleLoginModal from "../src/components/GoogleLoginModal";
import { auth, googleProvider } from "./config/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para controlar la animación
  const [modalVisible, setModalVisible] = useState(false);
  const [loginStatus, setLoginStatus] = useState('loading'); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Por favor, ingresa tu correo y contraseña.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error al iniciar sesión", error.message);
    }
  };

  const handleGoogle = async () => {
    // 1. Activamos el modal en modo 'Cargando'
    setLoginStatus('loading');
    setModalVisible(true);

    try {
      // 2. Intentamos el login
      await signInWithPopup(auth, googleProvider);
      
      // 3. Si funciona, cambiamos a modo 'Éxito'
      setLoginStatus('success');

      // 4. Esperamos 1.5 segundos viendo el check verde antes de cambiar de pantalla
      setTimeout(() => {
        setModalVisible(false);
        router.push("/(tabs)/home");
      }, 1500);

    } catch (error: any) {
      setModalVisible(false);
      Alert.alert("Error", "Fallo al iniciar con Google: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Renderizamos el componente de animación aquí */}
      <GoogleLoginModal visible={modalVisible} status={loginStatus} />

      <View style={styles.container}>
        <Image
          source={require("./assets/images/logo3.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Inicia sesión</Text>

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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
          <Image
            source={require("./assets/images/google-ico.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>¿Aún no tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.signupLink}>Crea una</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    borderColor: "#E0E0E0",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  loginButton: {
    width: "60%",
    backgroundColor: "#DCDCDC",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFFEFE",
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
  signupLink: {
    fontSize: 14,
    color: "#83c41a",
    fontWeight: "bold",
  },
});