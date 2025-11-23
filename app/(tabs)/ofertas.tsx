import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "../config/firebaseConfig"; 
import { useCart } from "../context/cartContext";

// Interfaz del Producto
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  oldPrice?: number;
  discountTag?: string;
  quantity?: number; 
}

// Categorías
const CATEGORIES = [
  { name: "Verduras", icon: require("../assets/categorias/verduras.png") },
  { name: "Frutas", icon: require("../assets/categorias/frutas.png") },
  { name: "Tubérculos", icon: require("../assets/categorias/tuberculos.png") },
  { name: "Hortalizas", icon: require("../assets/categorias/hortalizas.png") },
  { name: "Abarrotes", icon: require("../assets/categorias/abarrotes.png") },
];

export default function OfertasScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [topOffers, setTopOffers] = useState<Product[]>([]);
  const [superDiscounts, setSuperDiscounts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Productos"));
        const productsData: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          const currentPrice = data.price || 0;
          // Simulación de descuentos
          const randomDiscount = Math.floor(Math.random() * (40 - 10 + 1)) + 10; 
          const calculatedOldPrice = Math.floor(currentPrice * (1 + randomDiscount / 100));

          return {
            id: doc.id,
            name: data.name || "Producto sin nombre",
            price: currentPrice,
            imageUrl: data.imageUrl || "https://via.placeholder.com/150",
            category: data.category || "Varios",
            stock: data.stock || 0,
            oldPrice: calculatedOldPrice,
            discountTag: `-${randomDiscount}%`,
          };
        });

        const shuffled = productsData.sort(() => 0.5 - Math.random());
        setTopOffers(shuffled.slice(0, 5)); 
        setSuperDiscounts(shuffled.slice(5, 15)); 
        
      } catch (e) {
        console.error("Error cargando ofertas:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#83c41a" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ofertas</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }} 
      >
        
        {}
        <View style={styles.carouselSection}>
          <FlatList
            data={topOffers}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, paddingTop: 15 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TopOfferItem item={item} addToCart={addToCart} />
            )}
          />
        </View>

        {}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Busca por categoria</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20 }}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.catItem}>
                <View style={styles.catCircle}>
                  <Image source={item.icon} style={styles.catImage} />
                </View>
                <Text style={styles.catText}>{item.name}</Text>
              </View>
            )}
          />
        </View>

        {}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Super descuentos</Text>
          
          {superDiscounts.map((item) => (
             <SuperDiscountItem key={item.id} item={item} addToCart={addToCart} />
          ))}
        </View>

      </ScrollView>

      {}
      {}
      <TouchableOpacity style={styles.floatingCartBtn}>
        <Ionicons name="basket-outline" size={26} color="#333" />
        <View style={styles.floatingBadge}>
          <View style={styles.redDot} />
        </View>
      </TouchableOpacity>
      
    </View>
  );
}



const TopOfferItem = ({ item, addToCart }: { item: Product, addToCart: any }) => {
  return (
    <View style={styles.offerCard}>
      <View style={styles.yellowBadge}>
        <Text style={styles.yellowBadgeText}>{item.discountTag}</Text>
      </View>

      <TouchableOpacity 
        style={styles.addBtnFloating}
        onPress={() => addToCart({ ...item, quantity: 1 })}
      >
        <Ionicons name="add" size={20} color="#FFF" />
      </TouchableOpacity>

      <Image source={{ uri: item.imageUrl }} style={styles.offerImage} />
      
      <Text style={styles.priceText}>${item.price.toLocaleString()}</Text>
      {item.oldPrice && (
        <Text style={styles.oldPriceText}>Antes ${item.oldPrice.toLocaleString()}</Text>
      )}
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.categoryText}>{item.category}</Text>
    </View>
  );
};

const SuperDiscountItem = ({ item, addToCart }: { item: Product, addToCart: any }) => {
  const [qty, setQty] = useState(1);

  const increase = () => setQty(q => q + 1);
  const decrease = () => setQty(q => (q > 1 ? q - 1 : 1));

  return (
    <View style={styles.superCard}>
      {}
      <View style={styles.floatingControl}>
        <TouchableOpacity style={styles.ctrlBtnRed} onPress={decrease}>
           <Ionicons name={qty === 1 ? "trash-outline" : "remove"} size={14} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.ctrlText}>{qty}</Text>
        <TouchableOpacity 
          style={styles.ctrlBtnGreen} 
          onPress={() => {
            increase();
            addToCart({ ...item, quantity: 1 });
          }}
        >
           <Ionicons name="add" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.superImage} />

      <View style={styles.superInfo}>
        <Text style={styles.superName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.priceRow}>
          <View style={styles.yellowBadgeSmall}>
            <Text style={styles.yellowBadgeTextSmall}>{item.discountTag}</Text>
          </View>
          {item.oldPrice && (
            <Text style={styles.superOldPrice}>${item.oldPrice.toLocaleString()}</Text>
          )}
        </View>

        <View style={styles.yellowPricePill}>
          <Text style={styles.yellowPriceText}>${item.price.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
  },
  backButton: { marginRight: 15 },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#AAA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

  
  carouselSection: {
    marginTop: 5,
    marginBottom: 20,
  },
  offerCard: {
    width: 150,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
    marginTop: 5, 
    overflow: 'visible', 
  },
  yellowBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFF100',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    zIndex: 10,
  },
  yellowBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  
  addBtnFloating: {
    position: 'absolute',
    top: -10, 
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00E600',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99, 
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
  },

  offerImage: {
    width: '100%',
    height: 90,
    resizeMode: 'contain',
    marginTop: 15,
    marginBottom: 8,
  },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  oldPriceText: { 
    fontSize: 11, 
    color: '#999', 
    textDecorationLine: 'line-through',
    marginBottom: 4 
  },
  productName: { fontSize: 12, color: '#333', marginBottom: 2, height: 32 },
  categoryText: { fontSize: 11, color: '#AAA' },

  
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  catItem: { alignItems: 'center', marginRight: 20 },
  catCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  catImage: { width: 35, height: 35, resizeMode: 'contain' },
  catText: { fontSize: 11, color: '#555' },

  
  superCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20, 
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    marginTop: 10,
  },
  
  floatingControl: {
    position: 'absolute',
    top: -12, 
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 4, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    zIndex: 50,
  },
  ctrlBtnRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D32F2F', 
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  ctrlBtnGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00E600', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  ctrlText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    color: '#333',
  },

  superImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 15,
  },
  superInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  superName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    paddingRight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  yellowBadgeSmall: {
    backgroundColor: '#FFF100',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  yellowBadgeTextSmall: { fontSize: 10, fontWeight: 'bold' },
  superOldPrice: {
    fontSize: 12,
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  yellowPricePill: {
    backgroundColor: '#FFF100',
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  yellowPriceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },


  floatingCartBtn: {
    position: "absolute",
    bottom: 110, 
    right: 20,
    backgroundColor: "#FFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 999,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  floatingBadge: { position: "absolute", top: 14, right: 14 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3D00", borderWidth: 2, borderColor: '#FFF' },
});