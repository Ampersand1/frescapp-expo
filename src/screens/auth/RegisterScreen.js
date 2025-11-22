import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { auth, db } from '../../services/firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Campos vacíos', 'Por favor completa todos los campos');
      return;
    }

    try {

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, { displayName: name });
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        avatarUrl: null,
        createdAt: serverTimestamp()
      });

      await signOut(auth);

      Alert.alert(
        "¡Registro Exitoso!",
        "Tu cuenta ha sido creada correctamente. Por favor, inicia sesión con tus nuevas credenciales.",
        [
          { 
            text: "Ir al Login", 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );

    } catch (e) {
      let msg = e.message;
      if(e.code === 'auth/email-already-in-use') msg = "El correo ya está registrado.";
      if(e.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
      if(e.code === 'auth/invalid-email') msg = "El formato del correo no es válido.";
      
      Alert.alert("Error al registrar", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una cuenta</Text>
      
      <TextInput 
        placeholder="Nombre" 
        style={styles.input} 
        value={name} 
        onChangeText={setName}
      />
      
      <TextInput 
        placeholder="Correo" 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />
      
      <TextInput 
        placeholder="Contraseña" 
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
      />
      
      <Button title="Crear Cuenta" onPress={handleRegister} />
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{marginTop:12}}>
        <Text style={{textAlign: 'center', color: 'blue'}}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 12 }
});