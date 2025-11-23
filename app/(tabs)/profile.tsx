import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// --- FIREBASE IMPORTS ---
import { signOut, getAuth } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Importamos db (Ya no usamos storage aquí para evitar el lío de la tarjeta de crédito)
import { db } from '../../src/services/firebase'; 

const auth = getAuth();

// --- INTERFACES ---
interface UserProfileData {
  nickname?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
}

interface UserAddress {
  id: string;
  name: string;      
  addressLine: string; 
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  // --- ESTADOS GLOBALES ---
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  
  // --- ESTADOS DE EDICIÓN DE PERFIL ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  
  // --- ESTADOS DE DIRECCIONES ---
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Formulario nueva dirección
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // --- ESTADOS MODAL ÉXITO ---
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // ---------------------------------------------------------
  // 1. CARGA INICIAL DE DATOS
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfileData;
          setUserData(data);
        } else {
          const initialData = {
            email: user.email,
            nickname: user.displayName || 'Invitado',
            phone: '',
            photoURL: user.photoURL || '',
          };
          await setDoc(userDocRef, initialData);
          setUserData(initialData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "No se cargó el perfil. Revisa tu conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // ---------------------------------------------------------
  // 2. LÓGICA DE FOTO (MODO BASE64 - SIN STORAGE)
  // ---------------------------------------------------------
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Necesitamos acceso a la galería para cambiar tu foto.');
        return;
      }

      // CORRECCIÓN AQUÍ: Volvemos a MediaTypeOptions.Images
      // Si te sale advertencia amarilla, IGNÓRALA, es mejor que el error rojo.
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Calidad baja para que no sature la base de datos
        base64: true, // IMPORTANTE: Pedimos la imagen como texto
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        // Construimos la cadena Base64
        const imageBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setSelectedImageUri(imageBase64);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo abrir la galería.");
    }
  };

  // ---------------------------------------------------------
  // 3. GUARDAR PERFIL
  // ---------------------------------------------------------
  const openEditModal = () => {
    setTempNickname(userData?.nickname || '');
    setTempPhone(userData?.phone || '');
    setSelectedImageUri(null);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (tempNickname.trim().length < 3) {
      Alert.alert("Validación", "El apodo es muy corto.");
      return;
    }

    setSavingProfile(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // --- CORRECCIÓN CRÍTICA DE FIREBASE ---
      // Usamos || "" al final. Si todo es null/undefined, enviamos un string vacío.
      // Esto evita el error "Unsupported field value: undefined"
      const finalPhotoURL = selectedImageUri || userData?.photoURL || "";

      await updateDoc(userDocRef, {
        nickname: tempNickname,
        phone: tempPhone,
        photoURL: finalPhotoURL,
      });

      // Actualizar estado local
      setUserData(prev => ({ 
        ...prev!, 
        nickname: tempNickname, 
        phone: tempPhone, 
        photoURL: finalPhotoURL 
      }));

      setEditModalVisible(false);
      showSuccessMessage();

    } catch (error) {
      console.error("Error guardando perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ---------------------------------------------------------
  // 4. GESTIÓN DE DIRECCIONES
  // ---------------------------------------------------------
  const fetchAddresses = async () => {
    if (!user) return;
    setAddressModalVisible(true);
    setLoadingAddresses(true);
    setShowAddAddressForm(false); 
    try {
        const addrRef = collection(db, `users/${user.uid}/addresses`);
        const snapshot = await getDocs(addrRef);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAddress));
        setUserAddresses(list);
    } catch (error) {
        console.log("Error cargando direcciones", error);
    } finally {
        setLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async () => {
    if(!newAddrName.trim() || !newAddrLine.trim()) {
      Alert.alert("Atención", "Completa ambos campos.");
      return;
    }
    setSavingAddress(true);
    try {
      const addrRef = collection(db, `users/${user.uid}/addresses`);
      const newDoc = await addDoc(addrRef, {
        name: newAddrName,
        addressLine: newAddrLine,
        createdAt: serverTimestamp()
      });

      setUserAddresses(prev => [...prev, { id: newDoc.id, name: newAddrName, addressLine: newAddrLine }]);
      setNewAddrName('');
      setNewAddrLine('');
      setShowAddAddressForm(false);
    } catch (error) {
      Alert.alert("Error", "No se guardó la dirección.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      "Eliminar",
      "¿Seguro que quieres borrar esta dirección?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar", 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, `users/${user.uid}/addresses`, id));
              setUserAddresses(prev => prev.filter(item => item.id !== id));
            } catch(e) {
              Alert.alert("Error", "No se pudo eliminar.");
            }
          }
        }
      ]
    );
  };

  // ---------------------------------------------------------
  // 5. UTILIDADES
  // ---------------------------------------------------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert("Error", "Fallo al cerrar sesión");
    }
  };

  const showSuccessMessage = () => {
    setSuccessModalVisible(true);
    setTimeout(() => setSuccessModalVisible(false), 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#83c41a" />
      </View>
    );
  }

  // ---------------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* HEADER VERDE CURVO */}
      <View style={styles.headerBackground}>
         <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
         </View>
         <View style={styles.decorativeCircle} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TARJETA PRINCIPAL */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {userData?.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, { backgroundColor: '#E1E1E1', justifyContent:'center', alignItems:'center' }]}>
                 <Ionicons name="person" size={50} color="#FFF" />
              </View>
            )}
            <TouchableOpacity style={styles.editIconBadge} onPress={openEditModal}>
               <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nicknameText}>{userData?.nickname || 'Usuario'}</Text>
          <Text style={styles.emailText}>{userData?.email}</Text>
          {userData?.phone ? <Text style={styles.phoneText}>{userData.phone}</Text> : null}
        </View>

        {/* SECCIONES DEL MENÚ */}
        <Text style={styles.sectionHeader}>Cuenta</Text>
        <View style={styles.menuSection}>
          <MenuOption 
            icon="create-outline" 
            text="Editar datos personales" 
            onPress={openEditModal} 
          />
          <MenuOption 
            icon="location-outline" 
            text="Mis direcciones" 
            onPress={fetchAddresses} 
          />
        </View>

        <Text style={styles.sectionHeader}>Soporte e Información</Text>
        <View style={styles.menuSection}>
          <MenuOption 
            icon="headset-outline" 
            text="Contáctanos" 
            onPress={() => Alert.alert("Soporte", "Escríbenos a soporte@frescapp.com")}
          />
          <MenuOption 
            icon="document-text-outline" 
            text="Términos y condiciones" 
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#555" style={{marginRight: 8}}/>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- MODAL 1: EDITAR PERFIL --- */}
      <Modal animationType="slide" visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
             <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#333" />
             </TouchableOpacity>
             <Text style={styles.modalTitleText}>Editar Perfil</Text>
          </View>

          <ScrollView contentContainerStyle={{paddingBottom: 40}}>
            <View style={styles.editAvatarSection}>
               {selectedImageUri || userData?.photoURL ? (
                 <Image source={{ uri: selectedImageUri || userData?.photoURL }} style={styles.avatarImageLarge} />
               ) : (
                 <View style={[styles.avatarImageLarge, {backgroundColor:'#EEE', justifyContent:'center', alignItems:'center'}]}>
                    <Ionicons name="person" size={60} color="#CCC" />
                 </View>
               )}
               <TouchableOpacity style={styles.changePhotoTextBtn} onPress={pickImage}>
                 <Text style={styles.changePhotoText}>Cambiar foto</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>Apodo / Nombre</Text>
               <TextInput 
                 style={styles.inputField} 
                 value={tempNickname} 
                 onChangeText={setTempNickname}
                 placeholder="Ej: Juan Perez"
               />
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>Teléfono</Text>
               <TextInput 
                 style={styles.inputField} 
                 value={tempPhone} 
                 onChangeText={setTempPhone}
                 placeholder="Ej: 300 123 4567"
                 keyboardType="phone-pad"
               />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, savingProfile && {opacity: 0.7}]} 
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar Cambios</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL 2: DIRECCIONES --- */}
      <Modal animationType="slide" visible={addressModalVisible} onRequestClose={() => setAddressModalVisible(false)}>
         <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.backBtn}>
                 <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitleText}>Mis Direcciones</Text>
            </View>
            
            {showAddAddressForm ? (
              <View style={{flex: 1, marginTop: 20}}>
                  <Text style={styles.subTitle}>Nueva Dirección</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre (Ej: Casa, Trabajo)</Text>
                    <TextInput style={styles.inputField} value={newAddrName} onChangeText={setNewAddrName} />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dirección exacta</Text>
                    <TextInput style={styles.inputField} value={newAddrLine} onChangeText={setNewAddrLine} placeholder="Calle 123 # 45 - 67"/>
                  </View>

                  <View style={{flexDirection: 'row', justifyContent:'space-between', marginTop: 20}}>
                    <TouchableOpacity onPress={() => setShowAddAddressForm(false)} style={styles.cancelBtn}>
                       <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSaveAddress} style={styles.smallSaveBtn} disabled={savingAddress}>
                       {savingAddress ? <ActivityIndicator color="#FFF" size="small"/> : <Text style={styles.smallSaveBtnText}>Guardar</Text>}
                    </TouchableOpacity>
                  </View>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.addNewAddrBtn} onPress={() => setShowAddAddressForm(true)}>
                   <Ionicons name="add" size={20} color="#83c41a" />
                   <Text style={styles.addNewAddrText}>Agregar nueva dirección</Text>
                </TouchableOpacity>

                {loadingAddresses ? (
                   <ActivityIndicator style={{marginTop: 50}} color="#83c41a" />
                ) : (
                  <FlatList 
                    data={userAddresses}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{paddingBottom: 50}}
                    ListEmptyComponent={<Text style={styles.emptyText}>No tienes direcciones guardadas.</Text>}
                    renderItem={({item}) => (
                      <View style={styles.addressItem}>
                         <View style={styles.addressIconContainer}>
                            <Ionicons name="location" size={24} color="#83c41a" />
                         </View>
                         <View style={{flex: 1, marginLeft: 15}}>
                            <Text style={styles.addrName}>{item.name}</Text>
                            <Text style={styles.addrLine}>{item.addressLine}</Text>
                         </View>
                         <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                         </TouchableOpacity>
                      </View>
                    )}
                  />
                )}
              </>
            )}
         </View>
      </Modal>

      {/* --- MODAL 3: EXITO (Toast) --- */}
      <Modal animationType="fade" transparent={true} visible={successModalVisible}>
         <View style={styles.toastOverlay}>
            <View style={styles.toastContent}>
               <Ionicons name="checkmark-circle" size={40} color="#FFF" />
               <Text style={styles.toastText}>¡Actualizado!</Text>
            </View>
         </View>
      </Modal>

    </View>
  );
}

