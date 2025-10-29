import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Button, Image, Text, TextInput, View } from 'react-native';
import { auth, db, storage } from '../services/firebase';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');

  useEffect(()=> {
    const load = async () => {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, 'users', uid);
      const d = await getDoc(docRef);
      if (d.exists()) {
        setUserData(d.data());
        setName(d.data().name || '');
      }
    };
    load();
  }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return alert('Permisos denegados');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `avatars/${auth.currentUser.uid}.jpg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db,'users',auth.currentUser.uid), { avatarUrl: url });
    setUserData(prev => ({ ...prev, avatarUrl: url }));
    alert('Avatar actualizado');
  };

  const handleSaveName = async () => {
    await updateDoc(doc(db,'users',auth.currentUser.uid), { name });
    alert('Nombre actualizado');
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View style={{flex:1, padding:16}}>
      {userData?.avatarUrl ? <Image source={{uri:userData.avatarUrl}} style={{width:120,height:120,borderRadius:60}} /> : <View style={{width:120,height:120,borderRadius:60,backgroundColor:'#eee'}}/>}
      <Button title="Cambiar foto" onPress={pickImage} />
      <Text>Nombre</Text>
      <TextInput value={name} onChangeText={setName} style={{borderWidth:1,borderColor:'#ddd',padding:8,borderRadius:8,marginBottom:8}} />
      <Button title="Guardar nombre" onPress={handleSaveName} />
      <View style={{height:20}} />
      <Button title="Cerrar sesión" onPress={handleLogout} color="#ff4444" />
    </View>
  );
}
