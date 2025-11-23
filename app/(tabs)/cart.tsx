import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, query } from "firebase/firestore"; 
import { db } from "../config/firebaseConfig"; 
import { useCart } from "../context/cartContext"; 

const MIN_ORDER_AMOUNT = 100000; 


interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number; 
  stock?: number;
}

export default function CartScreen() {
  const router = useRouter();
  
  const { cart, addToCart, removeFromCart, clearCart } = useCart(); 
  

  const totalPrice = useMemo(() => {
    return cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const [modalVisible, setModalVisible] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
  const [loadingUpsell, setLoadingUpsell] = useState(true);

  
  const isMinMet = totalPrice >= MIN_ORDER_AMOUNT;

  
  useEffect(() => {
    const fetchUpsellProducts = async () => {
      try {
        const q = query(collection(db, "Productos"), limit(5));
        const snapshot = await getDocs(q);
        
        const products = snapshot.docs.map(doc => {
          const data = doc.data();
          const price = data.price || 0;
          return {
            id: doc.id,
            name: data.name || "Producto",
            price: price,
            oldPrice: Math.floor(price * 1.15), 
            discount: "-15%",
            imageUrl: data.imageUrl || "https://via.placeholder.com/100",
            category: data.category || "Varios",
            stock: data.stock || 99
          };
        });
        
        const cartIds = cart.map((c: any) => c.id);
        const filtered = products.filter(p => !cartIds.includes(p.id));
        setUpsellProducts(filtered);
      } catch (error) {
        console.error("Error cargando sugeridos:", error);
      } finally {
        setLoadingUpsell(false);
      }
    };

    fetchUpsellProducts();
  }, [cart]);

  const handleIncrease = (item: any) => {
    addToCart({ ...item, quantity: 1 });
  };

  const handleDecrease = (item: any) => {
    if (item.quantity > 1) {
      addToCart({ ...item, quantity: -1 }); 
    } else {
      removeFromCart(item.id);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Tu pedido" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
               <Ionicons name="basket-outline" size={80} color="#AAA" />
            </View>
            <Text style={styles.emptyTitle}>Comienza a hacer tu pedido</Text>
            <TouchableOpacity style={styles.goToStoreBtn} onPress={() => router.push("/")}>
              <Text style={styles.goToStoreText}>Ir a comprar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.upsellSection}>
             <Text style={styles.upsellTitle}>Productos en descuento</Text>
             {loadingUpsell ? (
               <ActivityIndicator color="#83c41a" />
             ) : (
               <FlatList 
                  data={upsellProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  renderItem={({item}) => (
                    <UpsellCard item={item} onAdd={() => addToCart({...item, quantity: 1})} />
                  )}
               />
             )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- CARRITO CON PRODUCTOS ---
  return (
    <View style={styles.container}>
      <Header title="Tu pedido" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        
        {}
        {!isMinMet ? (
          <View style={styles.warningBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#F57C00" />
            <Text style={styles.warningText}>
              Mínimo de compra: ${MIN_ORDER_AMOUNT.toLocaleString()}
            </Text>
          </View>
        ) : (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#388E3C" />
            <Text style={styles.successText}>
              ¡Genial! Has alcanzado el monto mínimo.
            </Text>
          </View>
        )}

        {/* LISTA DE PRODUCTOS */}
        <View style={styles.listContainer}>
          {}
          {cart.map((item: any) => (
            <CartItemRow 
              key={item.id} 
              item={item} 
              onIncrease={() => handleIncrease(item)}
              onDecrease={() => handleDecrease(item)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.clearCartText}>Vaciar carrito</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Upsell Abajo */}
        <View style={styles.upsellSection}>
            <Text style={styles.upsellTitle}>Productos en descuento</Text>
            {loadingUpsell ? (
               <ActivityIndicator color="#83c41a" />
             ) : (
              <FlatList 
                data={upsellProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <UpsellCard item={item} onAdd={() => addToCart({...item, quantity: 1})} />
                )}
              />
            )}
        </View>
      </ScrollView>

      {}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          {}
          <Text style={styles.totalAmount}>${totalPrice.toLocaleString()}</Text>
        </View>

        <TouchableOpacity 
          disabled={!isMinMet}
          style={[styles.payButton, !isMinMet && styles.payButtonDisabled]}
          onPress={() => {
            console.log("Ir a pagar...");
          }}
        >
          <Text style={[styles.payButtonText, !isMinMet && styles.payButtonTextDisabled]}>
            {isMinMet ? "Paga" : "Paga"}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          clearCart();
          setModalVisible(false);
        }}
      />
    </View>
  );
}



const Header = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backCircle}>
      <Ionicons name="chevron-back" size={24} color="#888" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const CartItemRow = ({ item, onIncrease, onDecrease }: { item: CartItem, onIncrease: () => void, onDecrease: () => void }) => {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
      </View>

      <View style={styles.qtyContainer}>
        <TouchableOpacity 
          style={[styles.qtyBtn, item.quantity === 1 ? styles.qtyBtnRed : styles.qtyBtnGray]} 
          onPress={onDecrease}
        >
          <Ionicons 
            name={item.quantity === 1 ? "trash-outline" : "remove"} 
            size={16} 
            color={item.quantity === 1 ? "#FFF" : "#555"} 
          />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{item.quantity}</Text>

        <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnGreen]} onPress={onIncrease}>
          <Ionicons name="add" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const UpsellCard = ({ item, onAdd }: any) => (
  <View style={styles.upsellCard}>
     <View style={styles.yellowBadge}><Text style={styles.badgeText}>{item.discount}</Text></View>
     <TouchableOpacity style={styles.addFloating} onPress={onAdd}>
        <Ionicons name="add" size={18} color="#FFF" />
     </TouchableOpacity>
     <Image source={{ uri: item.imageUrl }} style={styles.upsellImage} />
     <Text style={styles.upsellPrice}>${item.price.toLocaleString()}</Text>
     {item.oldPrice && (
       <Text style={styles.upsellOldPrice}>Antes ${item.oldPrice.toLocaleString()}</Text>
     )}
     <Text style={styles.upsellName} numberOfLines={2}>{item.name}</Text>
  </View>
);

const CustomModal = ({ visible, onClose, onConfirm }: any) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeModalIcon}>
           <Ionicons name="close" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>¿Deseas vaciar el carrito?</Text>
        <Text style={styles.modalSubtitle}>Si vacías el carrito perderás la compra que llevas.</Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm}>
            <Text style={styles.btnConfirmText}>Sí, vaciar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
  },
  backCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  warningBanner: { backgroundColor: '#FFE082', padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  warningText: { color: '#E65100', marginLeft: 8, fontSize: 12 },
  successBanner: { backgroundColor: '#B9F6CA', padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  successText: { color: '#1B5E20', marginLeft: 8, fontSize: 12 },
  listContainer: { padding: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 15 },
  itemImage: { width: 60, height: 60, resizeMode: 'contain', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: '#333', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 20, padding: 2 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyBtnRed: { backgroundColor: '#D32F2F' },
  qtyBtnGreen: { backgroundColor: '#00E600' },
  qtyBtnGray: { backgroundColor: '#DDD' },
  qtyText: { marginHorizontal: 10, fontWeight: 'bold', fontSize: 14 },
  clearCartText: { textAlign: 'center', color: '#D32F2F', fontSize: 12, fontWeight: '600', marginBottom: 20 },
  divider: { height: 8, backgroundColor: '#FAFAFA' },
  emptyStateContainer: { alignItems: 'center', marginTop: 50, marginBottom: 50 },
  emptyIconContainer: { marginBottom: 20 },
  emptyTitle: { fontSize: 16, color: '#888', marginBottom: 20 },
  goToStoreBtn: { backgroundColor: '#00E600', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  goToStoreText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  upsellSection: { padding: 20 },
  upsellTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  upsellCard: { width: 140, backgroundColor: '#FFF', borderRadius: 15, padding: 10, marginRight: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: {width: 0, height: 2}, marginBottom: 10, position: 'relative' },
  yellowBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FFF100', borderRadius: 4, paddingHorizontal: 4, zIndex: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  addFloating: { position: 'absolute', top: -8, right: -8, backgroundColor: '#00E600', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderWidth: 2, borderColor: '#FFF' },
  upsellImage: { width: 80, height: 80, resizeMode: 'contain', alignSelf: 'center', marginVertical: 10 },
  upsellPrice: { fontSize: 14, fontWeight: 'bold' },
  upsellOldPrice: { fontSize: 10, color: '#999', textDecorationLine: 'line-through' },
  upsellName: { fontSize: 12, color: '#555', height: 32 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 16, color: '#555' },
  totalAmount: { fontSize: 20, fontWeight: 'bold' },
  payButton: { backgroundColor: '#00E600', paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
  payButtonDisabled: { backgroundColor: '#E0E0E0' },
  payButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  payButtonTextDisabled: { color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '80%', borderRadius: 20, padding: 25, alignItems: 'center', position: 'relative' },
  closeModalIcon: { position: 'absolute', top: 15, right: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btnConfirm: { flex: 1, borderWidth: 1, borderColor: '#D32F2F', borderRadius: 20, paddingVertical: 10, marginRight: 10, alignItems: 'center' },
  btnConfirmText: { color: '#D32F2F', fontWeight: 'bold' },
  btnCancel: { flex: 1, backgroundColor: '#BBB', borderRadius: 20, paddingVertical: 10, marginLeft: 10, alignItems: 'center' },
  btnCancelText: { color: '#FFF', fontWeight: 'bold' },
});