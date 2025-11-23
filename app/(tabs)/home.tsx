import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../config/firebaseConfig";
import { useCart } from "../context/cartContext";
import OpenChatbotButton from "../../components/OpenChatbotButton"; 

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  quantity?: number;
}


const CATEGORIES = [
  { name: "Verduras", icon: require("../assets/categorias/verduras.png") },
  { name: "Frutas", icon: require("../assets/categorias/frutas.png") },
  { name: "Tubérculos", icon: require("../assets/categorias/tuberculos.png") },
  { name: "Hortalizas", icon: require("../assets/categorias/hortalizas.png") },
  { name: "Abarrotes", icon: require("../assets/categorias/abarrotes.png") },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Productos"));
        const data = snapshot.docs.map((doc) => {
          const productData = doc.data() as any;
          return {
            id: doc.id,
            name: productData.name || "Sin nombre",
            price: productData.price || 0,
            imageUrl:
              productData.imageUrl ||
              "https://via.placeholder.com/300?text=Producto",
            category: (productData.category || "sin categoria").toString(),
            stock: productData.stock || 0,
          } as Product;
        });
        setProducts(data);
      } catch (e) {
        console.log("Error al cargar productos:", e);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedProducts = CATEGORIES.map((cat) => ({
    category: cat.name,
    products: filtered.filter((p) => {
      const catName = cat.name.toLowerCase().replace(/s$/, "");
      const prodCat = (p.category || "").toLowerCase();
      return prodCat.includes(catName) || prodCat === cat.name.toLowerCase();
    }),
  }));

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}

        contentContainerStyle={{ paddingBottom: 200 }} 
      >
        {}
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/images/logo44.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>

        {}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 4 }}
            renderItem={({ item }) => (
              <View style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Image source={item.icon} style={styles.categoryImage} />
                </View>
                <Text style={styles.categoryLabel}>{item.name}</Text>
              </View>
            )}
            keyExtractor={(item) => item.name}
          />
        </View>

        {}
        <View style={styles.promoWrapper}>
          <View style={styles.promoBackground}>
            <View style={styles.promoLeftContent}>
              <Text style={styles.promoPercent}>30%</Text>
              <Text style={styles.promoSubtitle}>Descuento</Text>
              <Text style={styles.promoDate}>Hasta el 25/08</Text>
              
              <View style={styles.priceTagContainer}>
                 <View style={styles.nowBadge}>
                    <Text style={styles.nowBadgeText}>Ahora</Text>
                 </View>
                 <Text style={styles.promoPrice}>$3,724</Text>
              </View>
            </View>

            {}
            <View style={styles.promoImageContainer}>
              <Image
                source={{
                  uri: "https://www.buyfrescapp.com/wp-content/uploads/2025/11/BOG-CAT001-00005-3-300x300.png",
                }}
                style={styles.promoImage}
              />
            </View>
          </View>
          
          <Text style={styles.promoProductLabel}>
             Pimentón Maduración Mixta
          </Text>
        </View>

        {/* PRODUCTOS */}
        {groupedProducts.map(
          (group) =>
            group.products.length > 0 && (
              <View key={group.category} style={styles.productSection}>
                <Text style={styles.sectionTitle}>{group.category}</Text>

                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={group.products}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingLeft: 5, paddingBottom: 15 }}
                  renderItem={({ item }) => (
                    <ProductCard
                      item={item}
                      categoryLabel={group.category}
                      onAdd={(productWithQty) => {
                        addToCart(productWithQty);
                      }}
                    />
                  )}
                />
              </View>
            )
        )}
      </ScrollView>

      {}
      {}
      
      {}
      <View style={styles.chatbotContainer}>
        <OpenChatbotButton />
      </View>

      {}
      <TouchableOpacity style={styles.floatingCartBtn}>
        <Ionicons name="basket-outline" size={28} color="#333" />
        <View style={styles.floatingBadge}>
          <View style={styles.redDot} />
        </View>
      </TouchableOpacity>

    </View>
  );
}


