import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../context/cartContext";

export default function CheckoutScreen() {
  const { cartItems, total } = useCart();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Resumen del pedido</Text>

        {cartItems.length === 0 ? (
          <Text style={styles.empty}>Tu carrito está vacío.</Text>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
              </View>

              <Text style={styles.qty}>x {item.quantity}</Text>
            </View>
          ))
        )}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total.toLocaleString()}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Envío</Text>
          <Text style={styles.summaryValue}>$0</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
        </View>
      </ScrollView>

      {/* BOTÓN FINAL */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={() => alert("La funcionalidad de pago estará disponible pronto.")}
      >
        <Text style={styles.payButtonText}>Confirmar pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  item: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    color: "#83c41a",
    marginTop: 3,
    fontWeight: "bold",
  },
  qty: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  summaryText: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 10,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#83c41a",
  },
  payButton: {
    backgroundColor: "#83c41a",
    paddingVertical: 16,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  empty: {
    fontSize: 16,
    color: "#777",
    marginVertical: 20,
  },
});
