import { collection, getDocs } from "firebase/firestore";
import React, { ChangeEvent, useEffect, useState } from "react";
import { db } from "../config/firebaseConfig";
import "./home.css";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = ["Frutas", "Verduras", "Tubérculos", "Hortalizas", "Abarrotes"];


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const prodSnapshot = await getDocs(collection(db, "Productos")); // 🔹 Asegúrate de usar "Productos" (con P mayúscula)
        const prodList: Product[] = prodSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        console.log("Productos cargados:", prodList);
        setProducts(prodList);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="home">
      {/* Logo y buscador */}
      <div className="header">
        <img
          src="/logo.png"
          alt="Frescapp Logo"
          className="logo"
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Carrusel de categorías */}
      <div className="category-carousel">
        {categories.map((cat) => (
          <div key={cat} className="category-card">
            <h3>{cat}</h3>
          </div>
        ))}
      </div>

      {/* Lista de productos */}
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h4>{product.name}</h4>
              <p>${product.price}</p>
              <span className="category-tag">{product.category}</span>
            </div>
          ))
        ) : (
          <p>No hay productos que coincidan con la búsqueda.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
