import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../services/firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) return alert('Completa todos los campos');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        avatarUrl: null,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una cuenta</Text>
      <TextInput placeholder="Nombre" style={styles.input} value={name} onChangeText={setName}/>
      <TextInput placeholder="Correo" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Contraseña" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry/>
      <Button title="Crear" onPress={handleRegister} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{marginTop:12}}>
        <Text>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, padding:20, justifyContent:'center'},
  title:{fontSize:22, marginBottom:20, textAlign:'center'},
  input:{borderWidth:1, borderColor:'#ddd', padding:10, borderRadius:8, marginBottom:12}
});