const MenuOption = ({ icon, text, onPress }: { icon: any, text: string, onPress: any }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress}>
    <View style={styles.menuIconBox}>
      <Ionicons name={icon} size={20} color="#555" />
    </View>
    <Text style={styles.menuOptionText}>{text}</Text>
    <Ionicons name="chevron-forward" size={18} color="#CCC" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  headerBackground: {
    backgroundColor: '#83c41a',
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingHorizontal: 20,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  scrollContent: { paddingTop: 110, paddingHorizontal: 20, paddingBottom: 50 },

  // Tarjeta de Perfil
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
    marginBottom: 25,
    marginTop: 20,
    zIndex: 2
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#F5F7FA' },
  editIconBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#83c41a', 
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF'
  },
  nicknameText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emailText: { fontSize: 14, color: '#888', marginTop: 2 },
  phoneText: { fontSize: 14, color: '#666', marginTop: 4 },

  // Menús
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 10, marginLeft: 10, textTransform: 'uppercase' },
  menuSection: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 5, marginBottom: 25, overflow: 'hidden' },
  menuOption: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 15,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
  },
  menuIconBox: { width: 32, alignItems: 'center' },
  menuOptionText: { fontSize: 16, color: '#333', marginLeft: 10 },

  // Botones
  logoutButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF', paddingVertical: 15, borderRadius: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#EEE'
  },
  logoutButtonText: { color: '#555', fontWeight: '600', fontSize: 16 },

  // Modales
  modalContainer: { flex: 1, backgroundColor: '#FFF', padding: 25 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  backBtn: { padding: 5 },
  modalTitleText: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#333' },

  // Editar Perfil UI
  editAvatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarImageLarge: { width: 110, height: 110, borderRadius: 55 },
  changePhotoTextBtn: { marginTop: 10, padding: 5 },
  changePhotoText: { color: '#83c41a', fontWeight: '600', fontSize: 16 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  inputField: { 
    backgroundColor: '#F9F9F9', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, 
    fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#EEE' 
  },
  
  saveButton: { backgroundColor: '#83c41a', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: "#83c41a", shadowOpacity: 0.3, shadowOffset: {width:0, height: 4}, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  // Direcciones UI
  addNewAddrBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 10 },
  addNewAddrText: { color: '#83c41a', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  addressItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 10 },
  addressIconContainer: { backgroundColor: '#E8F5D5', padding: 8, borderRadius: 10 },
  addrName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  addrLine: { color: '#666', fontSize: 14, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  cancelBtn: { padding: 15, alignItems: 'center', flex: 1, marginRight: 10, backgroundColor: '#EEE', borderRadius: 12 },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  smallSaveBtn: { padding: 15, alignItems: 'center', flex: 1, marginLeft: 10, backgroundColor: '#83c41a', borderRadius: 12 },
  smallSaveBtnText: { color: '#FFF', fontWeight: 'bold' },

  // Toast Exito
  toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  toastContent: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 25, borderRadius: 20, alignItems: 'center' },
  toastText: { color: '#FFF', marginTop: 10, fontWeight: 'bold', fontSize: 16 }
});