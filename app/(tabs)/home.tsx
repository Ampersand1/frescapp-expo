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
} from "react-native";
import { db } from "../config/firebaseConfig";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

// Coinciden con tus categorías REALES en Firestore
const CATEGORIES = [
  { name: "Fruta", icon: require("../assets/categorias/frutas.png") },
  { name: "Verdura", icon: require("../assets/categorias/verduras.png") },
  { name: "Tubérculo", icon: require("../assets/categorias/tuberculos.png") },
  { name: "Hortaliza", icon: require("../assets/categorias/hortalizas.png") },
  { name: "Abarrote", icon: require("../assets/categorias/abarrotes.png") },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Productos"));
        const data = snapshot.docs.map((doc) => {
          const productData = doc.data();
          return {
            id: doc.id,         // 🔥 SOLO SE DEFINE AQUÍ
            name: productData.name,
            price: productData.price,
            imageUrl: productData.imageUrl,
            category: productData.category,
            stock: productData.stock,
          } as Product;
        });

        setProducts(data);
      } catch (e) {
        console.log("❌ Error al cargar productos:", e);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupa productos por categoría REAL de Firestore
  const groupedProducts = CATEGORIES.map((cat) => ({
    category: cat.name,
    products: filtered.filter(
      (p) => p.category.toLowerCase() === cat.name.toLowerCase()
    ),
  }));

  return (
    <ScrollView style={styles.container}>
      {/* LOGO */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Buscar"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* CATEGORÍAS */}
      <Text style={styles.sectionTitle}>Categorias</Text>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Image source={item.icon} style={styles.categoryImage} />
            <Text style={styles.categoryLabel}>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.name}
      />

      {/* PRODUCTOS */}
      {groupedProducts.map(
        (group) =>
          group.products.length > 0 && (
            <View key={group.category} style={styles.section}>
              <Text style={styles.sectionTitle}>{group.category}</Text>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={group.products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.productImage}
                    />
                    <Text style={styles.productPrice}>${item.price}</Text>
                    <Text style={styles.productName}>{item.name}</Text>

                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 180,
    height: 50,
  },
  searchBox: {
    backgroundColor: "#FFF",
    elevation: 3,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchInput: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 18,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryLabel: {
    marginTop: 5,
    fontSize: 12,
  },
  section: {
    marginTop: 10,
  },
  productCard: {
    backgroundColor: "#FFF",
    width: 160,
    borderRadius: 15,
    padding: 10,
    marginRight: 15,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    resizeMode: "contain",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  productName: {
    color: "#666",
    fontSize: 13,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#83c41a",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
