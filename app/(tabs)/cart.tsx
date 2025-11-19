import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../context/cartContext";

export default function CartScreen() {
  const { cart, addToCart, removeFromCart, clearCart, total } = useCart();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
          Tu pedido
        </Text>

        {cart.length === 0 ? (
          <Text style={{ fontSize: 16, marginTop: 20 }}>
            Tu carrito está vacío.
          </Text>
        ) : (
          cart.map((item) => (
            <View
              key={item.id}
              style={{ marginBottom: 20, flexDirection: "row" }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
              />

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ color: "#83c41a" }}>
                  ${item.price.toLocaleString()}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Text style={{ fontSize: 25, color: "red" }}>−</Text>
                  </TouchableOpacity>

                  <Text style={{ marginHorizontal: 10 }}>{item.quantity}</Text>

                  <TouchableOpacity onPress={() => addToCart(item)}>
                    <Text style={{ fontSize: 25, color: "#83c41a" }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {cart.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={{ marginTop: 10 }}>
            <Text style={{ color: "red", textAlign: "center" }}>
              Vaciar carrito
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ fontSize: 20, marginTop: 20 }}>
          Total:{" "}
          <Text style={{ fontWeight: "bold" }}>
            ${total.toLocaleString()}
          </Text>
        </Text>
      </ScrollView>

      {/* --- BOTÓN FIJO "Pagar" ABAJO --- */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: "#83c41a",
            padding: 18,
            margin: 15,
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={() => router.push("/checkout")}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Pagar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