function ProductCard({
  item,
  categoryLabel,
  onAdd,
}: {
  item: Product;
  categoryLabel: string;
  onAdd: (p: Product) => void;
}) {
  const [qty, setQty] = useState<number>(1);

  const increase = () => {
    if (item.stock && qty >= item.stock) return;
    setQty((q) => q + 1);
  };
  const decrease = () => {
    setQty((q) => (q > 1 ? q - 1 : 1));
  };

  return (
    <View style={styles.productCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <Text style={styles.productPrice}>$ {item.price.toLocaleString()}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productUnitLabel}>{categoryLabel} - kg</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.addToCartCircle}
          onPress={() => onAdd({ ...item, quantity: qty })}
        >
           <Ionicons name="cart-outline" size={20} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.qtyPill}>
           <TouchableOpacity onPress={decrease} style={styles.qtyBtn}>
              <Ionicons name="remove" size={16} color="#555" />
           </TouchableOpacity>
           <Text style={styles.qtyText}>{qty}</Text>
           <TouchableOpacity onPress={increase} style={styles.qtyBtn}>
              <Ionicons name="add" size={16} color="#4CAF50" />
           </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContainer: { flex: 1, paddingHorizontal: 16 },

  headerContainer: {
    marginTop: 20,
    marginBottom: 15,
    alignItems: "flex-start",
    paddingLeft: 4,
    width: '100%',
  },
  logo: { width: 140, height: 40 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    elevation: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: "#000" },

  categoriesSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 15,
    paddingLeft: 4,
  },
  categoryItem: { alignItems: "center", marginRight: 18, width: 70 },
  categoryCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
  },
  categoryImage: { width: 38, height: 38, resizeMode: "contain" },
  categoryLabel: { fontSize: 11, color: "#444", textAlign: "center", fontWeight: '500' },

  promoWrapper: {
    marginBottom: 25,
    height: 170,
    position: "relative",
    marginTop: 10,
  },
  promoBackground: {
    backgroundColor: "#FF6F00",
    borderRadius: 22,
    height: "100%",
    width: "100%",
    flexDirection: 'row',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  promoLeftContent: { width: "55%", justifyContent: 'center', zIndex: 2 },
  promoPercent: { fontSize: 38, fontWeight: "900", color: "#FFF", lineHeight: 38 },
  promoSubtitle: { fontSize: 20, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  promoDate: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginBottom: 12 },
  
  priceTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  nowBadge: {
    backgroundColor: "#FFEB3B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  nowBadgeText: { color: "#D84315", fontWeight: "800", fontSize: 10 },
  promoPrice: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  
  promoImageContainer: {
    position: 'absolute',
    right: -25,
    top: -20, 
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    height: '120%',
  },
  promoImage: { width: 200, height: 200, resizeMode: "contain" },
  promoProductLabel: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    zIndex: 3,
  },

  productSection: { marginBottom: 25 },
  productCard: {
    backgroundColor: "#FFF",
    width: 165,
    borderRadius: 18,
    padding: 12,
    marginRight: 15,
    elevation: 3,
    marginBottom: 10,
    alignItems: "center",
  },
  productImage: { width: 110, height: 110, resizeMode: "contain", marginBottom: 12 },
  productInfo: { width: '100%', paddingHorizontal: 2, marginBottom: 10 },
  productPrice: { fontSize: 17, fontWeight: "bold", color: "#222" },
  productName: { fontSize: 13, color: "#555", marginTop: 2, height: 34 },
  productUnitLabel: { fontSize: 11, color: "#999", marginTop: 4 },
  
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5
  },
  addToCartCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    height: 38,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#EEE',
    minWidth: 80,
    justifyContent: 'space-between'
  },
  qtyBtn: { padding: 5 },
  qtyText: { fontSize: 15, fontWeight: '700', color: '#333' },

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

  chatbotContainer: {
    position: "absolute",
    bottom: 185, 
    right: 20,
    zIndex: 998,
  },

  floatingBadge: { position: "absolute", top: 14, right: 14 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3D00", borderWidth: 2, borderColor: '#FFF' },
});